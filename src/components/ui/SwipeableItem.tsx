import React from 'react';
import { classNames } from '../../lib/utils';

export interface SwipeableItemProps {
  children: React.ReactNode;
  actions: React.ReactNode;
  className?: string;
}

/**
 * Utilise le CSS natif (scroll-snap) pour un swipe horizontal fiable et performant
 * sans librairie externe. Recommandé pour Android.
 */
export const SwipeableItem: React.FC<SwipeableItemProps> = ({ children, actions, className }) => {
  return (
    <div className={classNames("relative overflow-hidden", className)}>
      <div className="flex overflow-x-auto snap-x snap-mandatory [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        {/* Contenu principal */}
        <div className="w-full shrink-0 snap-start snap-always">
          {children}
        </div>
        {/* Actions secondaires révélées au swipe */}
        <div className="shrink-0 snap-end snap-always flex items-stretch">
          {actions}
        </div>
      </div>
    </div>
  );
};
