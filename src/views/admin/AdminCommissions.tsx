import React, { useState, useEffect } from 'react';
import { db } from '../../firebase';
import { doc, getDoc, setDoc, serverTimestamp, collection, query, orderBy, limit, getDocs, where, updateDoc } from 'firebase/firestore';
import { useToast } from '../../hooks/use-toast';
import { Loader2, Save, Percent, History, Users, RefreshCw, DollarSign, CheckCircle2, XCircle, Search, FileText } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

export function AdminCommissions() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [commissions, setCommissions] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    loadCommissions();
  }, [filterStatus]);

  const loadCommissions = async () => {
    setLoading(true);
    try {
      let q = query(collection(db, 'affiliate_transactions'), orderBy('createdAt', 'desc'));
      
      if (filterStatus !== 'all') {
        q = query(q, where('status', '==', filterStatus));
      }

      const snap = await getDocs(q);
      const coms: any[] = [];
      const userIds = new Set<string>();

      snap.forEach((d) => {
        const data = d.data();
        data.id = d.id;
        coms.push(data);
        if (data.ambassadorId) userIds.add(data.ambassadorId);
        if (data.buyerId) userIds.add(data.buyerId);
      });

      // Fetch user details
      const usersData: Record<string, any> = {};
      if (userIds.size > 0) {
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

      coms.forEach(c => {
        if (c.ambassadorId) c.ambassador = usersData[c.ambassadorId];
        if (c.buyerId) c.buyer = usersData[c.buyerId];
      });

      setCommissions(coms);
    } catch (e) {
      console.error(e instanceof Error ? e.message : String(e));
      toast({ title: "Erreur", description: "Impossible de charger les commissions.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (commission: any, action: 'validate' | 'pay' | 'cancel') => {
    if (!window.confirm(`Êtes-vous sûr de vouloir ${action === 'validate' ? 'valider' : action === 'pay' ? 'marquer comme payée' : 'annuler'} cette commission ?`)) return;
    setActionLoading(commission.id);
    try {
      const response = await fetch('/api/ambassador/admin/commission-action', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${await (window as any).firebase.auth().currentUser?.getIdToken()}`
        },
        body: JSON.stringify({ commissionId: commission.id, action })
      });
      const data = await response.json();
      if (response.ok && data.success) {
        toast({ title: "Succès", description: "L'action a été effectuée." });
        loadCommissions();
      } else {
        toast({ title: "Erreur", description: data.error || "Action impossible", variant: "destructive" });
      }
    } catch(e) {
      toast({ title: "Erreur", description: "Erreur serveur", variant: "destructive" });
    } finally {
      setActionLoading(null);
    }
  };

  const filteredCommissions = commissions.filter(comm => {
    if (!searchTerm) return true;
    const lower = searchTerm.toLowerCase();
    return (
      (comm.ambassador?.displayName?.toLowerCase() || '').includes(lower) ||
      (comm.buyer?.displayName?.toLowerCase() || '').includes(lower) ||
      (comm.courseId?.toLowerCase() || '').includes(lower) ||
      (comm.id?.toLowerCase() || '').includes(lower)
    );
  });

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-black text-white uppercase tracking-tight flex items-center gap-3">
          <Percent className="text-emerald-500 w-8 h-8" />
          Toutes les Commissions
        </h1>
        <p className="text-slate-400">Gérez les commissions d'affiliation des ambassadeurs.</p>
      </div>

      <div className="bg-[#111827] border border-[#1E293B] rounded-2xl p-4 flex flex-col lg:flex-row gap-4 items-center justify-between">
        <div className="relative w-full lg:w-96">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
          <input 
            type="text" 
            placeholder="Rechercher ambassadeur, produit, ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 rounded-xl py-3 pl-12 pr-4 text-white focus:outline-none focus:border-emerald-500/50"
          />
        </div>
        <div className="flex items-center gap-2 bg-slate-900 rounded-xl p-1 border border-slate-800 shrink-0 overflow-x-auto hide-scrollbar">
          {['all', 'pending', 'validated', 'paid', 'cancelled', 'refunded'].map(f => (
            <button
              key={f}
              onClick={() => setFilterStatus(f)}
              className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-widest transition-colors whitespace-nowrap ${
                filterStatus === f ? "bg-emerald-500/20 text-emerald-400" : "text-slate-500 hover:text-slate-300 hover:bg-slate-800"
              }`}
            >
              {f === 'all' ? 'Toutes' : f}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-[#111827] border border-[#1E293B] rounded-3xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[1000px]">
            <thead>
              <tr className="bg-slate-900/50 border-b border-slate-800">
                <th className="p-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Date / ID</th>
                <th className="p-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Ambassadeur</th>
                <th className="p-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Filleul / Produit</th>
                <th className="p-4 text-[10px] font-black text-slate-500 uppercase tracking-widest text-right">Achat / Comm.</th>
                <th className="p-4 text-[10px] font-black text-slate-500 uppercase tracking-widest text-center">Statut</th>
                <th className="p-4 text-[10px] font-black text-slate-500 uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} className="p-12 text-center">
                    <Loader2 className="w-8 h-8 animate-spin text-emerald-500 mx-auto" />
                  </td>
                </tr>
              ) : filteredCommissions.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-12 text-center text-slate-500">
                    Aucune commission trouvée.
                  </td>
                </tr>
              ) : (
                filteredCommissions.map((comm) => (
                  <tr key={comm.id} className="border-b border-slate-800/50 hover:bg-slate-800/30 transition-colors">
                    <td className="p-4">
                      <p className="text-sm font-bold text-white">{comm.createdAt?.toDate ? format(comm.createdAt.toDate(), 'dd/MM/yyyy HH:mm', { locale: fr }) : '-'}</p>
                      <p className="text-[10px] text-slate-500 font-mono">ID: {comm.id}</p>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <img 
                          src={comm.ambassador?.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(comm.ambassador?.displayName || 'U')}&background=0D9488&color=fff`}
                          alt="" className="w-8 h-8 rounded-full bg-slate-800"
                        />
                        <div>
                          <p className="text-sm font-bold text-white">{comm.ambassador?.displayName}</p>
                          <p className="text-xs text-slate-400">{comm.ambassador?.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <p className="text-sm font-bold text-white">{comm.buyer?.displayName || 'Inconnu'}</p>
                      <p className="text-xs text-emerald-400">{comm.courseId}</p>
                    </td>
                    <td className="p-4 text-right">
                      <p className="text-xs text-slate-400 line-through">{comm.amount?.toLocaleString()} XAF</p>
                      <p className="text-sm font-black text-emerald-400">+{comm.commission?.toLocaleString()} XAF</p>
                    </td>
                    <td className="p-4 text-center">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold ${
                        comm.status === 'validated' ? 'bg-emerald-500/10 text-emerald-500' :
                        comm.status === 'pending' ? 'bg-amber-500/10 text-amber-500' :
                        comm.status === 'paid' ? 'bg-blue-500/10 text-blue-500' :
                        'bg-rose-500/10 text-rose-500'
                      }`}>
                        {comm.status.toUpperCase()}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex justify-end gap-2">
                        {comm.status === 'pending' && (
                          <button onClick={() => handleAction(comm, 'validate')} disabled={actionLoading === comm.id} className="p-2 bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500 hover:text-slate-900 rounded-lg transition-colors">
                            {actionLoading === comm.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                          </button>
                        )}
                        {comm.status === 'validated' && (
                          <button onClick={() => handleAction(comm, 'pay')} disabled={actionLoading === comm.id} className="p-2 bg-blue-500/10 text-blue-500 hover:bg-blue-500 hover:text-white rounded-lg transition-colors">
                            {actionLoading === comm.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <DollarSign className="w-4 h-4" />}
                          </button>
                        )}
                        {(comm.status === 'pending' || comm.status === 'validated') && (
                          <button onClick={() => handleAction(comm, 'cancel')} disabled={actionLoading === comm.id} className="p-2 bg-rose-500/10 text-rose-500 hover:bg-rose-500 hover:text-white rounded-lg transition-colors">
                            {actionLoading === comm.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <XCircle className="w-4 h-4" />}
                          </button>
                        )}
                      </div>
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
