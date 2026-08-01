import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { db } from '../../firebase';
import { collection, query, where, getDocs, onSnapshot, orderBy, limit, startAfter, getCountFromServer } from 'firebase/firestore';
import { useToast } from '../../hooks/use-toast';
import { Loader2, DollarSign, Clock, CheckCircle2, XCircle, Search, Download, ArrowUpDown, Calendar, ArrowRightLeft } from 'lucide-react';
import clsx from 'clsx';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { CSVLink } from "react-csv";

export function AmbassadorCommissions() {
  const { firebaseUser } = useAuth();
  const { toast } = useToast();

  const [loading, setLoading] = useState(true);
  const [commissions, setCommissions] = useState<any[]>([]);
  
  const [stats, setStats] = useState<any>({
    totalEarned: 0,
    pending: 0,
    validated: 0,
    paid: 0,
    cancelled: 0,
    monthIncome: 0,
    yearIncome: 0
  });

  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all'); // all, pending, validated, paid, cancelled
  
  const [exportData, setExportData] = useState<any[]>([]);
  const [exporting, setExporting] = useState(false);

  // Realtime notification tracking
  const [latestCommTime, setLatestCommTime] = useState<number>(Date.now());
  const initialLoadRef = useRef(true);

  useEffect(() => {
    if (!firebaseUser) return;

    fetchDashboardStats();

    // Listen for new commissions
    const q = query(
      collection(db, 'ambassador_commissions'),
      where('ambassadorUid', '==', firebaseUser.uid),
      orderBy('createdAt', 'desc'),
      limit(1)
    );
    
    const unsub = onSnapshot(q, (snapshot) => {
      if (initialLoadRef.current) {
        initialLoadRef.current = false;
        return;
      }
      snapshot.docChanges().forEach((change) => {
        if (change.type === 'added') {
          const data = change.doc.data();
          if (data.createdAt && data.createdAt.toMillis() > latestCommTime) {
            toast({ title: "Nouvelle Commission !", description: `Une commission de ${data.montantCommission} XAF a été générée.` });
            setLatestCommTime(data.createdAt.toMillis());
            fetchDashboardStats(); // Refresh stats
            loadCommissions(); // Reload table
          }
        }
      });
    });

    return () => unsub();
  }, [firebaseUser]);

  useEffect(() => {
    if (firebaseUser) {
      loadCommissions();
    }
  }, [firebaseUser, filter]);

  const fetchDashboardStats = async () => {
    try {
      // We can fetch from ambassador document
      const docSnap = await getDocs(query(collection(db, 'ambassadors'), where('__name__', '==', firebaseUser?.uid)));
      if (!docSnap.empty) {
        const data = docSnap.docs[0].data();
        
        // Also fetch monthly/yearly directly from commissions to be accurate
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const startOfYear = new Date(now.getFullYear(), 0, 1);
        
        const monthQ = query(collection(db, 'ambassador_commissions'), 
          where('ambassadorUid', '==', firebaseUser?.uid),
          where('statut', 'in', ['validated', 'paid']),
          where('createdAt', '>=', startOfMonth)
        );
        const yearQ = query(collection(db, 'ambassador_commissions'), 
          where('ambassadorUid', '==', firebaseUser?.uid),
          where('statut', 'in', ['validated', 'paid']),
          where('createdAt', '>=', startOfYear)
        );

        let mIncome = 0;
        let yIncome = 0;

        const mSnap = await getDocs(monthQ);
        mSnap.forEach(d => mIncome += (d.data().montantCommission || 0));
        
        const ySnap = await getDocs(yearQ);
        ySnap.forEach(d => yIncome += (d.data().montantCommission || 0));

        setStats({
          totalEarned: data.totalCommission || 0,
          pending: data.pendingCommission || 0,
          validated: data.validatedCommission || 0,
          paid: data.paidCommission || 0,
          cancelled: data.cancelledCommission || 0, // if we tracked it
          monthIncome: mIncome,
          yearIncome: yIncome
        });
      }
    } catch(e) {
      console.error(e);
    }
  };

  const loadCommissions = async () => {
    setLoading(true);
    try {
      let qList: any[] = [
        where('ambassadorUid', '==', firebaseUser?.uid)
      ];

      if (filter !== 'all') {
        qList.push(where('statut', '==', filter));
      }

      // Without createdAt index, we might need to sort locally or rely on a simple query
      // For Phase 4, to ensure we don't crash on missing indexes, let's just query and sort locally if needed,
      // but orderBy createdAt is best. If it fails, we catch it.
      let q = query(
        collection(db, 'ambassador_commissions'),
        ...qList,
        orderBy('createdAt', 'desc'),
        limit(100) // limited for performance
      );

      const snap = await getDocs(q);
      const docs = snap.docs.map(d => ({ id: d.id, ...d.data() }));

      // Fetch user details for these commissions
      const uids = [...new Set(docs.map((d: any) => d.referralUid))];
      const usersData: any = {};
      
      for (let i = 0; i < uids.length; i += 30) {
         const chunk = uids.slice(i, i + 30);
         const uSnap = await getDocs(query(collection(db, 'users'), where('__name__', 'in', chunk)));
         uSnap.docs.forEach(uDoc => {
             usersData[uDoc.id] = uDoc.data();
         });
      }

      const combined = docs.map((d: any) => ({
         ...d,
         user: usersData[d.referralUid] || {}
      }));

      setCommissions(combined);
    } catch(e: any) {
      console.error(e);
      if (e.message.includes('index')) {
         toast({ title: "Index manquant", description: "Veuillez patienter pendant la génération de l'index.", variant: "destructive" });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleExport = () => {
    setExporting(true);
    try {
      const csvData = commissions.map(d => {
        return {
          'Date': d.createdAt?.toDate ? format(d.createdAt.toDate(), 'dd/MM/yyyy HH:mm') : '',
          'Transaction': d.transactionId,
          'Filleul': d.user.displayName || 'Inconnu',
          'Produit': d.formationId,
          'Montant Achat': d.montantVente,
          'Pourcentage': `${d.pourcentage}%`,
          'Commission (XAF)': d.montantCommission,
          'Statut': d.statut
        };
      });

      setExportData(csvData);
      setTimeout(() => {
        document.getElementById('csv-commissions-btn')?.click();
        toast({ title: "Export réussi", description: "Le fichier CSV a été généré." });
      }, 500);
    } catch(e) {
      toast({ title: "Erreur", description: "Impossible d'exporter", variant: "destructive" });
    } finally {
      setExporting(false);
    }
  };

  const filteredCommissions = commissions.filter(c => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      (c.user.displayName || '').toLowerCase().includes(term) ||
      (c.transactionId || '').toLowerCase().includes(term) ||
      (c.formationId || '').toLowerCase().includes(term)
    );
  });

  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'validated': return <span className="px-3 py-1 bg-emerald-500/20 text-emerald-400 rounded-full text-[10px] font-bold uppercase">Validée</span>;
      case 'pending': return <span className="px-3 py-1 bg-amber-500/20 text-amber-400 rounded-full text-[10px] font-bold uppercase">En attente</span>;
      case 'paid': return <span className="px-3 py-1 bg-blue-500/20 text-blue-400 rounded-full text-[10px] font-bold uppercase">Payée</span>;
      case 'cancelled': return <span className="px-3 py-1 bg-rose-500/20 text-rose-400 rounded-full text-[10px] font-bold uppercase">Annulée</span>;
      default: return <span className="px-3 py-1 bg-slate-800 text-slate-400 rounded-full text-[10px] font-bold uppercase">{status}</span>;
    }
  };

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-8 pb-32">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-white uppercase tracking-tight flex items-center gap-3">
            <DollarSign className="text-emerald-500 w-8 h-8" />
            Mes Commissions
          </h1>
          <p className="text-slate-400">Historique et revenus de vos parrainages.</p>
        </div>
        
        <div className="flex items-center gap-3">
          <button 
            onClick={handleExport}
            disabled={exporting || commissions.length === 0}
            className="px-4 py-3 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl transition-colors flex items-center gap-2 text-sm disabled:opacity-50"
          >
            {exporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
            EXPORTER
          </button>
          <CSVLink 
            data={exportData} 
            filename={`ndara_commissions_${format(new Date(), 'yyyyMMdd')}.csv`}
            id="csv-commissions-btn"
            className="hidden"
          />
        </div>
      </div>

      {/* STATS */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
        <StatCard title="Total Gagné" value={`${stats.totalEarned?.toLocaleString()} XAF`} icon={<DollarSign className="w-5 h-5 text-emerald-400" />} />
        <StatCard title="En Attente" value={`${stats.pending?.toLocaleString()} XAF`} icon={<Clock className="w-5 h-5 text-amber-400" />} />
        <StatCard title="Validées" value={`${stats.validated?.toLocaleString()} XAF`} icon={<CheckCircle2 className="w-5 h-5 text-emerald-400" />} />
        <StatCard title="Payées" value={`${stats.paid?.toLocaleString()} XAF`} icon={<DollarSign className="w-5 h-5 text-blue-400" />} />
        <StatCard title="Annulées" value={`${stats.cancelled?.toLocaleString()} XAF`} icon={<XCircle className="w-5 h-5 text-rose-400" />} />
        <StatCard title="Revenus Mois" value={`${stats.monthIncome?.toLocaleString()} XAF`} icon={<Calendar className="w-5 h-5 text-purple-400" />} />
        <StatCard title="Revenus Année" value={`${stats.yearIncome?.toLocaleString()} XAF`} icon={<Calendar className="w-5 h-5 text-indigo-400" />} />
      </div>

      {/* FILTERS */}
      <div className="bg-[#111827] border border-[#1E293B] rounded-2xl p-4 flex flex-col lg:flex-row gap-4 items-center justify-between">
        <div className="relative w-full lg:w-96">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
          <input 
            type="text" 
            placeholder="Rechercher nom, transaction, produit..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 rounded-xl py-3 pl-12 pr-4 text-white focus:outline-none focus:border-emerald-500/50"
          />
        </div>

        <div className="flex items-center gap-3 w-full lg:w-auto overflow-x-auto hide-scrollbar">
          <div className="flex items-center gap-2 bg-slate-900 rounded-xl p-1 border border-slate-800 shrink-0">
            {['all', 'pending', 'validated', 'paid', 'cancelled'].map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={clsx(
                  "px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-widest transition-colors whitespace-nowrap",
                  filter === f ? "bg-emerald-500/20 text-emerald-400" : "text-slate-500 hover:text-slate-300 hover:bg-slate-800"
                )}
              >
                {f === 'all' ? 'Toutes' : f === 'pending' ? 'En attente' : f === 'validated' ? 'Validées' : f === 'paid' ? 'Payées' : 'Annulées'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* TABLE */}
      <div className="bg-[#111827] border border-[#1E293B] rounded-3xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[1000px]">
            <thead>
              <tr className="bg-slate-900/50 border-b border-slate-800">
                <th className="p-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Date</th>
                <th className="p-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Filleul</th>
                <th className="p-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Produit</th>
                <th className="p-4 text-[10px] font-black text-slate-500 uppercase tracking-widest text-right">Achat</th>
                <th className="p-4 text-[10px] font-black text-slate-500 uppercase tracking-widest text-right">Commission</th>
                <th className="p-4 text-[10px] font-black text-slate-500 uppercase tracking-widest text-center">Statut</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} className="p-12 text-center">
                    <Loader2 className="w-8 h-8 animate-spin text-emerald-500 mx-auto" />
                  </td>
                </tr>
              ) : filteredCommissions.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-12 text-center text-slate-500">
                    Aucune commission trouvée.
                  </td>
                </tr>
              ) : (
                filteredCommissions.map((comm) => (
                  <tr key={comm.id} className="border-b border-slate-800/50 hover:bg-slate-800/30 transition-colors">
                    <td className="p-4 text-sm text-slate-400">
                      {comm.createdAt?.toDate ? format(comm.createdAt.toDate(), 'dd/MM/yyyy HH:mm', { locale: fr }) : '-'}
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <img 
                          src={comm.user?.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(comm.user?.displayName || 'U')}&background=0D9488&color=fff`}
                          alt=""
                          className="w-8 h-8 rounded-full object-cover bg-slate-800"
                        />
                        <div>
                          <p className="font-bold text-sm text-white">{comm.user?.displayName || 'Inconnu'}</p>
                          <p className="text-[10px] text-slate-500 font-mono">TX: {comm.transactionId?.substring(0,8)}...</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <ArrowRightLeft className="w-4 h-4 text-slate-500" />
                        <span className="text-sm font-medium text-slate-300">{comm.formationId === 'instructor_license' ? 'Licence Formateur' : comm.formationId}</span>
                      </div>
                    </td>
                    <td className="p-4 text-right">
                      <span className="text-sm font-bold text-slate-300">{comm.montantVente?.toLocaleString() || 0} XAF</span>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex flex-col items-end">
                        <span className="text-sm font-black text-emerald-400">+{comm.montantCommission?.toLocaleString() || 0} XAF</span>
                        <span className="text-[10px] text-slate-500 font-bold">{comm.pourcentage}%</span>
                      </div>
                    </td>
                    <td className="p-4 text-center">
                      {getStatusBadge(comm.statut)}
                    </td>
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

function StatCard({ title, value, icon }: { title: string, value: string, icon: React.ReactNode }) {
  return (
    <div className="bg-[#111827] border border-[#1E293B] rounded-2xl p-4 flex flex-col justify-between h-28">
      <div className="flex items-center justify-between mb-2">
        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{title}</p>
        {icon}
      </div>
      <p className="text-xl font-black text-white truncate" title={value}>{value}</p>
    </div>
  );
}
