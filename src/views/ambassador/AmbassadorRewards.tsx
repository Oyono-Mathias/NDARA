import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { db } from '../../firebase';
import { collection, doc, getDoc, getDocs, query, where, orderBy } from 'firebase/firestore';
import { Medal, Trophy, Target, Star, Gift, CheckCircle2, ChevronRight, Loader2 } from 'lucide-react';
import clsx from 'clsx';
import { format } from 'date-fns';
import { CSVLink } from "react-csv";
import { Download, FileText } from "lucide-react";
import { fr } from 'date-fns/locale';

export function AmbassadorRewards() {
  const { firebaseUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [ambassador, setAmbassador] = useState<any>(null);
  const [levels, setLevels] = useState<any[]>([]);
  const [badges, setBadges] = useState<any[]>([]);
  const [challenges, setChallenges] = useState<any[]>([]);
  const [rewardHistory, setRewardHistory] = useState<any[]>([]);
  const [exportData, setExportData] = useState<any[]>([]);

  useEffect(() => {
    if (!firebaseUser) return;
    loadData();
  }, [firebaseUser]);

  const loadData = async () => {
    setLoading(true);
    try {
      const uRef = doc(db, 'ambassadors', firebaseUser!.uid);
      const uSnap = await getDoc(uRef);
      if (uSnap.exists()) setAmbassador(uSnap.data());

      const [lSnap, bSnap, cSnap, rhSnap] = await Promise.all([
        getDocs(query(collection(db, 'ambassador_levels'), orderBy('minSalesAmount', 'asc'))),
        getDocs(query(collection(db, 'ambassador_badges'))),
        getDocs(query(collection(db, 'ambassador_challenges'))),
        getDocs(query(collection(db, 'reward_history'), where('ambassadorUid', '==', firebaseUser!.uid), orderBy('createdAt', 'desc')))
      ]);

      setLevels(lSnap.docs.map(d => ({ id: d.id, ...d.data() })));
      setBadges(bSnap.docs.map(d => ({ id: d.id, ...d.data() })));
      setChallenges(cSnap.docs.map(d => ({ id: d.id, ...d.data() })));
      const rh = rhSnap.docs.map(d => ({ id: d.id, ...d.data() }));
      setRewardHistory(rh);
      setExportData(rh.map((r: any) => ({
        "Date": r.createdAt?.toDate ? format(r.createdAt.toDate(), 'dd/MM/yyyy HH:mm') : '',
        "Type": r.type,
        "Description": r.description,
        "Montant": r.amount
      })));

    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="flex justify-center p-20"><Loader2 className="w-12 h-12 animate-spin text-purple-500" /></div>;
  }

  const currentLevelIndex = levels.findIndex(l => l.id === ambassador?.level);
  const currentLevel = levels[currentLevelIndex] || { name: 'Bronze' };
  const nextLevel = levels[currentLevelIndex + 1];

  let progressPercent = 100;
  if (nextLevel) {
    const minVol = nextLevel.minSalesAmount || 0;
    const curVol = ambassador?.totalSales || 0;
    progressPercent = minVol > 0 ? Math.min(100, Math.round((curVol / minVol) * 100)) : 100;
  }

  const earnedBadges = ambassador?.badges || [];
  const completedChallenges = ambassador?.challenges || [];

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-8 pb-32">
      <div>
        <h1 className="text-3xl font-black text-white uppercase tracking-tight flex items-center gap-3">
          <Gift className="text-pink-500 w-8 h-8" />
          Récompenses & Niveaux
        </h1>
        <p className="text-slate-400">Suivez votre progression, vos badges et vos bonus débloqués.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* NIVEAU ACTUEL */}
        <div className="bg-[#111827] border border-[#1E293B] rounded-3xl p-6 lg:col-span-2 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-10">
            <Trophy className="w-48 h-48" />
          </div>
          <h2 className="text-sm font-black text-white uppercase tracking-widest mb-4 flex items-center gap-2">
            <Star className="w-4 h-4 text-yellow-400" /> Votre Niveau
          </h2>
          
          <div className="flex items-end gap-4 mb-6">
            <span className="text-5xl font-black text-white uppercase tracking-tighter">{currentLevel.name}</span>
          </div>

          {nextLevel ? (
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-bold text-slate-400 uppercase tracking-widest">
                <span>Progression vers {nextLevel.name}</span>
                <span className="text-emerald-400">{progressPercent}%</span>
              </div>
              <div className="h-3 w-full bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-500 rounded-full transition-all duration-1000" style={{ width: `${progressPercent}%` }} />
              </div>
              <p className="text-xs text-slate-500 mt-2">
                Objectif: {nextLevel.minSalesAmount?.toLocaleString()} XAF de ventes.
                {nextLevel.bonusAmount > 0 && <span className="text-purple-400 font-bold ml-2">Bonus à débloquer : {nextLevel.bonusAmount} XAF</span>}
              </p>
            </div>
          ) : (
            <div className="p-4 bg-purple-500/10 border border-purple-500/20 rounded-xl text-purple-400 font-bold flex items-center gap-2">
              <Trophy className="w-5 h-5" /> Vous avez atteint le niveau maximum !
            </div>
          )}
        </div>

        {/* STATS */}
        <div className="bg-[#111827] border border-[#1E293B] rounded-3xl p-6 flex flex-col justify-center space-y-6">
           <div>
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Badges débloqués</p>
              <p className="text-3xl font-black text-white">{earnedBadges.length} / {badges.length}</p>
           </div>
           <div>
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Défis terminés</p>
              <p className="text-3xl font-black text-white">{completedChallenges.length} / {challenges.length}</p>
           </div>
           <div>
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Bonus totaux gagnés</p>
              <p className="text-3xl font-black text-emerald-400">
                 {rewardHistory.reduce((acc, curr) => acc + (curr.amount || 0), 0).toLocaleString()} XAF
              </p>
           </div>
        </div>

      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* BADGES */}
        <div className="bg-[#111827] border border-[#1E293B] rounded-3xl p-6">
          <h2 className="text-sm font-black text-white uppercase tracking-widest mb-6 flex items-center gap-2">
            <Medal className="w-4 h-4 text-blue-400" /> Vos Badges
          </h2>
          <div className="grid gap-4">
            {badges.map(b => {
              const earned = earnedBadges.includes(b.id);
              return (
                <div key={b.id} className={clsx("p-4 rounded-xl border flex items-center gap-4 transition-all", earned ? "bg-slate-800/80 border-blue-500/30" : "bg-slate-900/50 border-slate-800 opacity-50 grayscale")}>
                  <div className={clsx("w-12 h-12 rounded-full flex items-center justify-center text-2xl bg-slate-900 border", earned ? "border-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.3)]" : "border-slate-800")}>
                    🏅
                  </div>
                  <div className="flex-1">
                    <p className={clsx("font-bold text-sm", earned ? "text-white" : "text-slate-400")}>{b.name}</p>
                    <p className="text-xs text-slate-500">{b.description}</p>
                  </div>
                  {earned && <CheckCircle2 className="w-5 h-5 text-emerald-500" />}
                </div>
              );
            })}
          </div>
        </div>

        {/* DEFIS */}
        <div className="bg-[#111827] border border-[#1E293B] rounded-3xl p-6">
          <h2 className="text-sm font-black text-white uppercase tracking-widest mb-6 flex items-center gap-2">
            <Target className="w-4 h-4 text-rose-400" /> Défis Actifs
          </h2>
          <div className="grid gap-4">
            {challenges.map(c => {
              const completed = completedChallenges.includes(c.id);
              return (
                <div key={c.id} className={clsx("p-4 rounded-xl border", completed ? "bg-emerald-500/10 border-emerald-500/30" : "bg-slate-800/50 border-slate-700")}>
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p className={clsx("font-bold text-sm", completed ? "text-emerald-400" : "text-white")}>{c.name}</p>
                      {c.bonusAmount > 0 && <p className="text-xs font-bold text-purple-400 mt-1">Récompense: +{c.bonusAmount} XAF</p>}
                    </div>
                    {completed ? <CheckCircle2 className="w-5 h-5 text-emerald-500" /> : <div className="w-5 h-5 rounded-full border-2 border-slate-600" />}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>

      {/* HISTORIQUE */}
      <div className="bg-[#111827] border border-[#1E293B] rounded-3xl overflow-hidden flex flex-col">
          <div className="p-6 border-b border-slate-800 flex justify-between items-center">
            <h2 className="text-sm font-black text-white uppercase tracking-widest">Historique des Récompenses</h2>
            <div className="flex gap-2">
              <CSVLink data={exportData} filename="ndara_recompenses.csv" className="p-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-white" title="Exporter CSV">
                <Download className="w-4 h-4" />
              </CSVLink>
              <button onClick={() => window.print()} className="p-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-white" title="Imprimer / PDF">
                <FileText className="w-4 h-4" />
              </button>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[600px]">
              <thead>
                <tr className="bg-slate-900/50 border-b border-slate-800">
                  <th className="p-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Date</th>
                  <th className="p-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Type</th>
                  <th className="p-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Description</th>
                  <th className="p-4 text-[10px] font-black text-slate-500 uppercase tracking-widest text-right">Montant</th>
                </tr>
              </thead>
              <tbody>
                {rewardHistory.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="p-8 text-center text-slate-500 text-sm">Aucune récompense pour le moment.</td>
                  </tr>
                ) : (
                  rewardHistory.map(r => (
                    <tr key={r.id} className="border-b border-slate-800/50 hover:bg-slate-800/30">
                      <td className="p-4 text-sm text-slate-400">
                        {r.createdAt?.toDate ? format(r.createdAt.toDate(), 'dd/MM/yyyy HH:mm', { locale: fr }) : '-'}
                      </td>
                      <td className="p-4 text-xs font-bold text-purple-400 uppercase tracking-widest">{r.type}</td>
                      <td className="p-4 text-sm font-bold text-white">{r.description}</td>
                      <td className="p-4 text-right text-sm font-black text-emerald-400">
                        {r.amount > 0 ? '+' : ''}{r.amount?.toLocaleString()} XAF
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
