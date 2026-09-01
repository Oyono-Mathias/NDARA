import React, { useEffect } from 'react';
import { useRecommendations } from '../../hooks/useRecommendations';
import { CourseRecommendations } from './CourseRecommendations';
import { Loader2, AlertCircle, RefreshCw, Sparkles } from 'lucide-react';

export const PersonalizedFeed: React.FC = () => {
  const { feedSections, loading, error, isMockData, fetchFeed } = useRecommendations();

  useEffect(() => {
    fetchFeed();
  }, [fetchFeed]);

  if (loading && feedSections.length === 0) {
    return (
      <div className="w-full flex flex-col items-center justify-center min-h-[40vh]">
        <Loader2 className="w-8 h-8 animate-spin text-primary mb-4" />
        <p className="text-gray-500 font-medium text-sm">Préparation de vos recommandations...</p>
      </div>
    );
  }

  if (error && feedSections.length === 0) {
    return (
      <div className="w-full max-w-lg mx-auto p-4 sm:p-6 text-center">
        <div className="bg-red-50 dark:bg-red-900/20 p-6 rounded-3xl border border-red-200 dark:border-red-800">
          <AlertCircle className="w-10 h-10 text-red-500 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-red-800 dark:text-red-400 mb-2">Impossible de charger le flux</h3>
          <p className="text-sm text-red-600 dark:text-red-300 mb-6">{error}</p>
          <button 
            onClick={() => fetchFeed()}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-red-100 hover:bg-red-200 dark:bg-red-900/40 dark:hover:bg-red-900/60 text-red-700 dark:text-red-300 rounded-xl font-semibold transition-colors min-h-[44px]"
          >
            <RefreshCw className="w-4 h-4" />
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  if (feedSections.length === 0) {
    return (
      <div className="w-full p-8 text-center bg-gray-50 dark:bg-gray-800/30 rounded-3xl border border-dashed border-gray-200 dark:border-gray-700">
        <Sparkles className="w-10 h-10 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
        <p className="text-gray-500 dark:text-gray-400 font-medium">Aucune recommandation disponible pour le moment.</p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-7xl mx-auto flex flex-col gap-8">
      {/* Feed Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white flex flex-wrap items-center gap-3">
            Mon Flux
            {isMockData && (
              <span className="bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400 text-xs px-2.5 py-1 rounded-md font-bold uppercase tracking-wider border border-amber-200 dark:border-amber-800">
                Mode démonstration
              </span>
            )}
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Des recommandations sélectionnées pour vous accompagner.
          </p>
        </div>
      </div>

      {/* Sections */}
      <div className="flex flex-col gap-10 overflow-hidden">
        {feedSections.map((section) => (
          <section key={section.id} className="flex flex-col gap-4">
            <div className="px-4 sm:px-6 lg:px-8">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                {section.title}
              </h3>
              {section.description && (
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                  {section.description}
                </p>
              )}
            </div>
            
            {/* 
              Adding pl-4 sm:pl-6 lg:pl-8 to allow the first item to align with the header,
              but allowing it to scroll off-screen to the right 
            */}
            <div className="pl-4 sm:pl-6 lg:pl-8">
              <CourseRecommendations recommendations={section.recommendations} horizontalScroll={true} />
            </div>
          </section>
        ))}
      </div>
      
      {/* Add a global hide-scrollbar style logic conceptually. We use Tailwind classes natively. 
          To support hide-scrollbar cross browser without adding custom plugins:
      */}
      <style>{`
        .scrollbar-hide::-webkit-scrollbar {
            display: none;
        }
        .scrollbar-hide {
            -ms-overflow-style: none;
            scrollbar-width: none;
        }
      `}</style>
    </div>
  );
};
