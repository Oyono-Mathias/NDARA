import React, { useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, ShieldCheck, Trophy, Megaphone, Menu, X } from 'lucide-react';

export const AmbassadorLayout: React.FC = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();

  const navItems = [
    { label: 'Tableau de bord', path: '/ambassador', icon: <LayoutDashboard className="w-5 h-5" /> },
    { label: 'Marketing', path: '/ambassador/marketing', icon: <Megaphone className="w-5 h-5" /> },
    { label: 'Classement', path: '/ambassador/leaderboard', icon: <Trophy className="w-5 h-5" /> },
    { label: 'Statut KYC', path: '/ambassador/kyc', icon: <ShieldCheck className="w-5 h-5" /> },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row">
      {/* Mobile Top Bar */}
      <header className="md:hidden bg-slate-900 text-white p-4 sticky top-0 z-50 flex items-center justify-between shadow-md">
        <h1 className="font-bold text-lg">Espace Partenaire</h1>
        <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="p-2" aria-label="Menu">
          {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </header>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-40 bg-slate-900 text-white pt-20 px-4 pb-20 space-y-2 overflow-y-auto">
          {navItems.map(item => (
            <Link 
              key={item.path} 
              to={item.path} 
              onClick={() => setIsMobileMenuOpen(false)}
              className={`flex items-center gap-4 p-4 rounded-xl transition-colors ${location.pathname === item.path ? 'bg-blue-600' : 'hover:bg-slate-800'}`}
            >
              {item.icon}
              <span className="font-medium">{item.label}</span>
            </Link>
          ))}
        </div>
      )}

      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-64 bg-slate-900 text-white h-screen sticky top-0 overflow-y-auto">
        <div className="p-6">
          <h1 className="font-black text-xl tracking-tight text-white">Ndara<span className="text-blue-400">Ambassadeur</span></h1>
        </div>
        <nav className="flex-1 px-4 pb-6 space-y-2">
          {navItems.map(item => (
            <Link 
              key={item.path} 
              to={item.path} 
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${location.pathname === item.path ? 'bg-blue-600' : 'text-gray-300 hover:bg-slate-800 hover:text-white'}`}
            >
              {item.icon}
              <span className="font-medium text-sm">{item.label}</span>
            </Link>
          ))}
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-x-hidden w-full">
        <Outlet />
      </main>
    </div>
  );
};
