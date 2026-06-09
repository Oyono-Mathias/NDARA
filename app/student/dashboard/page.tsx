import { cookies } from "next/headers";
import { LogOut, Rocket, BookOpen, Clock, ShieldCheck, Flame } from "lucide-react";

// Server Component (RSC) pur
// L'empreinte JS envoyée au client sera proche de 0.
export default async function StudentDashboardPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      {/* Topology Header */}
      <header className="border-b border-white/5 bg-black/50 backdrop-blur-xl px-6 py-4 sticky top-0 z-40">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center gap-3">
             <div className="w-8 h-8 rounded-lg bg-[#10B981]/10 border border-[#10B981]/30 flex items-center justify-center emerald-glow shadow-[0_0_15px_rgba(16,185,129,0.2)]">
                 <Rocket className="w-4 h-4 text-[#10B981]" />
             </div>
             <span className="font-bold text-xl tracking-tight text-glow">NDARA</span>
             <span className="px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-xs font-mono text-gray-400">STUDENT</span>
          </div>
          
          <button className="text-gray-400 hover:text-white flex items-center gap-2 text-sm transition-colors border border-transparent hover:border-red-500/30 hover:bg-red-500/10 px-3 py-1.5 rounded-lg">
            <LogOut className="w-4 h-4" /> 
            <span className="hidden sm:inline">Fermer la session</span>
          </button>
        </div>
      </header>

      {/* Main Structural Frame */}
      <main className="max-w-7xl mx-auto px-6 py-12 relative">
        <div className="mb-12">
          <h1 className="text-4xl md:text-5xl font-black tracking-tight mb-2">Bienvenue sur votre <span className="text-[#10B981] text-glow">Cockpit.</span></h1>
          <p className="text-gray-400 text-lg max-w-2xl">Votre espace de travail de nouvelle génération propulsé par Edge Rendering. Fluidité totale et latence nulle.</p>
        </div>

        {/* Dynamic Edge Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
           <div className="p-6 bg-white/5 border border-white/10 rounded-2xl relative overflow-hidden group hover:border-[#10B981]/50 transition-colors">
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <BookOpen className="w-16 h-16 text-white" />
              </div>
              <div className="flex items-center justify-between mb-4 relative z-10">
                  <h3 className="text-gray-400 font-medium">Cours Actifs</h3>
              </div>
              <p className="text-4xl font-bold font-mono tracking-tighter relative z-10">4</p>
           </div>
           
           <div className="p-6 bg-white/5 border border-white/10 rounded-2xl relative overflow-hidden group hover:border-amber-500/50 transition-colors">
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <Clock className="w-16 h-16 text-white" />
              </div>
              <div className="flex items-center justify-between mb-4 relative z-10">
                  <h3 className="text-gray-400 font-medium">Heures de vol</h3>
              </div>
              <p className="text-4xl font-bold font-mono tracking-tighter relative z-10">32.5</p>
           </div>

           <div className="p-6 bg-white/5 border border-white/10 rounded-2xl relative overflow-hidden group hover:border-orange-500/50 transition-colors">
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <Flame className="w-16 h-16 text-white" />
              </div>
              <div className="flex items-center justify-between mb-4 relative z-10">
                  <h3 className="text-gray-400 font-medium">Série en cours</h3>
              </div>
              <p className="text-4xl font-bold font-mono tracking-tighter relative z-10">12<span className="text-lg text-gray-500 ml-1">J</span></p>
           </div>

           <div className="p-6 bg-[#10B981]/10 border border-[#10B981]/30 rounded-2xl emerald-glow relative overflow-hidden">
              <div className="absolute -right-4 -bottom-4 opacity-20">
                <ShieldCheck className="w-32 h-32 text-[#10B981]" />
              </div>
              <div className="flex items-center justify-between mb-4 relative z-10">
                  <h3 className="text-[#10B981] font-medium font-mono text-sm tracking-wider">STATUS RÉSEAU</h3>
              </div>
              <p className="text-lg font-bold text-white relative z-10 flex items-center gap-2">
                 <span className="w-2.5 h-2.5 rounded-full bg-[#10B981] animate-pulse shadow-[0_0_10px_#10B981]"></span>
                 CONNECTÉ EDGE
              </p>
           </div>
        </div>

        {/* Content Hydration Zone */}
        <div className="p-8 bg-white/5 border border-white/10 rounded-2xl">
            <h2 className="text-2xl font-bold mb-6">Reprendre la formation</h2>
            <div className="h-64 flex flex-col items-center justify-center border-2 border-dashed border-white/10 rounded-xl bg-black/50">
               <div className="w-12 h-12 border-2 border-white/10 border-t-white/50 rounded-full animate-spin mb-4"></div>
               <p className="text-gray-500 font-mono text-sm">(Réplication synchronisée depuis Cloud Firestore en cours...)</p>
            </div>
        </div>
      </main>
    </div>
  );
}
