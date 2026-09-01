import React from 'react';
import { SkillNode } from '../../services/gamificationService';
import { Check, Lock, ChevronDown } from 'lucide-react';
import { ProgressBar } from '../gamification/ProgressBar';

interface SkillTreeProps {
  nodes: SkillNode[];
}

export const SkillTree: React.FC<SkillTreeProps> = ({ nodes }) => {
  if (!nodes.length) return null;

  return (
    <div className="flex flex-col items-center w-full max-w-md mx-auto py-8">
      {nodes.map((node, index) => {
        const isCompleted = node.status === 'completed';
        const isUnlocked = node.status === 'unlocked';
        const isLocked = node.status === 'locked';

        let nodeColors = 'bg-gray-100 border-gray-300 text-gray-400 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-500';
        if (isCompleted) nodeColors = 'bg-primary border-primary text-white';
        else if (isUnlocked) nodeColors = 'bg-blue-50 border-blue-400 text-blue-600 dark:bg-blue-900/20 dark:border-blue-600 dark:text-blue-400';

        return (
          <React.Fragment key={node.id}>
            {/* Connection Line */}
            {index > 0 && (
              <div className="flex flex-col items-center">
                <div className={`w-1 h-8 ${isUnlocked || isCompleted ? 'bg-primary' : 'bg-gray-200 dark:bg-gray-700'}`} />
                <ChevronDown className={`w-5 h-5 -mt-1 z-10 ${isUnlocked || isCompleted ? 'text-primary' : 'text-gray-300 dark:text-gray-600'}`} />
                <div className={`w-1 h-4 ${isUnlocked || isCompleted ? 'bg-primary' : 'bg-gray-200 dark:bg-gray-700'}`} />
              </div>
            )}

            {/* Node Card */}
            <div className={`w-full p-5 rounded-2xl border-2 transition-all ${nodeColors} ${isUnlocked ? 'shadow-md scale-[1.02]' : ''}`}>
              <div className="flex items-start gap-4">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 border-2 ${
                  isCompleted ? 'bg-white/20 border-white text-white' : 
                  isUnlocked ? 'bg-blue-100 border-blue-400 text-blue-600 dark:bg-blue-900/50 dark:border-blue-500 dark:text-blue-300' : 
                  'bg-gray-200 border-gray-300 text-gray-400 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-600'
                }`}>
                  {isCompleted ? <Check className="w-6 h-6" /> : isLocked ? <Lock className="w-6 h-6" /> : <span className="font-bold text-lg">{index + 1}</span>}
                </div>
                
                <div className="flex-1 min-w-0">
                  <h4 className={`font-bold text-lg mb-1 ${isCompleted ? 'text-white' : isUnlocked ? 'text-gray-900 dark:text-white' : 'text-gray-500 dark:text-gray-400'}`}>
                    {node.title}
                  </h4>
                  <p className={`text-sm mb-3 ${isCompleted ? 'text-white/90' : 'text-gray-600 dark:text-gray-400'}`}>
                    {node.description}
                  </p>
                  
                  {isUnlocked && (
                    <div className="mt-2">
                      <ProgressBar 
                        value={node.progress} 
                        max={100} 
                        heightClass="h-2" 
                        colorClass="bg-blue-500" 
                        showLabel 
                      />
                    </div>
                  )}
                  {isLocked && node.requiredXp > 0 && (
                    <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 mt-2">
                      Requiert {node.requiredXp} XP
                    </p>
                  )}
                </div>
              </div>
            </div>
          </React.Fragment>
        );
      })}
    </div>
  );
};
