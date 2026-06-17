import React, { useState, useEffect } from 'react';
import { 
  Landmark, 
  Search, 
  Download, 
  ShieldCheck, 
  Activity, 
  Clock, 
  AlertCircle, 
  ArrowRightLeft,
  Banknote,
  CheckCircle2,
  XCircle,
  FileText,
  Loader2
} from 'lucide-react';
import clsx from 'clsx';
import { collection, query, orderBy, onSnapshot, doc, runTransaction, updateDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import { EmptyState, NdaraSkeleton } from './AdminSupport';

export function AdminTransactions() {
  const [activeTab, setActiveTab] = useState<'payments' | 'payouts' | 'ledger'>('payments');
  const [searchTerm, setSearchTerm] = useState('');
  
  const [payments, setPayments] = useState<any[]>([]);
  const [payouts, setPayouts] = useState<any[]>([]);
  const [ledger, setLedger] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Pour éviter le spam de clics
  const [isProcessing, setIsProcessing] = useState<string | null>(null);

  useEffect(() => {
    setIsLoading(true);

    const qPayments = query(collection(db, 'payments'), orderBy('createdAt', 'desc'));
    const unsubPayments = onSnapshot(qPayments, (snap) => {
      const data: any[] = [];
      snap.forEach(doc => data.push({ id: doc.id, ...doc.data() }));
      setPayments(data);
    }, (err) => console.error("Erreur sync payments:", err));

    const qPayouts = query(collection(db, 'payouts'), orderBy('createdAt', 'desc'));
    const unsubPayouts = onSnapshot(qPayouts, (snap) => {
      const data: any[] = [];
      snap.forEach(doc => data.push({ id: doc.id, ...doc.data() }));
      setPayouts(data);
    }, (err) => console.error("Erreur sync payouts:", err));

    const qLedger = query(collection(db, 'transactions'), orderBy('createdAt', 'desc'));
    const unsubLedger = onSnapshot(qLedger, (snap) => {
      const data: any[] = [];
      snap.forEach(doc => data.push({ id: doc.id, ...doc.data() }));
      setLedger(data);
    }, (err) => console.error("Erreur sync ledger:", err));

    const timer = setTimeout(() => setIsLoading(false), 800);

    return () => {
      unsubPayments();
      unsubPayouts();
      unsubLedger();
      clearTimeout(timer);
    };
  }, []);

  // 1. Validation de Reçu Mobile Money (Paiement)
  const handleValidatePayment = async (payment: any) => {
    if (!window.confirm("Valider ce reçu et débloquer l'accès pour cet étudiant ?")) return;
    setIsProcessing(payment.id);
    try {
      await runTransaction(db, async (t) => {
        const paymentRef = doc(db, 'payments', payment.id);
        const userRef = doc(db, 'users', payment.userId);
        const txRef = doc(collection(db, 'transactions'));
        
        const pDoc = await t.get(paymentRef);
        if (!pDoc.exists() || pDoc.data().status !== 'pending') {
          throw new Error("Paiement introuvable ou déjà traité.");
        }
        
        const uDoc = await t.get(userRef);
        if (!uDoc.exists()) {
          throw new Error("Utilisateur introuvable.");
        }

        // Marquer comme payé
        t.update(paymentRef, { status: 'completed', updatedAt: new Date() });
        
        // Débloquer l'accès (Premium ou Cours spécifique)
        const userData = uDoc.data();
        const currentCourses = userData.enrolledCourses || [];
        if (payment.courseId && !currentCourses.includes(payment.courseId)) {
          t.update(userRef, { 
            enrolledCourses: [...currentCourses, payment.courseId],
            isPremium: true 
          });
        } else {
          t.update(userRef, { isPremium: true });
        }

        // Trace comptable immuable
        t.set(txRef, {
          type: 'PAYMENT_RECEIPT_VALIDATED',
          paymentId: payment.id,
          userId: payment.userId,
          amount: payment.amount || 0,
          currency: payment.currency || 'XAF',
          status: 'completed',
          createdAt: new Date()
        });
      });
    } catch(err: any) {
      console.error("Erreur validation paiement:", err);
      alert("Erreur: " + err.message);
    } finally {
      setIsProcessing(null);
    }
  };

  const handleRejectPayment = async (paymentId: string) => {
    if (!window.confirm("Rejeter ce paiement/reçu ?")) return;
    setIsProcessing(paymentId);
    try {
      await updateDoc(doc(db, 'payments', paymentId), { 
        status: 'failed', 
        updatedAt: new Date() 
      });
    } catch (err) {
      console.error(err);
    } finally {
      setIsProcessing(null);
    }
  };

  // 2. Validation de Retrait (Payout Formateur)
  const handleValidatePayout = async (payout: any) => {
    if (!window.confirm(`Approuver ce retrait de ${payout.amount} XAF et déduire les fonds ?`)) return;
    setIsProcessing(payout.id);
    try {
      await runTransaction(db, async (t) => {
        const payoutRef = doc(db, 'payouts', payout.id);
        const instructorId = payout.instructorId || payout.userId;
        const userRef = doc(db, 'users', instructorId);
        const txRef = doc(collection(db, 'transactions'));
        
        const pDoc = await t.get(payoutRef);
        if (!pDoc.exists() || pDoc.data().status !== 'pending') {
          throw new Error("Demande de retrait introuvable ou déjà traitée.");
        }
        
        const uDoc = await t.get(userRef);
        if (!uDoc.exists()) {
          throw new Error("Formateur introuvable.");
        }
        
        const pData = pDoc.data();
        const amount = pData.amount || 0;
        const currentBalance = uDoc.data().walletBalance || 0;
        
        if (currentBalance < amount) {
           throw new Error("Fonds insuffisants dans le portefeuille du formateur.");
        }

        // Marquer le retrait comme payé
        t.update(payoutRef, { status: 'paid', updatedAt: new Date() });
        
        // Déduire du portefeuille
        t.update(userRef, { walletBalance: currentBalance - amount });

        // Trace comptable immuable
        t.set(txRef, {
          type: 'INSTRUCTOR_PAYOUT_APPROVED',
          payoutId: payout.id,
          userId: instructorId,
          amount: -amount, // Flux sortant
          currency: pData.currency || 'XAF',
          status: 'completed',
          createdAt: new Date()
        });
      });
    } catch(err: any) {
      console.error("Erreur validation retrait:", err);
      alert("Erreur d'arbitrage: " + err.message);
    } finally {
      setIsProcessing(null);
    }
  };

  const handleRejectPayout = async (payoutId: string) => {
    if (!window.confirm("Rejeter cette demande de retrait ? Le solde du formateur restera intact.")) return;
    setIsProcessing(payoutId);
    try {
      await updateDoc(doc(db, 'payouts', payoutId), { 
        status: 'rejected', 
        updatedAt: new Date() 
      });
    } catch (err) {
      console.error(err);
    } finally {
      setIsProcessing(null);
    }
  };

  // Calcul des KPIs
  const totalRevenue = payments.reduce((acc, p) => ['completed', 'succeeded', 'paid'].includes(p.status?.toLowerCase()) ? acc + (Number(p.amount) || 0) : acc, 0);
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayRevenue = payments.reduce((acc, p) => {
    if (['completed', 'succeeded', 'paid'].includes(p.status?.toLowerCase())) {
      const pDate = p.createdAt?.toDate ? p.createdAt.toDate() : new Date(p.createdAt || 0);
      return pDate >= today ? acc + (Number(p.amount) || 0) : acc;
    }
    return acc;
  }, 0);

  const pendingPayoutsCount = payouts.filter(p => p.status?.toLowerCase() === 'pending').length;
  const pendingPaymentsCount = payments.filter(p => p.status?.toLowerCase() === 'pending').length;

  // Filtrage Rapide
  const filterByTerm = (items: any[]) => items.filter(item => {
    const t = searchTerm.toLowerCase();
    return item.id.toLowerCase().includes(t) || 
           (item.studentName?.toLowerCase().includes(t)) || 
           (item.instructorName?.toLowerCase().includes(t)) ||
           (item.userId?.toLowerCase().includes(t));
  });

  const filteredPayments = filterByTerm(payments);
  const filteredPayouts = filterByTerm(payouts);
  const filteredLedger = filterByTerm(ledger);

  const formatDate = (ts: any) => {
    if (!ts) return '';
    const date = ts.toDate ? ts.toDate() : new Date(ts);
    return `${date.toLocaleDateString('fr-FR')} à ${date.toLocaleTimeString('fr-FR', {hour: '2-digit', minute:'2-digit'})}`;
  };

  if (isLoading) {
    return (
      <div className="space-y-8 animate-in fade-in duration-700 pb-20 relative font-sans">
        <div className="space-y-2 relative z-10">
          <div className="h-8 w-64 bg-slate-800 rounded-lg animate-pulse"></div>
          <div className="h-4 w-96 bg-slate-800/80 rounded animate-pulse"></div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 relative z-10">
          {[...Array(4)].map((_, i) => (
             <div key={i} className="bg-slate-800/40 border border-slate-700/50 rounded-2xl p-5 h-32 animate-pulse"></div>
          ))}
        </div>
        <NdaraSkeleton type="table" />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-700 pb-20 relative font-sans">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[400px] bg-emerald-500/5 blur-[100px] pointer-events-none" />

      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-5 relative z-10">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-emerald-500 mb-1">
            <Landmark className="h-4 w-4" />
            <span className="text-[10px] font-black uppercase tracking-[0.3em]">Trésorerie & Audit</span>
          </div>
          <h1 className="text-3xl font-black text-white uppercase tracking-tight">Flux Financiers</h1>
          <p className="text-slate-400 text-sm font-medium">Validation atomique des reçus et registre comptable global.</p>
        </div>

        <button className="flex items-center justify-center gap-2 h-12 px-6 rounded-2xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white font-bold uppercase text-[10px] tracking-widest transition-all shadow-xl shadow-slate-900/50 w-full sm:w-auto">
          <Download className="h-4 w-4" /> Imprimer le Registre
        </button>
      </header>

      {/* FinTech KPIs */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 relative z-10">
        <div className="bg-slate-800/40 border border-slate-700/50 rounded-2xl p-5 flex flex-col justify-between relative overflow-hidden">
          <div className="flex justify-between items-start mb-4">
            <span className="text-slate-400 font-bold uppercase text-[10px] tracking-widest z-10">Volume Historique</span>
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

        <div className="bg-slate-800/40 border border-slate-700/50 rounded-2xl p-5 flex flex-col justify-between relative overflow-hidden">
          <div className="flex justify-between items-start mb-4">
            <span className="text-slate-400 font-bold uppercase text-[10px] tracking-widest z-10">Recettes du Jour</span>
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

        <div className="bg-slate-800/40 border border-slate-700/50 rounded-2xl p-5 flex flex-col justify-between relative overflow-hidden">
          <div className="flex justify-between items-start mb-4">
            <span className="text-slate-400 font-bold uppercase text-[10px] tracking-widest z-10">Paiements en attente</span>
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center z-10">
              <Clock className="w-4 h-4 text-amber-500" />
            </div>
          </div>
          <div className="z-10">
            <h3 className="text-2xl font-black text-white">{pendingPaymentsCount}</h3>
            <div className="flex items-center gap-1.5 mt-2 text-[10px] font-bold text-amber-400 bg-amber-500/10 w-fit px-2 py-0.5 rounded border border-amber-500/20">
              <Clock className="w-3 h-3" /> MOBILE MONEY / REÇUS
            </div>
          </div>
        </div>

        <div className="bg-slate-800/40 border border-slate-700/50 rounded-2xl p-5 flex flex-col justify-between relative overflow-hidden">
          <div className="flex justify-between items-start mb-4">
            <span className="text-slate-400 font-bold uppercase text-[10px] tracking-widest z-10">Retraits (Formateurs)</span>
            <div className="w-8 h-8 rounded-lg bg-red-500/10 flex items-center justify-center z-10">
              <Banknote className="w-4 h-4 text-red-500" />
            </div>
          </div>
          <div className="z-10">
            <h3 className="text-2xl font-black text-white">{pendingPayoutsCount}</h3>
            <div className="flex items-center gap-1.5 mt-2 text-[10px] font-bold text-red-400 bg-red-500/10 w-fit px-2 py-0.5 rounded border border-red-500/20">
              <AlertCircle className="w-3 h-3" /> EN ATTENTE D'ARBITRAGE
            </div>
          </div>
        </div>
      </section>

      {/* Navigation Tabs */}
      <div className="w-full relative z-10 flex flex-col gap-6">
        <div className="flex flex-col sm:flex-row justify-between gap-4">
          <div className="flex overflow-x-auto hide-scrollbar bg-slate-900/50 border border-slate-800 p-1.5 rounded-2xl w-full lg:w-fit shadow-2xl">
              <button 
                onClick={() => setActiveTab('payments')}
                className={clsx(
                  "flex items-center justify-center gap-2 px-6 py-3 font-bold uppercase text-[10px] tracking-widest rounded-xl transition-all whitespace-nowrap",
                  activeTab === 'payments' ? "bg-slate-800 text-white shadow-sm border border-slate-700/50" : "text-slate-500 hover:text-slate-300 hover:bg-slate-800/30"
                )}
              >
                  <ArrowRightLeft className="h-4 w-4" /> Paiements Entrants ({payments.length})
                  {pendingPaymentsCount > 0 && <span className="bg-amber-500 text-amber-950 px-1.5 rounded-full text-[8px] animate-pulse">{pendingPaymentsCount}</span>}
              </button>
              <button 
                onClick={() => setActiveTab('payouts')}
                className={clsx(
                  "flex items-center justify-center gap-2 px-6 py-3 font-bold uppercase text-[10px] tracking-widest rounded-xl transition-all whitespace-nowrap",
                  activeTab === 'payouts' ? "bg-slate-800 text-amber-400 shadow-sm border border-slate-700/50" : "text-amber-500/50 hover:text-amber-400/80 hover:bg-slate-800/30"
                )}
              >
                  <Banknote className="h-4 w-4" /> Retraits ({payouts.length})
                  {pendingPayoutsCount > 0 && <span className="bg-red-500 text-white px-1.5 rounded-full text-[8px] animate-pulse">{pendingPayoutsCount}</span>}
              </button>
              <button 
                onClick={() => setActiveTab('ledger')}
                className={clsx(
                  "flex items-center justify-center gap-2 px-6 py-3 font-bold uppercase text-[10px] tracking-widest rounded-xl transition-all whitespace-nowrap",
                  activeTab === 'ledger' ? "bg-slate-800 text-emerald-400 shadow-sm border border-slate-700/50" : "text-emerald-500/50 hover:text-emerald-400/80 hover:bg-slate-800/30"
                )}
              >
                  <ShieldCheck className="h-4 w-4" /> Registre Comptable ({ledger.length})
              </button>
          </div>

          <div className="relative flex-1 sm:max-w-xs">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input 
              type="text" 
              placeholder="Rechercher par ID ou nom..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full h-full min-h-[48px] bg-slate-900/80 border border-slate-700/50 rounded-2xl py-3 pl-11 pr-4 text-white text-sm font-medium focus:outline-none focus:border-emerald-500/50 transition-colors placeholder:text-slate-600"
            />
          </div>
        </div>

        {/* --- ONGLET PAIEMENTS --- */}
        {activeTab === 'payments' && (
          <div className="animate-in fade-in">
            {filteredPayments.length > 0 ? (
              <div className="bg-slate-800/30 border border-slate-700/50 rounded-3xl overflow-hidden shadow-2xl relative">
                <div className="overflow-x-auto hide-scrollbar">
                  <table className="w-full text-left border-collapse min-w-[900px]">
                    <thead>
                      <tr className="border-b border-slate-800 bg-slate-900/50">
                        <th className="p-4 pl-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Transaction & Cours</th>
                        <th className="p-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Étudiant</th>
                        <th className="p-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Montant</th>
                        <th className="p-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Preuve</th>
                        <th className="p-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Statut</th>
                        <th className="p-4 pr-6 text-right text-[10px] font-black uppercase tracking-widest text-slate-400">Arbitrage</th>
                      </tr>
                    </thead>
                    <tbody className="text-sm divide-y divide-slate-800">
                      {filteredPayments.map((p) => {
                        const isSuccess = ['completed', 'paid', 'succeeded'].includes(p.status?.toLowerCase());
                        const isFailed = ['failed', 'error', 'rejected'].includes(p.status?.toLowerCase());
                        const isPending = p.status?.toLowerCase() === 'pending';
                        const processing = isProcessing === p.id;

                        return (
                        <tr key={p.id} className="hover:bg-slate-800/20 transition-colors group">
                          <td className="p-4 pl-6">
                            <div className="flex flex-col">
                              <span className="font-bold text-sm text-white max-w-[200px] truncate">{p.courseTitle || 'Achat Générique'}</span>
                              <span className="text-[10px] font-mono text-slate-500 mt-1">ID: {p.id.substring(0, 10)}</span>
                            </div>
                          </td>
                          <td className="p-4">
                             <div className="flex flex-col">
                               <span className="text-xs font-bold text-slate-200">{p.studentName || 'Anonyme'}</span>
                               <span className="text-[10px] text-slate-500 pt-0.5">{p.studentEmail || p.userId?.substring(0, 8)}</span>
                             </div>
                          </td>
                          <td className="p-4">
                             <span className={clsx("font-black", isSuccess ? "text-emerald-500" : "text-white")}>
                               {(p.amount || 0).toLocaleString('fr-FR')} <span className="text-[10px] opacity-50">{p.currency || 'XAF'}</span>
                             </span>
                             <div className="text-[9px] font-black uppercase tracking-widest text-slate-500 mt-1">
                               {p.paymentMethod || 'MOBILE_MONEY'}
                             </div>
                          </td>
                          <td className="p-4">
                             {p.receiptUrl ? (
                                <a href={p.receiptUrl} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 text-[9px] font-bold text-blue-400 bg-blue-500/10 px-2 py-1 rounded border border-blue-500/20 w-fit hover:bg-blue-500 hover:text-white transition-colors">
                                  <FileText className="w-3 h-3" /> Voir Reçu
                                </a>
                             ) : (
                                <span className="text-[9px] text-slate-600 font-bold uppercase tracking-widest">Aucun</span>
                             )}
                          </td>
                          <td className="p-4">
                             {isFailed ? (
                               <span className="inline-flex text-[9px] font-black uppercase px-2 py-1 rounded bg-red-500/10 text-red-500 border border-red-500/20">Rejeté</span>
                             ) : isSuccess ? (
                               <span className="inline-flex text-[9px] font-black uppercase px-2 py-1 rounded bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">Complété</span>
                             ) : (
                               <span className="inline-flex text-[9px] font-black uppercase px-2 py-1 rounded bg-amber-500/10 text-amber-500 border border-amber-500/20 animate-pulse">En attente</span>
                             )}
                          </td>
                          <td className="p-4 pr-6 text-right">
                             {isPending ? (
                               <div className="flex justify-end gap-2">
                                 <button 
                                   onClick={() => handleValidatePayment(p)}
                                   disabled={processing}
                                   className="flex items-center gap-1.5 h-8 px-3 rounded-lg bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 font-black uppercase tracking-widest text-[9px] hover:bg-emerald-500 hover:text-slate-950 transition-all disabled:opacity-50"
                                 >
                                   {processing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5" />} Valider
                                 </button>
                                 <button 
                                   onClick={() => handleRejectPayment(p.id)}
                                   disabled={processing}
                                   className="flex items-center gap-1.5 h-8 px-3 rounded-lg bg-red-500/10 text-red-500 border border-red-500/20 font-black uppercase tracking-widest text-[9px] hover:bg-red-500 hover:text-white transition-all disabled:opacity-50"
                                 >
                                   {processing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <XCircle className="w-3.5 h-3.5" />} Rejeter
                                 </button>
                               </div>
                             ) : (
                               <span className="text-[10px] font-bold text-slate-500">{formatDate(p.createdAt)}</span>
                             )}
                          </td>
                        </tr>
                      )})}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <EmptyState title="Aucun paiement" message="Aucune transaction n'a été trouvée pour cette recherche." icon={ArrowRightLeft} />
            )}
          </div>
        )}

        {/* --- ONGLET PAYOUTS --- */}
        {activeTab === 'payouts' && (
           <div className="animate-in fade-in">
            {filteredPayouts.length > 0 ? (
              <div className="bg-slate-800/30 border border-slate-700/50 rounded-3xl overflow-hidden shadow-2xl relative">
                <div className="overflow-x-auto hide-scrollbar">
                  <table className="w-full text-left border-collapse min-w-[900px]">
                    <thead>
                      <tr className="border-b border-slate-800 bg-slate-900/50">
                        <th className="p-4 pl-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Demande</th>
                        <th className="p-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Formateur / Compte</th>
                        <th className="p-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Montant à Déduire</th>
                        <th className="p-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Statut</th>
                        <th className="p-4 pr-6 text-right text-[10px] font-black uppercase tracking-widest text-slate-400">Arbitrage (Atomique)</th>
                      </tr>
                    </thead>
                    <tbody className="text-sm divide-y divide-slate-800">
                      {filteredPayouts.map((p) => {
                         const isPending = p.status?.toLowerCase() === 'pending';
                         const isPaid = p.status?.toLowerCase() === 'paid' || p.status?.toLowerCase() === 'completed';
                         const processing = isProcessing === p.id;
                         return (
                        <tr key={p.id} className="hover:bg-slate-800/20 transition-colors group">
                          <td className="p-4 pl-6">
                             <span className="font-mono text-[10px] text-amber-400 bg-amber-500/10 px-2 py-1 rounded border border-amber-500/20">PAYOUT-{p.id.substring(0, 6).toUpperCase()}</span>
                             <div className="text-[9px] text-slate-500 mt-2">{formatDate(p.createdAt)}</div>
                          </td>
                          <td className="p-4">
                             <div className="flex flex-col">
                               <span className="text-xs font-bold text-white max-w-[200px] truncate">{p.instructorName || 'Instructeur Ndara'}</span>
                               <span className="text-[10px] font-mono text-slate-500 mt-0.5">{p.instructorEmail || p.instructorId || p.userId}</span>
                               {p.withdrawalMethod && (
                                   <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 mt-1">{p.withdrawalMethod} - {p.withdrawalAccount}</span>
                               )}
                             </div>
                          </td>
                          <td className="p-4">
                             <span className="font-black text-white">{(p.amount || 0).toLocaleString('fr-FR')} <span className="text-[10px] opacity-40">{p.currency || 'XAF'}</span></span>
                          </td>
                          <td className="p-4">
                              {isPaid ? (
                                <span className="inline-flex text-[9px] font-black uppercase px-2 py-1 rounded bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">Virement OK</span>
                              ) : p.status?.toLowerCase() === 'rejected' ? (
                                 <span className="inline-flex text-[9px] font-black uppercase px-2 py-1 rounded bg-red-500/10 text-red-500 border border-red-500/20">Rejeté</span>
                              ) : (
                                 <span className="inline-flex text-[9px] font-black uppercase px-2 py-1 rounded bg-amber-500/10 text-amber-500 border border-amber-500/20 animate-pulse">En attente</span>
                              )}
                          </td>
                          <td className="p-4 pr-6 text-right">
                             {isPending ? (
                               <div className="flex justify-end gap-2">
                                 <button 
                                   onClick={() => handleValidatePayout(p)} 
                                   disabled={processing}
                                   className="flex items-center gap-1.5 h-8 px-3 rounded-lg bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 font-black uppercase tracking-widest text-[9px] hover:bg-emerald-500 hover:text-slate-950 transition-colors disabled:opacity-50"
                                 >
                                   {processing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5" />} Valider & Déduire
                                 </button>
                                 <button 
                                   onClick={() => handleRejectPayout(p.id)} 
                                   disabled={processing}
                                   className="flex items-center gap-1.5 h-8 px-3 rounded-lg bg-red-500/10 text-red-500 border border-red-500/20 font-black uppercase tracking-widest text-[9px] hover:bg-red-500 hover:text-white transition-colors disabled:opacity-50"
                                 >
                                   {processing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <XCircle className="w-3.5 h-3.5" />} Rejeter
                                 </button>
                               </div>
                             ) : (
                                <span className="text-[10px] font-bold text-slate-500">Traité le {formatDate(p.updatedAt || p.createdAt)}</span>
                             )}
                          </td>
                        </tr>
                      )})}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <EmptyState title="Aucun retrait" message="Aucune demande de retrait en attente ou finalisée." icon={Banknote} />
            )}
          </div>
        )}

        {/* --- ONGLET REGISTRE COMPTABLE --- */}
        {activeTab === 'ledger' && (
           <div className="animate-in fade-in">
            {filteredLedger.length > 0 ? (
              <div className="bg-slate-800/30 border border-slate-700/50 rounded-3xl overflow-hidden shadow-2xl relative">
                <div className="overflow-x-auto hide-scrollbar">
                  <table className="w-full text-left border-collapse min-w-[900px]">
                    <thead>
                      <tr className="border-b border-slate-800 bg-slate-900/50">
                        <th className="p-4 pl-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Trace Systémique</th>
                        <th className="p-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Type de Flux</th>
                        <th className="p-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Acteur(s) Lié(s)</th>
                        <th className="p-4 text-right text-[10px] font-black uppercase tracking-widest text-slate-400">Montant (XAF)</th>
                        <th className="p-4 pr-6 text-right text-[10px] font-black uppercase tracking-widest text-slate-400">Statut Immuable</th>
                      </tr>
                    </thead>
                    <tbody className="text-sm divide-y divide-slate-800">
                      {filteredLedger.map((t) => {
                         const isNegative = t.amount < 0 || t.type?.includes('PAYOUT');
                         return (
                        <tr key={t.id} className="hover:bg-slate-800/20 transition-colors group">
                          <td className="p-4 pl-6">
                             <span className="font-mono text-[10px] text-slate-300">LDG-{t.id.substring(0, 10).toUpperCase()}</span>
                             <div className="text-[9px] text-slate-500 mt-1">{formatDate(t.createdAt)}</div>
                          </td>
                          <td className="p-4">
                             <span className="font-bold text-[9px] uppercase tracking-widest text-blue-400 bg-blue-500/10 px-2 py-1 rounded border border-blue-500/20">{(t.type || 'SYSTEM_TRANSACTION').replace(/_/g, ' ')}</span>
                          </td>
                          <td className="p-4">
                             <div className="flex flex-col">
                               <span className="text-[10px] font-mono text-slate-200">ID: {t.userId?.substring(0, 15)}...</span>
                               {t.paymentId && <span className="text-[10px] font-mono text-slate-500 truncate">Source: {t.paymentId}</span>}
                             </div>
                          </td>
                          <td className="p-4 text-right">
                             <span className={clsx("font-black", isNegative ? "text-red-400" : "text-emerald-500")}>
                               {isNegative ? '' : '+'}{(t.amount || 0).toLocaleString('fr-FR')}
                             </span>
                          </td>
                          <td className="p-4 pr-6 text-right">
                             <span className="inline-flex text-[9px] font-black uppercase border border-slate-700 px-2 py-1 rounded bg-slate-800 text-slate-400">
                               {t.status || 'COMPLETED'}
                             </span>
                          </td>
                        </tr>
                      )})}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <EmptyState title="Le Registre est vide" message="Aucune opération comptable immuable n'a encore été enregistrée." icon={ShieldCheck} />
            )}
          </div>
        )}
      </div>
    </div>
  );
}
