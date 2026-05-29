import React, { useMemo, useState, useEffect } from 'react';
import { useRole } from '../context/RoleContext';
import { collection, query, where, getFirestore, onSnapshot } from 'firebase/firestore';
import { 
    Trophy, 
    MessageSquare, 
    Clock, 
    BookOpen, 
    Sparkles, 
    ChevronRight, 
    Bot, 
    ArrowLeft,
    CheckCircle2,
    AlertCircle,
    LayoutGrid
} from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Link, useNavigate } from 'react-router-dom';
import { cn } from '../lib/utils';
import { db } from '../firebase';

export function ResultsView() {
  const { currentUser, isUserLoading } = useRole();
  const navigate = useNavigate();
  
  const [filter, setFilter] = useState<'all' | 'success' | 'warning'>('all');
  const [rawResults, setRawResults] = useState<any[]>([]);
  const [resultsLoading, setResultsLoading] = useState(true);

  useEffect(() => {
    if (!currentUser?.uid) {
        setResultsLoading(false);
        return;
    }

    const resultsQuery = query(
        collection(db, 'quiz_submissions'), 
        where('studentId', '==', currentUser.uid)
    );

    const unsubscribe = onSnapshot(resultsQuery, (snap) => {
        const results = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setRawResults(results);
        setResultsLoading(false);
    }, (error) => {
        console.error("Error fetching results", error);
        setResultsLoading(false);
    });

    return () => unsubscribe();
  }, [currentUser?.uid]);

  const results = useMemo(() => {
    if (!rawResults) return [];
    let list = [...rawResults].sort((a, b) => {
      const dateA = (a.submittedAt as any)?.toDate?.() || new Date(0);
      const dateB = (b.submittedAt as any)?.toDate?.() || new Date(0);
      return dateB.getTime() - dateA.getTime();
    });

    if (filter === 'success') return list.filter(r => r.score >= 70);
    if (filter === 'warning') return list.filter(r => r.score < 70);
    return list;
  }, [rawResults, filter]);

  const stats = useMemo(() => {
      if (!rawResults || rawResults.length === 0) return { total: 0, avg: 0, certified: 0 };
      const total = rawResults.length;
      const sum = rawResults.reduce((acc, r) => acc + (r.score || 0), 0);
      const certified = rawResults.filter(r => r.score >= 70).length;
      return {
          total,
          avg: Math.round(sum / total),
          certified
      };
  }, [rawResults]);

  const isLoading = isUserLoading || resultsLoading;

  return (
    <div className="flex flex-col gap-8 pb-24 bg-slate-950 min-h-screen relative overflow-hidden bg-grainy">
      {/* --- HEADER FIXE --- */}
      <header className="px-4 pt-8 space-y-6 animate-in fade-in slide-in-from-top-4 duration-700">
        <div className="flex items-center gap-3">
            <button 
                onClick={() => navigate(-1)} 
                className="w-10 h-10 rounded-full bg-slate-900 border border-white/5 flex items-center justify-center text-slate-400 active:scale-90 transition-transform hover:text-white"
            >
                <ArrowLeft className="h-5 w-5" />
            </button>
            <div className="flex-1">
                <div className="flex items-center gap-2 text-primary mb-1">
                    <Trophy className="h-4 w-4" />
                    <span className="text-[10px] font-black uppercase tracking-[0.2em]">Mes Performances</span>
                </div>
                <h1 className="text-2xl font-black text-white uppercase tracking-tight leading-none">Scores & Quiz</h1>
            </div>
        </div>

        {/* Stats Summary Style Qwen */}
        <div className="grid grid-cols-3 gap-3">
            <StatBox label="Quiz" value={stats.total.toString()} />
            <StatBox label="Moyenne" value={`${stats.avg}%`} isEmerald />
            <StatBox label="Certifiés" value={stats.certified.toString()} />
        </div>

        {/* Filter Chips */}
        <div className="flex gap-2 overflow-x-auto hide-scrollbar pb-1">
            <button 
                onClick={() => setFilter('all')}
                className={cn(
                    "flex-shrink-0 px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all active:scale-95 border",
                    filter === 'all' ? "bg-primary text-slate-950 border-primary" : "bg-slate-900 border-white/5 text-slate-500 hover:text-slate-300"
                )}
            >
                Tous
            </button>
            <button 
                onClick={() => setFilter('success')}
                className={cn(
                    "flex-shrink-0 px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all border",
                    filter === 'success' ? "bg-primary text-slate-950 border-primary" : "bg-slate-900 border-white/5 text-slate-500 hover:text-slate-300"
                )}
            >
                Réussis
            </button>
            <button 
                onClick={() => setFilter('warning')}
                className={cn(
                    "flex-shrink-0 px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all border",
                    filter === 'warning' ? "bg-primary text-slate-950 border-primary" : "bg-slate-900 border-white/5 text-slate-500 hover:text-slate-300"
                )}
            >
                À réviser
            </button>
        </div>
      </header>

      <main className="px-4 space-y-4">
        {isLoading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-40 w-full rounded-[2rem] bg-slate-900 animate-pulse border border-slate-800" />
            ))}
          </div>
        ) : results && results.length > 0 ? (
          <div className="grid gap-4 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {results.map((result) => (
              <div key={result.id}>
                <ResultItem result={result} />
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 px-8 text-center bg-slate-900/20 rounded-[3rem] border-2 border-dashed border-slate-800/50">
            <div className="p-6 bg-slate-800/50 rounded-full mb-6">
              <Sparkles className="h-16 w-16 text-slate-700" />
            </div>
            <h3 className="text-xl font-black text-white uppercase tracking-tight leading-tight">Aucun résultat</h3>
            <p className="text-slate-500 text-sm mt-3 leading-relaxed max-w-[220px] mx-auto font-medium italic">
              "Le savoir est une quête." <br/>Validez vos acquis pour voir vos scores ici.
            </p>
          </div>
        )}
      </main>
    </div>
  );
}

function StatBox({ label, value, isEmerald = false }: { label: string, value: string, isEmerald?: boolean }) {
    return (
        <div className="bg-slate-900/50 border border-white/5 rounded-3xl p-4 text-center shadow-xl">
            <p className={cn("text-2xl font-black leading-none", isEmerald ? "text-primary" : "text-white")}>
                {value.padStart(2, '0')}
            </p>
            <p className="text-[8px] font-black text-slate-600 uppercase tracking-widest mt-2">{label}</p>
        </div>
    );
}

function ResultItem({ result }: { result: any }) {
  const date = (result.submittedAt as any)?.toDate?.() || new Date(result.submittedAt || 0);
  const isSuccess = result.score >= 70;
  
  // SVG Logic for circle progress
  const circumference = 226; // 2 * pi * 36
  const offset = circumference - (result.score / 100) * circumference;

  return (
    <Card className={cn(
        "bg-slate-900 border border-white/5 rounded-[2rem] overflow-hidden shadow-2xl transition-all active:scale-[0.98] group",
        !isSuccess && "border-amber-500/20"
    )}>
      <CardContent className="p-6 space-y-6">
        {/* Course Info */}
        <div className="flex justify-between items-start">
            <div className="space-y-1">
                <span className="inline-block bg-slate-800 text-slate-500 rounded-full px-2 py-1 font-black text-[8px] uppercase tracking-tighter mb-2">
                    {result.courseTitle || 'Formation Ndara'}
                </span>
                <h3 className="text-base font-black text-white leading-tight uppercase tracking-tight group-hover:text-primary transition-colors">
                    {result.quizTitle}
                </h3>
            </div>
            <span className="text-[9px] font-bold text-slate-600 uppercase tracking-widest shrink-0">
                {format(date, 'dd MMM yyyy', { locale: fr })}
            </span>
        </div>

        {/* Score Row */}
        <div className="flex items-center gap-6">
            {/* Circular Progress */}
            <div className="relative w-20 h-20 flex-shrink-0">
                <svg width="80" height="80" className="-rotate-90">
                    <circle className="stroke-slate-800 fill-none" cx="40" cy="40" r="32" strokeWidth="6" />
                    <circle 
                        className={cn(
                            "fill-none transition-all duration-1000 ease-out",
                            isSuccess ? "stroke-primary" : "stroke-amber-500"
                        )} 
                        cx="40" 
                        cy="40" 
                        r="32" 
                        strokeWidth="6" 
                        strokeDasharray={circumference}
                        strokeDashoffset={offset}
                        strokeLinecap="round"
                        style={{ filter: `drop-shadow(0 0 6px ${isSuccess ? 'rgba(16,185,129,0.4)' : 'rgba(245,158,11,0.4)'})` }}
                    />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center flex-col">
                    <span className="text-xl font-black text-white">{result.score}%</span>
                </div>
            </div>

            <div className="flex-1 space-y-2">
                <div className="flex items-center gap-2">
                    {isSuccess ? (
                        <CheckCircle2 className="h-4 w-4 text-primary shrink-0" />
                    ) : (
                        <AlertCircle className="h-4 w-4 text-amber-500 shrink-0" />
                    )}
                    <span className={cn(
                        "text-[10px] font-black uppercase tracking-widest",
                        isSuccess ? "text-primary" : "text-amber-500"
                    )}>
                        {isSuccess ? "Maîtrise validée" : "Révision suggérée"}
                    </span>
                </div>
                <p className="text-xs text-slate-500 font-medium italic">
                    {isSuccess 
                        ? "Excellent travail, vous avez acquis les fondamentaux de ce module." 
                        : "Certains concepts restent à consolider pour une maîtrise totale."}
                </p>
            </div>
        </div>

        {/* Action / Mathias Assistance */}
        <div className="pt-4 border-t border-white/5 flex gap-2">
            {!isSuccess ? (
                <Link 
                    to={`/student/tutor?query=${encodeURIComponent(`Bonjour Mathias, j'ai eu ${result.score}% au quiz "${result.quizTitle}". Peux-tu m'expliquer mes erreurs et m'aider à progresser ?`)}`}
                    className="w-full h-12 rounded-2xl bg-gradient-to-r from-primary/20 flex flex-row justify-center items-center to-primary/10 border border-primary/30 text-primary hover:text-white font-black uppercase text-[10px] tracking-widest gap-2 shadow-lg animate-pulse-glow transition"
                >
                    <Bot className="h-4 w-4" />
                    Aide Mathias : Comprendre mes erreurs
                </Link>
            ) : (
                <Link 
                    to={`/student/courses/${result.courseId}`}
                    className="w-full h-12 flex justify-center items-center text-slate-500 font-black uppercase text-[10px] tracking-widest hover:text-white transition-colors hover:bg-slate-800 rounded-2xl"
                >
                    Continuer la formation <ChevronRight className="ml-1 h-3 w-3" />
                </Link>
            )}
        </div>
      </CardContent>
    </Card>
  );
}

function Card({ children, className }: { children: React.ReactNode, className?: string }) {
    return (
        <div className={cn("bg-slate-900 rounded-[2rem]", className)}>
            {children}
        </div>
    );
}

function CardContent({ children, className }: { children: React.ReactNode, className?: string }) {
    return (
        <div className={cn("p-6", className)}>
            {children}
        </div>
    );
}
