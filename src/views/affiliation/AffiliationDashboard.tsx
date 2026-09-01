import React, { useEffect } from 'react';
import { useAffiliation } from '../../hooks/useAffiliation';
import { ReferralStats } from '../../components/affiliation/ReferralStats';
import { ReferralLinks } from './ReferralLinks';
import { CommissionHistory } from './CommissionHistory';
import { Award, AlertCircle, Loader2, RefreshCw } from 'lucide-react';

export const AffiliationDashboard: React.FC = () => {
  const { stats, loading, error, fetchDashboardData } = useAffiliation();

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  if (loading && !stats) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh]">
        <Loader2 className="w-10 h-10 animate-spin text-indigo-500 mb-4" />
        <p className="text-gray-500 dark:text-gray-400 font-medium">Chargement de votre tableau de bord...</p>
      </div>
    );
  }

  if (error && !stats) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] p-6 text-center">
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-6 rounded-2xl max-w-md">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-red-800 dark:text-red-400 mb-2">Impossible de charger les données</h3>
          <p className="text-sm text-red-600 dark:text-red-300 mb-6">{error}</p>
          <button 
            onClick={fetchDashboardData}
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl transition-colors min-h-[44px]"
          >
            <RefreshCw className="w-5 h-5" />
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-6xl mx-auto flex flex-col gap-8 p-4 sm:p-6 lg:p-8">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <div className="flex flex-col gap-2">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white flex items-center gap-3">
            <Award className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
            Programme d'Affiliation
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Gérez vos liens de parrainage, suivez vos conversions et vos commissions.
          </p>
          {stats?.isMock && (
            <div className="mt-2 inline-flex items-center gap-1.5 self-start px-2.5 py-1 bg-amber-100 dark:bg-amber-900/40 text-amber-800 dark:text-amber-400 text-xs font-bold rounded-md uppercase tracking-wide border border-amber-200 dark:border-amber-800">
              <AlertCircle className="w-3.5 h-3.5" />
              Mode Démonstration / Mock
            </div>
          )}
        </div>

        <button
          onClick={fetchDashboardData}
          disabled={loading}
          className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 text-gray-700 dark:text-gray-300 font-medium rounded-xl transition-colors disabled:opacity-50 min-h-[44px]"
          aria-label="Rafraîchir les données"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          <span className="hidden sm:inline">Rafraîchir</span>
        </button>
      </div>

      {/* KPI Stats */}
      {stats && <ReferralStats stats={stats} />}

      <hr className="border-gray-200 dark:border-gray-800" />

      {/* Liens de Parrainage */}
      <ReferralLinks />

      <hr className="border-gray-200 dark:border-gray-800" />

      {/* Historique des Commissions */}
      <CommissionHistory />

    </div>
  );
};
