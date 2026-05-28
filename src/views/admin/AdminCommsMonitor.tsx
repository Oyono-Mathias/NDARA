import { MessageSquare, ShieldAlert, Search } from "lucide-react";

export function AdminCommsMonitor() {
  return (
    <div className="space-y-6 animate-in fade-in duration-500 font-mono">
       <div className="flex items-center justify-between border-b border-[#10B981]/20 pb-6 mb-6">
         <h1 className="text-2xl font-black text-white tracking-widest uppercase flex items-center gap-3">
            <MessageSquare className="text-[#10B981] w-6 h-6" /> RADAR_COMMUNICATIONS
        </h1>
        <div className="text-amber-500 text-xs font-bold bg-amber-500/10 px-3 py-1 border border-amber-500/30 flex items-center gap-2">
            <ShieldAlert className="w-4 h-4" /> 2 Signalements
        </div>
      </div>

       <div className="flex gap-4 mb-6">
          <div className="flex-1 relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Search className="text-[#10B981] w-4 h-4" />
            </div>
            <input 
              type="text" 
              placeholder="Rechercher UID ou mots-clés interdits..." 
              className="w-full bg-black border border-[#10B981]/30 rounded-sm py-3 pl-10 pr-4 text-white focus:outline-none focus:border-[#10B981] transition-all text-sm"
            />
          </div>
       </div>
       
       <div className="space-y-4">
           <MessageFlag user="Sylvie M." expert="Emmanuel D."  context="Cours: Web3" reason="Partage numéro de téléphone" severity="HIGH" time="Aujourd'hui, 09:12" />
           <MessageFlag user="Inconnu" expert="Kouame O."  context="Message direct" reason="Spam / Publicité externe" severity="MEDIUM" time="Hier, 16:45" />
       </div>
    </div>
  );
}

function MessageFlag({ user, expert, context, reason, severity, time }: any) {
    const isHigh = severity === 'HIGH';
    return (
        <div className={`bg-[#050505] border ${isHigh ? 'border-red-500/30' : 'border-amber-500/30'} p-5 relative group`}>
             <div className="absolute top-0 right-0 p-3">
                <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 border ${isHigh ? 'text-red-500 border-red-500/30 bg-red-500/10' : 'text-amber-500 border-amber-500/30 bg-amber-500/10'}`}>
                    Gravité: {severity}
                </span>
             </div>
             
             <div className="mb-4">
                 <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-1">Motif de l'interception</p>
                 <p className="text-white font-bold">{reason}</p>
             </div>

             <div className="grid grid-cols-3 gap-4 mb-6 p-4 bg-white/5 border border-white/5">
                 <div>
                     <p className="text-[9px] text-gray-500 font-bold uppercase tracking-widest mb-1">Envoyeur</p>
                     <p className="text-white text-xs font-bold">{user}</p>
                 </div>
                  <div>
                     <p className="text-[9px] text-gray-500 font-bold uppercase tracking-widest mb-1">Destinataire</p>
                     <p className="text-white text-xs font-bold">{expert}</p>
                 </div>
                 <div className="text-right">
                     <p className="text-[9px] text-gray-500 font-bold uppercase tracking-widest mb-1">Contexte</p>
                     <p className="text-gray-400 text-xs">{context}</p>
                 </div>
             </div>

             <div className="flex justify-between items-center">
                 <span className="text-[10px] text-gray-600 font-bold tracking-widest uppercase">{time}</span>
                 <div className="flex gap-2">
                     <button className="px-4 py-2 border border-white/20 text-gray-400 text-xs font-bold uppercase tracking-widest hover:bg-white/10 transition">Ignorer</button>
                     <button className="px-4 py-2 border border-red-500/50 bg-red-500/10 text-red-500 text-xs font-bold uppercase tracking-widest hover:bg-red-500 hover:text-white transition">Bannir (7J)</button>
                 </div>
             </div>
        </div>
    )
}
