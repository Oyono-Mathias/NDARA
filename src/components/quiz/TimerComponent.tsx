import React from 'react';
import { Timer, AlertCircle } from 'lucide-react';

interface TimerComponentProps {
  timeRemaining: number | null;
  durationSeconds?: number;
}

export const TimerComponent: React.FC<TimerComponentProps> = ({ 
  timeRemaining, 
  durationSeconds 
}) => {
  if (timeRemaining === null) return null;

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const isLowTime = timeRemaining <= 60 && timeRemaining > 0;
  const isExpired = timeRemaining === 0;

  // Calcul du pourcentage (optionnel)
  const percentage = durationSeconds ? (timeRemaining / durationSeconds) * 100 : 100;

  return (
    <div 
      className={`
        flex items-center gap-2 px-4 py-2 rounded-xl border min-h-[44px] transition-colors
        ${isExpired 
          ? 'bg-red-50 dark:bg-red-900/30 border-red-200 dark:border-red-800 text-red-600 dark:text-red-400' 
          : isLowTime
            ? 'bg-amber-50 dark:bg-amber-900/30 border-amber-200 dark:border-amber-800 text-amber-600 dark:text-amber-400 animate-pulse'
            : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300'
        }
      `}
      role="timer"
      aria-live="polite"
      aria-atomic="true"
    >
      {isLowTime ? (
        <AlertCircle className="w-5 h-5 shrink-0" />
      ) : (
        <Timer className="w-5 h-5 shrink-0" />
      )}
      <span className="font-mono font-bold text-sm">
        {formatTime(timeRemaining)}
      </span>
      
      {/* Barre de progression miniature intégrée optionnelle */}
      {durationSeconds && !isExpired && (
        <div className="hidden sm:block ml-2 w-16 h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden shrink-0">
          <div 
            className={`h-full rounded-full transition-all duration-1000 ${isLowTime ? 'bg-amber-500' : 'bg-indigo-500'}`} 
            style={{ width: `${percentage}%` }}
          />
        </div>
      )}
    </div>
  );
};
