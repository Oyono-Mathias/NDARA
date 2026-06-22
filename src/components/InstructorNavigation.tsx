import React from 'react';
import { Link, useLocation } from "react-router-dom";
import { LayoutDashboard, BookOpen, Folder, BadgeCheck, Tag, Megaphone, ClipboardCheck, FileQuestion, MessageSquare, Star, Users, Building, Award, Settings, ArrowLeftRight } from "lucide-react";
import { clsx } from "clsx";
import { useRole } from "../context/RoleContext";

export function InstructorNavigation() {
  const location = useLocation();
  const { currentUser } = useRole();

  const links = [
    { to: "/instructor/dashboard", icon: LayoutDashboard, label: "COCKPIT" },
    { to: "/instructor/courses", icon: BookOpen, label: "CATALOGUE" },
    { to: "/instructor/messages", icon: MessageSquare, label: "MESSAGES" },
    { to: "/instructor/devoirs", icon: ClipboardCheck, label: "CORRECTION" },
    { to: "/instructor/revenus", icon: Building, label: "WEALTH" },
  ];

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-64 h-screen border-r border-white/5 bg-background/80 backdrop-blur-xl z-40 sticky top-0">
        <div className="p-6 mb-4">
           <Link to="/instructor/profile" className="bg-slate-900 border border-white/5 rounded-3xl p-4 flex flex-col gap-2 relative overflow-hidden block hover:bg-slate-800 transition-colors cursor-pointer">
               <div className="absolute top-0 right-0 w-24 h-24 bg-secondary/10 rounded-full blur-xl -mr-10 -mt-10" />
               <div className="flex items-center gap-3 relative z-10 w-full overflow-hidden">
                   <div className="w-12 h-12 rounded-full border border-secondary/30 bg-gradient-to-tr from-secondary to-amber-600 flex items-center justify-center text-background font-black text-lg overflow-hidden shrink-0 shadow-[0_0_15px_rgba(204,119,34,0.3)]">
                       {currentUser?.profilePictureURL ? (
                           <img src={currentUser.profilePictureURL} alt="Profile" className="w-full h-full object-cover" />
                       ) : (
                           <span>{currentUser?.fullName?.substring(0, 2).toUpperCase() || 'MO'}</span>
                       )}
                   </div>
                   <div className="overflow-hidden w-full">
                       <h3 className="font-black text-white uppercase tracking-tight text-sm truncate w-full">{currentUser?.fullName || 'MATHIAS OYONO'}</h3>
                       <p className="text-[9px] text-secondary font-bold uppercase tracking-widest truncate w-full flex items-center gap-1">
                          <BadgeCheck className="w-3 h-3 shrink-0" />
                          EXPERT NDARA
                       </p>
                   </div>
               </div>
           </Link>
        </div>
        
        <div className="flex-1 overflow-y-auto hide-scrollbar px-4 space-y-2 pb-6">
          <div className="space-y-3 mb-6">
              <p className="ml-2 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mt-4">CHANGER DE MODE</p>
              <Link 
                  to="/student/dashboard"
                  className="w-full h-12 rounded-2xl bg-white/5 flex items-center justify-center gap-3 text-slate-300 font-bold text-xs uppercase tracking-widest hover:bg-white/10 transition"
              >
                  <ArrowLeftRight size={16} />
                  ÉTUDIANT
              </Link>
          </div>

          <div className="text-[10px] font-black text-slate-500 tracking-[0.2em] uppercase mb-3 ml-2 mt-4">• GESTION</div>
          <SideLink to="/instructor/dashboard" icon={LayoutDashboard} label="COCKPIT DASHBOARD" current={location.pathname} />
          <SideLink to="/instructor/courses" icon={BookOpen} label="CATALOGUE FORMATIONS" current={location.pathname} />
          <SideLink to="/instructor/resources" icon={Folder} label="SUPPORTS & RESSOURCES" current={location.pathname} />
          
          <div className="text-[10px] font-black text-slate-500 tracking-[0.2em] uppercase mb-3 ml-2 mt-8">• CROISSANCE</div>
          <SideLink to="/instructor/ambassador" icon={BadgeCheck} label="AMBASSADEUR ELITE" current={location.pathname} />
          <SideLink to="/instructor/coupons" icon={Tag} label="COUPONS & MARKETING" current={location.pathname} />
          <SideLink to="/instructor/annonces" icon={Megaphone} label="RADAR ANNONCES" current={location.pathname} />
          
          <div className="text-[10px] font-black text-slate-500 tracking-[0.2em] uppercase mb-3 ml-2 mt-8">• PÉDAGOGIE</div>
          <SideLink to="/instructor/devoirs" icon={ClipboardCheck} label="USINE DE CORRECTION" current={location.pathname} />
          <SideLink to="/instructor/quiz" icon={FileQuestion} label="ÉVALUATION (QUIZ)" current={location.pathname} />
          <SideLink to="/instructor/messages" icon={MessageSquare} label="MESSAGERIE" current={location.pathname} />
          <SideLink to="/instructor/qna" icon={MessageSquare} label="INTERACTIONS Q&R" current={location.pathname} />
          <SideLink to="/instructor/avis" icon={Star} label="AVIS & TÉMOIGNAGES" current={location.pathname} />
          
          <div className="text-[10px] font-black text-slate-500 tracking-[0.2em] uppercase mb-3 ml-2 mt-8">• RÉSULTATS</div>
          <SideLink to="/instructor/students" icon={Users} label="BASE ÉTUDIANTS" current={location.pathname} />
          <SideLink to="/instructor/revenus" icon={Building} label="WEALTH MANAGEMENT" current={location.pathname} />
          <SideLink to="/instructor/certificats" icon={Award} label="REGISTRE DIPLÔMES" current={location.pathname} />
          
          <div className="text-[10px] font-black text-slate-500 tracking-[0.2em] uppercase mb-3 ml-2 mt-8">• SYSTÈME</div>
          <SideLink to="/instructor/profile" icon={BadgeCheck} label="PROFIL INSTRUCTEUR" current={location.pathname} />
          <SideLink to="/instructor/settings" icon={Settings} label="RÉGLAGES ACADEMY" current={location.pathname} />
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
      <span className="text-xs font-bold tracking-widest">{label}</span>
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

