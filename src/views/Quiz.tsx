import { CheckCircle2, ChevronRight, XCircle } from "lucide-react";

export function QuizView() {
  return (
    <div className="fixed inset-0 bg-black z-50 flex flex-col animate-in slide-in-from-bottom duration-500">
      {/* Top Bar */}
      <div className="glass border-b border-white/10 px-6 py-4 flex items-center justify-between z-10 shrink-0">
          <div>
              <p className="text-primary text-[10px] font-bold uppercase tracking-widest mb-0.5">Évaluation</p>
              <h2 className="font-serif text-lg text-white font-bold">Sécurité d'un Smart Contract</h2>
          </div>
          <button className="text-gray-400 hover:text-white transition">Fermer</button>
      </div>

       {/* Progress Bar */}
       <div className="w-full bg-white/5 h-1.5 shrink-0">
            <div className="bg-primary h-full shadow-[0_0_15px_rgba(16,185,129,0.8)] transition-all duration-500" style={{width: '60%'}}></div>
       </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto px-6 py-12 flex flex-col justify-center max-w-xl mx-auto w-full relative">
          
          <div className="absolute top-8 left-6 text-gray-500 font-serif text-lg font-bold">
              Question 3/5
          </div>

          <h3 className="text-2xl md:text-3xl font-serif text-white leading-tight mb-8">
              Quelle est la faille de sécurité la plus courante lors de l'envoi d'Ether à un contrat externe ?
          </h3>

          <div className="space-y-4">
              <button className="w-full glass p-5 rounded-2xl flex items-center justify-between text-left hover:bg-white/10 transition group border border-white/5">
                  <span className="text-white text-sm font-bold group-hover:text-primary transition">A. Underflow / Overflow</span>
                  <div className="w-6 h-6 rounded-full border-2 border-white/20 group-hover:border-primary transition"></div>
              </button>
              
              <button className="w-full glass p-5 rounded-2xl flex items-center justify-between text-left border-primary/50 bg-primary/10 shadow-[0_0_15px_rgba(16,185,129,0.1)] transition group relative overflow-hidden tracking-wide text-primary">
                  <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-transparent"></div>
                  <span className="text-primary font-bold text-sm relative z-10">B. Reentrancy Attack</span>
                  <div className="w-6 h-6 rounded-full border-2 border-primary bg-primary flex items-center justify-center relative z-10">
                      <div className="w-2.5 h-2.5 bg-background rounded-full"></div>
                  </div>
              </button>

              <button className="w-full glass p-5 rounded-2xl flex items-center justify-between text-left hover:bg-white/10 transition group border border-white/5">
                  <span className="text-white text-sm font-bold group-hover:text-primary transition">C. Man-in-the-middle</span>
                  <div className="w-6 h-6 rounded-full border-2 border-white/20 group-hover:border-primary transition"></div>
              </button>
              
               <button className="w-full glass p-5 rounded-2xl flex items-center justify-between text-left hover:bg-white/10 transition group border border-white/5">
                  <span className="text-white text-sm font-bold group-hover:text-primary transition">D. SQL Injection</span>
                  <div className="w-6 h-6 rounded-full border-2 border-white/20 group-hover:border-primary transition"></div>
              </button>
          </div>
      </div>

       {/* Bottom Actions */}
       <div className="p-6 shrink-0 max-w-xl mx-auto w-full">
            <button className="w-full bg-white hover:bg-gray-200 text-black py-4 flex items-center justify-center gap-2 font-bold text-sm rounded-xl transition shadow-[0_0_20px_rgba(255,255,255,0.2)]">
                Valider ma réponse <ChevronRight className="w-5 h-5"/>
            </button>
       </div>
    </div>
  );
}
