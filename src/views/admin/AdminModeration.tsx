import React from 'react';
import { 
  ShieldCheck, 
  Check, 
  X, 
  Eye, 
  FileText,
  Clock,
  PlayCircle
} from 'lucide-react';

export function AdminModeration() {
  return (
    <div className="space-y-8 animate-in fade-in duration-700 pb-20 relative font-sans">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[400px] bg-purple-500/5 blur-[100px] pointer-events-none" />

      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-5 relative z-10">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-purple-500 mb-1">
            <ShieldCheck className="h-4 w-4" />
            <span className="text-[10px] font-black uppercase tracking-[0.3em]">Conformité & Qualité</span>
          </div>
          <h1 className="text-3xl font-black text-white uppercase tracking-tight">Modération</h1>
          <p className="text-slate-400 text-sm font-medium">Examinez et approuvez les nouveaux cours soumis par les instructeurs.</p>
        </div>
      </header>

      {/* Moderation Cards Queue (Mobile-First approach) */}
      <div className="relative z-10 space-y-4">
        {[1, 2, 3].map((item) => (
          <div key={item} className="bg-slate-800/40 border border-slate-700/50 rounded-3xl p-5 md:p-6 flex flex-col md:flex-row gap-6 shadow-xl relative overflow-hidden transition-all hover:bg-slate-800/60">
            {/* Thumbnail */}
            <div className="w-full md:w-64 h-40 md:h-full bg-slate-900 rounded-2xl border border-slate-800 flex items-center justify-center shrink-0 relative overflow-hidden">
               <PlayCircle className="w-10 h-10 text-slate-700" />
               <div className="absolute top-3 left-3 bg-amber-500/20 text-amber-500 border border-amber-500/30 px-2.5 py-1 rounded text-[9px] font-black uppercase tracking-widest backdrop-blur-md">
                 En attente
               </div>
            </div>

            {/* Course Info */}
            <div className="flex-1 flex flex-col justify-between gap-4">
               <div>
                  <div className="flex items-center gap-2 text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">
                    <Clock className="w-3.5 h-3.5" /> Soumis il y a 2 heures
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2 leading-tight">Masterclass: Développement Web Avancé avec React {item}</h3>
                  <p className="text-sm text-slate-400 line-clamp-2 md:line-clamp-3">
                    Dans ce cours complet, les étudiants apprendront à maîtriser React, Tailwind CSS et les concepts architecturaux modernes pour construire des applications scalables.
                  </p>
               </div>

               {/* Instructor & Meta */}
               <div className="flex flex-wrap items-center gap-4 bg-slate-900/50 p-3 rounded-xl border border-slate-800">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 bg-slate-800 rounded-full flex items-center justify-center">
                      <span className="text-[10px] font-black text-slate-400">J</span>
                    </div>
                    <span className="text-xs font-bold text-white">Jean Dupont</span>
                  </div>
                  <div className="w-1 h-1 rounded-full bg-slate-700 hidden sm:block" />
                  <div className="flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5 text-slate-500" />
                    <span className="text-xs font-medium text-slate-400">12 Chapitres</span>
                  </div>
                  <div className="w-1 h-1 rounded-full bg-slate-700 hidden sm:block" />
                  <div className="text-xs font-bold text-emerald-400">25 000 XAF</div>
               </div>
            </div>

            {/* Actions (Touch friendly) */}
            <div className="flex flex-row md:flex-col justify-end gap-3 shrink-0 pt-4 md:pt-0 border-t md:border-t-0 border-slate-700/50 md:pl-6 md:border-l">
               <button className="flex-1 md:flex-none flex items-center justify-center gap-2 h-12 md:h-10 px-4 rounded-xl bg-emerald-500 text-slate-950 font-black uppercase text-[10px] tracking-widest hover:bg-emerald-400 transition-colors shadow-lg shadow-emerald-500/20">
                 <Check className="w-4 h-4" /> Approuver
               </button>
               <button className="flex-1 md:flex-none flex items-center justify-center gap-2 h-12 md:h-10 px-4 rounded-xl bg-slate-800 text-slate-300 border border-slate-700 font-bold uppercase text-[10px] tracking-widest hover:bg-slate-700 transition-colors">
                 <Eye className="w-4 h-4" /> Examiner
               </button>
               <button className="flex-1 md:flex-none flex items-center justify-center gap-2 h-12 md:h-10 px-4 rounded-xl bg-red-500/10 text-red-400 border border-red-500/20 font-bold uppercase text-[10px] tracking-widest hover:bg-red-500 hover:text-white transition-colors">
                 <X className="w-4 h-4" /> Rejeter
               </button>
            </div>
          </div>
        ))}
        <div className="text-center pt-8 opacity-50">
           <p className="text-sm font-bold text-slate-500 uppercase tracking-widest">Fin de la file d'attente</p>
        </div>
      </div>
    </div>
  );
}
