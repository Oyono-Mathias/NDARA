import React from 'react';
import { LearningPath } from '../../services/learningPathService';
import { PathProgress } from './PathProgress';
import { Trophy, BookOpen, AlertCircle, PlayCircle, CheckCircle } from 'lucide-react';

interface PathCardProps {
  path: LearningPath;
  onSelect: (pathId: string) => void;
}

export const PathCard: React.FC<PathCardProps> = ({ path, onSelect }) => {
  const getStatusDisplay = () => {
    switch (path.status) {
      case 'completed':
        return (
          <span className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-100 dark:bg-emerald-900/30 dark:text-emerald-400 px-2.5 py-1 rounded-md">
            <CheckCircle className="w-3.5 h-3.5" /> Terminé
          </span>
        );
      case 'in_progress':
        return (
          <span className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-blue-700 bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400 px-2.5 py-1 rounded-md">
            <PlayCircle className="w-3.5 h-3.5" /> En cours
          </span>
        );
      case 'available':
        return (
          <span className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-gray-700 bg-gray-100 dark:bg-gray-800 dark:text-gray-300 px-2.5 py-1 rounded-md">
            Disponible
          </span>
        );
      case 'locked':
      default:
        return (
          <span className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-red-700 bg-red-100 dark:bg-red-900/30 dark:text-red-400 px-2.5 py-1 rounded-md">
            <AlertCircle className="w-3.5 h-3.5" /> Verrouillé
          </span>
        );
    }
  };

  return (
    <article className="flex flex-col bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-5 sm:p-6 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden">
      
      {/* Mock Badge */}
      {path.isMock && (
        <div className="absolute top-0 right-0 bg-amber-500 text-white text-[10px] font-bold px-3 py-1 uppercase rounded-bl-lg z-10" title="Données mockées - Backend non connecté">
          Mock
        </div>
      )}

      {/* Header */}
      <div className="flex items-start justify-between gap-4 mb-3">
        <div>
          <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white line-clamp-2">
            {path.title}
          </h3>
          <div className="flex items-center gap-3 mt-1.5">
            <span className="text-xs font-semibold text-primary/80 uppercase tracking-wider">
              {path.level}
            </span>
            <span className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
              <BookOpen className="w-3.5 h-3.5" /> {path.totalCourses} cours
            </span>
          </div>
        </div>
        <div className="shrink-0 mt-1">
          {path.status === 'completed' && <Trophy className="w-8 h-8 text-emerald-500" />}
        </div>
      </div>

      {/* Description */}
      <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2 mb-6 flex-1">
        {path.description}
      </p>

      {/* Status & Progress */}
      <div className="flex flex-col gap-4 mt-auto">
        <div className="flex items-center">
          {getStatusDisplay()}
        </div>
        
        <PathProgress 
          progressPercentage={path.progressPercentage} 
          completedCourses={path.completedCourses} 
          totalCourses={path.totalCourses} 
        />
        
        <button 
          onClick={() => onSelect(path.pathId)}
          className="mt-2 w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-primary/10 text-primary hover:bg-primary/20 dark:bg-primary/20 dark:hover:bg-primary/30 rounded-xl text-sm font-semibold transition-colors min-h-[44px]"
          aria-label={`Voir les détails du parcours ${path.title}`}
        >
          {path.status === 'completed' ? 'Revoir le parcours' : 'Continuer'}
        </button>
      </div>
    </article>
  );
};
