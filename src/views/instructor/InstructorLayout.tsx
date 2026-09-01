import React, { useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, BookOpen, MessageSquare, Award, Settings, Menu, X, Users, Video } from 'lucide-react';

export const InstructorLayout: React.FC = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();

  const navItems = [
    { label: 'Tableau de bord', path: '/instructor', icon: <LayoutDashboard className="w-5 h-5" /> },
    { label: 'Mes Cours', path: '/instructor/courses', icon: <BookOpen className="w-5 h-5" /> },
    { label: 'Sessions Live', path: '/instructor/live', icon: <Video className="w-5 h-5" /> },
    { label: 'Q&A', path: '/instructor/qna', icon: <MessageSquare className="w-5 h-5" /> },
    { label: 'Devoirs', path: '/instructor/devoirs', icon: <Users className="w-5 h-5" /> },
    { label: 'Certificats', path: '/instructor/certificates', icon: <Award className="w-5 h-5" /> },
    { label: 'Paramètres', path: '/instructor/settings', icon: <Settings className="w-5 h-5" /> },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row">
      {/* Mobile Top Bar */}
      <header className="md:hidden bg-slate-900 text-white p-4 sticky top-0 z-50 flex items-center justify-between shadow-md">
        <h1 className="font-bold text-lg">Espace Instructeur</h1>
        <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="p-2" aria-label="Menu">
          {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </header>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-40 bg-slate-900 text-white pt-20 px-4 space-y-2">
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
      <aside className="hidden md:flex flex-col w-64 bg-slate-900 text-white min-h-screen sticky top-0">
        <div className="p-6">
          <h1 className="font-black text-xl tracking-tight text-white">Ndara<span className="text-blue-400">Instructor</span></h1>
        </div>
        <nav className="flex-1 px-4 space-y-2">
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
      <main className="flex-1 overflow-y-auto w-full">
        <Outlet />
      </main>
    </div>
  );
};
