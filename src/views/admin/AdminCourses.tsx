import { Database, Search, Filter, MoreHorizontal, FileText, CheckCircle2 } from "lucide-react";

export function AdminCourses() {
  return (
    <div className="space-y-6 animate-in fade-in duration-500 font-mono">
      <div className="flex items-center justify-between border-b border-[#10B981]/20 pb-6 mb-6">
        <h1 className="text-2xl font-black text-white tracking-widest uppercase flex items-center gap-3">
            <Database className="text-[#10B981] w-6 h-6" /> CATALOGUE_MAITRE
        </h1>
        <div className="text-[#10B981] text-xs font-bold bg-[#10B981]/10 px-3 py-1 border border-[#10B981]/30">
            142 Actifs
        </div>
      </div>

       <div className="flex gap-4 mb-6">
          <div className="flex-1 relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Search className="text-[#10B981] w-4 h-4" />
            </div>
            <input 
              type="text" 
              placeholder="Rechercher par Titre, Auteur ou ID..." 
              className="w-full bg-black border border-[#10B981]/30 rounded-sm py-3 pl-10 pr-4 text-white focus:outline-none focus:border-[#10B981] transition-all text-sm"
            />
          </div>
          <button className="px-4 py-3 border border-[#10B981]/30 text-[#10B981] hover:bg-[#10B981]/10 transition flex items-center gap-2 text-sm font-bold">
              <Filter className="w-4 h-4" /> Filtres
          </button>
       </div>

       <div className="w-full overflow-x-auto">
           <table className="w-full text-left text-sm text-gray-400">
               <thead className="text-[10px] font-black uppercase tracking-widest text-[#10B981] bg-[#10B981]/5 border-y border-[#10B981]/20">
                   <tr>
                       <th className="px-4 py-3">Course ID</th>
                       <th className="px-4 py-3">Titre & Domaine</th>
                       <th className="px-4 py-3">Auteur (Propriétaire)</th>
                       <th className="px-4 py-3">Statut</th>
                       <th className="px-4 py-3">Ventes</th>
                       <th className="px-4 py-3 text-right">Actions</th>
                   </tr>
               </thead>
               <tbody className="divide-y divide-white/5 bg-black">
                   <CourseRow cid="C_1A9" title="Masterclass FinTech" domain="Finance" author="Emmanuel D." status="PUBLISHED" sales="842" />
                   <CourseRow cid="C_8B2" title="Smart Contracts V2" domain="Dev Web3" author="Sarah L." status="PUBLISHED" sales="156" />
                   <CourseRow cid="C_3X4" title="AgriTech Solutions" domain="Agriculture" author="Ndara Core" status="RE-ASSIGNED" sales="45" highlight />
               </tbody>
           </table>
       </div>
    </div>
  );
}

function CourseRow({ cid, title, domain, author, status, sales, highlight }: any) {
    return (
        <tr className={`hover:bg-white/5 transition ${highlight ? 'border-l-2 border-l-[#10B981]' : ''}`}>
            <td className="px-4 py-4 font-mono text-xs">{cid}</td>
            <td className="px-4 py-4">
                <div className="text-white font-bold flex items-center gap-2">
                    <FileText className="w-4 h-4 text-gray-500" /> {title}
                </div>
                <div className="text-[10px] text-gray-500 uppercase tracking-widest mt-1 ml-6">{domain}</div>
            </td>
            <td className="px-4 py-4 text-xs font-bold text-gray-300">{author}</td>
            <td className="px-4 py-4">
                <span className={`px-2 py-0.5 text-[9px] font-black tracking-widest border ${status === 'PUBLISHED' ? 'text-[#10B981] border-[#10B981]/30 bg-[#10B981]/10' : 'text-blue-400 border-blue-400/30 bg-blue-400/10'}`}>
                    {status}
                </span>
            </td>
            <td className="px-4 py-4 text-white font-bold text-xs">{sales}</td>
            <td className="px-4 py-4 text-right">
                <button className="p-1 hover:bg-white/10 rounded-sm text-gray-400 hover:text-white transition">
                    <MoreHorizontal className="w-4 h-4" />
                </button>
            </td>
        </tr>
    );
}
