const fs = require('fs');

const code = `import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { db } from '../../firebase';
import { collection, query, where, getDocs, onSnapshot, orderBy, limit, doc, getDoc } from 'firebase/firestore';
import { useToast } from '../../hooks/use-toast';
import { Loader2, DollarSign, Clock, CheckCircle2, XCircle, Search, Download, ArrowUpDown, Calendar, ArrowRightLeft } from 'lucide-react';
import clsx from 'clsx';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { CSVLink } from "react-csv";

export function AmbassadorCommissions() {
  const { firebaseUser, currentUser } = useAuth();
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

  const [walletStats, setWalletStats] = useState<any>({});

  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all'); // all, pending, validated, paid, cancelled
  
  const [exportData, setExportData] = useState<any[]>([]);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    if (!firebaseUser) return;
    
    // Listen to wallet
    const unsubWallet = onSnapshot(doc(db, 'wallets', firebaseUser.uid), (doc) => {
        if(doc.exists()) {
            setWalletStats(doc.data());
        }
    });
    
    // Listen to statistics
    const unsubStats = onSnapshot(doc(db, 'affiliate_statistics', firebaseUser.uid), (docSnap) => {
        if (docSnap.exists()) {
            const data = docSnap.data();
            setStats(prev => ({
                ...prev,
                totalEarned: data.totalCommission || 0,
                validated: data.validatedCommission || 0,
                pending: data.pendingCommission || 0,
                paid: data.paidCommission || 0,
            }));
        }
    });

    fetchDashboardStats();
    loadCommissions();

    return () => {
        unsubWallet();
        unsubStats();
    };
  }, [firebaseUser, filter]);

  const fetchDashboardStats = async () => {
    try {
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const startOfYear = new Date(now.getFullYear(), 0, 1);
        
        const monthQ = query(collection(db, 'affiliate_transactions'), 
          where('ambassadorId', '==', firebaseUser?.uid),
          where('status', 'in', ['validated', 'paid']),
          where('createdAt', '>=', startOfMonth)
        );

        const yearQ = query(collection(db, 'affiliate_transactions'), 
          where('ambassadorId', '==', firebaseUser?.uid),
          where('status', 'in', ['validated', 'paid']),
          where('createdAt', '>=', startOfYear)
        );

        let mIncome = 0;
        let yIncome = 0;
        const mSnap = await getDocs(monthQ);
        mSnap.forEach(d => mIncome += (d.data().commission || 0));
        
        const ySnap = await getDocs(yearQ);
        ySnap.forEach(d => yIncome += (d.data().commission || 0));

        setStats(prev => ({
          ...prev,
          monthIncome: mIncome,
          yearIncome: yIncome
        }));
    } catch (e) {
        console.error(e);
    }
  };

  const loadCommissions = async () => {
    if (!firebaseUser) return;
    setLoading(true);
    try {
      let q = query(
        collection(db, 'affiliate_transactions'),
        where('ambassadorId', '==', firebaseUser.uid),
        orderBy('createdAt', 'desc')
      );
      
      if (filter !== 'all') {
        q = query(q, where('status', '==', filter));
      }

      const querySnapshot = await getDocs(q);
      const coms: any[] = [];
      const userIds = new Set<string>();

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        data.id = doc.id;
        coms.push(data);
        if (data.buyerId) userIds.add(data.buyerId);
      });

      // Fetch user details for buyers
      const usersData: Record<string, any> = {};
      if (userIds.size > 0) {
        const userChunks = Array.from(userIds).reduce((resultArray: any[], item, index) => { 
          const chunkIndex = Math.floor(index/10);
          if(!resultArray[chunkIndex]) {
            resultArray[chunkIndex] = []; 
          }
          resultArray[chunkIndex].push(item);
          return resultArray;
        }, []);

        for (const chunk of userChunks) {
          const uSnap = await getDocs(query(collection(db, 'users'), where('__name__', 'in', chunk)));
          uSnap.forEach(uDoc => {
            usersData[uDoc.id] = uDoc.data();
          });
        }
      }

      coms.forEach(c => {
        if (c.buyerId && usersData[c.buyerId]) {
          c.user = usersData[c.buyerId];
        }
      });

      setCommissions(coms);
    } catch (error) {
      console.error("Error loading commissions:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredCommissions = commissions.filter(comm => {
    if (!searchTerm) return true;
    const lower = searchTerm.toLowerCase();
    return (
      (comm.user?.displayName?.toLowerCase() || '').includes(lower) ||
      (comm.courseId?.toLowerCase() || '').includes(lower) ||
      (comm.orderId?.toLowerCase() || '').includes(lower) ||
      (comm.id?.toLowerCase() || '').includes(lower)
    );
  });

  const handleExport = () => {
    setExporting(true);
    const data = filteredCommissions.map(c => ({
      ID: c.id,
      Date: c.createdAt?.toDate ? format(c.createdAt.toDate(), 'dd/MM/yyyy HH:mm') : '',
      Filleul: c.user?.displayName || c.buyerId,
      Produit: c.courseId,
      MontantAchat: c.amount,
      Commission: c.commission,
      Taux: (c.rate * 100) + "%",
      Statut: c.status
    }));
    setExportData(data);
    setTimeout(() => {
      document.getElementById('csv-commissions-btn')?.click();
      setExporting(false);
    }, 500);
  };

  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'pending': return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-500"><Clock className="w-3 h-3" /> EN ATTENTE</span>;
      case 'validated': return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-500"><CheckCircle2 className="w-3 h-3" /> VALIDÉ</span>;
      case 'paid': return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-blue-500/10 text-blue-500"><DollarSign className="w-3 h-3" /> PAYÉ</span>;
      case 'cancelled': 
      case 'refunded': return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-rose-500/10 text-rose-500"><XCircle className="w-3 h-3" /> ANNULÉ</span>;
      default: return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-slate-800 text-slate-400">{status}</span>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white uppercase tracking-tight flex items-center gap-3">
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
            EXPORTER CSV
          </button>
          <button onClick={() => window.print()} className="px-4 py-3 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl transition-colors flex items-center gap-2 text-sm">
            PDF / Imprimer
          </button>
          <CSVLink 
            data={exportData} 
            filename={\`ndara_commissions_\${format(new Date(), 'yyyyMMdd')}.csv\`}
            id="csv-commissions-btn"
            className="hidden"
          />
        </div>
      </div>

      {/* STATS */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
        <StatCard title="Total Gagné" value={\`\${walletStats.totalAffiliateRevenue?.toLocaleString() || stats.totalEarned.toLocaleString() || 0} XAF\`} icon={<DollarSign className="w-5 h-5 text-emerald-400" />} />
        <StatCard title="Disponible (Wallet)" value={\`\${walletStats.availableBalance?.toLocaleString() || 0} XAF\`} icon={<DollarSign className="w-5 h-5 text-blue-400" />} />
        <StatCard title="En Attente" value={\`\${stats.pending?.toLocaleString()} XAF\`} icon={<Clock className="w-5 h-5 text-amber-400" />} />
        <StatCard title="Validées" value={\`\${stats.validated?.toLocaleString()} XAF\`} icon={<CheckCircle2 className="w-5 h-5 text-emerald-400" />} />
        <StatCard title="Payées" value={\`\${stats.paid?.toLocaleString()} XAF\`} icon={<DollarSign className="w-5 h-5 text-blue-400" />} />
        <StatCard title="Revenus Mois" value={\`\${stats.monthIncome?.toLocaleString()} XAF\`} icon={<Calendar className="w-5 h-5 text-purple-400" />} />
        <StatCard title="Revenus Année" value={\`\${stats.yearIncome?.toLocaleString()} XAF\`} icon={<Calendar className="w-5 h-5 text-indigo-400" />} />
      </div>

      {/* FILTERS */}
      <div className="bg-[#111827] border border-[#1E293B] rounded-2xl p-4 flex flex-col lg:flex-row gap-4 items-center justify-between">
        <div className="relative w-full lg:w-96">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
          <input 
            type="text" 
            placeholder="Rechercher nom, produit, ID..."
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
                          src={comm.user?.photoURL || \`https://ui-avatars.com/api/?name=\${encodeURIComponent(comm.user?.displayName || 'U')}&background=0D9488&color=fff\`}
                          alt=""
                          className="w-8 h-8 rounded-full object-cover bg-slate-800"
                        />
                        <div>
                          <p className="font-bold text-sm text-white">{comm.user?.displayName || comm.buyerId}</p>
                          <p className="text-[10px] text-slate-500 font-mono">ID: {comm.id?.substring(0,8)}...</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <ArrowRightLeft className="w-4 h-4 text-slate-500" />
                        <span className="text-sm font-medium text-slate-300">{comm.courseId}</span>
                      </div>
                    </td>
                    <td className="p-4 text-right">
                      <span className="text-sm font-bold text-slate-300">{comm.amount?.toLocaleString() || 0} XAF</span>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex flex-col items-end">
                        <span className="text-sm font-black text-emerald-400">+{comm.commission?.toLocaleString() || 0} XAF</span>
                        <span className="text-[10px] text-slate-500 font-bold">{Math.round((comm.rate || 0)*100)}%</span>
                      </div>
                    </td>
                    <td className="p-4 text-center">
                      {getStatusBadge(comm.status)}
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
`;

fs.writeFileSync('src/views/ambassador/AmbassadorCommissions.tsx', code);
