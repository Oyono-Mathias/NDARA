import React from 'react';
import { Project } from '../../services/portfolioService';
import { ExternalLink, Calendar, BookOpen, AlertCircle } from 'lucide-react';
import { SkillBadge } from './SkillBadge';

interface ProjectCardProps {
  project: Project;
  isPublicView?: boolean;
}

export const ProjectCard: React.FC<ProjectCardProps> = ({ project, isPublicView = false }) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      month: 'long',
      year: 'numeric'
    });
  };

  const validateUrl = (url: string | undefined): string | undefined => {
    if (!url) return undefined;
    try {
      const parsed = new URL(url);
      if (parsed.protocol === 'http:' || parsed.protocol === 'https:') {
        return parsed.toString();
      }
    } catch {
      return undefined;
    }
    return undefined;
  };

  const safeProjectUrl = validateUrl(project.projectUrl);
  const safeRepoUrl = validateUrl(project.repositoryUrl);

  const getStatusBadge = () => {
    if (isPublicView) return null; // In public view, we only show published projects anyway, no need for badges

    switch (project.status) {
      case 'published':
        return <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">Publié</span>;
      case 'draft':
        return <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-md bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">Brouillon</span>;
      case 'archived':
        return <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-md bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300">Archivé</span>;
      default:
        return null;
    }
  };

  return (
    <article className="flex flex-col bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 overflow-hidden shadow-sm hover:shadow-md transition-shadow">
      
      {/* Optional Image Area - Not implemented in mock but prepared architecturally */}
      {project.imageUrl && (
        <div className="w-full h-48 bg-gray-200 dark:bg-gray-800 overflow-hidden">
          <img 
            src={validateUrl(project.imageUrl) || ''} 
            alt={`Aperçu de ${project.title}`}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        </div>
      )}

      <div className="p-4 sm:p-6 flex flex-col flex-1 gap-4">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <h3 className="font-bold text-gray-900 dark:text-white text-lg lg:text-xl">
                {project.title}
              </h3>
              {getStatusBadge()}
              {project.isMock && (
                <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-md bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400 border border-orange-200 dark:border-orange-800" title="Projet Mocké">Mock</span>
              )}
            </div>
            
            <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" />
                {formatDate(project.completedAt)}
              </span>
              {project.courseTitle && (
                <span className="flex items-center gap-1 text-primary">
                  <BookOpen className="w-3.5 h-3.5" />
                  {project.courseTitle}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Description */}
        <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed line-clamp-3">
          {project.description || <span className="italic opacity-50">Aucune description fournie.</span>}
        </p>

        {/* Technologies */}
        {project.technologies && project.technologies.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-auto pt-2">
            {project.technologies.map((tech, idx) => (
              <SkillBadge key={idx} skill={tech} />
            ))}
          </div>
        )}

        {/* Action Links */}
        {(safeProjectUrl || safeRepoUrl) && (
          <div className="flex flex-wrap gap-3 pt-4 border-t border-gray-100 dark:border-gray-800 mt-2">
            {safeProjectUrl && (
              <a 
                href={safeProjectUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary hover:bg-primary/20 rounded-xl text-sm font-semibold transition-colors min-h-[44px]"
                aria-label={`Visiter le projet ${project.title}`}
              >
                <ExternalLink className="w-4 h-4" />
                Visiter
              </a>
            )}
            
            {safeRepoUrl && (
              <a 
                href={safeRepoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-xl text-sm font-semibold transition-colors min-h-[44px]"
                aria-label={`Voir le code source de ${project.title}`}
              >
                Code Source
              </a>
            )}
          </div>
        )}

        {(!safeProjectUrl && project.projectUrl) && (
          <div className="text-xs text-red-500 flex items-center gap-1 mt-2">
            <AlertCircle className="w-3 h-3" /> URL du projet invalide
          </div>
        )}
      </div>
    </article>
  );
};
