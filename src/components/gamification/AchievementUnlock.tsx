import React, { useEffect, useState } from 'react';
import { Achievement } from '../../services/gamificationService';
import { Trophy, X } from 'lucide-react';

interface AchievementUnlockProps {
  achievement: Achievement;
  onClose: () => void;
  durationMs?: number;
}

export const AchievementUnlock: React.FC<AchievementUnlockProps> = ({ achievement, onClose, durationMs = 5000 }) => {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
      setTimeout(onClose, 300); // Wait for transition
    }, durationMs);
    
    return () => clearTimeout(timer);
  }, [durationMs, onClose]);

  const handleClose = () => {
    setVisible(false);
    setTimeout(onClose, 300);
  };

  return (
    <div 
      className={`fixed bottom-4 right-4 left-4 sm:left-auto sm:w-96 bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-primary/20 p-4 z-50 flex items-start gap-4 transform transition-all duration-300 ${visible ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}
      role="alert"
    >
      <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
        <Trophy className="w-6 h-6 text-primary" />
      </div>
      
      <div className="flex-1 min-w-0">
        <p className="text-xs font-bold text-primary uppercase tracking-wider mb-0.5">
          Succès débloqué !
        </p>
        <h4 className="text-sm font-bold text-gray-900 dark:text-white line-clamp-1">
          {achievement.title}
        </h4>
        <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2 mt-1">
          {achievement.description}
        </p>
        {achievement.rewardXp > 0 && (
          <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 mt-2">
            +{achievement.rewardXp} XP
          </p>
        )}
      </div>

      <button 
        onClick={handleClose}
        className="p-1 text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg min-h-[44px] min-w-[44px] flex items-center justify-center shrink-0 transition-colors -m-2"
        aria-label="Fermer la notification"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};
