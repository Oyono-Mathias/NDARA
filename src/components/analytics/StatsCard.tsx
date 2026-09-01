import React from 'react';
import { ArrowUpRight, ArrowDownRight, Minus, AlertCircle } from 'lucide-react';

export interface StatsCardProps {
  title: string;
  value: string | number;
  unit?: string;
  variation?: number;
  trend?: 'up' | 'down' | 'neutral';
  icon?: React.ReactNode;
  loading?: boolean;
  unavailable?: boolean;
  isMock?: boolean;
}

export const StatsCard: React.FC<StatsCardProps> = ({
  title,
  value,
  unit = '',
  variation,
  trend,
  icon,
  loading,
  unavailable,
  isMock
}) => {
  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 animate-pulse flex flex-col h-32 justify-between">
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
        <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
      </div>
    );
  }

  if (unavailable) {
    return (
      <div className="bg-gray-50 dark:bg-gray-900 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-800 flex flex-col h-32 justify-center items-center text-center">
        <AlertCircle className="w-6 h-6 text-gray-400 mb-2" />
        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Indisponible</p>
      </div>
    );
  }

  const renderTrend = () => {
    if (variation === undefined || trend === undefined) return null;
    
    // Si c'est un mock, on grise la variation pour ne pas la faire passer pour réelle
    const isNeutral = trend === 'neutral';
    const colorClass = isMock 
      ? 'text-gray-400' 
      : trend === 'up' ? 'text-emerald-600 dark:text-emerald-400' 
      : isNeutral ? 'text-gray-500' : 'text-red-600 dark:text-red-400';

    return (
      <div className={`flex items-center text-sm font-medium ${colorClass}`}>
        {trend === 'up' && <ArrowUpRight className="w-4 h-4 mr-1" />}
        {trend === 'down' && <ArrowDownRight className="w-4 h-4 mr-1" />}
        {isNeutral && <Minus className="w-4 h-4 mr-1" />}
        <span>{variation > 0 ? '+' : ''}{variation}%</span>
      </div>
    );
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 relative overflow-hidden">
      {isMock && (
        <div className="absolute top-0 right-0 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 text-[10px] font-bold px-2 py-1 rounded-bl-lg">
          MOCK
        </div>
      )}
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">{title}</h3>
        {icon && <div className="text-gray-400 dark:text-gray-500">{icon}</div>}
      </div>
      <div className="flex items-baseline gap-2">
        <span className="text-2xl font-bold text-gray-900 dark:text-white">
          {value}
        </span>
        {unit && <span className="text-sm font-medium text-gray-500">{unit}</span>}
      </div>
      <div className="mt-2">
        {renderTrend()}
      </div>
    </div>
  );
};
