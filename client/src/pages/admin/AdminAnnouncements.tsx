import AdminLayout from "./AdminLayout";
import { trpc } from "@/lib/trpc";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Plus, Edit, Bell } from "lucide-react";
import { cn } from "@/lib/utils";

type AnnForm = { id?: number; title: string; content: string; type: "news" | "promotion" | "maintenance" | "update"; imageUrl: string; isActive: boolean };
const EMPTY: AnnForm = { title: "", content: "", type: "news", imageUrl: "", isActive: true };
const TYPE_OPTIONS = [
  { value: "news", label: "ข่าวสาร" },
  { value: "promotion", label: "โปรโมชัน" },
  { value: "maintenance", label: "ปิดปรับปรุง" },
  { value: "update", label: "อัปเดต" },
];
const TYPE_COLOR: Record<string, string> = {
  news: "bg-blue-100 text-blue-700", promotion: "bg-green-100 text-green-700",
  maintenance: "bg-red-100 text-red-700", update: "bg-purple-100 text-purple-700",
};

export default function AdminAnnouncements() {
  const { data: announcements } = trpc.admin.allAnnouncements.useQuery();
  const [form, setForm] = useState<AnnForm>(EMPTY);
  const [editing, setEditing] = useState(false);
  const utils = trpc.useUtils();

  const upsertMutation = trpc.admin.upsertAnnouncement.useMutation({
    onSuccess: () => { toast.success("บันทึกสำเร็จ"); setForm(EMPTY); setEditing(false); utils.admin.allAnnouncements.invalidate(); utils.announcements.list.invalidate(); },
    onError: (e) => toast.error(e.message),
  });

  return (
    <AdminLayout>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-black text-gray-800">ประกาศข่าวสาร</h1>
        <Button className="gradient-purple text-white btn-scale text-sm" onClick={() => { setForm(EMPTY); setEditing(true); }}>
          <Plus className="w-4 h-4 mr-1" /> เพิ่มประกาศ
        </Button>
      </div>

      {editing && (
        <div className="bg-white rounded-2xl shadow-sm border border-purple-100 p-5 mb-5">
          <h2 className="font-bold text-gray-800 mb-4">{form.id ? "แก้ไขประกาศ" : "เพิ่มประกาศใหม่"}</h2>
          <div className="space-y-3">
            <div>
              <label className="text-xs font-semibold text-gray-600 mb-1 block">หัวข้อ *</label>
              <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="หัวข้อประกาศ" />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-600 mb-1 block">ประเภท</label>
              <select className="w-full border border-purple-200 rounded-lg px-3 py-2 text-sm" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value as AnnForm["type"] })}>
                {TYPE_OPTIONS.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-600 mb-1 block">เนื้อหา *</label>
              <textarea className="w-full border border-purple-200 rounded-xl p-3 text-sm h-28 resize-none focus:outline-none focus:ring-2 focus:ring-purple-400" placeholder="เนื้อหาประกาศ..." value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-600 mb-1 block">URL รูปภาพ</label>
              <Input value={form.imageUrl} onChange={(e) => setForm({ ...form, imageUrl: e.target.value })} placeholder="https://..." />
            </div>
            <div className="flex items-center gap-2">
              <input type="checkbox" id="annActive" checked={form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.checked })} className="w-4 h-4 accent-purple-600" />
              <label htmlFor="annActive" className="text-sm text-gray-700">เผยแพร่</label>
            </div>
          </div>
          <div className="flex gap-2 mt-4">
            <Button className="gradient-purple text-white btn-scale" onClick={() => upsertMutation.mutate({ ...form, imageUrl: form.imageUrl || undefined })}>บันทึก</Button>
            <Button variant="outline" onClick={() => setEditing(false)}>ยกเลิก</Button>
          </div>
        </div>
      )}

      <div className="space-y-3">
        {announcements?.map((ann) => (
          <div key={ann.id} className="bg-white rounded-2xl shadow-sm border border-purple-50 p-4">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-full gradient-purple flex items-center justify-center flex-shrink-0"><Bell className="w-4 h-4 text-white" /></div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className={cn("text-[10px] font-bold px-1.5 py-0.5 rounded-full", TYPE_COLOR[ann.type])}>{TYPE_OPTIONS.find((t) => t.value === ann.type)?.label}</span>
                  <span className={cn("text-[10px] font-bold px-1.5 py-0.5 rounded-full", ann.isActive ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500")}>{ann.isActive ? "เผยแพร่" : "ซ่อน"}</span>
                </div>
                <p className="text-sm font-bold text-gray-800">{ann.title}</p>
                <p className="text-xs text-gray-500 line-clamp-2 mt-0.5">{ann.content}</p>
              </div>
              <button onClick={() => { setForm({ id: ann.id, title: ann.title, content: ann.content, type: ann.type as AnnForm["type"], imageUrl: ann.imageUrl ?? "", isActive: ann.isActive }); setEditing(true); }} className="p-1.5 text-purple-500 hover:bg-purple-50 rounded-lg"><Edit className="w-4 h-4" /></button>
            </div>
          </div>
        ))}
      </div>
    </AdminLayout>
  );
}
