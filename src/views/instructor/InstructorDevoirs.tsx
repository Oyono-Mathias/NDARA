import { CheckCircle2, Clock, AlertTriangle, MessageSquare, ExternalLink } from "lucide-react";
import { Link } from "react-router-dom";

export function InstructorDevoirs() {
  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-4xl text-white mb-2 leading-none">Correction</h1>
          <p className="text-secondary text-sm font-bold uppercase tracking-wider">Usine de Correction</p>
        </div>
        <div className="flex border border-white/10 bg-card rounded-2xl p-1 w-full md:w-auto h-12">
            <button className="flex-1 md:px-6 rounded-xl bg-white/10 text-white font-bold text-sm shadow-sm transition">À Corriger (15)</button>
            <button className="flex-1 md:px-6 rounded-xl text-gray-500 hover:text-white font-bold text-sm transition">Historique</button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {/* Urgent Devioir */}
        <div className="glass rounded-3xl p-5 md:p-6 card-hover group border border-destructive/30 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-destructive/10 to-transparent opacity-10"></div>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
                <div className="flex gap-4 items-start">
                    <div className="w-12 h-12 rounded-2xl bg-destructive/20 flex items-center justify-center text-destructive shrink-0">
                        <AlertTriangle className="w-6 h-6" />
                    </div>
                    <div>
                        <div className="flex items-center gap-2 mb-1.5">
                            <span className="px-2 py-0.5 bg-destructive/20 text-destructive text-[10px] font-black rounded-md border border-destructive/30 uppercase tracking-widest">Urgent (48h dépassées)</span>
                            <span className="text-gray-500 text-xs font-bold">•</span>
                            <span className="text-gray-400 text-xs font-bold uppercase tracking-wider">Projet Final</span>
                        </div>
                        <h3 className="font-serif text-xl font-bold text-white mb-1">Architecture Blockchain Privée</h3>
                        <p className="text-gray-400 text-sm">FinTech Fondations • Soumis par <span className="text-white font-bold">Emmanuel D.</span></p>
                    </div>
                </div>

                <div className="flex items-center gap-4 border-t border-white/5 pt-4 md:pt-0 md:border-none">
                     <div className="hidden md:block text-right mr-4">
                         <p className="text-xs text-gray-500 font-bold uppercase tracking-widest mb-1">Mathias IA Auto-Score</p>
                         <p className="text-secondary font-bold font-serif">85/100 (Bon)</p>
                     </div>
                     <Link to="/instructor/devoirs/1" className="w-full md:w-auto px-6 py-3 bg-secondary hover:bg-amber-600 text-background flex items-center justify-center gap-2 font-bold text-sm rounded-xl transition shadow-[0_0_15px_rgba(204,119,34,0.3)]">
                         Corriger <ExternalLink className="w-4 h-4"/>
                     </Link>
                </div>
            </div>
        </div>

        {/* Regular Devoir */}
        <div className="glass rounded-3xl p-5 md:p-6 card-hover group border border-white/10">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex gap-4 items-start">
                    <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shrink-0 border border-primary/20">
                        <Clock className="w-6 h-6" />
                    </div>
                    <div>
                        <div className="flex items-center gap-2 mb-1.5">
                            <span className="px-2 py-0.5 bg-white/5 text-gray-300 text-[10px] font-black rounded-md border border-white/10 uppercase tracking-widest">Nouveau</span>
                            <span className="text-gray-500 text-xs font-bold">•</span>
                            <span className="text-gray-400 text-xs font-bold uppercase tracking-wider">Atelier Pratique</span>
                        </div>
                        <h3 className="font-serif text-xl font-bold text-white mb-1">Analyse des risques Mobile Money</h3>
                        <p className="text-gray-400 text-sm">Gestion FinTech • Soumis par <span className="text-white font-bold">Sylvie M.</span></p>
                    </div>
                </div>

                <div className="flex items-center gap-4 border-t border-white/5 pt-4 md:pt-0 md:border-none">
                     <div className="hidden md:block text-right mr-4">
                         <p className="text-xs text-gray-500 font-bold uppercase tracking-widest mb-1">Mathias IA Linter</p>
                         <p className="text-primary font-bold font-serif text-sm">Analyse prête</p>
                     </div>
                     <Link to="/instructor/devoirs/2" className="w-full md:w-auto px-6 py-3 glass-light hover:bg-white/10 text-white flex items-center justify-center gap-2 font-bold text-sm rounded-xl transition">
                         Ouvrir
                     </Link>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
}
