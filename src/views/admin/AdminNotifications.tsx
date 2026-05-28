import { BellRing, Send, Clock } from "lucide-react";

export function AdminNotifications() {
  return (
    <div className="space-y-6 animate-in fade-in duration-500 font-mono">
       <div className="flex items-center justify-between border-b border-[#10B981]/20 pb-6 mb-6">
         <h1 className="text-2xl font-black text-white tracking-widest uppercase flex items-center gap-3">
            <BellRing className="text-[#10B981] w-6 h-6" /> DIFFUSION_PUSH
        </h1>
      </div>

       <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
                <div className="bg-[#050505] border border-white/10 p-6">
                    <h3 className="text-white font-bold tracking-widest uppercase text-sm mb-4">Nouvelle Campagne Push</h3>
                    
                    <div className="space-y-4">
                        <div>
                            <label className="block text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-2">Cible</label>
                            <select className="w-full bg-black border border-white/20 text-white p-3 text-sm focus:border-[#10B981] outline-none transition">
                                <option>Tous les utilisateurs (12,482)</option>
                                <option>Étudiants actifs uniquement (8,531)</option>
                                <option>Experts certifiés (142)</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-2">Titre du message</label>
                            <input type="text" placeholder="Ex: Grosse mise à jour disponible !" className="w-full bg-black border border-white/20 text-white p-3 text-sm focus:border-[#10B981] outline-none transition" />
                        </div>
                         <div>
                            <label className="block text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-2">Contenu</label>
                            <textarea rows={4} placeholder="Texte de la notification..." className="w-full bg-black border border-white/20 text-white p-3 text-sm focus:border-[#10B981] outline-none transition"></textarea>
                        </div>
                        <button className="w-full py-4 bg-[#10B981] text-black font-black uppercase tracking-widest text-sm flex justify-center items-center gap-2 hover:bg-[#10B981]/80 transition">
                            <Send className="w-4 h-4" /> Envoyer Broadcast (FCM)
                        </button>
                    </div>
                </div>
            </div>

            <div className="space-y-6">
                 <div className="bg-[#050505] border border-white/10 p-6">
                     <h3 className="text-white font-bold tracking-widest uppercase text-sm mb-4">Historique</h3>
                     <div className="space-y-4">
                         <HistoryRow title="Lancement Afrique de l'Ouest" date="25 Mai 2026" reach="8.2K" />
                         <HistoryRow title="Maintenance Serveurs" date="12 Mai 2026" reach="12.4K" />
                     </div>
                 </div>
            </div>
       </div>
    </div>
  );
}

function HistoryRow({ title, date, reach }: any) {
    return (
        <div className="border-b border-white/5 pb-4 last:border-0 last:pb-0">
            <h4 className="text-sm font-bold text-white mb-1">{title}</h4>
            <div className="flex justify-between items-center text-[10px] uppercase font-bold tracking-widest">
                <span className="text-gray-500 flex items-center gap-1"><Clock className="w-3 h-3"/> {date}</span>
                <span className="text-[#10B981]">Portée: {reach}</span>
            </div>
        </div>
    )
}
