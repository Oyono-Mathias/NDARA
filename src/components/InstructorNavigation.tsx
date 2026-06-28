import React from 'react';
import { Link, useLocation } from "react-router-dom";
import { LayoutDashboard, BookOpen, MessageSquare, ClipboardCheck, Building, Menu } from "lucide-react";
import { clsx } from "clsx";
import { useScrollDirection } from "../hooks/useScrollDirection";
import { TouchArea } from "./ui/TouchArea";

export function InstructorNavigation({ onMenuClick }: { onMenuClick?: () => void }) {
  const location = useLocation();
  const { visible } = useScrollDirection();

  const isHiddenRoute = location.pathname.includes('/messages') && (location.search.includes('chatId=') || location.search.includes('newChatUser='));

  if (isHiddenRoute) return null;

  return (
    <nav className={clsx("fixed bottom-0 w-full glass safe-bottom z-40 transition-transform duration-300 ease-in-out", visible ? "translate-y-0" : "translate-y-full")}>
      <div className="flex justify-around items-center h-20 px-2 pb-2">
        <MobileNavLink to="/instructor/dashboard" icon={LayoutDashboard} label="COCKPIT" current={location.pathname} />
        <MobileNavLink to="/instructor/courses" icon={BookOpen} label="CATALOGUE" current={location.pathname} />
        <MobileNavLink to="/instructor/messages" icon={MessageSquare} label="MESSAGES" current={location.pathname} />
        <MobileNavLink to="/instructor/revenus" icon={Building} label="WEALTH" current={location.pathname} />
        
        <button className="flex-1 flex justify-center h-full" onClick={onMenuClick}>
          <TouchArea as="div" className="flex flex-col items-center justify-center w-full h-full gap-1.5 transition-all group rounded-xl text-gray-500 hover:text-gray-300">
            <Menu className="w-6 h-6 transition-transform duration-300 group-hover:scale-110" />
            <span className="text-[10px] font-bold tracking-wide">MENU</span>
          </TouchArea>
        </button>
      </div>
    </nav>
  );
}

function MobileNavLink({ to, icon: Icon, label, current }: { to: string, icon: any, label: string, current: string, key?: string }) {
  const isActive = current === to || current.startsWith(to + '/');
  return (
    <Link 
      to={to} 
      className="flex-1 flex justify-center h-full"
    >
      <TouchArea as="div" className={clsx(
          "flex flex-col items-center justify-center w-full h-full gap-1.5 transition-all group rounded-xl",
          isActive ? "text-secondary drop-shadow-[0_0_8px_rgba(204,119,34,0.5)]" : "text-gray-500 hover:text-gray-300"
        )}>
        <Icon className={clsx("w-6 h-6 transition-transform duration-300", isActive ? "-translate-y-0.5 scale-110" : "group-hover:scale-110")} />
        <span className={clsx("text-[10px] font-bold tracking-wide", isActive && "text-secondary")}>{label}</span>
      </TouchArea>
    </Link>
  );
}

