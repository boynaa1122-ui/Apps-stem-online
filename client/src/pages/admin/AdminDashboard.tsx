import AdminLayout from "./AdminLayout";
import { trpc } from "@/lib/trpc";
import { Users, ShoppingBag, Wallet, Package, TrendingUp, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

export default function AdminDashboard() {
  const { data: stats } = trpc.admin.stats.useQuery();
  const { data: pendingTopups } = trpc.admin.pendingTopups.useQuery();
  const { data: recentOrders } = trpc.stats.recentOrders.useQuery({ limit: 10 });

  const statCards = [
    { icon: Users, label: "สมาชิกทั้งหมด", value: stats?.totalMembers ?? 0, color: "text-purple-600 bg-purple-50" },
    { icon: ShoppingBag, label: "ออเดอร์ทั้งหมด", value: stats?.totalOrders ?? 0, color: "text-blue-600 bg-blue-50" },
    { icon: Wallet, label: "รายการเติมเงิน", value: stats?.totalTopups ?? 0, color: "text-green-600 bg-green-50" },
    { icon: Package, label: "สินค้าพร้อมขาย", value: stats?.totalProducts ?? 0, color: "text-orange-600 bg-orange-50" },
  ];

  return (
    <AdminLayout>
      <h1 className="text-xl font-black text-gray-800 mb-4">ภาพรวมร้านค้า</h1>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        {statCards.map((c) => (
          <div key={c.label} className="bg-white rounded-2xl p-4 shadow-sm border border-purple-50">
            <div className={cn("w-9 h-9 rounded-xl flex items-center justify-center mb-2", c.color)}>
              <c.icon className="w-4.5 h-4.5" />
            </div>
            <p className="text-2xl font-black text-gray-800">{c.value.toLocaleString()}</p>
            <p className="text-xs text-gray-500 mt-0.5">{c.label}</p>
          </div>
        ))}
      </div>

      {/* Pending Topups Alert */}
      {pendingTopups && pendingTopups.length > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-4 mb-4 flex items-center gap-3">
          <Clock className="w-5 h-5 text-yellow-600 flex-shrink-0" />
          <div>
            <p className="text-sm font-bold text-yellow-800">มีคำขอเติมเงินรอการอนุมัติ {pendingTopups.length} รายการ</p>
            <a href="/admin/topups" className="text-xs text-yellow-600 hover:underline">คลิกเพื่ออนุมัติ →</a>
          </div>
        </div>
      )}

      {/* Recent Orders */}
      <div className="bg-white rounded-2xl shadow-sm border border-purple-50 overflow-hidden">
        <div className="p-4 border-b border-purple-50">
          <h2 className="font-bold text-gray-800 text-sm">ออเดอร์ล่าสุด</h2>
        </div>
        <div className="divide-y divide-purple-50">
          {recentOrders?.slice(0, 8).map((order) => (
            <div key={order.id} className="flex items-center gap-3 px-4 py-3">
              <div className="w-8 h-8 rounded-lg bg-purple-100 flex items-center justify-center flex-shrink-0">
                <span className="text-sm">📺</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-gray-800 truncate">{order.productName}</p>
                <p className="text-[10px] text-gray-400">{new Date(order.createdAt).toLocaleString("th-TH")}</p>
              </div>
              <span className="text-xs font-bold text-purple-700">฿{Number(order.amount).toFixed(0)}</span>
            </div>
          ))}
        </div>
      </div>
    </AdminLayout>
  );
}
