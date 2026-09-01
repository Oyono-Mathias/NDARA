import React, { useEffect } from 'react';
import { useLearningPaths } from '../../hooks/useLearningPaths';
import { PathProgress } from '../../components/learning_paths/PathProgress';
import { LearningPathValidator } from '../../components/courses/LearningPathValidator';
import { PrerequisiteCheck } from '../../components/courses/PrerequisiteCheck';
import { Loader2, AlertCircle, ArrowLeft, Lock, PlayCircle, CheckCircle, Clock } from 'lucide-react';

interface PathDetailProps {
  pathId: string;
  onBack?: () => void;
}

export const PathDetail: React.FC<PathDetailProps> = ({ pathId, onBack }) => {
  const { selectedPath: path, loading, error, fetchPathDetail } = useLearningPaths();

  useEffect(() => {
    if (pathId) {
      fetchPathDetail(pathId);
    }
  }, [pathId, fetchPathDetail]);

  if (loading && !path) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] w-full">
        <Loader2 className="w-10 h-10 animate-spin text-primary mb-4" />
        <p className="text-gray-500 font-medium">Chargement du parcours...</p>
      </div>
    );
  }

  if (error || !path) {
    return (
      <div className="max-w-3xl mx-auto p-4 sm:p-6 flex items-center justify-center min-h-[60vh] w-full">
        <div className="bg-red-50 dark:bg-red-900/20 p-8 rounded-3xl border border-red-200 dark:border-red-800 text-center w-full shadow-sm">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-red-800 dark:text-red-400 mb-2">Parcours indisponible</h2>
          <p className="text-red-600 dark:text-red-300 mb-6">{error || 'Le parcours demandé est introuvable.'}</p>
          <div className="flex gap-4 justify-center">
            {onBack && (
              <button 
                onClick={onBack}
                className="px-6 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl font-semibold transition-colors min-h-[44px]"
              >
                Retour
              </button>
            )}
            <button 
              onClick={() => fetchPathDetail(pathId)}
              className="px-6 py-2 bg-red-100 hover:bg-red-200 dark:bg-red-900/40 dark:hover:bg-red-900/60 text-red-700 dark:text-red-300 rounded-xl font-semibold transition-colors min-h-[44px]"
            >
              Réessayer
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto p-4 sm:p-6 lg:p-8 flex flex-col gap-8 min-h-screen">
      
      {/* Navigation & Header */}
      <header className="flex flex-col gap-6">
        {onBack && (
          <button 
            onClick={onBack}
            className="flex items-center gap-2 text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors self-start min-h-[44px] px-2 -ml-2 rounded-lg"
            aria-label="Retour à la liste des parcours"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="font-semibold text-sm">Retour</span>
          </button>
        )}
        
        <div className="flex flex-col gap-4">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl sm:text-4xl font-extrabold text-gray-900 dark:text-white">
              {path.title}
            </h1>
            {path.isMock && (
              <span className="bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400 text-xs px-2.5 py-1 rounded-md font-bold uppercase tracking-wider">
                Mock
              </span>
            )}
          </div>
          <p className="text-gray-600 dark:text-gray-300 text-base sm:text-lg max-w-3xl leading-relaxed">
            {path.description}
          </p>
        </div>
      </header>

      {/* Progress & Validation */}
      <section className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-200 dark:border-gray-800 p-6 sm:p-8 shadow-sm flex flex-col gap-6">
        <PathProgress 
          progressPercentage={path.progressPercentage} 
          completedCourses={path.completedCourses} 
          totalCourses={path.totalCourses} 
        />
        <LearningPathValidator path={path} />
      </section>

      {/* Courses Timeline */}
      <section className="flex flex-col gap-6">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white">
          Étapes du parcours
        </h3>

        <div className="flex flex-col gap-4">
          {path.courses?.map((course, index) => {
            const isCompleted = course.status === 'completed';
            const isLocked = course.status === 'locked';
            
            return (
              <div 
                key={course.courseId} 
                className={`relative flex flex-col sm:flex-row gap-4 p-5 sm:p-6 rounded-2xl border ${
                  isCompleted ? 'bg-emerald-50/50 border-emerald-100 dark:bg-emerald-900/10 dark:border-emerald-900/30' :
                  isLocked ? 'bg-gray-50 border-gray-200 dark:bg-gray-800/30 dark:border-gray-800 opacity-75' :
                  'bg-white border-primary/30 dark:bg-gray-900 dark:border-primary/30 shadow-sm'
                }`}
              >
                {/* Visual Connector Line (hidden on mobile, simple implementation) */}
                {index !== (path.courses?.length || 0) - 1 && (
                  <div className="hidden sm:block absolute left-9 top-16 bottom-[-24px] w-px bg-gray-200 dark:bg-gray-800 z-0" />
                )}

                {/* Status Icon */}
                <div className="shrink-0 relative z-10 flex items-center justify-center w-10 h-10 rounded-full bg-white dark:bg-gray-900 border-2">
                  {isCompleted ? (
                    <CheckCircle className="w-5 h-5 text-emerald-500" />
                  ) : isLocked ? (
                    <Lock className="w-5 h-5 text-gray-400" />
                  ) : (
                    <PlayCircle className="w-5 h-5 text-primary" />
                  )}
                </div>

                <div className="flex-1 flex flex-col gap-3 min-w-0">
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                    <div>
                      <h4 className="text-lg font-bold text-gray-900 dark:text-white">
                        <span className="text-sm font-semibold text-gray-400 dark:text-gray-500 mr-2">
                          Étape {course.order}
                        </span>
                        {course.title}
                      </h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">
                        {course.description}
                      </p>
                    </div>
                    
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 bg-gray-100 dark:bg-gray-800 px-2.5 py-1 rounded-lg shrink-0">
                      <Clock className="w-3.5 h-3.5" />
                      {course.durationMinutes} min
                    </div>
                  </div>

                  {/* Prerequisites block - Always check for locked/available items just to demonstrate UI,
                      in reality only checking when available/locked makes sense */}
                  {(!isCompleted) && (
                    <div className="mt-2">
                      <PrerequisiteCheck courseId={course.courseId} />
                    </div>
                  )}

                  {/* Action */}
                  <div className="mt-2">
                    <button 
                      disabled={isLocked || isCompleted}
                      className={`px-5 py-2 rounded-xl text-sm font-semibold transition-colors min-h-[44px] ${
                        isCompleted ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400' :
                        isLocked ? 'bg-gray-100 text-gray-400 dark:bg-gray-800 dark:text-gray-600 cursor-not-allowed' :
                        'bg-primary text-white hover:bg-blue-700'
                      }`}
                    >
                      {isCompleted ? 'Terminé' : isLocked ? 'Verrouillé' : 'Commencer le cours'}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

    </div>
  );
};
