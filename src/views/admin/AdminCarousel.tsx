import { Image as ImageIcon, Plus, SwitchCamera } from "lucide-react";

export function AdminCarousel() {
  return (
    <div className="space-y-6 animate-in fade-in duration-500 font-mono">
       <div className="flex items-center justify-between border-b border-[#10B981]/20 pb-6 mb-6">
         <h1 className="text-2xl font-black text-white tracking-widest uppercase flex items-center gap-3">
            <SwitchCamera className="text-[#10B981] w-6 h-6" /> GESTION_CARROUSEL
        </h1>
        <button className="px-4 py-2 bg-[#10B981]/10 text-[#10B981] border border-[#10B981]/50 font-bold uppercase tracking-widest text-xs flex items-center gap-2 hover:bg-[#10B981]/30 transition">
            <Plus className="w-4 h-4"/> Ajouter Slide
        </button>
      </div>

       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
           <SlideCard order={1} title="Lancement Ndara v2.5" status="ACTIVE" image="gradient-to-br from-green-900 to-black" />
           <SlideCard order={2} title="Masterclass Intelligence Articifielle" status="ACTIVE" image="gradient-to-br from-blue-900 to-black" />
           <SlideCard order={3} title="Promo -50% Weekend" status="INACTIVE" image="gradient-to-br from-red-900 to-black" />
       </div>
    </div>
  );
}

function SlideCard({ order, title, status, image }: any) {
    const isActive = status === 'ACTIVE';
    return (
        <div className="bg-[#050505] border border-white/10 group hover:border-[#10B981]/50 transition flex flex-col h-64">
            <div className={`h-32 w-full bg-${image} flex items-center justify-center border-b border-white/10 relative`}>
                <ImageIcon className="w-8 h-8 text-white/50" />
                <div className="absolute top-2 left-2 bg-black/80 px-2 py-1 text-[10px] font-black tracking-widest text-white">#{order}</div>
                <div className="absolute top-2 right-2">
                    <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 border ${isActive ? 'text-[#10B981] border-[#10B981]/30 bg-[#10B981]/80 text-black' : 'text-gray-400 bg-black/80 border-white/20'}`}>
                        {status}
                    </span>
                </div>
            </div>
            <div className="p-4 flex-1 flex flex-col justify-between">
                <h3 className="text-white font-bold text-sm leading-tight">{title}</h3>
                <div className="flex gap-2 mt-4">
                    <button className="flex-1 py-2 border border-white/10 text-xs font-bold text-gray-400 uppercase tracking-widest hover:bg-white/10 transition">Editer</button>
                    <button className="px-3 py-2 border border-red-500/30 text-xs font-bold text-red-500 uppercase tracking-widest hover:bg-red-500/10 transition">X</button>
                </div>
            </div>
        </div>
    )
}
