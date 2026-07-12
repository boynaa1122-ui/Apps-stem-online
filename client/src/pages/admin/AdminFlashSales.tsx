import AdminLayout from "./AdminLayout";
import { trpc } from "@/lib/trpc";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Plus, Zap } from "lucide-react";
import { cn } from "@/lib/utils";

type SaleForm = { id?: number; productId: number; salePrice: string; endAt: string; isActive: boolean };
const EMPTY: SaleForm = { productId: 0, salePrice: "", endAt: "", isActive: true };

export default function AdminFlashSales() {
  const { data: sales } = trpc.admin.allFlashSales.useQuery();
  const { data: products } = trpc.admin.allProducts.useQuery();
  const [form, setForm] = useState<SaleForm>(EMPTY);
  const [editing, setEditing] = useState(false);
  const utils = trpc.useUtils();

  const upsertMutation = trpc.admin.upsertFlashSale.useMutation({
    onSuccess: () => { toast.success("บันทึกสำเร็จ"); setForm(EMPTY); setEditing(false); utils.admin.allFlashSales.invalidate(); utils.flashSales.active.invalidate(); },
    onError: (e) => toast.error(e.message),
  });

  return (
    <AdminLayout>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-black text-gray-800">Flash Sale</h1>
        <Button className="gradient-purple text-white btn-scale text-sm" onClick={() => { setForm(EMPTY); setEditing(true); }}>
          <Plus className="w-4 h-4 mr-1" /> เพิ่ม Flash Sale
        </Button>
      </div>

      {editing && (
        <div className="bg-white rounded-2xl shadow-sm border border-purple-100 p-5 mb-5">
          <h2 className="font-bold text-gray-800 mb-4">ตั้งค่า Flash Sale</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-gray-600 mb-1 block">สินค้า *</label>
              <select className="w-full border border-purple-200 rounded-lg px-3 py-2 text-sm" value={form.productId} onChange={(e) => setForm({ ...form, productId: Number(e.target.value) })}>
                <option value={0}>-- เลือกสินค้า --</option>
                {products?.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-600 mb-1 block">ราคา Flash Sale (บาท) *</label>
              <Input type="number" value={form.salePrice} onChange={(e) => setForm({ ...form, salePrice: e.target.value })} placeholder="79" />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-600 mb-1 block">วันหมดอายุ *</label>
              <Input type="datetime-local" value={form.endAt} onChange={(e) => setForm({ ...form, endAt: e.target.value })} />
            </div>
            <div className="flex items-center gap-2 mt-5">
              <input type="checkbox" id="saleActive" checked={form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.checked })} className="w-4 h-4 accent-purple-600" />
              <label htmlFor="saleActive" className="text-sm text-gray-700">เปิดใช้งาน</label>
            </div>
          </div>
          <div className="flex gap-2 mt-4">
            <Button className="gradient-purple text-white btn-scale" onClick={() => { if (!form.productId || !form.salePrice || !form.endAt) { toast.error("กรุณากรอกข้อมูลให้ครบ"); return; } upsertMutation.mutate(form); }}>บันทึก</Button>
            <Button variant="outline" onClick={() => setEditing(false)}>ยกเลิก</Button>
          </div>
        </div>
      )}

      <div className="space-y-3">
        {sales?.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center text-gray-400 shadow-sm"><Zap className="w-10 h-10 mx-auto mb-2 text-purple-200" /><p>ยังไม่มี Flash Sale</p></div>
        ) : sales?.map((sale) => {
          const product = products?.find((p) => p.id === sale.productId);
          const isExpired = new Date(sale.endAt) < new Date();
          return (
            <div key={sale.id} className="bg-white rounded-2xl shadow-sm border border-purple-50 p-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-yellow-100 flex items-center justify-center"><Zap className="w-4 h-4 text-yellow-600" /></div>
                <div className="flex-1">
                  <p className="text-sm font-bold text-gray-800">{product?.name ?? `สินค้า #${sale.productId}`}</p>
                  <p className="text-xs text-purple-600 font-semibold">ราคา Flash: ฿{Number(sale.salePrice).toFixed(0)}</p>
                  <p className="text-[10px] text-gray-400">หมดอายุ: {new Date(sale.endAt).toLocaleString("th-TH")}</p>
                </div>
                <div className="flex flex-col gap-1 items-end">
                  <span className={cn("text-[10px] font-bold px-2 py-0.5 rounded-full", sale.isActive && !isExpired ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500")}>
                    {isExpired ? "หมดอายุ" : sale.isActive ? "กำลังใช้งาน" : "ปิด"}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </AdminLayout>
  );
}
