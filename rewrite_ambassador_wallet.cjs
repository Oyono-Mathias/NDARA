const fs = require('fs');

const code = `import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { db } from '../../firebase';
import { collection, query, where, getDocs, onSnapshot, orderBy, limit } from 'firebase/firestore';
import { useToast } from '../../hooks/use-toast';
import { Loader2, Wallet, ArrowDownRight, Clock, CheckCircle2, Search, Download, CreditCard, Banknote, AlertCircle, XCircle } from 'lucide-react';
import clsx from 'clsx';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { CSVLink } from "react-csv";

export function AmbassadorWallet() {
  const { firebaseUser } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [wallet, setWallet] = useState<any>(null);
  const [withdrawals, setWithdrawals] = useState<any[]>([]);
  const [stats, setStats] = useState<any>({
    monthIncome: 0,
    yearIncome: 0
  });

  const [withdrawAmount, setWithdrawAmount] = useState<number | ''>('');
  const [paymentMethod, setPaymentMethod] = useState('');
  const [paymentDetails, setPaymentDetails] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const [exportData, setExportData] = useState<any[]>([]);
  const [exporting, setExporting] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (!firebaseUser) return;
    
    const unsubWallet = onSnapshot(collection(db, 'wallets'), (snapshot) => {
       const wDoc = snapshot.docs.find(d => d.id === firebaseUser.uid);
       if (wDoc) {
          setWallet(wDoc.data());
       }
    });
    
    loadWithdrawals();
    fetchIncomeStats();

    return () => unsubWallet();
  }, [firebaseUser]);

  const fetchIncomeStats = async () => {
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

      setStats({
        monthIncome: mIncome,
        yearIncome: yIncome
      });
    } catch(e) {
      console.error(e);
    }
  };

  const loadWithdrawals = async () => {
    setLoading(true);
    try {
      const q = query(
        collection(db, 'withdraw_requests'),
        where('userId', '==', firebaseUser?.uid),
        orderBy('createdAt', 'desc')
      );
      
      const snap = await getDocs(q);
      const docs = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      setWithdrawals(docs);
    } catch(e: any) {
      console.error("Error loading withdrawals", e);
    } finally {
      setLoading(false);
    }
  };

  const handleWithdraw = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!withdrawAmount || Number(withdrawAmount) < 5000) {
      toast({ title: "Erreur", description: "Le minimum de retrait est de 5000 XAF.", variant: "destructive" });
      return;
    }
    if (Number(withdrawAmount) > (wallet?.availableBalance || 0)) {
      toast({ title: "Erreur", description: "Solde insuffisant.", variant: "destructive" });
      return;
    }
    if (!paymentMethod || !paymentDetails) {
      toast({ title: "Erreur", description: "Veuillez remplir tous les champs.", variant: "destructive" });
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch('/api/withdrawals/request', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': \`Bearer \${await firebaseUser.getIdToken()}\`
        },
        body: JSON.stringify({ amount: Number(withdrawAmount), paymentMethod: paymentMethod, paymentAccount: paymentDetails })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        toast({ title: "Succès", description: "Votre demande a été envoyée." });
        setWithdrawAmount('');
        setPaymentDetails('');
        setPaymentMethod('');
        loadWithdrawals();
      } else {
        toast({ title: "Erreur", description: data.error || "Impossible d'envoyer la demande", variant: "destructive" });
      }
    } catch(e: any) {
      toast({ title: "Erreur", description: "Erreur serveur.", variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  const handleExport = () => {
    setExporting(true);
    const data = withdrawals.map(w => ({
      ID: w.id,
      Date: w.createdAt?.toDate ? format(w.createdAt.toDate(), 'dd/MM/yyyy HH:mm') : '',
      Montant: w.amount,
      Methode: w.paymentMethod,
      Compte: w.paymentAccount,
      Statut: w.status,
      Reference: w.reference
    }));
    setExportData(data);
    setTimeout(() => {
      document.getElementById('csv-wallet-btn')?.click();
      setExporting(false);
    }, 500);
  };

  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'pending': return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-500"><Clock className="w-3 h-3" /> EN ATTENTE</span>;
      case 'approved': return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-500"><CheckCircle2 className="w-3 h-3" /> APPROUVÉ</span>;
      case 'paid': return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-blue-500/10 text-blue-500"><Banknote className="w-3 h-3" /> PAYÉ</span>;
      case 'rejected': 
      case 'cancelled': 
      case 'failed': return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-rose-500/10 text-rose-500"><XCircle className="w-3 h-3" /> {status.toUpperCase()}</span>;
      default: return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-slate-800 text-slate-400">{status}</span>;
    }
  };

  const filteredWithdrawals = withdrawals.filter(w => {
     if (!searchTerm) return true;
     const lower = searchTerm.toLowerCase();
     return (w.reference || '').toLowerCase().includes(lower) || 
            (w.paymentAccount || '').toLowerCase().includes(lower) ||
            (w.paymentMethod || '').toLowerCase().includes(lower);
  });

  return (
    <div className="space-y-6 p-4 md:p-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white uppercase tracking-tight flex items-center gap-3">
            <Wallet className="text-emerald-500 w-8 h-8" />
            Mes Retraits
          </h1>
          <p className="text-slate-400">Gérez vos demandes de retrait et votre historique.</p>
        </div>
        
        <div className="flex items-center gap-3">
          <button 
            onClick={handleExport}
            disabled={exporting || withdrawals.length === 0}
            className="px-4 py-3 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl transition-colors flex items-center gap-2 text-sm disabled:opacity-50"
          >
            {exporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
            EXPORTER
          </button>
          <CSVLink 
            data={exportData} 
            filename={\`ndara_retraits_\${format(new Date(), 'yyyyMMdd')}.csv\`}
            id="csv-wallet-btn"
            className="hidden"
          />
        </div>
      </div>

      {/* STATS */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
        <StatCard title="Solde Disponible" value={\`\${(wallet?.availableBalance || 0).toLocaleString()} XAF\`} icon={<Banknote className="w-5 h-5 text-emerald-400" />} />
        <StatCard title="Solde Bloqué (Retrait)" value={\`\${(wallet?.pendingWithdrawalBalance || 0).toLocaleString()} XAF\`} icon={<Clock className="w-5 h-5 text-amber-400" />} />
        <StatCard title="Total Gagné" value={\`\${(wallet?.totalAffiliateRevenue || wallet?.totalEarned || 0).toLocaleString()} XAF\`} icon={<Wallet className="w-5 h-5 text-blue-400" />} />
        <StatCard title="Total Retiré" value={\`\${(wallet?.totalWithdrawn || 0).toLocaleString()} XAF\`} icon={<ArrowDownRight className="w-5 h-5 text-purple-400" />} />
        <StatCard title="Revenus Mois" value={\`\${stats.monthIncome?.toLocaleString()} XAF\`} icon={<Banknote className="w-5 h-5 text-emerald-400" />} />
        <StatCard title="Revenus Année" value={\`\${stats.yearIncome?.toLocaleString()} XAF\`} icon={<Banknote className="w-5 h-5 text-emerald-400" />} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* WITHDRAW FORM */}
        <div className="bg-[#111827] border border-[#1E293B] rounded-3xl p-6 lg:col-span-1">
          <h2 className="text-sm font-black text-white uppercase tracking-widest mb-6 flex items-center gap-2">
            <ArrowDownRight className="w-4 h-4 text-emerald-400" /> Demander un retrait
          </h2>
          
          <form onSubmit={handleWithdraw} className="space-y-6">
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Montant (XAF)</label>
              <input 
                type="number" 
                min="5000"
                placeholder="5000"
                value={withdrawAmount}
                onChange={(e) => setWithdrawAmount(Number(e.target.value))}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl py-3 px-4 text-white font-bold focus:outline-none focus:border-emerald-500/50"
                required
              />
            </div>
            
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Moyen de paiement</label>
              <select 
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl py-3 px-4 text-white font-bold focus:outline-none focus:border-emerald-500/50 appearance-none"
                required
              >
                <option value="" disabled>Sélectionner...</option>
                <option value="MTN Mobile Money">MTN Mobile Money</option>
                <option value="Orange Money">Orange Money</option>
                <option value="Carte Bancaire">Carte Bancaire</option>
                <option value="Virement Bancaire">Virement Bancaire</option>
                <option value="Wallet NDARA">Wallet interne NDARA</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Détails (Numéro ou IBAN)</label>
              <input 
                type="text" 
                placeholder="Ex: 6XXXXXXXX ou IBAN"
                value={paymentDetails}
                onChange={(e) => setPaymentDetails(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl py-3 px-4 text-white font-bold focus:outline-none focus:border-emerald-500/50"
                required
              />
            </div>

            <button 
              type="submit"
              disabled={submitting || (wallet?.availableBalance || 0) < 5000}
              className="w-full py-4 bg-emerald-500 hover:bg-emerald-400 text-white font-black rounded-xl transition-colors uppercase tracking-widest flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <CreditCard className="w-5 h-5" />}
              Retirer les fonds
            </button>

            {(wallet?.availableBalance || 0) < 5000 && (
              <p className="text-[10px] text-amber-500 font-bold flex items-center gap-1 justify-center mt-2">
                <AlertCircle className="w-3 h-3" /> Minimum 5 000 XAF
              </p>
            )}
          </form>
        </div>

        {/* TRANSACTIONS */}
        <div className="bg-[#111827] border border-[#1E293B] rounded-3xl overflow-hidden lg:col-span-2 flex flex-col">
          <div className="p-6 border-b border-slate-800 flex flex-col md:flex-row gap-4 justify-between md:items-center">
            <h2 className="text-sm font-black text-white uppercase tracking-widest flex items-center gap-2">
              <Clock className="w-4 h-4 text-blue-400" /> Historique des Retraits
            </h2>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input 
                type="text" 
                placeholder="Rechercher..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-slate-900 border border-slate-800 rounded-lg py-2 pl-9 pr-4 text-sm text-white focus:outline-none focus:border-emerald-500/50"
              />
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[600px]">
              <thead>
                <tr className="bg-slate-900/50 border-b border-slate-800">
                  <th className="p-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Date / Ref</th>
                  <th className="p-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Méthode</th>
                  <th className="p-4 text-[10px] font-black text-slate-500 uppercase tracking-widest text-right">Montant</th>
                  <th className="p-4 text-[10px] font-black text-slate-500 uppercase tracking-widest text-center">Statut</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={4} className="p-12 text-center">
                      <Loader2 className="w-8 h-8 animate-spin text-emerald-500 mx-auto" />
                    </td>
                  </tr>
                ) : filteredWithdrawals.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="p-12 text-center text-slate-500">
                      Aucune demande de retrait.
                    </td>
                  </tr>
                ) : (
                  filteredWithdrawals.map((w) => (
                    <tr key={w.id} className="border-b border-slate-800/50 hover:bg-slate-800/30 transition-colors">
                      <td className="p-4">
                        <p className="font-bold text-sm text-slate-300">
                          {w.createdAt?.toDate ? format(w.createdAt.toDate(), 'dd/MM/yyyy HH:mm', { locale: fr }) : '-'}
                        </p>
                        <p className="text-[10px] text-slate-500 font-mono">Ref: {w.reference}</p>
                      </td>
                      <td className="p-4">
                        <p className="font-bold text-sm text-white">{w.paymentMethod}</p>
                        <p className="text-[10px] text-slate-500">{w.paymentAccount}</p>
                      </td>
                      <td className="p-4 text-right">
                        <span className="text-sm font-black text-emerald-400">
                          {w.amount?.toLocaleString()} XAF
                        </span>
                      </td>
                      <td className="p-4 text-center">
                        {getStatusBadge(w.status)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
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

fs.writeFileSync('src/views/ambassador/AmbassadorWallet.tsx', code);
