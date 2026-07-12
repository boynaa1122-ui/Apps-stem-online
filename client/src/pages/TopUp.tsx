import AppLayout from "@/components/AppLayout";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { startLogin } from "@/const";
import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Wallet, Upload, Clock, CheckCircle, XCircle, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

const PRESET_AMOUNTS = [50, 100, 200, 300, 500, 1000];

const STATUS_CONFIG = {
  pending: { label: "รอตรวจสอบ", icon: Clock, color: "text-yellow-600 bg-yellow-50" },
  approved: { label: "อนุมัติแล้ว", icon: CheckCircle, color: "text-green-600 bg-green-50" },
  rejected: { label: "ปฏิเสธ", icon: XCircle, color: "text-red-600 bg-red-50" },
};

export default function TopUp() {
  const { isAuthenticated } = useAuth();
  const { data: me } = trpc.auth.me.useQuery();
  const { data: topups, refetch } = trpc.topup.myTopups.useQuery(undefined, { enabled: isAuthenticated });
  const [amount, setAmount] = useState("");
  const [slipFile, setSlipFile] = useState<File | null>(null);
  const [slipPreview, setSlipPreview] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const utils = trpc.useUtils();

  const submitMutation = trpc.topup.submit.useMutation({
    onSuccess: () => {
      toast.success("ส่งคำขอเติมเงินสำเร็จ! รอ admin อนุมัติภายใน 30 นาที");
      setAmount(""); setSlipFile(null); setSlipPreview(null);
      utils.topup.myTopups.invalidate();
      setSubmitting(false);
    },
    onError: (err) => { toast.error(err.message); setSubmitting(false); },
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setSlipFile(file);
    const reader = new FileReader();
    reader.onload = (ev) => setSlipPreview(ev.target?.result as string);
    reader.readAsDataURL(file);
  };

  const handleSubmit = async () => {
    if (!amount || Number(amount) < 1) { toast.error("กรุณาระบุจำนวนเงิน"); return; }
    setSubmitting(true);
    let slipBase64: string | undefined;
    let slipMimeType: string | undefined;
    if (slipFile) {
      const buf = await slipFile.arrayBuffer();
      slipBase64 = btoa(Array.from(new Uint8Array(buf)).map((b) => String.fromCharCode(b)).join(""));
      slipMimeType = slipFile.type;
    }
    submitMutation.mutate({ amount: Number(amount), slipBase64, slipMimeType });
  };

  if (!isAuthenticated) return (
    <AppLayout>
      <div className="max-w-lg mx-auto px-4 py-16 text-center">
        <Wallet className="w-16 h-16 text-purple-300 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-gray-700 mb-2">เข้าสู่ระบบก่อน</h2>
        <p className="text-gray-500 text-sm mb-6">กรุณาเข้าสู่ระบบเพื่อเติมเงิน</p>
        <Button className="gradient-purple text-white btn-scale" onClick={() => startLogin()}>เข้าสู่ระบบ</Button>
      </div>
    </AppLayout>
  );

  return (
    <AppLayout>
      <div className="max-w-lg mx-auto px-4 py-4">
        <h1 className="text-xl font-black text-gray-800 mb-1">เติมเงิน</h1>
        <p className="text-sm text-gray-500 mb-4">อัพโหลดสลิปโอนเงิน admin จะอนุมัติภายใน 30 นาที</p>

        {/* Balance Card */}
        <div className="gradient-purple rounded-2xl p-5 mb-5 text-white shadow-lg">
          <p className="text-purple-200 text-sm mb-1">ยอดเงินคงเหลือ</p>
          <p className="text-4xl font-black">฿{Number(me?.balance ?? 0).toFixed(2)}</p>
          <p className="text-purple-300 text-xs mt-1">{me?.name ?? "ผู้ใช้"}</p>
        </div>

        {/* Top Up Form */}
        <div className="bg-white rounded-2xl shadow-sm border border-purple-100 p-5 mb-5">
          <h2 className="font-bold text-gray-800 mb-3">แบบฟอร์มเติมเงิน</h2>
          {/* Preset amounts */}
          <div className="grid grid-cols-3 gap-2 mb-4">
            {PRESET_AMOUNTS.map((a) => (
              <button
                key={a}
                onClick={() => setAmount(String(a))}
                className={cn("py-2 rounded-xl text-sm font-bold transition-all btn-scale border",
                  amount === String(a) ? "gradient-purple text-white border-transparent shadow-sm" : "border-purple-200 text-purple-700 hover:bg-purple-50")}
              >
                ฿{a}
              </button>
            ))}
          </div>
          <div className="mb-4">
            <label className="text-xs font-semibold text-gray-600 mb-1 block">จำนวนเงิน (บาท)</label>
            <Input
              type="number"
              placeholder="ระบุจำนวนเงิน"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="border-purple-200 focus:ring-purple-400"
            />
          </div>
          {/* Slip Upload */}
          <div className="mb-4">
            <label className="text-xs font-semibold text-gray-600 mb-1 block">สลิปโอนเงิน (ไม่บังคับ)</label>
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
            {slipPreview ? (
              <div className="relative">
                <img src={slipPreview} alt="slip" className="w-full max-h-48 object-contain rounded-xl border border-purple-200" />
                <button onClick={() => { setSlipFile(null); setSlipPreview(null); }} className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">×</button>
              </div>
            ) : (
              <button
                onClick={() => fileRef.current?.click()}
                className="w-full border-2 border-dashed border-purple-200 rounded-xl p-6 flex flex-col items-center gap-2 text-purple-400 hover:border-purple-400 hover:bg-purple-50 transition-colors"
              >
                <Upload className="w-6 h-6" />
                <span className="text-sm font-medium">อัพโหลดสลิป</span>
              </button>
            )}
          </div>
          {/* Bank Info */}
          <div className="bg-purple-50 rounded-xl p-3 mb-4">
            <p className="text-xs font-bold text-purple-700 mb-1">ข้อมูลบัญชีรับโอน</p>
            <p className="text-xs text-gray-600">ธนาคาร: พร้อมเพย์</p>
            <p className="text-xs text-gray-600">เลขบัญชี: 0XX-XXX-XXXX</p>
            <p className="text-xs text-gray-500 mt-1">* กรุณาโอนตามจำนวนที่ระบุ แล้วอัพโหลดสลิป</p>
          </div>
          <Button
            className="w-full gradient-purple text-white font-bold py-3 rounded-2xl btn-scale shadow-lg"
            disabled={submitting || !amount}
            onClick={handleSubmit}
          >
            {submitting ? "กำลังส่ง..." : "ส่งคำขอเติมเงิน"}
          </Button>
        </div>

        {/* History */}
        <div className="bg-white rounded-2xl shadow-sm border border-purple-100 overflow-hidden">
          <div className="p-4 border-b border-purple-50">
            <h2 className="font-bold text-gray-800 text-sm">ประวัติการเติมเงิน</h2>
          </div>
          <div className="divide-y divide-purple-50">
            {topups?.length ? topups.map((t) => {
              const cfg = STATUS_CONFIG[t.status];
              return (
                <div key={t.id} className="flex items-center gap-3 px-4 py-3">
                  <div className={cn("w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0", cfg.color)}>
                    <cfg.icon className="w-4 h-4" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-gray-800">฿{Number(t.amount).toFixed(2)}</p>
                    <p className="text-[10px] text-gray-400">{new Date(t.createdAt).toLocaleString("th-TH")}</p>
                    {t.note && <p className="text-[10px] text-gray-500 mt-0.5">{t.note}</p>}
                  </div>
                  <span className={cn("text-[10px] font-bold px-2 py-0.5 rounded-full", cfg.color)}>{cfg.label}</span>
                </div>
              );
            }) : (
              <div className="py-8 text-center text-gray-400 text-sm">ยังไม่มีประวัติ</div>
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
