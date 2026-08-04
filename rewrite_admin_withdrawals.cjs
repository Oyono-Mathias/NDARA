const fs = require('fs');

const code = `import React, { useState, useEffect } from 'react';
import { db } from '../../firebase';
import { collection, query, orderBy, getDocs, where } from 'firebase/firestore';
import { useToast } from '../../hooks/use-toast';
import { Loader2, ArrowDownRight, CheckCircle2, XCircle, Search, DollarSign, Banknote } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

export function AdminWithdrawals() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [requests, setRequests] = useState<any[]>([]);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [processingId, setProcessingId] = useState<string | null>(null);

  useEffect(() => {
    loadRequests();
  }, [filter]);

  const loadRequests = async () => {
    setLoading(true);
    try {
      let q = query(collection(db, 'withdraw_requests'), orderBy('createdAt', 'desc'));
      if (filter !== 'all') {
        q = query(q, where('status', '==', filter));
      }
      const snap = await getDocs(q);
      const docs = snap.docs.map(d => ({ id: d.id, ...d.data() }));

      // Fetch user data
      const userIds = [...new Set(docs.map(d => d.userId))];
      const usersData: any = {};
      
      if (userIds.length > 0) {
        const userChunks = Array.from(userIds).reduce((resultArray: any[], item, index) => { 
          const chunkIndex = Math.floor(index/10);
          if(!resultArray[chunkIndex]) {
            resultArray[chunkIndex] = []; 
          }
          resultArray[chunkIndex].push(item);
          return resultArray;
        }, []);

        for (const chunk of userChunks) {
          const uSnap = await getDocs(query(collection(db, 'users'), where('__name__', 'in', chunk)));
          uSnap.forEach(uDoc => {
            usersData[uDoc.id] = uDoc.data();
          });
        }
      }

      const enriched = docs.map(d => ({ ...d, user: usersData[d.userId] }));
      setRequests(enriched);
    } catch(e: any) {
      console.error(e);
      toast({ title: "Erreur", description: "Impossible de charger les demandes", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (id: string, action: 'approve' | 'pay' | 'reject') => {
    let reason = "";
    if (action === 'reject') {
        const p = window.prompt("Motif du refus (sera envoyé à l'utilisateur) :");
        if (p === null) return;
        reason = p;
    } else {
        if (!window.confirm(\`Êtes-vous sûr de vouloir \${action === 'approve' ? 'approuver' : 'marquer payé'} ce retrait ?\`)) return;
    }
    
    setProcessingId(id);
    try {
      const res = await fetch('/api/withdrawals/admin/action', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': \`Bearer \${await (window as any).firebase.auth().currentUser?.getIdToken()}\`
        },
        body: JSON.stringify({ requestId: id, action, reason })
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error);
      
      toast({ title: "Action réussie", description: \`Le statut a été mis à jour.\` });
      loadRequests();
    } catch(e: any) {
      toast({ title: "Erreur", description: e.message, variant: "destructive" });
    } finally {
      setProcessingId(null);
    }
  };

  const filtered = requests.filter(r => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      (r.user?.displayName || '').toLowerCase().includes(term) ||
      (r.reference || '').toLowerCase().includes(term) ||
      (r.id || '').toLowerCase().includes(term)
    );
  });

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-black text-white uppercase tracking-tight flex items-center gap-3">
          <ArrowDownRight className="text-purple-500 w-8 h-8" />
          Retraits Ambassadeurs
        </h1>
        <p className="text-slate-400">Gérez les demandes de retrait de fonds des ambassadeurs.</p>
      </div>

      <div className="bg-[#111827] border border-[#1E293B] rounded-2xl p-4 flex flex-col lg:flex-row gap-4 items-center justify-between">
        <div className="relative w-full lg:w-96">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
          <input 
            type="text" 
            placeholder="Rechercher nom, ID, Ref..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 rounded-xl py-3 pl-12 pr-4 text-white focus:outline-none focus:border-purple-500/50"
          />
        </div>
        <div className="flex items-center gap-2 bg-slate-900 rounded-xl p-1 border border-slate-800 overflow-x-auto hide-scrollbar shrink-0">
          {['all', 'pending', 'approved', 'paid', 'rejected'].map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={\`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-widest transition-colors whitespace-nowrap \${
                filter === f ? 'bg-purple-500/20 text-purple-400' : 'text-slate-500 hover:text-slate-300'
              }\`}
            >
              {f === 'all' ? 'Tous' : f === 'pending' ? 'En attente' : f === 'approved' ? 'Approuvés' : f === 'paid' ? 'Payés' : 'Rejetés'}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-[#111827] border border-[#1E293B] rounded-3xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[1000px]">
            <thead>
              <tr className="bg-slate-900/50 border-b border-slate-800">
                <th className="p-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Date / Réf</th>
                <th className="p-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Ambassadeur</th>
                <th className="p-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Méthode</th>
                <th className="p-4 text-[10px] font-black text-slate-500 uppercase tracking-widest text-right">Montant</th>
                <th className="p-4 text-[10px] font-black text-slate-500 uppercase tracking-widest text-center">Statut</th>
                <th className="p-4 text-[10px] font-black text-slate-500 uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} className="p-12 text-center">
                    <Loader2 className="w-8 h-8 animate-spin text-purple-500 mx-auto" />
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-12 text-center text-slate-500">
                    Aucune demande trouvée.
                  </td>
                </tr>
              ) : (
                filtered.map((req) => (
                  <tr key={req.id} className="border-b border-slate-800/50 hover:bg-slate-800/30 transition-colors">
                    <td className="p-4">
                      <p className="text-sm text-slate-300">{req.createdAt?.toDate ? format(req.createdAt.toDate(), 'dd/MM/yyyy HH:mm', { locale: fr }) : '-'}</p>
                      <p className="text-[10px] text-slate-500 font-mono">Ref: {req.reference}</p>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <img 
                          src={req.user?.photoURL || \`https://ui-avatars.com/api/?name=\${encodeURIComponent(req.user?.displayName || 'U')}&background=A855F7&color=fff\`}
                          alt=""
                          className="w-8 h-8 rounded-full object-cover bg-slate-800"
                        />
                        <div>
                          <p className="font-bold text-sm text-white">{req.user?.displayName || 'Inconnu'}</p>
                          <p className="text-[10px] text-slate-500">{req.userId}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <p className="text-sm font-bold text-slate-300 uppercase">{req.paymentMethod}</p>
                      <p className="text-[10px] text-slate-400">{req.paymentAccount}</p>
                    </td>
                    <td className="p-4 text-right">
                      <span className="text-sm font-black text-emerald-400">{req.amount?.toLocaleString()} XAF</span>
                    </td>
                    <td className="p-4 text-center">
                      {req.status === 'pending' && <span className="px-2 py-1 bg-amber-500/20 text-amber-400 rounded-lg text-xs font-bold uppercase">En attente</span>}
                      {req.status === 'approved' && <span className="px-2 py-1 bg-blue-500/20 text-blue-400 rounded-lg text-xs font-bold uppercase">Approuvé</span>}
                      {req.status === 'paid' && <span className="px-2 py-1 bg-emerald-500/20 text-emerald-400 rounded-lg text-xs font-bold uppercase">Payé</span>}
                      {req.status === 'rejected' && <span className="px-2 py-1 bg-rose-500/20 text-rose-400 rounded-lg text-xs font-bold uppercase" title={req.reason}>Rejeté</span>}
                    </td>
                    <td className="p-4 text-right space-x-2">
                      {req.status === 'pending' && (
                        <>
                          <button 
                            onClick={() => handleAction(req.id, 'approve')}
                            disabled={processingId === req.id}
                            className="p-2 bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 rounded-lg transition-colors"
                            title="Approuver"
                          >
                            {processingId === req.id ? <Loader2 className="w-5 h-5 animate-spin" /> : <CheckCircle2 className="w-5 h-5" />}
                          </button>
                          <button 
                            onClick={() => handleAction(req.id, 'reject')}
                            disabled={processingId === req.id}
                            className="p-2 bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 rounded-lg transition-colors"
                            title="Rejeter (Rembourser)"
                          >
                            <XCircle className="w-5 h-5" />
                          </button>
                        </>
                      )}
                      {req.status === 'approved' && (
                        <button 
                          onClick={() => handleAction(req.id, 'pay')}
                          disabled={processingId === req.id}
                          className="p-2 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 rounded-lg transition-colors"
                          title="Marquer comme payé"
                        >
                          {processingId === req.id ? <Loader2 className="w-5 h-5 animate-spin" /> : <Banknote className="w-5 h-5" />}
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
`;

fs.writeFileSync('src/views/admin/AdminWithdrawals.tsx', code);
