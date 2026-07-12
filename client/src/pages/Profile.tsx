import AppLayout from "@/components/AppLayout";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { startLogin } from "@/const";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { User, Wallet, ShoppingBag, LogOut, Shield, ChevronRight } from "lucide-react";

export default function Profile() {
  const { isAuthenticated, logout } = useAuth();
  const { data: me } = trpc.auth.me.useQuery();
  const logoutMutation = trpc.auth.logout.useMutation({ onSuccess: () => { logout(); window.location.href = "/"; } });

  if (!isAuthenticated) return (
    <AppLayout>
      <div className="max-w-lg mx-auto px-4 py-16 text-center">
        <User className="w-16 h-16 text-purple-300 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-gray-700 mb-2">เข้าสู่ระบบก่อน</h2>
        <Button className="gradient-purple text-white btn-scale" onClick={() => startLogin()}>เข้าสู่ระบบ</Button>
      </div>
    </AppLayout>
  );

  return (
    <AppLayout>
      <div className="max-w-lg mx-auto px-4 py-4">
        {/* Profile Header */}
        <div className="gradient-hero rounded-3xl p-6 mb-5 text-white text-center shadow-lg">
          <div className="w-20 h-20 rounded-full bg-white/20 flex items-center justify-center mx-auto mb-3 text-4xl font-black text-white">
            {(me?.name ?? "U").charAt(0).toUpperCase()}
          </div>
          <h2 className="text-xl font-black">{me?.name ?? "ผู้ใช้"}</h2>
          <p className="text-purple-200 text-sm">{me?.email ?? ""}</p>
          {me?.role === "admin" && (
            <span className="inline-flex items-center gap-1 bg-yellow-400 text-purple-900 text-xs font-bold px-2 py-0.5 rounded-full mt-2">
              <Shield className="w-3 h-3" /> Admin
            </span>
          )}
        </div>

        {/* Balance */}
        <div className="bg-white rounded-2xl shadow-sm border border-purple-100 p-5 mb-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">ยอดเงินคงเหลือ</p>
              <p className="text-3xl font-black text-purple-700">฿{Number(me?.balance ?? 0).toFixed(2)}</p>
            </div>
            <Link href="/topup">
              <Button className="gradient-purple text-white btn-scale text-sm">เติมเงิน</Button>
            </Link>
          </div>
        </div>

        {/* Menu */}
        <div className="bg-white rounded-2xl shadow-sm border border-purple-100 overflow-hidden mb-4">
          {[
            { icon: ShoppingBag, label: "ประวัติการสั่งซื้อ", href: "/orders" },
            { icon: Wallet, label: "ประวัติการเติมเงิน", href: "/topup" },
            ...(me?.role === "admin" ? [{ icon: Shield, label: "Admin Panel", href: "/admin" }] : []),
          ].map((item, i) => (
            <Link key={i} href={item.href}>
              <div className="flex items-center gap-3 px-4 py-4 border-b border-purple-50 last:border-0 hover:bg-purple-50 transition-colors cursor-pointer">
                <div className="w-9 h-9 rounded-xl bg-purple-100 flex items-center justify-center">
                  <item.icon className="w-4.5 h-4.5 text-purple-600" />
                </div>
                <span className="flex-1 text-sm font-semibold text-gray-800">{item.label}</span>
                <ChevronRight className="w-4 h-4 text-gray-400" />
              </div>
            </Link>
          ))}
        </div>

        <Button
          variant="outline"
          className="w-full border-red-200 text-red-500 hover:bg-red-50 font-semibold btn-scale"
          onClick={() => logoutMutation.mutate()}
        >
          <LogOut className="w-4 h-4 mr-2" /> ออกจากระบบ
        </Button>
      </div>
    </AppLayout>
  );
}
