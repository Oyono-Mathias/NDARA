import { useState } from "react";
import { Navigate, Outlet, Link } from "react-router-dom";
import { Bell, Menu, Loader2 } from "lucide-react";
import { useRole } from "../context/RoleContext";
import { Navigation } from "../components/Navigation";
import { Sidebar } from "../components/Sidebar";

export function StudentLayout() {
  const { loading, currentUser } = useRole();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-black">
        <Loader2 className="h-8 w-8 animate-spin text-[#10B981]" />
      </div>
    );
  }

  if (!currentUser) {
    return <Navigate to="/auth" replace />;
  }

  return (
    <div className="flex flex-col min-h-screen bg-black relative selection:bg-[#10B981] selection:text-black antialiased">
      {/* Background Gradients */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-[#10B981]/10 rounded-full blur-[100px] -mr-40 -mt-40 pointer-events-none z-0"></div>
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-blue-500/10 rounded-full blur-[100px] -ml-40 -mb-40 pointer-events-none z-0"></div>

      <header className="w-full z-40 bg-black/50 backdrop-blur-md border-b border-white/5 safe-top sticky top-0 md:hidden">
        <div className="flex items-center justify-between px-6 py-4 max-w-7xl mx-auto">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="p-2 -ml-2 text-white hover:bg-white/10 rounded-full transition-colors relative z-50"
            >
              <Menu className="w-6 h-6" />
            </button>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#10B981] to-teal-600 flex items-center justify-center text-black font-black text-sm shadow-[0_0_15px_rgba(16,185,129,0.3)]">
                N
              </div>
              <span className="font-serif font-bold text-lg tracking-tight text-white drop-shadow-md">
                NDARA
              </span>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Link
              to="/student/notifications"
              className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-gray-400 hover:text-white transition card-hover relative"
            >
              <Bell className="w-5 h-5" />
              <span className="absolute top-2 right-2.5 w-2 h-2 bg-red-500 rounded-full shadow-[0_0_8px_rgba(239,68,68,0.8)]"></span>
            </Link>
          </div>
        </div>
      </header>

      <div className="flex-1 w-full max-w-7xl mx-auto flex overflow-hidden">
        {/* Desktop Sidebar (hidden on mobile, handled by Sidebar component directly currently? Sidebar component in NDARA is actually a drawer for mobile, but let's check it later. For now we use the existing Sidebar) */}
        <Sidebar
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
        />

        <main className="flex-1 w-full max-w-md md:max-w-none mx-auto relative z-10 hide-scrollbar pb-32 md:pb-8 pt-4 md:pt-8 px-4">
          <Outlet />
        </main>
      </div>

      <div className="fixed bottom-0 w-full z-50 md:hidden">
        <Navigation />
      </div>
    </div>
  );
}
