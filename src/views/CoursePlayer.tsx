import { Play, Pause, Maximize, SkipForward, SkipBack, Settings, CheckCircle2, ChevronDown, ListVideo, PlayCircle } from "lucide-react";

export function CoursePlayer() {
  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-primary text-xs font-bold uppercase tracking-wider mb-1">Module 3</p>
          <h1 className="font-serif text-2xl text-white leading-tight">Analyse Technique et Indicateurs (RSI, MACD)</h1>
        </div>
      </div>

      {/* Video Player */}
      <div className="relative w-full aspect-video bg-black rounded-3xl overflow-hidden border border-white/10 group shadow-[0_0_30px_rgba(16,185,129,0.15)] glow-green">
        <img src="https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&q=80&w=1200" alt="Video cover" className="w-full h-full object-cover opacity-60" />
        
        {/* Play Overlay */}
        <div className="absolute inset-0 flex items-center justify-center">
            <button className="w-16 h-16 rounded-full bg-primary/20 backdrop-blur-md border border-primary/50 flex items-center justify-center text-primary hover:scale-110 transition-transform">
                <Play className="w-8 h-8 fill-current ml-1" />
            </button>
        </div>

        {/* Controls (visible on hover) */}
        <div className="absolute bottom-0 left-0 w-full bg-gradient-to-t from-black/80 to-transparent p-4 opacity-0 group-hover:opacity-100 transition-opacity">
            {/* Neon Progress */}
            <div className="w-full h-1 bg-white/20 rounded-full mb-4 cursor-pointer relative">
                <div className="absolute top-0 left-0 h-full w-[45%] bg-primary rounded-full shadow-[0_0_10px_rgba(16,185,129,1)]"></div>
            </div>
            
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4 text-white">
                    <button><Pause className="w-5 h-5 fill-current" /></button>
                    <button><SkipBack className="w-4 h-4 fill-current" /></button>
                    <span className="text-xs font-mono">04:20 / 12:45</span>
                    <button><SkipForward className="w-4 h-4 fill-current" /></button>
                </div>
                <div className="flex items-center gap-4 text-white">
                    <button><Settings className="w-5 h-5" /></button>
                    <button><Maximize className="w-5 h-5" /></button>
                </div>
            </div>
        </div>
      </div>

      {/* Course Content list */}
      <div className="glass rounded-3xl p-6 border border-white/5">
        <div className="flex items-center justify-between mb-4">
            <h2 className="font-serif text-xl text-white flex items-center gap-2"><ListVideo className="w-5 h-5 text-primary"/> Programme du Module</h2>
            <span className="text-gray-400 text-sm">45% complété</span>
        </div>
        
        <div className="space-y-3">
            {[1, 2, 3, 4].map((i) => {
                const isActive = i === 2;
                const isCompleted = i < 2;
                return (
                    <div key={i} className={`flex items-center justify-between p-3 rounded-2xl transition border ${isActive ? 'bg-primary/10 border-primary/30' : 'bg-background/50 border-white/5 hover:border-white/20'}`}>
                        <div className="flex items-center gap-3">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${isCompleted ? 'bg-primary/20 text-primary' : isActive ? 'bg-primary text-background' : 'bg-white/5 text-gray-500'}`}>
                                {isCompleted ? <CheckCircle2 className="w-4 h-4" /> : <PlayCircle className="w-4 h-4" />}
                            </div>
                            <div>
                                <p className={`font-bold text-sm ${isActive ? 'text-white' : 'text-gray-300'}`}>
                                    {i === 1 ? 'Introduction au marché' : i === 2 ? 'Analyse Technique et Indicateurs' : `Leçon ${i} : Stratégies avancées`}
                                </p>
                                <p className="text-gray-500 text-xs">{isCompleted ? 'Complété' : '12 min'}</p>
                            </div>
                        </div>
                    </div>
                )
            })}
        </div>
      </div>
    </div>
  );
}
