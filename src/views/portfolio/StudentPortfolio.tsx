import React, { useEffect } from 'react';
import { usePortfolio } from '../../hooks/usePortfolio';
import { ProjectCard } from '../../components/portfolio/ProjectCard';
import { SkillBadge } from '../../components/portfolio/SkillBadge';
import { Loader2, AlertCircle, Eye, EyeOff, User } from 'lucide-react';

export const StudentPortfolio: React.FC = () => {
  const { 
    portfolio, 
    loading, 
    updating, 
    error, 
    isMockData, 
    fetchMyPortfolio, 
    toggleVisibility 
  } = usePortfolio();

  useEffect(() => {
    fetchMyPortfolio();
  }, [fetchMyPortfolio]);

  const handleToggleVisibility = () => {
    if (!portfolio) return;
    const newVisibility = portfolio.visibility === 'public' ? 'private' : 'public';
    toggleVisibility(newVisibility);
  };

  if (loading && !portfolio) {
    return (
      <div className="w-full flex flex-col items-center justify-center min-h-[60vh]">
        <Loader2 className="w-10 h-10 animate-spin text-primary mb-4" />
        <p className="text-gray-500">Chargement de votre portfolio...</p>
      </div>
    );
  }

  if (error && !portfolio) {
    return (
      <div className="w-full max-w-4xl mx-auto p-4 sm:p-6 lg:p-8 min-h-screen">
        <div className="bg-red-50 dark:bg-red-900/20 p-6 rounded-2xl border border-red-200 dark:border-red-800 text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-red-700 dark:text-red-400 mb-2">Erreur</h3>
          <p className="text-red-600 dark:text-red-300 mb-4">{error}</p>
          <button 
            onClick={() => fetchMyPortfolio()}
            className="px-6 py-2 bg-red-100 hover:bg-red-200 dark:bg-red-800 dark:hover:bg-red-700 text-red-700 dark:text-red-100 rounded-xl font-medium transition-colors min-h-[44px]"
          >
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  if (!portfolio) return null;

  const isPublic = portfolio.visibility === 'public';

  return (
    <div className="w-full max-w-5xl mx-auto p-4 sm:p-6 lg:p-8 flex flex-col gap-8 min-h-screen">
      
      {/* Top Banner / Actions */}
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white flex flex-wrap items-center gap-3">
            Mon Portfolio
            {isMockData && (
              <span className="bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400 text-xs px-2 py-1 rounded-full font-bold uppercase tracking-wider border border-amber-200 dark:border-amber-800">
                Mock
              </span>
            )}
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Gérez votre présence publique et vos projets réalisés.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleToggleVisibility}
            disabled={updating}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold transition-colors min-h-[44px] ${
              isPublic 
                ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200 dark:bg-emerald-900/40 dark:text-emerald-400' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300'
            }`}
          >
            {updating ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : isPublic ? (
              <Eye className="w-4 h-4" />
            ) : (
              <EyeOff className="w-4 h-4" />
            )}
            {isPublic ? "Public" : "Privé"}
          </button>

          {isPublic && (
            <button
              onClick={() => alert("Ouvrir PortfolioPublic.tsx (Routage reporté / BLOCKED)")}
              className="px-5 py-2.5 bg-primary text-white font-semibold rounded-xl hover:bg-blue-700 transition-colors min-h-[44px]"
            >
              Voir le profil public
            </button>
          )}
        </div>
      </header>

      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-xl border border-red-200 dark:border-red-800/50 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
          <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
        </div>
      )}

      {/* Profile Overview */}
      <section className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6 sm:p-8 flex flex-col sm:flex-row gap-6 items-start shadow-sm">
        <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-2xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center shrink-0 overflow-hidden">
          {portfolio.avatarUrl ? (
            <img src={portfolio.avatarUrl} alt={portfolio.displayName} className="w-full h-full object-cover" />
          ) : (
            <User className="w-12 h-12 text-gray-400" />
          )}
        </div>

        <div className="flex-1 flex flex-col">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            {portfolio.displayName}
          </h2>
          <p className="text-primary font-medium text-lg mt-1">
            {portfolio.headline || "Étudiant Ndara"}
          </p>
          
          <div className="mt-4">
            <h3 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider mb-2">À propos</h3>
            <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed max-w-3xl">
              {portfolio.bio || "Aucune biographie renseignée."}
            </p>
          </div>
        </div>
      </section>

      {/* Skills */}
      <section>
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Compétences Techniques</h3>
        {portfolio.skills && portfolio.skills.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {portfolio.skills.map((skill: string, idx: number) => (
              <SkillBadge key={idx} skill={skill} />
            ))}
          </div>
        ) : (
          <p className="text-gray-500 italic text-sm">Aucune compétence renseignée.</p>
        )}
      </section>

      {/* Projects Grid */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white">Projets ({portfolio.projects.length})</h3>
        </div>

        {portfolio.projects && portfolio.projects.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {portfolio.projects.map((project) => (
              <ProjectCard key={project.projectId} project={project} isPublicView={false} />
            ))}
          </div>
        ) : (
          <div className="bg-gray-50 dark:bg-gray-800/30 rounded-2xl border border-dashed border-gray-200 dark:border-gray-700 p-8 text-center">
            <p className="text-gray-500 dark:text-gray-400">Aucun projet à afficher pour le moment.</p>
          </div>
        )}
      </section>

    </div>
  );
};
