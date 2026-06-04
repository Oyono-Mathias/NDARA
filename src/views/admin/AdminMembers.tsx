import React, { useState } from 'react';
import { 
  Users, Search, Filter, MoreVertical, X, 
  Eye, User, History, MessageSquare, Wallet, Landmark,
  ShieldCheck, UserCog, Edit3, SquareUser, Ban 
} from 'lucide-react';
import clsx from 'clsx';

// Mock data
const mockMembers = [
  { id: 'usr_8f4x9v', name: 'Tabitha Yamete', email: 'tabitha@ndara.com', role: 'Étudiant', signup: '12 Mai 2026', status: 'Actif' },
  { id: 'usr_2x7l1p', name: 'Jean Dupont', email: 'jean@ndara.com', role: 'Instructeur', signup: '10 Mai 2026', status: 'Actif' },
  { id: 'usr_9p3k4m', name: 'Alice Mfomou', email: 'alice@ndara.com', role: 'Étudiant', signup: '08 Mai 2026', status: 'Suspendu' },
];

export function AdminMembers() {
  const [selectedMember, setSelectedMember] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredMembers = mockMembers.filter(m => 
    m.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    m.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-20 relative">
       <header>
        <h1 className="text-3xl font-black text-white uppercase tracking-widest">Gestion des Membres</h1>
        <p className="text-slate-400 mt-1 text-sm">Recherchez, filtrez et gérez tous les membres de la plateforme.</p>
      </header>
      
      {/* Search and filter bar */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input 
            type="text" 
            placeholder="Rechercher un membre par nom ou email..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-800/50 border border-slate-700/50 rounded-2xl py-3.5 pl-11 pr-4 text-white text-sm font-medium focus:outline-none focus:border-emerald-500/50 transition-colors placeholder:text-slate-500/70"
          />
        </div>
        <button className="flex items-center justify-center gap-2 px-6 py-3.5 bg-slate-800/50 border border-slate-700/50 rounded-2xl text-white font-bold text-xs uppercase tracking-widest hover:bg-slate-700/50 transition-colors">
          <Filter className="w-4 h-4" /> Filtres
        </button>
      </div>

      {/* Users Table */}
      <div className="bg-slate-800/30 border border-slate-700/50 rounded-3xl overflow-hidden">
        <div className="overflow-x-auto hide-scrollbar">
          <table className="w-full text-left border-collapse min-w-[600px]">
            <thead>
              <tr className="border-b border-slate-700/50 text-[10px] font-black text-slate-500 uppercase tracking-widest bg-slate-900/30">
                <th className="p-4 pl-6">Utilisateur</th>
                <th className="p-4">Rôle</th>
                <th className="p-4">Inscription</th>
                <th className="p-4">Statut</th>
                <th className="p-4 pr-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="text-sm divide-y divide-slate-700/30">
              {filteredMembers.map((member) => (
                <tr key={member.id} className="hover:bg-slate-800/50 transition-colors group">
                  <td className="p-4 pl-6">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center shrink-0 border border-slate-700 group-hover:border-emerald-500/30 transition-colors">
                        <Users className="w-4 h-4 text-emerald-500" />
                      </div>
                      <div>
                        <p className="font-bold text-white">{member.name}</p>
                        <p className="text-[11px] text-slate-400 mt-0.5 font-medium">{member.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    <span className={clsx(
                      "inline-flex items-center justify-center text-[10px] font-bold px-2.5 py-1 rounded-md border uppercase tracking-widest",
                      member.role === 'Instructeur' 
                        ? "text-blue-400 bg-blue-500/10 border-blue-500/20" 
                        : "text-emerald-400 bg-emerald-500/10 border-emerald-500/20"
                    )}>
                      {member.role}
                    </span>
                  </td>
                  <td className="p-4 text-slate-400 text-xs font-medium">
                    {member.signup}
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                       <span className="relative flex h-2.5 w-2.5">
                        {member.status === 'Actif' && <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-20"></span>}
                        <span className={clsx("relative inline-flex rounded-full h-2.5 w-2.5", member.status === 'Actif' ? "bg-emerald-500" : "bg-red-500")}></span>
                      </span>
                      <span className="text-xs font-bold text-slate-300">{member.status}</span>
                    </div>
                  </td>
                  <td className="p-4 pr-6 text-right">
                    <button 
                      onClick={() => setSelectedMember(member)}
                      className="w-8 h-8 rounded-lg bg-slate-800/50 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors inline-flex items-center justify-center border border-slate-700/50 shadow-sm"
                    >
                      <MoreVertical className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {filteredMembers.length === 0 && (
              <div className="p-10 text-center text-slate-500 text-sm font-bold uppercase tracking-widest">
                  Aucun membre trouvé.
              </div>
          )}
        </div>
      </div>

      {/* Admin User Context Menu (Bottom Sheet on Mobile / Modal on Desktop) */}
      {selectedMember && (
        <>
          {/* Overlay */}
          <div 
            className="fixed inset-0 bg-black/60 z-40 animate-in fade-in duration-300 backdrop-blur-sm"
            onClick={() => setSelectedMember(null)}
          />

          {/* Container */}
          <div className="fixed bottom-0 left-0 right-0 z-50 bg-[#090E17] rounded-t-3xl border-t border-slate-800 p-6 animate-in slide-in-from-bottom duration-300 max-h-[85vh] overflow-y-auto hide-scrollbar md:top-1/2 md:bottom-auto md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:w-[420px] md:h-auto md:rounded-3xl md:border shadow-2xl">
              
              {/* Drag handle (Mobile only) */}
              <div className="w-12 h-1.5 bg-slate-800 rounded-full mx-auto mb-6 md:hidden" />

              {/* Close button (Desktop) */}
              <button 
                onClick={() => setSelectedMember(null)}
                className="hidden md:flex absolute top-4 right-4 w-8 h-8 items-center justify-center rounded-full bg-slate-800 text-slate-400 hover:text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>

              {/* Header (Profil cible) */}
              <div className="flex items-center gap-4 mb-8">
                <div className="w-14 h-14 rounded-full bg-slate-800 flex items-center justify-center border-2 border-slate-700">
                    <User className="w-6 h-6 text-slate-400" />
                </div>
                <div>
                    <h3 className="text-white font-black text-xl tracking-tight">{selectedMember.name}</h3>
                    <p className="text-slate-500 font-mono text-[10px] mt-0.5 uppercase tracking-widest flex items-center gap-2">
                        #{selectedMember.id.split('_')[1]}
                        <span className="w-1 h-1 rounded-full bg-slate-600"></span>
                        {selectedMember.role}
                    </p>
                </div>
              </div>

              {/* Action Sections */}
              <div className="space-y-6 pb-6 md:pb-2">
                
                {/* Section Info & Sécurité */}
                <div className="space-y-1">
                  <h4 className="text-[10px] font-black uppercase text-slate-600 tracking-widest pl-2 mb-3">Info & Sécurité</h4>
                  <ActionButton icon={Eye} label="Détails & Soldes" />
                  <ActionButton icon={User} label="Voir profil public" />
                  <ActionButton icon={History} label="Logs Sécurité" />
                </div>

                {/* Section Communication */}
                <div className="space-y-1">
                  <h4 className="text-[10px] font-black uppercase text-slate-600 tracking-widest pl-2 mb-3">Communication</h4>
                  <ActionButton icon={MessageSquare} label="Envoyer message" />
                </div>

                {/* Section Finances */}
                <div className="space-y-1">
                  <h4 className="text-[10px] font-black uppercase text-slate-600 tracking-widest pl-2 mb-3">Finances</h4>
                  <ActionButton icon={Wallet} label="Recharger Wallet" iconColor="text-emerald-500" />
                  <ActionButton icon={Landmark} label="Débiter Wallet" iconColor="text-amber-500" />
                </div>

                {/* Section Formation & Rôles */}
                <div className="space-y-1">
                  <h4 className="text-[10px] font-black uppercase text-slate-600 tracking-widest pl-2 mb-3">Formation & Rôles</h4>
                  <ActionButton icon={ShieldCheck} label="Gérer l'accès & Droits" />
                  <ActionButton icon={UserCog} label="Changer Rôle" />
                  <ActionButton icon={Edit3} label="Modifier le profil" />
                </div>

                {/* Section Restrictions (Critique Sécurité) */}
                <div className="space-y-1 pt-6 border-t border-slate-800">
                  <h4 className="text-[10px] font-black uppercase text-slate-600 tracking-widest pl-2 mb-3">Restrictions Système</h4>
                  <ActionButton icon={SquareUser} label="Se connecter en tant que" iconColor="text-slate-400" />
                  <ActionButton 
                    icon={Ban} 
                    label={selectedMember.status === 'Actif' ? "Suspendre le compte" : "Réactiver le compte"} 
                    iconColor="text-red-500" 
                    textColor="text-red-500" 
                    hoverBg="hover:bg-red-500/10" 
                  />
                </div>

              </div>
          </div>
        </>
      )}
    </div>
  );
}

function ActionButton({ 
    icon: Icon, 
    label, 
    iconColor = "text-slate-400", 
    textColor = "text-slate-300",
    hoverBg = "hover:bg-slate-800/50"
}: { 
    icon: any, 
    label: string, 
    iconColor?: string, 
    textColor?: string,
    hoverBg?: string 
}) {
    return (
        <button className={clsx("w-full flex items-center gap-4 px-4 py-3.5 rounded-xl transition-colors active:scale-[0.98]", hoverBg)}>
            <div className={clsx("w-8 h-8 rounded-lg flex items-center justify-center shrink-0 bg-slate-800/50", hoverBg !== "hover:bg-slate-800/50" && hoverBg.replace("hover:", ""))}>
               <Icon className={clsx("w-4 h-4", iconColor)} />
            </div>
            <span className={clsx("text-sm font-bold tracking-tight", textColor)}>
                {label}
            </span>
        </button>
    );
}
