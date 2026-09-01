import React from 'react';
import { useAnalytics } from '../../hooks/useAnalytics';
import { StatsCard } from '../../components/analytics/StatsCard';
import { ChartComponent } from '../../components/analytics/ChartComponent';
import { Clock, PlayCircle, CheckSquare, AlertTriangle, Users, BookOpen, HelpCircle } from 'lucide-react';

export const EngagementAnalytics: React.FC = () => {
  const { engagementAnalytics, loading, error } = useAnalytics();

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
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Engagement</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Analyse du temps passé et des interactions sur la plateforme.
        </p>
      </div>

      {!loading && engagementAnalytics?.isMock && (
        <div className="mb-8 p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-500 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-amber-700 dark:text-amber-500">
            Backend non connecté : Ces données d'engagement sont des simulations.
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
        <StatsCard
          title="Utilisateurs Actifs (Jour)"
          value={engagementAnalytics?.dailyActiveUsers.value ?? '-'}
          variation={engagementAnalytics?.dailyActiveUsers.variation}
          trend={engagementAnalytics?.dailyActiveUsers.trend}
          icon={<Users className="w-5 h-5" />}
          loading={loading}
          isMock={engagementAnalytics?.isMock}
        />
        <StatsCard
          title="Utilisateurs Actifs (Semaine)"
          value={engagementAnalytics?.weeklyActiveUsers.value ?? '-'}
          variation={engagementAnalytics?.weeklyActiveUsers.variation}
          trend={engagementAnalytics?.weeklyActiveUsers.trend}
          icon={<Users className="w-5 h-5" />}
          loading={loading}
          isMock={engagementAnalytics?.isMock}
        />
        <StatsCard
          title="Vues de Cours"
          value={engagementAnalytics?.courseViews.value ?? '-'}
          variation={engagementAnalytics?.courseViews.variation}
          trend={engagementAnalytics?.courseViews.trend}
          icon={<BookOpen className="w-5 h-5" />}
          loading={loading}
          isMock={engagementAnalytics?.isMock}
        />
        <StatsCard
          title="Vues de Leçons"
          value={engagementAnalytics?.lessonViews.value ?? '-'}
          variation={engagementAnalytics?.lessonViews.variation}
          trend={engagementAnalytics?.lessonViews.trend}
          icon={<PlayCircle className="w-5 h-5" />}
          loading={loading}
          isMock={engagementAnalytics?.isMock}
        />
        <StatsCard
          title="Temps de visionnage"
          value={engagementAnalytics?.videoWatchTime.value ?? '-'}
          unit="min"
          variation={engagementAnalytics?.videoWatchTime.variation}
          trend={engagementAnalytics?.videoWatchTime.trend}
          icon={<Clock className="w-5 h-5" />}
          loading={loading}
          isMock={engagementAnalytics?.isMock}
        />
        <StatsCard
          title="Tentatives de Quiz"
          value={engagementAnalytics?.quizAttempts.value ?? '-'}
          variation={engagementAnalytics?.quizAttempts.variation}
          trend={engagementAnalytics?.quizAttempts.trend}
          icon={<HelpCircle className="w-5 h-5" />}
          loading={loading}
          isMock={engagementAnalytics?.isMock}
        />
        <StatsCard
          title="Taux de complétion Quiz"
          value={engagementAnalytics?.quizCompletionRate.value ?? '-'}
          unit="%"
          variation={engagementAnalytics?.quizCompletionRate.variation}
          trend={engagementAnalytics?.quizCompletionRate.trend}
          icon={<CheckSquare className="w-5 h-5" />}
          loading={loading}
          isMock={engagementAnalytics?.isMock}
        />
      </div>

      <ChartComponent
        title="Activité Périodique"
        data={engagementAnalytics?.engagementByPeriod || []}
        loading={loading}
        isMock={engagementAnalytics?.isMock}
      />
    </div>
  );
};
