import { useAuth } from "@/_core/hooks/useAuth";
import { Home, ShoppingBag, Bell, Wallet, User } from "lucide-react";
import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/", icon: Home, label: "หน้าหลัก" },
  { href: "/products", icon: ShoppingBag, label: "สินค้า" },
  { href: "/topup", icon: Wallet, label: "เติมเงิน" },
  { href: "/announcements", icon: Bell, label: "ข่าวสาร" },
  { href: "/profile", icon: User, label: "บัญชี" },
];

export default function BottomNav() {
  const [location] = useLocation();
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-purple-100 safe-bottom md:hidden">
      <div className="flex items-center justify-around h-16">
        {navItems.map((item) => {
          const active = location === item.href || (item.href !== "/" && location.startsWith(item.href));
          return (
            <Link key={item.href} href={item.href}>
              <button
                className={cn(
                  "flex flex-col items-center gap-0.5 px-3 py-1 rounded-xl transition-all duration-200 btn-scale",
                  active
                    ? "text-purple-600"
                    : "text-gray-400 hover:text-purple-400"
                )}
              >
                <item.icon
                  className={cn("w-5 h-5 transition-all", active && "scale-110")}
                  strokeWidth={active ? 2.5 : 1.8}
                />
                <span className={cn("text-[10px] font-medium", active && "font-semibold")}>
                  {item.label}
                </span>
                {active && (
                  <span className="absolute bottom-0 w-8 h-0.5 rounded-full bg-purple-600" />
                )}
              </button>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
