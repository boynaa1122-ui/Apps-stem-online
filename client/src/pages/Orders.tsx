import AppLayout from "@/components/AppLayout";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { startLogin } from "@/const";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Package, CheckCircle, XCircle, Clock, Eye, EyeOff } from "lucide-react";
import { cn } from "@/lib/utils";

const STATUS_CONFIG = {
  pending: { label: "รอดำเนินการ", color: "text-yellow-600 bg-yellow-50", icon: Clock },
  completed: { label: "สำเร็จ", color: "text-green-600 bg-green-50", icon: CheckCircle },
  failed: { label: "ล้มเหลว", color: "text-red-600 bg-red-50", icon: XCircle },
  refunded: { label: "คืนเงิน", color: "text-blue-600 bg-blue-50", icon: CheckCircle },
};

function OrderCard({ order }: { order: any }) {
  const [showAccount, setShowAccount] = useState(false);
  const cfg = STATUS_CONFIG[order.status as keyof typeof STATUS_CONFIG] ?? STATUS_CONFIG.pending;
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-purple-50 overflow-hidden">
      <div className="flex items-center gap-3 p-4">
        <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center flex-shrink-0 overflow-hidden">
          {order.productImage ? (
            <img src={order.productImage} alt="" className="w-full h-full object-cover rounded-xl" />
          ) : <span className="text-2xl">📺</span>}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold text-gray-800 truncate">{order.productName}</p>
          <p className="text-xs text-gray-400">{new Date(order.createdAt).toLocaleString("th-TH")}</p>
          <p className="text-sm font-black text-purple-700 mt-0.5">฿{Number(order.amount).toFixed(2)}</p>
        </div>
        <span className={cn("text-[10px] font-bold px-2 py-1 rounded-full flex items-center gap-1", cfg.color)}>
          <cfg.icon className="w-3 h-3" />{cfg.label}
        </span>
      </div>
      {order.accountDelivered && order.status === "completed" && (
        <div className="border-t border-purple-50 px-4 pb-4">
          <button
            onClick={() => setShowAccount(!showAccount)}
            className="flex items-center gap-1.5 text-xs text-purple-600 font-semibold mt-3 hover:underline"
          >
            {showAccount ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
            {showAccount ? "ซ่อนข้อมูล" : "ดูข้อมูลสินค้า"}
          </button>
          {showAccount && (
            <div className="mt-2 bg-purple-50 rounded-xl p-3 font-mono text-xs text-gray-800 break-all">
              {order.accountDelivered}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function Orders() {
  const { isAuthenticated } = useAuth();
  const { data: orders, isLoading } = trpc.orders.myOrders.useQuery(undefined, { enabled: isAuthenticated });

  if (!isAuthenticated) return (
    <AppLayout>
      <div className="max-w-lg mx-auto px-4 py-16 text-center">
        <Package className="w-16 h-16 text-purple-300 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-gray-700 mb-2">เข้าสู่ระบบก่อน</h2>
        <Button className="gradient-purple text-white btn-scale" onClick={() => startLogin()}>เข้าสู่ระบบ</Button>
      </div>
    </AppLayout>
  );

  return (
    <AppLayout>
      <div className="max-w-lg mx-auto px-4 py-4">
        <h1 className="text-xl font-black text-gray-800 mb-1">ประวัติการสั่งซื้อ</h1>
        <p className="text-sm text-gray-500 mb-4">ดูข้อมูลสินค้าที่ซื้อไปแล้ว</p>
        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="bg-white rounded-2xl p-4 shadow-sm animate-pulse h-20" />
            ))}
          </div>
        ) : orders?.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <Package className="w-12 h-12 mx-auto mb-3 text-purple-200" />
            <p className="font-semibold">ยังไม่มีประวัติการสั่งซื้อ</p>
          </div>
        ) : (
          <div className="space-y-3">
            {orders?.map((order) => <OrderCard key={order.id} order={order} />)}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
