import { Award } from 'lucide-react';

export function CertificatesClient() {
    return (
        <div className="p-6 bg-[#1e293b] border border-white/5 rounded-[2rem] text-white shadow-xl mt-6">
            <h2 className="font-black uppercase tracking-tight text-xl mb-2 text-white">Registre des certificats</h2>
            <p className="text-sm font-medium text-slate-400 mb-8 italic">Le registre est en cours de développement.</p>
            <div className="flex flex-col items-center justify-center py-12 text-center opacity-50">
               <Award className="h-10 w-10 text-slate-500 mb-4" />
               <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Aucun certificat pour l'instant</p>
            </div>
        </div>
    );
}
