import React, { useState, useEffect } from 'react';
import { 
  History, 
  ShieldAlert, 
  ShieldCheck, 
  UserCog, 
  Database, 
  CreditCard, 
  Lock, 
  Info,
  Clock,
  Filter
} from 'lucide-react';
import clsx from 'clsx';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface SecurityLog {
  id: string;
  eventType: string;
  status: 'info' | 'warning' | 'danger';
  details: string;
  targetId: string;
  timestamp: Date;
}

const LogIcon = ({ type }: { type: string }) => {
  if (type.includes('user')) return <UserCog className="h-4 w-4 text-blue-400" />;
  if (type.includes('course')) return <Database className="h-4 w-4 text-emerald-400" />;
  if (type.includes('payment') || type.includes('payout')) return <CreditCard className="h-4 w-4 text-amber-400" />;
  if (type.includes('security') || type.includes('suspicious')) return <Lock className="h-4 w-4 text-red-500" />;
  return <Info className="h-4 w-4 text-slate-400" />;
};

export function AdminSecurity() {
  const [logType, setLogType] = useState<'audit' | 'security'>('security');
  const [filterLevel, setFilterLevel] = useState<'all' | 'info' | 'warning' | 'danger'>('all');
  const [logs, setLogs] = useState<SecurityLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulated fetch
    setTimeout(() => {
      setLogs([
        { id: '1', eventType: 'user_login', status: 'info', details: 'Connexion administrateur réussie.', targetId: 'admin_123', timestamp: new Date() },
        { id: '2', eventType: 'security_brute_force', status: 'danger', details: 'Tentatives de connexion multiples bloquées.', targetId: 'IP: 192.168.1.100', timestamp: new Date(Date.now() - 3600000) },
        { id: '3', eventType: 'course_deleted', status: 'warning', details: 'Suppression du cours "Hack Ethique" forcé.', targetId: 'course_789', timestamp: new Date(Date.now() - 7200000) },
        { id: '4', eventType: 'payment_refund', status: 'warning', details: 'Remboursement manuel effectué (25000 XAF).', targetId: 'pay_xyz', timestamp: new Date(Date.now() - 86400000) },
        { id: '5', eventType: 'security_settings', status: 'info', details: 'Politique de mot de passe mise à jour.', targetId: 'system', timestamp: new Date(Date.now() - 172800000) }
      ]);
      setIsLoading(false);
    }, 800);
  }, []);

  const filteredLogs = logs.filter(log => filterLevel === 'all' || log.status === filterLevel);

  return (
    <div className="space-y-8 animate-in fade-in duration-700 pb-24 relative font-sans">
       <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[400px] bg-red-500/5 blur-[100px] pointer-events-none" />

       <header className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-5 relative z-10">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-red-500 mb-1">
            <ShieldCheck className="h-4 w-4" />
            <span className="text-[10px] font-black uppercase tracking-[0.3em]">Coffre-fort & Accès</span>
          </div>
          <h1 className="text-3xl font-black text-white uppercase tracking-tight">Rôles & Sécurité</h1>
          <p className="text-slate-400 text-sm font-medium">Configurez les privilèges, surveillez les actions.</p>
        </div>
      </header>

      {/* Tabs */}
      <div className="relative z-10 flex flex-col gap-6">
        <div className="flex overflow-x-auto hide-scrollbar bg-slate-900/50 border border-slate-800 p-1.5 rounded-2xl w-full lg:w-fit shadow-2xl">
            <button 
              onClick={() => setLogType('audit')}
              className={clsx(
                "flex items-center justify-center gap-2 px-6 py-3 font-bold uppercase text-[10px] tracking-widest rounded-xl transition-all whitespace-nowrap",
                logType === 'audit' ? "bg-slate-800 text-white shadow-sm" : "text-slate-500 hover:text-slate-300"
              )}
            >
                <History className="h-4 w-4" /> Gestion des Rôles
            </button>
            <button 
              onClick={() => setLogType('security')}
              className={clsx(
                "flex items-center justify-center gap-2 px-6 py-3 font-bold uppercase text-[10px] tracking-widest rounded-xl transition-all whitespace-nowrap",
                logType === 'security' ? "bg-red-500/10 text-red-500 border border-red-500/20 shadow-sm" : "text-red-500/50 hover:text-red-400/80"
              )}
            >
                <ShieldAlert className="h-4 w-4" /> Journal de Sécurité
            </button>
        </div>

        {logType === 'audit' && (
           <div className="bg-slate-800/30 border border-dashed border-slate-700/50 rounded-3xl p-10 flex flex-col items-center justify-center text-center mt-2 h-[400px]">
              <div className="w-16 h-16 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center mb-4">
                <UserCog className="w-8 h-8 text-blue-400" />
              </div>
              <h3 className="text-white font-black mb-2 uppercase tracking-widest text-lg">Moteur de Permissions</h3>
              <p className="text-sm text-slate-400 max-w-md font-medium">Le système RBAC (Role-Based Access Control) est géré au niveau des fonctions Cloud. Interface de configuration granulaire en cours de déploiement.</p>
           </div>
        )}

        {logType === 'security' && (
          <div className="space-y-6">
            
            {/* Quick Thumb Filters (Mobile First) */}
            <div className="flex overflow-x-auto hide-scrollbar gap-2 pb-2">
               <button 
                 onClick={() => setFilterLevel('all')}
                 className={clsx(
                   "flex items-center gap-2 px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-colors shrink-0",
                   filterLevel === 'all' ? "bg-slate-800 text-white border border-slate-700" : "bg-slate-900 border border-slate-800 text-slate-500"
                 )}
               >
                 <Filter className="w-3.5 h-3.5" /> Tout
               </button>
               <button 
                 onClick={() => setFilterLevel('info')}
                 className={clsx(
                   "flex items-center gap-2 px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-colors shrink-0",
                   filterLevel === 'info' ? "bg-blue-500/20 text-blue-400 border border-blue-500/30" : "bg-slate-900 border border-slate-800 text-slate-500 hover:border-blue-500/20 hover:text-blue-500/50"
                 )}
               >
                 <div className="w-2 h-2 rounded-full bg-blue-500" /> Info
               </button>
               <button 
                 onClick={() => setFilterLevel('warning')}
                 className={clsx(
                   "flex items-center gap-2 px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-colors shrink-0",
                   filterLevel === 'warning' ? "bg-amber-500/20 text-amber-500 border border-amber-500/30" : "bg-slate-900 border border-slate-800 text-slate-500 hover:border-amber-500/20 hover:text-amber-500/50"
                 )}
               >
                 <div className="w-2 h-2 rounded-full bg-amber-500" /> Warning
               </button>
               <button 
                 onClick={() => setFilterLevel('danger')}
                 className={clsx(
                   "flex items-center gap-2 px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-colors shrink-0",
                   filterLevel === 'danger' ? "bg-red-500/20 text-red-500 border border-red-500/30" : "bg-slate-900 border border-slate-800 text-slate-500 hover:border-red-500/20 hover:text-red-500/50"
                 )}
               >
                 <div className="w-2 h-2 rounded-full bg-red-500" /> Danger
               </button>
            </div>

            {/* Timeline View */}
            <div className="bg-slate-800/20 border border-slate-700/50 rounded-3xl p-4 sm:p-6 lg:p-8">
              {isLoading ? (
                <div className="space-y-6">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="flex gap-4">
                      <div className="w-10 h-10 rounded-full bg-slate-800 animate-pulse shrink-0" />
                      <div className="space-y-2 flex-1">
                        <div className="h-4 bg-slate-800 rounded w-1/3 animate-pulse" />
                        <div className="h-3 bg-slate-800/50 rounded w-2/3 animate-pulse" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : filteredLogs.length > 0 ? (
                <div className="relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-800 before:to-transparent">
                  {filteredLogs.map((log) => (
                    <div key={log.id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active mb-8 last:mb-0">
                      
                      {/* Timeline Icon */}
                      <div className={clsx(
                        "flex items-center justify-center w-10 h-10 rounded-full border-4 border-[#090E17] shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 shadow-sm relative z-10",
                        log.status === 'danger' ? "bg-red-500/20 text-red-500" :
                        log.status === 'warning' ? "bg-amber-500/20 text-amber-500" :
                        "bg-blue-500/20 text-blue-400"
                      )}>
                         <LogIcon type={log.eventType} />
                      </div>

                      {/* Content Card */}
                      <div className="w-[calc(100%-3rem)] md:w-[calc(50%-2.5rem)] p-4 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl ml-4 md:ml-0 transition-transform group-hover:-translate-y-1">
                        <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                           <span className={clsx(
                             "text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded border",
                             log.status === 'danger' ? "bg-red-500/10 text-red-500 border-red-500/20" :
                             log.status === 'warning' ? "bg-amber-500/10 text-amber-500 border-amber-500/20" :
                             "bg-slate-800 text-slate-400 border-slate-700"
                           )}>
                             {log.eventType.replace(/_/g, ' ')}
                           </span>
                           <span className="text-[10px] font-bold text-slate-500 uppercase flex items-center gap-1">
                             <Clock className="w-3 h-3" />
                             {format(log.timestamp, "dd MMM HH:mm")}
                           </span>
                        </div>
                        <p className="text-sm font-medium text-slate-300 leading-relaxed mb-3">
                          {log.details}
                        </p>
                        <div className="text-[10px] font-mono text-slate-500 bg-black/40 px-3 py-2 rounded-lg truncate">
                          Cible: {log.targetId}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-20 flex flex-col items-center">
                   <ShieldCheck className="w-16 h-16 text-slate-700 mb-4" />
                   <p className="text-sm font-black uppercase tracking-widest text-slate-500">Aucun journal correspondant</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
