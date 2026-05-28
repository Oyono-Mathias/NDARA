import { useNavigate } from "react-router-dom";
import { Play, BookOpen, Award, ArrowRight, Bot, Sparkles, Search, CheckCircle2 } from "lucide-react";

export function Dashboard() {
  const navigate = useNavigate();

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-top-4 duration-700 relative pb-24">
      {/* Welcome Section */}
      <header>
        <p className="text-gray-400 text-xs font-medium mb-1 tracking-widest uppercase">Bonjour</p>
        <h1 className="font-serif text-4xl text-white mb-2 leading-[1.1] tracking-tight">
          KOUAME.
        </h1>
        <p className="text-primary text-sm font-medium">Bara ala, Tonga na ndara</p>
      </header>

      {/* Stats Grid */}
      <section className="grid grid-cols-2 gap-4">
        <div className="glass rounded-3xl p-5 card-hover cursor-pointer" onClick={() => navigate('/student/courses')}>
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center">
              <BookOpen className="w-4 h-4 text-blue-400" />
            </div>
            <span className="text-gray-400 text-[10px] font-bold uppercase tracking-wider">Cours</span>
          </div>
          <p className="font-serif text-3xl font-black text-white leading-none">12</p>
          <p className="text-primary text-[10px] font-medium mt-3">3 actifs en ce moment</p>
        </div>
        <div className="glass rounded-3xl p-5 card-hover cursor-pointer" onClick={() => navigate('/student/certificates')}>
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-full bg-amber-500/20 flex items-center justify-center">
              <Award className="w-4 h-4 text-amber-400" />
            </div>
            <span className="text-gray-400 text-[10px] font-bold uppercase tracking-wider">Certificats</span>
          </div>
          <p className="font-serif text-3xl font-black text-white leading-none">5</p>
          <p className="text-amber-400 text-[10px] font-medium mt-3">2 en validation</p>
        </div>
      </section>

      {/* Featured Course (Continue Learning) */}
      <section>
        <div 
          className="glass rounded-3xl p-6 card-hover relative overflow-hidden glow-green cursor-pointer"
          onClick={() => navigate('/student/courses/trading-finance')}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-transparent opacity-20"></div>
          <div className="relative z-10">
            <div className="flex items-start justify-between mb-6">
              <div className="flex-1">
                <span className="inline-block px-3 py-1 rounded-full bg-white/5 text-primary text-[10px] font-bold tracking-widest mb-3 border border-white/5">
                  EN PROGRESSION
                </span>
                <h2 className="text-xl font-bold font-serif text-white mb-1">Trading & Finance Décentralisée</h2>
                <p className="text-gray-400 text-xs font-medium">Module 3 • Analyse Technique</p>
              </div>
              <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center shrink-0 shadow-[0_0_15px_rgba(16,185,129,0.5)]">
                <Play className="w-5 h-5 text-black fill-current" />
              </div>
            </div>

            <div className="mb-4">
              <div className="flex justify-between text-xs font-bold text-gray-400 mb-2">
                <span>65%</span>
                <span>12/20 LEÇONS</span>
              </div>
              <div className="w-full bg-black/50 rounded-full h-2 overflow-hidden ring-1 ring-white/10">
                <div className="bg-gradient-to-r from-primary to-teal-400 h-full rounded-full w-[65%] shadow-[0_0_10px_rgba(16,185,129,0.8)]" />
              </div>
            </div>

            <button className="w-full glass-light py-3 rounded-2xl font-bold text-xs hover:bg-white/10 transition flex items-center justify-center gap-2 text-white">
              <span>Continuer la session</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>

      {/* MATHIAS IA Tutor - Re-styled from Qwen */}
      <section>
        <div 
          className="dashboard-card bg-gradient-to-br from-orange-600 to-amber-700 p-6 rounded-3xl shadow-lg relative overflow-hidden border border-white/10 flex flex-col cursor-pointer active:scale-[0.985] transition-all duration-200 card-hover"
          onClick={() => navigate('/student/mathias')}
        >
          <div className="absolute top-4 right-4 w-20 h-20 bg-white/10 rounded-full blur-2xl" />

          <div className="relative z-10 flex items-start justify-between flex-1">
            <div className="flex-1 space-y-3 pr-4">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-2xl bg-white/20 flex items-center justify-center flex-shrink-0">
                  <Bot size={15} className="text-white" />
                </div>
                <span className="text-white/90 text-[10px] font-bold uppercase tracking-widest">
                  MATHIAS IA
                </span>
              </div>

              <h3 className="text-lg font-black text-white leading-tight tracking-tight">
                Besoin d'aide ?
              </h3>

              <p className="text-white/75 text-sm leading-snug line-clamp-2">
                "Ton tuteur IA personnel est là pour répondre à tes questions 24/7."
              </p>
            </div>

            <div className="flex-shrink-0 w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center backdrop-blur-md border border-white/20 mt-1">
              <Sparkles className="h-9 w-9 text-white animate-pulse" />
            </div>
          </div>

          <button className="bg-white hover:bg-white/95 text-orange-700 font-bold rounded-2xl h-10 px-5 text-sm shadow-md w-full mt-4 flex items-center justify-center transition">
            Poser une question
          </button>
        </div>
      </section>

      {/* Recent Activity */}
      <section>
        <h2 className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-4 px-1">Dernières Activités</h2>
        <div className="space-y-3">
          <div className="glass-light rounded-3xl p-4 card-hover flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-5 h-5 text-primary" />
            </div>
            <div className="flex-1">
              <p className="text-white text-sm font-bold">Leçon complétée</p>
              <p className="text-gray-400 text-xs mt-0.5">Gestion des Risques Financiers</p>
            </div>
            <span className="text-gray-500 text-xs font-medium">Il y a 2h</span>
          </div>
          <div className="glass-light rounded-3xl p-4 card-hover flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-amber-500/10 flex items-center justify-center shrink-0">
              <Award className="w-5 h-5 text-amber-500" />
            </div>
            <div className="flex-1">
              <p className="text-white text-sm font-bold">Certificat obtenu</p>
              <p className="text-gray-400 text-xs mt-0.5">Introduction à la Blockchain</p>
            </div>
            <span className="text-gray-500 text-xs font-medium">Hier</span>
          </div>
        </div>
      </section>

      {/* FAB (Floating Action Button for Catalogue/Search) */}
      <button 
        onClick={() => navigate('/student/search')}
        className="fixed bottom-[104px] right-6 h-16 w-16 rounded-full bg-primary hover:bg-emerald-400 flex items-center justify-center shadow-[0_4px_20px_rgba(16,185,129,0.5)] z-50 active:scale-95 transition-all outline-none border-none"
      >
        <Search className="h-7 w-7 text-black font-black" />
      </button>

    </div>
  );
}
