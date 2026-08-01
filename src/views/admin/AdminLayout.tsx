import React, { useState } from "react";
import { Navigate, useLocation, Link, Outlet } from "react-router-dom";
import { useAuth } from '../../contexts/AuthContext';
import { useRole } from "../../context/RoleContext";
import { AdminSidebar } from "../../components/admin/AdminSidebar";
import { AdminHeader } from "../../components/admin/AdminHeader";
import { AdminFooter } from "../../components/admin/AdminFooter";
import {
  Loader2,
  Menu,
  LayoutDashboard,
  Users,
  BookOpen,
  Wallet,
  Headphones, ArrowDownRight, Trophy, Target,
} from "lucide-react";

function AdminBottomNav() {
  const location = useLocation();
  const currentPath = location.pathname;

  const tabs = [
    { name: "ACCUEIL", path: "/admin", icon: LayoutDashboard },
    { name: "MEMBRES", path: "/admin/members", icon: Users },
    { name: "COURS", path: "/admin/catalog", icon: BookOpen },
    { name: "FINANCES", path: "/admin/treasury", icon: Wallet },
    { name: "SUPPORT", path: "/admin/help", icon: Headphones },
    { name: "RETRAITS", path: "/admin/withdrawals", icon: ArrowDownRight },
    { name: "AMBASSADEURS", path: "/admin/ambassador-program", icon: Trophy },
    { name: "MARKETING", path: "/admin/marketing-assets", icon: Target },

  ];

  return (
    <nav className="md:hidden flex items-center justify-between w-full px-2 h-16 shrink-0 z-40 pb-[max(0px,env(safe-area-inset-bottom))]">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive =
          tab.path === "/admin"
            ? currentPath === "/admin"
            : currentPath.startsWith(tab.path);

        return (
          <Link
            key={tab.path}
            to={tab.path}
            className={`flex flex-col items-center justify-center flex-1 h-full gap-1 transition-all duration-200 ${
              isActive
                ? "text-emerald-400 font-bold"
                : "text-slate-500 hover:text-slate-300 font-medium"
            }`}
          >
            <div
              className={`relative ${isActive ? "drop-shadow-[0_0_8px_rgba(16,185,129,0.5)]" : ""}`}
            >
              <Icon
                className={`w-[22px] h-[22px] mb-0.5 ${isActive ? "opacity-100" : "opacity-80"}`}
              />
            </div>
            <span className="text-[10px] tracking-widest uppercase">
              {tab.name}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}

export function AdminLayout() {
  const { loading, currentUser } = useRole();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-[#090E17]">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
      </div>
    );
  }

  const { firebaseUser } = useAuth();
  if (!currentUser) {
    if (firebaseUser) {
        return (
            <div className="flex flex-col items-center justify-center h-screen bg-[#090E17] text-white p-4 text-center">
                <h2 className="text-xl font-bold mb-2 text-red-500">Erreur de chargement</h2>
                <p className="text-slate-400 mb-4">Impossible de charger votre profil administrateur.</p>
                <button onClick={() => window.location.reload()} className="px-4 py-2 bg-red-500 rounded-lg text-white font-bold">Réessayer</button>
            </div>
        );
    }
    return <Navigate to="/auth" replace />;
  }

  if (currentUser?.role !== "ceo" && currentUser?.role !== "admin") {
    return <Navigate to="/student/dashboard" replace />;
  }

  return (
    <div className="w-full h-[100dvh] max-h-[100dvh] flex flex-row justify-between items-stretch overflow-hidden bg-[#090E17] text-white selection:bg-emerald-500/30 selection:text-emerald-200 antialiased relative">
      {/* Sidebar Navigation */}
      <AdminSidebar
        isSidebarOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-full overflow-hidden relative z-10">
        {/* Mobile TopBar */}
        <AdminHeader onOpenSidebar={() => setIsSidebarOpen(true)} />

        {/* Scrollable Main Content */}
        <div className="flex-1 flex flex-col w-full overflow-y-auto hide-scrollbar min-h-0">
          <main className="w-full px-4 flex flex-col items-stretch pt-4 md:pt-8 pb-4 md:pb-8">
            <Outlet />
          </main>
          <AdminFooter />
        </div>

        {/* Mobile Bottom Navigation */}
        <div className="shrink-0 w-full z-50 md:hidden bg-[#090E17]/95 backdrop-blur-md border-t border-slate-800/80 pb-[max(0px,env(safe-area-inset-bottom))]">
          <AdminBottomNav />
        </div>
      </div>
    </div>
  );
}
