import { Brain, FileText, CheckCircle2 } from "lucide-react";

export function AdminFAQ() {
  return (
    <div className="w-full px-4 flex flex-col items-stretch space-y-6 animate-in fade-in duration-500 font-mono">
       <div className="flex items-center justify-between border-b border-[#10B981]/20 pb-6 mb-6">
         <h1 className="text-2xl font-black text-white tracking-widest uppercase flex items-center gap-3">
            <Brain className="text-[#10B981] w-6 h-6" /> BASE_TRAINING_IA
        </h1>
        <button className="px-4 py-2 bg-[#10B981] text-black font-black uppercase tracking-widest text-xs hover:bg-[#10B981]/80 transition">
            Ajouter Connaissance
        </button>
      </div>
      
      <p className="text-sm text-gray-400 mb-8 max-w-2xl">
          Gérez ici la base de connaissances racine du moteur MATHIAS IA. Ces informations seront utilisées pour répondre aux questions des étudiants et des experts.
      </p>

      <div className="space-y-4">
          <KnowledgeRow title="Comment retirer mes fonds ?" category="FINANCE" status="ACTIVE" />
          <KnowledgeRow title="Critères de qualité des cours" category="PEDAGOGIE" status="ACTIVE" />
          <KnowledgeRow title="Politique de remboursement" category="LEGAL" status="DRAFT" />
      </div>
    </div>
  );
}

function KnowledgeRow({ title, category, status }: any) {
    return (
        <div className="bg-[#050505] p-5 border border-white/10 hover:border-[#10B981]/50 transition flex justify-between items-center group">
            <div className="flex items-center gap-4">
                <FileText className="w-5 h-5 text-gray-500 group-hover:text-[#10B981] transition" />
                <div>
                     <h3 className="text-white font-bold text-sm mb-1">{title}</h3>
                     <span className="text-[10px] text-gray-500 font-bold tracking-widest uppercase">{category}</span>
                </div>
            </div>
            <div className="flex items-center gap-4">
                 <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 border ${status === 'ACTIVE' ? 'text-[#10B981] border-[#10B981]/30 bg-[#10B981]/10' : 'text-gray-400 border-white/10 bg-white/5'}`}>
                     {status}
                 </span>
                 <button className="text-xs text-[#10B981] font-bold uppercase tracking-widest hover:text-white transition">Editer</button>
            </div>
        </div>
    )
}
