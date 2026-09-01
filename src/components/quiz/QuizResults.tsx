import React from 'react';
import { QuizResult } from '../../services/quizService';
import { Target, CheckCircle2, XCircle, Award } from 'lucide-react';

interface QuizResultsProps {
  result: QuizResult;
  onRetry?: () => void;
}

export const QuizResults: React.FC<QuizResultsProps> = ({ result, onRetry }) => {
  const isPassed = result.isPassed;

  return (
    <div className="w-full max-w-xl mx-auto flex flex-col gap-6">
      
      {/* En-tête des résultats */}
      <div className={`
        relative overflow-hidden rounded-3xl p-8 sm:p-10 text-center border shadow-sm
        ${isPassed 
          ? 'bg-emerald-50 border-emerald-100 dark:bg-emerald-900/10 dark:border-emerald-900/30' 
          : 'bg-red-50 border-red-100 dark:bg-red-900/10 dark:border-red-900/30'
        }
      `}>
        {result.isMock && (
          <div className="absolute top-4 right-4 bg-black/10 dark:bg-white/10 px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-widest text-gray-700 dark:text-gray-300">
            Mock Data
          </div>
        )}
        
        <div className={`
          w-20 h-20 mx-auto rounded-full flex items-center justify-center mb-6 shadow-sm
          ${isPassed ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-800 dark:text-emerald-300' : 'bg-red-100 text-red-600 dark:bg-red-800 dark:text-red-300'}
        `}>
          {isPassed ? <Award className="w-10 h-10" /> : <Target className="w-10 h-10" />}
        </div>
        
        <h2 className={`text-2xl sm:text-3xl font-black mb-2 ${isPassed ? 'text-emerald-800 dark:text-emerald-400' : 'text-red-800 dark:text-red-400'}`}>
          {isPassed ? 'Félicitations !' : 'Test non réussi'}
        </h2>
        
        <p className="text-gray-600 dark:text-gray-400 text-sm sm:text-base font-medium">
          Vous avez obtenu un score de <span className="font-bold text-gray-900 dark:text-white">{Math.round(result.percentage)}%</span>.
        </p>
        <p className="text-xs text-gray-500 mt-1">
          (Seuil requis : {result.passingScore}%)
        </p>
      </div>

      {/* Détails du score */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-6 rounded-2xl flex flex-col items-center justify-center text-center">
          <CheckCircle2 className="w-8 h-8 text-emerald-500 mb-2" />
          <span className="text-3xl font-black text-gray-900 dark:text-white mb-1">
            {result.correctAnswers}
          </span>
          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
            Bonnes réponses
          </span>
        </div>
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-6 rounded-2xl flex flex-col items-center justify-center text-center">
          <XCircle className="w-8 h-8 text-red-500 mb-2" />
          <span className="text-3xl font-black text-gray-900 dark:text-white mb-1">
            {result.incorrectAnswers}
          </span>
          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
            Erreurs
          </span>
        </div>
      </div>

      {/* Actions */}
      {onRetry && (
        <div className="flex justify-center mt-4">
          <button
            onClick={onRetry}
            className="w-full sm:w-auto px-8 py-3 bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 text-gray-700 dark:text-gray-300 rounded-xl font-bold transition-all min-h-[44px]"
          >
            Recommencer le quiz
          </button>
        </div>
      )}
    </div>
  );
};
