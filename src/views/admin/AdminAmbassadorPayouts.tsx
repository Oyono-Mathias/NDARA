import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { db } from '../../firebase';
import { collection, query, orderBy, onSnapshot, doc, getDoc, where } from 'firebase/firestore';
import { useToast } from '../../hooks/use-toast';
import { Loader2, Check, X, CreditCard, Banknote, Search, Filter } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

export function AdminAmbassadorPayouts() {
  const { firebaseUser } = useAuth();
  const { toast } = useToast();
  
  const [loading, setLoading] = useState(true);
  const [requests, setRequests] = useState<any[]>([]);
  const [filter, setFilter] = useState('pending');
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [showPayModal, setShowPayModal] = useState(false);
  const [selectedReq, setSelectedReq] = useState<any>(null);
  
  const [rejectionReason, setRejectionReason] = useState('');
  const [paymentReference, setPaymentReference] = useState('');

  useEffect(() => {
    if (!firebaseUser) return;
    
    // Fetch payout requests specifically for ambassadors
    // Note: We'll just fetch all and filter client side if needed, or query by type
    const q = query(
      collection(db, 'payout_requests'), 
      where('type', '==', 'ambassador_payout'),
      orderBy('createdAt', 'desc')
    );
    
    const unsub = onSnapshot(q, async (snap) => {
       const reqs = snap.docs.map(d => ({ id: d.id, ...d.data() }));
       
       // Populate ambassador names
       const populated = await Promise.all(reqs.map(async (r: any) => {
          if (!r.ambassadorName && r.ambassadorId) {
             const uSnap = await getDoc(doc(db, 'users', r.ambassadorId));
             if (uSnap.exists()) {
                r.ambassadorName = uSnap.data().displayName || uSnap.data().email;
             }
          }
          return r;
       }));
       
       setRequests(populated);
       setLoading(false);
    });
    
    return () => unsub();
  }, [firebaseUser]);

  const handleProcess = async (action: 'approve' | 'reject' | 'mark_paid') => {
    if (!selectedReq) return;
    try {
       setProcessingId(selectedReq.id);
       const token = await firebaseUser?.getIdToken();
       const response = await fetch('/api/ambassador/payout/process', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            requestId: selectedReq.id,
            action,
            paymentReference: action === 'mark_paid' ? paymentReference : undefined,
            rejectionReason: action === 'reject' ? rejectionReason : undefined
          })
       });
       
       if (!response.ok) {
          const err = await response.json();
          throw new Error(err.error || 'Erreur');
       }
       
       toast({ title: "Succès", description: "La demande a été mise à jour." });
       setShowPayModal(false);
       setShowRejectModal(false);
       setPaymentReference('');
       setRejectionReason('');
    } catch (error: any) {
       toast({ title: "Erreur", description: error.message, variant: "destructive" });
    } finally {
       setProcessingId(null);
       setSelectedReq(null);
    }
  };

  const filteredReqs = requests.filter(r => filter === 'all' || (filter === 'pending' ? r.status === 'pending' || r.status === 'approved' : r.status === filter));

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center p-8">
        <Loader2 className="w-8 h-8 animate-spin text-pink-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-black text-white tracking-tight flex items-center gap-3">
          <Banknote className="w-8 h-8 text-pink-500" />
          Retraits Ambassadeurs
        </h1>
        <p className="text-slate-400 mt-2">Gérez les demandes de paiement de commissions.</p>
      </div>
      
      <div className="flex items-center gap-2">
         {['pending', 'paid', 'rejected', 'all'].map(f => (
            <button
               key={f}
               onClick={() => setFilter(f)}
               className={`px-4 py-2 rounded-xl text-sm font-bold transition-colors ${filter === f ? 'bg-pink-500 text-white' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}
            >
               {f === 'pending' ? 'En Attente' : f === 'paid' ? 'Payés' : f === 'rejected' ? 'Rejetés' : 'Tous'}
            </button>
         ))}
      </div>

      <div className="bg-[#111827] border border-[#1E293B] rounded-3xl overflow-hidden">
        <table className="w-full text-left text-sm text-slate-300">
           <thead className="bg-slate-800/50 text-[10px] uppercase tracking-widest text-slate-500">
              <tr>
                 <th className="px-6 py-4">Ambassadeur</th>
                 <th className="px-6 py-4">Date</th>
                 <th className="px-6 py-4">Méthode & Dest.</th>
                 <th className="px-6 py-4">Montant</th>
                 <th className="px-6 py-4">Statut</th>
                 <th className="px-6 py-4 text-right">Actions</th>
              </tr>
           </thead>
           <tbody className="divide-y divide-slate-800/50">
              {filteredReqs.length === 0 ? (
                 <tr><td colSpan={6} className="px-6 py-12 text-center text-slate-500">Aucune demande trouvée.</td></tr>
              ) : filteredReqs.map((req) => (
                 <tr key={req.id} className="hover:bg-slate-800/20 transition-colors">
                    <td className="px-6 py-4 font-bold text-white">
                       {req.ambassadorName || req.ambassadorId.slice(0,8)+'...'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-slate-400">
                       {req.createdAt ? format(req.createdAt.toDate ? req.createdAt.toDate() : new Date(req.createdAt), 'dd MMM yyyy HH:mm', {locale: fr}) : '-'}
                    </td>
                    <td className="px-6 py-4">
                       <span className="capitalize text-pink-400 font-bold">{req.method}</span>
                       <br/>
                       <span className="text-xs text-slate-400 font-mono">{req.destination}</span>
                    </td>
                    <td className="px-6 py-4 font-black text-emerald-400 text-lg">
                       {req.amount?.toLocaleString()} F
                    </td>
                    <td className="px-6 py-4">
                       <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          req.status === 'paid' ? 'bg-emerald-500/20 text-emerald-400' :
                          (req.status === 'pending' || req.status === 'approved') ? 'bg-amber-500/20 text-amber-400' :
                          'bg-red-500/20 text-red-400'
                       }`}>
                          {req.status === 'paid' ? 'Payée' : req.status === 'approved' ? 'Approuvée' : req.status === 'pending' ? 'En Attente' : 'Rejetée'}
                       </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                       {(req.status === 'pending' || req.status === 'approved') && (
                          <div className="flex items-center justify-end gap-2">
                             <button 
                                onClick={() => { setSelectedReq(req); setShowPayModal(true); }}
                                className="p-2 bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500 hover:text-white rounded-lg transition-colors"
                                title="Marquer comme payé"
                             >
                                <Check className="w-4 h-4" />
                             </button>
                             <button 
                                onClick={() => { setSelectedReq(req); setShowRejectModal(true); }}
                                className="p-2 bg-red-500/20 text-red-400 hover:bg-red-500 hover:text-white rounded-lg transition-colors"
                                title="Rejeter"
                             >
                                <X className="w-4 h-4" />
                             </button>
                          </div>
                       )}
                    </td>
                 </tr>
              ))}
           </tbody>
        </table>
      </div>
      
      {/* Reject Modal */}
      {showRejectModal && (
         <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
           <div className="bg-[#0f172a] border border-slate-700/50 rounded-2xl w-full max-w-md p-6 shadow-2xl relative">
              <button onClick={() => setShowRejectModal(false)} className="absolute top-4 right-4 text-slate-400 hover:text-white">✕</button>
              <h2 className="text-xl font-bold text-white mb-6">Rejeter la demande</h2>
              <div className="space-y-4">
                 <div>
                    <label className="block text-xs font-bold text-slate-400 mb-2 uppercase">Motif du rejet</label>
                    <textarea 
                       required
                       value={rejectionReason}
                       onChange={e => setRejectionReason(e.target.value)}
                       className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white focus:border-red-500 outline-none"
                       placeholder="Ex: Coordonnées incorrectes..."
                    />
                 </div>
                 <button 
                    onClick={() => handleProcess('reject')}
                    disabled={!rejectionReason || processingId === selectedReq?.id}
                    className="w-full py-3 bg-red-500 hover:bg-red-600 text-white font-bold rounded-xl flex justify-center disabled:opacity-50"
                 >
                    {processingId === selectedReq?.id ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Confirmer le Rejet'}
                 </button>
              </div>
           </div>
         </div>
      )}
      
      {/* Pay Modal */}
      {showPayModal && (
         <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
           <div className="bg-[#0f172a] border border-slate-700/50 rounded-2xl w-full max-w-md p-6 shadow-2xl relative">
              <button onClick={() => setShowPayModal(false)} className="absolute top-4 right-4 text-slate-400 hover:text-white">✕</button>
              <h2 className="text-xl font-bold text-white mb-6">Marquer comme Payée</h2>
              <div className="space-y-4">
                 <div className="bg-emerald-500/10 p-4 rounded-xl border border-emerald-500/20 text-emerald-400 mb-4">
                    Assurez-vous d'avoir bien effectué le transfert de <strong className="text-emerald-300">{selectedReq?.amount?.toLocaleString()} FCFA</strong> vers {selectedReq?.method} ({selectedReq?.destination}) avant de confirmer.
                 </div>
                 <div>
                    <label className="block text-xs font-bold text-slate-400 mb-2 uppercase">Référence de Transaction (Optionnel)</label>
                    <input 
                       type="text"
                       value={paymentReference}
                       onChange={e => setPaymentReference(e.target.value)}
                       className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white focus:border-emerald-500 outline-none"
                       placeholder="Ex: TXN_123456789"
                    />
                 </div>
                 <button 
                    onClick={() => handleProcess('mark_paid')}
                    disabled={processingId === selectedReq?.id}
                    className="w-full py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-xl flex justify-center disabled:opacity-50"
                 >
                    {processingId === selectedReq?.id ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Confirmer le Paiement'}
                 </button>
              </div>
           </div>
         </div>
      )}
    </div>
  );
}
