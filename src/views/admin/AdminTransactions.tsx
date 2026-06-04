import React, { useState, useEffect } from 'react';
import { 
  Landmark, 
  Search, 
  Download, 
  ShieldCheck, 
  Activity, 
  Clock, 
  AlertCircle, 
  ChevronDown,
  ArrowRightLeft,
  CheckCircle,
  XCircle,
  Banknote,
  Loader2
} from 'lucide-react';
import clsx from 'clsx';
import { collection, query, orderBy, onSnapshot, doc, updateDoc } from 'firebase/firestore';
import { db } from '../../firebase';

export function AdminTransactions() {
  const [activeTab, setActiveTab] = useState('transactions');
  const [searchTerm, setSearchTerm] = useState('');
  
  const [payments, setPayments] = useState<any[]>([]);
  const [payouts, setPayouts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Fetch Payments
    const qPayments = query(collection(db, 'payments'), orderBy('createdAt', 'desc'));
    const unsubPayments = onSnapshot(qPayments, (snap) => {
      const data: any[] = [];
      snap.forEach(doc => data.push({ id: doc.id, ...doc.data() }));
      setPayments(data);
    }, (err) => console.error(err));

    // Fetch Payouts
    const qPayouts = query(collection(db, 'payouts'), orderBy('createdAt', 'desc'));
    const unsubPayouts = onSnapshot(qPayouts, (snap) => {
      const data: any[] = [];
      snap.forEach(doc => data.push({ id: doc.id, ...doc.data() }));
      setPayouts(data);
    }, (err) => console.error(err));

    // Wait briefly to allow both to load or just handle organically
    const timer = setTimeout(() => setIsLoading(false), 800);

    return () => {
      unsubPayments();
      unsubPayouts();
      clearTimeout(timer);
    };
  }, []);

  const handleUpdatePayout = async (payoutId: string, status: string) => {
    try {
      await updateDoc(doc(db, 'payouts', payoutId), { 
        status,
        updatedAt: new Date()
      });
    } catch (err) {
      console.error("Error updating payout status:", err);
    }
  };

  // Calculate KPIs
  const totalRevenue = payments.reduce((acc, p) => p.status?.toLowerCase() === 'completed' || p.status?.toLowerCase() === 'succeeded' || p.status?.toLowerCase() === 'paid' ? acc + (Number(p.amount) || 0) : acc, 0);
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayRevenue = payments.reduce((acc, p) => {
    if (p.status?.toLowerCase() === 'completed' || p.status?.toLowerCase() === 'succeeded' || p.status?.toLowerCase() === 'paid') {
      const pDate = p.createdAt?.toDate ? p.createdAt.toDate() : new Date(p.createdAt || 0);
      return pDate >= today ? acc + (Number(p.amount) || 0) : acc;
    }
    return acc;
  }, 0);

  const pendingCount = payouts.filter(p => p.status?.toLowerCase() === 'pending').length;
  const failedCount = payouts.filter(p => p.status?.toLowerCase() === 'rejected').length + 
                      payments.filter(p => p.status?.toLowerCase() === 'failed' || p.status?.toLowerCase() === 'error').length;

  const filteredPayments = payments.filter(p => {
    const term = searchTerm.toLowerCase();
    return p.id.toLowerCase().includes(term) || 
           (p.studentName && p.studentName.toLowerCase().includes(term)) ||
           (p.studentEmail && p.studentEmail.toLowerCase().includes(term));
  });

  const filteredPayouts = payouts.filter(p => {
    const term = searchTerm.toLowerCase();
    return p.id.toLowerCase().includes(term) || 
           (p.instructorName && p.instructorName.toLowerCase().includes(term));
  });

  if (isLoading) {
    return (
      <div className="flex h-[80vh] items-center justify-center bg-[#090E17]">
        <Loader2 className="w-12 h-12 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-700 pb-20 relative font-sans">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[400px] bg-blue-500/5 blur-[100px] pointer-events-none" />

      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-5 relative z-10">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-blue-500 mb-1">
            <Landmark className="h-4 w-4" />
            <span className="text-[10px] font-black uppercase tracking-[0.3em]">Audit & Finance</span>
          </div>
          <h1 className="text-3xl font-black text-white uppercase tracking-tight">Trésorerie Global</h1>
          <p className="text-slate-400 text-sm font-medium">Surveillez l'intégralité du pipeline financier Ndara.</p>
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
          <button className="flex items-center justify-center gap-2 h-12 px-6 rounded-2xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white font-bold uppercase text-[10px] tracking-widest transition-all shadow-xl w-full sm:w-auto">
            <Download className="h-4 w-4" /> Exporter CSV
          </button>
        </div>
      </header>

      {/* KPIs Grid */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 relative z-10">
        {/* KPI 1 */}
        <div className="bg-slate-800/40 border border-slate-700/50 rounded-2xl p-5 flex flex-col justify-between relative overflow-hidden">
          <div className="flex justify-between items-start mb-4">
            <span className="text-slate-400 font-bold uppercase text-[10px] tracking-widest z-10">Volume Réel</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center z-10">
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
            </div>
          </div>
          <div className="z-10">
            <h3 className="text-2xl font-black text-white">{totalRevenue.toLocaleString('fr-FR')} <span className="text-sm text-slate-500">XAF</span></h3>
            <div className="flex items-center gap-1.5 mt-2 text-[10px] font-bold text-emerald-400 bg-emerald-500/10 w-fit px-2 py-0.5 rounded border border-emerald-500/20">
              <ArrowRightLeft className="w-3 h-3" /> FIRESTORE SYNC
            </div>
          </div>
        </div>

        {/* KPI 2 */}
        <div className="bg-slate-800/40 border border-slate-700/50 rounded-2xl p-5 flex flex-col justify-between relative overflow-hidden">
          <div className="flex justify-between items-start mb-4">
            <span className="text-slate-400 font-bold uppercase text-[10px] tracking-widest z-10">Ventes du Jour</span>
            <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center z-10">
              <Activity className="w-4 h-4 text-blue-500" />
            </div>
          </div>
          <div className="z-10">
            <h3 className="text-2xl font-black text-white">{todayRevenue.toLocaleString('fr-FR')} <span className="text-sm text-slate-500">XAF</span></h3>
            <div className="flex items-center gap-1.5 mt-2 text-[10px] font-bold text-blue-400 bg-blue-500/10 w-fit px-2 py-0.5 rounded border border-blue-500/20">
              <Activity className="w-3 h-3" /> LIVE
            </div>
          </div>
        </div>

        {/* KPI 3 */}
        <div className="bg-slate-800/40 border border-slate-700/50 rounded-2xl p-5 flex flex-col justify-between relative overflow-hidden">
          <div className="flex justify-between items-start mb-4">
            <span className="text-slate-400 font-bold uppercase text-[10px] tracking-widest z-10">Retraits En Attente</span>
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center z-10">
              <Clock className="w-4 h-4 text-amber-500" />
            </div>
          </div>
          <div className="z-10">
            <h3 className="text-2xl font-black text-white">{pendingCount}</h3>
            <div className="flex items-center gap-1.5 mt-2 text-[10px] font-bold text-amber-400 bg-amber-500/10 w-fit px-2 py-0.5 rounded border border-amber-500/20">
              <Clock className="w-3 h-3" /> PENDING
            </div>
          </div>
        </div>

        {/* KPI 4 */}
        <div className="bg-slate-800/40 border border-slate-700/50 rounded-2xl p-5 flex flex-col justify-between relative overflow-hidden">
          <div className="flex justify-between items-start mb-4">
            <span className="text-slate-400 font-bold uppercase text-[10px] tracking-widest z-10">Échecs / Rejets</span>
            <div className="w-8 h-8 rounded-lg bg-red-500/10 flex items-center justify-center z-10">
              <AlertCircle className="w-4 h-4 text-red-500" />
            </div>
          </div>
          <div className="z-10">
            <h3 className="text-2xl font-black text-white">{failedCount}</h3>
            <div className="flex items-center gap-1.5 mt-2 text-[10px] font-bold text-red-400 bg-red-500/10 w-fit px-2 py-0.5 rounded border border-red-500/20">
              <AlertCircle className="w-3 h-3" /> FAILED
            </div>
          </div>
        </div>
      </section>

      {/* Tabs */}
      <div className="w-full relative z-10 flex flex-col gap-6">
        <div className="flex flex-col sm:flex-row justify-between gap-4">
          <div className="flex overflow-x-auto hide-scrollbar bg-slate-900/50 border border-slate-800 p-1.5 rounded-2xl w-full lg:w-fit shadow-2xl">
              <button 
                onClick={() => setActiveTab('transactions')}
                className={clsx(
                  "flex items-center justify-center gap-2 px-6 py-3 font-bold uppercase text-[10px] tracking-widest rounded-xl transition-all whitespace-nowrap",
                  activeTab === 'transactions' ? "bg-slate-800 text-white shadow-sm" : "text-slate-500 hover:text-slate-300"
                )}
              >
                  <ArrowRightLeft className="h-4 w-4" /> Transactions ({payments.length})
              </button>
              <button 
                onClick={() => setActiveTab('payouts')}
                className={clsx(
                  "flex items-center justify-center gap-2 px-6 py-3 font-bold uppercase text-[10px] tracking-widest rounded-xl transition-all whitespace-nowrap",
                  activeTab === 'payouts' ? "bg-slate-800 text-amber-400 shadow-sm" : "text-amber-500/50 hover:text-amber-400/80"
                )}
              >
                  <Banknote className="h-4 w-4" /> Retraits (Payouts) ({payouts.length})
              </button>
          </div>

          <div className="relative flex-1 sm:max-w-xs">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input 
              type="text" 
              placeholder="Chercher ID ou utilisateur..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full h-full min-h-[48px] bg-slate-900/80 border border-slate-700/50 rounded-2xl py-3 pl-11 pr-4 text-white text-sm font-medium focus:outline-none focus:border-blue-500/50 transition-colors placeholder:text-slate-600"
            />
          </div>
        </div>

        {/* Content Panels */}
        <div>
          {activeTab === 'transactions' && (
            <div className="bg-slate-800/30 border border-slate-700/50 rounded-3xl overflow-hidden shadow-2xl relative">
              <div className="overflow-x-auto hide-scrollbar">
                <table className="w-full text-left border-collapse min-w-[800px]">
                  <thead>
                    <tr className="border-b border-slate-800 bg-slate-900/50">
                      <th className="p-4 pl-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Transaction</th>
                      <th className="p-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Utilisateur</th>
                      <th className="p-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Montant</th>
                      <th className="p-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Moyen</th>
                      <th className="p-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Statut</th>
                      <th className="p-4 pr-6 text-right text-[10px] font-black uppercase tracking-widest text-slate-400">Date</th>
                    </tr>
                  </thead>
                  <tbody className="text-sm divide-y divide-slate-800">
                    {filteredPayments.length > 0 ? filteredPayments.map((p) => {
                      const dateObj = p.createdAt?.toDate ? p.createdAt.toDate() : new Date(p.createdAt || 0);
                      const isSuccess = p.status?.toLowerCase() === 'completed' || p.status?.toLowerCase() === 'succeeded' || p.status?.toLowerCase() === 'paid';
                      const isFailed = p.status?.toLowerCase() === 'failed' || p.status?.toLowerCase() === 'error';
                      return (
                      <tr key={p.id} className="hover:bg-slate-800/20 transition-colors group">
                        <td className="p-4 pl-6">
                          <div className="flex flex-col">
                            <span className="font-bold text-sm text-white uppercase truncate max-w-[200px]">{p.courseTitle || 'Achat Pédagogique'}</span>
                            <div className="flex items-center gap-2 mt-1">
                                <span className="px-2 py-0.5 rounded border border-slate-700 text-[8px] font-black uppercase tracking-widest text-slate-300 bg-slate-800 w-fit">ID: {p.id.substring(0, 8)}</span>
                            </div>
                          </div>
                        </td>
                        <td className="p-4">
                           <div className="flex items-center gap-2">
                              <div className="h-8 w-8 rounded-full bg-slate-800 border border-white/5 flex items-center justify-center">
                                <span className="text-[10px] font-black text-slate-500">{(p.studentName ? p.studentName[0] : '?').toUpperCase()}</span>
                              </div>
                              <div className="flex flex-col">
                                <span className="text-xs font-bold text-slate-300">{p.studentName || 'Anonyme'}</span>
                                <span className="text-[10px] font-mono text-slate-500 truncate max-w-[120px]">{p.studentEmail || p.id}</span>
                              </div>
                          </div>
                        </td>
                        <td className="p-4">
                           <span className="font-black text-white">{(p.amount || 0).toLocaleString('fr-FR')} <span className="text-[10px] opacity-40">{p.currency || 'XAF'}</span></span>
                        </td>
                        <td className="p-4">
                          <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 bg-slate-800 px-2 py-1 rounded">{p.paymentMethod || p.gateway || 'Carte'}</span>
                        </td>
                        <td className="p-4">
                           {isFailed ? (
                             <span className="inline-flex text-[9px] font-black uppercase border-none px-2 py-1 rounded bg-red-500/10 text-red-500">Échec</span>
                           ) : isSuccess ? (
                             <span className="inline-flex text-[9px] font-black uppercase border-none px-2 py-1 rounded bg-emerald-500/10 text-emerald-500">Réussi</span>
                           ) : (
                             <span className="inline-flex text-[9px] font-black uppercase border-none px-2 py-1 rounded bg-amber-500/10 text-amber-500 animate-pulse">{p.status || 'En attente'}</span>
                           )}
                        </td>
                        <td className="p-4 pr-6 text-right">
                           <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">
                               {dateObj.toLocaleDateString()} {dateObj.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                           </span>
                        </td>
                      </tr>
                    )}) : (
                      <tr>
                        <td colSpan={6}>
                          <div className="py-12 flex flex-col items-center justify-center text-center">
                            <ArrowRightLeft className="w-8 h-8 text-slate-600 mb-3" />
                            <p className="text-sm font-bold uppercase tracking-widest text-slate-500">Aucune transaction trouvée.</p>
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'payouts' && (
             <div className="bg-slate-800/30 border border-slate-700/50 rounded-3xl overflow-hidden shadow-2xl relative">
              <div className="overflow-x-auto hide-scrollbar">
                <table className="w-full text-left border-collapse min-w-[800px]">
                  <thead>
                    <tr className="border-b border-slate-800 bg-slate-900/50">
                      <th className="p-4 pl-6 text-[10px] font-black uppercase tracking-widest text-slate-400">ID Demande</th>
                      <th className="p-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Instructeur</th>
                      <th className="p-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Montant</th>
                      <th className="p-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Statut</th>
                      <th className="p-4 pr-6 text-right text-[10px] font-black uppercase tracking-widest text-slate-400">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="text-sm divide-y divide-slate-800">
                    {filteredPayouts.length > 0 ? filteredPayouts.map((p) => {
                       const isPending = p.status?.toLowerCase() === 'pending';
                       const isPaid = p.status?.toLowerCase() === 'paid';
                       return (
                      <tr key={p.id} className="hover:bg-slate-800/20 transition-colors group">
                        <td className="p-4 pl-6">
                           <span className="font-mono text-xs text-white">PAYOUT-{p.id.substring(0, 6).toUpperCase()}</span>
                        </td>
                        <td className="p-4">
                           <div className="flex items-center gap-2">
                              <div className="h-8 w-8 rounded-full bg-slate-800 border border-white/5 flex items-center justify-center">
                                <span className="text-[10px] font-black text-slate-500">{(p.instructorName ? p.instructorName[0] : 'I').toUpperCase()}</span>
                              </div>
                              <div>
                                <p className="text-xs font-bold text-white max-w-[150px] truncate">{p.instructorName || 'Anonyme'}</p>
                                <p className="text-[9px] font-mono text-slate-500 mt-0.5 truncate max-w-[150px]">{p.instructorId || p.userId}</p>
                              </div>
                          </div>
                        </td>
                        <td className="p-4">
                           <span className="font-black text-white">{(p.amount || 0).toLocaleString('fr-FR')} <span className="text-[10px] opacity-40">{p.currency || 'XAF'}</span></span>
                        </td>
                        <td className="p-4">
                            {isPaid ? (
                              <span className="inline-flex text-[9px] font-black uppercase border-none px-2 py-1 rounded bg-emerald-500/10 text-emerald-500">Payé</span>
                            ) : p.status?.toLowerCase() === 'rejected' ? (
                               <span className="inline-flex text-[9px] font-black uppercase border-none px-2 py-1 rounded bg-red-500/10 text-red-500">Rejeté</span>
                            ) : (
                               <span className="inline-flex text-[9px] font-black uppercase border-none px-2 py-1 rounded bg-blue-500/10 text-blue-400">En cours</span>
                            )}
                        </td>
                        <td className="p-4 pr-6 text-right">
                           <div className="flex justify-end gap-2">
                             {isPending && (
                               <>
                                 <button onClick={() => handleUpdatePayout(p.id, 'Paid')} className="h-8 px-3 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold uppercase tracking-widest text-[9px] hover:bg-emerald-500 hover:text-slate-950 transition-colors">
                                   Approuver
                                 </button>
                                 <button onClick={() => handleUpdatePayout(p.id, 'Rejected')} className="h-8 px-3 rounded-lg bg-red-500/10 text-red-400 border border-red-500/20 font-bold uppercase tracking-widest text-[9px] hover:bg-red-500 hover:text-white transition-colors">
                                   Rejeter
                                 </button>
                               </>
                             )}
                           </div>
                        </td>
                      </tr>
                    )}) : (
                      <tr>
                        <td colSpan={5}>
                          <div className="py-12 flex flex-col items-center justify-center text-center">
                            <Banknote className="w-8 h-8 text-slate-600 mb-3" />
                            <p className="text-sm font-bold uppercase tracking-widest text-slate-500">Aucune demande de retrait.</p>
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

