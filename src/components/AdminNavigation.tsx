import React from 'react';
import { Link, useLocation } from "react-router-dom";
import { 
  LayoutDashboard, BarChart2, Activity,
  Users, BookOpen, ShieldCheck, Radio, Globe,
  Wallet, CreditCard, TrendingUp,
  HelpCircle, MessageSquare, FileQuestion,
  Image as ImageIcon, Images, Search,
  Settings, KeyRound, History, LogOut
} from "lucide-react";
import { clsx } from "clsx";

type NavRoute = {
  label: string;
  icon: any;
  path: string;
};

type NavSection = {
  title: string;
  routes: NavRoute[];
};

const adminNavigationConfig: NavSection[] = [
  {
    title: "COCKPIT CEO",
    routes: [
      { label: "Tableau de Bord", icon: LayoutDashboard, path: "/admin" },
      { label: "Analytics", icon: BarChart2, path: "/admin/analytics" },
      { label: "IA & Monitoring", icon: Activity, path: "/admin/monitoring" },
    ]
  },
  {
    title: "OPÉRATIONS",
    routes: [
      { label: "Membres", icon: Users, path: "/admin/members" },
      { label: "Catalogue", icon: BookOpen, path: "/admin/catalog" },
      { label: "Modération", icon: ShieldCheck, path: "/admin/moderation" },
      { label: "Diffusion Push", icon: Radio, path: "/admin/push" },
      { label: "Pays & Devises", icon: Globe, path: "/admin/countries" },
    ]
  },
  {
    title: "FINANCES",
    routes: [
      { label: "Trésorerie", icon: Wallet, path: "/admin/treasury" },
      { label: "Transactions", icon: CreditCard, path: "/admin/transactions" },
      { label: "Growth Hub", icon: TrendingUp, path: "/admin/growth" },
    ]
  },
  {
    title: "SUPPORT",
    routes: [
      { label: "Centre d'Aide", icon: HelpCircle, path: "/admin/help" },
      { label: "Modération Messagerie", icon: MessageSquare, path: "/admin/messages" },
      { label: "FAQ & Base", icon: FileQuestion, path: "/admin/faq" },
    ]
  },
  {
    title: "INTERFACE",
    routes: [
      { label: "Carrousel Accueil", icon: ImageIcon, path: "/admin/carousel" },
      { label: "Bibliothèque Visuels", icon: Images, path: "/admin/visuals" },
      { label: "SEO & Social", icon: Search, path: "/admin/seo" },
    ]
  },
  {
    title: "SÉCURITÉ",
    routes: [
      { label: "Réglages Globaux", icon: Settings, path: "/admin/settings" },
      { label: "Rôles & Accès", icon: KeyRound, path: "/admin/roles" },
      { label: "Journal d'Audit", icon: History, path: "/admin/audit" },
    ]
  }
];

export function AdminNavigation() {
  const location = useLocation();

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-72 h-screen bg-[#090E17] border-r border-slate-800/50 z-50 sticky top-0 font-sans">
        
        {/* Header Profil */}
        <div className="p-6 shrink-0">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-xl bg-emerald-500 flex items-center justify-center text-white font-black text-xl">
              N
            </div>
            <h1 className="font-black text-white tracking-widest text-lg leading-none uppercase">
              NDARA ADMIN
            </h1>
          </div>
          
          <div className="flex items-center gap-4 p-4 rounded-[1.25rem] bg-slate-800/40 border border-slate-700/50">
            <div className="relative">
              <img 
                src="https://images.unsplash.com/photo-1599566150163-29194dcaad36?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&q=80" 
                alt="Profile" 
                className="w-12 h-12 rounded-full object-cover border border-slate-600"
              />
              <div className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-emerald-500 border-2 border-[#090E17]"></div>
            </div>
            <div>
              <h2 className="text-sm font-bold text-white leading-tight mb-1">OYONO MATHIAS</h2>
              <p className="text-[10px] font-bold text-slate-400 tracking-widest uppercase">SUPER ADMINISTRATEUR</p>
            </div>
          </div>
        </div>

        {/* Navigation Content */}
        <div className="flex-1 overflow-y-auto px-4 pb-6 space-y-6 flex flex-col hide-scrollbar">
          {adminNavigationConfig.map((section, idx) => (
            <div key={idx}>
              <h3 className="px-4 text-[10px] font-extrabold text-slate-500 tracking-[0.2em] uppercase mb-3">
                {section.title}
              </h3>
              <div className="space-y-1">
                {section.routes.map((route) => {
                  const isActive = route.path === '/admin' ? location.pathname === route.path : location.pathname.startsWith(route.path);
                  return (
                    <Link
                      key={route.path}
                      to={route.path}
                      className={clsx(
                        "flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all duration-200 group text-sm font-medium",
                        isActive 
                          ? "bg-slate-800/60 text-slate-200" 
                          : "text-slate-400 hover:text-slate-300 hover:bg-slate-800/30"
                      )}
                    >
                      <route.icon className={clsx(
                        "w-4 h-4 shrink-0 transition-colors",
                        isActive 
                          ? "text-emerald-400" 
                          : "text-slate-500 group-hover:text-slate-400"
                      )} />
                      {route.label}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Footer Action */}
        <div className="p-4 shrink-0">
          <Link 
            to="/"
            className="flex justify-center items-center gap-2 w-full p-4 rounded-xl bg-slate-800/40 border border-slate-700/50 text-slate-300 hover:text-white hover:bg-slate-800/60 transition-all text-[11px] font-bold uppercase tracking-widest"
          >
            <LogOut className="w-4 h-4" /> QUITTER LE MODE ADMIN
          </Link>
        </div>
      </aside>

      {/* Mobile Bottom Navigation - Kept simple based on requirement */}
      <nav className="md:hidden fixed bottom-0 w-full bg-[#090E17] border-t border-slate-800/50 safe-bottom z-50">
        <div className="flex justify-around items-center h-16 px-2">
           {/* Display only a few primary links for mobile */}
           {adminNavigationConfig[0].routes.slice(0, 4).map((link) => (
              <MobileNavLink key={link.path} to={link.path} icon={link.icon} label={link.label} current={location.pathname} />
           ))}
        </div>
      </nav>
    </>
  );
}

function MobileNavLink({ to, icon: Icon, label, current }: { to: string, icon: any, label: string, current: string, key?: string }) {
  const isActive = to === '/admin' ? current === to : current.startsWith(to);
  return (
    <Link 
      to={to} 
      className={clsx(
        "flex flex-col items-center justify-center w-full h-full gap-1 transition-colors",
        isActive ? "text-emerald-400" : "text-slate-500 hover:text-slate-300"
      )}
    >
      <Icon className="w-5 h-5" />
      <span className="text-[9px] font-bold tracking-wider truncate max-w-[60px] text-center">{label}</span>
    </Link>
  );
}

