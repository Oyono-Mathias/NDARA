import React from 'react';
import { AuditLog } from '../../services/auditLogService';
import { Info, AlertTriangle, ShieldAlert, User, FileText, Activity } from 'lucide-react';

interface ActivityLogProps {
  log: AuditLog;
}

export const ActivityLog: React.FC<ActivityLogProps> = ({ log }) => {
  // Styles et icônes basés sur la sévérité
  const severityConfig = {
    info: {
      color: 'text-blue-600 dark:text-blue-400',
      bg: 'bg-blue-50 dark:bg-blue-900/20',
      border: 'border-blue-200 dark:border-blue-800',
      icon: <Info className="w-5 h-5" aria-hidden="true" />
    },
    warning: {
      color: 'text-amber-600 dark:text-amber-400',
      bg: 'bg-amber-50 dark:bg-amber-900/20',
      border: 'border-amber-200 dark:border-amber-800',
      icon: <AlertTriangle className="w-5 h-5" aria-hidden="true" />
    },
    critical: {
      color: 'text-red-600 dark:text-red-400',
      bg: 'bg-red-50 dark:bg-red-900/20',
      border: 'border-red-200 dark:border-red-800',
      icon: <ShieldAlert className="w-5 h-5" aria-hidden="true" />
    }
  };

  const config = severityConfig[log.severity];
  
  // Formatage de la date (locale)
  const dateObj = new Date(log.timestamp);
  // (removed formattedDate)

  return (
    <article className={`w-full flex flex-col sm:flex-row gap-4 p-4 rounded-xl border transition-colors ${config.bg} ${config.border} ${config.color.replace('text-', 'text-opacity-90 ')}`}>
      
      {/* Icône et Timestamp */}
      <div className="flex sm:flex-col items-center sm:items-start justify-between sm:justify-start gap-2 sm:w-32 shrink-0">
        <div className={`flex items-center justify-center w-10 h-10 rounded-full bg-white dark:bg-gray-800 shadow-sm ${config.color}`}>
          {config.icon}
        </div>
        <div className="text-right sm:text-left flex flex-col">
          <span className="text-[10px] sm:text-xs font-bold text-gray-900 dark:text-gray-100 uppercase tracking-wider">
            {dateObj.toLocaleDateString('fr-FR')}
          </span>
          <span className="text-[10px] text-gray-500 dark:text-gray-400 font-mono">
            {dateObj.toLocaleTimeString('fr-FR')}
          </span>
        </div>
      </div>

      {/* Contenu principal */}
      <div className="flex flex-col gap-2 flex-1 min-w-0">
        
        {/* En-tête : Action et Statut */}
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h4 className="font-bold text-sm sm:text-base text-gray-900 dark:text-white break-words">
            {log.action.replace(/_/g, ' ').toUpperCase()}
          </h4>
          <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-widest ${
            log.status === 'success' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-400' :
            log.status === 'failed' ? 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-400' :
            'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-400'
          }`}>
            {log.status}
          </span>
        </div>

        {/* Détails : Acteur et Ressource */}
        <div className="flex flex-col gap-1.5 mt-1">
          <div className="flex items-start gap-2 text-sm text-gray-700 dark:text-gray-300">
            <User className="w-4 h-4 mt-0.5 shrink-0 text-gray-400" />
            <div className="flex flex-col">
              <span className="font-semibold break-words line-clamp-1">{log.actor.name || log.actor.id}</span>
              <span className="text-xs text-gray-500 dark:text-gray-400">{log.actor.role || 'Rôle inconnu'} • ID: {log.actor.id}</span>
            </div>
          </div>
          
          {log.resource && (
            <div className="flex items-start gap-2 text-sm text-gray-700 dark:text-gray-300">
              <FileText className="w-4 h-4 mt-0.5 shrink-0 text-gray-400" />
              <div className="flex flex-col">
                <span className="font-medium break-words line-clamp-1">Ressource: {log.resource.name || log.resource.id}</span>
                <span className="text-xs text-gray-500 dark:text-gray-400">Type: {log.resource.type}</span>
              </div>
            </div>
          )}
        </div>

        {/* Métadonnées optionnelles */}
        {log.metadata && Object.keys(log.metadata).length > 0 && (
          <div className="mt-2 p-2.5 bg-white/60 dark:bg-gray-900/40 rounded-lg border border-gray-200/50 dark:border-gray-700/50">
            <div className="flex items-center gap-1.5 mb-1.5 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">
              <Activity className="w-3.5 h-3.5" />
              Métadonnées
            </div>
            <pre className="text-[10px] sm:text-xs text-gray-600 dark:text-gray-400 font-mono overflow-x-auto whitespace-pre-wrap break-words">
              {JSON.stringify(log.metadata, null, 2)}
            </pre>
          </div>
        )}

      </div>
    </article>
  );
};
