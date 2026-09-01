import React, { useEffect, useState } from 'react';
import { useGamification } from '../../hooks/useGamification';
import { ProgressBar } from '../../components/gamification/ProgressBar';
import { AchievementUnlock } from '../../components/gamification/AchievementUnlock';
import { Loader2, AlertCircle, CheckCircle, Target, Award } from 'lucide-react';
import { Achievement } from '../../services/gamificationService';

export const AchievementsView: React.FC = () => {
  const { achievements, loading, error, fetchAchievements } = useGamification();
  const [demoAchievement, setDemoAchievement] = useState<Achievement | null>(null);

  useEffect(() => {
    fetchAchievements();
  }, [fetchAchievements]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-12 min-h-[50vh]">
        <Loader2 className="w-10 h-10 animate-spin text-primary mb-4" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 dark:bg-red-900/20 p-6 rounded-2xl border border-red-200 text-center">
          <AlertCircle className="w-10 h-10 text-red-500 mx-auto mb-3" />
          <p className="text-red-700">{error}</p>
        </div>
      </div>
    );
  }

  const completed = achievements.filter(a => a.completed);
  const inProgress = achievements.filter(a => !a.completed);
  const isMock = achievements.some(a => a.isMock);

  const triggerDemo = () => {
    if (completed.length > 0) {
      setDemoAchievement(completed[0]);
    }
  };

  const renderAchievementCard = (achievement: Achievement) => (
    <div key={achievement.id} className={`bg-white dark:bg-gray-800 p-5 rounded-2xl border ${achievement.completed ? 'border-primary/50 shadow-sm' : 'border-gray-200 dark:border-gray-700'} flex items-start gap-4 transition-all hover:shadow-md`}>
      <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 ${achievement.completed ? 'bg-primary text-white' : 'bg-gray-100 text-gray-400 dark:bg-gray-700 dark:text-gray-500'}`}>
        {achievement.completed ? <CheckCircle className="w-6 h-6" /> : <Target className="w-6 h-6" />}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex justify-between items-start gap-2 mb-1">
          <h4 className="font-bold text-gray-900 dark:text-white line-clamp-1">{achievement.title}</h4>
          {achievement.rewardXp > 0 && (
            <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 px-2 py-1 rounded-full whitespace-nowrap">
              +{achievement.rewardXp} XP
            </span>
          )}
        </div>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-3 line-clamp-2 min-h-[40px]">
          {achievement.description}
        </p>
        {!achievement.completed && (
          <ProgressBar value={achievement.progress} max={achievement.target} showLabel heightClass="h-2" colorClass="bg-primary" />
        )}
        {achievement.completed && achievement.completedAt && (
          <p className="text-xs text-gray-400 font-medium">Débloqué le {new Date(achievement.completedAt).toLocaleDateString('fr-FR')}</p>
        )}
      </div>
    </div>
  );

  return (
    <div className="w-full max-w-5xl mx-auto p-4 sm:p-6 lg:p-8 flex flex-col gap-8 relative overflow-x-hidden">
      {demoAchievement && (
        <AchievementUnlock 
          achievement={demoAchievement} 
          onClose={() => setDemoAchievement(null)} 
        />
      )}

      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-200 dark:border-gray-800 pb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
            Succès (Achievements)
            {isMock && (
              <span className="bg-amber-100 text-amber-800 text-xs px-2 py-1 rounded-full font-bold uppercase tracking-wider">Mock</span>
            )}
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Relevez des défis pour gagner de l'XP.</p>
        </div>
        <button 
          onClick={triggerDemo}
          className="flex items-center justify-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg font-medium min-h-[44px] transition-colors"
        >
          <Award className="w-4 h-4" /> Tester l'alerte
        </button>
      </header>

      {inProgress.length > 0 && (
        <section>
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">En cours</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {inProgress.map(renderAchievementCard)}
          </div>
        </section>
      )}

      {completed.length > 0 && (
        <section>
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Terminés</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {completed.map(renderAchievementCard)}
          </div>
        </section>
      )}
    </div>
  );
};
