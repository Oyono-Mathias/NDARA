import React, { useState, useEffect } from 'react';
import { db } from '../../firebase';
import { collection, query, orderBy, getDocs, updateDoc, doc, getDoc } from 'firebase/firestore';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../hooks/use-toast';
import { ShieldCheck, CheckCircle, XCircle, Search, Clock, ExternalLink } from 'lucide-react';
import { AdminKycReviewModal } from './AdminKycReviewModal';

export function AdminKycRequests() {
  const { firebaseUser } = useAuth();
  const { toast } = useToast();
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState<any | null>(null);

  useEffect(() => {
    loadRequests();
  }, []);

  const loadRequests = async () => {
    try {
      setLoading(true);
      const q = query(collection(db, 'kyc_requests'), orderBy('submittedAt', 'desc'));
      const snap = await getDocs(q);
      
      const reqs = await Promise.all(snap.docs.map(async (docSnapshot) => {
        const data = docSnapshot.data();
        let userName = 'Inconnu';
        let userEmail = '';
        
        try {
          const userDoc = await getDoc(doc(db, 'users', data.userId));
          if (userDoc.exists()) {
             userName = userDoc.data().name || userDoc.data().displayName || 'Inconnu';
             userEmail = userDoc.data().email || '';
          }
        } catch (e) {}

        return {
          id: docSnapshot.id,
          ...data,
          userName,
          userEmail
        };
      }));

      setRequests(reqs);
    } catch (error) {
      console.error('Error loading KYC requests:', error);
      toast({ title: 'Erreur', description: 'Impossible de charger les demandes KYC', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const pendingRequests = requests.filter(r => r.status === 'pending');
  const processedRequests = requests.filter(r => r.status !== 'pending');

  if (loading) {
    return <div className="p-8 flex justify-center"><div className="animate-spin w-8 h-8 border-4 border-pink-500 border-t-transparent rounded-full" /></div>;
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div>
        <h1 className="text-3xl font-black text-white tracking-tight flex items-center gap-3">
          <ShieldCheck className="w-8 h-8 text-pink-500" />
          Vérifications d'Identité (KYC)
        </h1>
        <p className="text-slate-400 mt-2">Gérez les demandes de vérification d'identité des ambassadeurs et instructeurs.</p>
      </div>

      <div className="bg-slate-800/50 rounded-2xl border border-slate-700/50 overflow-hidden">
        <div className="p-4 border-b border-slate-700/50 bg-slate-800">
           <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Clock className="w-5 h-5 text-yellow-500" />
              Demandes en attente ({pendingRequests.length})
           </h2>
        </div>
        <div className="divide-y divide-slate-700/50">
          {pendingRequests.length === 0 ? (
             <div className="p-8 text-center text-slate-400">Aucune demande en attente.</div>
          ) : (
            pendingRequests.map(req => (
              <div key={req.id} className="p-4 hover:bg-slate-700/20 transition-colors flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-white">{req.userName}</h3>
                  <p className="text-sm text-slate-400">{req.userEmail}</p>
                  <p className="text-xs text-slate-500 mt-1 uppercase tracking-widest font-bold">
                    Document: {req.idType === 'cni' ? 'Carte d\'identité' : 'Passeport'}
                  </p>
                </div>
                <div>
                   <button
                     onClick={() => setSelectedRequest(req)}
                     className="px-4 py-2 bg-pink-500 hover:bg-pink-400 text-white font-bold rounded-xl text-sm transition-all shadow-lg shadow-pink-500/25"
                   >
                     Examiner
                   </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="bg-slate-800/50 rounded-2xl border border-slate-700/50 overflow-hidden">
        <div className="p-4 border-b border-slate-700/50 bg-slate-800">
           <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-emerald-500" />
              Historique des vérifications
           </h2>
        </div>
        <div className="divide-y divide-slate-700/50">
          {processedRequests.length === 0 ? (
             <div className="p-8 text-center text-slate-400">Aucun historique.</div>
          ) : (
            processedRequests.map(req => (
              <div key={req.id} className="p-4 flex items-center justify-between opacity-75">
                <div>
                  <h3 className="font-bold text-white">{req.userName}</h3>
                  <p className="text-sm text-slate-400">{req.userEmail}</p>
                </div>
                <div>
                   {req.status === 'approved' ? (
                     <span className="px-3 py-1 bg-emerald-500/10 text-emerald-400 font-bold rounded-full text-xs flex items-center gap-1">
                       <CheckCircle className="w-4 h-4" /> Approuvé
                     </span>
                   ) : (
                     <span className="px-3 py-1 bg-red-500/10 text-red-400 font-bold rounded-full text-xs flex items-center gap-1">
                       <XCircle className="w-4 h-4" /> Rejeté
                     </span>
                   )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {selectedRequest && (
        <AdminKycReviewModal 
          request={selectedRequest} 
          onClose={() => setSelectedRequest(null)} 
          onProcessed={() => {
            setSelectedRequest(null);
            loadRequests();
          }}
        />
      )}
    </div>
  );
}
