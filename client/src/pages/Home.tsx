import AppLayout from "@/components/AppLayout";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { startLogin } from "@/const";
import { useState, useEffect, useRef } from "react";
import { Link } from "wouter";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Zap, ChevronLeft, ChevronRight, MessageCircle, Wallet, Star, Smartphone,
  Shield, Clock, Users, ShoppingCart, TrendingUp, ChevronDown, ChevronUp,
  Package, Headphones, CreditCard, Home as HomeIcon, Bell
} from "lucide-react";

// ─── Countdown Timer ─────────────────────────────────────────────────────────
function useCountdown(endAt: Date | null) {
  const [timeLeft, setTimeLeft] = useState({ d: 0, h: 0, m: 0, s: 0 });
  useEffect(() => {
    if (!endAt) return;
    const tick = () => {
      const diff = Math.max(0, endAt.getTime() - Date.now());
      const d = Math.floor(diff / 86400000);
      const h = Math.floor((diff % 86400000) / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      const s = Math.floor((diff % 60000) / 1000);
      setTimeLeft({ d, h, m, s });
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [endAt]);
  return timeLeft;
}

function CountdownUnit({ value, label }: { value: number; label: string }) {
  return (
    <div className="flex flex-col items-center">
      <div className="bg-purple-900 text-white text-xs font-bold w-7 h-7 rounded flex items-center justify-center tabular-nums">
        {String(value).padStart(2, "0")}
      </div>
      <span className="text-[9px] text-purple-300 mt-0.5">{label}</span>
    </div>
  );
}

// ─── Banner Slider ────────────────────────────────────────────────────────────
const DEFAULT_BANNERS = [
  { id: 1, title: "Netflix, Disney+, YouTube Premium", gradient: "from-purple-700 to-purple-500", emoji: "🎬" },
  { id: 2, title: "HBO Max, VIU, Prime Video", gradient: "from-purple-600 to-pink-500", emoji: "🎭" },
  { id: 3, title: "Spotify, Bilibili, IQIYI", gradient: "from-indigo-600 to-purple-600", emoji: "🎵" },
];

function BannerSlider({ banners }: { banners: typeof DEFAULT_BANNERS }) {
  const [current, setCurrent] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setCurrent((c) => (c + 1) % banners.length), 4000);
    return () => clearInterval(id);
  }, [banners.length]);
  return (
    <div className="relative overflow-hidden rounded-2xl mx-4 mb-4 h-36 shadow-lg">
      {banners.map((b, i) => (
        <div
          key={b.id}
          className={cn(
            "absolute inset-0 transition-opacity duration-700 bg-gradient-to-r flex items-center justify-center",
            `bg-gradient-to-r ${b.gradient}`,
            i === current ? "opacity-100" : "opacity-0"
          )}
        >
          <div className="text-center text-white px-6">
            <div className="text-4xl mb-2">{b.emoji}</div>
            <p className="font-bold text-lg">{b.title}</p>
            <p className="text-purple-200 text-sm">ราคาถูก ส่งอัตโนมัติทันที</p>
          </div>
        </div>
      ))}
      <div className="absolute bottom-2 left-0 right-0 flex justify-center gap-1.5">
        {banners.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrent(i)}
            className={cn("w-1.5 h-1.5 rounded-full transition-all", i === current ? "bg-white w-4" : "bg-white/50")}
          />
        ))}
      </div>
    </div>
  );
}

// ─── Flash Sale Section ───────────────────────────────────────────────────────
function FlashSaleSection() {
  const { data: sales } = trpc.flashSales.active.useQuery();
  const endAt = sales?.[0]?.endAt ? new Date(sales[0].endAt) : null;
  const countdown = useCountdown(endAt);
  if (!sales?.length) return null;
  return (
    <section className="mx-4 mb-4">
      <div className="bg-gradient-to-r from-purple-700 to-purple-500 rounded-2xl p-4 shadow-lg">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="bg-yellow-400 text-purple-900 px-2 py-0.5 rounded-full text-xs font-black flex items-center gap-1">
              <Zap className="w-3 h-3" /> FLASH SALE
            </div>
          </div>
          <div className="flex items-center gap-1">
            <CountdownUnit value={countdown.d} label="วัน" />
            <span className="text-purple-300 font-bold text-sm mb-3">:</span>
            <CountdownUnit value={countdown.h} label="ชม." />
            <span className="text-purple-300 font-bold text-sm mb-3">:</span>
            <CountdownUnit value={countdown.m} label="นาที" />
            <span className="text-purple-300 font-bold text-sm mb-3">:</span>
            <CountdownUnit value={countdown.s} label="วิ." />
          </div>
        </div>
        <div className="flex gap-3 overflow-x-auto pb-1 scrollbar-hide">
          {sales.map((sale) => {
            if (!sale.product) return null;
            const discount = sale.product.originalPrice
              ? Math.round((1 - Number(sale.salePrice) / Number(sale.product.originalPrice)) * 100)
              : 0;
            return (
              <Link key={sale.id} href={`/products/${sale.product.id}`}>
                <div className="bg-white rounded-xl p-3 min-w-[130px] shadow-sm cursor-pointer hover:shadow-md transition-shadow">
                  {discount > 0 && (
                    <Badge className="bg-red-500 text-white text-[10px] mb-1 px-1.5">-{discount}%</Badge>
                  )}
                  <div className="w-12 h-12 rounded-lg bg-purple-100 flex items-center justify-center mx-auto mb-2 overflow-hidden">
                    {sale.product.imageUrl ? (
                      <img src={sale.product.imageUrl} alt={sale.product.name} className="w-full h-full object-cover rounded-lg" />
                    ) : (
                      <span className="text-2xl">📺</span>
                    )}
                  </div>
                  <p className="text-xs font-semibold text-gray-800 line-clamp-2 text-center leading-tight mb-1">{sale.product.name}</p>
                  <div className="text-center">
                    <span className="text-purple-700 font-bold text-sm">฿{Number(sale.salePrice).toFixed(0)}</span>
                    {sale.product.originalPrice && (
                      <span className="text-gray-400 text-[10px] line-through ml-1">฿{Number(sale.product.originalPrice).toFixed(0)}</span>
                    )}
                  </div>
                  <p className="text-[10px] text-gray-400 text-center mt-0.5">เหลือ {sale.stockCount}</p>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}

// ─── Recommended Menu ─────────────────────────────────────────────────────────
const menuItems = [
  { icon: "💰", label: "เติมเงิน", sub: "TOP UP", href: "/topup", color: "bg-purple-100 text-purple-700" },
  { icon: "📺", label: "แอพพรีเมี่ยม", sub: "PREMIUM", href: "/products", color: "bg-blue-100 text-blue-700" },
  { icon: "📦", label: "ประวัติออเดอร์", sub: "ORDERS", href: "/orders", color: "bg-green-100 text-green-700" },
  { icon: "📢", label: "ข่าวสาร", sub: "NEWS", href: "/announcements", color: "bg-yellow-100 text-yellow-700" },
  { icon: "👤", label: "บัญชีฉัน", sub: "PROFILE", href: "/profile", color: "bg-pink-100 text-pink-700" },
  { icon: "💬", label: "ติดต่อ", sub: "CONTACT", href: "https://line.me", color: "bg-emerald-100 text-emerald-700", external: true },
];

function RecommendedMenu() {
  return (
    <section className="mx-4 mb-4">
      <div className="flex items-center justify-between mb-3">
        <div>
          <h2 className="font-bold text-gray-800 text-base">เมนูแนะนำ</h2>
          <p className="text-xs text-purple-400 font-medium">RECOMMEND MENU</p>
        </div>
      </div>
      <div className="grid grid-cols-3 gap-3">
        {menuItems.map((item) => (
          <Link key={item.label} href={item.href}>
            <div className="bg-white rounded-2xl p-3 flex flex-col items-center gap-1.5 shadow-sm border border-purple-50 cursor-pointer hover:shadow-md hover:border-purple-200 transition-all btn-scale">
              <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center text-2xl", item.color)}>
                {item.icon}
              </div>
              <span className="text-xs font-semibold text-gray-700 text-center leading-tight">{item.label}</span>
              <span className="text-[9px] text-gray-400 font-medium">{item.sub}</span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}

// ─── Recent Orders ────────────────────────────────────────────────────────────
function RecentOrders() {
  const { data: orders, refetch } = trpc.stats.recentOrders.useQuery({ limit: 15 });
  useEffect(() => {
    const id = setInterval(() => refetch(), 10000);
    return () => clearInterval(id);
  }, [refetch]);
  const maskName = (name: string | null) => {
    if (!name) return "***";
    return name.slice(0, 2) + "***" + name.slice(-2);
  };
  const timeAgo = (date: Date) => {
    const diff = Date.now() - new Date(date).getTime();
    const m = Math.floor(diff / 60000);
    if (m < 1) return "เมื่อกี้";
    if (m < 60) return `${m} นาทีที่แล้ว`;
    const h = Math.floor(m / 60);
    if (h < 24) return `${h} ชั่วโมงที่แล้ว`;
    return `${Math.floor(h / 24)} วันที่แล้ว`;
  };
  return (
    <section className="mx-4 mb-4">
      <div className="bg-white rounded-2xl shadow-sm border border-purple-50 overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-purple-50">
          <div>
            <h2 className="font-bold text-gray-800 text-sm">ประวัติสั่งซื้อล่าสุด</h2>
            <p className="text-[10px] text-gray-400">อัพเดตแบบ Real-time</p>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <span className="text-xs text-green-600 font-medium">Live</span>
          </div>
        </div>
        <div className="divide-y divide-purple-50 max-h-64 overflow-y-auto">
          {orders?.length ? orders.map((order) => (
            <div key={order.id} className="flex items-center gap-3 px-4 py-2.5">
              <div className="w-8 h-8 rounded-lg bg-purple-100 flex items-center justify-center flex-shrink-0 overflow-hidden">
                {order.productImage ? (
                  <img src={order.productImage} alt="" className="w-full h-full object-cover rounded-lg" />
                ) : (
                  <span className="text-sm">📺</span>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-gray-800 truncate">{order.productName}</p>
                <p className="text-[10px] text-gray-400">{maskName(null)} · {timeAgo(order.createdAt)}</p>
              </div>
              <span className="text-[10px] text-purple-500 font-medium flex-shrink-0">฿{Number(order.amount).toFixed(0)}</span>
            </div>
          )) : (
            <div className="py-8 text-center text-gray-400 text-sm">ยังไม่มีออเดอร์</div>
          )}
        </div>
      </div>
    </section>
  );
}

// ─── Shop Stats ───────────────────────────────────────────────────────────────
function ShopStats() {
  const { data: stats } = trpc.stats.shop.useQuery();
  const items = [
    { icon: Users, label: "สมาชิกทั้งหมด", value: stats?.totalMembers ?? 0, color: "text-purple-600", bg: "bg-purple-50" },
    { icon: ShoppingCart, label: "ออเดอร์สะสม", value: stats?.totalOrders ?? 0, color: "text-blue-600", bg: "bg-blue-50" },
    { icon: TrendingUp, label: "รายการเติมเงิน", value: stats?.totalTopups ?? 0, color: "text-green-600", bg: "bg-green-50" },
    { icon: Package, label: "สินค้าพร้อมขาย", value: stats?.totalProducts ?? 0, color: "text-orange-600", bg: "bg-orange-50" },
  ];
  return (
    <section className="mx-4 mb-4">
      <div className="grid grid-cols-2 gap-3">
        {items.map((item) => (
          <div key={item.label} className="bg-white rounded-2xl p-4 shadow-sm border border-purple-50">
            <div className={cn("w-9 h-9 rounded-xl flex items-center justify-center mb-2", item.bg)}>
              <item.icon className={cn("w-4.5 h-4.5", item.color)} />
            </div>
            <p className="text-2xl font-black text-gray-800">{item.value.toLocaleString()}</p>
            <p className="text-[11px] text-gray-500 mt-0.5">{item.label}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

// ─── Announcements Preview ────────────────────────────────────────────────────
function AnnouncementsPreview() {
  const { data: announcements } = trpc.announcements.list.useQuery({ limit: 3 });
  const typeLabel: Record<string, { label: string; color: string }> = {
    news: { label: "ข่าวสาร", color: "bg-blue-100 text-blue-700" },
    promotion: { label: "โปรโมชัน", color: "bg-green-100 text-green-700" },
    maintenance: { label: "ปิดปรับปรุง", color: "bg-red-100 text-red-700" },
    update: { label: "อัปเดต", color: "bg-purple-100 text-purple-700" },
  };
  const timeAgo = (date: Date) => {
    const diff = Date.now() - new Date(date).getTime();
    const d = Math.floor(diff / 86400000);
    if (d < 1) return "วันนี้";
    if (d < 7) return `${d} วันที่แล้ว`;
    const w = Math.floor(d / 7);
    if (w < 4) return `${w} สัปดาห์ที่แล้ว`;
    return `${Math.floor(d / 30)} เดือนที่แล้ว`;
  };
  return (
    <section className="mx-4 mb-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <h2 className="font-bold text-gray-800 text-base">ประกาศข่าวสาร</h2>
          <span className="flex items-center gap-1 bg-green-100 text-green-700 text-[10px] font-bold px-2 py-0.5 rounded-full">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" /> LIVE
          </span>
        </div>
        <Link href="/announcements">
          <button className="text-xs text-purple-600 font-semibold hover:underline">ดูทั้งหมด →</button>
        </Link>
      </div>
      <div className="space-y-3">
        {announcements?.length ? announcements.map((ann) => {
          const t = typeLabel[ann.type] ?? typeLabel.news;
          return (
            <Link key={ann.id} href={`/announcements/${ann.id}`}>
              <div className="bg-white rounded-2xl p-4 shadow-sm border border-purple-50 cursor-pointer hover:shadow-md transition-shadow">
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-full gradient-purple flex items-center justify-center flex-shrink-0">
                    <Bell className="w-4 h-4 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={cn("text-[10px] font-bold px-1.5 py-0.5 rounded-full", t.color)}>{t.label}</span>
                      <span className="text-[10px] text-gray-400">{timeAgo(ann.createdAt)}</span>
                    </div>
                    <p className="text-sm font-semibold text-gray-800 line-clamp-1">{ann.title}</p>
                    <p className="text-xs text-gray-500 line-clamp-2 mt-0.5">{ann.content}</p>
                  </div>
                </div>
              </div>
            </Link>
          );
        }) : (
          <div className="bg-white rounded-2xl p-8 text-center text-gray-400 text-sm shadow-sm">ยังไม่มีประกาศ</div>
        )}
      </div>
    </section>
  );
}

// ─── How to Use ───────────────────────────────────────────────────────────────
function HowToUse() {
  const { isAuthenticated } = useAuth();
  const steps = [
    { n: 1, icon: "👤", title: "สมัครสมาชิก", desc: "สมัครฟรี ใช้อีเมล ไม่ถึง 1 นาที", action: !isAuthenticated ? { label: "สมัครเลย", onClick: () => startLogin() } : null },
    { n: 2, icon: "💰", title: "เติมเงินเข้าระบบ", desc: "รองรับสลิปธนาคาร และพร้อมเพย์", action: { label: "เติมเงิน", href: "/topup" } },
    { n: 3, icon: "🛒", title: "เลือกซื้อสินค้า", desc: "ระบบส่งให้อัตโนมัติทันที ไม่ต้องรอ", action: { label: "ดูสินค้า", href: "/products" } },
    { n: 4, icon: "🎧", title: "ใช้งาน + Support", desc: "มีปัญหาเคลมได้ทันที ทีมงานพร้อมช่วย", action: null },
  ];
  return (
    <section className="mx-4 mb-4">
      <div className="text-center mb-4">
        <h2 className="font-bold text-gray-800 text-base">คำแนะนำและวิธีใช้งาน</h2>
        <p className="text-xs text-gray-500 mt-1">เริ่มต้นใช้บริการได้ใน 4 ขั้นตอนง่ายๆ</p>
      </div>
      <div className="grid grid-cols-2 gap-3">
        {steps.map((step) => (
          <div key={step.n} className="bg-white rounded-2xl p-4 shadow-sm border border-purple-50">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-6 h-6 rounded-full gradient-purple flex items-center justify-center">
                <span className="text-white text-[10px] font-bold">{step.n}</span>
              </div>
              <span className="text-xl">{step.icon}</span>
            </div>
            <p className="text-xs font-bold text-gray-800 mb-1">{step.title}</p>
            <p className="text-[11px] text-gray-500 leading-relaxed">{step.desc}</p>
            {step.action && (
              step.action.href ? (
                <Link href={step.action.href}>
                  <button className="mt-2 text-[11px] text-purple-600 font-semibold hover:underline">{step.action.label} →</button>
                </Link>
              ) : (
                <button onClick={step.action.onClick ?? undefined} className="mt-2 text-[11px] text-purple-600 font-semibold hover:underline">{step.action.label} →</button>
              )
            )}
          </div>
        ))}
      </div>
    </section>
  );
}

// ─── FAQ ──────────────────────────────────────────────────────────────────────
const faqs = [
  { q: "สินค้าใช้งานได้นานแค่ไหน?", a: "ตามระยะเวลาที่ระบุในหน้าสินค้า เช่น Netflix 30 วัน หากหมดอายุสามารถต่ออายุได้ทันที ไม่จำกัด" },
  { q: "มีปัญหาสามารถเคลมได้หรือไม่?", a: "ได้เลยครับ ติดต่อทีมงานผ่าน Line หรือในระบบ ทีมงานพร้อมช่วยเหลือภายใน 5-30 นาที" },
  { q: "เติมเงินได้ช่องทางไหนบ้าง?", a: "รองรับการโอนเงินผ่านธนาคาร และพร้อมเพย์ อัพโหลดสลิปในระบบ admin จะอนุมัติภายใน 30 นาที" },
  { q: "สินค้าส่งเร็วแค่ไหน?", a: "ระบบส่งอัตโนมัติทันทีหลังชำระเงินสำเร็จ ไม่ต้องรอ admin" },
  { q: "ซื้อแล้วได้รับสินค้าอย่างไร?", a: "หลังซื้อสำเร็จ ระบบจะแสดง account/password ในหน้าประวัติออเดอร์ทันที" },
];

function FAQ() {
  const [open, setOpen] = useState<number | null>(null);
  return (
    <section className="mx-4 mb-6">
      <div className="text-center mb-4">
        <h2 className="font-bold text-gray-800 text-base">คำถามที่พบบ่อย</h2>
        <p className="text-xs text-gray-500 mt-1">คำถามและคำตอบที่ลูกค้าถามมากที่สุด</p>
      </div>
      <div className="space-y-2">
        {faqs.map((faq, i) => (
          <div key={i} className="bg-white rounded-2xl shadow-sm border border-purple-50 overflow-hidden">
            <button
              className="w-full flex items-center justify-between p-4 text-left"
              onClick={() => setOpen(open === i ? null : i)}
            >
              <span className="text-sm font-semibold text-gray-800 pr-2">{faq.q}</span>
              {open === i ? <ChevronUp className="w-4 h-4 text-purple-500 flex-shrink-0" /> : <ChevronDown className="w-4 h-4 text-gray-400 flex-shrink-0" />}
            </button>
            {open === i && (
              <div className="px-4 pb-4">
                <p className="text-sm text-gray-600 leading-relaxed">{faq.a}</p>
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}

// ─── Hero Section ─────────────────────────────────────────────────────────────
function HeroSection() {
  const { isAuthenticated } = useAuth();
  return (
    <section className="gradient-hero px-4 pt-6 pb-8 mb-4">
      <div className="max-w-md mx-auto text-center">
        <div className="inline-flex items-center gap-2 bg-white/20 text-white text-xs font-semibold px-3 py-1 rounded-full mb-3">
          <Zap className="w-3 h-3 text-yellow-300" /> ส่งอัตโนมัติทันที ไม่ต้องรอ
        </div>
        <h1 className="text-2xl font-black text-white mb-2 leading-tight">
          บริการแอพ Streaming<br />
          <span className="text-yellow-300">ราคาถูกที่สุด</span>
        </h1>
        <p className="text-purple-200 text-sm mb-5">Netflix · Disney+ · YouTube Premium · HBO Max · VIU และอีกมากมาย</p>
        <div className="flex gap-3 justify-center">
          <Link href="/products">
            <Button className="bg-white text-purple-700 hover:bg-purple-50 font-bold btn-scale shadow-lg">
              <ShoppingCart className="w-4 h-4 mr-1.5" /> ดูสินค้า
            </Button>
          </Link>
          {!isAuthenticated && (
            <Button
              variant="outline"
              className="border-white/50 text-white hover:bg-white/20 font-semibold btn-scale"
              onClick={() => startLogin()}
            >
              สมัครฟรี
            </Button>
          )}
        </div>
      </div>
    </section>
  );
}

// ─── Main Home ────────────────────────────────────────────────────────────────
export default function Home() {
  return (
    <AppLayout>
      <HeroSection />
      <FlashSaleSection />
      <BannerSlider banners={DEFAULT_BANNERS} />
      <RecommendedMenu />
      <RecentOrders />
      <ShopStats />
      <AnnouncementsPreview />
      <HowToUse />
      <FAQ />
      {/* Footer */}
      <footer className="bg-purple-900 text-white px-4 py-6 text-center">
        <div className="flex items-center justify-center gap-2 mb-2">
          <div className="w-7 h-7 rounded-lg bg-white/20 flex items-center justify-center">
            <ShoppingCart className="w-3.5 h-3.5 text-white" />
          </div>
          <span className="font-bold">GaFiwSHOP</span>
        </div>
        <p className="text-purple-300 text-xs mb-3">บริการแอพสตรีมมิ่งราคาถูก ส่งอัตโนมัติ</p>
        <div className="flex justify-center gap-4 text-xs text-purple-400">
          <a href="#" className="hover:text-white">เงื่อนไขการใช้งาน</a>
          <a href="#" className="hover:text-white">นโยบายความเป็นส่วนตัว</a>
        </div>
      </footer>
    </AppLayout>
  );
}
