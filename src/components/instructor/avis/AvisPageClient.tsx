import { Star } from 'lucide-react';

export function AvisPageClient() {
    return (
        <div className="p-6 bg-[#1e293b] border border-white/5 rounded-[2rem] text-white shadow-xl mt-6">
            <h2 className="font-black uppercase tracking-tight text-xl mb-2 text-white">Tous les avis</h2>
            <p className="text-sm font-medium text-slate-400 mb-8 italic">Triez et répondez aux témoignages de vos apprenants.</p>
            <div className="flex flex-col items-center justify-center py-12 text-center opacity-50">
               <Star className="h-10 w-10 text-slate-500 mb-4" />
               <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Module de modération en développement</p>
            </div>
        </div>
    );
}
