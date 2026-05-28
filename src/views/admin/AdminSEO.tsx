import { Globe, Share2, Save } from "lucide-react";

export function AdminSEO() {
  return (
    <div className="space-y-6 animate-in fade-in duration-500 font-mono">
       <div className="flex items-center justify-between border-b border-[#10B981]/20 pb-6 mb-6">
         <h1 className="text-2xl font-black text-white tracking-widest uppercase flex items-center gap-3">
            <Globe className="text-[#10B981] w-6 h-6" /> METADONNEES_SEO
        </h1>
        <button className="px-4 py-2 bg-[#10B981] text-black font-black uppercase tracking-widest text-xs flex items-center gap-2 hover:bg-[#10B981]/80 transition">
            <Save className="w-4 h-4" /> Sauvegarder
        </button>
      </div>

       <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="space-y-6">
                <div className="bg-[#050505] border border-white/10 p-6 space-y-4">
                     <h3 className="text-white font-bold tracking-widest uppercase text-sm mb-4">Balises Standards</h3>
                     <div>
                        <label className="block text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-2">Titre par défaut (Title)</label>
                        <input type="text" defaultValue="Ndara - L'Académie du Succès en Afrique" className="w-full bg-black border border-white/20 text-white p-3 text-sm focus:border-[#10B981] outline-none transition" />
                     </div>
                     <div>
                        <label className="block text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-2">Description (Meta Description)</label>
                        <textarea rows={3} defaultValue="Apprenez les compétences les plus demandées en Afrique. Payez par Mobile Money." className="w-full bg-black border border-white/20 text-white p-3 text-sm focus:border-[#10B981] outline-none transition"></textarea>
                     </div>
                </div>

                <div className="bg-[#050505] border border-white/10 p-6 space-y-4">
                     <h3 className="text-white font-bold tracking-widest uppercase text-sm mb-4 flex items-center gap-2">
                        <Share2 className="w-4 h-4 text-[#10B981]" /> Social Graph (OG)
                     </h3>
                     <div>
                        <label className="block text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-2">Image de couverture OG (URL)</label>
                        <input type="text" defaultValue="https://ndara.africa/og-image.jpg" className="w-full bg-black border border-white/20 text-white p-3 text-sm focus:border-[#10B981] outline-none transition" />
                     </div>
                </div>
            </div>

            <div className="bg-[#050505] border border-white/10 p-6">
                <h3 className="text-white font-bold tracking-widest uppercase text-sm mb-4">Aperçu Réseaux Sociaux</h3>
                <div className="border border-white/20 rounded-md overflow-hidden bg-[#1D2226]">
                    <div className="h-48 bg-gray-800 flex items-center justify-center relative">
                        <div className="absolute inset-0 bg-gradient-to-br from-green-900/40 to-black"></div>
                        <span className="text-white font-black text-2xl relative z-10 tracking-widest">NDARA</span>
                    </div>
                    <div className="p-4 bg-[#1D2226]">
                        <p className="text-gray-400 text-xs truncate mb-1">ndara.africa</p>
                        <h4 className="text-[#E9E9E9] font-semibold text-base font-sans leading-tight mb-2">Ndara - L'Académie du Succès en Afrique</h4>
                        <p className="text-gray-400 text-sm font-sans line-clamp-2">Apprenez les compétences les plus demandées en Afrique. Payez par Mobile Money.</p>
                    </div>
                </div>
                <p className="text-[10px] text-gray-500 font-bold tracking-widest uppercase mt-4 text-center">Simulation LinkedIn / Twitter</p>
            </div>
       </div>
    </div>
  );
}
