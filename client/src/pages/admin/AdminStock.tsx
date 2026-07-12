import AdminLayout from "./AdminLayout";
import { trpc } from "@/lib/trpc";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Archive, Plus } from "lucide-react";
import { cn } from "@/lib/utils";

export default function AdminStock() {
  const { data: products } = trpc.admin.allProducts.useQuery();
  const [selectedProduct, setSelectedProduct] = useState<number | null>(null);
  const { data: stockItems } = trpc.admin.getStock.useQuery({ productId: selectedProduct! }, { enabled: !!selectedProduct });
  const [bulkText, setBulkText] = useState("");
  const utils = trpc.useUtils();

  const addStockMutation = trpc.admin.addStock.useMutation({
    onSuccess: (count) => {
      toast.success(`เพิ่มสต็อก ${count} รายการสำเร็จ`);
      setBulkText("");
      utils.admin.getStock.invalidate({ productId: selectedProduct! });
      utils.products.listWithStock.invalidate();
    },
    onError: (e) => toast.error(e.message),
  });

  const handleAddStock = () => {
    if (!selectedProduct) { toast.error("กรุณาเลือกสินค้า"); return; }
    const items = bulkText.split("\n").map((s) => s.trim()).filter(Boolean);
    if (!items.length) { toast.error("กรุณาระบุข้อมูลสต็อก"); return; }
    addStockMutation.mutate({ productId: selectedProduct, items });
  };

  return (
    <AdminLayout>
      <h1 className="text-xl font-black text-gray-800 mb-4">จัดการสต็อก</h1>
      <div className="grid md:grid-cols-2 gap-4">
        {/* Select Product */}
        <div className="bg-white rounded-2xl shadow-sm border border-purple-50 p-4">
          <h2 className="font-bold text-gray-800 mb-3 text-sm">เลือกสินค้า</h2>
          <div className="space-y-2 max-h-80 overflow-y-auto">
            {products?.map((p) => (
              <button
                key={p.id}
                onClick={() => setSelectedProduct(p.id)}
                className={cn("w-full flex items-center gap-3 p-3 rounded-xl text-left transition-all",
                  selectedProduct === p.id ? "gradient-purple text-white" : "bg-purple-50 hover:bg-purple-100 text-gray-700")}
              >
                <Archive className="w-4 h-4 flex-shrink-0" />
                <span className="text-sm font-medium truncate">{p.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Add Stock */}
        <div className="bg-white rounded-2xl shadow-sm border border-purple-50 p-4">
          <h2 className="font-bold text-gray-800 mb-3 text-sm">
            เพิ่มสต็อก {selectedProduct ? `(${products?.find((p) => p.id === selectedProduct)?.name})` : ""}
          </h2>
          <p className="text-xs text-gray-500 mb-2">ใส่ account:password หรือข้อมูลสินค้า 1 รายการต่อบรรทัด</p>
          <textarea
            className="w-full border border-purple-200 rounded-xl p-3 text-sm font-mono h-40 resize-none focus:outline-none focus:ring-2 focus:ring-purple-400"
            placeholder={"email@example.com:password123\nemail2@example.com:password456"}
            value={bulkText}
            onChange={(e) => setBulkText(e.target.value)}
          />
          <Button className="w-full gradient-purple text-white mt-3 btn-scale" onClick={handleAddStock} disabled={!selectedProduct}>
            <Plus className="w-4 h-4 mr-1" /> เพิ่มสต็อก
          </Button>
        </div>
      </div>

      {/* Stock List */}
      {selectedProduct && stockItems && (
        <div className="bg-white rounded-2xl shadow-sm border border-purple-50 overflow-hidden mt-4">
          <div className="p-4 border-b border-purple-50 flex items-center justify-between">
            <h2 className="font-bold text-gray-800 text-sm">รายการสต็อก</h2>
            <span className="text-xs text-purple-600 font-semibold">ทั้งหมด {stockItems.length} รายการ</span>
          </div>
          <div className="divide-y divide-purple-50 max-h-64 overflow-y-auto">
            {stockItems.map((item) => (
              <div key={item.id} className="flex items-center gap-3 px-4 py-2.5">
                <div className={cn("w-2 h-2 rounded-full flex-shrink-0", item.isSold ? "bg-red-400" : "bg-green-400")} />
                <span className="text-xs font-mono text-gray-700 flex-1 truncate">{item.accountData}</span>
                <span className={cn("text-[10px] font-bold px-1.5 py-0.5 rounded-full", item.isSold ? "bg-red-100 text-red-600" : "bg-green-100 text-green-600")}>
                  {item.isSold ? "ขายแล้ว" : "พร้อมขาย"}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
