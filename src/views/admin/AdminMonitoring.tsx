import React, { useState, useEffect } from 'react';
import { 
    Activity, ShieldCheck, Database, Filter, Search, Loader2, List, Trash2, Key, Edit3, Plus, LogIn, LogOut
} from 'lucide-react';
import { collection, query, orderBy, limit, onSnapshot, where } from 'firebase/firestore';
import { db } from '../../firebase';
import { NdaraSkeleton, EmptyState } from './AdminSupport';

export function AdminMonitoring() {
    const [logs, setLogs] = useState<any[]>([]);
    const [loadingLogs, setLoadingLogs] = useState(true);
    const [filterAction, setFilterAction] = useState('all');

    useEffect(() => {
        let qLogs = query(collection(db, 'audit_logs'), orderBy('timestamp', 'desc'), limit(100));
        
        const unsubLogs = onSnapshot(qLogs, (snap) => {
            const fetchedLogs: any[] = [];
            snap.forEach(doc => {
                const data = doc.data();
                fetchedLogs.push({
                    id: doc.id,
                    timestamp: data.timestamp?.toDate ? data.timestamp.toDate() : new Date(data.timestamp || Date.now()),
                    ...data
                });
            });
            setLogs(fetchedLogs);
            setLoadingLogs(false);
        });

        return () => unsubLogs();
    }, []);

    const filteredLogs = logs.filter(log => {
      if (filterAction !== 'all') {
        if (filterAction === 'auth' && !['LOGIN', 'LOGOUT'].includes(log.action)) return false;
        if (filterAction === 'data' && !['CREATE', 'UPDATE', 'DELETE', 'LOGICAL_DELETE', 'EDIT_PROFILE'].includes(log.action)) return false;
        if (filterAction === 'security' && !['CHANGE_ROLE', 'SUSPEND', 'DISABLE', 'REACTIVATE', 'RESET_PASSWORD'].includes(log.action)) return false;
      }
      return true;
    });

    const getActionIcon = (action: string) => {
      if (['LOGIN', 'LOGOUT'].includes(action)) return <LogIn className="w-4 h-4 text-blue-400" />;
      if (['CREATE'].includes(action)) return <Plus className="w-4 h-4 text-emerald-400" />;
      if (['UPDATE', 'EDIT_PROFILE'].includes(action)) return <Edit3 className="w-4 h-4 text-amber-400" />;
      if (['DELETE', 'LOGICAL_DELETE'].includes(action)) return <Trash2 className="w-4 h-4 text-red-400" />;
      if (['CHANGE_ROLE', 'SUSPEND', 'DISABLE', 'REACTIVATE', 'RESET_PASSWORD'].includes(action)) return <ShieldCheck className="w-4 h-4 text-purple-400" />;
      return <Activity className="w-4 h-4 text-slate-400" />;
    };

    const getActionColor = (action: string) => {
      if (['LOGIN', 'LOGOUT'].includes(action)) return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
      if (['CREATE'].includes(action)) return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
      if (['UPDATE', 'EDIT_PROFILE'].includes(action)) return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
      if (['DELETE', 'LOGICAL_DELETE'].includes(action)) return 'bg-red-500/10 text-red-400 border-red-500/20';
      if (['CHANGE_ROLE', 'SUSPEND', 'DISABLE', 'REACTIVATE', 'RESET_PASSWORD'].includes(action)) return 'bg-purple-500/10 text-purple-400 border-purple-500/20';
      return 'bg-slate-800 text-slate-400 border-slate-700';
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500 font-mono">
            
            <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-blue-500/20 pb-6 gap-4">
                <h1 className="text-2xl font-black text-white tracking-widest uppercase flex items-center gap-3">
                    <Database className="text-blue-500 w-6 h-6" /> JOURNAL D'ACTIVITÉ (AUDIT LOG)
                </h1>
                
                <div className="flex gap-2">
                  <select 
                    value={filterAction}
                    onChange={e => setFilterAction(e.target.value)}
                    className="bg-slate-900 border border-slate-700 rounded-xl px-4 py-2 text-xs font-bold text-slate-300 uppercase tracking-widest outline-none focus:border-blue-500"
                  >
                    <option value="all">Toutes les actions</option>
                    <option value="auth">Authentification (Connexion/Déconnexion)</option>
                    <option value="data">Données (Création/Modif/Suppression)</option>
                    <option value="security">Sécurité (Rôles/Statuts)</option>
                  </select>
                </div>
            </div>

            <div className="bg-[#090E17] border border-slate-800/50 rounded-2xl overflow-hidden shadow-2xl">
                <div className="p-4 border-b border-slate-800/50 bg-[#0B111A] flex items-center justify-between">
                    <h2 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                        <List className="w-4 h-4" /> Flux d'évènements temps réel
                    </h2>
                    <span className="flex h-2 w-2 relative">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
                    </span>
                </div>

                <div className="p-4 space-y-2 max-h-[65vh] overflow-y-auto hide-scrollbar">
                    {loadingLogs ? (
                        <>
                           <NdaraSkeleton className="h-16 w-full rounded-xl" />
                           <NdaraSkeleton className="h-16 w-full rounded-xl" />
                           <NdaraSkeleton className="h-16 w-full rounded-xl" />
                        </>
                    ) : filteredLogs.length === 0 ? (
                        <EmptyState icon={Database} title="Aucun log d'activité" />
                    ) : (
                        filteredLogs.map((log) => (
                            <div key={log.id} className="p-4 bg-slate-800/30 rounded-xl border border-slate-800 hover:border-slate-700 hover:bg-slate-800/50 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4">
                                <div className="flex items-start gap-4">
                                    <div className="mt-1">
                                      <div className={`p-2 rounded-lg border ${getActionColor(log.action)}`}>
                                        {getActionIcon(log.action)}
                                      </div>
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded border ${getActionColor(log.action)}`}>
                                                {log.action}
                                            </span>
                                            <span className="text-slate-500 text-[10px]">
                                                {log.timestamp.toLocaleString('fr-FR')}
                                            </span>
                                        </div>
                                        <p className="text-white text-sm font-medium">{log.details}</p>
                                        <div className="flex gap-4 mt-2">
                                          <p className="text-slate-500 text-[10px] uppercase tracking-widest">
                                            Admin: <span className="text-slate-400">{log.adminId || log.userId || 'Système'}</span>
                                          </p>
                                          {log.targetUserId && (
                                            <p className="text-slate-500 text-[10px] uppercase tracking-widest">
                                              Cible: <span className="text-slate-400">{log.targetUserId}</span>
                                            </p>
                                          )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

        </div>
    );
}
