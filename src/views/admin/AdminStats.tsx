import { FileBarChart2, PieChart, Users, TrendingUp } from "lucide-react";

export function AdminStats() {
  return (
    <div className="space-y-8 animate-in fade-in duration-500 font-mono">
      <div className="flex items-center justify-between border-b border-[#10B981]/20 pb-6 mb-8">
        <h1 className="text-2xl font-black text-white tracking-widest uppercase flex items-center gap-3">
            <FileBarChart2 className="text-[#10B981] w-6 h-6" /> DATA_ANALYTICS_CORE
        </h1>
        <div className="flex gap-2">
            <button className="bg-[#10B981]/10 text-[#10B981] border border-[#10B981]/50 px-4 py-2 text-xs font-bold uppercase tracking-widest hover:bg-[#10B981] hover:text-black transition">Mois</button>
            <button className="bg-black text-gray-400 border border-white/10 px-4 py-2 text-xs font-bold uppercase tracking-widest hover:text-white transition">Année</button>
        </div>
      </div>

       <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
           <div className="bg-[#050505] border border-[#10B981]/20 p-6">
                <h2 className="text-white font-bold tracking-widest uppercase text-sm mb-6 flex items-center gap-2">
                    <PieChart className="w-4 h-4 text-[#10B981]" /> Répartition Revenus
                </h2>
                <div className="space-y-4">
                    <ProgressBar label="Ventes Directes Cours" value="65%" color="bg-[#10B981]" amount="12.5M XAF" />
                    <ProgressBar label="Commissions Affiliés" value="25%" color="bg-blue-400" amount="4.8M XAF" />
                    <ProgressBar label="Frais Gateway (Mobile Money)" value="10%" color="bg-amber-500" amount="1.9M XAF" />
                </div>
           </div>

           <div className="bg-[#050505] border border-[#10B981]/20 p-6">
                <h2 className="text-white font-bold tracking-widest uppercase text-sm mb-6 flex items-center gap-2">
                    <Users className="w-4 h-4 text-[#10B981]" /> Top Ambassadeurs
                </h2>
                <div className="space-y-3">
                    <AmbassadorRow rank="1" name="Emmanuel D." refs="142" amount="850K XAF" />
                    <AmbassadorRow rank="2" name="Sylvie M." refs="89" amount="520K XAF" />
                    <AmbassadorRow rank="3" name="Kouame O." refs="45" amount="210K XAF" />
                </div>
           </div>
       </div>

       <div className="bg-[#050505] border border-[#10B981]/20 p-6">
             <h2 className="text-white font-bold tracking-widest uppercase text-sm mb-6 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-[#10B981]" /> Croissance Bourse (Revente Licences)
              </h2>
               <div className="h-48 flex items-center justify-center border border-dashed border-[#10B981]/20 bg-[#10B981]/5">
                   <p className="text-[#10B981]/50 text-xs font-mono uppercase tracking-widest">[ Secondary_Market_Data_Viz ]</p>
               </div>
       </div>
    </div>
  );
}

function ProgressBar({ label, value, color, amount }: any) {
    return (
        <div>
            <div className="flex justify-between text-xs font-bold uppercase tracking-wider mb-2">
                <span className="text-gray-400">{label}</span>
                <span className="text-white">{amount} <span className="text-gray-600">({value})</span></span>
            </div>
            <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                <div className={`h-full ${color}`} style={{width: value}}></div>
            </div>
        </div>
    )
}

function AmbassadorRow({ rank, name, refs, amount }: any) {
    return (
        <div className="flex items-center justify-between p-3 bg-white/5 border border-white/5 hover:border-[#10B981]/30 transition">
             <div className="flex items-center gap-4">
                 <span className="text-[#10B981] font-black text-lg w-4">#{rank}</span>
                 <div>
                     <p className="text-white text-sm font-bold">{name}</p>
                     <p className="text-gray-500 text-[10px] uppercase tracking-widest">{refs} Affiliations</p>
                 </div>
             </div>
             <span className="text-[#10B981] font-bold text-sm bg-[#10B981]/10 px-2 py-1">{amount}</span>
        </div>
    )
}
