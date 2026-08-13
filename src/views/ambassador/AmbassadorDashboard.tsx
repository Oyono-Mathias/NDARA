import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useRole } from "../../context/RoleContext";
import { db } from '../../firebase';
import { doc, getDoc, collection, query, where, getDocs, orderBy, limit, onSnapshot, addDoc, serverTimestamp } from 'firebase/firestore';
import { useToast } from '../../hooks/use-toast';
import { Loader2, Copy, CheckCircle2, TrendingUp, Users, DollarSign, Share2, Trophy, Medal, Star, Target, Gift, Clock, CreditCard } from 'lucide-react';
import { logger } from '../../lib/logger';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Link } from 'react-router-dom';

export function AmbassadorDashboard() {
  const { firebaseUser } = useAuth();
  const { role } = useRole();
  const { toast } = useToast();
  
  const [loading, setLoading] = useState(true);
  const [ambassadorData, setAmbassadorData] = useState<any>(null);
  const [copied, setCopied] = useState(false);
  const [chartData, setChartData] = useState<any[]>([]);
  const [sales, setSales] = useState<any[]>([]);
  
  const [isRequesting, setIsRequesting] = useState(false);
  const [showPayoutModal, setShowPayoutModal] = useState(false);
  const [payoutMethod, setPayoutMethod] = useState('mobile_money');
  const [payoutAmount, setPayoutAmount] = useState('');
  const [payoutDestination, setPayoutDestination] = useState('');
  
  const [payoutRequests, setPayoutRequests] = useState<any[]>([]);
  const [minWithdrawal, setMinWithdrawal] = useState(5000);

  useEffect(() => {
    if (!firebaseUser) return;
    setLoading(true);

    const unsubAmbassador = onSnapshot(doc(db, 'ambassadors', firebaseUser.uid), (docSnap) => {
      if (docSnap.exists()) setAmbassadorData(docSnap.data());
    });

    const unsubTx = onSnapshot(query(collection(db, 'affiliate_transactions'), where('ambassadorId', '==', firebaseUser.uid), orderBy('createdAt', 'desc')), (snap) => {
      const txs = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      setSales(txs);
      
      const grouped = [...txs].reverse().reduce((acc: any, tx: any) => {
          if (!tx.createdAt) return acc;
          const d = tx.createdAt.toDate ? tx.createdAt.toDate() : new Date(tx.createdAt);
          const dateStr = format(d, 'dd MMM', { locale: fr });
          if (!acc[dateStr]) acc[dateStr] = 0;
          acc[dateStr] += (tx.commissionAmount || 0); // Use commission amount for chart
          return acc;
      }, {});
      const chart = Object.keys(grouped).map(date => ({
          date,
          gains: grouped[date]
      }));
      setChartData(chart);
    });

    const unsubPayouts = onSnapshot(query(collection(db, 'payout_requests'), where('ambassadorId', '==', firebaseUser.uid), orderBy('createdAt', 'desc')), (snap) => {
      setPayoutRequests(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      setLoading(false);
    });
    
    getDoc(doc(db, 'config', 'affiliate_rewards_config')).then(doc => {
       if (doc.exists()) setMinWithdrawal(doc.data().minWithdrawal || 5000);
    });

    return () => {
      unsubAmbassador();
      unsubTx();
      unsubPayouts();
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

  const handlePayoutRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    const amount = Number(payoutAmount);
    if (amount < minWithdrawal) {
      return toast({ title: "Erreur", description: `Le minimum de retrait est de ${minWithdrawal.toLocaleString()} FCFA`, variant: "destructive" });
    }
    if (amount > (ambassadorData?.availableBalance || 0)) {
      return toast({ title: "Erreur", description: "Solde disponible insuffisant.", variant: "destructive" });
    }
    if (!payoutDestination) {
      return toast({ title: "Erreur", description: "Veuillez fournir un numéro ou une destination.", variant: "destructive" });
    }

    try {
      setIsRequesting(true);
      
      const token = await firebaseUser?.getIdToken();
      const response = await fetch('/api/ambassador/payout/request', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          amount,
          method: payoutMethod,
          destination: payoutDestination
        })
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || 'Erreur lors de la demande');
      }

      toast({ title: "Succès", description: "Votre demande de retrait a été envoyée." });
      setShowPayoutModal(false);
      setPayoutAmount('');
      setPayoutDestination('');
    } catch (error: any) {
      toast({ title: "Erreur", description: error.message, variant: "destructive" });
    } finally {
      setIsRequesting(false);
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
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-8 pb-32">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-black text-white uppercase tracking-tight flex items-center gap-3">
          <Trophy className="text-pink-500 w-8 h-8" />
          Tableau de Bord Ambassadeur
        </h1>
        <p className="text-slate-400">Vue d'ensemble de vos performances et de vos revenus d'affiliation.</p>
      </div>

      {/* SECTION FINANCIÈRE */}
      <div>
        <h2 className="text-sm font-black text-white uppercase tracking-widest mb-4">Mes Commissions</h2>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="bg-slate-800/20 border border-slate-700 rounded-2xl p-6 flex flex-col justify-between">
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">CA Généré</p>
              <div>
                 <p className="text-2xl font-black text-white">{(ambassadorData.totalRevenue || 0).toLocaleString()}</p>
                 <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">FCFA</p>
              </div>
            </div>
            
            <div className="bg-slate-800/20 border border-slate-700 rounded-2xl p-6 flex flex-col justify-between">
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Total</p>
              <div>
                 <p className="text-2xl font-black text-blue-400">{(ambassadorData.totalCommission || 0).toLocaleString()}</p>
                 <p className="text-xs text-blue-500/50 font-bold uppercase tracking-widest">FCFA</p>
              </div>
            </div>

            <div className="bg-slate-800/20 border border-slate-700 rounded-2xl p-6 flex flex-col justify-between">
              <p className="text-[10px] font-bold text-amber-500 uppercase tracking-widest mb-2">En Attente</p>
              <div>
                 <p className="text-2xl font-black text-amber-400">{(ambassadorData.pendingBalance || 0).toLocaleString()}</p>
                 <p className="text-xs text-amber-500/50 font-bold uppercase tracking-widest">FCFA</p>
              </div>
            </div>

            <div className="bg-[#111827] border border-emerald-500/30 rounded-2xl p-6 flex flex-col justify-between shadow-[0_0_15px_rgba(16,185,129,0.1)]">
              <p className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest mb-2">Disponible</p>
              <div>
                 <p className="text-2xl font-black text-emerald-400">{(ambassadorData.availableBalance || 0).toLocaleString()}</p>
                 <p className="text-xs text-emerald-500/50 font-bold uppercase tracking-widest">FCFA</p>
              </div>
            </div>

            <div className="bg-slate-800/20 border border-slate-700 rounded-2xl p-6 flex flex-col justify-between">
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Déjà Retiré</p>
              <div>
                 <p className="text-2xl font-black text-slate-300">{(ambassadorData.withdrawnAmount || 0).toLocaleString()}</p>
                 <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">FCFA</p>
              </div>
            </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Chart */}
          <div className="lg:col-span-2 bg-[#111827] border border-[#1E293B] rounded-3xl p-6">
              <div className="flex justify-between items-center mb-6">
                 <h2 className="text-sm font-black text-white uppercase tracking-widest">Évolution des Commissions</h2>
              </div>
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
                            itemStyle={{ color: '#ec4899', fontWeight: 'bold' }}
                        />
                        <Area type="monotone" dataKey="gains" stroke="#ec4899" strokeWidth={3} fillOpacity={1} fill="url(#colorGains)" />
                    </AreaChart>
                </ResponsiveContainer>
              </div>
          </div>

          {/* Quick Actions & Info */}
          <div className="space-y-4">
              <div className="bg-[#111827] border border-pink-500/30 rounded-3xl p-6 shadow-[0_0_20px_rgba(236,72,153,0.1)]">
                 <h2 className="text-sm font-black text-white uppercase tracking-widest mb-4">Retrait</h2>
                 <p className="text-xs text-slate-400 mb-6">Solde retirable : <span className="font-bold text-white">{(ambassadorData.availableBalance || 0).toLocaleString()} FCFA</span></p>
                 <button 
                    onClick={() => setShowPayoutModal(true)}
                    disabled={(ambassadorData.availableBalance || 0) < minWithdrawal}
                    className="w-full py-3 bg-pink-500 hover:bg-pink-600 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl text-white font-bold transition-all shadow-lg shadow-pink-500/25"
                 >
                    Demander un retrait
                 </button>
                 {(ambassadorData.availableBalance || 0) < minWithdrawal && (
                    <p className="text-[10px] text-pink-400 mt-2 text-center">Minimum requis: {minWithdrawal.toLocaleString()} FCFA</p>
                 )}
              </div>

              <div className="bg-[#111827] border border-[#1E293B] rounded-3xl p-6">
                 <h2 className="text-sm font-black text-white uppercase tracking-widest mb-4">Lien de Parrainage</h2>
                 <div className="flex items-center gap-2 mb-2">
                    <input 
                        type="text" 
                        readOnly 
                        value={ambassadorData.referralLink || `https://app.ndaraafrique.com/register?ref=${ambassadorData.referralCode}`}
                        className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs font-mono text-slate-400 focus:outline-none"
                    />
                    <button onClick={copyToClipboard} className="p-2 bg-pink-500 hover:bg-pink-600 rounded-lg text-white transition-colors shrink-0">
                        {copied ? <CheckCircle2 className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    </button>
                 </div>
                 <p className="text-[10px] text-slate-500 uppercase">Code: <strong className="text-pink-400">{ambassadorData.referralCode}</strong></p>
              </div>
          </div>
      </div>
      
      {/* HISTORIQUE */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-[#111827] border border-[#1E293B] rounded-3xl p-6">
             <h2 className="text-sm font-black text-white uppercase tracking-widest mb-6">Historique des Ventes</h2>
             <div className="overflow-x-auto">
                 <table className="w-full text-left text-sm text-slate-300">
                    <thead className="text-[10px] uppercase tracking-widest text-slate-500 bg-slate-800/30">
                       <tr>
                          <th className="px-4 py-3 rounded-l-lg">Date</th>
                          <th className="px-4 py-3">Montant</th>
                          <th className="px-4 py-3">Commission</th>
                          <th className="px-4 py-3 rounded-r-lg text-right">Statut</th>
                       </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/50">
                       {sales.length === 0 ? (
                          <tr><td colSpan={4} className="px-4 py-8 text-center text-slate-500">Aucune vente enregistrée.</td></tr>
                       ) : (
                          sales.map(sale => (
                             <tr key={sale.id} className="hover:bg-slate-800/20 transition-colors">
                                <td className="px-4 py-4 whitespace-nowrap">
                                   {sale.createdAt ? format(sale.createdAt.toDate ? sale.createdAt.toDate() : new Date(sale.createdAt), 'dd/MM/yyyy HH:mm') : '-'}
                                </td>
                                <td className="px-4 py-4 text-slate-400">
                                   {sale.amount?.toLocaleString()} F
                                </td>
                                <td className="px-4 py-4 font-bold text-emerald-400">
                                   {sale.commissionAmount?.toLocaleString()} F
                                </td>
                                <td className="px-4 py-4 text-right">
                                   <span className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ${
                                      sale.status === 'available' || sale.status === 'paid' ? 'bg-emerald-500/20 text-emerald-400' : 
                                      sale.status === 'pending' ? 'bg-amber-500/20 text-amber-400' : 
                                      'bg-red-500/20 text-red-400'
                                   }`}>
                                      {sale.status === 'available' ? 'Disponible' : sale.status === 'pending' ? 'En Attente' : sale.status === 'paid' ? 'Payée' : sale.status === 'reversed' ? 'Annulée' : sale.status}
                                   </span>
                                </td>
                             </tr>
                          ))
                       )}
                    </tbody>
                 </table>
             </div>
          </div>
          
          <div className="bg-[#111827] border border-[#1E293B] rounded-3xl p-6">
             <h2 className="text-sm font-black text-white uppercase tracking-widest mb-6 flex items-center gap-2"><CreditCard className="w-4 h-4 text-pink-400"/> Mes Demandes de Retrait</h2>
             <div className="overflow-x-auto">
                 <table className="w-full text-left text-sm text-slate-300">
                    <thead className="text-[10px] uppercase tracking-widest text-slate-500 bg-slate-800/30">
                       <tr>
                          <th className="px-4 py-3 rounded-l-lg">Date</th>
                          <th className="px-4 py-3">Méthode</th>
                          <th className="px-4 py-3">Montant</th>
                          <th className="px-4 py-3 rounded-r-lg text-right">Statut</th>
                       </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/50">
                       {payoutRequests.length === 0 ? (
                          <tr><td colSpan={4} className="px-4 py-8 text-center text-slate-500">Aucun retrait effectué.</td></tr>
                       ) : (
                          payoutRequests.map(req => (
                             <tr key={req.id} className="hover:bg-slate-800/20 transition-colors">
                                <td className="px-4 py-4 whitespace-nowrap">
                                   {req.createdAt ? format(req.createdAt.toDate ? req.createdAt.toDate() : new Date(req.createdAt), 'dd/MM/yyyy HH:mm') : '-'}
                                </td>
                                <td className="px-4 py-4 text-slate-400 capitalize">
                                   {req.method}
                                </td>
                                <td className="px-4 py-4 font-bold text-white">
                                   {req.amount?.toLocaleString()} F
                                </td>
                                <td className="px-4 py-4 text-right">
                                   <span className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ${
                                      req.status === 'paid' ? 'bg-emerald-500/20 text-emerald-400' : 
                                      req.status === 'pending' || req.status === 'processing' ? 'bg-amber-500/20 text-amber-400' : 
                                      'bg-red-500/20 text-red-400'
                                   }`}>
                                      {req.status === 'paid' ? 'Payée' : req.status === 'pending' ? 'En Attente' : req.status === 'processing' ? 'En Traitement' : 'Rejetée'}
                                   </span>
                                </td>
                             </tr>
                          ))
                       )}
                    </tbody>
                 </table>
             </div>
          </div>
      </div>

      {showPayoutModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#0f172a] border border-slate-700/50 rounded-2xl w-full max-w-md p-6 shadow-2xl relative">
             <button onClick={() => setShowPayoutModal(false)} className="absolute top-4 right-4 text-slate-400 hover:text-white">✕</button>
             <h2 className="text-xl font-bold text-white mb-6">Demander un retrait</h2>
             
             <div className="bg-slate-800/30 p-4 rounded-xl mb-6">
                <p className="text-xs text-slate-400">Solde disponible</p>
                <p className="text-2xl font-black text-emerald-400">{(ambassadorData.availableBalance || 0).toLocaleString()} <span className="text-xs font-normal">FCFA</span></p>
             </div>
             
             <form onSubmit={handlePayoutRequest} className="space-y-4">
                <div>
                   <label className="block text-xs font-bold text-slate-400 mb-2 uppercase tracking-widest">Montant à retirer (FCFA)</label>
                   <input 
                      type="number"
                      required
                      min={minWithdrawal}
                      max={ambassadorData.availableBalance || 0}
                      value={payoutAmount}
                      onChange={e => setPayoutAmount(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder:text-slate-600 focus:outline-none focus:border-pink-500"
                      placeholder={`Min. ${minWithdrawal.toLocaleString()}`}
                   />
                </div>
                <div>
                   <label className="block text-xs font-bold text-slate-400 mb-2 uppercase tracking-widest">Méthode de paiement</label>
                   <select 
                      value={payoutMethod}
                      onChange={e => setPayoutMethod(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-pink-500"
                   >
                      <option value="mobile_money">Mobile Money (MTN/Orange)</option>
                      <option value="wave">Wave</option>
                      <option value="bank_transfer">Virement Bancaire</option>
                   </select>
                </div>
                <div>
                   <label className="block text-xs font-bold text-slate-400 mb-2 uppercase tracking-widest">Numéro ou Destination</label>
                   <input 
                      type="text"
                      required
                      value={payoutDestination}
                      onChange={e => setPayoutDestination(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder:text-slate-600 focus:outline-none focus:border-pink-500"
                      placeholder={payoutMethod === 'bank_transfer' ? 'IBAN ou RIB' : 'Ex: +225 0000000000'}
                   />
                </div>
                <div className="pt-4">
                   <button 
                      type="submit"
                      disabled={isRequesting}
                      className="w-full py-3 bg-pink-500 hover:bg-pink-600 text-white font-bold rounded-xl transition-colors flex items-center justify-center disabled:opacity-50"
                   >
                      {isRequesting ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Confirmer le retrait'}
                   </button>
                </div>
             </form>
          </div>
        </div>
      )}
    </div>
  );
}
