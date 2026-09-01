import React from 'react';
import { Bell } from 'lucide-react';
import { useNotifications } from '../../hooks/useNotifications';

export const NotificationBadge: React.FC = () => {
  const { unreadCount, loading, error } = useNotifications();

  // Ne jamais afficher de nombre négatif. Plafond à "99+"
  const displayCount = Math.max(0, unreadCount);
  const formattedCount = displayCount > 99 ? '99+' : displayCount;

  return (
    <div className="relative inline-flex items-center justify-center p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors" aria-label="Notifications">
      <Bell className="w-6 h-6 text-gray-700 dark:text-gray-200" aria-hidden="true" />
      
      {/* Ne pas casser le layout pendant le chargement ni en cas d'erreur */}
      {!loading && !error && displayCount > 0 && (
        <span 
          className="absolute top-1 right-1 inline-flex items-center justify-center px-1.5 py-0.5 text-xs font-bold leading-none text-white transform translate-x-1/4 -translate-y-1/4 bg-red-600 rounded-full"
          aria-label={`${displayCount} messages non lus`}
        >
          {formattedCount}
        </span>
      )}
    </div>
  );
};
