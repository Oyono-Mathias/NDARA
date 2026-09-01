import React, { useEffect } from 'react';
import { usePrerequisites } from '../../hooks/usePrerequisites';
import { Loader2, AlertTriangle, CheckCircle, Lock } from 'lucide-react';

interface PrerequisiteCheckProps {
  courseId: string;
}

export const PrerequisiteCheck: React.FC<PrerequisiteCheckProps> = ({ courseId }) => {
  const { loading, error, result, checkCourse } = usePrerequisites();

  useEffect(() => {
    checkCourse(courseId);
  }, [courseId, checkCourse]);

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-sm text-gray-500 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-100 dark:border-gray-800">
        <Loader2 className="w-4 h-4 animate-spin text-primary" />
        <span>Vérification des prérequis...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-start gap-2 text-sm text-red-600 dark:text-red-400 p-3 bg-red-50 dark:bg-red-900/20 rounded-xl border border-red-200 dark:border-red-800/50">
        <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
        <div>
          <p className="font-semibold">Erreur de vérification</p>
          <p className="text-xs opacity-90">{error}</p>
          <button 
            onClick={() => checkCourse(courseId)}
            className="mt-2 px-3 py-1.5 bg-red-100 dark:bg-red-900/40 hover:bg-red-200 dark:hover:bg-red-900/60 rounded-lg text-xs font-semibold transition-colors"
          >
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  if (!result) return null;

  if (result.status === 'satisfied') {
    return (
      <div className="flex items-center gap-2 text-sm text-emerald-700 dark:text-emerald-400 p-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl border border-emerald-200 dark:border-emerald-800/50">
        <CheckCircle className="w-4 h-4 shrink-0" />
        <span className="font-medium">Prérequis satisfaits. Vous pouvez commencer ce cours.</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2 p-3 bg-amber-50 dark:bg-amber-900/20 rounded-xl border border-amber-200 dark:border-amber-800/50">
      <div className="flex items-start gap-2 text-sm text-amber-800 dark:text-amber-400">
        <Lock className="w-4 h-4 shrink-0 mt-0.5" />
        <div>
          <p className="font-bold">Accès verrouillé</p>
          <p className="text-xs mt-1">{result.reason}</p>
        </div>
      </div>
      
      {result.requirements && result.requirements.length > 0 && (
        <ul className="mt-2 space-y-1.5 ml-6">
          {result.requirements.map(req => (
            <li key={req.requirementId} className="flex items-center gap-2 text-sm">
              {req.isSatisfied ? (
                <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
              ) : (
                <div className="w-3.5 h-3.5 rounded-full border-2 border-amber-500 opacity-50" />
              )}
              <span className={`font-medium ${req.isSatisfied ? 'text-gray-500 line-through' : 'text-amber-900 dark:text-amber-200'}`}>
                {req.title}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};
