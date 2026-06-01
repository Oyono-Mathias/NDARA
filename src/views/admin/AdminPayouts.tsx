import React, { useState, useEffect } from "react";
import { Banknote, AlertTriangle, ShieldCheck, Download, Clock, Loader2, X, XCircle, CheckCircle2 } from "lucide-react";
import { db } from "../../firebase";
import { collection, query, onSnapshot, doc, updateDoc, orderBy, getDoc } from "firebase/firestore";

export function AdminPayouts() {
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [usersCache, setUsersCache] = useState<Record<string, any>>({});
  const [submitting, setSubmitting] = useState(false);

  // Load all payout requests
  useEffect(() => {
    const q = query(collection(db, "payout_requests"), orderBy("createdAt", "desc"));
    const unsub = onSnapshot(q, async (snap) => {
      const list = snap.docs.map(d => ({ id: d.id, ...d.data() } as any));
      setRequests(list);
      setLoading(false);
      
      // Fetch names of users who requested payouts
      const uidsToFetch = Array.from(new Set(list.map(r => r.instructorId).filter(Boolean)));
      for (const uid of uidsToFetch) {
        if (!usersCache[uid]) {
          const uDoc = await getDoc(doc(db, "users", uid));
          if (uDoc.exists()) {
            setUsersCache(prev => ({ ...prev, [uid]: uDoc.data() }));
          }
        }
      }
    }, (error) => {
      console.error("Error loading payout requests:", error);
      setLoading(false);
    });

    return () => unsub();
  }, [usersCache]);

  const handleUpdateStatus = async (requestId: string, newStatus: "completed" | "rejected" | "pending") => {
    try {
      setSubmitting(true);
      
      const response = await fetch("/api/wallet/approve-payout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          requestId,
          status: newStatus
        })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Échec de l'approbation sécurisée.");
      }

      alert(`Statut de la demande de retrait traité avec succès (${newStatus === 'completed' ? 'Autorisé & transféré' : 'Gelé & recrédité'}).`);
    } catch (err: any) {
      console.error(err);
      alert("Erreur lors de la mise à jour de la demande : " + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const getRequesterName = (uid: string) => {
    return usersCache[uid]?.fullName || usersCache[uid]?.email || uid || "Auteur inconnu";
  };

  const pendingRequests = requests.filter(r => r.status === "pending");
  const historyRequests = requests.filter(r => r.status !== "pending");

  return (
    <div className="space-y-6 animate-in fade-in duration-500 font-mono text-green-500">
      <div className="flex items-center justify-between border-b border-[#10B981]/20 pb-6 mb-6">
         <h1 className="text-2xl font-black text-white tracking-widest uppercase flex items-center gap-3">
            <Banknote className="text-[#10B981] w-6 h-6" /> TRESORERIE_CENTRALE
         </h1>
         {pendingRequests.length > 0 && (
            <div className="text-red-500 text-xs font-bold bg-red-500/10 px-3 py-1 border border-red-500/30 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4" /> {pendingRequests.length} Demande(s) en attente
            </div>
         )}
      </div>

       {/* Pending Request Unit */}
       <div className="space-y-4">
         <h2 className="text-white text-xs font-black uppercase tracking-widest border-b border-white/5 pb-2">Demandes de retraits actives</h2>
         
         {loading ? (
           <div className="p-8 text-center flex flex-col items-center justify-center gap-2">
             <Loader2 className="w-6 h-6 animate-spin text-[#10B981]" />
             <span className="text-[11px] text-gray-500 font-bold uppercase tracking-wider">Lecture des séquestres et ordres de cashout...</span>
           </div>
         ) : pendingRequests.length > 0 ? (
           pendingRequests.map((req) => (
             <div key={req.id} className="bg-[#050505] border border-red-500/30 hover:border-red-500/60 p-6 transition relative overflow-hidden group">
                  <div className="absolute top-0 right-0 p-4">
                      <span className="text-red-500 text-[10px] font-bold tracking-widest uppercase animate-pulse">URGENT_CASH_OUT</span>
                  </div>
                  
                  <h3 className="text-sm font-bold text-white mb-4">Demande de décaissement mobile money</h3>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                       <div>
                           <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-1">Auteur Requête</p>
                           <p className="text-white text-sm font-bold">{getRequesterName(req.instructorId)}</p>
                       </div>
                       <div>
                           <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-1 font-mono">Montant réclamé</p>
                           <p className="text-red-500 text-lg font-black">{(req.amount || 0).toLocaleString()} F</p>
                       </div>
                        <div>
                           <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-1">Canal & Operator</p>
                           <p className="text-white text-xs font-bold uppercase">{req.provider || "XOF"} // {req.method || "Mobile money"}</p>
                       </div>
                        <div>
                           <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-1">Numéro Mobile Money</p>
                           <p className="text-gray-300 text-sm font-mono font-bold">{req.phone || "Non spécifié"}</p>
                       </div>
                  </div>

                  <div className="flex gap-4">
                      <button 
                        disabled={submitting}
                        onClick={() => handleUpdateStatus(req.id, "completed")}
                        className="flex-1 py-3 bg-[#10B981] text-black font-black text-xs uppercase tracking-widest hover:bg-[#10B981]/80 transition flex justify-center items-center gap-2 cursor-pointer"
                      >
                          <ShieldCheck className="w-4 h-4"/> Autoriser & Marquer Payé
                      </button>
                      <button 
                        disabled={submitting}
                        onClick={() => handleUpdateStatus(req.id, "rejected")}
                        className="flex-1 py-3 border border-red-500/30 text-red-500 font-bold text-xs uppercase tracking-widest hover:bg-red-500/10 transition flex justify-center items-center gap-2 cursor-pointer"
                      >
                          <XCircle className="w-4 h-4"/> Rejeter/Geler la demande
                      </button>
                  </div>
             </div>
           ))
         ) : (
           <div className="p-8 text-center border border-dashed border-[#10B981]/20 rounded-md text-gray-600 bg-black/40">
             <ShieldCheck className="w-8 h-8 text-[#10B981]/30 mx-auto mb-2" />
             <p className="text-[11px] font-black uppercase tracking-wider">Aucun ordre de décaissement mobile money en attente pour le moment.</p>
           </div>
         )}
       </div>

       {/* History Unit */}
       <div className="space-y-3 pt-4">
          <h3 className="text-[#10B981] font-bold tracking-widest uppercase text-xs">Historique des Cashouts validés / rejetés</h3>
          <div className="space-y-2">
            {!loading && historyRequests.length > 0 ? (
              historyRequests.map((req) => (
                <div key={req.id} className="p-4 bg-black border border-white/5 flex items-center justify-between hover:border-[#10B981]/20 transition group">
                    <div className="flex gap-8">
                         <div>
                             <p className="text-white font-bold text-sm mb-0.5">{getRequesterName(req.instructorId)}</p>
                             <p className="text-[10px] text-gray-500 uppercase tracking-widest">
                               Numéro: {req.phone || "---"} | {req.createdAt?.seconds ? new Date(req.createdAt.seconds * 1000).toLocaleString() : "Date inconnue"}
                             </p>
                         </div>
                         <div>
                             <p className={`font-bold text-sm mb-0.5 ${req.status === 'completed' ? 'text-[#10B981]' : 'text-red-500 line-through'}`}>
                               {(req.amount || 0).toLocaleString()} F
                             </p>
                             <p className="text-[10px] text-gray-500 uppercase tracking-widest font-mono">
                               Operator : {req.provider || "Standard"} // Solde net
                             </p>
                         </div>
                    </div>
                    <div>
                      <span className={`px-2.5 py-1 text-[9px] font-black uppercase border rounded-xs ${
                        req.status === 'completed' 
                          ? 'border-emerald-500/30 text-emerald-400 bg-emerald-500/10' 
                          : 'border-red-500/30 text-red-500 bg-red-500/10'
                      }`}>
                        {req.status === 'completed' ? 'Payé' : 'Rejeté'}
                      </span>
                    </div>
                </div>
              ))
            ) : !loading ? (
              <div className="p-6 text-center text-gray-600 border border-white/5 rounded-md">
                 Aucun historique d'exécution disponible dans les journaux système.
              </div>
            ) : null}
          </div>
       </div>
    </div>
  );
}
