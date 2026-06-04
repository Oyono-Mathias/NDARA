import React, { useState } from 'react';
import { 
  Landmark, 
  Search, 
  Download, 
  ShieldCheck, 
  Activity, 
  Clock, 
  AlertCircle, 
  ChevronDown,
  ArrowRightLeft,
  CheckCircle,
  XCircle,
  Banknote
} from 'lucide-react';
import clsx from 'clsx';

export function AdminTransactions() {
  const [activeTab, setActiveTab] = useState('transactions');
  const [searchTerm, setSearchTerm] = useState('');

  // Fake KPIs for layout demonstration
  const kpis = {
    totalRevenue: 2450000,
    todayRevenue: 125000,
    pendingCount: 3,
    failedCount: 1
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700 pb-20 relative font-sans">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[400px] bg-blue-500/5 blur-[100px] pointer-events-none" />

      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-5 relative z-10">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-blue-500 mb-1">
            <Landmark className="h-4 w-4" />
            <span className="text-[10px] font-black uppercase tracking-[0.3em]">Audit & Finance</span>
          </div>
          <h1 className="text-3xl font-black text-white uppercase tracking-tight">Trésorerie Global</h1>
          <p className="text-slate-400 text-sm font-medium">Surveillez l'intégralité du pipeline financier Ndara.</p>
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
          <button className="flex items-center justify-center gap-2 h-12 px-6 rounded-2xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white font-bold uppercase text-[10px] tracking-widest transition-all shadow-xl w-full sm:w-auto">
            <Download className="h-4 w-4" /> Exporter CSV
          </button>
        </div>
      </header>

      {/* KPIs Grid */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 relative z-10">
        {/* KPI 1 */}
        <div className="bg-slate-800/40 border border-slate-700/50 rounded-2xl p-5 flex flex-col justify-between relative overflow-hidden">
          <div className="flex justify-between items-start mb-4">
            <span className="text-slate-400 font-bold uppercase text-[10px] tracking-widest z-10">Volume Réel</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center z-10">
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
            </div>
          </div>
          <div className="z-10">
            <h3 className="text-2xl font-black text-white">{kpis.totalRevenue.toLocaleString('fr-FR')} <span className="text-sm text-slate-500">XAF</span></h3>
            <div className="flex items-center gap-1.5 mt-2 text-[10px] font-bold text-emerald-400 bg-emerald-500/10 w-fit px-2 py-0.5 rounded border border-emerald-500/20">
              <ArrowRightLeft className="w-3 h-3" /> +12% ce mois
            </div>
          </div>
        </div>

        {/* KPI 2 */}
        <div className="bg-slate-800/40 border border-slate-700/50 rounded-2xl p-5 flex flex-col justify-between relative overflow-hidden">
          <div className="flex justify-between items-start mb-4">
            <span className="text-slate-400 font-bold uppercase text-[10px] tracking-widest z-10">Ventes du Jour</span>
            <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center z-10">
              <Activity className="w-4 h-4 text-blue-500" />
            </div>
          </div>
          <div className="z-10">
            <h3 className="text-2xl font-black text-white">{kpis.todayRevenue.toLocaleString('fr-FR')} <span className="text-sm text-slate-500">XAF</span></h3>
            <div className="flex items-center gap-1.5 mt-2 text-[10px] font-bold text-blue-400 bg-blue-500/10 w-fit px-2 py-0.5 rounded border border-blue-500/20">
              <Activity className="w-3 h-3" /> LIVE
            </div>
          </div>
        </div>

        {/* KPI 3 */}
        <div className="bg-slate-800/40 border border-slate-700/50 rounded-2xl p-5 flex flex-col justify-between relative overflow-hidden">
          <div className="flex justify-between items-start mb-4">
            <span className="text-slate-400 font-bold uppercase text-[10px] tracking-widest z-10">En Attente (Audit)</span>
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center z-10">
              <Clock className="w-4 h-4 text-amber-500" />
            </div>
          </div>
          <div className="z-10">
            <h3 className="text-2xl font-black text-white">{kpis.pendingCount}</h3>
            <div className="flex items-center gap-1.5 mt-2 text-[10px] font-bold text-amber-400 bg-amber-500/10 w-fit px-2 py-0.5 rounded border border-amber-500/20">
              <Clock className="w-3 h-3" /> PENDING
            </div>
          </div>
        </div>

        {/* KPI 4 */}
        <div className="bg-slate-800/40 border border-slate-700/50 rounded-2xl p-5 flex flex-col justify-between relative overflow-hidden">
          <div className="flex justify-between items-start mb-4">
            <span className="text-slate-400 font-bold uppercase text-[10px] tracking-widest z-10">Échecs / Rejets</span>
            <div className="w-8 h-8 rounded-lg bg-red-500/10 flex items-center justify-center z-10">
              <AlertCircle className="w-4 h-4 text-red-500" />
            </div>
          </div>
          <div className="z-10">
            <h3 className="text-2xl font-black text-white">{kpis.failedCount}</h3>
            <div className="flex items-center gap-1.5 mt-2 text-[10px] font-bold text-red-400 bg-red-500/10 w-fit px-2 py-0.5 rounded border border-red-500/20">
              <AlertCircle className="w-3 h-3" /> FAILED
            </div>
          </div>
        </div>
      </section>

      {/* Tabs */}
      <div className="w-full relative z-10 flex flex-col gap-6">
        <div className="flex flex-col sm:flex-row justify-between gap-4">
          <div className="flex overflow-x-auto hide-scrollbar bg-slate-900/50 border border-slate-800 p-1.5 rounded-2xl w-full lg:w-fit shadow-2xl">
              <button 
                onClick={() => setActiveTab('transactions')}
                className={clsx(
                  "flex items-center justify-center gap-2 px-6 py-3 font-bold uppercase text-[10px] tracking-widest rounded-xl transition-all whitespace-nowrap",
                  activeTab === 'transactions' ? "bg-slate-800 text-white shadow-sm" : "text-slate-500 hover:text-slate-300"
                )}
              >
                  <ArrowRightLeft className="h-4 w-4" /> Transactions
              </button>
              <button 
                onClick={() => setActiveTab('payouts')}
                className={clsx(
                  "flex items-center justify-center gap-2 px-6 py-3 font-bold uppercase text-[10px] tracking-widest rounded-xl transition-all whitespace-nowrap",
                  activeTab === 'payouts' ? "bg-slate-800 text-amber-400 shadow-sm" : "text-amber-500/50 hover:text-amber-400/80"
                )}
              >
                  <Banknote className="h-4 w-4" /> Retraits (Payouts)
              </button>
          </div>

          <div className="relative flex-1 sm:max-w-xs">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input 
              type="text" 
              placeholder="Chercher ID ou utilisateur..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full h-full min-h-[48px] bg-slate-900/80 border border-slate-700/50 rounded-2xl py-3 pl-11 pr-4 text-white text-sm font-medium focus:outline-none focus:border-blue-500/50 transition-colors placeholder:text-slate-600"
            />
          </div>
        </div>

        {/* Content Panels */}
        <div>
          {activeTab === 'transactions' && (
            <div className="bg-slate-800/30 border border-slate-700/50 rounded-3xl overflow-hidden shadow-2xl relative">
              <div className="overflow-x-auto hide-scrollbar">
                <table className="w-full text-left border-collapse min-w-[800px]">
                  <thead>
                    <tr className="border-b border-slate-800 bg-slate-900/50">
                      <th className="p-4 pl-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Transaction</th>
                      <th className="p-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Utilisateur</th>
                      <th className="p-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Montant</th>
                      <th className="p-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Moyen</th>
                      <th className="p-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Statut</th>
                      <th className="p-4 pr-6 text-right text-[10px] font-black uppercase tracking-widest text-slate-400">Date</th>
                    </tr>
                  </thead>
                  <tbody className="text-sm divide-y divide-slate-800">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <tr key={i} className="hover:bg-slate-800/20 transition-colors group">
                        <td className="p-4 pl-6">
                          <div className="flex flex-col">
                            <span className="font-bold text-sm text-white uppercase truncate max-w-[200px]">Achat Formation {i}</span>
                            <div className="flex items-center gap-2 mt-1">
                                <span className="px-2 py-0.5 rounded border border-slate-700 text-[8px] font-black uppercase tracking-widest text-slate-300 bg-slate-800 w-fit">COURSE_PURCHASE</span>
                            </div>
                          </div>
                        </td>
                        <td className="p-4">
                           <div className="flex items-center gap-2">
                              <div className="h-8 w-8 rounded-full bg-slate-800 border border-white/5 flex items-center justify-center">
                                <span className="text-[10px] font-black text-slate-500">U{i}</span>
                              </div>
                              <span className="text-[10px] font-mono text-slate-400">user_{i}abc...</span>
                          </div>
                        </td>
                        <td className="p-4">
                           <span className="font-black text-white">{(25000 * i).toLocaleString('fr-FR')} <span className="text-[10px] opacity-40">XAF</span></span>
                        </td>
                        <td className="p-4">
                          <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 bg-slate-800 px-2 py-1 rounded">MOBILE_MONEY</span>
                        </td>
                        <td className="p-4">
                           {i % 3 === 0 ? (
                             <span className="inline-flex text-[9px] font-black uppercase border-none px-2 py-1 rounded bg-amber-500/10 text-amber-500 animate-pulse">Audit (Pending)</span>
                           ) : i % 5 === 0 ? (
                             <span className="inline-flex text-[9px] font-black uppercase border-none px-2 py-1 rounded bg-red-500/10 text-red-500">Rejeté</span>
                           ) : (
                             <span className="inline-flex text-[9px] font-black uppercase border-none px-2 py-1 rounded bg-emerald-500/10 text-emerald-500">Réussi</span>
                           )}
                        </td>
                        <td className="p-4 pr-6 text-right">
                           <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">
                               0{i}/06/2026 14:{i}0
                           </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'payouts' && (
             <div className="bg-slate-800/30 border border-slate-700/50 rounded-3xl overflow-hidden shadow-2xl relative">
              <div className="overflow-x-auto hide-scrollbar">
                <table className="w-full text-left border-collapse min-w-[800px]">
                  <thead>
                    <tr className="border-b border-slate-800 bg-slate-900/50">
                      <th className="p-4 pl-6 text-[10px] font-black uppercase tracking-widest text-slate-400">ID Demande</th>
                      <th className="p-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Instructeur</th>
                      <th className="p-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Montant</th>
                      <th className="p-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Statut</th>
                      <th className="p-4 pr-6 text-right text-[10px] font-black uppercase tracking-widest text-slate-400">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="text-sm divide-y divide-slate-800">
                    {[1, 2].map((i) => (
                      <tr key={i} className="hover:bg-slate-800/20 transition-colors group">
                        <td className="p-4 pl-6">
                           <span className="font-mono text-xs text-white">PAYOUT-XYZ-{i}</span>
                        </td>
                        <td className="p-4">
                           <div className="flex items-center gap-2">
                              <div className="h-8 w-8 rounded-full bg-slate-800 border border-white/5 flex items-center justify-center">
                                <span className="text-[10px] font-black text-slate-500">I</span>
                              </div>
                              <div>
                                <p className="text-xs font-bold text-white">Instructeur Pro</p>
                                <p className="text-[9px] font-mono text-slate-500 mt-0.5">user_xyz_123</p>
                              </div>
                          </div>
                        </td>
                        <td className="p-4">
                           <span className="font-black text-white">150 000 <span className="text-[10px] opacity-40">XAF</span></span>
                        </td>
                        <td className="p-4">
                           <span className="inline-flex text-[9px] font-black uppercase border-none px-2 py-1 rounded bg-blue-500/10 text-blue-400">En cours</span>
                        </td>
                        <td className="p-4 pr-6 text-right">
                           <div className="flex justify-end gap-2">
                             <button className="h-8 px-3 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold uppercase tracking-widest text-[9px] hover:bg-emerald-500 hover:text-slate-950 transition-colors">
                               Approuver
                             </button>
                             <button className="h-8 px-3 rounded-lg bg-red-500/10 text-red-400 border border-red-500/20 font-bold uppercase tracking-widest text-[9px] hover:bg-red-500 hover:text-white transition-colors">
                               Rejeter
                             </button>
                           </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
