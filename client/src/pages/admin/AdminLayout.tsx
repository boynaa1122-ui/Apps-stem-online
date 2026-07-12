import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard, Package, Archive, Wallet, Bell, Zap, ShoppingBag,
  ChevronRight, ArrowLeft, Shield
} from "lucide-react";

const NAV_ITEMS = [
  { href: "/admin", icon: LayoutDashboard, label: "ภาพรวม" },
  { href: "/admin/products", icon: Package, label: "จัดการสินค้า" },
  { href: "/admin/stock", icon: Archive, label: "จัดการสต็อก" },
  { href: "/admin/topups", icon: Wallet, label: "อนุมัติเติมเงิน" },
  { href: "/admin/orders", icon: ShoppingBag, label: "ออเดอร์ทั้งหมด" },
  { href: "/admin/announcements", icon: Bell, label: "ประกาศข่าวสาร" },
  { href: "/admin/flash-sales", icon: Zap, label: "Flash Sale" },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();
  const { data: me } = trpc.auth.me.useQuery();
  const [location] = useLocation();

  if (!isAuthenticated || me?.role !== "admin") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-purple-50">
        <div className="text-center">
          <Shield className="w-16 h-16 text-purple-300 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-700 mb-2">ไม่มีสิทธิ์เข้าถึง</h2>
          <p className="text-gray-500 text-sm mb-4">หน้านี้สำหรับ Admin เท่านั้น</p>
          <Link href="/"><button className="text-purple-600 font-semibold hover:underline">กลับหน้าหลัก</button></Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Bar */}
      <header className="sticky top-0 z-40 bg-white border-b border-purple-100 shadow-sm">
        <div className="flex items-center gap-3 px-4 h-14">
          <Link href="/"><button className="text-purple-600 hover:text-purple-800 transition-colors"><ArrowLeft className="w-5 h-5" /></button></Link>
          <div className="w-7 h-7 rounded-lg gradient-purple flex items-center justify-center">
            <Shield className="w-3.5 h-3.5 text-white" />
          </div>
          <span className="font-bold text-gray-800">Admin Panel</span>
          <span className="ml-auto text-xs text-purple-500 font-medium">{me?.name}</span>
        </div>
      </header>
      <div className="flex">
        {/* Sidebar (desktop) */}
        <aside className="hidden md:flex flex-col w-56 min-h-[calc(100vh-3.5rem)] bg-white border-r border-purple-100 p-3 gap-1">
          {NAV_ITEMS.map((item) => {
            const active = location === item.href;
            return (
              <Link key={item.href} href={item.href}>
                <div className={cn("flex items-center gap-2.5 px-3 py-2.5 rounded-xl cursor-pointer transition-all",
                  active ? "gradient-purple text-white shadow-sm" : "text-gray-600 hover:bg-purple-50 hover:text-purple-700")}>
                  <item.icon className="w-4 h-4 flex-shrink-0" />
                  <span className="text-sm font-medium">{item.label}</span>
                </div>
              </Link>
            );
          })}
        </aside>
        {/* Mobile Nav */}
        <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-purple-100 flex overflow-x-auto gap-1 px-2 py-2 scrollbar-hide">
          {NAV_ITEMS.map((item) => {
            const active = location === item.href;
            return (
              <Link key={item.href} href={item.href}>
                <div className={cn("flex flex-col items-center gap-0.5 px-2.5 py-1.5 rounded-xl whitespace-nowrap flex-shrink-0 transition-all",
                  active ? "gradient-purple text-white" : "text-gray-500 hover:bg-purple-50")}>
                  <item.icon className="w-4 h-4" />
                  <span className="text-[9px] font-medium">{item.label}</span>
                </div>
              </Link>
            );
          })}
        </div>
        {/* Content */}
        <main className="flex-1 p-4 pb-24 md:pb-4 max-w-5xl">
          {children}
        </main>
      </div>
    </div>
  );
}
