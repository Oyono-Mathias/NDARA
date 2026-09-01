import React from 'react';
import { useAnalytics } from '../../hooks/useAnalytics';
import { StatsCard } from '../../components/analytics/StatsCard';
import { ChartComponent } from '../../components/analytics/ChartComponent';
import { Users, UserPlus, UserCheck, Activity, AlertTriangle, Clock, CheckCircle } from 'lucide-react';

export const UserAnalytics: React.FC = () => {
  const { userAnalytics, loading, error } = useAnalytics();

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center p-8 bg-red-50 dark:bg-red-900/20 rounded-xl">
        <AlertTriangle className="w-12 h-12 text-red-500 mb-4" />
        <h2 className="text-lg font-bold text-red-700 dark:text-red-400">Erreur de chargement</h2>
      </div>
    );
  }

  return (
    <div className="w-full max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Audience</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Analyse de l'acquisition et de la rétention des étudiants.
        </p>
      </div>

      {!loading && userAnalytics?.isMock && (
        <div className="mb-8 p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-500 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-amber-700 dark:text-amber-500">
            Backend non connecté : Ces données d'audience sont des simulations.
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
        <StatsCard
          title="Utilisateurs Totaux"
          value={userAnalytics?.totalUsers.value ?? '-'}
          variation={userAnalytics?.totalUsers.variation}
          trend={userAnalytics?.totalUsers.trend}
          icon={<Users className="w-5 h-5" />}
          loading={loading}
          isMock={userAnalytics?.isMock}
        />
        <StatsCard
          title="Utilisateurs Actifs"
          value={userAnalytics?.activeUsers.value ?? '-'}
          variation={userAnalytics?.activeUsers.variation}
          trend={userAnalytics?.activeUsers.trend}
          icon={<Activity className="w-5 h-5" />}
          loading={loading}
          isMock={userAnalytics?.isMock}
        />
        <StatsCard
          title="Nouveaux Inscrits"
          value={userAnalytics?.newUsers.value ?? '-'}
          variation={userAnalytics?.newUsers.variation}
          trend={userAnalytics?.newUsers.trend}
          icon={<UserPlus className="w-5 h-5" />}
          loading={loading}
          isMock={userAnalytics?.isMock}
        />
        <StatsCard
          title="Utilisateurs Récurrents"
          value={userAnalytics?.returningUsers.value ?? '-'}
          variation={userAnalytics?.returningUsers.variation}
          trend={userAnalytics?.returningUsers.trend}
          icon={<UserCheck className="w-5 h-5" />}
          loading={loading}
          isMock={userAnalytics?.isMock}
        />
        <StatsCard
          title="Cours Terminés (Total)"
          value={userAnalytics?.completedCourses.value ?? '-'}
          variation={userAnalytics?.completedCourses.variation}
          trend={userAnalytics?.completedCourses.trend}
          icon={<CheckCircle className="w-5 h-5" />}
          loading={loading}
          isMock={userAnalytics?.isMock}
        />
        <StatsCard
          title="Temps d'apprentissage moy."
          value={userAnalytics?.averageLearningTime.value ?? '-'}
          unit="min"
          variation={userAnalytics?.averageLearningTime.variation}
          trend={userAnalytics?.averageLearningTime.trend}
          icon={<Clock className="w-5 h-5" />}
          loading={loading}
          isMock={userAnalytics?.isMock}
        />
        <StatsCard
          title="Taux de complétion moy."
          value={userAnalytics?.averageCompletionRate.value ?? '-'}
          unit="%"
          variation={userAnalytics?.averageCompletionRate.variation}
          trend={userAnalytics?.averageCompletionRate.trend}
          icon={<Activity className="w-5 h-5" />}
          loading={loading}
          isMock={userAnalytics?.isMock}
        />
      </div>

      <ChartComponent
        title="Croissance de l'audience"
        data={userAnalytics?.userGrowthChart || []}
        loading={loading}
        isMock={userAnalytics?.isMock}
      />
    </div>
  );
};
