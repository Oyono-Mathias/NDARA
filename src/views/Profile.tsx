import { User, Settings, Shield, HelpCircle, LogOut, ChevronRight, Globe } from "lucide-react";

export function ProfileView() {
  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <h1 className="font-serif text-3xl text-white">Profil</h1>
      </div>

      <div className="glass rounded-4xl p-6 flex items-center gap-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none"></div>
        <div className="w-20 h-20 rounded-full bg-card border-2 border-primary/50 overflow-hidden ring-4 ring-primary/10 shrink-0 relative z-10">
          <img src="https://i.pravatar.cc/150?img=11" alt="Profile" className="w-full h-full object-cover" />
        </div>
        <div className="relative z-10">
          <h2 className="font-serif text-2xl font-bold text-white mb-1">Kouame</h2>
          <p className="text-gray-400 text-sm mb-3">Étudiant Ndara</p>
          <span className="inline-flex py-1 px-3 rounded-full bg-secondary/10 text-secondary text-xs font-bold border border-secondary/20">
            COMPTE GSM VÉRIFIÉ
          </span>
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <h3 className="text-xs font-bold text-gray-500 tracking-widest uppercase mb-3 ml-2">Général</h3>
          <div className="glass rounded-3xl overflow-hidden">
            <ProfileLink icon={User} title="Carte d'Identité Bio" />
            <div className="h-[1px] w-full bg-white/5 ml-14"></div>
            <ProfileLink icon={Globe} title="Langue (Français, EN, SG)" />
            <div className="h-[1px] w-full bg-white/5 ml-14"></div>
            <ProfileLink icon={Shield} title="Sécurité & Souveraineté" />
          </div>
        </div>

        <div>
          <h3 className="text-xs font-bold text-gray-500 tracking-widest uppercase mb-3 ml-2">Assistance</h3>
          <div className="glass rounded-3xl overflow-hidden">
            <ProfileLink icon={HelpCircle} title="Centre de Support" />
            <div className="h-[1px] w-full bg-white/5 ml-14"></div>
            <ProfileLink icon={Settings} title="Réglages" />
          </div>
        </div>

        <button className="w-full glass rounded-3xl p-4 flex items-center justify-center gap-2 text-destructive font-bold hover:bg-destructive/10 transition-colors mt-8">
          <LogOut className="w-5 h-5" />
          Déconnexion
        </button>
      </div>
    </div>
  );
}

function ProfileLink({ icon: Icon, title }: { icon: any, title: string }) {
  return (
    <button className="w-full p-4 flex items-center justify-between hover:bg-white/5 transition-colors text-left">
      <div className="flex items-center gap-4">
        <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-gray-400">
          <Icon className="w-5 h-5" />
        </div>
        <span className="font-bold text-white text-sm">{title}</span>
      </div>
      <ChevronRight className="w-5 h-5 text-gray-500" />
    </button>
  );
}
