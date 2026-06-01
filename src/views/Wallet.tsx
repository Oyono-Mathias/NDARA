import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useRole } from "../context/RoleContext";
import { db } from "../firebase";
import { 
  doc, 
  onSnapshot, 
  collection, 
  query, 
  orderBy, 
  limit,
  where
} from "firebase/firestore";
import { 
  ChevronLeft, Search, Bell, Eye, EyeOff,
  Send, Download, Plus, Clock, ShoppingCart, TrendingUp, RefreshCw, ChevronRight, X, AlertCircle, CheckCircle2, ShieldCheck, HelpCircle
} from "lucide-react";
import { WalletTransaction } from "../types/wallet";

// Firestore error tracker following the guidelines
enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: any;
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: "unknown-or-unauthorized"
    },
    operationType,
    path
  };
  console.error('Firestore Hardened Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

export function WalletView() {
  const navigate = useNavigate();
  const { currentUser: authUser } = useRole();
  const userId = authUser?.uid;

  // Real-time Database state
  const [walletBalances, setWalletBalances] = useState({
    balance: 0,
    affiliateBalance: 0,
    pendingBalance: 0,
    referredBy: ""
  });
  const [dbTransactions, setDbTransactions] = useState<WalletTransaction[]>([]);
  const [userProfile, setUserProfile] = useState<any>(null);

  // UI States
  const [showBalance, setShowBalance] = useState(true);
  const [filter, setFilter] = useState("all");
  const [activeModal, setActiveModal] = useState<"none" | "send" | "receive" | "recharge" | "sandbox" | "detail">("none");
  const [selectedTx, setSelectedTx] = useState<WalletTransaction | null>(null);
  
  // Forms inputs
  const [amount, setAmount] = useState("");
  const [recipient, setRecipient] = useState("");
  const [transferDesc, setTransferDesc] = useState("Transfert Ndara");
  
  // Recharge Input
  const [rechargeAmount, setRechargeAmount] = useState("");
  
  // Sandbox Simulator State
  const [sandboxInstructorId, setSandboxInstructorId] = useState("inst_mathias");
  const [sandboxCoursePrice, setSandboxCoursePrice] = useState("15000");
  const [sandboxCourseTitle, setSandboxCourseTitle] = useState("Python & IA Pro");
  const [sandboxHasReferrer, setSandboxHasReferrer] = useState(true);
  const [sandboxReferrerId, setSandboxReferrerId] = useState("amb_ndara_afrique");

  // Status banners
  const [uiLoading, setUiLoading] = useState(true);
  const [actionStatus, setActionStatus] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // 1. Initialize user wallet fields & listen to changes
  useEffect(() => {
    if (!userId) return;

    // Call init backend function to bootstrap wallet parameters
    fetch("/api/wallet/init", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId })
    })
    .then(r => r.json())
    .then(data => {
      console.log("Wallet synchronized with backend", data);
    })
    .catch(err => console.error("Error booting wallet system", err));

    // Listen to user balance document
    const userDocRef = doc(db, "users", userId);
    const unsubUser = onSnapshot(userDocRef, (snap) => {
      if (snap.exists()) {
        const data = snap.data();
        setUserProfile(data);
        setWalletBalances({
          balance: data.balance || 0,
          affiliateBalance: data.affiliateBalance || 0,
          pendingBalance: data.pendingBalance || 0,
          referredBy: data.referredBy || ""
        });
      }
      setUiLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, `users/${userId}`);
    });

    // Listen to operations subcollection
    const txQuery = query(
      collection(db, "users", userId, "transactions"),
      orderBy("timestamp", "desc"),
      limit(50)
    );
    const unsubTx = onSnapshot(txQuery, (snap) => {
      const list: WalletTransaction[] = [];
      snap.forEach(d => {
        list.push({ id: d.id, ...d.data() } as WalletTransaction);
      });
      setDbTransactions(list);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, `users/${userId}/transactions`);
    });

    return () => {
      unsubUser();
      unsubTx();
    };
  }, [userId]);

  // Handle deposit logic
  const handleRecharge = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId || !rechargeAmount || Number(rechargeAmount) <= 0) return;

    setSubmitting(true);
    setActionStatus(null);
    try {
      const res = await fetch("/api/wallet/deposit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          amount: Number(rechargeAmount),
          description: "Rechargement Ndara Money"
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Une erreur est survenue");

      setActionStatus({ type: "success", text: `Votre compte a été rechargé de ${Number(rechargeAmount).toLocaleString()} F avec succès !` });
      setRechargeAmount("");
      setTimeout(() => setActiveModal("none"), 1500);
    } catch (err: any) {
      setActionStatus({ type: "error", text: err.message || "Erreur de recharge" });
    } finally {
      setSubmitting(false);
    }
  };

  // Handle transfer logic
  const handleTransfer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId || !recipient || !amount || Number(amount) <= 0) return;

    setSubmitting(true);
    setActionStatus(null);
    try {
      const res = await fetch("/api/wallet/transfer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          senderId: userId,
          receiver: recipient,
          amount: Number(amount),
          description: transferDesc
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Transfert échoué");

      setActionStatus({ type: "success", text: `Transfert de ${Number(amount).toLocaleString()} F envoyé à ${recipient} avec succès !` });
      setAmount("");
      setRecipient("");
      setTimeout(() => setActiveModal("none"), 1500);
    } catch (err: any) {
      setActionStatus({ type: "error", text: err.message || "Échec du transfert" });
    } finally {
      setSubmitting(false);
    }
  };

  // Handle Sandbox Course Purchase (Creates 10% affiliate and 14d hold)
  const handleSandboxPurchase = async () => {
    if (!userId) return;

    setSubmitting(true);
    setActionStatus(null);
    try {
      // If student chooses to configure a referrer first, we save it on their user document
      if (sandboxHasReferrer && sandboxReferrerId) {
        // Automatically inject the recruiter on user profile if needed
        const { doc, updateDoc } = await import("firebase/firestore");
        await updateDoc(doc(db, "users", userId), {
          referredBy: sandboxReferrerId
        });
      }

      const res = await fetch("/api/wallet/purchase", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studentId: userId,
          price: Number(sandboxCoursePrice),
          courseId: "mock_course_" + Math.random().toString(36).substring(3, 8),
          courseTitle: sandboxCourseTitle,
          sellerId: sandboxInstructorId
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Simulation échouée");

      setActionStatus({ 
        type: "success", 
        text: `Achat simulé de ${Number(sandboxCoursePrice).toLocaleString()} F ! Les commissions (10% parrainage et 90% vendeur) ont été placées sous séquestre de 14 jours.` 
      });
      setTimeout(() => setActiveModal("none"), 3000);
    } catch (err: any) {
      setActionStatus({ type: "error", text: err.message || "Erreur de simulation" });
    } finally {
      setSubmitting(false);
    }
  };

  // Trigger Escrow manual release
  const handleReleaseEscrow = async () => {
    if (!userId) return;

    setSubmitting(true);
    setActionStatus(null);
    try {
      // Let's create an expired test pending transaction to demonstrate the system immediately.
      // In a real database we check expiration, we will call the escrow release endpoint.
      const res = await fetch("/api/wallet/release-escrow", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erreur de déblocage");

      if (data.releasedCount > 0) {
        setActionStatus({ 
          type: "success", 
          text: `Séquestre analysé ! ${data.releasedCount} transaction(s) libérée(s) pour un total de ${data.totalReleasedAmount.toLocaleString()} F !` 
        });
      } else {
        // For testing purposes, let's offer to create an instantly expired tx to test!
        setActionStatus({ 
          type: "success", 
          text: "Aucun séquestre n'est encore arrivé à son terme de 14 jours. " 
        });
      }
    } catch (err: any) {
      setActionStatus({ type: "error", text: err.message || "Erreur" });
    } finally {
      setSubmitting(false);
    }
  };

  // Helper to force an instantly expired pending transaction for sandbox testers
  const handleForceCreateExpiredTx = async () => {
    if (!userId) return;
    setSubmitting(true);
    setActionStatus(null);
    try {
      const { doc, setDoc, collection } = await import("firebase/firestore");
      const testTxRef = doc(collection(db, 'users', userId, 'transactions'));
      
      const holdTimePast = new Date(Date.now() - (15 * 24 * 60 * 60 * 1000)); // 15 days ago (expired!)
      
      // Credit to pending balance
      const { updateDoc } = await import("firebase/firestore");
      await updateDoc(doc(db, "users", userId), {
        pendingBalance: walletBalances.pendingBalance + 10000,
        pendingAffiliateBalance: walletBalances.pendingBalance + 10000
      });

      const expiredTx: WalletTransaction = {
        id: testTxRef.id,
        userId,
        type: 'affiliate_payout',
        amount: 10000,
        status: 'pending',
        timestamp: holdTimePast.toISOString(),
        description: "Commission parrainage démo (Instamment expiré après 14j)",
        releaseAt: holdTimePast.toISOString()
      };
      
      await setDoc(testTxRef, expiredTx);
      setActionStatus({ 
        type: "success", 
        text: "Transaction fictive expirée de 10 000 F créée ! Cliquez à nouveau sur 'Libérer séquestres' pour la reverser dans vos gains disponibles." 
      });
    } catch (err: any) {
      setActionStatus({ type: "error", text: err.message || "Erreur" });
    } finally {
      setSubmitting(false);
    }
  };

  const balanceBreakdown = [
    { id: 1, title: "Solde principal", desc: "Disponible pour achats", amount: `${walletBalances.balance.toLocaleString()} F`, type: "positive", icon: TrendingUp, color: "text-emerald-500", bg: "bg-emerald-500/15" },
    { id: 2, title: "Gains de Parrainage", desc: "Libérés des 10%", amount: `${walletBalances.affiliateBalance.toLocaleString()} F`, type: "positive", icon: TrendingUp, color: "text-blue-500", bg: "bg-blue-500/15" },
    { id: 3, title: "Fonds sous Séquestre", desc: "Hold anti-fraude de 14j", amount: `${walletBalances.pendingBalance.toLocaleString()} F`, type: "pending", icon: Clock, color: "text-orange-500", bg: "bg-orange-500/15" },
  ];

  const filters = [
    { id: "all", label: "Tout" },
    { id: "deposit", label: "Rechargements" },
    { id: "purchase", label: "Achats" },
    { id: "transfer", label: "Transferts" },
    { id: "affiliate", label: "Commissions" }
  ];

  // Helper to translate labels nicely
  const getTxTypeLabel = (type: string) => {
    switch (type) {
      case 'deposit': return 'Rechargement';
      case 'purchase': return 'Achat syllabus';
      case 'affiliate_payout': return 'Commission parrainage (10%)';
      case 'course_sale': return 'Vente formateur';
      case 'transfer_send': return 'Transfert sortant';
      case 'transfer_receive': return 'Transfert entrant';
      case 'escrow_release': return 'Libération séquestre';
      default: return type;
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-top-4 duration-700 relative pb-24 max-w-4xl mx-auto">
      {/* Header */}
      <header className="flex items-center justify-between px-1 mb-2">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition-colors">
            <ChevronLeft className="w-5 h-5 text-white" />
          </button>
          <div>
            <h1 className="text-2xl font-black text-white leading-tight uppercase tracking-tight">Ndara Wallet</h1>
            <div className="text-[11px] font-mono text-slate-400">
               Titulaire : {userProfile?.fullName || authUser?.email || "Chargement..."}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {walletBalances.pendingBalance > 0 && (
             <button 
               onClick={handleReleaseEscrow} 
               className="h-10 px-3 bg-orange-500/20 text-orange-400 border border-orange-500/30 font-bold uppercase text-[10px] tracking-wider rounded-xl flex items-center gap-2 hover:bg-orange-500/30 transition-transform active:scale-95"
               title="Vérifier et débloquer les fonds expirés"
             >
               <RefreshCw className="w-3.5 h-3.5 animate-spin" style={{ animationDuration: '6s' }} />
               Libérer Séquestres
             </button>
          )}

          <button 
            onClick={() => { setActiveModal("sandbox"); setActionStatus(null); }}
            className="h-10 px-3 bg-primary/20 text-primary border border-primary/30 font-bold uppercase text-[10px] tracking-widest rounded-xl hover:bg-primary/30 transition-transform active:scale-95"
          >
            🔌 Test Sandbox
          </button>
        </div>
      </header>

      {/* Wallet Card */}
      <section className="px-1">
        <div className="w-full h-52 rounded-[30px] bg-gradient-to-br from-[#0c2a1e] via-[#155a3f] to-[#155a3f] relative overflow-hidden p-6 sm:p-8 flex flex-col justify-between shadow-[0_12px_40px_rgba(21,90,63,0.3)] border border-white/5">
          {/* Background circles */}
          <div className="absolute -top-16 -right-16 w-[200px] h-[200px] rounded-full bg-white/5"></div>
          <div className="absolute -bottom-10 -left-10 w-[150px] h-[150px] rounded-full bg-white/5"></div>
          
          <button 
            onClick={() => setShowBalance(!showBalance)}
            className="absolute right-6 top-6 w-10 h-10 rounded-full bg-white/10 flex items-center justify-center z-10 hover:bg-white/20 transition-colors"
          >
            {showBalance ? <Eye className="w-5 h-5 text-white/80" /> : <EyeOff className="w-5 h-5 text-white/80" />}
          </button>
          
          <div className="flex justify-between items-start relative z-10">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-white/15 flex items-center justify-center font-black text-white shadow-inner">N</div>
              <span className="text-sm font-black text-white/95 tracking-wider uppercase">NDARA ATOMIC WALLET</span>
            </div>
            <div className="w-10 h-8 rounded-lg bg-gradient-to-br from-yellow-400 to-yellow-600 opacity-85 shadow-lg"></div>
          </div>
          
          <div className="relative z-10">
            <div className="text-[10px] font-black text-white/50 uppercase tracking-widest mb-1 font-mono">Ndara Solde Disponible (XOF)</div>
            <div className="text-4xl font-black text-white tracking-tight flex items-baseline gap-2">
              {showBalance ? (walletBalances.balance + walletBalances.affiliateBalance).toLocaleString() : "••••••"}{" "}
              <span className="text-xl font-bold opacity-75">F</span>
            </div>
          </div>
          
          <div className="flex justify-between items-end relative z-10">
            <div className="text-xs font-mono text-white/50 tracking-[3px] uppercase">
               USER-ID: {userId ? `ND-${userId.substring(0, 6).toUpperCase()}` : "••••••"}
            </div>
            <div className="text-right">
              <div className="text-[8px] font-black text-white/40 uppercase tracking-widest font-mono">Système Sécurisé</div>
              <div className="text-xs font-black text-white/90 uppercase tracking-wide">NDARA AFRIQUE</div>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Actions */}
      <section className="grid grid-cols-4 gap-3 px-1">
        <button 
          onClick={() => { setActiveModal('send'); setActionStatus(null); }} 
          className="flex flex-col items-center gap-2 py-4 bg-[#1e293b]/40 border border-white/5 rounded-2xl active:scale-95 transition-all hover:bg-white/5 hover:border-white/10 group"
        >
          <div className="w-12 h-12 rounded-[16px] bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center group-hover:scale-105 transition-transform">
            <Send className="w-5 h-5 text-emerald-500 transform rotate-[-45deg]" />
          </div>
          <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Envoyer</span>
        </button>
        
        <button 
          onClick={() => { setActiveModal('receive'); setActionStatus(null); }} 
          className="flex flex-col items-center gap-2 py-4 bg-[#1e293b]/40 border border-white/5 rounded-2xl active:scale-95 transition-all hover:bg-white/5 hover:border-white/10 group"
        >
          <div className="w-12 h-12 rounded-[16px] bg-blue-500/10 border border-blue-500/20 flex items-center justify-center group-hover:scale-105 transition-transform">
            <Download className="w-5 h-5 text-blue-500" />
          </div>
          <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Recevoir</span>
        </button>
        
        <button 
          onClick={() => { setActiveModal('recharge'); setActionStatus(null); }} 
          className="flex flex-col items-center gap-2 py-4 bg-[#1e293b]/40 border border-white/5 rounded-2xl active:scale-95 transition-all hover:bg-white/5 hover:border-white/10 group"
        >
          <div className="w-12 h-12 rounded-[16px] bg-orange-500/10 border border-orange-500/20 flex items-center justify-center group-hover:scale-105 transition-transform">
            <Plus className="w-5 h-5 text-orange-500" />
          </div>
          <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Recharger</span>
        </button>

        <button 
          onClick={handleReleaseEscrow}
          className="flex flex-col items-center gap-2 py-4 bg-[#1e293b]/40 border border-white/5 rounded-2xl active:scale-95 transition-all hover:bg-white/5 hover:border-white/10 group"
        >
          <div className="w-12 h-12 rounded-[16px] bg-purple-500/10 border border-purple-500/20 flex items-center justify-center group-hover:scale-105 transition-transform">
            <RefreshCw className="w-5 h-5 text-purple-400" />
          </div>
          <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Séquestre</span>
        </button>
      </section>

      {/* Dynamic System Alert Banner */}
      {walletBalances.pendingBalance > 0 && (
        <div className="p-4 bg-orange-500/10 border border-orange-500/20 rounded-2xl flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-orange-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h4 className="text-xs font-black text-white uppercase tracking-wider">Fonds en transit surveillés ({walletBalances.pendingBalance.toLocaleString()} F)</h4>
            <p className="text-[11px] text-slate-400 leading-relaxed font-semibold">
               Conformément aux directives anti-fraude de Ndara Afrique, une période de séquestre de 14 jours s'applique aux commissions de parrainage (10%) ainsi qu'aux gains de vente directs. Cliquez sur "Libérer séquestres" pour créditer vos gains arrivés à échéance.
            </p>
          </div>
        </div>
      )}

      {/* Balance Breakdown */}
      <section className="px-1">
        <div className="p-6 bg-gradient-to-br from-white/[0.03] to-transparent border border-white/5 rounded-[24px]">
          <h2 className="text-xs font-black text-slate-500 uppercase tracking-widest mb-4">Répartition des comptes de solde</h2>
          <div className="space-y-3">
            {balanceBreakdown.map((item) => (
              <div key={item.id} className="flex justify-between items-center py-3 border-b border-white/5 last:border-none">
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${item.bg}`}>
                    <item.icon className={`w-5 h-5 ${item.color}`} />
                  </div>
                  <div>
                    <div className="text-sm font-bold text-white tracking-tight">{item.title}</div>
                    <div className="text-[11px] text-slate-400 font-medium">{item.desc}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className={`text-base font-black tracking-tight ${item.type === 'positive' ? 'text-white' : item.type === 'pending' ? 'text-orange-400' : 'text-slate-400'}`}>
                    {item.amount}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Ledger Transactions */}
      <section className="px-1">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xs font-black text-slate-500 uppercase tracking-widest">Registre des Transactions</h2>
          <span className="text-[9px] font-mono text-emerald-400 uppercase tracking-wider bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-full flex items-center gap-1">
             ● Synchro Temps-Réel (Atomic)
          </span>
        </div>

        {/* Filters */}
        <div className="flex gap-2 mb-4 overflow-x-auto hide-scrollbar pb-1">
          {filters.map((f) => (
            <button
              key={f.id}
              onClick={() => setFilter(f.id)}
              className={`px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-wider whitespace-nowrap transition-all ${
                filter === f.id
                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 shadow-[0_2px_10px_rgba(16,185,129,0.1)]'
                  : 'bg-[#111]/60 text-slate-500 border border-transparent hover:bg-white/5'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Transaction List */}
        <div className="space-y-2.5">
          {dbTransactions.filter(i => {
            if (filter === 'all') return true;
            if (filter === 'deposit') return i.type === 'deposit';
            if (filter === 'purchase') return i.type === 'purchase';
            if (filter === 'transfer') return i.type === 'transfer_send' || i.type === 'transfer_receive';
            if (filter === 'affiliate') return i.type === 'affiliate_payout' || i.type === 'course_sale';
            return true;
          }).length > 0 ? (
            dbTransactions.filter(i => {
              if (filter === 'all') return true;
              if (filter === 'deposit') return i.type === 'deposit';
              if (filter === 'purchase') return i.type === 'purchase';
              if (filter === 'transfer') return i.type === 'transfer_send' || i.type === 'transfer_receive';
              if (filter === 'affiliate') return i.type === 'affiliate_payout' || i.type === 'course_sale';
              return true;
            }).map((item) => {
              const isPositive = item.amount > 0;
              const isPending = item.status === 'pending';

              return (
                <div 
                  key={item.id} 
                  onClick={() => { setSelectedTx(item); setActiveModal('detail'); }} 
                  className="flex items-center gap-4 p-4 bg-white/[0.02] border border-white/5 rounded-2xl active:scale-[0.98] transition-all cursor-pointer hover:bg-white/[0.04]"
                >
                  <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${
                    item.type === 'deposit' ? 'bg-emerald-500/10 text-emerald-400' :
                    item.type === 'purchase' ? 'bg-rose-500/10 text-rose-400' :
                    item.type === 'affiliate_payout' ? 'bg-blue-500/10 text-blue-400' :
                    item.type === 'course_sale' ? 'bg-orange-500/10 text-orange-400' :
                    'bg-slate-800 text-white'
                  }`}>
                    {item.type === 'deposit' ? <Plus className="w-5 h-5" /> : 
                     item.type === 'purchase' ? <ShoppingCart className="w-5 h-5" /> :
                     item.type === 'affiliate_payout' ? <TrendingUp className="w-5 h-5" /> :
                     <ChevronRight className="w-5 h-5" />}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-bold text-white mb-0.5 mt-0.5 truncate leading-none">
                      {getTxTypeLabel(item.type)}
                    </div>
                    <div className="text-[11px] text-slate-500 truncate mt-1">
                      {item.description}
                    </div>
                  </div>
                  
                  <div className="text-right shrink-0">
                    <div className={`text-sm font-black mb-1.5 ${isPending ? 'text-orange-400' : isPositive ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {isPositive ? '+' : ''}{item.amount.toLocaleString()} F
                    </div>
                    <div className="text-[9px] font-mono text-slate-500 uppercase">
                      {isPending ? '🔒 Séquestre' : 'Valide'}
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="p-12 text-center border border-dashed border-white/5 rounded-[2rem] opacity-[0.45]">
              <Clock className="w-12 h-12 text-slate-600 mx-auto mb-3" />
              <p className="text-[11px] font-black uppercase text-slate-400 tracking-widest leading-relaxed">Aucune transaction enregistrée</p>
            </div>
          )}
        </div>
      </section>

      {/* Modals layout */}
      {activeModal !== 'none' && (
        <div className="fixed inset-0 bg-black/85 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 fill-current animation duration-200" onClick={() => setActiveModal('none')}>
          <div 
            className="w-full max-w-md bg-gradient-to-b from-[#111111] to-[#070707] border border-white/5 rounded-t-[2.5rem] sm:rounded-[2.5rem] p-6 animate-in slide-in-from-bottom max-h-[90vh] overflow-y-auto"
            onClick={e => e.stopPropagation()}
          >
            {/* Top indicator for pocket pull */}
            <div className="w-12 h-1 bg-white/20 rounded-full mx-auto mb-4 sm:hidden"></div>
            
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-black text-white uppercase tracking-tight">
                {activeModal === 'send' ? 'Envoi Ndara Transfer' : 
                 activeModal === 'receive' ? 'Recevoir des fonds' : 
                 activeModal === 'recharge' ? 'Recharger mon Wallet' :
                 activeModal === 'sandbox' ? 'Ndara Sandbox Simulator' :
                 'Fiche de Transaction'}
              </h2>
              <button onClick={() => setActiveModal('none')} className="w-9 h-9 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center">
                <X className="w-4 h-4 text-white/70" />
              </button>
            </div>

            {/* Notification messages inside Modals */}
            {actionStatus && (
              <div className={`p-4 rounded-xl mb-6 text-xs text-center font-bold flex items-center justify-center gap-2 ${
                actionStatus.type === 'success' ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400' : 'bg-red-500/10 border border-red-500/20 text-red-400'
              }`}>
                {actionStatus.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                {actionStatus.text}
              </div>
            )}

            {/* RECHARGE FORM */}
            {activeModal === 'recharge' && (
              <form onSubmit={handleRecharge} className="space-y-4">
                <div className="text-center py-4">
                   <p className="text-xs text-slate-400 font-medium">Saisissez le montant fictif à créditer</p>
                   <div className="flex items-center justify-center gap-2 mt-2">
                     <input 
                       type="number"
                       required
                       placeholder="0"
                       value={rechargeAmount}
                       onChange={e => setRechargeAmount(e.target.value)}
                       className="w-48 text-center bg-transparent border-none text-4xl font-black text-white focus:outline-none placeholder:text-slate-800"
                     />
                     <span className="text-xl font-bold bg-[#1d9a6c]/20 text-primary px-3 py-1 rounded-xl">XOF</span>
                   </div>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  {['10000', '50000', '100000'].map(val => (
                    <button key={val} type="button" onClick={() => setRechargeAmount(val)} className="py-2.5 bg-white/5 hover:bg-primary/20 hover:text-primary rounded-xl text-xs font-bold text-slate-400 border border-transparent hover:border-primary/20 transition-all">
                      {Number(val).toLocaleString()} F
                    </button>
                  ))}
                </div>

                <button 
                  type="submit"
                  disabled={submitting}
                  className="w-full h-14 rounded-2xl bg-primary text-black font-black uppercase text-xs tracking-widest active:scale-95 transition-transform flex items-center justify-center gap-2 mt-4 cursor-pointer"
                >
                  {submitting && <RefreshCw className="w-4 h-4 animate-spin" />}
                  Valider le Rechargement
                </button>
              </form>
            )}

            {/* SEND FORM */}
            {activeModal === 'send' && (
              <form onSubmit={handleTransfer} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-slate-500 text-[10px] uppercase font-black tracking-wider block ml-1">ID ou Username du Destinataire</label>
                  <input 
                    type="text" 
                    required
                    placeholder="ex: ND-84729 ou 'oyonomathias'"
                    value={recipient}
                    onChange={e => setRecipient(e.target.value)}
                    className="w-full h-12 px-4 bg-black border border-white/5 rounded-xl text-sm font-medium text-white focus:outline-none focus:border-primary/50"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-slate-500 text-[10px] uppercase font-black tracking-wider block ml-1">Libellé / Description</label>
                  <input 
                    type="text" 
                    required
                    value={transferDesc}
                    onChange={e => setTransferDesc(e.target.value)}
                    className="w-full h-12 px-4 bg-black border border-white/5 rounded-xl text-sm font-semibold text-white focus:outline-none focus:border-primary/50"
                  />
                </div>

                <div className="text-center py-4 border-t border-b border-white/5 my-4">
                  <span className="text-[10px] text-slate-500 uppercase font-black tracking-widest">Montant du Transfert</span>
                  <div className="flex items-center justify-center gap-2 mt-1">
                    <input 
                      type="number" 
                      required
                      placeholder="0"
                      value={amount}
                      onChange={e => setAmount(e.target.value)}
                      className="w-40 text-center bg-transparent border-none text-4xl font-black text-white focus:outline-none placeholder:text-slate-800"
                    />
                    <span className="text-sm font-bold text-slate-400">XOF</span>
                  </div>
                  <div className="flex justify-center gap-1.5 mt-3">
                    {['2500', '10000', '35000'].map(val => (
                      <button key={val} type="button" onClick={() => setAmount(val)} className="px-3.5 py-1.5 bg-white/5 hover:bg-primary/20 hover:text-primary hover:border-primary/20 text-slate-400 text-xs font-black rounded-lg transition-all">
                        {Number(val).toLocaleString()} F
                      </button>
                    ))}
                  </div>
                </div>

                <button 
                  type="submit" 
                  disabled={submitting}
                  className="w-full h-14 rounded-2xl bg-gradient-to-r from-primary to-emerald-400 text-neutral-950 font-black uppercase text-xs tracking-widest active:scale-95 transition-transform flex items-center justify-center gap-2 cursor-pointer"
                >
                  {submitting && <RefreshCw className="w-4 h-4 animate-spin" />}
                  Envoyer Instantanément
                </button>
              </form>
            )}

            {/* RECEIVE INFO */}
            {activeModal === 'receive' && (
              <div className="space-y-6 text-center">
                 <div className="w-44 h-44 mx-auto bg-white rounded-3xl p-4 flex items-center justify-center shadow-inner relative overflow-hidden group">
                   <div className="w-full h-full bg-slate-900 flex flex-wrap" style={{backgroundImage: 'linear-gradient(45deg, #000 25%, transparent 25%, transparent 75%, #000 75%, #000), linear-gradient(45deg, #000 25%, transparent 25%, transparent 75%, #000 75%, #000)', backgroundSize: '16px 16px', backgroundPosition: '0 0, 8px 8px'}}></div>
                   <div className="absolute inset-0 bg-primary/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center font-black text-neutral-950 uppercase text-[10px] tracking-widest backdrop-blur-xs">QR Sécurisé</div>
                 </div>
                 
                 <div className="p-4 bg-white/5 rounded-2xl text-center">
                   <div className="text-[10px] text-slate-500 uppercase font-black font-mono tracking-widest">Username Ndara</div>
                   <div className="text-lg font-black text-primary tracking-wide mt-1">@{userProfile?.username || "loading"}</div>
                   <div className="text-[11px] text-slate-400 mt-1 font-mono">ID: {userId}</div>
                 </div>
                 
                 <button 
                   onClick={() => {
                     navigator.clipboard.writeText(userId || "");
                     alert("ID copié dans le presse-papiers !");
                   }}
                   className="w-full flex items-center justify-center gap-2 h-14 rounded-2xl bg-primary/10 border border-primary/25 text-primary font-black uppercase text-xs tracking-widest active:scale-95 transition-all cursor-pointer"
                 >
                   Copier l'ID unique
                 </button>
              </div>
            )}

            {/* SANDBOX ESCROW & PARRAINAGE SIMULATOR */}
            {activeModal === 'sandbox' && (
              <div className="space-y-4">
                 <div className="p-4 bg-primary/10 border border-primary/20 rounded-2xl text-xs space-y-1 text-slate-300">
                    <div className="font-black text-white uppercase tracking-wider flex items-center gap-1">
                      <ShieldCheck className="w-4 h-4 text-primary" /> Simulateur de Flux Monétaire
                    </div>
                    <p className="leading-relaxed">
                      Ce panneau vous permet d'analyser en profondeur les <strong>règles des 3 soldes</strong> :
                    </p>
                    <ul className="list-disc pl-4 space-y-1 font-medium text-slate-400">
                      <li>L'étudiant est prélevé du prix intégral de la formation (déduit de son <strong>Solde principal</strong>).</li>
                      <li>Le parrain reçoit <strong>10% cumulés</strong> immédiatement sous séquestre (<strong>Solde parrainage séquestré</strong>).</li>
                      <li>Le formateur vendeur reçoit les <strong>90% restants</strong>, également bloqués en séquestre (<strong>Pending Balance</strong>) d'une durée légale de 14 jours.</li>
                    </ul>
                 </div>

                 <div className="space-y-3">
                   <div className="space-y-1">
                     <label className="text-[10px] uppercase font-black text-slate-500">Formateur Vendeur (ID)</label>
                     <input 
                       type="text" 
                       value={sandboxInstructorId} 
                       onChange={e => setSandboxInstructorId(e.target.value)}
                       className="w-full h-11 px-4 bg-black border border-white/5 rounded-xl text-xs text-white"
                     />
                   </div>

                   <div className="grid grid-cols-2 gap-2">
                     <div className="space-y-1">
                       <label className="text-[10px] uppercase font-black text-slate-500">Prix de la Licence (F)</label>
                       <input 
                         type="number" 
                         value={sandboxCoursePrice} 
                         onChange={e => setSandboxCoursePrice(e.target.value)}
                         className="w-full h-11 px-4 bg-black border border-white/5 rounded-xl text-xs text-white"
                       />
                     </div>
                     <div className="space-y-1">
                       <label className="text-[10px] uppercase font-black text-slate-500">Nom du Syllabus</label>
                       <input 
                         type="text" 
                         value={sandboxCourseTitle} 
                         onChange={e => setSandboxCourseTitle(e.target.value)}
                         className="w-full h-11 px-4 bg-black border border-white/5 rounded-xl text-xs text-white"
                       />
                     </div>
                   </div>

                   <div className="flex items-center gap-2 py-2">
                     <input 
                       type="checkbox" 
                       id="referred_chk" 
                       checked={sandboxHasReferrer} 
                       onChange={e => setSandboxHasReferrer(e.target.checked)} 
                       className="rounded text-primary focus:ring-primary h-4 w-4 bg-black border-white/15"
                     />
                     <label htmlFor="referred_chk" className="text-xs text-slate-400 font-bold uppercase tracking-wider">
                       Ajouter un Ambassadeur Parrain (10%)
                     </label>
                   </div>

                   {sandboxHasReferrer && (
                     <div className="space-y-1">
                       <label className="text-[10px] uppercase font-black text-slate-500">ID du Parrain Recruteur</label>
                       <input 
                         type="text" 
                         value={sandboxReferrerId} 
                         onChange={e => setSandboxReferrerId(e.target.value)}
                         className="w-full h-11 px-4 bg-black border border-white/5 rounded-xl text-xs text-white"
                       />
                     </div>
                   )}
                 </div>

                 <div className="grid grid-cols-1 gap-2 pt-2">
                   <button 
                     onClick={handleSandboxPurchase}
                     disabled={submitting}
                     className="w-full h-12 rounded-xl bg-primary text-neutral-950 font-black uppercase text-xs tracking-wider active:scale-95 transition-all flex items-center justify-center gap-1.5"
                   >
                     ⚡ Déclencher l'achat de formation (Atomic Checkout)
                   </button>
                   
                   <div className="flex gap-2">
                     <button 
                       onClick={handleForceCreateExpiredTx}
                       disabled={submitting}
                       className="flex-1 h-11 rounded-xl bg-orange-500/10 border border-orange-500/30 text-orange-400 hover:bg-orange-500/20 text-[10px] font-black uppercase tracking-wider transition-colors"
                     >
                       ⏱️ Créer séquestre expiré de démo (15 jours d'âge)
                     </button>
                     
                     <button 
                       onClick={handleReleaseEscrow}
                       disabled={submitting}
                       className="flex-1 h-11 rounded-xl bg-purple-500/10 border border-purple-500/30 text-purple-400 hover:bg-purple-500/20 text-[10px] font-black uppercase tracking-wider transition-colors"
                     >
                       🔓 Débloquer séquestres
                     </button>
                   </div>
                 </div>
              </div>
            )}

            {/* DETAIL MODAL */}
            {activeModal === 'detail' && selectedTx && (
              <div className="space-y-5">
                <div className="text-center py-4 border-b border-white/5">
                  <div className={`w-16 h-16 rounded-full mx-auto flex items-center justify-center mb-3 ${
                    selectedTx.amount > 0 ? 'bg-emerald-500/15 text-emerald-400' : 'bg-rose-500/15 text-rose-400'
                  }`}>
                    {selectedTx.amount > 0 ? <Plus className="w-8 h-8" /> : <ShoppingCart className="w-8 h-8" />}
                  </div>
                  <div className="text-2xl font-black text-white">{selectedTx.amount.toLocaleString()} XOF</div>
                  <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase mt-2.5 ${
                    selectedTx.status === 'completed' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-orange-500/10 text-orange-400'
                  }`}>
                    <div className={`w-1.5 h-1.5 rounded-full ${selectedTx.status === 'completed' ? 'bg-emerald-500' : 'bg-orange-400 animate-pulse'}`}></div> 
                    {selectedTx.status === 'completed' ? 'Opération validée' : '🔒 Sous séquestre (Hold 14j)'}
                  </div>
                </div>
                
                <div className="bg-white/5 rounded-2xl p-4 space-y-3.5 text-xs">
                  <div className="font-black text-slate-500 uppercase tracking-widest text-[9px] mb-1">Fiche Journal Comptable</div>
                  <div className="flex justify-between items-center border-b border-white/5 pb-2">
                    <span className="text-slate-400">Type de flux</span>
                    <span className="font-bold text-white uppercase tracking-wider text-[10px]">{getTxTypeLabel(selectedTx.type)}</span>
                  </div>
                  <div className="flex justify-between items-center border-b border-white/5 pb-2">
                    <span className="text-slate-400 font-medium">Libellé</span>
                    <span className="font-bold text-white">{selectedTx.description}</span>
                  </div>
                  <div className="flex justify-between items-center border-b border-white/5 pb-2">
                    <span className="text-slate-400">Horodatage d’écriture</span>
                    <span className="font-mono text-slate-300">{new Date(selectedTx.timestamp).toLocaleString('fr-FR')}</span>
                  </div>
                  {selectedTx.releaseAt && (
                    <div className="flex justify-between items-center border-b border-white/5 pb-2">
                      <span className="text-orange-400 font-bold">Fin de hold anti-fraude</span>
                      <span className="font-mono text-orange-400 font-bold">
                        {new Date(selectedTx.releaseAt).toLocaleDateString('fr-FR')} {new Date(selectedTx.releaseAt).toLocaleTimeString('fr-FR')}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between items-center pb-1">
                    <span className="text-slate-400">ID d’audit ledger</span>
                    <span className="font-mono text-slate-400">{selectedTx.id}</span>
                  </div>
                </div>
                
                <button className="w-full h-14 rounded-2xl bg-white/5 hover:bg-white/10 text-white font-black uppercase text-xs tracking-widest active:scale-95 transition-transform cursor-pointer" onClick={() => setActiveModal('none')}>
                  Fermer la fiche
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
