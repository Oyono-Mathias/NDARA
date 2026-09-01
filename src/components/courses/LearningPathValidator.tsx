import React from 'react';
import { LearningPath } from '../../services/learningPathService';
import { CheckCircle, AlertCircle, Info } from 'lucide-react';

interface LearningPathValidatorProps {
  path: LearningPath;
}

export const LearningPathValidator: React.FC<LearningPathValidatorProps> = ({ path }) => {
  if (path.status === 'completed') {
    return (
      <div className="p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-2xl border border-emerald-200 dark:border-emerald-800/50 flex items-start gap-3">
        <CheckCircle className="w-6 h-6 text-emerald-500 shrink-0 mt-0.5" />
        <div>
          <h4 className="font-bold text-emerald-800 dark:text-emerald-400">Parcours validé avec succès</h4>
          <p className="text-sm text-emerald-700 dark:text-emerald-300 mt-1">
            Félicitations ! Vous avez terminé toutes les étapes de ce parcours.
          </p>
        </div>
      </div>
    );
  }

  if (path.status === 'locked') {
    return (
      <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-2xl border border-gray-200 dark:border-gray-700 flex items-start gap-3">
        <AlertCircle className="w-6 h-6 text-gray-400 shrink-0 mt-0.5" />
        <div>
          <h4 className="font-bold text-gray-800 dark:text-gray-200">Parcours verrouillé</h4>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Vous ne remplissez pas encore les conditions pour entamer ce parcours.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-2xl border border-blue-200 dark:border-blue-800/50 flex items-start gap-3">
      <Info className="w-6 h-6 text-blue-500 shrink-0 mt-0.5" />
      <div>
        <h4 className="font-bold text-blue-800 dark:text-blue-400">Progression en cours</h4>
        <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
          Continuez votre apprentissage. Complétez chaque étape pour débloquer les suivantes et valider le parcours complet.
        </p>
      </div>
    </div>
  );
};
