import { MessageCircleQuestion } from 'lucide-react';

export function QnaClient() {
    return (
        <div className="p-6 bg-[#1e293b] border border-white/5 rounded-[2rem] text-white shadow-xl mt-6">
            <h2 className="font-black uppercase tracking-tight text-xl mb-2 text-white">Sélection de questions</h2>
            <p className="text-sm font-medium text-slate-400 mb-8 italic">Le module Q&A est en cours de développement.</p>
            <div className="flex flex-col items-center justify-center py-12 text-center opacity-50">
               <MessageCircleQuestion className="h-10 w-10 text-slate-500 mb-4" />
               <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Pas de questions pour l'instant</p>
            </div>
        </div>
    );
}
