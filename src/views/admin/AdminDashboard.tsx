import React, { useEffect, useState } from 'react';
import { 
  collection, query, where, getDocs, onSnapshot,
  limit, orderBy, getCountFromServer, getAggregateFromServer, sum, average 
} from 'firebase/firestore';
import { db } from '../../firebase';
import { 
  Users, BookOpen, Wallet, Target, ArrowUpRight, 
  Loader2, BadgeCheck, AlertCircle, Clock 
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer 
} from 'recharts';
import { useRole } from '../../context/RoleContext';

export function AdminDashboard() {
  const { isUserLoading, role } = useRole();
  const [stats, setStats] = useState({
    totalRevenue: 0,
    studentsCount: 0,
    instructorsCount: 0,
    coursesCount: 0,
    avgCompletion: 0,
  });
  const [recentTransactions, setRecentTransactions] = useState<any[]>([]);
  const [chartData, setChartData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isUserLoading) return;
    if (role !== 'admin') {
      setLoading(false);
      return;
    }

    let isMounted = true;

    async function fetchDashboardData() {
      try {
        const paymentsRef = collection(db, 'payments');
        
        // 1. Chiffre d'Affaires Global (Aggregation 1 read)
        const revenueSnap = await getAggregateFromServer(query(paymentsRef, where('status', 'in', ['Completed', 'succeeded', 'paid'])), {
          total: sum('amount')
        });

        // 2. Nombre Total d'Utilisateurs (2 reads via getCountFromServer)
        const usersRef = collection(db, 'users');
        const studentsSnap = await getCountFromServer(query(usersRef, where('role', '==', 'student')));
        const instructorsSnap = await getCountFromServer(query(usersRef, where('role', '==', 'instructor')));

        // 3. Nombre Total de Cours (1 read via getCountFromServer)
        const coursesRef = collection(db, 'courses');
        const coursesSnap = await getCountFromServer(coursesRef);

        // 4. Taux de Complétion Moyen (Aggregation 1 read)
        const enrollmentsRef = collection(db, 'enrollments');
        const completionSnap = await getAggregateFromServer(enrollmentsRef, {
          avg: average('progress')
        });

        // 6. Chart Data (Group recent successful payments by month)
        const allCompletedTxSnap = await getDocs(query(paymentsRef, where('status', 'in', ['Completed', 'succeeded', 'paid'])));
        
        const months = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Août', 'Sep', 'Oct', 'Nov', 'Déc'];
        const sixMonthsData = [];
        const today = new Date();
        for (let i = 5; i >= 0; i--) {
          const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
          sixMonthsData.push({
            name: months[d.getMonth()],
            monthIndex: d.getMonth(),
            year: d.getFullYear(),
            revenue: 0
          });
        }

        allCompletedTxSnap.forEach(doc => {
           const data = doc.data();
           const dObj = data.createdAt?.toDate ? data.createdAt.toDate() : new Date(data.createdAt || 0);
           const m = dObj.getMonth();
           const y = dObj.getFullYear();
           
           const targetMonth = sixMonthsData.find(mData => mData.monthIndex === m && mData.year === y);
           if (targetMonth) {
             targetMonth.revenue += (Number(data.amount) || 0);
           }
        });

        if (isMounted) {
          setStats({
            totalRevenue: revenueSnap.data().total || 0,
            studentsCount: studentsSnap.data().count,
            instructorsCount: instructorsSnap.data().count,
            coursesCount: coursesSnap.data().count,
            avgCompletion: completionSnap.data().avg || 0,
          });
          setChartData(sixMonthsData);
          setLoading(false);
        }
      } catch (error) {
        console.error("Erreur lors de la récupération des statistiques (FinOps):", error);
        if (isMounted) setLoading(false);
      }
    }

    fetchDashboardData();

    // 5. Récents Paiements Écoute Active (Realtime)
    const unsubTx = onSnapshot(query(collection(db, 'payments'), orderBy('createdAt', 'desc'), limit(5)), (snap) => {
       const txs = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
       if (isMounted) setRecentTransactions(txs);
    });

    return () => {
      isMounted = false;
      unsubTx();
    };
  }, [isUserLoading, role]);

  if (loading) {
    return (
      <div className="w-full px-4 flex flex-col items-stretch space-y-6 lg:space-y-8 animate-in fade-in duration-500 pb-20 font-sans">
        <div className="space-y-2">
          <div className="h-8 w-64 bg-slate-800 rounded-lg animate-pulse"></div>
          <div className="h-4 w-96 bg-slate-800/80 rounded animate-pulse"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 lg:gap-6">
          {[...Array(4)].map((_, i) => (
             <div key={i} className="bg-slate-800/20 border border-slate-700/30 rounded-3xl p-6 h-32 animate-pulse flex flex-col justify-between">
                <div className="w-10 h-10 rounded-2xl bg-slate-800"></div>
                <div className="space-y-2">
                  <div className="h-3 w-20 bg-slate-800 rounded"></div>
                  <div className="h-6 w-32 bg-slate-800 rounded"></div>
                </div>
             </div>
          ))}
        </div>
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
           <div className="xl:col-span-2 bg-slate-800/20 border border-slate-700/30 rounded-3xl p-6 h-[400px] animate-pulse"></div>
           <div className="bg-slate-800/20 border border-slate-700/30 rounded-3xl p-6 h-[400px] animate-pulse"></div>
        </div>
      </div>
    );
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'XAF', maximumFractionDigits: 0 }).format(amount);
  };

  const formatStatus = (status: string) => {
    switch(status?.toLowerCase()) {
      case 'completed':
      case 'succeeded':
      case 'paid':
        return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-widest bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"><BadgeCheck className="w-3 h-3" /> Succès</span>;
      case 'pending':
        return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-widest bg-amber-500/10 text-amber-400 border border-amber-500/20"><Clock className="w-3 h-3" /> En attente</span>;
      case 'failed':
      case 'error':
        return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-widest bg-red-500/10 text-red-400 border border-red-500/20"><AlertCircle className="w-3 h-3" /> Échec</span>;
      default:
        return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-widest bg-slate-500/10 text-slate-400 border border-slate-500/20">{status || 'Inconnu'}</span>;
    }
  };

  return (
    <div className="w-full px-4 flex flex-col items-stretch space-y-6 lg:space-y-8 animate-in fade-in duration-500 pb-20 font-sans">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-black text-white uppercase tracking-widest">Tableau de Bord CEO</h1>
          <p className="text-sm text-slate-400 mt-1">Aperçu en temps réel des performances de la plateforme NDARA.</p>
        </div>
      </div>

      {/* KPI Cards (FinOps Optimized) */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 lg:gap-6">
        
        {/* CA Global */}
        <div className="bg-slate-800/40 border border-slate-700/50 rounded-3xl p-6 relative overflow-hidden group hover:border-emerald-500/50 transition-colors">
          <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity pointer-events-none">
            <Wallet className="w-24 h-24 text-emerald-500 -mt-8 -mr-8" />
          </div>
          <div className="flex justify-between items-start mb-4 relative z-10">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
              <Wallet className="w-5 h-5 text-emerald-400" />
            </div>
          </div>
          <div className="relative z-10">
            <h3 className="text-slate-500 text-[10px] font-black uppercase tracking-widest mb-1">C.A Global</h3>
            <p className="text-3xl font-black text-white tracking-tight">{formatCurrency(stats.totalRevenue)}</p>
          </div>
        </div>

        {/* Utilisateurs */}
        <div className="bg-slate-800/40 border border-slate-700/50 rounded-3xl p-6 relative overflow-hidden group hover:border-blue-500/50 transition-colors">
          <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity pointer-events-none">
            <Users className="w-24 h-24 text-blue-500 -mt-8 -mr-8" />
          </div>
          <div className="flex justify-between items-start mb-4 relative z-10">
            <div className="w-10 h-10 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
              <Users className="w-5 h-5 text-blue-400" />
            </div>
          </div>
          <div className="relative z-10">
            <h3 className="text-slate-500 text-[10px] font-black uppercase tracking-widest mb-1">Membres Actifs</h3>
            <div className="flex items-baseline gap-2">
              <p className="text-3xl font-black text-white tracking-tight">{stats.studentsCount + stats.instructorsCount}</p>
            </div>
            <div className="flex gap-3 mt-2">
              <span className="text-[10px] font-bold text-slate-400"><span className="text-blue-400">{stats.studentsCount}</span> Étudiants</span>
              <span className="text-[10px] font-bold text-slate-400"><span className="text-purple-400">{stats.instructorsCount}</span> Instructeurs</span>
            </div>
          </div>
        </div>

        {/* Catalogue */}
        <div className="bg-slate-800/40 border border-slate-700/50 rounded-3xl p-6 relative overflow-hidden group hover:border-purple-500/50 transition-colors">
          <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity pointer-events-none">
            <BookOpen className="w-24 h-24 text-purple-500 -mt-8 -mr-8" />
          </div>
          <div className="flex justify-between items-start mb-4 relative z-10">
            <div className="w-10 h-10 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-purple-400" />
            </div>
          </div>
          <div className="relative z-10">
            <h3 className="text-slate-500 text-[10px] font-black uppercase tracking-widest mb-1">Catalogue Formations</h3>
            <p className="text-3xl font-black text-white tracking-tight">{stats.coursesCount} <span className="text-sm text-slate-500 font-bold tracking-normal uppercase">Cours</span></p>
          </div>
        </div>

        {/* Completion */}
        <div className="bg-slate-800/40 border border-slate-700/50 rounded-3xl p-6 relative overflow-hidden group hover:border-amber-500/50 transition-colors">
          <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity pointer-events-none">
            <Target className="w-24 h-24 text-amber-500 -mt-8 -mr-8" />
          </div>
          <div className="flex justify-between items-start mb-4 relative z-10">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
              <Target className="w-5 h-5 text-amber-400" />
            </div>
          </div>
          <div className="relative z-10">
            <h3 className="text-slate-500 text-[10px] font-black uppercase tracking-widest mb-1">Taux de Complétion</h3>
            <p className="text-3xl font-black text-white tracking-tight">{Math.round(stats.avgCompletion || 0)}%</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        
        {/* Chart */}
        <div className="xl:col-span-2 bg-slate-800/40 border border-slate-700/50 rounded-3xl p-6 flex flex-col">
          <div className="mb-6 flex justify-between items-end">
            <div>
              <h2 className="text-sm font-black text-white uppercase tracking-widest mb-1">Croissance des Revenus</h2>
              <p className="text-xs text-slate-400">Évolution du volume des paiements sur les 6 derniers mois</p>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <ArrowUpRight className="w-4 h-4" />
              <span className="text-xs font-bold tracking-widest">{chartData.length >= 2 && chartData[chartData.length - 2].revenue > 0 ? `+${Math.round(((chartData[chartData.length - 1].revenue - chartData[chartData.length - 2].revenue) / chartData[chartData.length - 2].revenue) * 100)}%` : '+0%'}</span>
            </div>
          </div>
          
          <div className="flex-1 w-full min-h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                <XAxis dataKey="name" stroke="#64748b" tick={{fill: '#64748b', fontSize: 12}} tickLine={false} axisLine={false} dy={10} />
                <YAxis 
                  stroke="#64748b" 
                  tick={{fill: '#64748b', fontSize: 12}} 
                  tickLine={false} 
                  axisLine={false} 
                  dx={-10}
                  tickFormatter={(val) => `${val/1000}k`} 
                />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '1rem', color: '#fff' }}
                  itemStyle={{ color: '#10B981', fontWeight: 'bold' }}
                  labelStyle={{ color: '#94a3b8', fontSize: '12px', textTransform: 'uppercase', marginBottom: '4px' }}
                  formatter={(value: any) => [formatCurrency(value), 'Revenus']}
                />
                <Area type="monotone" dataKey="revenue" stroke="#10B981" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent Transactions */}
        <div className="bg-slate-800/40 border border-slate-700/50 rounded-3xl p-6 flex flex-col">
          <div className="mb-6">
            <h2 className="text-sm font-black text-white uppercase tracking-widest mb-1">Derniers Flux</h2>
            <p className="text-xs text-slate-400">Transactions globales de la plateforme</p>
          </div>
          
          <div className="flex-1 overflow-x-auto">
            {recentTransactions.length > 0 ? (
              <div className="space-y-3">
                {recentTransactions.map((tx) => (
                  <div key={tx.id} className="flex items-center justify-between p-3 rounded-2xl bg-slate-900/50 border border-slate-700/30 hover:border-slate-600/50 transition">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center shrink-0 border border-slate-700">
                        <span className="text-xs font-black text-slate-300 uppercase">
                          {tx.studentName ? tx.studentName.charAt(0) : '?'}
                        </span>
                      </div>
                      <div>
                        <p className="text-sm font-bold text-white line-clamp-1">{tx.studentName || 'Utilisateur inconnu'}</p>
                        <p className="text-[10px] text-slate-400 uppercase tracking-widest font-bold mt-0.5">{tx.paymentMethod || 'Carte'} • {tx.createdAt?.toDate ? new Date(tx.createdAt.toDate()).toLocaleDateString() : 'Récemment'}</p>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-1.5">
                       <span className="text-sm font-black text-emerald-400">{formatCurrency(tx.amount || 0)}</span>
                       {formatStatus(tx.status || tx.gatewayStatus || 'Pending')}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 bg-slate-900/30 rounded-2xl border border-dashed border-slate-700/50">
                <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mt-4">Aucune transaction</p>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
