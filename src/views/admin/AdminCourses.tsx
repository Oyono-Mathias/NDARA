import React, { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '../../firebase';
import { Link } from 'react-router-dom';
import { BookOpen, ShoppingCart, LayoutGrid, TrendingUp, Plus, FileText, CheckCircle, Clock } from 'lucide-react';
import clsx from 'clsx';

export function AdminCourses() {
  const [pendingCount, setPendingCount] = useState(0);
  const [activeTab, setActiveTab] = useState('all');

  useEffect(() => {
    let unsub = () => {};
    try {
      const q = query(collection(db, 'courses'), where('status', '==', 'Pending Review'));
      unsub = onSnapshot(q, (snap) => {
          setPendingCount(snap.size);
      }, (err) => {
          console.error("Erreur de stats modération:", err);
      });
    } catch (e) {
      console.error(e);
    }
    return () => unsub();
  }, []);

  return (
    <div className="space-y-8 animate-in fade-in duration-700 pb-20 relative font-sans">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[400px] bg-emerald-500/5 blur-[100px] pointer-events-none" />

      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-5 relative z-10">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-emerald-500 mb-1">
            <BookOpen className="h-4 w-4" />
            <span className="text-[10px] font-black uppercase tracking-[0.3em]">Gestion du Savoir</span>
          </div>
          <h1 className="text-3xl font-black text-white uppercase tracking-tight">Catalogue & Modération</h1>
          <p className="text-slate-400 text-sm font-medium">Supervisez l'offre pédagogique et arbitrez le marché.</p>
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
            {pendingCount > 0 && (
                <div className="bg-amber-500/20 text-amber-500 text-[10px] font-black px-4 py-2 rounded-xl border border-amber-500/30 flex items-center gap-2 animate-pulse shadow-lg shadow-amber-500/10 shrink-0">
                    <div className="w-2 h-2 rounded-full bg-amber-500 shadow-[0_0_8px_#f59e0b]" />
                    {pendingCount} À MODÉRER
                </div>
            )}
            <Link 
              to="/instructor/courses/create"
              className="flex items-center justify-center gap-2 h-12 px-6 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black uppercase text-[10px] tracking-widest transition-all active:scale-95 shrink-0 shadow-xl"
            >
                <Plus className="h-4 w-4" /> Nouveau Cours
            </Link>
        </div>
      </header>

      {/* Tabs */}
      <div className="w-full relative z-10 flex flex-col gap-6">
        <div className="flex overflow-x-auto hide-scrollbar bg-slate-900/50 border border-slate-800 p-1.5 rounded-2xl w-full lg:w-fit shadow-2xl">
            <button 
              onClick={() => setActiveTab('all')}
              className={clsx(
                "flex items-center justify-center gap-2 px-6 py-3 font-bold uppercase text-[10px] tracking-widest rounded-xl transition-all whitespace-nowrap",
                activeTab === 'all' ? "bg-slate-800 text-white shadow-sm" : "text-slate-500 hover:text-slate-300"
              )}
            >
                <LayoutGrid className="h-4 w-4" /> Catalogue
            </button>
            <button 
              onClick={() => setActiveTab('resale')}
              className={clsx(
                "flex items-center justify-center gap-2 px-6 py-3 font-bold uppercase text-[10px] tracking-widest rounded-xl transition-all whitespace-nowrap",
                activeTab === 'resale' ? "bg-slate-800 text-blue-400 shadow-sm" : "text-blue-500/50 hover:text-blue-400/80"
              )}
            >
                <TrendingUp className="h-4 w-4" /> Marché Secondaire
            </button>
            <button 
              onClick={() => setActiveTab('buyouts')}
              className={clsx(
                "flex items-center justify-center gap-2 px-6 py-3 font-bold uppercase text-[10px] tracking-widest rounded-xl transition-all whitespace-nowrap",
                activeTab === 'buyouts' ? "bg-slate-800 text-emerald-400 shadow-sm" : "text-emerald-500/50 hover:text-emerald-400/80"
              )}
            >
                <ShoppingCart className="h-4 w-4" /> Rachats Ndara
            </button>
        </div>

        {/* Content Panels */}
        <div>
            {activeTab === 'all' && (
              <div className="bg-slate-800/30 border border-slate-700/50 rounded-3xl overflow-hidden mt-2">
                <div className="overflow-x-auto hide-scrollbar">
                  <table className="w-full text-left border-collapse min-w-[700px]">
                    <thead>
                      <tr className="border-b border-slate-700/50 text-[10px] font-black text-slate-500 uppercase tracking-widest bg-slate-900/30">
                        <th className="p-4 pl-6">Formation</th>
                        <th className="p-4">Instructeur</th>
                        <th className="p-4">Prix</th>
                        <th className="p-4">Statut</th>
                        <th className="p-4 pr-6 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="text-sm divide-y divide-slate-700/30">
                      {[1, 2, 3].map((i) => (
                        <tr key={i} className="hover:bg-slate-800/50 transition-colors group">
                          <td className="p-4 pl-6">
                             <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-xl bg-slate-800 flex items-center justify-center shrink-0 border border-slate-700 group-hover:border-emerald-500/30 transition-colors">
                                  <FileText className="w-5 h-5 text-emerald-500" />
                                </div>
                                <div className="max-w-[200px] md:max-w-none">
                                  <p className="font-bold text-white line-clamp-1">Fondamentaux du Trading {i}</p>
                                  <div className="flex items-center gap-2 mt-1">
                                      <span className="text-[9px] font-bold text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20 uppercase tracking-widest whitespace-nowrap">Finance</span>
                                  </div>
                                </div>
                              </div>
                          </td>
                          <td className="p-4 text-slate-300 text-xs font-bold uppercase tracking-wider">O. Mathias</td>
                          <td className="p-4 text-white font-black whitespace-nowrap">25 000 XAF</td>
                          <td className="p-4">
                             <span className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-slate-300">
                               <CheckCircle className="w-3.5 h-3.5 text-emerald-500" /> Actif
                             </span>
                          </td>
                          <td className="p-4 pr-6 text-right">
                            <button className="text-[10px] font-bold uppercase tracking-widest text-slate-500 hover:text-emerald-400 transition-colors">
                              Gérer
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activeTab === 'resale' && (
              <div className="bg-slate-800/30 border border-dashed border-slate-700/50 rounded-3xl p-10 flex flex-col items-center justify-center text-center mt-2">
                 <div className="w-16 h-16 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center mb-4">
                   <TrendingUp className="w-8 h-8 text-blue-400" />
                 </div>
                 <h3 className="text-white font-black mb-2 uppercase tracking-widest text-lg">Marché Secondaire</h3>
                 <p className="text-sm text-slate-400 max-w-md font-medium">Aucune activité de revente détectée. Les offres d'étudiants apparaîtront ici.</p>
              </div>
            )}

            {activeTab === 'buyouts' && (
              <div className="bg-slate-800/30 border border-dashed border-slate-700/50 rounded-3xl p-10 flex flex-col items-center justify-center text-center mt-2">
                 <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mb-4">
                   <ShoppingCart className="w-8 h-8 text-emerald-400" />
                 </div>
                 <h3 className="text-white font-black mb-2 uppercase tracking-widest text-lg">Rachats Ndara</h3>
                 <p className="text-sm text-slate-400 max-w-md font-medium">Aucune demande de rachat de la plateforme pour le moment.</p>
              </div>
            )}
        </div>
      </div>
    </div>
  );
}
