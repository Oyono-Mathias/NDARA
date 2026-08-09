import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useRole } from "../../context/RoleContext";
import { db } from '../../firebase';
import { doc, getDoc, collection, query, where, getDocs, orderBy, limit, onSnapshot } from 'firebase/firestore';
import { useToast } from '../../hooks/use-toast';
import { Loader2, Copy, CheckCircle2, TrendingUp, Users, DollarSign, Share2, Trophy, Medal, Star, Target, Gift } from 'lucide-react';
import { logger } from '../../lib/logger';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Link } from 'react-router-dom';

export function AmbassadorDashboard() {
  const { firebaseUser } = useAuth();
  const { currentUser } = useRole();
  const { toast } = useToast();
  
  const [loading, setLoading] = useState(true);
  const [ambassadorData, setAmbassadorData] = useState<any>(null);
  const [copied, setCopied] = useState(false);
  const [stats, setStats] = useState<any>({});
  const [rank, setRank] = useState<number | null>(null);
  const [chartData, setChartData] = useState<any[]>([]);
  const [recentRewards, setRecentRewards] = useState<any[]>([]);

  
  useEffect(() => {
    if (!firebaseUser) return;
    setLoading(true);

    const unsubAmbassador = onSnapshot(doc(db, 'ambassadors', firebaseUser.uid), (docSnap) => {
      if (docSnap.exists()) setAmbassadorData(docSnap.data());
    });

    const unsubStats = onSnapshot(doc(db, 'affiliate_statistics', firebaseUser.uid), (statSnap) => {
      setStats(statSnap.exists() ? statSnap.data() : {
        level: 'bronze', totalSalesCount: 0, totalSalesVolume: 0, totalReferrals: 0, badges: [], challenges: []
      });
    });

    const unsubLeaderboard = onSnapshot(query(collection(db, 'ambassadors'), orderBy('totalSales', 'desc')), (snap) => {
      const rankIndex = snap.docs.findIndex(d => d.id === firebaseUser.uid);
      setRank(rankIndex !== -1 ? rankIndex + 1 : null);
    });

    const unsubRewards = onSnapshot(query(collection(db, 'affiliate_rewards'), where('userId', '==', firebaseUser.uid), orderBy('date', 'desc'), limit(5)), (snap) => {
      setRecentRewards(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });

    const unsubTx = onSnapshot(query(collection(db, 'affiliate_transactions'), where('ambassadorUid', '==', firebaseUser.uid), orderBy('createdAt', 'asc')), (snap) => {
      const txs = snap.docs.map(d => d.data());
      
      const grouped = txs.reduce((acc: any, tx: any) => {
          if (!tx.createdAt) return acc;
          const d = tx.createdAt.toDate ? tx.createdAt.toDate() : new Date(tx.createdAt);
          const dateStr = format(d, 'dd MMM', { locale: fr });
          if (!acc[dateStr]) acc[dateStr] = 0;
          acc[dateStr] += (tx.commission || 0);
          return acc;
      }, {});

      const chart = Object.keys(grouped).map(date => ({
          date,
          gains: grouped[date]
      }));
      setChartData(chart);
      setLoading(false);
    });

    return () => {
      unsubAmbassador();
      unsubStats();
      unsubLeaderboard();
      unsubRewards();
      unsubTx();
    };
  }, [firebaseUser]);


  const copyToClipboard = () => {
    if (ambassadorData?.referralLink) {
      navigator.clipboard.writeText(ambassadorData.referralLink);
      setCopied(true);
      toast({ title: "Lien copié dans le presse-papier !" });
      setTimeout(() => setCopied(false), 3000);
    }
  };

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center p-8">
        <Loader2 className="w-8 h-8 animate-spin text-pink-500" />
      </div>
    );
  }

  if (!ambassadorData) {
    return (
      <div className="p-8 max-w-4xl mx-auto space-y-8 flex flex-col items-center justify-center h-full text-center">
        <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mb-4">
          <Share2 className="w-8 h-8 text-slate-400" />
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">Profil Ambassadeur Non Trouvé</h2>
        <p className="text-slate-400 max-w-md">
          Votre compte est marqué comme ambassadeur, mais aucune donnée d'affiliation n'a été générée.
        </p>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-8 pb-32">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-black text-white uppercase tracking-tight flex items-center gap-3">
          <Trophy className="text-pink-500 w-8 h-8" />
          Tableau de Bord
        </h1>
        <p className="text-slate-400">Vue d'ensemble de vos performances et récompenses.</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-slate-800/20 border border-slate-700 rounded-2xl p-6">
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Revenus</p>
          <p className="text-2xl lg:text-3xl font-black text-white">{(stats.totalAffiliateRevenue || ambassadorData.totalCommission || 0).toLocaleString()}</p>
          <p className="text-xs text-slate-400">XAF Générés</p>
        </div>
        
        <div className="bg-slate-800/20 border border-slate-700 rounded-2xl p-6 relative overflow-hidden">
          <div className="absolute -right-4 -bottom-4 opacity-10">
              <Trophy className="w-24 h-24 text-yellow-500" />
          </div>
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2 relative z-10">Classement</p>
          <p className="text-2xl lg:text-3xl font-black text-white relative z-10">{rank ? `#${rank}` : '-'}</p>
          <p className="text-xs text-slate-400 relative z-10">Global</p>
        </div>

        <div className="bg-slate-800/20 border border-slate-700 rounded-2xl p-6 relative overflow-hidden">
          <div className="absolute -right-4 -bottom-4 opacity-10">
              <Medal className="w-24 h-24 text-pink-500" />
          </div>
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2 relative z-10">Niveau</p>
          <p className="text-2xl lg:text-3xl font-black text-white relative z-10 uppercase">{stats.level || 'Bronze'}</p>
          <Link to="/ambassador/rewards" className="text-[10px] text-pink-400 font-bold hover:underline relative z-10">Voir progression</Link>
        </div>

        <div className="bg-slate-800/20 border border-slate-700 rounded-2xl p-6 relative overflow-hidden">
          <div className="absolute -right-4 -bottom-4 opacity-10">
              <Star className="w-24 h-24 text-amber-500" />
          </div>
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2 relative z-10">Badges</p>
          <p className="text-2xl lg:text-3xl font-black text-white relative z-10">{(stats.badges || []).length}</p>
          <p className="text-xs text-slate-400 relative z-10">Débloqués</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Chart */}
          <div className="lg:col-span-2 bg-[#111827] border border-[#1E293B] rounded-3xl p-6">
              <h2 className="text-sm font-black text-white uppercase tracking-widest mb-6">Évolution des Gains</h2>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData}>
                        <defs>
                            <linearGradient id="colorGains" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#ec4899" stopOpacity={0.3}/>
                                <stop offset="95%" stopColor="#ec4899" stopOpacity={0}/>
                            </linearGradient>
                        </defs>
                        <XAxis dataKey="date" stroke="#334155" fontSize={10} tickMargin={10} />
                        <YAxis stroke="#334155" fontSize={10} tickFormatter={(val) => `${val}`} />
                        <Tooltip 
                            contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '12px', color: '#f8fafc' }}
                            itemStyle={{ color: '#34d399', fontWeight: 'bold' }}
                        />
                        <Area type="monotone" dataKey="gains" stroke="#ec4899" strokeWidth={3} fillOpacity={1} fill="url(#colorGains)" />
                    </AreaChart>
                </ResponsiveContainer>
              </div>
          </div>

          {/* Quick Actions & Info */}
          <div className="space-y-4">
              <div className="bg-[#111827] border border-[#1E293B] rounded-3xl p-6">
                 <h2 className="text-sm font-black text-white uppercase tracking-widest mb-4">Lien de Parrainage</h2>
                 <div className="flex items-center gap-2 mb-2">
                    <input 
                        type="text" 
                        readOnly 
                        value={ambassadorData.referralLink}
                        className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs font-mono text-slate-400 focus:outline-none"
                    />
                    <button onClick={copyToClipboard} className="p-2 bg-pink-500 hover:bg-pink-600 rounded-lg text-white transition-colors shrink-0">
                        {copied ? <CheckCircle2 className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    </button>
                 </div>
                 <p className="text-[10px] text-slate-500 uppercase">Code: <strong className="text-pink-400">{ambassadorData.referralCode}</strong></p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                  <div className="bg-[#111827] border border-[#1E293B] rounded-2xl p-4 flex flex-col items-center text-center gap-2">
                      <Target className="w-6 h-6 text-blue-400" />
                      <p className="text-xl font-black text-white">{(stats.challenges || []).length}</p>
                      <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Objectifs Atteints</p>
                  </div>
                  <div className="bg-[#111827] border border-[#1E293B] rounded-2xl p-4 flex flex-col items-center text-center gap-2">
                      <Gift className="w-6 h-6 text-emerald-400" />
                      <p className="text-xl font-black text-white">{recentRewards.length}</p>
                      <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Bonus Récents</p>
                  </div>
              </div>
          </div>
      </div>

      {/* Historique Récompenses */}
      <div className="bg-[#111827] border border-[#1E293B] rounded-3xl p-6">
          <div className="flex justify-between items-center mb-6">
              <h2 className="text-sm font-black text-white uppercase tracking-widest">Historique des Récompenses</h2>
              <Link to="/ambassador/rewards" className="text-xs font-bold text-pink-400 hover:underline">Voir tout</Link>
          </div>
          <div className="overflow-x-auto">
              <table className="w-full text-left">
                  <thead>
                      <tr className="border-b border-slate-800">
                          <th className="pb-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Date</th>
                          <th className="pb-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Récompense</th>
                          <th className="pb-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest text-right">Gains</th>
                      </tr>
                  </thead>
                  <tbody>
                      {recentRewards.length === 0 ? (
                          <tr><td colSpan={3} className="py-8 text-center text-slate-500 text-sm">Aucune récompense récente.</td></tr>
                      ) : (
                          recentRewards.map(r => (
                              <tr key={r.id} className="border-b border-slate-800/50 last:border-0">
                                  <td className="py-4 text-xs text-slate-400">{r.date?.toDate ? format(r.date.toDate(), 'dd MMM yyyy', { locale: fr }) : '-'}</td>
                                  <td className="py-4 text-sm font-bold text-white">{r.titre || r.description}</td>
                                  <td className="py-4 text-sm font-black text-emerald-400 text-right">+{r.montant?.toLocaleString()} XAF</td>
                              </tr>
                          ))
                      )}
                  </tbody>
              </table>
          </div>
      </div>

    </div>
  );
}
