import AppLayout from "@/components/AppLayout";
import { trpc } from "@/lib/trpc";
import { Link } from "wouter";
import { Bell } from "lucide-react";
import { cn } from "@/lib/utils";

const TYPE_CONFIG: Record<string, { label: string; color: string }> = {
  news: { label: "ข่าวสาร", color: "bg-blue-100 text-blue-700" },
  promotion: { label: "โปรโมชัน", color: "bg-green-100 text-green-700" },
  maintenance: { label: "ปิดปรับปรุง", color: "bg-red-100 text-red-700" },
  update: { label: "อัปเดต", color: "bg-purple-100 text-purple-700" },
};

export default function Announcements() {
  const { data: announcements, isLoading } = trpc.announcements.list.useQuery({ limit: 50 });
  const timeAgo = (date: Date) => {
    const diff = Date.now() - new Date(date).getTime();
    const d = Math.floor(diff / 86400000);
    if (d < 1) return "วันนี้";
    if (d < 7) return `${d} วันที่แล้ว`;
    const w = Math.floor(d / 7);
    if (w < 4) return `${w} สัปดาห์ที่แล้ว`;
    return `${Math.floor(d / 30)} เดือนที่แล้ว`;
  };
  return (
    <AppLayout>
      <div className="max-w-2xl mx-auto px-4 py-4">
        <div className="flex items-center gap-2 mb-4">
          <h1 className="text-xl font-black text-gray-800">ประกาศข่าวสาร</h1>
          <span className="flex items-center gap-1 bg-green-100 text-green-700 text-[10px] font-bold px-2 py-0.5 rounded-full">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" /> LIVE
          </span>
        </div>
        {isLoading ? (
          <div className="space-y-3">{Array.from({ length: 4 }).map((_, i) => <div key={i} className="bg-white rounded-2xl p-4 h-24 animate-pulse shadow-sm" />)}</div>
        ) : announcements?.length === 0 ? (
          <div className="text-center py-16 text-gray-400"><Bell className="w-12 h-12 mx-auto mb-3 text-purple-200" /><p>ยังไม่มีประกาศ</p></div>
        ) : (
          <div className="space-y-3">
            {announcements?.map((ann) => {
              const t = TYPE_CONFIG[ann.type] ?? TYPE_CONFIG.news;
              return (
                <Link key={ann.id} href={`/announcements/${ann.id}`}>
                  <div className="bg-white rounded-2xl p-4 shadow-sm border border-purple-50 cursor-pointer hover:shadow-md transition-shadow">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-full gradient-purple flex items-center justify-center flex-shrink-0">
                        <Bell className="w-4 h-4 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <span className={cn("text-[10px] font-bold px-1.5 py-0.5 rounded-full", t.color)}>{t.label}</span>
                          <span className="text-[10px] text-gray-400">{timeAgo(ann.createdAt)}</span>
                          <span className="text-[10px] text-gray-400">👁 {ann.views}</span>
                        </div>
                        <p className="text-sm font-bold text-gray-800 line-clamp-1">{ann.title}</p>
                        <p className="text-xs text-gray-500 line-clamp-2 mt-0.5">{ann.content}</p>
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
