import React from 'react';
import { ChartDataPoint } from '../../services/analyticsService';
import { AlertCircle, BarChart3 } from 'lucide-react';

export interface ChartComponentProps {
  data: ChartDataPoint[];
  type?: 'bar' | 'line';
  title?: string;
  loading?: boolean;
  unavailable?: boolean;
  isMock?: boolean;
}

export const ChartComponent: React.FC<ChartComponentProps> = ({
  data,
  
  title,
  loading,
  unavailable,
  isMock
}) => {
  if (loading) {
    return (
      <div className="w-full h-64 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-100 dark:border-gray-700 flex items-center justify-center animate-pulse">
        <BarChart3 className="w-8 h-8 text-gray-300 dark:text-gray-600" />
      </div>
    );
  }

  if (unavailable || data.length === 0) {
    return (
      <div className="w-full h-64 bg-gray-50 dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 flex flex-col items-center justify-center text-center p-6">
        <AlertCircle className="w-8 h-8 text-gray-400 mb-3" />
        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
          Données du graphique indisponibles
        </p>
      </div>
    );
  }

  const maxValue = Math.max(...data.map(d => d.value), 1); // Prévenir div par 0

  return (
    <div className="w-full bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 relative">
      {isMock && (
        <div className="absolute top-0 right-0 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 text-[10px] font-bold px-2 py-1 rounded-bl-lg rounded-tr-xl z-10">
          DEMO DATA
        </div>
      )}
      
      {title && <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-6">{title}</h3>}
      
      <div className="h-48 flex items-end gap-2 sm:gap-4 relative pt-4">
        {data.map((point, index) => {
          const heightPercent = (point.value / maxValue) * 100;
          
          return (
            <div key={`${point.label}-${index}`} className="flex-1 flex flex-col items-center group h-full justify-end">
              {/* Tooltip local (affiché au hover) */}
              <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute top-0 bg-gray-900 dark:bg-gray-700 text-white text-xs py-1 px-2 rounded -mt-6 pointer-events-none z-10">
                {point.value}
              </div>
              
              {/* Représentation SVG/CSS (Lightweight) */}
              <div 
                className="w-full bg-primary/20 hover:bg-primary dark:bg-primary/40 dark:hover:bg-primary transition-all rounded-t-sm"
                style={{ height: `${heightPercent}%`, minHeight: '4px' }}
                aria-label={`${point.label}: ${point.value}`}
              ></div>
              
              <span className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400 mt-2 truncate w-full text-center">
                {point.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
