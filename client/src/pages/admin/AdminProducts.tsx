import AdminLayout from "./AdminLayout";
import { trpc } from "@/lib/trpc";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Plus, Edit, Trash2, Package } from "lucide-react";
import { cn } from "@/lib/utils";

type ProductForm = {
  id?: number; categoryId: number; name: string; description: string;
  price: string; originalPrice: string; imageUrl: string; isActive: boolean; sortOrder: number;
};
const EMPTY_FORM: ProductForm = { categoryId: 1, name: "", description: "", price: "", originalPrice: "", imageUrl: "", isActive: true, sortOrder: 0 };

export default function AdminProducts() {
  const { data: products, refetch } = trpc.admin.allProducts.useQuery();
  const { data: categories } = trpc.categories.list.useQuery();
  const [form, setForm] = useState<ProductForm>(EMPTY_FORM);
  const [editing, setEditing] = useState(false);
  const utils = trpc.useUtils();

  const upsertMutation = trpc.admin.upsertProduct.useMutation({
    onSuccess: () => { toast.success("บันทึกสำเร็จ"); setForm(EMPTY_FORM); setEditing(false); utils.admin.allProducts.invalidate(); utils.products.listWithStock.invalidate(); },
    onError: (e) => toast.error(e.message),
  });
  const deleteMutation = trpc.admin.deleteProduct.useMutation({
    onSuccess: () => { toast.success("ลบสำเร็จ"); utils.admin.allProducts.invalidate(); },
    onError: (e) => toast.error(e.message),
  });

  const handleEdit = (p: any) => {
    setForm({ id: p.id, categoryId: p.categoryId, name: p.name, description: p.description ?? "", price: String(p.price), originalPrice: String(p.originalPrice ?? ""), imageUrl: p.imageUrl ?? "", isActive: p.isActive, sortOrder: p.sortOrder });
    setEditing(true);
  };

  return (
    <AdminLayout>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-black text-gray-800">จัดการสินค้า</h1>
        <Button className="gradient-purple text-white btn-scale text-sm" onClick={() => { setForm(EMPTY_FORM); setEditing(true); }}>
          <Plus className="w-4 h-4 mr-1" /> เพิ่มสินค้า
        </Button>
      </div>

      {/* Form */}
      {editing && (
        <div className="bg-white rounded-2xl shadow-sm border border-purple-100 p-5 mb-5">
          <h2 className="font-bold text-gray-800 mb-4">{form.id ? "แก้ไขสินค้า" : "เพิ่มสินค้าใหม่"}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-gray-600 mb-1 block">ชื่อสินค้า *</label>
              <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Netflix Premium 30 วัน" />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-600 mb-1 block">หมวดหมู่</label>
              <select className="w-full border border-purple-200 rounded-lg px-3 py-2 text-sm" value={form.categoryId} onChange={(e) => setForm({ ...form, categoryId: Number(e.target.value) })}>
                {categories?.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-600 mb-1 block">ราคา (บาท) *</label>
              <Input type="number" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} placeholder="99" />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-600 mb-1 block">ราคาเดิม (บาท)</label>
              <Input type="number" value={form.originalPrice} onChange={(e) => setForm({ ...form, originalPrice: e.target.value })} placeholder="199" />
            </div>
            <div className="md:col-span-2">
              <label className="text-xs font-semibold text-gray-600 mb-1 block">คำอธิบาย</label>
              <Input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="รายละเอียดสินค้า" />
            </div>
            <div className="md:col-span-2">
              <label className="text-xs font-semibold text-gray-600 mb-1 block">URL รูปภาพ</label>
              <Input value={form.imageUrl} onChange={(e) => setForm({ ...form, imageUrl: e.target.value })} placeholder="https://..." />
            </div>
            <div className="flex items-center gap-2">
              <input type="checkbox" id="isActive" checked={form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.checked })} className="w-4 h-4 accent-purple-600" />
              <label htmlFor="isActive" className="text-sm text-gray-700">เปิดขาย</label>
            </div>
          </div>
          <div className="flex gap-2 mt-4">
            <Button className="gradient-purple text-white btn-scale" onClick={() => upsertMutation.mutate({ ...form, price: form.price, originalPrice: form.originalPrice || undefined, imageUrl: form.imageUrl || undefined, description: form.description || undefined })}>
              บันทึก
            </Button>
            <Button variant="outline" onClick={() => setEditing(false)}>ยกเลิก</Button>
          </div>
        </div>
      )}

      {/* Product List */}
      <div className="bg-white rounded-2xl shadow-sm border border-purple-50 overflow-hidden">
        <div className="divide-y divide-purple-50">
          {products?.length === 0 ? (
            <div className="py-12 text-center text-gray-400"><Package className="w-10 h-10 mx-auto mb-2 text-purple-200" /><p>ยังไม่มีสินค้า</p></div>
          ) : products?.map((p) => (
            <div key={p.id} className="flex items-center gap-3 px-4 py-3">
              <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center flex-shrink-0 overflow-hidden">
                {p.imageUrl ? <img src={p.imageUrl} alt="" className="w-full h-full object-cover rounded-xl" /> : <span className="text-xl">📺</span>}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-gray-800 truncate">{p.name}</p>
                <p className="text-xs text-purple-600 font-semibold">฿{Number(p.price).toFixed(0)}</p>
              </div>
              <span className={cn("text-[10px] font-bold px-2 py-0.5 rounded-full", p.isActive ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500")}>
                {p.isActive ? "เปิด" : "ปิด"}
              </span>
              <button onClick={() => handleEdit(p)} className="p-1.5 text-purple-500 hover:bg-purple-50 rounded-lg transition-colors"><Edit className="w-4 h-4" /></button>
              <button onClick={() => { if (confirm("ลบสินค้านี้?")) deleteMutation.mutate({ id: p.id }); }} className="p-1.5 text-red-400 hover:bg-red-50 rounded-lg transition-colors"><Trash2 className="w-4 h-4" /></button>
            </div>
          ))}
        </div>
      </div>
    </AdminLayout>
  );
}
