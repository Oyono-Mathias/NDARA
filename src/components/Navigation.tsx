import { Link, useLocation } from "react-router-dom";
import { LayoutGrid, Search, BookOpen, User, Menu } from "lucide-react";
import { clsx } from "clsx";
import { useScrollDirection } from "../hooks/useScrollDirection";
import { TouchArea } from "./ui/TouchArea";

export function Navigation({ onMenuClick }: { onMenuClick?: () => void }) {
  const location = useLocation();
  const { visible } = useScrollDirection();

  // Hide completely on detail/interactive pages
  const isHiddenRoute = /^\/student\/(catalog\/[^/]+|ebooks\/[^/]+|courses\/[^/]+|assignments\/[^/]+|messages|quiz|sandbox|support)/.test(location.pathname);

  if (isHiddenRoute) return null;

  return (
    <nav className={clsx("fixed bottom-0 w-full glass safe-bottom z-40 transition-transform duration-300 ease-in-out", visible ? "translate-y-0" : "translate-y-full")}>
      <div className="flex justify-around items-center h-20 px-2 pb-2">
        <NavLink to="/student/dashboard" icon={LayoutGrid} label="ACCUEIL" current={location.pathname} />
        <NavLink to="/student/search" icon={Search} label="CATALOGUE" current={location.pathname} />
        <NavLink to="/student/courses" icon={BookOpen} label="COURS" current={location.pathname} />
        <NavLink to="/student/profile" icon={User} label="PROFIL" current={location.pathname} />
        
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

function NavLink({ to, icon: Icon, label, current }: { to: string, icon: any, label: string, current: string }) {
  const isActive = current === to || current.startsWith(to + '/');
  return (
    <Link 
      to={to} 
      className="flex-1 flex justify-center h-full"
    >
      <TouchArea as="div" className={clsx(
          "flex flex-col items-center justify-center w-full h-full gap-1.5 transition-all group rounded-xl",
          isActive ? "text-primary drop-shadow-[0_0_8px_rgba(16,185,129,0.5)]" : "text-gray-500 hover:text-gray-300"
        )}>
        <Icon className={clsx("w-6 h-6 transition-transform duration-300", isActive ? "-translate-y-0.5 scale-110" : "group-hover:scale-110")} />
        <span className={clsx("text-[10px] font-bold tracking-wide", isActive && "text-primary")}>{label}</span>
      </TouchArea>
    </Link>
  );
}
