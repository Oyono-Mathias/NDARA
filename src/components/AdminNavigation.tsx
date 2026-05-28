import React from 'react';
import { Link, useLocation } from "react-router-dom";
import { 
  Terminal, ShieldAlert, Activity, Users, UserCheck, CheckCircle, 
  Database, Globe2, Banknote, Receipt, Megaphone, HelpCircle, 
  Eye, BookOpen, BellRing, Settings, Key, LayoutTemplate, 
  SearchCheck, Power
} from "lucide-react";
import { clsx } from "clsx";

export function AdminNavigation() {
  const location = useLocation();

  const links = [
    { to: "/admin", icon: Terminal, label: "COMMAND CENTER" },
    { to: "/admin/statistiques", icon: Activity, label: "ANALYTICS" },
    { to: "/admin/monitoring", icon: ShieldAlert, label: "MONITORING" },
    { to: "/admin/users", icon: Users, label: "MEMBERS" },
  ];

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-72 h-screen border-r border-[#10B981]/20 bg-[#050505] z-50 sticky top-0 font-mono text-sm relative overflow-hidden">
        {/* Decorative Grid Background */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(16,185,129,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(16,185,129,0.03)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none"></div>
        
        <div className="p-6 flex items-center justify-between border-b border-[#10B981]/10 bg-black/50 backdrop-blur-sm relative z-10">
           <div className="flex items-center gap-3 w-full">
               <div className="w-10 h-10 rounded-sm bg-black border border-[#10B981] flex items-center justify-center text-[#10B981] shadow-[0_0_15px_rgba(16,185,129,0.5)] relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-full h-[1px] bg-[#10B981] animate-scanline"></div>
                  <Power className="w-5 h-5" />
               </div>
               <div className="flex-1">
                   <h1 className="font-black text-[#10B981] tracking-widest text-lg leading-none">SYS.ADMIN</h1>
                   <p className="text-[9px] text-[#10B981]/50 uppercase tracking-[0.2em] mt-0.5">Ndara Core <span className="animate-pulse text-[#10B981]">●</span></p>
               </div>
           </div>
        </div>
        
        <div className="flex-1 overflow-y-auto hide-scrollbar p-4 space-y-1 pb-6 relative z-10 w-full">
          <SectionTitle>STRATEGY_&_MONITORING</SectionTitle>
          <SideLink to="/admin" icon={Terminal} label="Dashboard CEO" current={location.pathname} />
          <SideLink to="/admin/statistiques" icon={Activity} label="Reporting Stratégique" current={location.pathname} />
          <SideLink to="/admin/monitoring" icon={ShieldAlert} label="Monitoring IA & Sys." current={location.pathname} alert />

          <SectionTitle>IDENTITY_&_ACCESS</SectionTitle>
          <SideLink to="/admin/users" icon={Users} label="Base Membres" current={location.pathname} />
          <SideLink to="/admin/instructors" icon={UserCheck} label="Audit Candidatures" current={location.pathname} alert />
          <SideLink to="/admin/roles" icon={Key} label="Vault Permissions" current={location.pathname} />

          <SectionTitle>CATALOG_&_OPERATIONS</SectionTitle>
          <SideLink to="/admin/courses" icon={Database} label="Catalogue Maître" current={location.pathname} />
          <SideLink to="/admin/moderation" icon={CheckCircle} label="File de Modération" current={location.pathname} alert />
          <SideLink to="/admin/countries" icon={Globe2} label="Expansion & Gateways" current={location.pathname} />

          <SectionTitle>FINANCE_&_TREASURY</SectionTitle>
          <SideLink to="/admin/payouts" icon={Banknote} label="Trésorerie Centrale" current={location.pathname} alert />
          <SideLink to="/admin/payments" icon={Receipt} label="Registre des Flux" current={location.pathname} />

          <SectionTitle>COMMUNICATION_HUB</SectionTitle>
          <SideLink to="/admin/support" icon={HelpCircle} label="Centre Support" current={location.pathname} alert />
          <SideLink to="/admin/messages" icon={Eye} label="Surveillance Comms" current={location.pathname} />
          <SideLink to="/admin/marketing" icon={Megaphone} label="Growth & WhatsApp" current={location.pathname} />
          <SideLink to="/admin/notifications" icon={BellRing} label="Diffusion Push" current={location.pathname} />
          
          <SectionTitle>SYSTEM_&_DATA</SectionTitle>
          <SideLink to="/admin/faq" icon={BookOpen} label="Training IA Mathias" current={location.pathname} />
          <SideLink to="/admin/carousel" icon={LayoutTemplate} label="Gestion Carrousel" current={location.pathname} />
          <SideLink to="/admin/seo" icon={SearchCheck} label="Indexation & SEO" current={location.pathname} />
          <SideLink to="/admin/settings" icon={Settings} label="Réglages Master" current={location.pathname} />
        </div>
      </aside>

      {/* Mobile Bottom Navigation - Cyberpunk Style */}
      <nav className="md:hidden fixed bottom-0 w-full bg-[#050505] border-t border-[#10B981]/30 safe-bottom z-50">
        <div className="flex justify-around items-center h-20 px-2">
          {links.map((link) => (
            <MobileNavLink key={link.to} to={link.to} icon={link.icon} label={link.label} current={location.pathname} />
          ))}
        </div>
      </nav>
    </>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
    return (
        <div className="text-[10px] font-black text-[#10B981]/40 tracking-[0.2em] uppercase mt-6 mb-2 ml-3 flex items-center gap-2">
            <span className="w-2 h-px bg-[#10B981]/40"></span>
            {children}
        </div>
    );
}

function SideLink({ to, icon: Icon, label, current, alert }: { to: string, icon: any, label: string, current: string, alert?: boolean }) {
  // Use exact match for root '/admin', prefix match for others to keep active state on sub-routes
  const isActive = to === '/admin' ? current === to : current.startsWith(to);
  
  return (
    <Link 
      to={to} 
      className={clsx(
        "flex items-center justify-between px-3 py-2.5 rounded-sm transition-all group relative overflow-hidden",
        isActive ? "bg-[#10B981]/10 text-[#10B981] border-l-2 border-[#10B981]" : "text-gray-500 hover:text-[#10B981] hover:bg-[#10B981]/5 border-l-2 border-transparent"
      )}
    >
      {isActive && (
          <div className="absolute inset-0 bg-gradient-to-r from-[#10B981]/20 to-transparent opacity-50"></div>
      )}
      <div className="flex items-center gap-3 relative z-10 w-full">
          <Icon className={clsx("w-4 h-4 shrink-0", isActive ? "text-[#10B981]" : "text-gray-600 group-hover:text-[#10B981]/70")} />
          <span className="text-xs font-bold tracking-wide truncate">{label}</span>
      </div>
      {alert && (
          <div className="w-1.5 h-1.5 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,1)] animate-pulse shrink-0 ml-2"></div>
      )}
    </Link>
  );
}

function MobileNavLink({ to, icon: Icon, label, current }: { to: string, icon: any, label: string, current: string, key?: string }) {
  const isActive = to === '/admin' ? current === to : current.startsWith(to);
  return (
    <Link 
      to={to} 
      className={clsx(
        "flex flex-col items-center justify-center w-full h-full gap-1.5 transition-all group",
        isActive ? "text-[#10B981] drop-shadow-[0_0_8px_rgba(16,185,129,0.5)]" : "text-gray-600 hover:text-gray-400"
      )}
    >
      <Icon className={clsx("w-6 h-6 transition-transform duration-300", isActive ? "-translate-y-0.5" : "group-hover:scale-110")} />
      <span className="text-[9px] font-mono font-bold tracking-widest">{label}</span>
      {isActive && <div className="absolute bottom-1 w-8 h-0.5 bg-[#10B981] shadow-[0_0_5px_rgba(16,185,129,1)]"></div>}
    </Link>
  );
}
