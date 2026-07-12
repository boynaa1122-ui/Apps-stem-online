import AdminLayout from "./AdminLayout";
import { trpc } from "@/lib/trpc";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { CheckCircle, XCircle, Clock, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";

export default function AdminTopups() {
  const { data: topups, refetch } = trpc.admin.allTopups.useQuery();
  const [note, setNote] = useState<Record<number, string>>({});
  const utils = trpc.useUtils();

  const approveMutation = trpc.admin.approveTopup.useMutation({
    onSuccess: () => { toast.success("อนุมัติสำเร็จ"); utils.admin.allTopups.invalidate(); utils.admin.pendingTopups.invalidate(); },
    onError: (e) => toast.error(e.message),
  });
  const rejectMutation = trpc.admin.rejectTopup.useMutation({
    onSuccess: () => { toast.success("ปฏิเสธสำเร็จ"); utils.admin.allTopups.invalidate(); utils.admin.pendingTopups.invalidate(); },
    onError: (e) => toast.error(e.message),
  });

  const STATUS_CONFIG = {
    pending: { label: "รอตรวจสอบ", color: "text-yellow-600 bg-yellow-50", icon: Clock },
    approved: { label: "อนุมัติแล้ว", color: "text-green-600 bg-green-50", icon: CheckCircle },
    rejected: { label: "ปฏิเสธ", color: "text-red-600 bg-red-50", icon: XCircle },
  };

  return (
    <AdminLayout>
      <h1 className="text-xl font-black text-gray-800 mb-4">จัดการการเติมเงิน</h1>
      <div className="space-y-3">
        {topups?.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center text-gray-400 shadow-sm">ยังไม่มีรายการ</div>
        ) : topups?.map((t) => {
          const cfg = STATUS_CONFIG[t.status as keyof typeof STATUS_CONFIG] ?? STATUS_CONFIG.pending;
          return (
            <div key={t.id} className="bg-white rounded-2xl shadow-sm border border-purple-50 p-4">
              <div className="flex items-center gap-3 mb-3">
                <div className={cn("w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0", cfg.color)}>
                  <cfg.icon className="w-4 h-4" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-bold text-gray-800">฿{Number(t.amount).toFixed(2)}</p>
                  <p className="text-xs text-gray-400">{new Date(t.createdAt).toLocaleString("th-TH")} · User #{t.userId}</p>
                </div>
                <span className={cn("text-[10px] font-bold px-2 py-0.5 rounded-full", cfg.color)}>{cfg.label}</span>
              </div>
              {t.slipUrl && (
                <a href={t.slipUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-xs text-purple-600 hover:underline mb-3">
                  <ExternalLink className="w-3.5 h-3.5" /> ดูสลิป
                </a>
              )}
              {t.status === "pending" && (
                <div className="flex gap-2">
                  <input
                    className="flex-1 border border-purple-200 rounded-lg px-3 py-1.5 text-xs"
                    placeholder="หมายเหตุ (ไม่บังคับ)"
                    value={note[t.id] ?? ""}
                    onChange={(e) => setNote({ ...note, [t.id]: e.target.value })}
                  />
                  <Button size="sm" className="bg-green-500 hover:bg-green-600 text-white btn-scale text-xs" onClick={() => approveMutation.mutate({ id: t.id, note: note[t.id] })}>
                    <CheckCircle className="w-3.5 h-3.5 mr-1" /> อนุมัติ
                  </Button>
                  <Button size="sm" variant="outline" className="border-red-200 text-red-500 hover:bg-red-50 btn-scale text-xs" onClick={() => rejectMutation.mutate({ id: t.id, note: note[t.id] })}>
                    <XCircle className="w-3.5 h-3.5 mr-1" /> ปฏิเสธ
                  </Button>
                </div>
              )}
              {t.note && <p className="text-xs text-gray-500 mt-2">หมายเหตุ: {t.note}</p>}
            </div>
          );
        })}
      </div>
    </AdminLayout>
  );
}
