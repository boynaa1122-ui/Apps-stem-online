import { useAuth } from "@/_core/hooks/useAuth";
import { startLogin } from "@/const";
import { trpc } from "@/lib/trpc";
import { Bell, LogIn, Menu, ShoppingBag, Wallet, X } from "lucide-react";
import { useState } from "react";
import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export default function TopNav() {
  const { user, isAuthenticated } = useAuth();
  const { data: me } = trpc.auth.me.useQuery();
  const [menuOpen, setMenuOpen] = useState(false);
  const [location] = useLocation();

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur border-b border-purple-100 shadow-sm">
      <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between gap-3">
        {/* Logo */}
        <Link href="/">
          <div className="flex items-center gap-2 cursor-pointer">
            <div className="w-8 h-8 rounded-xl gradient-purple flex items-center justify-center shadow-sm">
              <ShoppingBag className="w-4 h-4 text-white" />
            </div>
            <div className="hidden sm:block">
              <span className="font-bold text-purple-700 text-sm leading-none block">GaFiwSHOP</span>
              <span className="text-[10px] text-purple-400 leading-none">Streaming ราคาถูก</span>
            </div>
          </div>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-1">
          {[
            { href: "/", label: "หน้าแรก" },
            { href: "/products", label: "สินค้า" },
            { href: "/announcements", label: "ข่าวสาร" },
          ].map((item) => (
            <Link key={item.href} href={item.href}>
              <button
                className={cn(
                  "px-3 py-1.5 rounded-lg text-sm font-medium transition-colors",
                  location === item.href
                    ? "bg-purple-100 text-purple-700"
                    : "text-gray-600 hover:bg-purple-50 hover:text-purple-600"
                )}
              >
                {item.label}
              </button>
            </Link>
          ))}
        </nav>

        {/* Right side */}
        <div className="flex items-center gap-2">
          {isAuthenticated && me ? (
            <>
              <Link href="/topup">
                <button className="hidden sm:flex items-center gap-1.5 bg-purple-50 hover:bg-purple-100 text-purple-700 px-3 py-1.5 rounded-lg text-sm font-semibold transition-colors btn-scale">
                  <Wallet className="w-3.5 h-3.5" />
                  ฿{Number(me.balance).toFixed(2)}
                </button>
              </Link>
              <Link href="/profile">
                <div className="w-8 h-8 rounded-full gradient-purple flex items-center justify-center cursor-pointer shadow-sm">
                  <span className="text-white text-xs font-bold">
                    {(me.name ?? "U").charAt(0).toUpperCase()}
                  </span>
                </div>
              </Link>
            </>
          ) : (
            <Button
              size="sm"
              className="gradient-purple text-white border-0 btn-scale text-xs"
              onClick={() => startLogin()}
            >
              <LogIn className="w-3.5 h-3.5 mr-1" />
              เข้าสู่ระบบ
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
