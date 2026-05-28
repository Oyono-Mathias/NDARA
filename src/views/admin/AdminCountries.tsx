import { Globe2, Rss, ShieldCheck } from "lucide-react";

export function AdminCountries() {
  return (
    <div className="space-y-6 animate-in fade-in duration-500 font-mono">
      <div className="flex items-center justify-between border-b border-[#10B981]/20 pb-6 mb-6">
        <h1 className="text-2xl font-black text-white tracking-widest uppercase flex items-center gap-3">
            <Globe2 className="text-[#10B981] w-6 h-6" /> EXPANSION_GEO
        </h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <CountryGateway
            country="Côte d'Ivoire"
            code="CIV"
            gateways={['Orange Money', 'MTN', 'Wave']}
            status="ACTIVE"
          />
           <CountryGateway
             country="Sénégal"
             code="SEN"
             gateways={['Orange Money', 'Wave', 'Free Money']}
             status="ACTIVE"
           />
           <CountryGateway
             country="Cameroun"
             code="CMR"
             gateways={['MTN', 'Orange Money']}
             status="ACTIVE"
           />
           <CountryGateway
             country="Centrafrique"
             code="RCA"
             gateways={['Orange Money']}
             status="ROLLOUT"
           />
      </div>
    </div>
  );
}

function CountryGateway({ country, code, gateways, status }: any) {
    const isActive = status === 'ACTIVE';
    return (
        <div className="bg-[#050505] border border-white/10 p-5 group hover:border-[#10B981]/50 transition relative overflow-hidden">
             {isActive && <div className="absolute top-0 right-0 w-2 h-2 bg-[#10B981] m-2"></div>}
             <div className="flex justify-between items-start mb-4">
                 <div>
                     <h3 className="text-xl font-bold text-white mb-1">{country} ({code})</h3>
                     <span className={`text-[9px] font-black tracking-widest px-2 py-0.5 border ${isActive ? 'text-[#10B981] border-[#10B981]/30 bg-[#10B981]/10' : 'text-amber-500 border-amber-500/30 bg-amber-500/10'}`}>
                         {status}
                     </span>
                 </div>
                 <Globe2 className="w-8 h-8 text-white/5 group-hover:text-[#10B981]/20 transition" />
             </div>

             <div className="space-y-3">
                 <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest border-b border-white/5 pb-1 block">Gateways Momo Actives</p>
                 <div className="flex flex-wrap gap-2">
                     {gateways.map((g: string) => (
                         <span key={g} className="text-xs bg-white/5 text-gray-300 px-2 py-1 flex items-center gap-1.5 border border-white/5">
                             <Rss className="w-3 h-3 text-[#10B981]" /> {g}
                         </span>
                     ))}
                 </div>
             </div>
             
             <div className="mt-6 pt-4 border-t border-white/5 flex items-center justify-between">
                 <span className="text-[9px] font-bold text-gray-500 tracking-widest uppercase flex items-center gap-1">
                     <ShieldCheck className="w-3 h-3" /> MeSomb Verified
                 </span>
                 <button className="text-[#10B981] text-xs font-bold uppercase tracking-widest hover:text-white transition">Modifier</button>
             </div>
        </div>
    );
}
