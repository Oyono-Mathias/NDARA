import React from 'react';
import { Link, useLocation } from "react-router-dom";
import { LayoutDashboard, BookOpen, ClipboardCheck, Users, Banknote, Megaphone, Tag, MessageSquare, Award, Settings } from "lucide-react";
import { clsx } from "clsx";

export function InstructorNavigation() {
  const location = useLocation();

  const links = [
    { to: "/instructor/dashboard", icon: LayoutDashboard, label: "COCKPIT" },
    { to: "/instructor/courses", icon: BookOpen, label: "CATALOGUE" },
    { to: "/instructor/devoirs", icon: ClipboardCheck, label: "CORRECTION" },
    { to: "/instructor/revenus", icon: Banknote, label: "FINANCES" },
  ];

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-64 h-screen border-r border-white/5 bg-background/80 backdrop-blur-xl z-40 sticky top-0">
        <div className="p-6 flex items-center gap-2">
           <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-secondary to-amber-600 flex items-center justify-center text-background font-black text-sm shadow-[0_0_15px_rgba(204,119,34,0.3)]">
              E
           </div>
           <span className="font-serif font-bold text-lg tracking-tight text-white drop-shadow-md">EXPERT</span>
        </div>
        
        <div className="flex-1 overflow-y-auto hide-scrollbar px-4 space-y-2 pb-6">
          <div className="text-xs font-bold text-gray-500 tracking-widest uppercase mb-3 ml-2 mt-4">Pilotage</div>
          <SideLink to="/instructor/dashboard" icon={LayoutDashboard} label="Cockpit" current={location.pathname} />
          <SideLink to="/instructor/revenus" icon={Banknote} label="Wealth Management" current={location.pathname} />
          
          <div className="text-xs font-bold text-gray-500 tracking-widest uppercase mb-3 ml-2 mt-8">Production</div>
          <SideLink to="/instructor/courses" icon={BookOpen} label="Usine à Savoir" current={location.pathname} />
          <SideLink to="/instructor/quiz" icon={ClipboardCheck} label="Labo Évaluation" current={location.pathname} />
          <SideLink to="/instructor/devoirs" icon={ClipboardCheck} label="Usine de Correction" current={location.pathname} />
          
          <div className="text-xs font-bold text-gray-500 tracking-widest uppercase mb-3 ml-2 mt-8">Communauté</div>
          <SideLink to="/instructor/students" icon={Users} label="Base Ndara" current={location.pathname} />
          <SideLink to="/instructor/annonces" icon={Megaphone} label="Radar Annonces" current={location.pathname} />
          <SideLink to="/instructor/avis" icon={MessageSquare} label="Avis & Témoignages" current={location.pathname} />
          
          <div className="text-xs font-bold text-gray-500 tracking-widest uppercase mb-3 ml-2 mt-8">Croissance</div>
          <SideLink to="/instructor/coupons" icon={Tag} label="Growth Hub" current={location.pathname} />
          <SideLink to="/instructor/certificats" icon={Award} label="Registre Diplômes" current={location.pathname} />
          
          <div className="text-xs font-bold text-gray-500 tracking-widest uppercase mb-3 ml-2 mt-8">Système</div>
          <SideLink to="/instructor/settings" icon={Settings} label="Réglages Academy" current={location.pathname} />
        </div>
      </aside>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 w-full glass safe-bottom z-40">
        <div className="flex justify-around items-center h-20 px-2">
          {links.map((link) => (
            <MobileNavLink key={link.to} to={link.to} icon={link.icon} label={link.label} current={location.pathname} />
          ))}
        </div>
      </nav>
    </>
  );
}

function SideLink({ to, icon: Icon, label, current }: { to: string, icon: any, label: string, current: string }) {
  const isActive = current === to || current.startsWith(to + '/');
  return (
    <Link 
      to={to} 
      className={clsx(
        "flex items-center gap-3 px-4 py-3 rounded-2xl transition-all group",
        isActive ? "bg-secondary/10 text-secondary border border-secondary/20 shadow-[0_0_15px_rgba(204,119,34,0.1)]" : "text-gray-400 hover:text-white hover:bg-white/5"
      )}
    >
      <Icon className={clsx("w-5 h-5", isActive ? "text-secondary" : "text-gray-500 group-hover:text-gray-300")} />
      <span className="text-sm font-bold">{label}</span>
    </Link>
  );
}

function MobileNavLink({ to, icon: Icon, label, current }: { to: string, icon: any, label: string, current: string, key?: string }) {
  const isActive = current === to || current.startsWith(to + '/');
  return (
    <Link 
      to={to} 
      className={clsx(
        "flex flex-col items-center justify-center w-full h-full gap-1.5 transition-all group",
        isActive ? "text-secondary drop-shadow-[0_0_8px_rgba(204,119,34,0.5)]" : "text-gray-500 hover:text-gray-300"
      )}
    >
      <Icon className={clsx("w-6 h-6 transition-transform duration-300", isActive ? "-translate-y-0.5" : "group-hover:scale-110")} />
      <span className="text-[10px] font-bold tracking-wide">{label}</span>
    </Link>
  );
}
