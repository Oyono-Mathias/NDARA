import React from 'react';
import { QuizQuestion } from '../../services/quizService';
import { ChevronRight, ChevronLeft, CheckCircle2, Circle } from 'lucide-react';

interface QuestionRandomizerProps {
  question: QuizQuestion;
  currentIndex: number;
  totalQuestions: number;
  currentAnswer?: string;
  onAnswer: (questionId: string, optionId: string) => void;
  onNext: () => void;
  onPrev: () => void;
  onSubmit: () => void;
  isSubmitting?: boolean;
}

export const QuestionRandomizer: React.FC<QuestionRandomizerProps> = ({
  question,
  currentIndex,
  totalQuestions,
  currentAnswer,
  onAnswer,
  onNext,
  onPrev,
  onSubmit,
  isSubmitting
}) => {
  const isFirst = currentIndex === 0;
  const isLast = currentIndex === totalQuestions - 1;
  const progress = ((currentIndex + 1) / totalQuestions) * 100;

  return (
    <div className="flex flex-col gap-6 w-full max-w-2xl mx-auto">
      {/* Barre de progression */}
      <div className="flex flex-col gap-2">
        <div className="flex justify-between items-center text-sm font-semibold text-gray-500 dark:text-gray-400">
          <span>Question {currentIndex + 1} sur {totalQuestions}</span>
          <span>{Math.round(progress)}%</span>
        </div>
        <div 
          className="w-full h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden"
          role="progressbar"
          aria-valuenow={currentIndex + 1}
          aria-valuemin={1}
          aria-valuemax={totalQuestions}
        >
          <div 
            className="h-full bg-indigo-600 dark:bg-indigo-500 transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Titre de la question */}
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-6 rounded-2xl shadow-sm">
        <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white leading-relaxed break-words">
          {question.text}
        </h3>
      </div>

      {/* Options */}
      <div className="flex flex-col gap-3" role="radiogroup" aria-labelledby="question-title">
        {question.options.map((option) => {
          const isSelected = currentAnswer === option.id;
          
          return (
            <label
              key={option.id}
              className={`
                flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all min-h-[56px]
                ${isSelected 
                  ? 'border-indigo-600 bg-indigo-50 dark:border-indigo-500 dark:bg-indigo-900/20' 
                  : 'border-gray-200 bg-white hover:border-indigo-300 dark:border-gray-800 dark:bg-gray-900 dark:hover:border-indigo-700'
                }
                ${isSubmitting ? 'opacity-60 pointer-events-none' : ''}
              `}
            >
              <input
                type="radio"
                name={`question-${question.id}`}
                value={option.id}
                checked={isSelected}
                onChange={() => onAnswer(question.id, option.id)}
                disabled={isSubmitting}
                className="sr-only" // Hidden but accessible
              />
              <div className="shrink-0">
                {isSelected ? (
                  <CheckCircle2 className="w-6 h-6 text-indigo-600 dark:text-indigo-500" />
                ) : (
                  <Circle className="w-6 h-6 text-gray-300 dark:text-gray-700" />
                )}
              </div>
              <span className={`text-base flex-1 break-words ${isSelected ? 'text-indigo-900 dark:text-indigo-100 font-medium' : 'text-gray-700 dark:text-gray-300'}`}>
                {option.text}
              </span>
            </label>
          );
        })}
      </div>

      {/* Navigation */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-4">
        <button
          onClick={onPrev}
          disabled={isFirst || isSubmitting}
          className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors min-h-[44px]"
        >
          <ChevronLeft className="w-5 h-5" />
          Précédent
        </button>

        {isLast ? (
          <button
            onClick={onSubmit}
            disabled={!currentAnswer || isSubmitting}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-3 rounded-xl font-bold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md min-h-[44px]"
          >
            {isSubmitting ? 'Soumission...' : 'Terminer'}
            <CheckCircle2 className="w-5 h-5" />
          </button>
        ) : (
          <button
            onClick={onNext}
            disabled={isSubmitting}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-bold text-indigo-700 bg-indigo-100 hover:bg-indigo-200 dark:bg-indigo-900/30 dark:text-indigo-300 dark:hover:bg-indigo-900/50 disabled:opacity-50 transition-colors min-h-[44px]"
          >
            Suivant
            <ChevronRight className="w-5 h-5" />
          </button>
        )}
      </div>
    </div>
  );
};
