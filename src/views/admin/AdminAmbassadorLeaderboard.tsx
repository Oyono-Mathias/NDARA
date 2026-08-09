import React, { useState, useEffect } from 'react';
import { Trophy, Medal, Search, Filter } from 'lucide-react';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '../../firebase';
import clsx from 'clsx';

export function AdminAmbassadorLeaderboard() {
  const [leaders, setLeaders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    // In a real leaderboard without a heavy aggregation pipeline, we fetch all ambassadors and sort in memory if the amount is reasonable,
    // or we query a pre-aggregated collection. Let's assume we query the 'ambassadors' collection directly which stores their sales/commissions.
    // We'll calculate rank in memory to be dynamic.
    const q = query(collection(db, 'ambassadors'), orderBy('totalSales', 'desc'));
    const unsub = onSnapshot(q, (snap) => {
      const data = snap.docs.map((doc, index) => {
        const d = doc.data();
        return {
          id: doc.id,
          name: d.name || 'Inconnu',
          country: d.country || 'Non renseigné',
          sales: d.totalSales || 0,
          revenue: d.totalRevenue || 0,
          commission: d.totalCommissions || 0,
          rank: index + 1,
          badge: d.badge || 'Débutant',
        };
      });
      setLeaders(data);
      setLoading(false);
    });

    return () => unsub();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-black text-white tracking-tight">Leaderboard</h1>
        <p className="text-slate-400 mt-2">Classement des meilleurs ambassadeurs NDARA (Temps réel).</p>
      </div>

      <div className="flex gap-2 mb-6">
        {['all', 'Cameroun', 'Sénégal', "Côte d'Ivoire", 'Mois', 'Année'].map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={clsx(
              "px-4 py-2 rounded-xl text-sm font-bold transition-colors",
              filter === f ? "bg-emerald-500 text-white" : "bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white"
            )}
          >
            {f === 'all' ? 'Top 100 Global' : f.startsWith('Top') ? f : `Top ${f}`}
          </button>
        ))}
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-800/50">
                <th className="p-4 text-xs font-bold text-slate-400 uppercase tracking-wider w-16 text-center">Rang</th>
                <th className="p-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Ambassadeur</th>
                <th className="p-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Pays</th>
                <th className="p-4 text-xs font-bold text-slate-400 uppercase tracking-wider text-center">Ventes</th>
                <th className="p-4 text-xs font-bold text-slate-400 uppercase tracking-wider text-right">CA Généré (FCFA)</th>
                <th className="p-4 text-xs font-bold text-slate-400 uppercase tracking-wider text-right">Commission (FCFA)</th>
                <th className="p-4 text-xs font-bold text-slate-400 uppercase tracking-wider text-center">Badge</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50">
              {leaders.filter(l => filter === 'all' || l.country === filter || filter === 'Mois' || filter === 'Année').map((leader) => (
                <tr key={leader.id} className="hover:bg-slate-800/20 transition-colors">
                  <td className="p-4 text-center">
                    {leader.rank === 1 ? <Medal className="w-6 h-6 text-yellow-400 mx-auto" /> :
                     leader.rank === 2 ? <Medal className="w-6 h-6 text-slate-300 mx-auto" /> :
                     leader.rank === 3 ? <Medal className="w-6 h-6 text-amber-600 mx-auto" /> :
                     <span className="font-bold text-slate-500">{leader.rank}</span>}
                  </td>
                  <td className="p-4 font-bold text-white">{leader.name}</td>
                  <td className="p-4 text-slate-300">{leader.country}</td>
                  <td className="p-4 text-center font-bold text-emerald-400">{leader.sales}</td>
                  <td className="p-4 text-right font-medium text-slate-300">{leader.revenue.toLocaleString('fr-FR')}</td>
                  <td className="p-4 text-right font-bold text-white">{leader.commission.toLocaleString('fr-FR')}</td>
                  <td className="p-4 text-center">
                    <span className={clsx(
                      "px-3 py-1 text-xs font-bold rounded-full uppercase tracking-wider",
                      leader.badge === 'Diamant' ? 'bg-cyan-500/20 text-cyan-400' :
                      leader.badge === 'Platine' ? 'bg-slate-300/20 text-slate-300' :
                      leader.badge === 'Or' ? 'bg-yellow-500/20 text-yellow-400' :
                      leader.badge === 'Argent' ? 'bg-slate-400/20 text-slate-400' :
                      'bg-orange-500/20 text-orange-400'
                    )}>
                      {leader.badge}
                    </span>
                  </td>
                </tr>
              ))}
              {leaders.length === 0 && !loading && (
                 <tr>
                    <td colSpan={7} className="p-8 text-center text-slate-500 font-bold">Aucun ambassadeur trouvé.</td>
                 </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
