import React from 'react';
import { useAnalytics } from '../../hooks/useAnalytics';
import { StatsCard } from '../../components/analytics/StatsCard';
import { AlertCircle, Lock, DollarSign, Activity, CreditCard, RefreshCcw } from 'lucide-react';
import { ChartComponent } from '../../components/analytics/ChartComponent';

export const RevenueAnalytics: React.FC = () => {
  const { revenueAnalytics, loading, error } = useAnalytics();

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center p-8 bg-red-50 dark:bg-red-900/20 rounded-xl">
        <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
        <h2 className="text-lg font-bold text-red-700 dark:text-red-400">Erreur de chargement</h2>
      </div>
    );
  }

  // RÈGLE CRITIQUE: Si les données sont des mocks ou si backend non connecté,
  // nous affichons fermement l'indisponibilité.
  const isUnavailable = !loading && (!revenueAnalytics || revenueAnalytics.isMock);

  return (
    <div className="w-full max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Revenus & Finances</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Rapports financiers certifiés. (Ne peuvent être générés que par le serveur)
        </p>
      </div>

      {isUnavailable && (
        <div className="mb-8 p-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl flex flex-col items-center justify-center text-center">
          <Lock className="w-10 h-10 text-red-500 dark:text-red-400 mb-3" />
          <h3 className="text-lg font-bold text-red-800 dark:text-red-400">
            Données financières indisponibles
          </h3>
          <p className="text-sm text-red-600 dark:text-red-300 mt-2 max-w-md">
            Pour des raisons de sécurité (Zero Trust), les données de revenus ne peuvent pas être calculées ou simulées localement. 
            Veuillez connecter le backend financier pour accéder à ce rapport.
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 mb-8">
        <StatsCard
          title="Revenu Total"
          value="-"
          icon={<DollarSign className="w-5 h-5" />}
          loading={loading}
          unavailable={isUnavailable}
        />
        <StatsCard
          title="Revenu Brut"
          value="-"
          icon={<DollarSign className="w-5 h-5" />}
          loading={loading}
          unavailable={isUnavailable}
        />
        <StatsCard
          title="Revenu Net"
          value="-"
          icon={<Activity className="w-5 h-5" />}
          loading={loading}
          unavailable={isUnavailable}
        />
        <StatsCard
          title="Remboursements"
          value="-"
          icon={<RefreshCcw className="w-5 h-5" />}
          loading={loading}
          unavailable={isUnavailable}
        />
        <StatsCard
          title="Nombre de Transactions"
          value="-"
          icon={<CreditCard className="w-5 h-5" />}
          loading={loading}
          unavailable={isUnavailable}
        />
        <StatsCard
          title="Panier Moyen"
          value="-"
          icon={<DollarSign className="w-5 h-5" />}
          loading={loading}
          unavailable={isUnavailable}
        />
      </div>

      <ChartComponent
        title="Évolution des Revenus"
        data={[]}
        loading={loading}
        unavailable={isUnavailable}
      />
    </div>
  );
};
