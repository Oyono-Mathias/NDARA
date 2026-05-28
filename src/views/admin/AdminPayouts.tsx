import { Banknote, AlertTriangle, ShieldCheck, Download } from "lucide-react";

export function AdminPayouts() {
  return (
    <div className="space-y-6 animate-in fade-in duration-500 font-mono">
      <div className="flex items-center justify-between border-b border-[#10B981]/20 pb-6 mb-6">
         <h1 className="text-2xl font-black text-white tracking-widest uppercase flex items-center gap-3">
            <Banknote className="text-[#10B981] w-6 h-6" /> TRESORERIE_CENTRALE
        </h1>
        <div className="text-red-500 text-xs font-bold bg-red-500/10 px-3 py-1 border border-red-500/30 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4" /> 1 Action Requise
        </div>
      </div>

       <div className="bg-[#050505] border border-red-500/30 hover:border-red-500/60 p-6 mb-8 transition relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4">
                <span className="text-red-500 text-[10px] font-bold tracking-widest uppercase animate-pulse">URGENT_ARBITRAGE</span>
            </div>
            
            <h3 className="text-lg font-bold text-white mb-4">Demande de décaissement massive</h3>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                 <div>
                     <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-1">Expert</p>
                     <p className="text-white text-sm font-bold">Emmanuel D.</p>
                 </div>
                 <div>
                     <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-1">Montant Demandé</p>
                     <p className="text-red-500 text-xl font-black">2,450,000 XAF</p>
                 </div>
                  <div>
                     <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-1">Moyen (MeSomb)</p>
                     <p className="text-white text-sm font-bold">Orange Money (CIV)</p>
                 </div>
                  <div>
                     <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-1">Dernier Cashout</p>
                     <p className="text-gray-400 text-sm">Il y a 14 jours</p>
                 </div>
            </div>

            <div className="flex gap-4">
                <button className="flex-1 py-3 bg-[#10B981] text-black font-black text-xs uppercase tracking-widest hover:bg-[#10B981]/80 transition flex justify-center items-center gap-2">
                    <ShieldCheck className="w-4 h-4"/> Autoriser Transaction
                </button>
                <button className="flex-1 py-3 border border-amber-500/30 text-amber-500 font-bold text-xs uppercase tracking-widest hover:bg-amber-500/10 transition flex justify-center items-center gap-2">
                    <AlertTriangle className="w-4 h-4"/> Geler les fonds (Audit)
                </button>
            </div>
       </div>

       <h3 className="text-white font-bold tracking-widest uppercase text-sm mb-4">Historique des Cashouts</h3>
       <div className="space-y-2">
           <PayoutRow expert="Kouame O." amount="120,000 XAF" method="MTN MoMo" date="Aujourd'hui, 08:30" />
           <PayoutRow expert="Sarah L." amount="340,000 XAF" method="Wave" date="Hier, 14:15" />
           <PayoutRow expert="Marc T." amount="55,000 XAF" method="Orange Money" date="26 Mai 2026" />
       </div>
    </div>
  );
}

function PayoutRow({ expert, amount, method, date }: any) {
    return (
        <div className="p-4 bg-white/5 border border-white/5 flex items-center justify-between hover:border-[#10B981]/30 transition group">
            <div className="flex gap-8">
                 <div>
                     <p className="text-white font-bold text-sm mb-0.5">{expert}</p>
                     <p className="text-[10px] text-gray-500 uppercase tracking-widest">{date}</p>
                 </div>
                 <div>
                     <p className="text-[#10B981] font-bold text-sm mb-0.5">{amount}</p>
                     <p className="text-[10px] text-gray-500 uppercase tracking-widest">{method}</p>
                 </div>
            </div>
            <button className="p-2 border border-white/10 hover:bg-white/10 transition text-gray-400 hover:text-white">
                <Download className="w-4 h-4" />
            </button>
        </div>
    )
}
