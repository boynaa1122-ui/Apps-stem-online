import { and, desc, eq, gt, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import {
  Announcement,
  Banner,
  Category,
  FlashSale,
  InsertOrder,
  InsertProduct,
  InsertTopup,
  InsertUser,
  Order,
  Product,
  ProductStock,
  Topup,
  User,
  announcements,
  banners,
  categories,
  flashSales,
  orders,
  productStock,
  products,
  topups,
  users,
} from "../drizzle/schema";
import { ENV } from "./_core/env";

let _db: ReturnType<typeof drizzle> | null = null;

export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

// ─── Users ───────────────────────────────────────────────────────────────────

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) throw new Error("User openId is required for upsert");
  const db = await getDb();
  if (!db) return;

  const values: InsertUser = { openId: user.openId };
  const updateSet: Record<string, unknown> = {};

  const textFields = ["name", "email", "loginMethod"] as const;
  for (const field of textFields) {
    const value = user[field];
    if (value === undefined) continue;
    const normalized = value ?? null;
    values[field] = normalized;
    updateSet[field] = normalized;
  }

  if (user.lastSignedIn !== undefined) {
    values.lastSignedIn = user.lastSignedIn;
    updateSet.lastSignedIn = user.lastSignedIn;
  }
  if (user.role !== undefined) {
    values.role = user.role;
    updateSet.role = user.role;
  } else if (user.openId === ENV.ownerOpenId) {
    values.role = "admin";
    updateSet.role = "admin";
  }
  if (!values.lastSignedIn) values.lastSignedIn = new Date();
  if (Object.keys(updateSet).length === 0) updateSet.lastSignedIn = new Date();

  await db.insert(users).values(values).onDuplicateKeyUpdate({ set: updateSet });
}

export async function getUserByOpenId(openId: string): Promise<User | undefined> {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return result[0];
}

export async function getUserById(id: number): Promise<User | undefined> {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
  return result[0];
}

export async function updateUserBalance(userId: number, delta: number): Promise<void> {
  const db = await getDb();
  if (!db) return;
  await db
    .update(users)
    .set({ balance: sql`balance + ${delta}` })
    .where(eq(users.id, userId));
}

export async function getAllUsers(): Promise<User[]> {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(users).orderBy(desc(users.createdAt));
}

// ─── Categories ──────────────────────────────────────────────────────────────

export async function getCategories(): Promise<Category[]> {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(categories).orderBy(categories.sortOrder);
}

export async function upsertCategory(data: {
  id?: number;
  name: string;
  slug: string;
  icon?: string;
  sortOrder?: number;
}): Promise<void> {
  const db = await getDb();
  if (!db) return;
  if (data.id) {
    await db.update(categories).set(data).where(eq(categories.id, data.id));
  } else {
    await db.insert(categories).values(data);
  }
}

// ─── Products ────────────────────────────────────────────────────────────────

export async function getProducts(categoryId?: number): Promise<Product[]> {
  const db = await getDb();
  if (!db) return [];
  const conditions = [eq(products.isActive, true)];
  if (categoryId) conditions.push(eq(products.categoryId, categoryId));
  return db
    .select()
    .from(products)
    .where(and(...conditions))
    .orderBy(products.sortOrder, desc(products.createdAt));
}

export async function getAllProducts(): Promise<Product[]> {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(products).orderBy(desc(products.createdAt));
}

export async function getProductById(id: number): Promise<Product | undefined> {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(products).where(eq(products.id, id)).limit(1);
  return result[0];
}

export async function upsertProduct(data: InsertProduct & { id?: number }): Promise<number> {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  if (data.id) {
    await db.update(products).set(data).where(eq(products.id, data.id));
    return data.id;
  } else {
    const result = await db.insert(products).values(data);
    return (result[0] as { insertId: number }).insertId;
  }
}

export async function deleteProduct(id: number): Promise<void> {
  const db = await getDb();
  if (!db) return;
  await db.update(products).set({ isActive: false }).where(eq(products.id, id));
}

// ─── Stock ───────────────────────────────────────────────────────────────────

export async function getStockCount(productId: number): Promise<number> {
  const db = await getDb();
  if (!db) return 0;
  const result = await db
    .select({ count: sql<number>`count(*)` })
    .from(productStock)
    .where(and(eq(productStock.productId, productId), eq(productStock.isSold, false)));
  return Number(result[0]?.count ?? 0);
}

export async function addStock(productId: number, accountData: string): Promise<void> {
  const db = await getDb();
  if (!db) return;
  await db.insert(productStock).values({ productId, accountData });
}

export async function addStockBulk(productId: number, items: string[]): Promise<void> {
  const db = await getDb();
  if (!db) return;
  await db.insert(productStock).values(items.map((accountData) => ({ productId, accountData })));
}

export async function getAvailableStock(productId: number): Promise<ProductStock | undefined> {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db
    .select()
    .from(productStock)
    .where(and(eq(productStock.productId, productId), eq(productStock.isSold, false)))
    .limit(1);
  return result[0];
}

export async function markStockSold(stockId: number, orderId: number): Promise<void> {
  const db = await getDb();
  if (!db) return;
  await db
    .update(productStock)
    .set({ isSold: true, soldAt: new Date(), orderId })
    .where(eq(productStock.id, stockId));
}

export async function getStockByProduct(productId: number): Promise<ProductStock[]> {
  const db = await getDb();
  if (!db) return [];
  return db
    .select()
    .from(productStock)
    .where(eq(productStock.productId, productId))
    .orderBy(desc(productStock.createdAt));
}

// ─── Orders ──────────────────────────────────────────────────────────────────

export async function createOrder(data: InsertOrder): Promise<number> {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  const result = await db.insert(orders).values(data);
  return (result[0] as { insertId: number }).insertId;
}

export async function updateOrder(
  id: number,
  data: Partial<Order>
): Promise<void> {
  const db = await getDb();
  if (!db) return;
  await db.update(orders).set(data).where(eq(orders.id, id));
}

export async function getOrdersByUser(userId: number): Promise<Order[]> {
  const db = await getDb();
  if (!db) return [];
  return db
    .select()
    .from(orders)
    .where(eq(orders.userId, userId))
    .orderBy(desc(orders.createdAt));
}

export async function getOrderById(id: number): Promise<Order | undefined> {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(orders).where(eq(orders.id, id)).limit(1);
  return result[0];
}

export async function getRecentOrders(limit = 20): Promise<Order[]> {
  const db = await getDb();
  if (!db) return [];
  return db
    .select()
    .from(orders)
    .where(eq(orders.status, "completed"))
    .orderBy(desc(orders.createdAt))
    .limit(limit);
}

export async function getAllOrders(): Promise<Order[]> {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(orders).orderBy(desc(orders.createdAt));
}

export async function getTotalOrderCount(): Promise<number> {
  const db = await getDb();
  if (!db) return 0;
  const result = await db
    .select({ count: sql<number>`count(*)` })
    .from(orders)
    .where(eq(orders.status, "completed"));
  return Number(result[0]?.count ?? 0);
}

// ─── Top-ups ─────────────────────────────────────────────────────────────────

export async function createTopup(data: InsertTopup): Promise<number> {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  const result = await db.insert(topups).values(data);
  return (result[0] as { insertId: number }).insertId;
}

export async function getTopupsByUser(userId: number): Promise<Topup[]> {
  const db = await getDb();
  if (!db) return [];
  return db
    .select()
    .from(topups)
    .where(eq(topups.userId, userId))
    .orderBy(desc(topups.createdAt));
}

export async function getAllTopups(): Promise<Topup[]> {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(topups).orderBy(desc(topups.createdAt));
}

export async function getPendingTopups(): Promise<Topup[]> {
  const db = await getDb();
  if (!db) return [];
  return db
    .select()
    .from(topups)
    .where(eq(topups.status, "pending"))
    .orderBy(topups.createdAt);
}

export async function updateTopup(id: number, data: Partial<Topup>): Promise<void> {
  const db = await getDb();
  if (!db) return;
  await db.update(topups).set(data).where(eq(topups.id, id));
}

export async function getTodayTopupCount(): Promise<number> {
  const db = await getDb();
  if (!db) return 0;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const result = await db
    .select({ count: sql<number>`count(*)` })
    .from(topups)
    .where(and(eq(topups.status, "approved"), gt(topups.createdAt, today)));
  return Number(result[0]?.count ?? 0);
}

// ─── Announcements ───────────────────────────────────────────────────────────

export async function getAnnouncements(limit = 10): Promise<Announcement[]> {
  const db = await getDb();
  if (!db) return [];
  return db
    .select()
    .from(announcements)
    .where(eq(announcements.isActive, true))
    .orderBy(desc(announcements.createdAt))
    .limit(limit);
}

export async function getAllAnnouncements(): Promise<Announcement[]> {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(announcements).orderBy(desc(announcements.createdAt));
}

export async function getAnnouncementById(id: number): Promise<Announcement | undefined> {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(announcements).where(eq(announcements.id, id)).limit(1);
  return result[0];
}

export async function upsertAnnouncement(data: {
  id?: number;
  title: string;
  content: string;
  type: "news" | "promotion" | "maintenance" | "update";
  imageUrl?: string;
  isActive?: boolean;
}): Promise<void> {
  const db = await getDb();
  if (!db) return;
  if (data.id) {
    await db.update(announcements).set(data).where(eq(announcements.id, data.id));
  } else {
    await db.insert(announcements).values(data);
  }
}

export async function likeAnnouncement(id: number): Promise<void> {
  const db = await getDb();
  if (!db) return;
  await db
    .update(announcements)
    .set({ likes: sql`likes + 1` })
    .where(eq(announcements.id, id));
}

export async function incrementAnnouncementViews(id: number): Promise<void> {
  const db = await getDb();
  if (!db) return;
  await db
    .update(announcements)
    .set({ views: sql`views + 1` })
    .where(eq(announcements.id, id));
}

// ─── Flash Sales ─────────────────────────────────────────────────────────────

export async function getActiveFlashSales(): Promise<FlashSale[]> {
  const db = await getDb();
  if (!db) return [];
  return db
    .select()
    .from(flashSales)
    .where(and(eq(flashSales.isActive, true), gt(flashSales.endAt, new Date())))
    .orderBy(flashSales.endAt);
}

export async function getAllFlashSales(): Promise<FlashSale[]> {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(flashSales).orderBy(desc(flashSales.createdAt));
}

export async function upsertFlashSale(data: {
  id?: number;
  productId: number;
  salePrice: string;
  endAt: Date;
  isActive?: boolean;
}): Promise<void> {
  const db = await getDb();
  if (!db) return;
  if (data.id) {
    await db.update(flashSales).set(data).where(eq(flashSales.id, data.id));
  } else {
    await db.insert(flashSales).values(data);
  }
}

// ─── Banners ─────────────────────────────────────────────────────────────────

export async function getActiveBanners(): Promise<Banner[]> {
  const db = await getDb();
  if (!db) return [];
  return db
    .select()
    .from(banners)
    .where(eq(banners.isActive, true))
    .orderBy(banners.sortOrder);
}

export async function upsertBanner(data: {
  id?: number;
  imageUrl: string;
  linkUrl?: string;
  title?: string;
  sortOrder?: number;
  isActive?: boolean;
}): Promise<void> {
  const db = await getDb();
  if (!db) return;
  if (data.id) {
    await db.update(banners).set(data).where(eq(banners.id, data.id));
  } else {
    await db.insert(banners).values(data);
  }
}

export async function deleteBanner(id: number): Promise<void> {
  const db = await getDb();
  if (!db) return;
  await db.delete(banners).where(eq(banners.id, id));
}

// ─── Stats ───────────────────────────────────────────────────────────────────

export async function getShopStats() {
  const db = await getDb();
  if (!db) return { totalMembers: 0, totalOrders: 0, totalTopups: 0, totalProducts: 0 };
  const [membersRes, ordersRes, topupsRes, productsRes] = await Promise.all([
    db.select({ count: sql<number>`count(*)` }).from(users),
    db
      .select({ count: sql<number>`count(*)` })
      .from(orders)
      .where(eq(orders.status, "completed")),
    db
      .select({ count: sql<number>`count(*)` })
      .from(topups)
      .where(eq(topups.status, "approved")),
    db
      .select({ count: sql<number>`count(*)` })
      .from(productStock)
      .where(eq(productStock.isSold, false)),
  ]);
  return {
    totalMembers: Number(membersRes[0]?.count ?? 0),
    totalOrders: Number(ordersRes[0]?.count ?? 0),
    totalTopups: Number(topupsRes[0]?.count ?? 0),
    totalProducts: Number(productsRes[0]?.count ?? 0),
  };
}
