import AppLayout from "@/components/AppLayout";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { startLogin } from "@/const";
import { useParams, useLocation } from "wouter";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { ShoppingCart, ArrowLeft, Package, Zap, Shield, Clock } from "lucide-react";
import { Link } from "wouter";
import { cn } from "@/lib/utils";

export default function ProductDetail() {
  const params = useParams<{ id: string }>();
  const id = parseInt(params.id ?? "0");
  const [, navigate] = useLocation();
  const { isAuthenticated } = useAuth();
  const { data: me } = trpc.auth.me.useQuery();
  const { data: product, isLoading } = trpc.products.get.useQuery({ id });
  const { data: flashSales } = trpc.flashSales.active.useQuery();
  const utils = trpc.useUtils();
  const [buying, setBuying] = useState(false);
  const [result, setResult] = useState<{ orderId: number; accountDelivered: string } | null>(null);

  const buyMutation = trpc.orders.buy.useMutation({
    onSuccess: (data) => {
      setResult(data);
      utils.auth.me.invalidate();
      utils.products.get.invalidate({ id });
      toast.success("ซื้อสำเร็จ! ได้รับสินค้าแล้ว");
      setBuying(false);
    },
    onError: (err) => {
      toast.error(err.message);
      setBuying(false);
    },
  });

  if (isLoading) return (
    <AppLayout>
      <div className="max-w-lg mx-auto px-4 py-8 animate-pulse">
        <div className="w-full h-48 bg-purple-100 rounded-2xl mb-4" />
        <div className="h-6 bg-purple-100 rounded mb-2" />
        <div className="h-4 bg-purple-50 rounded w-2/3" />
      </div>
    </AppLayout>
  );

  if (!product) return (
    <AppLayout>
      <div className="text-center py-16 text-gray-400">ไม่พบสินค้า</div>
    </AppLayout>
  );

  const activeSale = flashSales?.find((fs) => fs.productId === id);
  const price = activeSale ? Number(activeSale.salePrice) : Number(product.price);
  const discount = product.originalPrice
    ? Math.round((1 - price / Number(product.originalPrice)) * 100) : 0;
  const canBuy = isAuthenticated && product.stockCount > 0 && Number(me?.balance ?? 0) >= price;

  return (
    <AppLayout>
      <div className="max-w-lg mx-auto px-4 py-4">
        <Link href="/products">
          <button className="flex items-center gap-1.5 text-purple-600 text-sm font-semibold mb-4 hover:underline">
            <ArrowLeft className="w-4 h-4" /> กลับ
          </button>
        </Link>

        {/* Product Card */}
        <div className="bg-white rounded-3xl shadow-sm border border-purple-100 overflow-hidden mb-4">
          <div className="gradient-hero p-8 flex items-center justify-center">
            {product.imageUrl ? (
              <img src={product.imageUrl} alt={product.name} className="w-24 h-24 object-cover rounded-2xl shadow-lg" />
            ) : (
              <div className="w-24 h-24 rounded-2xl bg-white/20 flex items-center justify-center text-5xl">📺</div>
            )}
          </div>
          <div className="p-5">
            {discount > 0 && <Badge className="bg-red-500 text-white mb-2">-{discount}% ลดราคา</Badge>}
            {activeSale && <Badge className="bg-yellow-400 text-purple-900 mb-2 ml-1"><Zap className="w-3 h-3 mr-1" />Flash Sale</Badge>}
            <h1 className="text-lg font-black text-gray-800 mb-1">{product.name}</h1>
            {product.description && <p className="text-sm text-gray-500 mb-3">{product.description}</p>}
            <div className="flex items-baseline gap-2 mb-4">
              <span className="text-3xl font-black text-purple-700">฿{price.toFixed(0)}</span>
              {product.originalPrice && (
                <span className="text-gray-400 text-sm line-through">฿{Number(product.originalPrice).toFixed(0)}</span>
              )}
            </div>
            <div className="grid grid-cols-3 gap-2 mb-4">
              <div className="bg-purple-50 rounded-xl p-2 text-center">
                <Package className="w-4 h-4 text-purple-600 mx-auto mb-1" />
                <p className="text-[10px] text-gray-500">สต็อก</p>
                <p className={cn("text-xs font-bold", product.stockCount > 0 ? "text-green-600" : "text-red-500")}>
                  {product.stockCount > 0 ? product.stockCount : "หมด"}
                </p>
              </div>
              <div className="bg-purple-50 rounded-xl p-2 text-center">
                <Zap className="w-4 h-4 text-purple-600 mx-auto mb-1" />
                <p className="text-[10px] text-gray-500">ส่งสินค้า</p>
                <p className="text-xs font-bold text-purple-700">อัตโนมัติ</p>
              </div>
              <div className="bg-purple-50 rounded-xl p-2 text-center">
                <Shield className="w-4 h-4 text-purple-600 mx-auto mb-1" />
                <p className="text-[10px] text-gray-500">รับประกัน</p>
                <p className="text-xs font-bold text-purple-700">มี</p>
              </div>
            </div>

            {/* Balance info */}
            {isAuthenticated && me && (
              <div className="bg-purple-50 rounded-xl p-3 mb-4 flex justify-between items-center">
                <span className="text-sm text-gray-600">ยอดเงินของคุณ</span>
                <span className={cn("font-bold text-sm", Number(me.balance) >= price ? "text-green-600" : "text-red-500")}>
                  ฿{Number(me.balance).toFixed(2)}
                </span>
              </div>
            )}

            {/* Buy Button */}
            {result ? (
              <div className="bg-green-50 border border-green-200 rounded-2xl p-4 mb-3">
                <p className="text-green-700 font-bold text-sm mb-2">✅ ซื้อสำเร็จ! นี่คือข้อมูลสินค้าของคุณ</p>
                <div className="bg-white rounded-xl p-3 font-mono text-sm text-gray-800 break-all border border-green-100">
                  {result.accountDelivered}
                </div>
                <Link href="/orders">
                  <button className="mt-2 text-xs text-purple-600 font-semibold hover:underline">ดูในประวัติออเดอร์ →</button>
                </Link>
              </div>
            ) : isAuthenticated ? (
              <Button
                className="w-full gradient-purple text-white font-bold py-3 rounded-2xl btn-scale shadow-lg"
                disabled={!canBuy || buying}
                onClick={() => { setBuying(true); buyMutation.mutate({ productId: id }); }}
              >
                {buying ? (
                  <span className="flex items-center gap-2"><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />กำลังดำเนินการ...</span>
                ) : product.stockCount === 0 ? "สินค้าหมดสต็อก" :
                  Number(me?.balance ?? 0) < price ? `ยอดเงินไม่พอ (ต้องการ ฿${price})` :
                  <span className="flex items-center gap-2"><ShoppingCart className="w-4 h-4" />ซื้อเลย ฿{price.toFixed(0)}</span>
                }
              </Button>
            ) : (
              <Button
                className="w-full gradient-purple text-white font-bold py-3 rounded-2xl btn-scale"
                onClick={() => startLogin()}
              >
                เข้าสู่ระบบเพื่อซื้อ
              </Button>
            )}
            {isAuthenticated && Number(me?.balance ?? 0) < price && product.stockCount > 0 && (
              <Link href="/topup">
                <button className="w-full mt-2 text-center text-xs text-purple-600 font-semibold hover:underline">เติมเงินเพิ่ม →</button>
              </Link>
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
