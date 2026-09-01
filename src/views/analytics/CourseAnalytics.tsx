import React from 'react';
import { useAnalytics } from '../../hooks/useAnalytics';
import { StatsCard } from '../../components/analytics/StatsCard';
import { ChartComponent } from '../../components/analytics/ChartComponent';
import { BookOpen, CheckCircle, Star, AlertTriangle, Layout, Edit, FileText } from 'lucide-react';

export const CourseAnalytics: React.FC = () => {
  const { courseAnalytics, loading, error } = useAnalytics();

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
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Performances des Cours</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Analyse de la fréquentation et de la complétion des contenus.
        </p>
      </div>

      {!loading && courseAnalytics?.isMock && (
        <div className="mb-8 p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-500 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-amber-700 dark:text-amber-500">
            Backend non connecté : Ces données de cours sont des simulations.
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
        <StatsCard
          title="Total des Cours"
          value={courseAnalytics?.totalCourses.value ?? '-'}
          variation={courseAnalytics?.totalCourses.variation}
          trend={courseAnalytics?.totalCourses.trend}
          icon={<Layout className="w-5 h-5" />}
          loading={loading}
          isMock={courseAnalytics?.isMock}
        />
        <StatsCard
          title="Cours Publiés"
          value={courseAnalytics?.publishedCourses.value ?? '-'}
          variation={courseAnalytics?.publishedCourses.variation}
          trend={courseAnalytics?.publishedCourses.trend}
          icon={<CheckCircle className="w-5 h-5" />}
          loading={loading}
          isMock={courseAnalytics?.isMock}
        />
        <StatsCard
          title="Brouillons"
          value={courseAnalytics?.draftCourses.value ?? '-'}
          variation={courseAnalytics?.draftCourses.variation}
          trend={courseAnalytics?.draftCourses.trend}
          icon={<Edit className="w-5 h-5" />}
          loading={loading}
          isMock={courseAnalytics?.isMock}
        />
        <StatsCard
          title="Inscriptions"
          value={courseAnalytics?.totalEnrollments.value ?? '-'}
          variation={courseAnalytics?.totalEnrollments.variation}
          trend={courseAnalytics?.totalEnrollments.trend}
          icon={<BookOpen className="w-5 h-5" />}
          loading={loading}
          isMock={courseAnalytics?.isMock}
        />
        <StatsCard
          title="Taux de Complétion"
          value={courseAnalytics?.averageCompletionRate.value ?? '-'}
          unit="%"
          variation={courseAnalytics?.averageCompletionRate.variation}
          trend={courseAnalytics?.averageCompletionRate.trend}
          icon={<CheckCircle className="w-5 h-5" />}
          loading={loading}
          isMock={courseAnalytics?.isMock}
        />
        <StatsCard
          title="Note Moyenne"
          value={courseAnalytics?.averageRating.value ?? '-'}
          unit="/ 5"
          variation={courseAnalytics?.averageRating.variation}
          trend={courseAnalytics?.averageRating.trend}
          icon={<Star className="w-5 h-5 text-yellow-400" />}
          loading={loading}
          isMock={courseAnalytics?.isMock}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="lg:col-span-2">
          <ChartComponent
            title="Tendances d'inscription"
            data={courseAnalytics?.enrollmentChart || []}
            loading={loading}
            isMock={courseAnalytics?.isMock}
          />
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 flex flex-col">
          <div className="flex items-center gap-2 mb-4">
            <FileText className="w-5 h-5 text-gray-500" />
            <h3 className="font-semibold text-gray-900 dark:text-white">Meilleurs Cours</h3>
          </div>
          
          <div className="flex-1 overflow-y-auto min-h-[200px]">
            {loading ? (
               <div className="space-y-4 animate-pulse">
                 {[1, 2, 3].map(i => (
                   <div key={i} className="h-10 bg-gray-100 dark:bg-gray-700 rounded w-full"></div>
                 ))}
               </div>
            ) : courseAnalytics?.topCourses && courseAnalytics.topCourses.length > 0 ? (
              <ul className="space-y-3">
                {courseAnalytics.topCourses.map(course => (
                  <li key={course.id} className="flex justify-between items-center p-3 hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded-lg transition-colors border border-gray-100 dark:border-gray-700">
                    <div className="min-w-0 flex-1 pr-2">
                      <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{course.title}</p>
                      <div className="flex items-center text-xs text-gray-500 mt-1">
                        <Star className="w-3 h-3 text-yellow-400 mr-1" />
                        <span>{course.rating}</span>
                      </div>
                    </div>
                    <div className="text-sm font-semibold text-gray-700 dark:text-gray-300 whitespace-nowrap">
                      {course.enrollments} inscrits
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center text-gray-500 p-4">
                <BookOpen className="w-8 h-8 text-gray-300 dark:text-gray-600 mb-2" />
                <p className="text-sm">Aucun cours trouvé</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
