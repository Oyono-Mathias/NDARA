import React, { useState, useEffect } from 'react';
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
  const [transactions, setTransactions] = useState<any[]>([]);
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

  useEffect(() => {
    if (!firebaseUser) return;

    // Load Wallet (using onSnapshot to keep it real-time)
    const unsubWallet = onSnapshot(collection(db, 'wallets'), (snapshot) => {
       const wDoc = snapshot.docs.find(d => d.id === firebaseUser.uid);
       if (wDoc) {
          setWallet(wDoc.data());
       }
    });

    loadTransactions();
    fetchIncomeStats();

    return () => unsubWallet();
  }, [firebaseUser]);

  const fetchIncomeStats = async () => {
    try {
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const startOfYear = new Date(now.getFullYear(), 0, 1);
      
      const monthQ = query(collection(db, 'wallet_logs'), 
        where('ambassadorUid', '==', firebaseUser?.uid),
        where('type', '==', 'commission'),
        where('createdAt', '>=', startOfMonth)
      );
      const yearQ = query(collection(db, 'wallet_logs'), 
        where('ambassadorUid', '==', firebaseUser?.uid),
        where('type', '==', 'commission'),
        where('createdAt', '>=', startOfYear)
      );

      let mIncome = 0;
      let yIncome = 0;

      const mSnap = await getDocs(monthQ);
      mSnap.forEach(d => mIncome += (d.data().amount || 0));
      
      const ySnap = await getDocs(yearQ);
      ySnap.forEach(d => yIncome += (d.data().amount || 0));

      setStats({
        monthIncome: mIncome,
        yearIncome: yIncome
      });
    } catch(e) {
      console.error(e);
    }
  };

  const loadTransactions = async () => {
    setLoading(true);
    try {
      // Need wallet_logs index for orderBy createdAt. Let's do a simple query and sort locally if needed.
      const q = query(
        collection(db, 'wallet_logs'),
        where('ambassadorUid', '==', firebaseUser?.uid),
        orderBy('createdAt', 'desc'),
        limit(50)
      );
      
      const snap = await getDocs(q);
      const docs = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      setTransactions(docs);
    } catch(e: any) {
      console.error(e);
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
      const res = await fetch('/api/wallet/ambassador-withdraw', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${await firebaseUser?.getIdToken()}`
        },
        body: JSON.stringify({
          amount: Number(withdrawAmount),
          paymentMethod,
          paymentDetails
        })
      });

      const data = await res.json();
      if (!data.success) throw new Error(data.error);

      toast({ title: "Demande envoyée", description: "Votre demande de retrait est en attente de validation." });
      setWithdrawAmount('');
      setPaymentDetails('');
      loadTransactions(); // refresh history
    } catch(e: any) {
      toast({ title: "Erreur", description: e.message, variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  const handleExport = () => {
    setExporting(true);
    try {
      const csvData = transactions.map(d => {
        return {
          'Date': d.createdAt?.toDate ? format(d.createdAt.toDate(), 'dd/MM/yyyy HH:mm') : '',
          'Type': d.type,
          'Description': d.description,
          'Montant (XAF)': d.amount,
          'Statut': d.status,
          'Référence': d.reference
        };
      });

      setExportData(csvData);
      setTimeout(() => {
        document.getElementById('csv-wallet-btn')?.click();
        toast({ title: "Export réussi", description: "Le fichier CSV a été généré." });
      }, 500);
    } catch(e) {
      toast({ title: "Erreur", description: "Impossible d'exporter", variant: "destructive" });
    } finally {
      setExporting(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'completed': return <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-400 rounded-full text-[10px] font-bold uppercase">Terminé</span>;
      case 'pending': return <span className="px-2 py-0.5 bg-amber-500/20 text-amber-400 rounded-full text-[10px] font-bold uppercase">En attente</span>;
      case 'rejected': return <span className="px-2 py-0.5 bg-rose-500/20 text-rose-400 rounded-full text-[10px] font-bold uppercase">Rejeté</span>;
      default: return <span className="px-2 py-0.5 bg-slate-800 text-slate-400 rounded-full text-[10px] font-bold uppercase">{status}</span>;
    }
  };

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-8 pb-32">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-white uppercase tracking-tight flex items-center gap-3">
            <Wallet className="text-emerald-500 w-8 h-8" />
            Mon Portefeuille
          </h1>
          <p className="text-slate-400">Gérez vos revenus et demandez vos retraits.</p>
        </div>
        
        <div className="flex items-center gap-3">
          <button 
            onClick={handleExport}
            disabled={exporting || transactions.length === 0}
            className="px-4 py-3 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl transition-colors flex items-center gap-2 text-sm disabled:opacity-50"
          >
            {exporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
            EXPORTER
          </button>
          <CSVLink 
            data={exportData} 
            filename={`ndara_wallet_${format(new Date(), 'yyyyMMdd')}.csv`}
            id="csv-wallet-btn"
            className="hidden"
          />
        </div>
      </div>

      {/* STATS */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
        <StatCard title="Solde Disponible" value={`${(wallet?.availableBalance || 0).toLocaleString()} XAF`} icon={<Banknote className="w-5 h-5 text-emerald-400" />} />
        <StatCard title="Solde En Attente" value={`${(wallet?.pendingBalance || 0).toLocaleString()} XAF`} icon={<Clock className="w-5 h-5 text-amber-400" />} />
        <StatCard title="Total Gagné" value={`${(wallet?.totalEarned || 0).toLocaleString()} XAF`} icon={<Wallet className="w-5 h-5 text-blue-400" />} />
        <StatCard title="Total Retiré" value={`${(wallet?.totalWithdrawn || 0).toLocaleString()} XAF`} icon={<ArrowDownRight className="w-5 h-5 text-purple-400" />} />
        <StatCard title="Retraits En Attente" value={`${(wallet?.totalPendingWithdrawals || 0).toLocaleString()} XAF`} icon={<Clock className="w-5 h-5 text-amber-400" />} />
        <StatCard title="Revenus Mois" value={`${stats.monthIncome?.toLocaleString()} XAF`} icon={<Banknote className="w-5 h-5 text-emerald-400" />} />
        <StatCard title="Revenus Année" value={`${stats.yearIncome?.toLocaleString()} XAF`} icon={<Banknote className="w-5 h-5 text-emerald-400" />} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* WITHDRAW FORM */}
        <div className="bg-[#111827] border border-[#1E293B] rounded-3xl p-6 lg:col-span-1">
          <h2 className="text-sm font-black text-white uppercase tracking-widest mb-6 flex items-center gap-2">
            <ArrowDownRight className="w-4 h-4 text-emerald-400" /> Demande de Retrait
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
                <option value="mobile_money">Mobile Money (MTN, Orange)</option>
                <option value="bank_transfer">Virement Bancaire</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Détails (Numéro ou IBAN)</label>
              <input 
                type="text" 
                placeholder="Ex: 6XXXXXXXX"
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
          <div className="p-6 border-b border-slate-800">
            <h2 className="text-sm font-black text-white uppercase tracking-widest flex items-center gap-2">
              <Clock className="w-4 h-4 text-blue-400" /> Historique Financier
            </h2>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[600px]">
              <thead>
                <tr className="bg-slate-900/50 border-b border-slate-800">
                  <th className="p-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Date</th>
                  <th className="p-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Description</th>
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
                ) : transactions.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="p-12 text-center text-slate-500">
                      Aucune transaction.
                    </td>
                  </tr>
                ) : (
                  transactions.map((tx) => (
                    <tr key={tx.id} className="border-b border-slate-800/50 hover:bg-slate-800/30 transition-colors">
                      <td className="p-4 text-sm text-slate-400">
                        {tx.createdAt?.toDate ? format(tx.createdAt.toDate(), 'dd/MM/yyyy HH:mm', { locale: fr }) : '-'}
                      </td>
                      <td className="p-4">
                        <p className="font-bold text-sm text-white">{tx.description}</p>
                        <p className="text-[10px] text-slate-500 font-mono">Ref: {tx.reference?.substring(0,8)}...</p>
                      </td>
                      <td className="p-4 text-right">
                        <span className={clsx("text-sm font-black", tx.amount > 0 ? "text-emerald-400" : "text-amber-400")}>
                          {tx.amount > 0 ? '+' : ''}{tx.amount?.toLocaleString()} XAF
                        </span>
                      </td>
                      <td className="p-4 text-center">
                        {getStatusBadge(tx.status)}
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
