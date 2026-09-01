import React, { useEffect } from 'react';
import { usePortfolio } from '../../hooks/usePortfolio';
import { ProjectCard } from '../../components/portfolio/ProjectCard';
import { SkillBadge } from '../../components/portfolio/SkillBadge';
import { Loader2, User, ShieldAlert } from 'lucide-react';

interface PortfolioPublicProps {
  userId: string;
}

export const PortfolioPublic: React.FC<PortfolioPublicProps> = ({ userId }) => {
  const { 
    publicPortfolio, 
    loading, 
    error, 
    fetchPublicPortfolio 
  } = usePortfolio();

  useEffect(() => {
    if (userId) {
      fetchPublicPortfolio(userId);
    }
  }, [userId, fetchPublicPortfolio]);

  if (loading && !publicPortfolio) {
    return (
      <div className="w-full flex flex-col items-center justify-center min-h-[60vh]">
        <Loader2 className="w-10 h-10 animate-spin text-primary mb-4" />
        <p className="text-gray-500">Chargement du profil public...</p>
      </div>
    );
  }

  if (error || !publicPortfolio) {
    return (
      <div className="w-full max-w-3xl mx-auto p-4 sm:p-6 lg:p-8 flex items-center justify-center min-h-[60vh]">
        <div className="bg-white dark:bg-gray-900 p-8 rounded-3xl border border-gray-200 dark:border-gray-800 text-center shadow-sm w-full">
          <ShieldAlert className="w-16 h-16 text-gray-400 dark:text-gray-600 mx-auto mb-6" />
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Portfolio indisponible</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-8 max-w-md mx-auto">
            {error || "Ce portfolio n'existe pas ou son propriétaire ne l'a pas rendu public."}
          </p>
          <button 
            onClick={() => window.history.back()}
            className="px-6 py-2.5 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl font-medium transition-colors min-h-[44px]"
          >
            Retour
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto p-4 sm:p-6 lg:p-8 flex flex-col gap-10 min-h-screen">
      
      {/* Header Profile */}
      <section className="flex flex-col items-center text-center gap-6 mt-8">
        <div className="w-32 h-32 rounded-full bg-gray-100 dark:bg-gray-800 border-4 border-white dark:border-gray-900 shadow-xl flex items-center justify-center overflow-hidden">
          {publicPortfolio.avatarUrl ? (
            <img src={publicPortfolio.avatarUrl} alt={publicPortfolio.displayName} className="w-full h-full object-cover" />
          ) : (
            <User className="w-16 h-16 text-gray-400" />
          )}
        </div>

        <div className="flex flex-col items-center">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 dark:text-white flex items-center gap-3">
            {publicPortfolio.displayName}
          </h1>
          <h2 className="text-lg sm:text-xl font-medium text-primary mt-2">
            {publicPortfolio.headline}
          </h2>
          {publicPortfolio.isMock && (
             <span className="mt-3 bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400 text-[10px] px-2 py-1 rounded-md font-bold uppercase tracking-wider">
               Profil Public MOCK
             </span>
          )}
        </div>

        {publicPortfolio.bio && (
          <p className="text-gray-600 dark:text-gray-300 max-w-2xl text-base leading-relaxed mt-2">
            {publicPortfolio.bio}
          </p>
        )}
      </section>

      {/* Skills */}
      {publicPortfolio.skills && publicPortfolio.skills.length > 0 && (
        <section className="flex flex-col items-center gap-4">
          <div className="flex flex-wrap justify-center gap-2 max-w-3xl">
            {publicPortfolio.skills.map((skill: string, idx: number) => (
              <SkillBadge key={idx} skill={skill} />
            ))}
          </div>
        </section>
      )}

      {/* Projects Timeline/Grid */}
      <section className="mt-4">
        <div className="flex items-center justify-center gap-4 mb-8">
          <div className="h-px bg-gray-200 dark:bg-gray-800 flex-1 max-w-[100px]" />
          <h3 className="text-xl font-bold text-gray-900 dark:text-white uppercase tracking-widest text-sm">
            Projets Réalisés
          </h3>
          <div className="h-px bg-gray-200 dark:bg-gray-800 flex-1 max-w-[100px]" />
        </div>

        {publicPortfolio.projects && publicPortfolio.projects.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 lg:gap-8">
            {publicPortfolio.projects.map((project) => (
              <ProjectCard key={project.projectId} project={project} isPublicView={true} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-gray-500 dark:text-gray-400">
            Cet étudiant n'a pas encore publié de projets.
          </div>
        )}
      </section>

    </div>
  );
};
