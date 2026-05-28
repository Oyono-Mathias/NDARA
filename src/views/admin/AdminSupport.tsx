import { LifeBuoy, Filter } from "lucide-react";

export function AdminSupport() {
  return (
    <div className="space-y-6 animate-in fade-in duration-500 font-mono">
       <div className="flex items-center justify-between border-b border-[#10B981]/20 pb-6 mb-6">
         <h1 className="text-2xl font-black text-white tracking-widest uppercase flex items-center gap-3">
            <LifeBuoy className="text-[#10B981] w-6 h-6" /> CENTRE_SUPPORT
        </h1>
        <div className="flex gap-2">
            <button className="px-3 py-1 bg-[#10B981]/10 text-[#10B981] border border-[#10B981]/30 text-xs font-bold uppercase tracking-widest hover:bg-[#10B981]/30 transition">
                Ouverts (12)
            </button>
             <button className="px-3 py-1 bg-white/5 text-gray-400 border border-white/10 text-xs font-bold uppercase tracking-widest hover:bg-white/10 transition">
                Résolus
            </button>
        </div>
      </div>
      
      <div className="space-y-4">
          <TicketRow id="TK-882" subject="Problème paiement MeSomb" user="Sylvie M." time="Il y a 10 min" status="OPEN" priority="HIGH" category="FINANCE" />
          <TicketRow id="TK-881" subject="Accès cours bloqué" user="Kouame O." time="Il y a 1 heure" status="OPEN" priority="NORMAL" category="TECH" />
          <TicketRow id="TK-880" subject="Demande partenariat" user="Marc T." time="Il y a 3 heures" status="OPEN" priority="LOW" category="BUSINESS" />
      </div>
    </div>
  );
}

function TicketRow({ id, subject, user, time, status, priority, category }: any) {
    const pColor = priority === 'HIGH' ? 'text-red-500' : priority === 'NORMAL' ? 'text-amber-500' : 'text-blue-400';
    return (
        <div className="bg-[#050505] border border-white/10 p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:border-[#10B981]/30 transition cursor-pointer">
            <div className="flex items-start gap-4">
                <div className="mt-1">
                    <LifeBuoy className={`w-5 h-5 ${pColor}`} />
                </div>
                <div>
                    <h3 className="text-white font-bold text-base mb-1">{subject}</h3>
                    <div className="flex items-center gap-3 text-[10px] uppercase tracking-widest font-bold">
                        <span className="text-[#10B981]">{id}</span>
                        <span className="text-gray-500">{user}</span>
                        <span className="text-gray-600">{time}</span>
                    </div>
                </div>
            </div>
            <div className="flex items-center gap-3">
                 <span className="text-[9px] uppercase tracking-widest font-black text-gray-400 bg-white/5 px-2 py-0.5 border border-white/10">
                    {category}
                </span>
                <span className={`text-[9px] uppercase tracking-widest font-black px-2 py-0.5 border ${status === 'OPEN' ? 'text-amber-500 border-amber-500/30 bg-amber-500/10' : 'text-[#10B981] border-[#10B981]/30 bg-[#10B981]/10'}`}>
                    {status}
                </span>
            </div>
        </div>
    )
}
