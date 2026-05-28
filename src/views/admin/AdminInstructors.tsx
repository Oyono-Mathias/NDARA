import { UserCheck, CheckCircle2, XCircle } from "lucide-react";

export function AdminInstructors() {
  return (
    <div className="space-y-6 animate-in fade-in duration-500 font-mono">
      <div className="flex items-center justify-between border-b border-[#10B981]/20 pb-6 mb-6">
        <h1 className="text-2xl font-black text-white tracking-widest uppercase flex items-center gap-3">
            <UserCheck className="text-[#10B981] w-6 h-6" /> AUDIT_CANDIDATURES
        </h1>
        <div className="text-amber-500 text-xs font-bold bg-amber-500/10 px-3 py-1 border border-amber-500/30">
            3 En Attente
        </div>
      </div>

      <div className="space-y-4">
          <ApplicationRow name="Marc T." expertise="AgriTech" match="95%" />
          <ApplicationRow name="Sarah L." expertise="Dev Web3" match="88%" />
          <ApplicationRow name="David K." expertise="FinTech" match="72%" warning />
      </div>
    </div>
  );
}

function ApplicationRow({ name, expertise, match, warning }: any) {
    return (
        <div className="bg-[#050505] border border-white/10 p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:border-[#10B981]/50 transition group">
            <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
                    <UserCheck className="w-5 h-5 text-gray-400 group-hover:text-[#10B981] transition" />
                </div>
                <div>
                    <h3 className="text-white font-bold text-lg">{name}</h3>
                    <p className="text-gray-500 text-xs uppercase tracking-widest">{expertise}</p>
                </div>
            </div>
            
            <div className="flex items-center gap-6">
                <div className="text-right">
                    <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold mb-1">SCORE_MATHIAS</p>
                    <p className={`text-lg font-black ${warning ? 'text-amber-500' : 'text-[#10B981]'}`}>{match}</p>
                </div>
                <div className="flex gap-2">
                    <button className="p-2 border border-red-500/30 text-red-500 hover:bg-red-500/10 transition">
                        <XCircle className="w-5 h-5" />
                    </button>
                    <button className="p-2 border border-[#10B981]/30 text-[#10B981] hover:bg-[#10B981]/10 transition flex items-center gap-2 font-bold text-xs uppercase tracking-widest">
                        <CheckCircle2 className="w-5 h-5" /> Approuver
                    </button>
                </div>
            </div>
        </div>
    )
}
