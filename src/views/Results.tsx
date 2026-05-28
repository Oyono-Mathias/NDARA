import { Award, Target, BrainCircuit, ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";

export function ResultsView() {
  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center justify-between mb-2">
        <h1 className="font-serif text-3xl text-white">Scores & Registre</h1>
      </div>

      {/* Global Average Card */}
      <div className="glass rounded-4xl p-6 relative overflow-hidden border border-primary/20 glow-green">
         <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-2xl -mr-10 -mt-10"></div>
         <div className="flex items-center justify-between relative z-10">
             <div>
                 <p className="text-primary text-[10px] font-black tracking-widest uppercase mb-1">Moyenne Générale</p>
                 <div className="flex items-baseline gap-2">
                     <span className="font-serif text-5xl font-bold text-white">85</span>
                     <span className="text-xl text-gray-500">/100</span>
                 </div>
             </div>
             <div className="w-16 h-16 rounded-full glass border border-primary/30 flex items-center justify-center text-primary shadow-[0_0_15px_rgba(16,185,129,0.3)]">
                 <Target className="w-8 h-8" />
             </div>
         </div>
      </div>

      {/* AI Analysis */}
      <div className="glass-light rounded-3xl p-5 border border-amber-500/20 relative overflow-hidden group mb-8">
          <div className="absolute inset-0 bg-gradient-to-r from-amber-500/10 to-transparent"></div>
          <div className="flex gap-4 items-start relative z-10">
              <div className="w-10 h-10 rounded-full bg-amber-500/20 text-amber-500 flex items-center justify-center shrink-0">
                  <BrainCircuit className="w-5 h-5" />
              </div>
              <div>
                  <h3 className="font-serif text-white font-bold text-lg mb-1">Analyse de Mathias IA</h3>
                  <p className="text-gray-300 text-sm leading-relaxed mb-3">
                      Tes performances en Analyse Technique sont excellentes. Cependant, tu as perdu quelques points sur la notion de "Smart Contracts".
                  </p>
                  <button className="text-amber-500 font-bold text-xs uppercase tracking-wider flex items-center gap-1 hover:text-amber-400 transition">
                      Lancer une révision ciblée <ChevronRight className="w-4 h-4"/>
                  </button>
              </div>
          </div>
      </div>

      <h3 className="font-serif text-xl text-white mb-4">Historique des Évaluations</h3>
      
      <div className="space-y-4">
          <div className="glass rounded-3xl p-5 flex items-center justify-between group">
              <div>
                  <h4 className="font-bold text-white text-sm mb-1">Quiz Analyse Crypto</h4>
                  <p className="text-gray-400 text-xs">Il y a 2 jours</p>
              </div>
              <div className="text-right">
                  <p className="text-primary font-bold font-serif text-xl">95/100</p>
                  <p className="text-gray-500 text-[10px] uppercase tracking-widest font-bold">Excellent</p>
              </div>
          </div>

          <div className="glass rounded-3xl p-5 flex items-center justify-between group">
              <div>
                  <h4 className="font-bold text-white text-sm mb-1">Projet: Sécurité Web3</h4>
                  <p className="text-gray-400 text-xs">Semaine dernière</p>
              </div>
              <div className="text-right">
                  <p className="text-white font-bold font-serif text-xl">70/100</p>
                  <p className="text-amber-500 text-[10px] uppercase tracking-widest font-bold">À améliorer</p>
              </div>
          </div>
          
           <div className="glass rounded-3xl p-5 flex items-center justify-between group">
              <div>
                  <h4 className="font-bold text-white text-sm mb-1">Quiz Fondations FinTech</h4>
                  <p className="text-gray-400 text-xs">Il y a 1 mois</p>
              </div>
              <div className="text-right">
                  <p className="text-white font-bold font-serif text-xl">90/100</p>
                  <p className="text-gray-500 text-[10px] uppercase tracking-widest font-bold">Validé</p>
              </div>
          </div>
      </div>
    </div>
  );
}
