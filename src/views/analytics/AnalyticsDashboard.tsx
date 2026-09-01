import React from 'react';
import { useAnalytics } from '../../hooks/useAnalytics';
import { AnalyticsPeriod } from '../../services/analyticsService';
import { StatsCard } from '../../components/analytics/StatsCard';
import { ChartComponent } from '../../components/analytics/ChartComponent';
import { Users, BookOpen, DollarSign, Activity, AlertTriangle, FileText, CheckCircle } from 'lucide-react';

export const AnalyticsDashboard: React.FC = () => {
  const { period, setPeriod, summary, courseAnalytics, loading, error } = useAnalytics();

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center p-8 bg-red-50 dark:bg-red-900/20 rounded-xl">
        <AlertTriangle className="w-12 h-12 text-red-500 mb-4" />
        <h2 className="text-lg font-bold text-red-700 dark:text-red-400">Erreur de chargement</h2>
        <p className="text-red-600 dark:text-red-300 mt-2">{error}</p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
      {/* Header & Period Selector */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Vue d'ensemble</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Performances globales de votre activité.
          </p>
        </div>
        
        <div className="flex bg-gray-100 dark:bg-gray-800 rounded-lg p-1 overflow-x-auto w-full sm:w-auto">
          {(['7d', '30d', '90d', '12m'] as AnalyticsPeriod[]).map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`flex-1 sm:flex-none px-4 py-2 text-sm font-medium rounded-md transition-colors whitespace-nowrap ${
                period === p
                  ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
            >
              {p === '7d' ? '7 Jours' : p === '30d' ? '30 Jours' : p === '90d' ? '3 Mois' : '1 An'}
            </button>
          ))}
        </div>
      </div>

      {/* Warning Banner pour MOCK */}
      {!loading && summary?.isMock && (
        <div className="mb-8 p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-500 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="text-sm font-medium text-amber-800 dark:text-amber-400">Backend Non Connecté</h3>
            <p className="text-sm text-amber-700 dark:text-amber-500 mt-1">
              Les données affichées sont des simulations (MOCK) à des fins de démonstration UX.
              Aucune donnée réelle n'est exposée.
            </p>
          </div>
        </div>
      )}

      {/* Stats Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
        <StatsCard
          title="Utilisateurs totaux"
          value={summary?.totalUsers.value ?? '-'}
          variation={summary?.totalUsers.variation}
          trend={summary?.totalUsers.trend}
          icon={<Users className="w-5 h-5" />}
          loading={loading}
          isMock={summary?.isMock}
        />
        <StatsCard
          title="Cours Actifs"
          value={summary?.activeCourses.value ?? '-'}
          variation={summary?.activeCourses.variation}
          trend={summary?.activeCourses.trend}
          icon={<BookOpen className="w-5 h-5" />}
          loading={loading}
          isMock={summary?.isMock}
        />
        <StatsCard
          title="Engagement Moyen"
          value={summary?.averageEngagement.value ?? '-'}
          unit="min/jour"
          variation={summary?.averageEngagement.variation}
          trend={summary?.averageEngagement.trend}
          icon={<Activity className="w-5 h-5" />}
          loading={loading}
          isMock={summary?.isMock}
        />
        {/* Les revenus sont bloqués si le backend n'est pas connecté */}
        <StatsCard
          title="Revenus Totaux"
          value="-"
          icon={<DollarSign className="w-5 h-5" />}
          loading={loading}
          unavailable={true}
        />
      </div>

      {/* Charts Section & Top Courses */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="lg:col-span-2 flex flex-col gap-6">
          <ChartComponent
            title="Activité de la plateforme"
            data={summary?.mainChart || []}
            loading={loading}
            isMock={summary?.isMock}
          />
          <ChartComponent
            title="Évolution des revenus"
            data={[]}
            loading={loading}
            unavailable={true}
          />
        </div>
        
        <div className="flex flex-col gap-6">
            <div className="bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-700 rounded-xl p-6 flex flex-col justify-center items-center text-center flex-1">
              <DollarSign className="w-12 h-12 text-gray-300 dark:text-gray-600 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Revenus détaillés</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Les données financières détaillées nécessitent une connexion au backend sécurisé.
              </p>
            </div>
            
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 flex flex-col flex-1">
              <div className="flex items-center gap-2 mb-4">
                <FileText className="w-5 h-5 text-gray-500" />
                <h3 className="font-semibold text-gray-900 dark:text-white">Cours populaires</h3>
              </div>
              
              <div className="flex-1 overflow-y-auto">
                {loading ? (
                   <div className="space-y-4 animate-pulse">
                     {[1, 2, 3].map(i => (
                       <div key={i} className="h-10 bg-gray-100 dark:bg-gray-700 rounded w-full"></div>
                     ))}
                   </div>
                ) : courseAnalytics?.topCourses && courseAnalytics.topCourses.length > 0 ? (
                  <ul className="space-y-3">
                    {courseAnalytics.topCourses.slice(0, 3).map(course => (
                      <li key={course.id} className="flex flex-col p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-100 dark:border-gray-700">
                        <p className="text-sm font-medium text-gray-900 dark:text-white truncate mb-1">{course.title}</p>
                        <div className="flex justify-between items-center text-xs text-gray-500">
                          <span>{course.enrollments} inscrits</span>
                          <span className="flex items-center"><CheckCircle className="w-3 h-3 text-emerald-500 mr-1"/> {course.rating}/5</span>
                        </div>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-center text-gray-500 p-4">
                    <BookOpen className="w-8 h-8 text-gray-300 dark:text-gray-600 mb-2" />
                    <p className="text-sm">Aucun cours</p>
                  </div>
                )}
              </div>
            </div>
        </div>
      </div>
    </div>
  );
};
