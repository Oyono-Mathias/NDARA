import React from 'react';
import { classNames } from '../../lib/utils';
import { ArrowLeft } from 'lucide-react';

export interface TopAppBarProps {
  title: string;
  onBack?: () => void;
  actions?: React.ReactNode;
  className?: string;
}

export const TopAppBar: React.FC<TopAppBarProps> = ({ title, onBack, actions, className }) => {
  return (
    <header className={classNames("sticky top-0 z-30 bg-white border-b border-gray-100 safe-area-top", className)}>
      <div className="flex items-center h-[56px] px-2 sm:px-4">
        {onBack ? (
          <button
            onClick={onBack}
            className="flex items-center justify-center min-w-[44px] min-h-[44px] rounded-full text-gray-700 hover:bg-gray-100 active:bg-gray-200 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
            aria-label="Retour"
          >
            <ArrowLeft className="w-6 h-6" aria-hidden="true" />
          </button>
        ) : (
          <div className="min-w-[44px]" /> // Spacer
        )}
        
        <h1 className="flex-1 text-lg font-bold text-gray-900 text-center truncate px-2">
          {title}
        </h1>
        
        <div className="min-w-[44px] flex items-center justify-end">
          {actions}
        </div>
      </div>
    </header>
  );
};
