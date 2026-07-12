import AdminLayout from "./AdminLayout";
import { trpc } from "@/lib/trpc";
import { ShoppingBag, CheckCircle, XCircle, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

const STATUS_CONFIG = {
  pending: { label: "รอดำเนินการ", color: "text-yellow-600 bg-yellow-50", icon: Clock },
  completed: { label: "สำเร็จ", color: "text-green-600 bg-green-50", icon: CheckCircle },
  failed: { label: "ล้มเหลว", color: "text-red-600 bg-red-50", icon: XCircle },
  refunded: { label: "คืนเงิน", color: "text-blue-600 bg-blue-50", icon: CheckCircle },
};

export default function AdminOrders() {
  const { data: orders } = trpc.admin.allOrders.useQuery();
  return (
    <AdminLayout>
      <h1 className="text-xl font-black text-gray-800 mb-4">ออเดอร์ทั้งหมด</h1>
      <div className="bg-white rounded-2xl shadow-sm border border-purple-50 overflow-hidden">
        <div className="divide-y divide-purple-50">
          {orders?.length === 0 ? (
            <div className="py-12 text-center text-gray-400"><ShoppingBag className="w-10 h-10 mx-auto mb-2 text-purple-200" /><p>ยังไม่มีออเดอร์</p></div>
          ) : orders?.map((order) => {
            const cfg = STATUS_CONFIG[order.status as keyof typeof STATUS_CONFIG] ?? STATUS_CONFIG.pending;
            return (
              <div key={order.id} className="flex items-center gap-3 px-4 py-3">
                <div className={cn("w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0", cfg.color)}>
                  <cfg.icon className="w-3.5 h-3.5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-gray-800 truncate">{order.productName}</p>
                  <p className="text-[10px] text-gray-400">User #{order.userId} · {new Date(order.createdAt).toLocaleString("th-TH")}</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-xs font-bold text-purple-700">฿{Number(order.amount).toFixed(0)}</p>
                  <span className={cn("text-[10px] font-bold px-1.5 py-0.5 rounded-full", cfg.color)}>{cfg.label}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </AdminLayout>
  );
}

