import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import Products from "./pages/Products";
import ProductDetail from "./pages/ProductDetail";
import TopUp from "./pages/TopUp";
import Orders from "./pages/Orders";
import Profile from "./pages/Profile";
import Announcements from "./pages/Announcements";
import AnnouncementDetail from "./pages/AnnouncementDetail";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminProducts from "./pages/admin/AdminProducts";
import AdminStock from "./pages/admin/AdminStock";
import AdminTopups from "./pages/admin/AdminTopups";
import AdminAnnouncements from "./pages/admin/AdminAnnouncements";
import AdminFlashSales from "./pages/admin/AdminFlashSales";
import AdminOrders from "./pages/admin/AdminOrders";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/products" component={Products} />
      <Route path="/products/:id" component={ProductDetail} />
      <Route path="/topup" component={TopUp} />
      <Route path="/orders" component={Orders} />
      <Route path="/profile" component={Profile} />
      <Route path="/announcements" component={Announcements} />
      <Route path="/announcements/:id" component={AnnouncementDetail} />
      <Route path="/admin" component={AdminDashboard} />
      <Route path="/admin/products" component={AdminProducts} />
      <Route path="/admin/stock" component={AdminStock} />
      <Route path="/admin/topups" component={AdminTopups} />
      <Route path="/admin/announcements" component={AdminAnnouncements} />
      <Route path="/admin/flash-sales" component={AdminFlashSales} />
      <Route path="/admin/orders" component={AdminOrders} />
      <Route path="/404" component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <TooltipProvider>
          <Toaster richColors position="top-center" />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
