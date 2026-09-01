import React, { useState, useEffect, useCallback } from 'react';
import { AuditLogService, AuditLog, AuditFilters } from '../../services/auditLogService';
import { ActivityLog } from '../../components/admin/ActivityLog';
import { Shield, Loader2, RefreshCw, AlertCircle, Search, Filter } from 'lucide-react';

export const AuditLogs: React.FC = () => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isMock, setIsMock] = useState<boolean>(false);

  // Filtres
  const [filters, setFilters] = useState<AuditFilters>({
    severity: 'all',
    status: 'all',
    action: 'all',
    search: ''
  });

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await AuditLogService.getLogs(filters);
      setLogs(response.logs);
      setIsMock(response.isMock);
    } catch (err) {
      setError('Impossible de charger les journaux d\'audit. Veuillez réessayer.');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  // Chargement initial et lors de la modification des filtres
  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  const handleFilterChange = (key: keyof AuditFilters, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  return (
    <div className="w-full max-w-5xl mx-auto flex flex-col gap-6 p-4 sm:p-6 lg:p-8">
      
      {/* En-tête de la page */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div className="flex flex-col gap-2">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white flex items-center gap-3">
            <Shield className="w-7 h-7 text-indigo-600 dark:text-indigo-400" />
            Audit Logs
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Journal de sécurité et traçabilité des actions administratives.
          </p>
          {isMock && (
            <div className="mt-1 inline-flex items-center gap-1.5 self-start px-2.5 py-1 bg-amber-100 dark:bg-amber-900/40 text-amber-800 dark:text-amber-400 text-xs font-bold rounded-md uppercase tracking-wide border border-amber-200 dark:border-amber-800">
              <AlertCircle className="w-3.5 h-3.5" />
              Mode Démonstration
            </div>
          )}
        </div>

        <button
          onClick={fetchLogs}
          disabled={loading}
          className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 text-gray-700 dark:text-gray-300 font-medium rounded-xl transition-colors disabled:opacity-50 min-h-[44px]"
          aria-label="Rafraîchir les journaux"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          <span className="hidden sm:inline">Rafraîchir</span>
        </button>
      </div>

      {/* Zone de Filtrage (Scrollable horizontalement sur mobile) */}
      <div className="flex flex-col gap-4 bg-gray-50 dark:bg-gray-800/40 p-4 rounded-2xl border border-gray-200 dark:border-gray-800">
        <div className="flex items-center gap-2 text-sm font-bold text-gray-700 dark:text-gray-300">
          <Filter className="w-4 h-4" />
          Filtres
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          
          {/* Recherche */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher (Utilisateur, ressource, action)..."
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500/50 outline-none min-h-[44px] transition-shadow"
            />
          </div>

          {/* Sévérité */}
          <select
            value={filters.severity}
            onChange={(e) => handleFilterChange('severity', e.target.value)}
            className="w-full sm:w-auto px-4 py-2.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500/50 outline-none min-h-[44px] cursor-pointer"
            aria-label="Filtrer par niveau de gravité"
          >
            <option value="all">Toutes les gravités</option>
            <option value="info">Information</option>
            <option value="warning">Avertissement</option>
            <option value="critical">Critique</option>
          </select>

          {/* Statut */}
          <select
            value={filters.status}
            onChange={(e) => handleFilterChange('status', e.target.value)}
            className="w-full sm:w-auto px-4 py-2.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500/50 outline-none min-h-[44px] cursor-pointer"
            aria-label="Filtrer par statut"
          >
            <option value="all">Tous les statuts</option>
            <option value="success">Succès</option>
            <option value="failed">Échec</option>
            <option value="denied">Refusé</option>
          </select>
        </div>
      </div>

      {/* Contenu : Liste des logs */}
      <div className="flex flex-col gap-4 min-h-[40vh]">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-12 flex-1">
            <Loader2 className="w-8 h-8 animate-spin text-indigo-500 mb-4" />
            <p className="text-sm text-gray-500 dark:text-gray-400">Récupération des journaux...</p>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center p-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl flex-1 text-center">
            <AlertCircle className="w-10 h-10 text-red-500 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-red-800 dark:text-red-400 mb-2">Erreur système</h3>
            <p className="text-sm text-red-600 dark:text-red-300">{error}</p>
          </div>
        ) : logs.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-8 border border-dashed border-gray-300 dark:border-gray-700 rounded-3xl flex-1 bg-gray-50 dark:bg-gray-800/20 text-center">
            <Shield className="w-12 h-12 text-gray-300 dark:text-gray-600 mb-4 opacity-50" />
            <p className="font-semibold text-gray-700 dark:text-gray-300">Aucun journal trouvé.</p>
            <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">Essayez de modifier vos filtres de recherche.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {logs.map((log) => (
              <ActivityLog key={log.id} log={log} />
            ))}
          </div>
        )}
      </div>

    </div>
  );
};
