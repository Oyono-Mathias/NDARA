import React, { useState, useEffect } from 'react';
import { db } from '../../firebase';
import { collection, query, orderBy, limit, getDocs } from 'firebase/firestore';
import { Trophy, Medal, Star, Flame, Loader2 } from 'lucide-react';
import clsx from 'clsx';
import { useAuth } from '../../contexts/AuthContext';
import { CSVLink } from "react-csv";
import { Download, FileText } from "lucide-react";

export function AmbassadorLeaderboard() {
  const { firebaseUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [leaders, setLeaders] = useState<any[]>([]);
  const [sortBy, setSortBy] = useState<'totalVolume' | 'totalReferrals'>('totalVolume');
  const [exportData, setExportData] = useState<any[]>([]);

  useEffect(() => {
    loadLeaderboard();
  }, [sortBy]);

  const loadLeaderboard = async () => {
    setLoading(true);
    try {
      const q = query(collection(db, 'leaderboard_cache'), orderBy(sortBy, 'desc'), limit(100));
      const snap = await getDocs(q);
      const docs = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      setLeaders(docs);
      setExportData(docs.map((d: any, idx) => ({
        "Rang": idx + 1,
        "Ambassadeur": d.displayName,
        "Niveau": d.level,
        "Filleuls": d.totalReferrals,
        "CA Généré": d.totalVolume
      })));
    } catch(e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const getRankIcon = (index: number) => {
    if (index === 0) return <Trophy className="w-6 h-6 text-yellow-400" />;
    if (index === 1) return <Medal className="w-6 h-6 text-slate-300" />;
    if (index === 2) return <Medal className="w-6 h-6 text-amber-700" />;
    return <span className="text-lg font-black text-slate-500">{index + 1}</span>;
  };

  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto space-y-8 pb-32">
      <div className="text-center space-y-4">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-purple-500/10 text-purple-500 mb-2">
          <Flame className="w-8 h-8" />
        </div>
        <h1 className="text-3xl md:text-5xl font-black text-white uppercase tracking-tighter">Classement</h1>
        <p className="text-slate-400 max-w-xl mx-auto">Découvrez les meilleurs ambassadeurs NDARA et grimpez dans le classement pour débloquer des récompenses exclusives.</p>
      </div>

      <div className="flex justify-center gap-4">
        <button 
          onClick={() => setSortBy('totalVolume')} 
          className={clsx("px-6 py-3 rounded-xl font-bold uppercase tracking-widest text-xs transition-all", sortBy === 'totalVolume' ? "bg-purple-500 text-white shadow-[0_0_20px_rgba(168,85,247,0.4)]" : "bg-slate-800 text-slate-400 hover:bg-slate-700")}
        >
          Par Chiffre d'Affaires
        </button>
        <button 
          onClick={() => setSortBy('totalReferrals')} 
          className={clsx("px-6 py-3 rounded-xl font-bold uppercase tracking-widest text-xs transition-all", sortBy === 'totalReferrals' ? "bg-blue-500 text-white shadow-[0_0_20px_rgba(59,130,246,0.4)]" : "bg-slate-800 text-slate-400 hover:bg-slate-700")}
        >
          Par Filleuls
        </button>
      </div>

      <div className="flex justify-end gap-3">
        <CSVLink 
          data={exportData} 
          filename={`ndara_classement.csv`}
          className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-lg transition-colors flex items-center gap-2 text-xs"
        >
          <Download className="w-4 h-4" /> CSV / Excel
        </CSVLink>
        <button onClick={() => window.print()} className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-lg transition-colors flex items-center gap-2 text-xs">
          <FileText className="w-4 h-4" /> PDF / Imprimer
        </button>
      </div>

      <div className="bg-[#111827] border border-[#1E293B] rounded-3xl overflow-hidden">
        {loading ? (
          <div className="flex justify-center p-20"><Loader2 className="w-10 h-10 animate-spin text-purple-500" /></div>
        ) : leaders.length === 0 ? (
          <div className="text-center p-20 text-slate-500">Aucune donnée de classement pour le moment.</div>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-900/50 border-b border-slate-800">
                <th className="p-4 text-[10px] font-black text-slate-500 uppercase tracking-widest text-center w-16">Rang</th>
                <th className="p-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Ambassadeur</th>
                <th className="p-4 text-[10px] font-black text-slate-500 uppercase tracking-widest text-center">Niveau</th>
                <th className="p-4 text-[10px] font-black text-slate-500 uppercase tracking-widest text-center">Filleuls</th>
                <th className="p-4 text-[10px] font-black text-slate-500 uppercase tracking-widest text-right">CA Généré</th>
              </tr>
            </thead>
            <tbody>
              {leaders.map((l, idx) => {
                const isMe = l.uid === firebaseUser?.uid;
                return (
                  <tr key={l.id} className={clsx("border-b border-slate-800/50 transition-colors", isMe ? "bg-purple-500/10 hover:bg-purple-500/20" : "hover:bg-slate-800/30")}>
                    <td className="p-4 text-center">
                      <div className="flex justify-center items-center w-8 h-8 mx-auto">
                        {getRankIcon(idx)}
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <img 
                          src={l.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(l.displayName || 'U')}&background=A855F7&color=fff`} 
                          alt="" 
                          className={clsx("w-10 h-10 rounded-full object-cover", idx < 3 ? "border-2 border-yellow-500" : "bg-slate-800")}
                        />
                        <div>
                          <p className={clsx("font-bold text-sm", isMe ? "text-purple-400" : "text-white")}>{l.displayName} {isMe && "(Moi)"}</p>
                          <p className="text-[10px] text-slate-500">{l.totalSalesCount || 0} ventes</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 text-center">
                      <span className="px-2 py-1 bg-slate-800 rounded-lg text-[10px] font-black text-slate-300 uppercase tracking-widest">
                        {l.level || 'Bronze'}
                      </span>
                    </td>
                    <td className="p-4 text-center text-sm font-bold text-slate-300">
                      {l.totalReferrals || 0}
                    </td>
                    <td className="p-4 text-right">
                      <span className="text-sm font-black text-emerald-400">
                        {l.totalVolume?.toLocaleString()} XAF
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
