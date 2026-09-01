import React, { useState } from 'react';
import { Star } from 'lucide-react';
import { RatingValue } from '../../services/reviewService';

interface StarRatingProps {
  value: number;
  readOnly?: boolean;
  onChange?: (rating: RatingValue) => void;
  size?: 'sm' | 'md' | 'lg';
}

export const StarRating: React.FC<StarRatingProps> = ({ 
  value, 
  readOnly = false, 
  onChange,
  size = 'md' 
}) => {
  const [hoverValue, setHoverValue] = useState<number>(0);

  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8'
  };

  const currentIconSize = sizeClasses[size];

  const handleKeyDown = (e: React.KeyboardEvent, starValue: number) => {
    if (readOnly || !onChange) return;
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onChange(starValue as RatingValue);
    }
  };

  // Tableau de 1 à 5
  const stars = [1, 2, 3, 4, 5];
  
  // Utiliser la valeur de survol si on interagit, sinon la valeur réelle
  const displayValue = hoverValue > 0 ? hoverValue : value;

  return (
    <div 
      className="flex items-center gap-1"
      role={readOnly ? 'img' : 'group'}
      aria-label={readOnly ? `Note : ${value} étoiles sur 5` : 'Évaluer ce cours sur 5'}
    >
      {stars.map((star) => {
        const isFilled = star <= displayValue;
        const isInteractive = !readOnly && onChange;
        
        return (
          <div
            key={star}
            role={isInteractive ? 'button' : 'presentation'}
            tabIndex={isInteractive ? 0 : -1}
            onClick={() => isInteractive && onChange(star as RatingValue)}
            onKeyDown={(e) => handleKeyDown(e, star)}
            onMouseEnter={() => isInteractive && setHoverValue(star)}
            onMouseLeave={() => isInteractive && setHoverValue(0)}
            aria-label={isInteractive ? `Attribuer ${star} étoile(s)` : undefined}
            className={`
              flex items-center justify-center transition-all
              ${isInteractive ? 'cursor-pointer hover:scale-110 min-w-[44px] min-h-[44px]' : 'cursor-default'}
              focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 rounded-full
            `}
          >
            <Star 
              className={`
                ${currentIconSize} transition-colors duration-200
                ${isFilled 
                  ? 'fill-amber-400 text-amber-400' 
                  : 'fill-transparent text-gray-300 dark:text-gray-600'
                }
              `} 
              aria-hidden="true" 
            />
          </div>
        );
      })}
    </div>
  );
};
