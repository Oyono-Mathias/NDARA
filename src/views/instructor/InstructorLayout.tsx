import React, { useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, BookOpen, MessageSquare, Award, Settings, Users, Video, LogOut, MoreHorizontal } from 'lucide-react';
import { classNames } from '../../lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '../../contexts/AuthContext';

export const InstructorLayout: React.FC = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();
  const { signOut } = useAuth();

  const allNavItems = [
    { label: 'Tableau de bord', path: '/instructor', icon: <LayoutDashboard className="w-5 h-5" /> },
    { label: 'Mes Cours', path: '/instructor/courses', icon: <BookOpen className="w-5 h-5" /> },
    { label: 'Sessions Live', path: '/instructor/live', icon: <Video className="w-5 h-5" /> },
    { label: 'Q&A', path: '/instructor/qna', icon: <MessageSquare className="w-5 h-5" /> },
    { label: 'Devoirs', path: '/instructor/devoirs', icon: <Users className="w-5 h-5" /> },
    { label: 'Certificats', path: '/instructor/certificates', icon: <Award className="w-5 h-5" /> },
    { label: 'Paramètres', path: '/instructor/settings', icon: <Settings className="w-5 h-5" /> },
  ];

  // Mobile bottom nav will only show top 4 + "Menu"
  const bottomNavItems = allNavItems.slice(0, 4);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row font-sans">
      
      {/* --- DESKTOP SIDEBAR --- */}
      <aside className="hidden md:flex flex-col w-[280px] bg-slate-900 text-slate-300 min-h-screen sticky top-0 z-40 border-r border-slate-800">
        <div className="p-6 h-[72px] flex items-center border-b border-slate-800">
          <Link to="/" className="flex items-center gap-2 group focus:outline-none">
            <span className="font-black text-2xl tracking-tighter text-blue-500 group-hover:text-blue-400 transition-colors">NDARA</span>
            <span className="font-bold text-2xl tracking-tighter text-white">Instructeur</span>
          </Link>
        </div>
        
        <nav className="flex-1 overflow-y-auto py-6 px-4 space-y-1">
          {allNavItems.map(item => {
            const isActive = location.pathname === item.path;
            return (
              <Link 
                key={item.path} 
                to={item.path} 
                className={classNames(
                  "flex items-center gap-3 px-4 py-3.5 rounded-xl font-semibold transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500",
                  isActive 
                    ? "bg-blue-600 text-white shadow-md shadow-blue-900/20" 
                    : "text-slate-400 hover:bg-slate-800 hover:text-white"
                )}
              >
                {item.icon}
                <span>{item.label}</span>
              </Link>
            )
          })}
        </nav>

        <div className="p-4 border-t border-slate-800">
          <button 
            onClick={signOut}
            className="flex items-center gap-3 px-4 py-3.5 w-full rounded-xl font-semibold text-slate-400 hover:bg-red-500/10 hover:text-red-400 transition-colors"
          >
            <LogOut className="w-5 h-5" />
            <span>Déconnexion</span>
          </button>
        </div>
      </aside>

      {/* --- MOBILE TOP BAR --- */}
      <header className="md:hidden bg-slate-900 text-white h-[60px] sticky top-0 z-40 flex items-center justify-between px-4 shadow-sm safe-area-top">
        <div className="flex items-center gap-1">
          <span className="font-black text-xl tracking-tighter text-blue-500">NDARA</span>
          <span className="font-bold text-lg tracking-tighter text-white">Instructeur</span>
        </div>
      </header>

      {/* --- MOBILE MENU OVERLAY (FOR EXTRA ITEMS) --- */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="md:hidden fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50"
              onClick={() => setIsMobileMenuOpen(false)}
            />
            <motion.div 
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="md:hidden fixed bottom-0 left-0 right-0 bg-white rounded-t-3xl z-50 overflow-hidden pb-safe shadow-2xl"
            >
              <div className="flex justify-center pt-4 pb-2">
                <div className="w-12 h-1.5 bg-slate-200 rounded-full" />
              </div>
              <div className="px-6 py-4">
                <h3 className="text-lg font-bold text-slate-900 mb-4">Plus d'options</h3>
                <div className="space-y-2">
                  {allNavItems.slice(4).map(item => (
                    <Link
                      key={item.path}
                      to={item.path}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={classNames(
                        "flex items-center gap-4 p-4 rounded-2xl font-semibold transition-colors",
                        location.pathname === item.path ? "bg-blue-50 text-blue-700" : "text-slate-600 hover:bg-slate-50"
                      )}
                    >
                      {item.icon}
                      <span>{item.label}</span>
                    </Link>
                  ))}
                  
                  <div className="h-px bg-slate-100 my-4" />
                  
                  <button
                    onClick={() => { signOut(); setIsMobileMenuOpen(false); }}
                    className="flex items-center gap-4 p-4 rounded-2xl font-semibold text-red-600 hover:bg-red-50 w-full transition-colors"
                  >
                    <LogOut className="w-5 h-5" />
                    <span>Déconnexion</span>
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* --- MAIN CONTENT --- */}
      <main className="flex-1 overflow-y-auto w-full pb-[80px] md:pb-0 bg-slate-50">
        <div className="p-4 md:p-8 max-w-7xl mx-auto">
          <Outlet />
        </div>
      </main>

      {/* --- MOBILE BOTTOM NAVIGATION BAR --- */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-lg border-t border-slate-200 z-40 pb-safe shadow-[0_-4px_20px_-10px_rgba(0,0,0,0.1)]">
        <div className="flex items-center justify-around px-2 py-2">
          {bottomNavItems.map(item => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className="relative flex flex-col items-center justify-center w-full min-h-[56px] rounded-xl focus:outline-none tap-highlight-transparent group"
              >
                {isActive && (
                  <motion.div
                    layoutId="instructor-bottom-nav-active"
                    className="absolute inset-0 bg-blue-50 rounded-xl -z-10"
                    transition={{ type: "spring", stiffness: 300, damping: 25 }}
                  />
                )}
                <div className={classNames(
                  "transition-colors duration-200",
                  isActive ? "text-blue-600" : "text-slate-400 group-hover:text-slate-600"
                )}>
                  {React.cloneElement(item.icon, { className: 'w-6 h-6' })}
                </div>
                <span className={classNames(
                  "text-[10px] font-semibold mt-1 transition-colors duration-200 line-clamp-1",
                  isActive ? "text-blue-700" : "text-slate-500"
                )}>
                  {item.label}
                </span>
              </Link>
            )
          })}
          
          {/* More Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(true)}
            className="relative flex flex-col items-center justify-center w-full min-h-[56px] rounded-xl focus:outline-none tap-highlight-transparent group text-slate-400"
          >
            <MoreHorizontal className="w-6 h-6 group-hover:text-slate-600 transition-colors duration-200" />
            <span className="text-[10px] font-semibold mt-1 text-slate-500 group-hover:text-slate-600 transition-colors duration-200">
              Plus
            </span>
          </button>
        </div>
      </nav>

    </div>
  );
};

