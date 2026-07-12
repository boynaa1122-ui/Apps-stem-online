import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { protectedProcedure, publicProcedure, router } from "./_core/trpc";
import * as db from "./db";
import { storagePut } from "./storage";

const adminProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (ctx.user.role !== "admin") throw new TRPCError({ code: "FORBIDDEN", message: "Admin only" });
  return next({ ctx });
});

export const appRouter = router({
  system: systemRouter,

  auth: router({
    me: publicProcedure.query(async (opts) => {
      if (!opts.ctx.user) return null;
      const user = await db.getUserById(opts.ctx.user.id);
      return user ?? null;
    }),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),

  categories: router({
    list: publicProcedure.query(() => db.getCategories()),
  }),

  products: router({
    list: publicProcedure
      .input(z.object({ categoryId: z.number().optional() }).optional())
      .query(({ input }) => db.getProducts(input?.categoryId)),

    get: publicProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        const product = await db.getProductById(input.id);
        if (!product) throw new TRPCError({ code: "NOT_FOUND" });
        const stockCount = await db.getStockCount(input.id);
        return { ...product, stockCount };
      }),

    stockCount: publicProcedure
      .input(z.object({ productId: z.number() }))
      .query(({ input }) => db.getStockCount(input.productId)),

    listWithStock: publicProcedure.query(async () => {
      const prods = await db.getProducts();
      const cats = await db.getCategories();
      const withStock = await Promise.all(
        prods.map(async (p) => ({
          ...p,
          stockCount: await db.getStockCount(p.id),
          category: cats.find((c) => c.id === p.categoryId),
        }))
      );
      return withStock;
    }),
  }),

  flashSales: router({
    active: publicProcedure.query(async () => {
      const sales = await db.getActiveFlashSales();
      const result = await Promise.all(
        sales.map(async (fs) => {
          const product = await db.getProductById(fs.productId);
          const stockCount = await db.getStockCount(fs.productId);
          return { ...fs, product, stockCount };
        })
      );
      return result.filter((r) => r.product);
    }),
  }),

  announcements: router({
    list: publicProcedure
      .input(z.object({ limit: z.number().optional() }).optional())
      .query(({ input }) => db.getAnnouncements(input?.limit ?? 10)),

    get: publicProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        await db.incrementAnnouncementViews(input.id);
        return db.getAnnouncementById(input.id);
      }),

    like: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(({ input }) => db.likeAnnouncement(input.id)),
  }),

  banners: router({
    list: publicProcedure.query(() => db.getActiveBanners()),
  }),

  stats: router({
    shop: publicProcedure.query(() => db.getShopStats()),
    recentOrders: publicProcedure
      .input(z.object({ limit: z.number().optional() }).optional())
      .query(({ input }) => db.getRecentOrders(input?.limit ?? 20)),
  }),

  orders: router({
    myOrders: protectedProcedure.query(({ ctx }) => db.getOrdersByUser(ctx.user.id)),

    get: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ ctx, input }) => {
        const order = await db.getOrderById(input.id);
        if (!order) throw new TRPCError({ code: "NOT_FOUND" });
        if (order.userId !== ctx.user.id && ctx.user.role !== "admin")
          throw new TRPCError({ code: "FORBIDDEN" });
        return order;
      }),

    buy: protectedProcedure
      .input(z.object({ productId: z.number() }))
      .mutation(async ({ ctx, input }) => {
        const user = await db.getUserById(ctx.user.id);
        if (!user) throw new TRPCError({ code: "UNAUTHORIZED" });

        const product = await db.getProductById(input.productId);
        if (!product || !product.isActive)
          throw new TRPCError({ code: "NOT_FOUND", message: "ไม่พบสินค้า" });

        // Check flash sale price
        const flashSales = await db.getActiveFlashSales();
        const activeSale = flashSales.find((fs) => fs.productId === input.productId);
        const price = activeSale ? Number(activeSale.salePrice) : Number(product.price);

        if (Number(user.balance) < price)
          throw new TRPCError({ code: "BAD_REQUEST", message: "ยอดเงินไม่เพียงพอ" });

        const stock = await db.getAvailableStock(input.productId);
        if (!stock)
          throw new TRPCError({ code: "BAD_REQUEST", message: "สินค้าหมดสต็อก" });

        // Create order
        const orderId = await db.createOrder({
          userId: ctx.user.id,
          productId: input.productId,
          stockId: stock.id,
          productName: product.name,
          productImage: product.imageUrl ?? null,
          amount: String(price),
          status: "completed",
          accountDelivered: stock.accountData,
        });

        // Mark stock sold
        await db.markStockSold(stock.id, orderId);

        // Deduct balance
        await db.updateUserBalance(ctx.user.id, -price);

        // Increment sold count
        await db.upsertProduct({ ...product, id: product.id, soldCount: product.soldCount + 1 });

        return { orderId, accountDelivered: stock.accountData };
      }),
  }),

  topup: router({
    myTopups: protectedProcedure.query(({ ctx }) => db.getTopupsByUser(ctx.user.id)),

    submit: protectedProcedure
      .input(
        z.object({
          amount: z.number().min(1),
          slipBase64: z.string().optional(),
          slipMimeType: z.string().optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        let slipUrl: string | undefined;
        if (input.slipBase64 && input.slipMimeType) {
          const buffer = Buffer.from(input.slipBase64, "base64");
          const ext = input.slipMimeType.split("/")[1] ?? "jpg";
          const key = `slips/${ctx.user.id}_${Date.now()}.${ext}`;
          const result = await storagePut(key, buffer, input.slipMimeType);
          slipUrl = result.url;
        }
        const id = await db.createTopup({
          userId: ctx.user.id,
          amount: String(input.amount),
          slipUrl: slipUrl ?? null,
          status: "pending",
        });
        return { id };
      }),
  }),

  admin: router({
    // Stats
    stats: adminProcedure.query(() => db.getShopStats()),
    allOrders: adminProcedure.query(() => db.getAllOrders()),
    allUsers: adminProcedure.query(() => db.getAllUsers()),
    allTopups: adminProcedure.query(() => db.getAllTopups()),
    pendingTopups: adminProcedure.query(() => db.getPendingTopups()),

    // Topup management
    approveTopup: adminProcedure
      .input(z.object({ id: z.number(), note: z.string().optional() }))
      .mutation(async ({ ctx, input }) => {
        const topup = await db.getAllTopups().then((ts) => ts.find((t) => t.id === input.id));
        if (!topup) throw new TRPCError({ code: "NOT_FOUND" });
        if (topup.status !== "pending")
          throw new TRPCError({ code: "BAD_REQUEST", message: "รายการนี้ถูกดำเนินการแล้ว" });
        await db.updateTopup(input.id, {
          status: "approved",
          approvedBy: ctx.user.id,
          approvedAt: new Date(),
          note: input.note,
        });
        await db.updateUserBalance(topup.userId, Number(topup.amount));
        return { success: true };
      }),

    rejectTopup: adminProcedure
      .input(z.object({ id: z.number(), note: z.string().optional() }))
      .mutation(async ({ input }) => {
        const topup = await db.getAllTopups().then((ts) => ts.find((t) => t.id === input.id));
        if (!topup) throw new TRPCError({ code: "NOT_FOUND" });
        await db.updateTopup(input.id, { status: "rejected", note: input.note });
        return { success: true };
      }),

    // Product management
    allProducts: adminProcedure.query(() => db.getAllProducts()),

    upsertProduct: adminProcedure
      .input(
        z.object({
          id: z.number().optional(),
          categoryId: z.number(),
          name: z.string().min(1),
          description: z.string().optional(),
          price: z.string(),
          originalPrice: z.string().optional(),
          imageUrl: z.string().optional(),
          isActive: z.boolean().optional(),
          sortOrder: z.number().optional(),
        })
      )
      .mutation(({ input }) => db.upsertProduct(input as Parameters<typeof db.upsertProduct>[0])),

    deleteProduct: adminProcedure
      .input(z.object({ id: z.number() }))
      .mutation(({ input }) => db.deleteProduct(input.id)),

    // Stock management
    getStock: adminProcedure
      .input(z.object({ productId: z.number() }))
      .query(({ input }) => db.getStockByProduct(input.productId)),

    addStock: adminProcedure
      .input(z.object({ productId: z.number(), items: z.array(z.string().min(1)) }))
      .mutation(({ input }) => db.addStockBulk(input.productId, input.items)),

    // Announcement management
    allAnnouncements: adminProcedure.query(() => db.getAllAnnouncements()),

    upsertAnnouncement: adminProcedure
      .input(
        z.object({
          id: z.number().optional(),
          title: z.string().min(1),
          content: z.string().min(1),
          type: z.enum(["news", "promotion", "maintenance", "update"]),
          imageUrl: z.string().optional(),
          isActive: z.boolean().optional(),
        })
      )
      .mutation(({ input }) => db.upsertAnnouncement(input)),

    // Flash sale management
    allFlashSales: adminProcedure.query(() => db.getAllFlashSales()),

    upsertFlashSale: adminProcedure
      .input(
        z.object({
          id: z.number().optional(),
          productId: z.number(),
          salePrice: z.string(),
          endAt: z.string(),
          isActive: z.boolean().optional(),
        })
      )
      .mutation(({ input }) =>
        db.upsertFlashSale({ ...input, endAt: new Date(input.endAt) })
      ),

    // Category management
    upsertCategory: adminProcedure
      .input(
        z.object({
          id: z.number().optional(),
          name: z.string().min(1),
          slug: z.string().min(1),
          icon: z.string().optional(),
          sortOrder: z.number().optional(),
        })
      )
      .mutation(({ input }) => db.upsertCategory(input)),

    // Banner management
    allBanners: adminProcedure.query(() => db.getActiveBanners()),

    upsertBanner: adminProcedure
      .input(
        z.object({
          id: z.number().optional(),
          imageUrl: z.string().min(1),
          linkUrl: z.string().optional(),
          title: z.string().optional(),
          sortOrder: z.number().optional(),
          isActive: z.boolean().optional(),
        })
      )
      .mutation(({ input }) => db.upsertBanner(input)),

    deleteBanner: adminProcedure
      .input(z.object({ id: z.number() }))
      .mutation(({ input }) => db.deleteBanner(input.id)),
  }),
});

export type AppRouter = typeof appRouter;
