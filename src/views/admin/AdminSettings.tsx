import { Settings, Server, DatabaseZap } from "lucide-react";

export function AdminSettings() {
  return (
    <div className="space-y-6 animate-in fade-in duration-500 font-mono">
       <div className="flex items-center justify-between border-b border-[#10B981]/20 pb-6 mb-6">
         <h1 className="text-2xl font-black text-white tracking-widest uppercase flex items-center gap-3">
            <Settings className="text-[#10B981] w-6 h-6" /> CONFIGURATION_MAITRE
        </h1>
        <button className="px-4 py-2 bg-[#10B981] text-black font-black uppercase tracking-widest text-xs hover:bg-[#10B981]/80 transition">
            Sauvegarder
        </button>
      </div>

       <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
           <div className="space-y-6">
               <div className="bg-[#050505] border border-white/10 p-6">
                   <h3 className="text-white font-bold tracking-widest uppercase text-sm mb-6 flex items-center gap-2">
                       <DatabaseZap className="w-4 h-4 text-[#10B981]" /> Variables Économiques
                   </h3>
                   <div className="space-y-4">
                       <div>
                           <label className="block text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-2">Commission Plateforme (%)</label>
                           <input type="number" defaultValue={20} className="w-full bg-black border border-white/20 text-white p-3 text-sm focus:border-[#10B981] outline-none transition font-mono" />
                       </div>
                       <div>
                           <label className="block text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-2">Commission Parrainage (%)</label>
                           <input type="number" defaultValue={10} className="w-full bg-black border border-white/20 text-white p-3 text-sm focus:border-[#10B981] outline-none transition font-mono" />
                       </div>
                   </div>
               </div>

                <div className="bg-[#050505] border border-white/10 p-6">
                   <h3 className="text-white font-bold tracking-widest uppercase text-sm mb-6 flex items-center gap-2">
                       <Server className="w-4 h-4 text-[#10B981]" /> Cloudflare R2 / Bunny Stream
                   </h3>
                   <div className="space-y-4">
                       <div>
                           <label className="block text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-2">CDN Endpoint</label>
                           <input type="text" defaultValue="https://cdn.ndara.africa" className="w-full bg-black border border-white/20 text-white p-3 text-sm focus:border-[#10B981] outline-none transition font-mono" />
                       </div>
                   </div>
               </div>
           </div>

            <div className="bg-[#050505] border border-white/10 p-6">
                 <h3 className="text-white font-bold tracking-widest uppercase text-sm mb-6">Mode Maintenance</h3>
                 <p className="text-gray-400 text-xs mb-6">Activer le mode maintenance empêchera les étudiants et experts de se connecter. Seuls les administrateurs auront accès.</p>
                 
                 <label className="flex items-center cursor-pointer mb-6">
                    <div className="relative">
                    <input type="checkbox" className="sr-only" />
                    <div className="block bg-white/10 w-14 h-8 rounded-full"></div>
                    <div className="dot absolute left-1 top-1 bg-gray-500 w-6 h-6 rounded-full transition"></div>
                    </div>
                    <div className="ml-3 text-white font-bold text-sm tracking-widest uppercase">
                    Désactivé
                    </div>
                </label>

                <div className="border border-red-500/30 bg-red-500/5 p-4 rounded-sm">
                    <p className="text-red-500 font-bold text-xs uppercase tracking-widest mb-2">ZONE DE DANGER</p>
                    <p className="text-gray-400 text-xs mb-4">Effacer le cache du CDN ou réinitialiser les index de recherche.</p>
                    <button className="w-full py-2 border border-red-500/50 text-red-500 text-xs font-bold uppercase tracking-widest hover:bg-red-500/10 transition">
                        Purge CDN Cache
                    </button>
                </div>
            </div>
       </div>
    </div>
  );
}
