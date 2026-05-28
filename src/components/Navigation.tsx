import { Link, useLocation } from "react-router-dom";
import { LayoutGrid, Search, BookOpen, Wallet, User } from "lucide-react";
import { clsx } from "clsx";

export function Navigation() {
  const location = useLocation();

  return (
    <nav className="fixed bottom-0 w-full max-w-md glass safe-bottom z-40">
      <div className="flex justify-around items-center h-20 px-2">
        <NavLink to="/student" icon={LayoutGrid} label="ACCUEIL" current={location.pathname} />
        <NavLink to="/student/search" icon={Search} label="CATALOGUE" current={location.pathname} />
        <NavLink to="/student/courses" icon={BookOpen} label="COURS" current={location.pathname} />
        <NavLink to="/student/wallet" icon={Wallet} label="WALLET" current={location.pathname} />
        <NavLink to="/student/profile" icon={User} label="PROFIL" current={location.pathname} />
      </div>
    </nav>
  );
}

function NavLink({ to, icon: Icon, label, current }: { to: string, icon: any, label: string, current: string }) {
  const isActive = current === to;
  return (
    <Link 
      to={to} 
      className={clsx(
        "flex flex-col items-center justify-center w-full h-full gap-1.5 transition-all group",
        isActive ? "text-primary drop-shadow-[0_0_8px_rgba(16,185,129,0.5)]" : "text-gray-500 hover:text-gray-300"
      )}
    >
      <Icon className={clsx("w-6 h-6 transition-transform duration-300", isActive ? "-translate-y-0.5" : "group-hover:scale-110")} />
      <span className="text-[10px] font-bold tracking-wide">{label}</span>
    </Link>
  );
}
