import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { BookOpen, Wallet, User, Bell, Search, LogOut } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { motion } from 'motion/react';
import { classNames } from '../lib/utils';

export const MainLayout: React.FC = () => {
  const { pathname } = useLocation();
  const { isAuthenticated, signOut } = useAuth();

  const navItems = [
    { label: 'Catalogue', path: '/catalog', icon: <Search className="w-6 h-6" /> },
    { label: 'Mes Cours', path: '/dashboard', icon: <BookOpen className="w-6 h-6" /> },
    { label: 'OmPay', path: '/wallet', icon: <Wallet className="w-6 h-6" /> },
    { label: 'Profil', path: '/account', icon: <User className="w-6 h-6" /> },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row">
      
      {/* --- DESKTOP SIDEBAR --- */}
      <aside className="hidden md:flex flex-col w-64 bg-white border-r border-slate-200 min-h-screen sticky top-0 z-40">
        <div className="p-6 h-[72px] flex items-center border-b border-slate-100">
          <Link to="/" className="flex items-center gap-2 group focus:outline-none">
            <span className="font-black text-2xl tracking-tighter text-blue-600 group-hover:text-blue-700 transition-colors">NDARA</span>
          </Link>
        </div>
        
        <div className="flex-1 overflow-y-auto py-6 px-4 space-y-1">
          {navItems.map(item => {
            const isActive = pathname.startsWith(item.path);
            return (
              <Link
                key={item.path}
                to={item.path}
                className={classNames(
                  "flex items-center gap-3 px-4 py-3.5 rounded-xl font-semibold transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600",
                  isActive 
                    ? "bg-blue-50 text-blue-700" 
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                )}
              >
                {React.cloneElement(item.icon, { className: 'w-5 h-5' })}
                <span>{item.label}</span>
              </Link>
            )
          })}
        </div>

        <div className="p-4 border-t border-slate-100">
          <Link 
            to="/notifications" 
            className="flex items-center gap-3 px-4 py-3.5 rounded-xl font-semibold text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors mb-2"
          >
            <div className="relative">
              <Bell className="w-5 h-5" />
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></span>
            </div>
            <span>Notifications</span>
          </Link>
          
          {isAuthenticated ? (
            <button 
              onClick={signOut} 
              className="flex items-center gap-3 px-4 py-3.5 w-full rounded-xl font-semibold text-slate-600 hover:bg-red-50 hover:text-red-600 transition-colors"
            >
              <LogOut className="w-5 h-5" />
              <span>Déconnexion</span>
            </button>
          ) : (
            <Link 
              to="/login" 
              className="flex items-center justify-center px-4 py-3.5 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-colors"
            >
              Connexion
            </Link>
          )}
        </div>
      </aside>

      {/* --- MOBILE TOP BAR --- */}
      <header className="md:hidden flex items-center justify-between px-4 h-[60px] bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-40 safe-area-top">
        <Link to="/" className="flex items-center">
          <span className="font-black text-xl tracking-tighter text-blue-600">NDARA</span>
        </Link>
        <div className="flex items-center gap-2">
          <Link to="/notifications" className="p-2 text-slate-600 relative rounded-full hover:bg-slate-100 transition-colors">
            <Bell className="w-6 h-6" />
            <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
          </Link>
        </div>
      </header>

      {/* --- MAIN CONTENT --- */}
      <main className="flex-1 overflow-y-auto w-full pb-[80px] md:pb-0">
        <div className="p-4 md:p-8 max-w-7xl mx-auto">
          <Outlet />
        </div>
      </main>

      {/* --- MOBILE BOTTOM NAVIGATION BAR --- */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-lg border-t border-slate-200 z-50 pb-safe shadow-[0_-4px_20px_-10px_rgba(0,0,0,0.1)]">
        <div className="flex items-center justify-around px-2 py-2">
          {navItems.map(item => {
            const isActive = pathname.startsWith(item.path);
            return (
              <Link
                key={item.path}
                to={item.path}
                className="relative flex flex-col items-center justify-center w-full min-h-[56px] rounded-xl focus:outline-none tap-highlight-transparent group"
              >
                {isActive && (
                  <motion.div
                    layoutId="bottom-nav-active"
                    className="absolute inset-0 bg-blue-50 rounded-xl -z-10"
                    transition={{ type: "spring", stiffness: 300, damping: 25 }}
                  />
                )}
                <div className={classNames(
                  "transition-colors duration-200",
                  isActive ? "text-blue-600" : "text-slate-400 group-hover:text-slate-600"
                )}>
                  {item.icon}
                </div>
                <span className={classNames(
                  "text-[10px] font-semibold mt-1 transition-colors duration-200",
                  isActive ? "text-blue-700" : "text-slate-500"
                )}>
                  {item.label}
                </span>
              </Link>
            )
          })}
        </div>
      </nav>

    </div>
  );
};

