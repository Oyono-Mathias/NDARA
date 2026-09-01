import React from 'react';

interface PathProgressProps {
  progressPercentage: number;
  completedCourses: number;
  totalCourses: number;
  label?: string;
}

export const PathProgress: React.FC<PathProgressProps> = ({ 
  progressPercentage, 
  completedCourses, 
  totalCourses,
  label = "Progression"
}) => {
  // Ensure percentage is between 0 and 100
  const safePercentage = Math.min(Math.max(progressPercentage, 0), 100);
  
  return (
    <div className="flex flex-col w-full gap-1.5" role="progressbar" aria-valuenow={safePercentage} aria-valuemin={0} aria-valuemax={100} aria-label={`Progression du parcours : ${safePercentage}%`}>
      <div className="flex items-center justify-between text-sm">
        <span className="font-semibold text-gray-700 dark:text-gray-300">{label}</span>
        <span className="font-bold text-primary">{safePercentage}%</span>
      </div>
      
      <div className="h-2.5 w-full bg-gray-200 dark:bg-gray-800 rounded-full overflow-hidden">
        <div 
          className="h-full bg-primary rounded-full transition-all duration-500 ease-out"
          style={{ width: `${safePercentage}%` }}
        />
      </div>
      
      <div className="text-xs text-gray-500 dark:text-gray-400 text-right">
        {completedCourses} / {totalCourses} étapes terminées
      </div>
    </div>
  );
};
