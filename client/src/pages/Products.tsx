import AppLayout from "@/components/AppLayout";
import { trpc } from "@/lib/trpc";
import { useState } from "react";
import { Link } from "wouter";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Search, Package } from "lucide-react";

const STREAMING_ICONS: Record<string, string> = {
  netflix: "🎬", disney: "🏰", youtube: "▶️", hbo: "🎭", viu: "📱",
  prime: "📦", spotify: "🎵", bilibili: "📺", iqiyi: "🎞️", wetv: "🌊",
  monomax: "🎥", trueID: "📡", aisplay: "📶", default: "📺",
};

function getIcon(name: string) {
  const lower = name.toLowerCase();
  for (const [key, icon] of Object.entries(STREAMING_ICONS)) {
    if (lower.includes(key)) return icon;
  }
  return STREAMING_ICONS.default;
}

export default function Products() {
  const { data: categories } = trpc.categories.list.useQuery();
  const [selectedCat, setSelectedCat] = useState<number | undefined>();
  const [search, setSearch] = useState("");
  const { data: products, isLoading } = trpc.products.listWithStock.useQuery();

  const filtered = products?.filter((p) => {
    const matchCat = selectedCat ? p.categoryId === selectedCat : true;
    const matchSearch = search ? p.name.toLowerCase().includes(search.toLowerCase()) : true;
    return matchCat && matchSearch;
  });

  return (
    <AppLayout>
      <div className="max-w-2xl mx-auto px-4 py-4">
        <h1 className="text-xl font-black text-gray-800 mb-1">สินค้าทั้งหมด</h1>
        <p className="text-sm text-gray-500 mb-4">เลือกแพ็กเกจที่ต้องการ ระบบส่งอัตโนมัติทันที</p>
        {/* Search */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="ค้นหาสินค้า..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 border-purple-200 focus:ring-purple-400"
          />
        </div>
        {/* Category Tabs */}
        {categories && categories.length > 0 && (
          <div className="flex gap-2 overflow-x-auto pb-2 mb-4 scrollbar-hide">
            <button
              onClick={() => setSelectedCat(undefined)}
              className={cn("px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all btn-scale flex-shrink-0",
                !selectedCat ? "gradient-purple text-white shadow-sm" : "bg-purple-50 text-purple-600 hover:bg-purple-100")}
            >
              ทั้งหมด
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCat(cat.id)}
                className={cn("px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all btn-scale flex-shrink-0",
                  selectedCat === cat.id ? "gradient-purple text-white shadow-sm" : "bg-purple-50 text-purple-600 hover:bg-purple-100")}
              >
                {cat.icon} {cat.name}
              </button>
            ))}
          </div>
        )}
        {/* Products Grid */}
        {isLoading ? (
          <div className="grid grid-cols-2 gap-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="bg-white rounded-2xl p-4 shadow-sm border border-purple-50 animate-pulse">
                <div className="w-16 h-16 rounded-xl bg-purple-100 mx-auto mb-3" />
                <div className="h-3 bg-purple-100 rounded mb-2" />
                <div className="h-3 bg-purple-50 rounded w-2/3 mx-auto" />
              </div>
            ))}
          </div>
        ) : filtered?.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <Package className="w-12 h-12 mx-auto mb-3 text-purple-200" />
            <p className="font-semibold">ไม่พบสินค้า</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {filtered?.map((product) => {
              const discount = product.originalPrice
                ? Math.round((1 - Number(product.price) / Number(product.originalPrice)) * 100) : 0;
              return (
                <Link key={product.id} href={`/products/${product.id}`}>
                  <div className="bg-white rounded-2xl p-4 shadow-sm border border-purple-50 cursor-pointer card-hover">
                    {discount > 0 && (
                      <Badge className="bg-red-500 text-white text-[10px] mb-2 px-1.5">-{discount}%</Badge>
                    )}
                    <div className="w-16 h-16 rounded-xl bg-purple-50 flex items-center justify-center mx-auto mb-3 overflow-hidden">
                      {product.imageUrl ? (
                        <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover rounded-xl" />
                      ) : (
                        <span className="text-3xl">{getIcon(product.name)}</span>
                      )}
                    </div>
                    <p className="text-xs font-bold text-gray-800 text-center line-clamp-2 mb-2 leading-tight">{product.name}</p>
                    <div className="text-center">
                      <span className="text-purple-700 font-black text-base">฿{Number(product.price).toFixed(0)}</span>
                      {product.originalPrice && (
                        <span className="text-gray-400 text-xs line-through ml-1">฿{Number(product.originalPrice).toFixed(0)}</span>
                      )}
                    </div>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-[10px] text-gray-400">ขายแล้ว {product.soldCount}</span>
                      <span className={cn("text-[10px] font-semibold", product.stockCount > 0 ? "text-green-600" : "text-red-500")}>
                        {product.stockCount > 0 ? `เหลือ ${product.stockCount}` : "หมด"}
                      </span>
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
