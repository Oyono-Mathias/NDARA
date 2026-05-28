import { CheckCircle, Eye, AlertTriangle } from "lucide-react";

export function AdminModeration() {
  return (
    <div className="space-y-6 animate-in fade-in duration-500 font-mono">
      <div className="flex items-center justify-between border-b border-[#10B981]/20 pb-6 mb-6">
        <h1 className="text-2xl font-black text-white tracking-widest uppercase flex items-center gap-3">
            <CheckCircle className="text-[#10B981] w-6 h-6" /> FILE_MODERATION
        </h1>
        <div className="text-red-500 text-xs font-bold bg-red-500/10 px-3 py-1 border border-red-500/30 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4" /> 5 Cours Urgents
        </div>
      </div>
      
      {/* List of courses awaiting moderation */}
      <div className="space-y-4">
          <ModRow title="Blockchain Avancée" author="Emmanuel D." mathiasScore="82/100" />
          <ModRow title="Trading Algorithmique" author="Kouame O." mathiasScore="91/100" />
          <ModRow title="IoT pour l'Agriculture" author="Sylvie M." mathiasScore="65/100" flag />
      </div>
    </div>
  );
}

function ModRow({ title, author, mathiasScore, flag }: any) {
    return (
        <div className={`bg-[#050505] border ${flag ? 'border-amber-500/30 bg-amber-500/5' : 'border-white/10'} p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4 transition group`}>
            <div>
                <h3 className="text-white font-bold text-lg mb-1">{title}</h3>
                <p className="text-gray-500 text-xs uppercase tracking-widest flex items-center gap-2">Instructor: <span className="text-white">{author}</span></p>
            </div>
            
            <div className="flex items-center gap-6">
                 <div>
                    <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold mb-1">Qualité IA</p>
                    <p className={`text-sm font-black ${flag ? 'text-amber-500' : 'text-[#10B981]'}`}>{mathiasScore}</p>
                </div>
                <div className="flex gap-2">
                    <button className="px-4 py-2 border border-white/20 text-gray-300 hover:bg-white/10 transition flex items-center gap-2 font-bold text-xs uppercase tracking-widest">
                        <Eye className="w-4 h-4" /> Audit R2
                    </button>
                    <button className="px-4 py-2 bg-[#10B981]/10 border border-[#10B981]/50 text-[#10B981] hover:bg-[#10B981] hover:text-black transition flex items-center gap-2 font-bold text-xs uppercase tracking-widest">
                        Valider Publication
                    </button>
                </div>
            </div>
        </div>
    )
}
