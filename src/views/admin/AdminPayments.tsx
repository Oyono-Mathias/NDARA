import { Activity, Download, Search, RefreshCw } from "lucide-react";

export function AdminPayments() {
  return (
    <div className="space-y-6 animate-in fade-in duration-500 font-mono">
       <div className="flex items-center justify-between border-b border-[#10B981]/20 pb-6 mb-6">
         <h1 className="text-2xl font-black text-white tracking-widest uppercase flex items-center gap-3">
            <Activity className="text-[#10B981] w-6 h-6" /> REGISTRE_FLUX
        </h1>
        <button className="text-[#10B981] text-xs font-bold border border-[#10B981]/30 hover:bg-[#10B981]/10 px-4 py-2 flex items-center gap-2 transition">
            <Download className="w-4 h-4" /> Export CSV
        </button>
      </div>

       <div className="flex gap-4 mb-6">
          <div className="flex-1 relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Search className="text-[#10B981] w-4 h-4" />
            </div>
            <input 
              type="text" 
              placeholder="Chercher par Transaction ID, Utilisateur..." 
              className="w-full bg-black border border-[#10B981]/30 rounded-sm py-3 pl-10 pr-4 text-white focus:outline-none focus:border-[#10B981] transition-all text-sm"
            />
          </div>
          <button className="px-4 py-3 border border-[#10B981]/30 text-[#10B981] hover:bg-[#10B981]/10 transition flex items-center gap-2 text-sm font-bold">
              <RefreshCw className="w-4 h-4" /> Sync MeSomb
          </button>
       </div>

       <div className="w-full overflow-x-auto">
           <table className="w-full text-left text-sm text-gray-400">
               <thead className="text-[10px] font-black uppercase tracking-widest text-[#10B981] bg-[#10B981]/5 border-y border-[#10B981]/20">
                   <tr>
                       <th className="px-4 py-3">Tx ID</th>
                       <th className="px-4 py-3">Étudiant</th>
                       <th className="px-4 py-3">Achat (Cours / Bourse)</th>
                       <th className="px-4 py-3">Montant Brut</th>
                       <th className="px-4 py-3">Commissions (10/70/20)</th>
                       <th className="px-4 py-3 text-right">Statut</th>
                   </tr>
               </thead>
               <tbody className="divide-y divide-white/5 bg-black">
                   <TxRow tx="TX_99A1" user="A. Konan" item="Masterclass FinTech" amount="25,000 XAF" split="2.5k / 17.5k / 5k" status="SUCCESS" />
                   <TxRow tx="TX_8B2Z" user="M. Ouedrago" item="Dev Web3" amount="50,000 XAF" split="5k / 35k / 10k" status="SUCCESS" />
                   <TxRow tx="TX_7X4P" user="S. Diop" item="Trading Algo" amount="100,000 XAF" split="0 / 70k / 30k" status="FAILED" />
                   <TxRow tx="TX_6Y1L" user="K. Ndiaye" item="AgriTech Solutions" amount="15,000 XAF" split="1.5k / 10.5k / 3k" status="PENDING" />
               </tbody>
           </table>
       </div>
    </div>
  );
}

function TxRow({ tx, user, item, amount, split, status }: any) {
    const isSuccess = status === 'SUCCESS';
    const isFailed = status === 'FAILED';
    const statusColor = isSuccess ? 'text-[#10B981] border-[#10B981]/30 bg-[#10B981]/10' : 
                        isFailed ? 'text-red-500 border-red-500/30 bg-red-500/10' : 
                        'text-amber-500 border-amber-500/30 bg-amber-500/10';

    return (
        <tr className={`hover:bg-white/5 transition`}>
            <td className="px-4 py-4 font-mono text-xs">{tx}</td>
            <td className="px-4 py-4 font-bold text-white">{user}</td>
            <td className="px-4 py-4 text-xs">{item}</td>
            <td className="px-4 py-4 text-white font-bold">{amount}</td>
            <td className="px-4 py-4 text-xs font-mono text-gray-400">{split}</td>
            <td className="px-4 py-4 text-right">
                <span className={`px-2 py-0.5 text-[9px] font-black tracking-widest border ${statusColor}`}>
                    {status}
                </span>
            </td>
        </tr>
    );
}
