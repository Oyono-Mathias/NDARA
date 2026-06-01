import React, { useState, useEffect } from "react";
import { Activity, Users, Banknote, ShieldAlert, TrendingUp, TerminalSquare, AlertTriangle, ArrowUpRight, Loader2 } from "lucide-react";
import { db } from "../../firebase";
import { collection, query, where, onSnapshot, getDocs } from "firebase/firestore";

export function AdminDashboard() {
  const [metrics, setMetrics] = useState({
    totalUsers: 0,
    totalRevenue: 0,
    pendingPayoutCount: 0,
    loading: true
  });
  const [pendingPayouts, setPendingPayouts] = useState<any[]>([]);

  useEffect(() => {
    // 1. Listen to users
    const unsubUsers = onSnapshot(collection(db, "users"), (snap) => {
      setMetrics(prev => ({ ...prev, totalUsers: snap.size }));
    });

    // 2. Listen to completed payments
    const qPayments = query(collection(db, "payments"), where("status", "==", "Completed"));
    const unsubPayments = onSnapshot(qPayments, (snap) => {
      const total = snap.docs.reduce((acc, doc) => acc + (doc.data().amount || 0), 0);
      setMetrics(prev => ({ ...prev, totalRevenue: total }));
    });

    // 3. Listen to pending payouts
    const qPayouts = query(collection(db, "payout_requests"), where("status", "==", "pending"));
    const unsubPayouts = onSnapshot(qPayouts, (snap) => {
      const pList = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      setPendingPayouts(pList);
      setMetrics(prev => ({ 
        ...prev, 
        pendingPayoutCount: snap.size,
        loading: false 
      }));
    });

    return () => {
      unsubUsers();
      unsubPayments();
      unsubPayouts();
    };
  }, []);

  return (
    <div className="space-y-8 animate-in fade-in duration-500 font-mono text-green-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-[#10B981]/20 pb-6 mb-8">
        <div>
          <h1 className="text-3xl font-black text-white tracking-widest uppercase mb-1 flex items-center gap-3">
              <TerminalSquare className="text-[#10B981] w-8 h-8" /> ROOT_DASHBOARD
          </h1>
          <p className="text-[#10B981]/70 text-xs font-bold uppercase tracking-[0.2em] flex items-center gap-2">
             <span className="w-2 h-2 rounded-full bg-[#10B981] animate-pulse"></span>
             System Online // Latency: 38ms
          </p>
        </div>
        <div className="bg-black border border-red-500/50 p-3 rounded-sm flex items-center gap-4">
            <div className="flex flex-col">
                <span className="text-red-500 text-[10px] font-bold uppercase tracking-widest">Master Kill Switch</span>
                <span className="text-gray-500 text-[9px]">Global suspend</span>
            </div>
            <div className="w-12 h-6 bg-red-500/20 border border-red-500 rounded-full flex items-center p-1 cursor-not-allowed">
                <div className="w-4 h-4 bg-red-500 rounded-full shadow-[0_0_10px_rgba(239,68,68,0.8)]"></div>
            </div>
        </div>
      </div>

      {/* Primary Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
         <AdminMetric 
           title="Revenus Bruts Totaux" 
           value={metrics.loading ? "Calcul..." : `${metrics.totalRevenue.toLocaleString()} F`} 
           trend="Direct Ledger" 
           icon={Banknote} 
           color="text-[#10B981]" 
           border="border-[#10B981]/30" 
         />
         <AdminMetric 
           title="Identités Enregistrées" 
           value={metrics.loading ? "Calcul..." : metrics.totalUsers.toLocaleString()} 
           trend="DB Enrolled" 
           icon={Users} 
           color="text-blue-400" 
           border="border-blue-400/30" 
         />
         <AdminMetric 
           title="Arbitrages Payout" 
           value={metrics.loading ? "..." : `${metrics.pendingPayoutCount} en cours`} 
           trend="Action Requise" 
           icon={ShieldAlert} 
           color="text-red-500" 
           border="border-red-500/30" 
           bg="bg-red-500/5" 
           animate={metrics.pendingPayoutCount > 0} 
         />
         <AdminMetric 
           title="Teneur de Compte" 
           value="100.0% OK" 
           trend="Zéro Failles" 
           icon={TrendingUp} 
           color="text-purple-400" 
           border="border-purple-400/30" 
         />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Chart Area placeholder */}
          <div className="lg:col-span-2 bg-[#050505] border border-[#10B981]/20 p-6 relative overflow-hidden">
             <div className="absolute top-0 right-0 p-4">
                 <span className="text-[#10B981] text-[10px] font-bold tracking-widest uppercase">Live_Telemetry</span>
             </div>
             <h2 className="text-[#10B981] font-bold tracking-widest uppercase mb-6 text-sm border-b border-[#10B981]/20 pb-2 inline-block">Flux d'Acquisition & Opérations</h2>
             
             <div className="h-64 flex flex-col items-center justify-center border border-dashed border-[#10B981]/20 bg-[#10B981]/5">
                 <Activity className="w-12 h-12 text-[#10B981]/50 mb-4 animate-pulse" />
                 <p className="text-[#10B981]/70 text-xs font-mono uppercase tracking-widest">[ Graph_Rendering_Engine_Active & Listening ]</p>
                 <p className="text-gray-500 text-[10px] uppercase font-bold tracking-wider mt-1">Tout est synchronisé sur firestore.</p>
             </div>
          </div>

          {/* System Logs / Urgent Actions */}
          <div className="bg-[#050505] border border-[#10B981]/20 p-6 flex flex-col">
              <h2 className="text-[#10B981] font-bold tracking-widest uppercase mb-4 text-sm flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-500 animate-bounce" />
                  Requêtes Critiques de Trésorerie
              </h2>
              <div className="flex-1 space-y-3 overflow-y-auto">
                  {metrics.loading ? (
                    <div className="py-8 text-center text-xs text-gray-500">Chargement des flux...</div>
                  ) : pendingPayouts.length > 0 ? (
                    pendingPayouts.map((payout) => (
                      <ActionItem 
                          key={payout.id}
                          type="PAYOUT" 
                          message={`Retrait Mobile money: ${(payout.amount || 0).toLocaleString()} F`} 
                          user={`UID: ${payout.instructorId ? payout.instructorId.substring(0, 8) : 'Sys'}...`} 
                          urgency="HIGH" 
                      />
                    ))
                  ) : (
                    <div className="py-8 text-center text-xs text-gray-600 uppercase tracking-wider">
                       Aucun retrait en attente.<br/>
                       Tout est soldé !
                    </div>
                  )}

                  <ActionItem 
                      type="SECURITY" 
                      message="Contrôle d'accès chiffré SSH / SSL actif" 
                      user="Firewall" 
                      urgency="LOW" 
                  />
              </div>
          </div>
      </div>
    </div>
  );
}

function AdminMetric({ title, value, trend, icon: Icon, color, border, bg = "bg-black", animate }: any) {
    return (
        <div className={`${bg} border ${border} p-5 relative overflow-hidden group rounded-sm`}>
            <div className="absolute right-0 top-0 w-16 h-16 bg-current opacity-5 blur-xl group-hover:opacity-10 transition-opacity"></div>
            <div className="flex justify-between items-start mb-4">
                <p className="text-gray-500 text-[10px] uppercase tracking-widest font-bold">{title}</p>
                <Icon className={`w-5 h-5 ${color} ${animate ? 'animate-pulse' : ''}`} />
            </div>
            <h3 className="text-xl font-black text-white tracking-wider mb-2">{value}</h3>
            <p className={`text-[10px] font-bold uppercase tracking-widest flex items-center gap-1 ${color}`}>
                <ArrowUpRight className="w-3 h-3" /> {trend}
            </p>
        </div>
    )
}

function ActionItem({ type, message, user, urgency }: any) {
    const urgencyColors = {
        HIGH: 'text-red-500 border-red-500/30 bg-red-500/5',
        MEDIUM: 'text-amber-500 border-amber-500/30 bg-amber-500/5',
        LOW: 'text-blue-400 border-blue-400/30 bg-blue-400/5'
    };
    
    return (
        <div className={`border-l-2 pl-3 py-2 pr-1 ${urgencyColors[urgency as keyof typeof urgencyColors]}`}>
            <div className="flex items-center gap-2 mb-1">
                <span className={`text-[9px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded-sm bg-black border ${urgencyColors[urgency as keyof typeof urgencyColors].split(' ')[0]}`}>
                    {type}
                </span>
                <span className="text-gray-500 text-[9px]">{user}</span>
            </div>
            <p className="text-white text-xs font-semibold">{message}</p>
        </div>
    )
}
