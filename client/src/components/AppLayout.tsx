import BottomNav from "./BottomNav";
import TopNav from "./TopNav";

interface AppLayoutProps {
  children: React.ReactNode;
  hideBottomNav?: boolean;
}

export default function AppLayout({ children, hideBottomNav }: AppLayoutProps) {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <TopNav />
      <main className={hideBottomNav ? "flex-1" : "flex-1 pb-nav md:pb-0"}>
        {children}
      </main>
      {!hideBottomNav && <BottomNav />}
    </div>
  );
}

