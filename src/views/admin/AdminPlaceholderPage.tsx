import React from 'react';
import { useLocation } from 'react-router-dom';
import { 
  Loader2, LayoutDashboard, BarChart2, Activity,
  Users, BookOpen, ShieldCheck, Radio, Globe,
  Wallet, CreditCard, TrendingUp, HelpCircle,
  MessageSquare, FileQuestion, Image as ImageIcon,
  Images, Search, Settings, KeyRound, History
} from 'lucide-react';

const routeConfig: Record<string, { title: string, icon: any }> = {
    "/admin": { title: "Tableau de Bord CEO", icon: LayoutDashboard },
    "/admin/analytics": { title: "Analytics", icon: BarChart2 },
    "/admin/monitoring": { title: "IA & Monitoring Actif", icon: Activity },
    "/admin/members": { title: "Gestion des Membres", icon: Users },
    "/admin/catalog": { title: "Catalogue Formations", icon: BookOpen },
    "/admin/moderation": { title: "Espace Modération", icon: ShieldCheck },
    "/admin/push": { title: "Diffusion Push & Notifs", icon: Radio },
    "/admin/countries": { title: "Pays & Devises", icon: Globe },
    "/admin/treasury": { title: "Trésorerie Centrale", icon: Wallet },
    "/admin/transactions": { title: "Registre Transactions", icon: CreditCard },
    "/admin/growth": { title: "Growth Hub & Partenaires", icon: TrendingUp },
    "/admin/help": { title: "Centre d'Aide & Support", icon: HelpCircle },
    "/admin/messages": { title: "Modération Messagerie", icon: MessageSquare },
    "/admin/faq": { title: "FAQ & Base de Connaissances", icon: FileQuestion },
    "/admin/carousel": { title: "Carrousel Accueil", icon: ImageIcon },
    "/admin/visuals": { title: "Bibliothèque de Visuels", icon: Images },
    "/admin/seo": { title: "SEO & Réseaux Sociaux", icon: Search },
    "/admin/settings": { title: "Réglages Globaux", icon: Settings },
    "/admin/roles": { title: "Rôles & Accès Sécurisés", icon: KeyRound },
    "/admin/audit": { title: "Journal d'Audit Système", icon: History },
};

export function AdminPlaceholderPage() {
    const location = useLocation();
    
    // Fallback if route is not matched
    const currentRoute = routeConfig[location.pathname] || { title: "Espace d'Administration", icon: Settings };
    const IconComponent = currentRoute.icon;

    return (
        <div className="flex-1 w-full h-full flex flex-col items-center justify-center min-h-[500px] animate-in fade-in duration-500">
            <div className="w-24 h-24 rounded-full bg-slate-800/40 border border-slate-700/50 flex flex-col items-center justify-center shadow-[0_0_30px_rgba(16,185,129,0.15)] mb-6 text-emerald-400 relative">
                <div className="absolute inset-0 rounded-full border border-emerald-500/20 animate-[spin_4s_linear_infinite]" />
                <IconComponent className="w-10 h-10 mb-1" />
            </div>
            
            <h2 className="text-2xl md:text-3xl font-black text-white uppercase tracking-widest text-center mb-4">
                {currentRoute.title}
            </h2>
            
            <div className="flex items-center gap-2 mb-8 bg-amber-500/10 px-4 py-2 border border-amber-500/20 rounded-lg">
                <Loader2 className="w-4 h-4 text-amber-500 animate-spin" />
                <p className="text-amber-400 text-xs font-bold uppercase tracking-widest">En cours de développement</p>
            </div>
            
            <p className="text-slate-400 text-sm text-center max-w-[400px] leading-relaxed">
                Ce module essentiel est actuellement en phase de conception au sein de l'infrastructure NDARA. Il sera déployé très prochainement pour étendre vos capacités d'administration.
            </p>
        </div>
    );
}
