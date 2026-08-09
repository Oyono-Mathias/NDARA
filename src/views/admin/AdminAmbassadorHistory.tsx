import React, { useState, useEffect } from 'react';
import { History, UserPlus, ShoppingCart, Wallet, Award, Search, Filter } from 'lucide-react';
import { collection, query, orderBy, limit, onSnapshot } from 'firebase/firestore';
import { db } from '../../firebase';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import clsx from 'clsx';

export function AdminAmbassadorHistory() {
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    // In a real scenario, it's best to have a unified 'affiliate_events' collection.
    // Here we will simulate a unified stream by listening to `affiliate_transactions` and `payout_requests` and merging them.
    // As the prompt asks for real data and no mock:

    const txSub = onSnapshot(query(collection(db, 'affiliate_transactions'), orderBy('createdAt', 'desc'), limit(50)), (snap) => {
      const txs = snap.docs.map(doc => {
        const d = doc.data();
        return {
          id: doc.id,
          date: d.createdAt ? (d.createdAt.toDate ? d.createdAt.toDate() : new Date(d.createdAt)) : new Date(),
          type: 'achat',
          user: d.ambassadorName || d.ambassadorUid || 'Inconnu',
          amount: d.amount || 0,
          commission: d.commission || (d.amount ? d.amount * 0.2 : 0), // fallback calculation
          details: `Achat de produit via lien affilié`,
        };
      });
      
      setHistory(prev => {
        const other = prev.filter(p => p.type !== 'achat');
        return [...other, ...txs].sort((a, b) => b.date.getTime() - a.date.getTime()).slice(0, 50);
      });
      setLoading(false);
    });

    const payoutSub = onSnapshot(query(collection(db, 'payout_requests'), orderBy('createdAt', 'desc'), limit(50)), (snap) => {
      const payouts = snap.docs.map(doc => {
        const d = doc.data();
        return {
          id: doc.id,
          date: d.createdAt ? (d.createdAt.toDate ? d.createdAt.toDate() : new Date(d.createdAt)) : new Date(),
          type: 'retrait',
          user: d.ambassadorName || d.ambassadorId || 'Inconnu',
          amount: d.amount || 0,
          details: `Demande de retrait (${d.status})`,
        };
      });

      setHistory(prev => {
        const other = prev.filter(p => p.type !== 'retrait');
        return [...other, ...payouts].sort((a, b) => b.date.getTime() - a.date.getTime()).slice(0, 50);
      });
    });

    const usersSub = onSnapshot(query(collection(db, 'users'), orderBy('createdAt', 'desc'), limit(50)), (snap) => {
      const signups = snap.docs
        .filter(doc => doc.data().referredBy)
        .map(doc => {
          const d = doc.data();
          return {
            id: doc.id,
            date: d.createdAt ? (d.createdAt.toDate ? d.createdAt.toDate() : new Date(d.createdAt)) : new Date(),
            type: 'inscription',
            user: d.referredBy, // The ambassador who referred
            details: `Nouveau filleul inscrit: ${d.firstName || ''} ${d.lastName || ''}`,
          };
        });

      setHistory(prev => {
        const other = prev.filter(p => p.type !== 'inscription');
        return [...other, ...signups].sort((a, b) => b.date.getTime() - a.date.getTime()).slice(0, 50);
      });
    });

    return () => {
      txSub();
      payoutSub();
      usersSub();
    };
  }, []);

  const getIcon = (type: string) => {
    switch(type) {
      case 'inscription': return <UserPlus className="w-5 h-5 text-blue-400" />;
      case 'achat': return <ShoppingCart className="w-5 h-5 text-emerald-400" />;
      case 'retrait': return <Wallet className="w-5 h-5 text-orange-400" />;
      case 'badge': return <Award className="w-5 h-5 text-purple-400" />;
      default: return <History className="w-5 h-5 text-slate-400" />;
    }
  };

  const filteredHistory = history.filter(h => 
    h.user.toLowerCase().includes(searchTerm.toLowerCase()) || 
    h.details.toLowerCase().includes(searchTerm.toLowerCase()) ||
    h.type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-3xl font-black text-white tracking-tight">Historique Global</h1>
        <p className="text-slate-400 mt-2">Suivez toutes les actions du programme ambassadeur en temps réel.</p>
      </div>

      <div className="flex gap-4">
        <div className="flex-1 relative">
          <Search className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
          <input 
            type="text" 
            placeholder="Rechercher un événement ou ambassadeur..." 
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-12 pr-4 py-3 text-white placeholder-slate-500" 
          />
        </div>
        <button className="px-4 py-3 bg-slate-800 text-slate-300 rounded-xl font-bold flex items-center gap-2 hover:bg-slate-700 transition-colors">
          <Filter className="w-5 h-5" /> Filtrer
        </button>
      </div>

      <div className="space-y-4 relative">
        <div className="absolute top-0 bottom-0 left-8 w-px bg-slate-800 z-0"></div>
        {filteredHistory.map((item) => (
          <div key={item.id} className="relative z-10 flex gap-6 items-start">
            <div className="w-16 h-16 rounded-full bg-slate-900 border-4 border-slate-800 flex items-center justify-center shrink-0">
              {getIcon(item.type)}
            </div>
            <div className="bg-slate-800/50 p-4 rounded-2xl border border-slate-700/50 flex-1 mt-2 hover:bg-slate-800/80 transition-colors">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <span className={clsx(
                    "text-xs font-bold uppercase tracking-wider px-2 py-1 rounded-md mr-3",
                    item.type === 'inscription' ? 'bg-blue-500/20 text-blue-400' :
                    item.type === 'achat' ? 'bg-emerald-500/20 text-emerald-400' :
                    item.type === 'retrait' ? 'bg-orange-500/20 text-orange-400' :
                    'bg-purple-500/20 text-purple-400'
                  )}>
                    {item.type}
                  </span>
                  <span className="font-bold text-white">{item.user}</span>
                </div>
                <span className="text-xs font-medium text-slate-400">
                  {format(item.date, "dd MMM yyyy 'à' HH:mm", { locale: fr })}
                </span>
              </div>
              <p className="text-slate-300 text-sm">{item.details}</p>
              
              {(item.amount || item.commission) ? (
                <div className="mt-3 flex gap-4 pt-3 border-t border-slate-700/50">
                  {item.amount > 0 && (
                    <div>
                      <span className="text-xs text-slate-400 block mb-1">Montant</span>
                      <span className="font-bold text-white">{item.amount.toLocaleString('fr-FR')} FCFA</span>
                    </div>
                  )}
                  {item.commission > 0 && (
                    <div>
                      <span className="text-xs text-slate-400 block mb-1">Commission</span>
                      <span className="font-bold text-emerald-400">+{item.commission.toLocaleString('fr-FR')} FCFA</span>
                    </div>
                  )}
                </div>
              ) : null}
            </div>
          </div>
        ))}

        {filteredHistory.length === 0 && !loading && (
          <div className="text-center py-8 text-slate-500 font-bold relative z-10 bg-slate-900 rounded-xl border border-slate-800">
            Aucun événement enregistré.
          </div>
        )}
      </div>
    </div>
  );
}
