import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { db } from '../../firebase';
import { collection, doc, getDoc, getDocs, query, where, orderBy } from 'firebase/firestore';
import { Medal, Trophy, Target, Star, Gift, CheckCircle2, ChevronRight, Loader2, ArrowRight } from 'lucide-react';
import clsx from 'clsx';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { CSVLink } from "react-csv";
import { Download } from "lucide-react";

export function AmbassadorRewards() {
  const { firebaseUser } = useAuth();
  const [loading, setLoading] = useState(true);
  
  const [stats, setStats] = useState<any>({});
  const [levels, setLevels] = useState<any[]>([]);
  const [badges, setBadges] = useState<any[]>([]);
  const [challenges, setChallenges] = useState<any[]>([]);
  const [rewards, setRewards] = useState<any[]>([]);

  useEffect(() => {
    if (!firebaseUser) return;
    loadData();
  }, [firebaseUser]);

  const loadData = async () => {
    setLoading(true);
    try {
      // Affiliates stats contains the current user state for gamification
      const statRef = doc(db, 'affiliate_statistics', firebaseUser!.uid);
      const statDoc = await getDoc(statRef);
      const userStats = statDoc.exists() ? statDoc.data() : {
          level: 'bronze', totalSalesCount: 0, totalSalesVolume: 0, totalReferrals: 0, badges: [], challenges: []
      };
      setStats(userStats);

      // Fetch all levels
      const lSnap = await getDocs(query(collection(db, 'affiliate_levels'), orderBy('minSalesAmount', 'asc')));
      setLevels(lSnap.docs.map(d => ({ id: d.id, ...d.data() })));

      // Fetch all badges
      const bSnap = await getDocs(collection(db, 'affiliate_badges'));
      setBadges(bSnap.docs.map(d => ({ id: d.id, ...d.data() })));

      // Fetch all challenges/goals
      const cSnap = await getDocs(collection(db, 'affiliate_challenges'));
      setChallenges(cSnap.docs.map(d => ({ id: d.id, ...d.data() })));

      // Fetch reward history
      const rSnap = await getDocs(query(
          collection(db, 'affiliate_rewards'), 
          where('userId', '==', firebaseUser!.uid),
          orderBy('date', 'desc')
      ));
      setRewards(rSnap.docs.map(d => ({ id: d.id, ...d.data() })));

    } catch(e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const currentLevelIndex = levels.findIndex(l => l.id === stats.level);
  const currentLevel = levels[currentLevelIndex] || levels[0];
  const nextLevel = levels[currentLevelIndex + 1];

  let progressToNext = 100;
  if (nextLevel) {
     const salesProgress = Math.min(100, ((stats.totalSalesCount || 0) / (nextLevel.minSalesCount || 1)) * 100);
     const volumeProgress = Math.min(100, ((stats.totalSalesVolume || 0) / (nextLevel.minSalesAmount || 1)) * 100);
     const refsProgress = Math.min(100, ((stats.totalReferrals || 0) / (nextLevel.minReferrals || 1)) * 100);
     progressToNext = Math.min(salesProgress, volumeProgress, refsProgress);
  }

  const exportData = rewards.map(r => ({
      "Date": r.date?.toDate ? format(r.date.toDate(), 'dd/MM/yyyy HH:mm') : '',
      "Titre": r.titre || r.description,
      "Montant": r.montant,
      "Type": r.type
  }));

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-8 pb-32">
      <div>
        <h1 className="text-3xl font-black text-white uppercase tracking-tight flex items-center gap-3">
          <Gift className="text-pink-500 w-8 h-8" />
          Récompenses & Gamification
        </h1>
        <p className="text-slate-400">Suivez votre progression, débloquez des badges et gagnez des bonus.</p>
      </div>

      {loading ? (
        <div className="flex justify-center p-20"><Loader2 className="w-10 h-10 animate-spin text-pink-500" /></div>
      ) : (
        <>
          {/* LEVEL PROGRESSION */}
          <div className="bg-[#111827] border border-[#1E293B] rounded-3xl p-6 lg:p-8 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none">
                <Trophy className="w-48 h-48" />
            </div>
            
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 relative z-10 mb-8">
                <div>
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Niveau Actuel</p>
                    <div className="flex items-end gap-4">
                        <h2 className="text-4xl md:text-5xl font-black text-white uppercase tracking-tighter">{currentLevel?.name || 'Bronze'}</h2>
                        {nextLevel && (
                            <div className="flex items-center gap-2 text-slate-400 mb-2">
                                <ArrowRight className="w-4 h-4" />
                                <span className="text-sm font-bold">Prochain: {nextLevel.name}</span>
                            </div>
                        )}
                    </div>
                </div>
                {nextLevel && (
                    <div className="text-right">
                        <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Progression globale</p>
                        <p className="text-2xl font-black text-pink-400">{Math.floor(progressToNext)}%</p>
                    </div>
                )}
            </div>

            {nextLevel && (
                <div className="space-y-4">
                    <div className="h-4 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
                        <div className="h-full bg-gradient-to-r from-pink-500 to-purple-500 rounded-full" style={{ width: `${progressToNext}%` }} />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                        <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-800">
                            <p className="text-slate-400 text-xs font-bold uppercase mb-1">Ventes Requises</p>
                            <p className="text-white font-black">{stats.totalSalesCount || 0} / {nextLevel.minSalesCount}</p>
                        </div>
                        <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-800">
                            <p className="text-slate-400 text-xs font-bold uppercase mb-1">CA Requis</p>
                            <p className="text-white font-black">{(stats.totalSalesVolume || 0).toLocaleString()} / {nextLevel.minSalesAmount?.toLocaleString()} XAF</p>
                        </div>
                        <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-800">
                            <p className="text-slate-400 text-xs font-bold uppercase mb-1">Filleuls Requis</p>
                            <p className="text-white font-black">{stats.totalReferrals || 0} / {nextLevel.minReferrals || 0}</p>
                        </div>
                    </div>
                </div>
            )}
            {!nextLevel && (
                <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-400 font-bold flex items-center gap-2">
                    <Trophy className="w-5 h-5" />
                    Vous avez atteint le niveau maximum. Félicitations !
                </div>
            )}
          </div>

          {/* BADGES & CHALLENGES */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* BADGES */}
              <div className="bg-[#111827] border border-[#1E293B] rounded-3xl p-6">
                 <h2 className="text-sm font-black text-white uppercase tracking-widest mb-6 flex items-center gap-2">
                   <Medal className="w-4 h-4 text-amber-400" /> Mes Badges
                 </h2>
                 <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                     {badges.map(b => {
                         const earned = (stats.badges || []).includes(b.id);
                         return (
                             <div key={b.id} className={`p-4 rounded-2xl border flex flex-col items-center text-center gap-2 transition-all ${earned ? 'bg-amber-500/10 border-amber-500/30' : 'bg-slate-900 border-slate-800 opacity-50 grayscale'}`}>
                                 <div className={`w-12 h-12 rounded-full flex items-center justify-center ${earned ? 'bg-amber-500 text-white' : 'bg-slate-800 text-slate-500'}`}>
                                     <Star className="w-6 h-6" />
                                 </div>
                                 <p className={`text-xs font-bold uppercase tracking-wide ${earned ? 'text-amber-400' : 'text-slate-500'}`}>{b.name}</p>
                                 <p className="text-[10px] text-slate-400 leading-tight">{b.description}</p>
                                 {b.bonusAmount > 0 && <span className="text-[9px] font-black bg-slate-800 px-2 py-1 rounded text-emerald-400">+{b.bonusAmount} XAF</span>}
                             </div>
                         )
                     })}
                     {badges.length === 0 && <p className="text-slate-500 text-sm col-span-3">Aucun badge configuré.</p>}
                 </div>
              </div>

              {/* CHALLENGES */}
              <div className="bg-[#111827] border border-[#1E293B] rounded-3xl p-6">
                 <h2 className="text-sm font-black text-white uppercase tracking-widest mb-6 flex items-center gap-2">
                   <Target className="w-4 h-4 text-blue-400" /> Défis & Objectifs
                 </h2>
                 <div className="space-y-4">
                     {challenges.map(c => {
                         const earned = (stats.challenges || []).includes(c.id);
                         
                         let progress = 0;
                         if (c.conditionType === 'referrals') progress = Math.min(100, ((stats.totalReferrals || 0) / c.conditionValue) * 100);
                         else if (c.conditionType === 'sales_count') progress = Math.min(100, ((stats.totalSalesCount || 0) / c.conditionValue) * 100);
                         else if (c.conditionType === 'earnings') progress = Math.min(100, ((stats.totalAffiliateRevenue || 0) / c.conditionValue) * 100);

                         return (
                             <div key={c.id} className="p-4 bg-slate-900 border border-slate-800 rounded-2xl relative overflow-hidden">
                                 {earned && <div className="absolute inset-0 bg-emerald-500/10 pointer-events-none" />}
                                 <div className="flex justify-between items-start mb-3 relative z-10">
                                     <div>
                                         <p className="text-sm font-bold text-white mb-1">{c.title || c.name}</p>
                                         <p className="text-xs text-slate-400">{c.description}</p>
                                     </div>
                                     {earned ? (
                                         <span className="shrink-0 bg-emerald-500/20 text-emerald-400 px-2 py-1 rounded text-[10px] font-black uppercase flex items-center gap-1"><CheckCircle2 className="w-3 h-3"/> Réussi</span>
                                     ) : (
                                         <span className="shrink-0 bg-blue-500/20 text-blue-400 px-2 py-1 rounded text-[10px] font-black uppercase">{Math.floor(progress)}%</span>
                                     )}
                                 </div>
                                 {!earned && (
                                     <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden mt-3">
                                         <div className="h-full bg-blue-500 rounded-full" style={{ width: `${progress}%` }} />
                                     </div>
                                 )}
                                 {c.bonusAmount > 0 && (
                                     <div className="mt-3 pt-3 border-t border-slate-800 flex justify-between items-center relative z-10">
                                         <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Récompense</span>
                                         <span className="text-xs font-black text-emerald-400">+{c.bonusAmount.toLocaleString()} XAF</span>
                                     </div>
                                 )}
                             </div>
                         )
                     })}
                     {challenges.length === 0 && <p className="text-slate-500 text-sm">Aucun défi configuré.</p>}
                 </div>
              </div>
          </div>

          {/* HISTORY */}
          <div className="bg-[#111827] border border-[#1E293B] rounded-3xl overflow-hidden">
              <div className="p-6 border-b border-slate-800 flex justify-between items-center">
                 <h2 className="text-sm font-black text-white uppercase tracking-widest flex items-center gap-2">
                   <Gift className="w-4 h-4 text-pink-400" /> Historique des Bonus & Récompenses
                 </h2>
                 {/* @ts-ignore */}
<CSVLink 
                    data={exportData} 
                    filename={`ndara_recompenses_${format(new Date(), 'yyyyMMdd')}.csv`}
                    className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-lg transition-colors flex items-center gap-2 text-[10px] uppercase tracking-widest"
                 >
                    <Download className="w-3 h-3" /> Exporter
                 </CSVLink>
              </div>
              <div className="overflow-x-auto">
                 <table className="w-full text-left border-collapse min-w-[600px]">
                     <thead>
                         <tr className="bg-slate-900/50 border-b border-slate-800">
                             <th className="p-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Date</th>
                             <th className="p-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Récompense</th>
                             <th className="p-4 text-[10px] font-black text-slate-500 uppercase tracking-widest text-right">Montant</th>
                         </tr>
                     </thead>
                     <tbody>
                         {rewards.length === 0 ? (
                             <tr><td colSpan={3} className="p-12 text-center text-slate-500">Aucune récompense pour le moment.</td></tr>
                         ) : (
                             rewards.map(r => (
                                 <tr key={r.id} className="border-b border-slate-800/50 hover:bg-slate-800/30 transition-colors">
                                     <td className="p-4 text-sm text-slate-400">
                                         {r.date?.toDate ? format(r.date.toDate(), 'dd/MM/yyyy HH:mm', { locale: fr }) : '-'}
                                     </td>
                                     <td className="p-4 text-sm font-bold text-white">
                                         {r.titre || r.description}
                                     </td>
                                     <td className="p-4 text-right">
                                         <span className="text-sm font-black text-emerald-400">+{r.montant?.toLocaleString()} XAF</span>
                                     </td>
                                 </tr>
                             ))
                         )}
                     </tbody>
                 </table>
              </div>
          </div>
        </>
      )}
    </div>
  );
}
