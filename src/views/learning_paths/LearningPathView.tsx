import React, { useEffect } from 'react';
import { useLearningPaths } from '../../hooks/useLearningPaths';
import { PathCard } from '../../components/learning_paths/PathCard';
import { Loader2, AlertCircle, Compass } from 'lucide-react';

export const LearningPathView: React.FC = () => {
  const { paths, loading, error, fetchPaths } = useLearningPaths();

  useEffect(() => {
    fetchPaths();
  }, [fetchPaths]);

  const handleSelectPath = (pathId: string) => {
    // Dans une implémentation réelle avec react-router : navigate(`/learning-paths/${pathId}`)
    // Ici, nous utilisons un fallback UI clair vu qu'on ne modifie pas le routeur global.
    alert(`Routage vers le parcours: ${pathId} (Intégration du routeur reportée / BLOCKED)`);
  };

  if (loading && paths.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] w-full">
        <Loader2 className="w-10 h-10 animate-spin text-primary mb-4" />
        <p className="text-gray-500 font-medium">Chargement des parcours...</p>
      </div>
    );
  }

  if (error && paths.length === 0) {
    return (
      <div className="max-w-3xl mx-auto p-4 sm:p-6 lg:p-8 flex items-center justify-center min-h-[60vh] w-full">
        <div className="bg-red-50 dark:bg-red-900/20 p-8 rounded-3xl border border-red-200 dark:border-red-800 text-center w-full shadow-sm">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-red-800 dark:text-red-400 mb-2">Impossible de charger les parcours</h2>
          <p className="text-red-600 dark:text-red-300 mb-6">{error}</p>
          <button 
            onClick={() => fetchPaths()}
            className="px-6 py-3 bg-red-100 hover:bg-red-200 dark:bg-red-900/40 dark:hover:bg-red-900/60 text-red-700 dark:text-red-300 rounded-xl font-semibold transition-colors min-h-[44px]"
          >
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 flex flex-col gap-8 min-h-screen">
      
      {/* Header */}
      <header className="flex flex-col gap-3">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center">
            <Compass className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white">
              Parcours d'Apprentissage
            </h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">
              Suivez des parcours structurés pour maîtriser de nouvelles compétences étape par étape.
            </p>
          </div>
        </div>
      </header>

      {/* Lists */}
      {paths.length === 0 ? (
        <div className="bg-gray-50 dark:bg-gray-800/30 rounded-3xl border border-dashed border-gray-200 dark:border-gray-700 p-12 text-center">
          <Compass className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Aucun parcours disponible</h3>
          <p className="text-gray-500 dark:text-gray-400">Revenez plus tard pour découvrir de nouveaux parcours d'apprentissage.</p>
        </div>
      ) : (
        <section className="flex flex-col gap-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {paths.map(path => (
              <PathCard 
                key={path.pathId} 
                path={path} 
                onSelect={handleSelectPath} 
              />
            ))}
          </div>
        </section>
      )}
    </div>
  );
};
