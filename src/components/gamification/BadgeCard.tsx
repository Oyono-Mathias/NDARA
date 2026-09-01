import React from 'react';
import { Badge } from '../../services/badgeService';
import { Award, Star, Shield, Zap, Target, Lock } from 'lucide-react';
import { ProgressBar } from './ProgressBar';

interface BadgeCardProps {
  badge: Badge;
}

export const BadgeCard: React.FC<BadgeCardProps> = ({ badge }) => {
  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'star': return <Star className="w-8 h-8" />;
      case 'shield': return <Shield className="w-8 h-8" />;
      case 'zap': return <Zap className="w-8 h-8" />;
      case 'target': return <Target className="w-8 h-8" />;
      default: return <Award className="w-8 h-8" />;
    }
  };

  const getRarityColors = (rarity: string, unlocked: boolean) => {
    if (!unlocked) return 'bg-gray-100 text-gray-400 dark:bg-gray-800 dark:text-gray-500 border-gray-200 dark:border-gray-700';
    switch (rarity) {
      case 'legendary': return 'bg-amber-100 text-amber-600 border-amber-300 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-700';
      case 'epic': return 'bg-purple-100 text-purple-600 border-purple-300 dark:bg-purple-900/30 dark:text-purple-400 dark:border-purple-700';
      case 'rare': return 'bg-blue-100 text-blue-600 border-blue-300 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-700';
      default: return 'bg-emerald-100 text-emerald-600 border-emerald-300 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-700';
    }
  };

  const colors = getRarityColors(badge.rarity, badge.unlocked);

  return (
    <div className={`p-4 rounded-xl border flex flex-col items-center text-center gap-3 relative transition-all bg-white dark:bg-gray-900 ${badge.unlocked ? 'shadow-sm hover:shadow-md' : 'opacity-75 grayscale'}`}>
      {!badge.unlocked && (
        <Lock className="w-4 h-4 absolute top-3 right-3 text-gray-400" aria-label="Badge verrouillé" />
      )}
      
      <div className={`w-16 h-16 rounded-full flex items-center justify-center border-2 shrink-0 ${colors}`}>
        {getIcon(badge.icon)}
      </div>
      
      <div className="flex flex-col gap-1 w-full">
        <h4 className="font-bold text-gray-900 dark:text-white text-sm line-clamp-1" title={badge.name}>
          {badge.name}
        </h4>
        <span className="text-[10px] uppercase font-bold tracking-wider text-gray-500">
          {badge.rarity}
        </span>
        <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2 min-h-[32px]">
          {badge.description}
        </p>
      </div>
      
      {!badge.unlocked && badge.target > 0 && (
        <div className="w-full mt-auto pt-2">
           <ProgressBar 
              value={badge.progress} 
              max={badge.target} 
              showLabel 
              heightClass="h-1.5" 
              colorClass="bg-gray-400 dark:bg-gray-500" 
           />
        </div>
      )}
      
      {badge.unlocked && badge.unlockedAt && (
         <div className="w-full mt-auto pt-2 text-[10px] text-gray-400 dark:text-gray-500 font-medium">
           Obtenu le {new Date(badge.unlockedAt).toLocaleDateString('fr-FR')}
         </div>
      )}
    </div>
  );
};
