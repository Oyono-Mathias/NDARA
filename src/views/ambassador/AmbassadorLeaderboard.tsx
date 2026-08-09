import React, { useState, useEffect } from 'react';
import { Trophy, Medal, Star, Flame, Loader2 } from 'lucide-react';
import clsx from 'clsx';
import { useAuth } from '../../contexts/AuthContext';
import { CSVLink } from "react-csv";
import { Download, FileText } from "lucide-react";

export function AmbassadorLeaderboard() {
  const { firebaseUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [leaders, setLeaders] = useState<any[]>([]);
  const [period, setPeriod] = useState<'today' | 'week' | 'month' | 'year' | 'global'>('global');
  const [exportData, setExportData] = useState<any[]>([]);

  useEffect(() => {
    loadLeaderboard();
  }, [period]);

  const loadLeaderboard = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/gamification/leaderboard?period=${period}`);
      if (!response.ok) throw new Error('Erreur réseau');
      
      const data = await response.json();
      setLeaders(data.leaderboard || []);
      
      setExportData((data.leaderboard || []).map((d: any, idx: number) => ({
        "Rang": idx + 1,
        "Ambassadeur": d.displayName,
        "Pays": d.country,
        "Niveau": d.level,
        "Filleuls": d.totalReferrals,
        "Ventes": d.totalSalesCount,
        "Chiffre d'affaires": d.totalVolume,
        "Commissions": d.totalEarnings,
        "Taux de conversion": `${d.conversionRate}%`
      })));
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const getRankIcon = (rank: number) => {
    switch(rank) {
      case 1: return <Trophy className="w-6 h-6 text-yellow-400" />;
      case 2: return <Medal className="w-6 h-6 text-slate-300" />;
      case 3: return <Medal className="w-6 h-6 text-amber-600" />;
      default: return <span className="text-slate-500 font-black text-lg">#{rank}</span>;
    }
  };

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-8 pb-32">
      <div>
        <h1 className="text-3xl font-black text-white uppercase tracking-tight flex items-center gap-3">
          <Flame className="text-orange-500 w-8 h-8" />
          Classement Ambassadeurs
        </h1>
        <p className="text-slate-400">Découvrez les meilleurs ambassadeurs NDARA et suivez votre rang.</p>
      </div>

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-[#111827] border border-[#1E293B] p-4 rounded-2xl">
         <div className="flex flex-wrap gap-2">
            {[
              { id: 'today', label: "Aujourd'hui" },
              { id: 'week', label: "Cette semaine" },
              { id: 'month', label: "Ce mois" },
              { id: 'year', label: "Cette année" },
              { id: 'global', label: "Global" }
            ].map(f => (
               <button
                  key={f.id}
                  onClick={() => setPeriod(f.id as any)}
                  className={clsx(
                      "px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-widest transition-colors",
                      period === f.id ? "bg-pink-500 text-white" : "bg-slate-900 text-slate-400 hover:bg-slate-800"
                  )}
               >
                  {f.label}
               </button>
            ))}
         </div>
         
         {/* @ts-ignore */}
<CSVLink 
            data={exportData} 
            filename={`ndara_classement_${period}.csv`}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl transition-colors flex items-center gap-2 text-xs uppercase tracking-widest shrink-0"
         >
            <Download className="w-4 h-4" /> Exporter CSV
         </CSVLink>
      </div>

      <div className="bg-[#111827] border border-[#1E293B] rounded-3xl overflow-hidden">
        {loading ? (
            <div className="flex justify-center p-20"><Loader2 className="w-10 h-10 animate-spin text-pink-500" /></div>
        ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[800px]">
                <thead>
                  <tr className="bg-slate-900/50 border-b border-slate-800">
                    <th className="p-4 text-[10px] font-black text-slate-500 uppercase tracking-widest w-16 text-center">Rang</th>
                    <th className="p-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Ambassadeur</th>
                    <th className="p-4 text-[10px] font-black text-slate-500 uppercase tracking-widest text-center">Filleuls</th>
                    <th className="p-4 text-[10px] font-black text-slate-500 uppercase tracking-widest text-center">Ventes</th>
                    <th className="p-4 text-[10px] font-black text-slate-500 uppercase tracking-widest text-right">Volume (XAF)</th>
                    <th className="p-4 text-[10px] font-black text-slate-500 uppercase tracking-widest text-right">Gains (XAF)</th>
                  </tr>
                </thead>
                <tbody>
                  {leaders.length === 0 ? (
                      <tr><td colSpan={6} className="p-12 text-center text-slate-500">Aucune donnée pour cette période.</td></tr>
                  ) : (
                      leaders.map((leader, index) => {
                        const rank = index + 1;
                        const isMe = leader.id === firebaseUser?.uid;
                        
                        return (
                          <tr 
                            key={leader.id} 
                            className={clsx(
                                "border-b border-slate-800/50 transition-colors",
                                isMe ? "bg-pink-500/10 hover:bg-pink-500/20" : "hover:bg-slate-800/30"
                            )}
                          >
                            <td className="p-4 flex justify-center items-center h-[72px]">
                                {getRankIcon(rank)}
                            </td>
                            <td className="p-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center overflow-hidden shrink-0">
                                        {leader.photoURL ? (
                                            <img src={leader.photoURL} alt={leader.displayName} className="w-full h-full object-cover" />
                                        ) : (
                                            <Star className="w-5 h-5 text-slate-500" />
                                        )}
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-white flex items-center gap-2">
                                            {leader.displayName}
                                            {isMe && <span className="bg-pink-500 text-white text-[9px] px-1.5 py-0.5 rounded uppercase tracking-wider">Moi</span>}
                                        </p>
                                        <p className="text-[10px] text-slate-400 uppercase tracking-widest">{leader.country} • Niv {leader.level}</p>
                                    </div>
                                </div>
                            </td>
                            <td className="p-4 text-center">
                                <p className="text-lg font-black text-white">{leader.totalReferrals}</p>
                                <p className="text-[10px] text-slate-500 uppercase">{leader.conversionRate}% Conv.</p>
                            </td>
                            <td className="p-4 text-center">
                                <p className="text-lg font-black text-white">{leader.totalSalesCount}</p>
                            </td>
                            <td className="p-4 text-right">
                                <p className="text-lg font-black text-white">{leader.totalVolume?.toLocaleString()}</p>
                            </td>
                            <td className="p-4 text-right">
                                <p className="text-lg font-black text-emerald-400">+{leader.totalEarnings?.toLocaleString()}</p>
                            </td>
                          </tr>
                        );
                      })
                  )}
                </tbody>
              </table>
            </div>
        )}
      </div>
    </div>
  );
}
