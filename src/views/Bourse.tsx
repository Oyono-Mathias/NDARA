import { useNavigate } from "react-router-dom";
import { 
  ChevronLeft, 
  RotateCcw, 
  Bell, 
  TrendingUp, 
  TrendingDown,
  Users,
  CreditCard,
  ChevronRight,
  Info
} from "lucide-react";
import { useState, useEffect } from "react";
import { collection, onSnapshot, query, where, getFirestore } from "firebase/firestore";
import { db } from "../firebase";

export function BourseView() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("1j");
  
  const [gainers, setGainers] = useState<any[]>([]);
  const [losers, setLosers] = useState<any[]>([]);
  const [courses, setCourses] = useState<any[]>([]);

  useEffect(() => {
    const pubQuery = query(collection(db, "courses"), where("status", "==", "Published"));
    const unsub = onSnapshot(pubQuery, (snap) => {
      const data = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setCourses(data);
      // Simulate gainers and losers from courses or leave empty
    });
    return () => unsub();
  }, []);

  const tabs = ["1h", "4h", "1j", "1s", "1m", "3m", "1a"];

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-top-4 duration-700 relative pb-24">
      {/* Header */}
      <header className="flex items-center justify-between px-1 mb-2">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition-colors">
            <ChevronLeft className="w-5 h-5 text-white" />
          </button>
          <div>
            <h1 className="text-lg font-black text-white leading-tight">📊 Marché Bourse</h1>
            <div className="flex items-center text-[11px] font-semibold text-primary">
              <span className="w-1.5 h-1.5 rounded-full bg-primary mr-1.5 animate-pulse"></span>
              Marché ouvert • Temps réel
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition-colors">
            <RotateCcw className="w-5 h-5 text-slate-400" />
          </button>
          <button className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition-colors">
            <Bell className="w-5 h-5 text-slate-400" />
          </button>
        </div>
      </header>

      {/* Market Overview */}
      <section className="px-1">
        <div className="rounded-[18px] p-4 bg-gradient-to-br from-[#0d1f15] via-[#0a1a12] to-[#0f1a14] border border-primary/25 relative overflow-hidden">
          <div className="absolute -top-12 -right-12 w-[150px] h-[150px] rounded-full bg-primary/10 blur-2xl"></div>
          
          <div className="flex justify-between items-start mb-4 relative z-10">
            <div>
              <div className="text-[11px] font-semibold text-slate-400 mb-0.5">NDARA INDEX (NDI)</div>
              <div className="text-2xl font-black text-white tracking-tight">4,827.35</div>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary/15 text-primary text-[13px] font-bold">
              <TrendingUp className="w-4 h-4" strokeWidth={2.5} />
              +2.47%
            </div>
          </div>

          <div className="h-20 w-full mb-3 flex items-end justify-between px-2 opacity-50 relative z-10">
            {/* Pseudo mini chart visual using bars */}
            {[40, 50, 45, 60, 55, 70, 65, 80, 75, 90, 85, 100].map((h, i) => (
              <div key={i} className="w-1.5 bg-primary/50  rounded-t-sm" style={{ height: `${h}%` }}></div>
            ))}
          </div>

          <div className="flex gap-3 relative z-10">
            <div className="flex-1 text-center">
              <div className="text-[9px] font-semibold text-slate-500 mb-0.5">Volume 24h</div>
              <div className="text-[13px] font-bold text-white">12.4M</div>
            </div>
            <div className="flex-1 text-center">
              <div className="text-[9px] font-semibold text-slate-500 mb-0.5">Cours actifs</div>
              <div className="text-[13px] font-bold text-white">24</div>
            </div>
            <div className="flex-1 text-center">
              <div className="text-[9px] font-semibold text-slate-500 mb-0.5">Meilleur gain</div>
              <div className="text-[13px] font-bold text-primary">+18.3%</div>
            </div>
            <div className="flex-1 text-center">
              <div className="text-[9px] font-semibold text-slate-500 mb-0.5">Cap. Marché</div>
              <div className="text-[13px] font-bold text-white">4.8M</div>
            </div>
          </div>
        </div>
      </section>

      {/* Tabs */}
      <section className="px-1 overflow-x-auto hide-scrollbar">
        <div className="flex gap-2">
          {tabs.map((t) => (
            <button
              key={t}
              onClick={() => setActiveTab(t)}
              className={`px-3.5 py-1.5 rounded-lg text-[11px] font-bold transition-all uppercase whitespace-nowrap ${
                activeTab === t 
                  ? 'bg-primary/20 text-primary border border-primary/30' 
                  : 'bg-white/5 text-slate-400 border border-transparent hover:bg-white/10'
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </section>

      {/* Top Gainers */}
      <section>
        <div className="flex justify-between items-center mb-2.5 px-2">
          <h2 className="text-[15px] font-bold text-white">🔥 Top Gainers</h2>
          <button className="text-xs font-semibold text-primary hover:text-emerald-400">Voir tout</button>
        </div>
        <div className="flex gap-2.5 overflow-x-auto hide-scrollbar px-1 snap-x snap-mandatory pb-2">
          {gainers.length > 0 ? gainers.map((g) => (
            <div key={g.id} className="min-w-[120px] p-3 rounded-xl bg-primary/5 border border-primary/20 cursor-pointer active:scale-95 transition-all snap-start shrink-0">
              <div className="text-[10px] font-bold text-slate-500 mb-1">#{g.rank}</div>
              <div className="text-xs font-bold text-white truncate mb-1">{g.name}</div>
              <div className="text-sm font-black text-white mb-0.5">{g.price}</div>
              <div className="text-[11px] font-bold text-primary flex items-center gap-1">
                <TrendingUp className="w-3 h-3" strokeWidth={2.5} /> {g.change}
              </div>
            </div>
          )) : (
            <div className="text-xs text-slate-500 font-bold uppercase py-4 px-2 w-full text-center">Aucune donnée disponible</div>
          )}
        </div>
      </section>

      {/* Top Losers */}
      <section>
        <div className="flex justify-between items-center mb-2.5 px-2">
          <h2 className="text-[15px] font-bold text-rose-500">📉 Top Losers</h2>
          <button className="text-xs font-semibold text-primary hover:text-emerald-400">Voir tout</button>
        </div>
        <div className="flex gap-2.5 overflow-x-auto hide-scrollbar px-1 snap-x snap-mandatory pb-2">
          {losers.length > 0 ? losers.map((l) => (
            <div key={l.id} className="min-w-[120px] p-3 rounded-xl bg-rose-500/5 border border-rose-500/20 cursor-pointer active:scale-95 transition-all snap-start shrink-0">
              <div className="text-[10px] font-bold text-slate-500 mb-1">#{l.rank}</div>
              <div className="text-xs font-bold text-white truncate mb-1">{l.name}</div>
              <div className="text-sm font-black text-white mb-0.5">{l.price}</div>
              <div className="text-[11px] font-bold text-rose-500 flex items-center gap-1">
                <TrendingDown className="w-3 h-3" strokeWidth={2.5} /> {l.change}
              </div>
            </div>
          )) : (
            <div className="text-xs text-slate-500 font-bold uppercase py-4 px-2 w-full text-center">Aucune donnée disponible</div>
          )}
        </div>
      </section>

      {/* Market List */}
      <section className="px-1">
        <div className="flex justify-between items-center mb-3 px-1">
          <h2 className="text-[15px] font-bold text-white">📋 Tous les cours</h2>
          <button className="text-xs font-semibold text-primary">Trier par</button>
        </div>
        
        <div className="space-y-2">
          {courses.length > 0 ? courses.map((c) => (
            <div key={c.id} className={`p-3.5 rounded-2xl border transition-all active:scale-[0.98] cursor-pointer
              ${c.isUp ? 'bg-gradient-to-br from-primary/10 to-transparent border-primary/20' : 'bg-gradient-to-br from-rose-500/10 to-transparent border-rose-500/20'}`}
              onClick={() => navigate(`/student/bourse/${c.id}`)}  
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-slate-800 flex items-center justify-center text-xl overflow-hidden">
                    {c.thumbnail ? <img src={c.thumbnail} alt={c.title} className="w-full h-full object-cover" /> : '📈'}
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white mb-0.5">{c.title}</h3>
                    <p className="text-[11px] text-slate-400">{c.category}</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-base font-black text-white mb-0.5">{c.price ? `${c.price} F` : '0 F'}</div>
                  <div className={`text-[9px] font-bold px-2 py-0.5 rounded inline-block ${c.isUp ? 'bg-primary/20 text-primary' : 'bg-rose-500/20 text-rose-500'}`}>
                    {c.isUp ? '▲' : '▼'} {c.change || '0%'}
                  </div>
                </div>
              </div>

              {/* Sparkline mini */}
              <div className="flex items-end gap-1 h-8 mb-2 px-1">
                 {Array.from({length: 20}).map((_, i) => (
                   <div key={i} className={`flex-1 rounded-sm opacity-60 ${c.isUp !== false ? 'bg-primary' : 'bg-rose-500'}`} style={{ height: `${Math.max(10, Math.random() * 100)}%` }}></div>
                 ))}
              </div>

              <div className="flex items-center justify-between">
                <div className="flex gap-3">
                  <div className="flex items-center gap-1 text-[10px] text-slate-400">
                    <Users className="w-3 h-3" />
                    {c.students || 0} élèves
                  </div>
                  <div className="flex items-center gap-1 text-[10px] text-slate-400">
                    <CreditCard className="w-3 h-3" />
                    Bourse
                  </div>
                </div>
                <div className="flex gap-1.5">
                  <button 
                    onClick={(e) => { e.stopPropagation(); navigate(`/student/bourse/${c.id}`); }}
                    className={`px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all ${
                       c.isUp !== false
                        ? 'bg-gradient-to-br from-emerald-600 to-primary text-white border-transparent' 
                        : 'bg-rose-500/15 border-rose-500/20 text-rose-500 border'
                    }`}
                  >
                    Action
                  </button>
                  <button className="px-3 py-1.5 rounded-lg text-[11px] font-bold bg-white/5 border border-white/10 text-slate-300">
                    Détails
                  </button>
                </div>
              </div>
            </div>
          )) : (
            <div className="px-3 py-6 w-full text-center border rounded-2xl border-dashed border-white/10 opacity-70">
              <Info className="w-8 h-8 text-slate-500 mx-auto mb-2" />
              <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Aucun cours en Bourse pour le moment</p>
            </div>
          )}
        </div>
      </section>

    </div>
  );
}
