import React from 'react';
import { CourseRecommendation } from '../../services/recommendationService';
import { Star, Clock, User, Sparkles } from 'lucide-react';

interface CourseRecommendationsProps {
  recommendations: CourseRecommendation[];
  horizontalScroll?: boolean;
}

export const CourseRecommendations: React.FC<CourseRecommendationsProps> = ({ 
  recommendations, 
  horizontalScroll = true 
}) => {
  if (!recommendations || recommendations.length === 0) {
    return null;
  }

  const containerClasses = horizontalScroll 
    ? "flex flex-nowrap overflow-x-auto gap-4 pb-4 snap-x snap-mandatory scrollbar-hide" 
    : "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6";

  return (
    <div className={containerClasses}>
      {recommendations.map((rec) => (
        <article 
          key={rec.courseId} 
          className={`flex flex-col bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden shrink-0 ${horizontalScroll ? 'w-[280px] sm:w-[320px] snap-start' : 'w-full'}`}
        >
          {/* Thumbnail placeholder */}
          <div className="w-full h-36 bg-gray-100 dark:bg-gray-800 relative">
            {rec.thumbnail ? (
              <img src={rec.thumbnail} alt={`Aperçu du cours ${rec.title}`} className="w-full h-full object-cover" loading="lazy" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-300 dark:text-gray-600">
                <span className="font-bold text-lg">{rec.category}</span>
              </div>
            )}
            
            {/* Mock Indicator */}
            {rec.isMock && (
              <span className="absolute top-2 right-2 bg-amber-500/90 text-white text-[10px] font-bold px-2 py-0.5 uppercase tracking-wider rounded">
                Mock
              </span>
            )}
          </div>

          <div className="p-4 flex flex-col flex-1 gap-2">
            
            {/* Reason Badge */}
            <div className="flex items-start">
              <span className="inline-flex items-center gap-1 text-[10px] sm:text-xs font-semibold text-primary bg-primary/10 px-2 py-1 rounded-md">
                <Sparkles className="w-3 h-3" />
                {rec.reason}
              </span>
            </div>

            <h3 className="font-bold text-gray-900 dark:text-white leading-tight line-clamp-2 mt-1">
              {rec.title}
            </h3>

            <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 flex-1">
              {rec.description}
            </p>

            <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 mt-2">
              <span className="flex items-center gap-1">
                <User className="w-3.5 h-3.5" />
                <span className="truncate max-w-[100px]">{rec.instructor}</span>
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                {Math.round(rec.duration / 60)}h
              </span>
            </div>

            <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100 dark:border-gray-800">
              {rec.rating ? (
                <div className="flex items-center gap-1 text-sm font-bold text-amber-500">
                  <Star className="w-4 h-4 fill-current" />
                  {rec.rating.toFixed(1)}
                </div>
              ) : (
                <div className="text-sm text-gray-400">Nouveau</div>
              )}
              
              <div className="flex flex-col items-end">
                <span className="text-[10px] text-gray-400 uppercase tracking-wider">Pertinence</span>
                <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">{rec.score}%</span>
              </div>
            </div>

          </div>
        </article>
      ))}
    </div>
  );
};
