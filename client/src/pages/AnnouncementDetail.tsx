import AppLayout from "@/components/AppLayout";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { useParams } from "wouter";
import { Link } from "wouter";
import { ArrowLeft, Heart, Eye } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const TYPE_CONFIG: Record<string, { label: string; color: string }> = {
  news: { label: "ข่าวสาร", color: "bg-blue-100 text-blue-700" },
  promotion: { label: "โปรโมชัน", color: "bg-green-100 text-green-700" },
  maintenance: { label: "ปิดปรับปรุง", color: "bg-red-100 text-red-700" },
  update: { label: "อัปเดต", color: "bg-purple-100 text-purple-700" },
};

export default function AnnouncementDetail() {
  const params = useParams<{ id: string }>();
  const id = parseInt(params.id ?? "0");
  const { isAuthenticated } = useAuth();
  const { data: ann, isLoading } = trpc.announcements.get.useQuery({ id });
  const utils = trpc.useUtils();
  const likeMutation = trpc.announcements.like.useMutation({
    onSuccess: () => { utils.announcements.get.invalidate({ id }); toast.success("ถูกใจแล้ว!"); },
  });
  if (isLoading) return <AppLayout><div className="max-w-lg mx-auto px-4 py-8 animate-pulse"><div className="h-8 bg-purple-100 rounded mb-4" /><div className="h-4 bg-purple-50 rounded mb-2" /></div></AppLayout>;
  if (!ann) return <AppLayout><div className="text-center py-16 text-gray-400">ไม่พบประกาศ</div></AppLayout>;
  const t = TYPE_CONFIG[ann.type] ?? TYPE_CONFIG.news;
  return (
    <AppLayout>
      <div className="max-w-lg mx-auto px-4 py-4">
        <Link href="/announcements"><button className="flex items-center gap-1.5 text-purple-600 text-sm font-semibold mb-4 hover:underline"><ArrowLeft className="w-4 h-4" /> กลับ</button></Link>
        <div className="bg-white rounded-3xl shadow-sm border border-purple-100 overflow-hidden">
          {ann.imageUrl && <img src={ann.imageUrl} alt="" className="w-full h-48 object-cover" />}
          <div className="p-5">
            <div className="flex items-center gap-2 mb-3">
              <span className={cn("text-xs font-bold px-2 py-0.5 rounded-full", t.color)}>{t.label}</span>
              <span className="text-xs text-gray-400">{new Date(ann.createdAt).toLocaleDateString("th-TH")}</span>
            </div>
            <h1 className="text-xl font-black text-gray-800 mb-3">{ann.title}</h1>
            <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-wrap">{ann.content}</p>
            <div className="flex items-center gap-4 mt-5 pt-4 border-t border-purple-50">
              <button
                onClick={() => isAuthenticated ? likeMutation.mutate({ id }) : toast.error("กรุณาเข้าสู่ระบบก่อน")}
                className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-red-500 transition-colors btn-scale"
              >
                <Heart className="w-4 h-4" /> {ann.likes}
              </button>
              <span className="flex items-center gap-1.5 text-sm text-gray-400"><Eye className="w-4 h-4" /> {ann.views}</span>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}

