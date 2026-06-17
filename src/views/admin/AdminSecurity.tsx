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
  Filter,
  Users
} from 'lucide-react';
import clsx from 'clsx';
import { format } from 'date-fns';
import { collection, query, orderBy, limit, onSnapshot, doc, updateDoc, where } from 'firebase/firestore';
import { db } from '../../firebase';
import { EmptyState, NdaraSkeleton } from './AdminSupport';

interface SecurityLog {
  id: string;
  eventType: string;
  status: 'info' | 'warning' | 'danger';
  details: string;
  targetId: string;
  timestamp: Date;
}

interface AdminUser {
  id: string;
  email: string;
  displayName: string;
  role: string;
  permissions?: {
    financial?: boolean;
    support?: boolean;
    marketing?: boolean;
  };
}

const LogIcon = ({ type }: { type: string }) => {
  if (!type) return <Info className="h-4 w-4 text-slate-400" />;
  const t = type.toLowerCase();
  if (t.includes('user') || t.includes('role')) return <UserCog className="h-4 w-4 text-blue-400" />;
  if (t.includes('course') || t.includes('database')) return <Database className="h-4 w-4 text-emerald-400" />;
  if (t.includes('payment') || t.includes('financial')) return <CreditCard className="h-4 w-4 text-amber-400" />;
  if (t.includes('security') || t.includes('suspicious') || t.includes('auth')) return <Lock className="h-4 w-4 text-red-500" />;
  return <Info className="h-4 w-4 text-slate-400" />;
};

const PermissionToggle = ({ label, active, onToggle, critical = false }: { label: string, active: boolean, onToggle: () => void, critical?: boolean }) => {
  return (
    <button 
      onClick={onToggle}
      className={clsx(
        "flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-[9px] font-black uppercase tracking-widest transition-all",
        active 
          ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/30 hover:bg-emerald-500 hover:text-white"
          : "bg-slate-900 border-slate-800 text-slate-500 hover:bg-slate-800 hover:text-white"
      )}
    >
      <div className={clsx("w-2 h-2 rounded-full", active ? "bg-emerald-500" : critical ? "bg-red-500/50" : "bg-slate-600")} />
      {label}
    </button>
  );
};

export function AdminSecurity() {
  const [activeTab, setActiveTab] = useState<'roles' | 'logs'>('roles');
  const [filterLevel, setFilterLevel] = useState<'all' | 'info' | 'warning' | 'danger'>('all');
  
  const [logs, setLogs] = useState<SecurityLog[]>([]);
  const [isLoadingLogs, setIsLoadingLogs] = useState(true);
  
  const [admins, setAdmins] = useState<AdminUser[]>([]);
  const [isLoadingAdmins, setIsLoadingAdmins] = useState(true);

  useEffect(() => {
    // 1. Audit Logs (Append-Only, Read-Only in UI)
    const qLogs = query(collection(db, 'security_audit_logs'), orderBy('timestamp', 'desc'), limit(50));
    const unsubLogs = onSnapshot(qLogs, (snap) => {
      const fetched: SecurityLog[] = [];
      snap.forEach(doc => {
        const data = doc.data();
        fetched.push({
          id: doc.id,
          eventType: data.eventType || 'unknown',
          status: data.status || 'info',
          details: data.details || '',
          targetId: data.targetId || 'system',
          timestamp: data.timestamp?.toDate ? data.timestamp.toDate() : new Date(data.timestamp || Date.now())
        });
      });
      setLogs(fetched);
      setIsLoadingLogs(false);
    }, (err) => {
      console.error("Erreur de récupération audit logs:", err);
      setIsLoadingLogs(false);
    });

    // 2. Gestion des rôles - Écoute des modérateurs et administrateurs
    const qAdmins = query(collection(db, 'users'), where('role', 'in', ['admin', 'moderator', 'superadmin']));
    const unsubAdmins = onSnapshot(qAdmins, (snap) => {
      const fetched: AdminUser[] = [];
      snap.forEach(doc => {
        const data = doc.data();
        fetched.push({
          id: doc.id,
          email: data.email || doc.id,
          displayName: data.displayName || data.name || 'Inconnu',
          role: data.role || 'moderator',
          permissions: data.permissions || {}
        });
      });
      setAdmins(fetched);
      setIsLoadingAdmins(false);
    }, (err) => {
      console.error("Erreur de récupération des admins:", err);
      setIsLoadingAdmins(false);
    });

    return () => {
      unsubLogs();
      unsubAdmins();
    };
  }, []);

  const handleTogglePermission = async (userId: string, permissionKey: 'financial' | 'support' | 'marketing', currentValue: boolean) => {
    try {
      const docRef = doc(db, 'users', userId);
      await updateDoc(docRef, {
        [`permissions.${permissionKey}`]: !currentValue
      });
    } catch (err) {
      console.error("Erreur de modification de permission :", err);
    }
  };

  const handleUpdateRole = async (userId: string, newRole: string) => {
    try {
      const docRef = doc(db, 'users', userId);
      await updateDoc(docRef, { role: newRole });
    } catch(err) {
      console.error("Erreur de modification de rôle :", err);
    }
  };

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
          <h1 className="text-3xl font-black text-white uppercase tracking-tight">Sécurité & Audit</h1>
          <p className="text-slate-400 text-sm font-medium">Contrôlez les accès administrateurs et surveillez l'activité.</p>
        </div>
      </header>

      {/* Tabs */}
      <div className="relative z-10 flex flex-col gap-6">
        <div className="flex overflow-x-auto hide-scrollbar bg-slate-900/50 border border-slate-800 p-1.5 rounded-2xl w-full lg:w-fit shadow-2xl">
            <button 
              onClick={() => setActiveTab('roles')}
              className={clsx(
                "flex items-center justify-center gap-2 px-6 py-3 font-bold uppercase text-[10px] tracking-widest rounded-xl transition-all whitespace-nowrap",
                activeTab === 'roles' ? "bg-slate-800 text-white shadow-sm" : "text-slate-500 hover:bg-slate-800/30 hover:text-slate-300"
              )}
            >
                <Users className="h-4 w-4" /> Contrôle des Rôles
            </button>
            <button 
              onClick={() => setActiveTab('logs')}
              className={clsx(
                "flex items-center justify-center gap-2 px-6 py-3 font-bold uppercase text-[10px] tracking-widest rounded-xl transition-all whitespace-nowrap",
                activeTab === 'logs' ? "bg-red-500/10 text-red-500 shadow-sm" : "text-red-500/50 hover:bg-red-500/5 hover:text-red-400/80"
              )}
            >
                <ShieldAlert className="h-4 w-4" /> Journal d'Audit technique
            </button>
        </div>

        {activeTab === 'roles' && (
           <div className="animate-in fade-in">
             {isLoadingAdmins ? (
               <NdaraSkeleton type="table" />
             ) : (
               <div className="bg-slate-800/30 border border-slate-700/50 rounded-3xl overflow-hidden shadow-2xl">
                 <div className="p-5 bg-slate-900/50 border-b border-slate-800 flex justify-between items-center">
                   <h3 className="text-xs font-black uppercase tracking-widest text-slate-400">Collaborateurs & Permissions</h3>
                 </div>
                 <div className="overflow-x-auto hide-scrollbar">
                   <table className="w-full text-left border-collapse min-w-[800px]">
                     <thead>
                       <tr className="border-b border-slate-800 bg-slate-900/50">
                         <th className="p-4 pl-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Profil Administrateur</th>
                         <th className="p-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Rôle Global</th>
                         <th className="p-4 pr-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Permissions Granulaires</th>
                       </tr>
                     </thead>
                     <tbody className="text-sm divide-y divide-slate-800">
                       {admins.map((admin) => (
                         <tr key={admin.id} className="hover:bg-slate-800/20 transition-colors group">
                           <td className="p-4 pl-6">
                             <div className="flex items-center gap-3">
                               <div className="h-10 w-10 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center">
                                 <UserCog className={clsx("w-5 h-5", admin.role === 'superadmin' ? 'text-emerald-500' : 'text-blue-400')} />
                               </div>
                               <div className="flex flex-col">
                                 <span className="text-sm font-bold text-white">{admin.displayName}</span>
                                 <span className="text-[10px] font-mono text-slate-400">{admin.email}</span>
                               </div>
                             </div>
                           </td>
                           <td className="p-4">
                             <select 
                               value={admin.role}
                               onChange={(e) => handleUpdateRole(admin.id, e.target.value)}
                               className="bg-slate-900 border border-slate-700/50 rounded-xl py-2 px-3 text-xs font-bold text-white uppercase tracking-widest outline-none focus:border-emerald-500/50 transition-colors"
                             >
                               <option value="moderator">Modérateur</option>
                               <option value="admin">Administrateur</option>
                               <option value="superadmin">Super Admin</option>
                             </select>
                           </td>
                           <td className="p-4 pr-6">
                             <div className="flex items-center gap-2">
                               <PermissionToggle 
                                 label="Finance" 
                                 active={admin.permissions?.financial || false} 
                                 onToggle={() => handleTogglePermission(admin.id, 'financial', admin.permissions?.financial || false)}
                                 critical
                               />
                               <PermissionToggle 
                                 label="Support" 
                                 active={admin.permissions?.support || false} 
                                 onToggle={() => handleTogglePermission(admin.id, 'support', admin.permissions?.support || false)}
                               />
                               <PermissionToggle 
                                 label="Marketing" 
                                 active={admin.permissions?.marketing || false} 
                                 onToggle={() => handleTogglePermission(admin.id, 'marketing', admin.permissions?.marketing || false)}
                               />
                             </div>
                           </td>
                         </tr>
                       ))}
                       {admins.length === 0 && (
                         <tr>
                           <td colSpan={3} className="p-8">
                             <EmptyState title="Aucun administrateur" message="Base de données introuvable ou rôles non définis." />
                           </td>
                         </tr>
                       )}
                     </tbody>
                   </table>
                 </div>
               </div>
             )}
           </div>
        )}

        {activeTab === 'logs' && (
          <div className="space-y-6 animate-in fade-in">
            
            {/* Quick Thumb Filters (Mobile First) */}
            <div className="flex overflow-x-auto hide-scrollbar gap-2 pb-2">
               <button 
                 onClick={() => setFilterLevel('all')}
                 className={clsx(
                   "flex items-center gap-2 px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-colors shrink-0",
                   filterLevel === 'all' ? "bg-slate-800 text-white border border-slate-700" : "bg-slate-900 border border-slate-800 text-slate-500 hover:bg-slate-800/50"
                 )}
               >
                 <Filter className="w-3.5 h-3.5" /> Tout ({logs.length})
               </button>
               <button 
                 onClick={() => setFilterLevel('info')}
                 className={clsx(
                   "flex items-center gap-2 px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-colors shrink-0",
                   filterLevel === 'info' ? "bg-blue-500/20 text-blue-400 border border-blue-500/30" : "bg-slate-900 border border-slate-800 text-slate-500 hover:border-blue-500/20 hover:text-blue-500/50"
                 )}
               >
                 <div className="w-2 h-2 rounded-full bg-blue-500" /> Informations
               </button>
               <button 
                 onClick={() => setFilterLevel('warning')}
                 className={clsx(
                   "flex items-center gap-2 px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-colors shrink-0",
                   filterLevel === 'warning' ? "bg-amber-500/20 text-amber-500 border border-amber-500/30" : "bg-slate-900 border border-slate-800 text-slate-500 hover:border-amber-500/20 hover:text-amber-500/50"
                 )}
               >
                 <div className="w-2 h-2 rounded-full bg-amber-500" /> Avertissements
               </button>
               <button 
                 onClick={() => setFilterLevel('danger')}
                 className={clsx(
                   "flex items-center gap-2 px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-colors shrink-0",
                   filterLevel === 'danger' ? "bg-red-500/20 text-red-500 border border-red-500/30" : "bg-slate-900 border border-slate-800 text-slate-500 hover:border-red-500/20 hover:text-red-500/50"
                 )}
               >
                 <div className="w-2 h-2 rounded-full bg-red-500" /> Opérations Critiques
               </button>
            </div>

            {/* Timeline View */}
            <div className="bg-slate-800/20 border border-slate-700/50 rounded-3xl p-4 sm:p-6 lg:p-8 shadow-2xl">
              {isLoadingLogs ? (
                <NdaraSkeleton type="table" />
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
                      <div className="w-[calc(100%-3rem)] md:w-[calc(50%-2.5rem)] p-5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl ml-4 md:ml-0 transition-transform group-hover:-translate-y-1">
                        <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                           <span className={clsx(
                             "text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded border",
                             log.status === 'danger' ? "bg-red-500/10 text-red-500 border-red-500/30" :
                             log.status === 'warning' ? "bg-amber-500/10 text-amber-500 border-amber-500/30" :
                             "bg-slate-800 text-slate-400 border-slate-700/50"
                           )}>
                             {log.eventType.replace(/_/g, ' ')}
                           </span>
                           <span className="text-[10px] font-bold text-slate-500 uppercase flex items-center gap-1.5">
                             <Clock className="w-3 h-3" />
                             {format(log.timestamp, "dd MMM HH:mm:ss")}
                           </span>
                        </div>
                        <p className="text-sm font-medium text-slate-200 leading-relaxed mb-3">
                          {log.details}
                        </p>
                        <div className="flex items-center gap-2 text-[10px] font-mono text-slate-400 bg-black/40 px-3 py-2 rounded-lg border border-slate-800/50">
                          <span className="text-slate-600">CIBLE:</span> <span className="truncate">{log.targetId}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <EmptyState title="Aucune alerte" message="Le journal d'audit technique est vierge." icon={ShieldCheck} />
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

