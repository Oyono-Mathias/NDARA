import { useState, useEffect } from "react";
import { Navigate, useLocation, useOutlet } from "react-router-dom";
import { Bell, Menu, Loader2 } from "lucide-react";
import { useRole } from "../context/RoleContext";
import { Navigation } from "../components/Navigation";
import { Sidebar } from "../components/Sidebar";
import { AnimatePresence, motion } from "motion/react";

export function StudentLayout() {
  const { loading, currentUser } = useRole();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const location = useLocation();
  const element = useOutlet();

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

  // Hide bottom nav and adjust padding when inside a specific chat room, quiz, or detail views (Lot B)
  const isFullScreenView = location.pathname.includes('/messages') || 
                           location.pathname.includes('/quiz') || 
                           location.pathname.includes('/sandbox') ||
                           location.pathname.includes('/catalog/') || 
                           location.pathname.includes('/ebooks/') || 
                           location.pathname.includes('/assignments/') || 
                           location.pathname.includes('/courses/') && !location.pathname.endsWith('/courses') ||
                           location.pathname.includes('/account') ||
                           location.pathname.includes('/support') ||
                           location.pathname.includes('/downloads') ||
                           location.pathname.includes('/ambassador');
  
  useEffect(() => {
    const metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (metaThemeColor) {
      if (isFullScreenView) {
        metaThemeColor.setAttribute("content", "#020617"); // slate-950 for full screen views
      } else {
        metaThemeColor.setAttribute("content", "#000000"); // black for main views
      }
    }
  }, [isFullScreenView]);

  return (
    <div className="flex flex-col relative selection:bg-[#10B981] selection:text-black antialiased h-[100dvh] overflow-hidden bg-black">
      {/* Background Gradients */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-[#10B981]/10 rounded-full blur-[100px] -mr-40 -mt-40 pointer-events-none z-0"></div>
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-blue-500/10 rounded-full blur-[100px] -ml-40 -mb-40 pointer-events-none z-0"></div>

      <div className="flex-1 w-full max-w-7xl mx-auto flex overflow-hidden">
        {/* Desktop Sidebar */}
        <Sidebar
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
        />

        <main id="main-scroll-container" className="flex-1 w-full mx-auto relative z-10 hide-scrollbar flex flex-col overflow-hidden items-stretch">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={location.pathname}
              initial={{ x: '100%', opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: '100%', opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className={`flex-1 flex flex-col h-full w-full overflow-y-auto hide-scrollbar ${isFullScreenView ? 'pb-0 pt-0' : 'pb-32 md:pb-8 pt-4 md:pt-8'}`}
            >
              {element}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      {!isFullScreenView && (
        <div className="fixed bottom-0 w-full z-50 md:hidden">
          <Navigation onMenuClick={() => setIsSidebarOpen(true)} />
        </div>
      )}
    </div>
  );
}

