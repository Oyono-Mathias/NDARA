import React, { useState } from 'react';
import { Routes, Route, Navigate, useLocation, Link } from 'react-router-dom';
import { useRole } from '../../context/RoleContext';
import { AdminNavigation } from '../../components/AdminNavigation';
import { AdminDashboard } from './AdminDashboard';
import { AdminMembers } from './AdminMembers';
import { AdminSquads } from './AdminSquads';
import { AdminCourses } from './AdminCourses';
import { AdminTransactions } from './AdminTransactions';
import { AdminModeration } from './AdminModeration';
import { AdminInterface } from './AdminInterface';
import { AdminMarketing } from './AdminMarketing';
import { AdminMonitoring } from './AdminMonitoring';
import { AdminSecurity } from './AdminSecurity';
import { AdminSupport } from './AdminSupport';
import { AdminSettings } from './AdminSettings';
import { AdminAiConfig } from './AdminAiConfig';
import { AdminMarketControl } from './AdminMarketControl';
import { Loader2, Menu, LayoutDashboard, Users, BookOpen, Wallet, Headphones } from 'lucide-react';

function AdminBottomNav() {
  const location = useLocation();
  const currentPath = location.pathname;

  const tabs = [
    { name: 'ACCUEIL', path: '/admin', icon: LayoutDashboard },
    { name: 'MEMBRES', path: '/admin/members', icon: Users },
    { name: 'COURS', path: '/admin/catalog', icon: BookOpen },
    { name: 'FINANCES', path: '/admin/treasury', icon: Wallet },
    { name: 'SUPPORT', path: '/admin/help', icon: Headphones },
  ];

  return (
    <nav className="md:hidden flex items-center justify-between px-2 bg-[#090E17]/95 backdrop-blur-md border-t border-slate-800/80 fixed bottom-0 left-0 right-0 z-40 h-[68px] pb-safe">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = tab.path === '/admin' 
          ? currentPath === '/admin' 
          : currentPath.startsWith(tab.path);
        
        return (
          <Link
            key={tab.path}
            to={tab.path}
            className={`flex flex-col items-center justify-center flex-1 h-full gap-1 transition-all duration-200 ${
              isActive 
                ? 'text-emerald-400 font-bold' 
                : 'text-slate-500 hover:text-slate-300 font-medium'
            }`}
          >
            <div className={`relative ${isActive ? 'drop-shadow-[0_0_8px_rgba(16,185,129,0.5)]' : ''}`}>
              <Icon className={`w-[22px] h-[22px] mb-0.5 ${isActive ? 'opacity-100' : 'opacity-80'}`} />
            </div>
            <span className="text-[10px] tracking-widest uppercase">{tab.name}</span>
          </Link>
        );
      })}
    </nav>
  );
}

export function AdminLayout() {
  const { isUserLoading, currentUser } = useRole();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  if (isUserLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-[#090E17]">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
      </div>
    );
  }

  if (!currentUser) return <Navigate to="/auth" replace />;

  if (currentUser?.role !== 'ceo' && currentUser?.role !== 'admin') {
    return <Navigate to="/student/dashboard" replace />;
  }

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#090E17] text-white selection:bg-emerald-500/30 selection:text-emerald-200 antialiased">
      
      {/* Sidebar Navigation */}
      <AdminNavigation isSidebarOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-full overflow-hidden relative z-10">
        
        {/* Mobile TopBar */}
        <div className="md:hidden flex items-center h-16 px-4 border-b border-slate-800/50 bg-[#090E17]/90 backdrop-blur-md shrink-0 sticky top-0 z-30">
          <button 
            onClick={() => setIsSidebarOpen(true)}
            className="p-2 -ml-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/50 transition-colors"
          >
            <Menu className="w-6 h-6" />
          </button>
          <span className="ml-2 font-black text-white tracking-widest text-sm uppercase">
            NDARA ADMIN
          </span>
        </div>

        {/* Scrollable Main Content */}
        <div className="flex-1 overflow-y-auto p-4 md:p-10 hide-scrollbar">
          <main className="w-full max-w-7xl mx-auto flex flex-col pb-24 md:pb-8">
            <Routes>
              {/* Dashboard CEO */}
              <Route path="/" element={<AdminDashboard />} />
              <Route path="analytics" element={<AdminMonitoring />} />
              <Route path="monitoring" element={<AdminMonitoring />} />
              
              {/* Operations */}
              <Route path="members" element={<AdminMembers />} />
              <Route path="squads" element={<AdminSquads />} />
              <Route path="markets" element={<AdminMarketControl />} />
              <Route path="catalog" element={<AdminCourses />} />
              <Route path="moderation" element={<AdminModeration />} />
              <Route path="push" element={<AdminMarketing />} />
              <Route path="countries" element={<AdminSettings />} />
              
              {/* Finances */}
              <Route path="treasury" element={<AdminTransactions />} />
              <Route path="transactions" element={<AdminTransactions />} />
              <Route path="growth" element={<AdminMarketing />} />
              
              {/* IA Config */}
              <Route path="ai" element={<AdminAiConfig />} />
              
              {/* Support */}
              <Route path="help" element={<AdminSupport />} />
              <Route path="messages" element={<AdminSupport />} />
              <Route path="faq" element={<AdminSupport />} />
              
              {/* Interface */}
              <Route path="carousel" element={<AdminInterface />} />
              <Route path="visuals" element={<AdminInterface />} />
              <Route path="seo" element={<AdminSettings />} />
              
              {/* Securite */}
              <Route path="settings" element={<AdminSettings />} />
              <Route path="roles" element={<AdminSecurity />} />
              <Route path="audit" element={<AdminSecurity />} />
              
              {/* Catch-all */}
              <Route path="*" element={<Navigate to="/admin" replace />} />
            </Routes>
          </main>
        </div>

        {/* Mobile Bottom Navigation */}
        <AdminBottomNav />
      </div>
    </div>
  );
}
