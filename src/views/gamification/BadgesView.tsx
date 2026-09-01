import React, { useEffect } from 'react';
import { useBadges } from '../../hooks/useBadges';
import { BadgeCollection } from '../../components/badges/BadgeCollection';
import { Loader2, AlertCircle } from 'lucide-react';

export const BadgesView: React.FC = () => {
  const { badges, unlockedBadges, lockedBadges, loading, error, fetchAllBadges } = useBadges();

  useEffect(() => {
    fetchAllBadges();
  }, [fetchAllBadges]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-12 min-h-[50vh]">
        <Loader2 className="w-10 h-10 animate-spin text-primary mb-4" />
        <p className="text-gray-500">Chargement de vos badges...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 dark:bg-red-900/20 p-6 rounded-2xl border border-red-200 dark:border-red-800 text-center">
          <AlertCircle className="w-10 h-10 text-red-500 mx-auto mb-3" />
          <p className="text-red-700 dark:text-red-400 font-medium">{error}</p>
          <button 
            onClick={fetchAllBadges}
            className="mt-4 px-4 py-2 bg-red-100 text-red-700 dark:bg-red-800/50 dark:text-red-300 rounded-lg hover:bg-red-200 dark:hover:bg-red-800 transition-colors font-medium min-h-[44px]"
          >
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  const isMock = badges.some(b => b.isMock);

  return (
    <div className="w-full max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 flex flex-col gap-8">
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-200 dark:border-gray-800 pb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
            Mes Badges
            {isMock && (
              <span className="bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400 text-xs px-2 py-1 rounded-full font-bold uppercase tracking-wider border border-amber-200 dark:border-amber-800">
                Mock
              </span>
            )}
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Collectionnez des badges en progressant sur la plateforme.
          </p>
        </div>
        <div className="bg-primary/10 text-primary px-4 py-2 rounded-xl text-sm font-bold flex items-center justify-center min-h-[44px]">
          {unlockedBadges.length} / {badges.length} Débloqués
        </div>
      </header>

      <section>
        <BadgeCollection 
          badges={unlockedBadges} 
          title="Badges obtenus" 
          emptyMessage="Vous n'avez pas encore obtenu de badge. Continuez d'apprendre !" 
        />
      </section>

      <section className="opacity-80">
        <BadgeCollection 
          badges={lockedBadges} 
          title="Badges à découvrir" 
          emptyMessage="Vous avez débloqué tous les badges disponibles !" 
        />
      </section>
    </div>
  );
};
