import React from "react";
import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  BarChart2,
  Activity,
  Users,
  BookOpen,
  ShieldCheck,
  Radio,
  Globe,
  Store,
  Wallet,
  CreditCard,
  TrendingUp,
  HelpCircle,
  MessageSquare,
  FileQuestion,
  Image as ImageIcon,
  Images,
  Search,
  Settings,
  KeyRound,
  History,
  LogOut,
  MonitorSmartphone,
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
      { label: "IA Mathias Config", icon: Activity, path: "/admin/ai" },
    ],
  },
  {
    title: "OPÉRATIONS",
    routes: [
      { label: "Membres", icon: Users, path: "/admin/members" },
      {
        label: "Formateurs (Attente)",
        icon: Users,
        path: "/admin/instructors",
      },
      { label: "Catalogue", icon: BookOpen, path: "/admin/catalog" },
      { label: "Marchés & Bourse", icon: Store, path: "/admin/markets" },
      { label: "Communautés (Squads)", icon: Users, path: "/admin/squads" },
      { label: "Modération", icon: ShieldCheck, path: "/admin/moderation" },
      { label: "Diffusion Push", icon: Radio, path: "/admin/push" },
      { label: "Pays & Devises", icon: Globe, path: "/admin/countries" },
    ],
  },
  {
    title: "FINANCES",
    routes: [
      { label: "Trésorerie", icon: Wallet, path: "/admin/treasury" },
      { label: "Transactions", icon: CreditCard, path: "/admin/transactions" },
      { label: "Growth Hub", icon: TrendingUp, path: "/admin/growth" },
    ],
  },
  {
    title: "SUPPORT",
    routes: [
      { label: "Centre d'Aide", icon: HelpCircle, path: "/admin/help" },
      {
        label: "Modération Messagerie",
        icon: MessageSquare,
        path: "/admin/messages",
      },
      { label: "FAQ & Base", icon: FileQuestion, path: "/admin/faq" },
    ],
  },
  {
    title: "INTERFACE",
    routes: [
      {
        label: "Vitrine (Landing)",
        icon: MonitorSmartphone,
        path: "/admin/vitrine",
      },
      { label: "Carrousel Accueil", icon: ImageIcon, path: "/admin/carousel" },
      { label: "Bibliothèque Visuels", icon: Images, path: "/admin/visuals" },
      { label: "SEO & Social", icon: Search, path: "/admin/seo" },
    ],
  },
  {
    title: "SÉCURITÉ",
    routes: [
      { label: "Réglages Globaux", icon: Settings, path: "/admin/settings" },
      { label: "Rôles & Accès", icon: KeyRound, path: "/admin/roles" },
      { label: "Journal d'Audit", icon: History, path: "/admin/audit" },
    ],
  },
];

export function AdminNavigation({
  isSidebarOpen,
  onClose,
}: {
  isSidebarOpen?: boolean;
  onClose?: () => void;
}) {
  const location = useLocation();

  return (
    <>
      {/* Overlay for Mobile */}
      {isSidebarOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black/50 z-40 transition-opacity"
          onClick={onClose}
        />
      )}

      {/* Sidebar: Fixed Drawer on Mobile, Relative Fixed Width on Desktop */}
      <aside
        className={clsx(
          "fixed md:relative inset-y-0 left-0 z-50 flex flex-col w-72 h-full bg-[#090E17] border-r border-slate-800/50 shrink-0 font-sans transition-transform duration-300 ease-in-out",
          isSidebarOpen
            ? "translate-x-0"
            : "-translate-x-full md:translate-x-0",
        )}
      >
        {/* Header Profil */}
        <div className="p-6 shrink-0">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500 flex items-center justify-center text-white font-black text-xl">
                N
              </div>
              <h1 className="font-black text-white tracking-widest text-lg leading-none uppercase">
                NDARA
              </h1>
            </div>
            {/* Close Button for Mobile */}
            <button
              onClick={onClose}
              className="md:hidden p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/50 transition-colors"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M18 6 6 18" />
                <path d="m6 6 12 12" />
              </svg>
            </button>
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
              <h2 className="text-sm font-bold text-white leading-tight mb-1">
                OYONO MATHIAS
              </h2>
              <p className="text-[10px] font-bold text-slate-400 tracking-widest uppercase">
                SUPER ADMIN
              </p>
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
                  const isActive =
                    route.path === "/admin"
                      ? location.pathname === route.path
                      : location.pathname.startsWith(route.path);
                  return (
                    <Link
                      key={route.path}
                      to={route.path}
                      onClick={onClose}
                      className={clsx(
                        "flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all duration-200 group text-sm font-medium",
                        isActive
                          ? "bg-slate-800/60 text-slate-200"
                          : "text-slate-400 hover:text-slate-300 hover:bg-slate-800/30",
                      )}
                    >
                      <route.icon
                        className={clsx(
                          "w-4 h-4 shrink-0 transition-colors",
                          isActive
                            ? "text-emerald-400"
                            : "text-slate-500 group-hover:text-slate-400",
                        )}
                      />
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
            <LogOut className="w-4 h-4" /> QUITTER L'ADMIN
          </Link>
        </div>
      </aside>
    </>
  );
}
