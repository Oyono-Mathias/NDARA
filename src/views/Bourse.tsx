import { useNavigate } from "react-router-dom";
import { formatImageUrl } from "../lib/utils";
import { 
  ChevronLeft, 
  RotateCcw, 
  Bell, 
  TrendingUp, 
  TrendingDown,
  Users,
  CreditCard,
  Info,
  ListOrdered,
  Loader2
} from "lucide-react";
import { useState, useEffect } from "react";
import { collection, onSnapshot, query, where, orderBy, limit } from "firebase/firestore";
import { db } from "../firebase";
import { useRole } from "../context/RoleContext";
import { BottomSheet } from "../components/ui/BottomSheet";

export function BourseView() {
  const navigate = useNavigate();
  const { currentUser } = useRole();
  const [activeTab, setActiveTab] = useState("1j");
  
  const [marketData, setMarketData] = useState<any[]>([]);
  const [courses, setCourses] = useState<any[]>([]);
  const [activeOrders, setActiveOrders] = useState<any[]>([]);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [sortBy, setSortBy] = useState<'volume' | 'price_desc' | 'price_asc'>('volume');
  
  const [uiLoading, setUiLoading] = useState(true);

  // Real-time market metrics
  const [marketStats, setMarketStats] = useState({
    index: 0,
    volume24h: 0,
    activeCourses: 0,
    marketCap: 0,
    topGain: 0
  });

  useEffect(() => {
    let unsubscribeMd: (() => void) | undefined;
    let unsubscribeCourses: (() => void) | undefined;
    let unsubscribeOrders: (() => void) | undefined;
    
    // Simulate initial load if no data exists, or listen to real data
    try {
      const mdQuery = query(collection(db, "market_data"), orderBy("timestamp", "asc"));
      unsubscribeMd = onSnapshot(mdQuery, (snap) => {
        const data = snap.docs.map(doc => ({ id: doc.id, ...(doc.data() as any) }));
        setMarketData(data);
        
        // Compute market index and stats from data
        if (data.length > 0) {
          const latest = data[data.length - 1];
          setMarketStats({
            index: latest.indexValue || 0,
            volume24h: latest.volume || 0,
            activeCourses: latest.activeCourses || 0,
            marketCap: latest.marketCap || 0,
            topGain: latest.topGain || 0
          });
        }
        setUiLoading(false);
      }, () => setUiLoading(false));

      const pubQuery = query(collection(db, "courses"), where("status", "==", "Published"));
      unsubscribeCourses = onSnapshot(pubQuery, (snap) => {
        const data = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setCourses(data);
      });

      const ordersQuery = query(collection(db, "market_orders"), where("status", "==", "active"), orderBy("createdAt", "desc"), limit(10));
      unsubscribeOrders = onSnapshot(ordersQuery, (snap) => {
        const data = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setActiveOrders(data);
      });
    } catch (err) {
      setUiLoading(false);
    }

    return () => {
      if (unsubscribeMd) unsubscribeMd();
      if (unsubscribeCourses) unsubscribeCourses();
      if (unsubscribeOrders) unsubscribeOrders();
    };
  }, []);

  const tabs = ["1h", "4h", "1j", "1s", "1m", "3m", "1a"];

  // Helper to generate sparkline data from market_data if available
  const getSparklineData = (courseId: string) => {
    const courseData = marketData.filter(d => d.courseId === courseId);
    if (!courseData.length) return Array(20).fill(10); // minimal height for empty charts
    const prices = courseData.map(d => d.price || 10);
    const max = Math.max(...prices);
    return prices.slice(-20).map(p => (p / max) * 100);
  };

  // Derive gainers & losers safely
  const coursesWithChange = courses.map(c => {
    const change = Number(c.change) || 0;
    return { ...c, isUp: change >= 0, changeVal: Math.abs(change) };
  });
  
  const gainers = coursesWithChange.filter(c => c.isUp).sort((a, b) => b.changeVal - a.changeVal).slice(0, 5);
  const losers = coursesWithChange.filter(c => !c.isUp).sort((a, b) => b.changeVal - a.changeVal).slice(0, 5);

  if (uiLoading) {
    return (
      <div className="h-[100dvh] w-full bg-[#0B0F19] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="h-[100dvh] w-full bg-[#0B0F19] flex flex-col overflow-hidden text-white antialiased">
      <div className="flex-1 overflow-y-auto hide-scrollbar space-y-6 animate-in fade-in slide-in-from-top-4 duration-700 relative pb-24 px-4 sm:px-6 pt-[env(safe-area-inset-top,16px)]">
        <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <header className="flex items-center justify-between px-1 mb-2">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition-colors">
            <ChevronLeft className="w-5 h-5 text-white" />
          </button>
          <div>
            <h1 className="text-lg font-black text-white leading-tight">📊 Marché Bourse</h1>
            <div className="flex items-center text-[11px] font-semibold text-emerald-400">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mr-1.5 animate-pulse"></span>
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
        <div className="rounded-[18px] p-4 bg-gradient-to-br from-[#0d1f15] via-[#0a1a12] to-[#0f1a14] border border-emerald-500/25 relative overflow-hidden">
          <div className="absolute -top-12 -right-12 w-[150px] h-[150px] rounded-full bg-emerald-500/10 blur-2xl"></div>
          
          <div className="flex justify-between items-start mb-4 relative z-10">
            <div>
              <div className="text-[11px] font-semibold text-slate-400 mb-0.5">NDARA INDEX (NDI)</div>
              <div className="text-2xl font-black text-white tracking-tight">{marketStats.index ? marketStats.index.toLocaleString() : '0.00'}</div>
            </div>
            <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[13px] font-bold ${marketStats.topGain >= 0 ? 'bg-emerald-500/15 text-emerald-400' : 'bg-rose-500/15 text-rose-400'}`}>
              {marketStats.topGain >= 0 ? <TrendingUp className="w-4 h-4" strokeWidth={2.5} /> : <TrendingDown className="w-4 h-4" strokeWidth={2.5} />}
              {marketStats.topGain > 0 ? '+' : ''}{marketStats.topGain}%
            </div>
          </div>

          <div className="h-20 w-full mb-3 flex items-end justify-between px-2 opacity-50 relative z-10">
            {/* Real sparklines from market index history */}
            {marketData.length > 0 ? marketData.slice(-15).map((d, i) => (
              <div key={i} className="w-1.5 bg-emerald-500/50 rounded-t-sm" style={{ height: `${Math.max(10, (d.indexValue / 10000) * 100)}%` }}></div>
            )) : Array(12).fill(10).map((h, i) => (
              <div key={i} className="w-1.5 bg-emerald-500/20  rounded-t-sm" style={{ height: `${h}%` }}></div>
            ))}
          </div>

          <div className="flex gap-3 relative z-10">
            <div className="flex-1 text-center">
              <div className="text-[9px] font-semibold text-slate-500 mb-0.5">Volume 24h</div>
              <div className="text-[13px] font-bold text-white">{marketStats.volume24h ? `${(marketStats.volume24h / 1000000).toFixed(1)}M` : '0'}</div>
            </div>
            <div className="flex-1 text-center">
              <div className="text-[9px] font-semibold text-slate-500 mb-0.5">Cours actifs</div>
              <div className="text-[13px] font-bold text-white">{marketStats.activeCourses || 0}</div>
            </div>
            <div className="flex-1 text-center">
              <div className="text-[9px] font-semibold text-slate-500 mb-0.5">Meilleur gain</div>
              <div className="text-[13px] font-bold text-emerald-400">+{marketStats.topGain || 0}%</div>
            </div>
            <div className="flex-1 text-center">
              <div className="text-[9px] font-semibold text-slate-500 mb-0.5">Cap. Marché</div>
              <div className="text-[13px] font-bold text-white">{marketStats.marketCap ? `${(marketStats.marketCap / 1000000).toFixed(1)}M` : '0'}</div>
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
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' 
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
          <button className="text-xs font-semibold text-emerald-400 hover:text-emerald-300">Voir tout</button>
        </div>
        <div className="flex gap-2.5 overflow-x-auto hide-scrollbar px-1 snap-x snap-mandatory pb-2">
          {gainers.length > 0 ? gainers.map((g, idx) => (
            <div key={g.id} className="min-w-[120px] p-3 rounded-xl bg-emerald-500/5 border border-emerald-500/20 cursor-pointer active:scale-95 transition-all snap-start shrink-0" onClick={() => navigate(`/student/bourse/${g.id}`)}>
              <div className="text-[10px] font-bold text-slate-500 mb-1">#{idx + 1}</div>
              <div className="text-xs font-bold text-white truncate mb-1">{g.title}</div>
              <div className="text-sm font-black text-white mb-0.5">{g.price} F</div>
              <div className="text-[11px] font-bold text-emerald-400 flex items-center gap-1">
                <TrendingUp className="w-3 h-3" strokeWidth={2.5} /> +{g.changeVal}%
              </div>
            </div>
          )) : (
            <div className="text-xs text-slate-500 font-bold uppercase py-4 px-2 w-full text-center">Aucun gainer sur la période</div>
          )}
        </div>
      </section>

      {/* Carnet d'Offres (Market Orders) */}
      <section className="px-1">
        <div className="flex justify-between items-center mb-3">
          <h2 className="text-[15px] font-bold text-white flex items-center gap-2">
            <ListOrdered className="w-5 h-5 text-emerald-500" /> Carnet d'offres
          </h2>
        </div>
        <div className="space-y-2">
          {activeOrders.length > 0 ? activeOrders.map(order => (
            <div key={order.id} className="p-3 bg-white/5 border border-white/10 rounded-xl flex items-center justify-between">
              <div>
                <div className="text-[13px] font-bold text-white">{order.courseTitle || 'Licence éducative'}</div>
                <div className="text-[10px] text-slate-400">Vendeur: {order.sellerName || 'Investisseur Anonyme'}</div>
              </div>
              <div className="text-right">
                <div className="text-[13px] font-black text-emerald-400">{Number(order.price).toLocaleString('fr-FR')} F</div>
                <button 
                  onClick={() => navigate(`/student/bourse/${order.courseId}?orderId=${order.id}`)}
                  className="mt-1 px-3 py-1 bg-emerald-500/20 text-emerald-400 font-bold text-[10px] rounded hover:bg-emerald-500/30 transition"
                >
                  Voir l'offre
                </button>
              </div>
            </div>
          )) : (
            <div className="p-4 bg-white/5 border border-dashed border-white/10 rounded-xl text-center text-xs text-slate-400 font-medium">
              Aucun ordre de vente disponible dans le carnet.
            </div>
          )}
        </div>
      </section>

      {/* Market List */}
      <section className="px-1">
        <div className="flex justify-between items-center mb-3 px-1">
          <h2 className="text-[15px] font-bold text-white">📋 Toutes les licences</h2>
          <button onClick={() => setIsFilterOpen(true)} className="text-xs font-semibold text-emerald-400">Trier par</button>
        </div>
        
        <div className="space-y-2">
          {coursesWithChange.length > 0 ? coursesWithChange.sort((a, b) => {
            if (sortBy === 'price_desc') return b.price - a.price;
            if (sortBy === 'price_asc') return a.price - b.price;
            return b.students - a.students;
          }).map((c) => (
            <div key={c.id} className={`p-3.5 rounded-2xl border transition-all active:scale-[0.98] cursor-pointer
              ${c.isUp ? 'bg-gradient-to-br from-emerald-500/10 to-transparent border-emerald-500/20' : 'bg-gradient-to-br from-rose-500/10 to-transparent border-rose-500/20'}`}
              onClick={() => navigate(`/student/bourse/${c.id}`)}  
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-slate-800 flex items-center justify-center text-xl overflow-hidden shadow-inner">
                    {c.thumbnail ? <img src={formatImageUrl(c.thumbnail)} alt={c.title} className="w-full h-full object-cover" /> : '📈'}
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white mb-0.5">{c.title}</h3>
                    <p className="text-[11px] text-slate-400">{c.category || 'Finance & Tech'}</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-base font-black text-white mb-0.5">{c.price ? `${Number(c.price).toLocaleString('fr-FR')} F` : '0 F'}</div>
                  <div className={`text-[9px] font-bold px-2 py-0.5 rounded inline-block ${c.isUp ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-500'}`}>
                    {c.isUp ? '▲' : '▼'} {c.changeVal}%
                  </div>
                </div>
              </div>

              {/* Sparkline mini (Dynamic) */}
              <div className="flex items-end gap-1 h-8 mb-2 px-1">
                 {getSparklineData(c.id).map((h, i) => (
                   <div key={i} className={`flex-1 rounded-sm opacity-60 ${c.isUp ? 'bg-emerald-500' : 'bg-rose-500'}`} style={{ height: `${h}%` }}></div>
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
                    Spot
                  </div>
                </div>
                <div className="flex gap-1.5">
                  <button 
                    onClick={(e) => { e.stopPropagation(); navigate(`/student/bourse/${c.id}`); }}
                    className={`px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all ${
                       c.isUp 
                        ? 'bg-gradient-to-br from-emerald-600 to-emerald-500 text-white border-transparent' 
                        : 'bg-rose-500/15 border-rose-500/20 text-rose-500 border'
                    }`}
                  >
                    Trader
                  </button>
                  <button className="px-3 py-1.5 rounded-lg text-[11px] font-bold bg-white/5 border border-white/10 text-slate-300 hover:bg-white/10">
                    Détails
                  </button>
                </div>
              </div>
            </div>
          )) : (
            <div className="px-3 py-10 w-full text-center border rounded-2xl border-dashed border-white/5 bg-white/[0.02]">
              <div className="w-16 h-16 rounded-full bg-slate-800/50 flex items-center justify-center mx-auto mb-4 border border-white/5">
                <Info className="w-8 h-8 text-slate-500" />
              </div>
              <p className="text-sm font-bold text-slate-300 mb-2">Aucune licence disponible sur le marché pour le moment.</p>
              <p className="text-[11px] text-slate-500 leading-relaxed font-medium">Revenez plus tard ou mettez vos propres cours en vente.</p>
            </div>
          )}
        </div>
      </section>
      </div>
      </div>

      <BottomSheet isOpen={isFilterOpen} onClose={() => setIsFilterOpen(false)} title="Trier les licences">
        <div className="space-y-4 pb-8">
          <button 
            onClick={() => { setSortBy('volume'); setIsFilterOpen(false); }}
            className={`w-full flex items-center justify-between p-4 rounded-2xl border transition-all ${sortBy === 'volume' ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : 'bg-[#0B0F19] border-white/5 text-white hover:bg-white/5'}`}
          >
            <span className="font-bold">Par Popularité (Volume)</span>
            {sortBy === 'volume' && <TrendingUp className="w-5 h-5" />}
          </button>
          
          <button 
            onClick={() => { setSortBy('price_desc'); setIsFilterOpen(false); }}
            className={`w-full flex items-center justify-between p-4 rounded-2xl border transition-all ${sortBy === 'price_desc' ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : 'bg-[#0B0F19] border-white/5 text-white hover:bg-white/5'}`}
          >
            <span className="font-bold">Prix: Plus élevé</span>
            {sortBy === 'price_desc' && <TrendingUp className="w-5 h-5" />}
          </button>

          <button 
            onClick={() => { setSortBy('price_asc'); setIsFilterOpen(false); }}
            className={`w-full flex items-center justify-between p-4 rounded-2xl border transition-all ${sortBy === 'price_asc' ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : 'bg-[#0B0F19] border-white/5 text-white hover:bg-white/5'}`}
          >
            <span className="font-bold">Prix: Moins élevé</span>
            {sortBy === 'price_asc' && <TrendingDown className="w-5 h-5" />}
          </button>
        </div>
      </BottomSheet>

    </div>
  );
}


