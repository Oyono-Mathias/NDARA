import React from 'react';

interface ProgressBarProps {
  value: number;
  max: number;
  colorClass?: string;
  heightClass?: string;
  showLabel?: boolean;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  value,
  max,
  colorClass = 'bg-primary',
  heightClass = 'h-2',
  showLabel = false
}) => {
  const safeMax = max > 0 ? max : 1;
  const safeValue = Math.max(0, Math.min(value, safeMax));
  const percentage = Math.round((safeValue / safeMax) * 100);

  return (
    <div className="w-full flex flex-col gap-1">
      {showLabel && (
        <div className="flex justify-between items-center text-xs font-medium text-gray-500 dark:text-gray-400">
          <span>{safeValue} / {safeMax}</span>
          <span>{percentage}%</span>
        </div>
      )}
      <div 
        className={`w-full bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden ${heightClass}`} 
        role="progressbar" 
        aria-valuenow={safeValue} 
        aria-valuemin={0} 
        aria-valuemax={safeMax}
      >
        <div
          className={`h-full rounded-full transition-all duration-500 ${colorClass}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};
