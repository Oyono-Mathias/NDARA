import React from 'react';
import { Badge } from '../../services/badgeService';
import { BadgeCard } from '../gamification/BadgeCard';

interface BadgeCollectionProps {
  badges: Badge[];
  title?: string;
  emptyMessage?: string;
}

export const BadgeCollection: React.FC<BadgeCollectionProps> = ({ 
  badges, 
  title,
  emptyMessage = "Aucun badge trouvé."
}) => {
  return (
    <div className="w-full flex flex-col gap-4">
      {title && (
        <h3 className="text-lg font-bold text-gray-900 dark:text-white">
          {title} <span className="text-sm font-normal text-gray-500 ml-2">({badges.length})</span>
        </h3>
      )}
      
      {badges.length === 0 ? (
        <div className="p-8 text-center bg-gray-50 dark:bg-gray-800/50 rounded-2xl border border-dashed border-gray-200 dark:border-gray-700">
          <p className="text-gray-500 dark:text-gray-400">{emptyMessage}</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {badges.map(badge => (
            <BadgeCard key={badge.id} badge={badge} />
          ))}
        </div>
      )}
    </div>
  );
};
