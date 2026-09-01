import React from 'react';
import { ForumTopic } from '../../services/forumService';
import { MessageSquare, Pin, Lock, Clock, User } from 'lucide-react';

interface ForumCardProps {
  topic: ForumTopic;
  onClick: (topicId: string) => void;
}

export const ForumCard: React.FC<ForumCardProps> = ({ topic, onClick }) => {
  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'announcement': return 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400';
      case 'support': return 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400';
      case 'technical': return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
      case 'course': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400';
      default: return 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300';
    }
  };

  const getCategoryLabel = (category: string) => {
    const labels: Record<string, string> = {
      announcement: 'Annonce',
      support: 'Support',
      technical: 'Technique',
      course: 'Cours',
      general: 'Général'
    };
    return labels[category] || category;
  };

  return (
    <div 
      onClick={() => onClick(topic.id)}
      className="flex flex-col sm:flex-row sm:items-center gap-4 p-4 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 hover:border-primary/50 dark:hover:border-primary/50 transition-colors cursor-pointer group shadow-sm hover:shadow-md"
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick(topic.id);
        }
      }}
      aria-label={`Sujet : ${topic.title}. Créé par ${topic.author.name}`}
    >
      {/* Icon Area */}
      <div className="flex-shrink-0 flex items-center justify-center w-12 h-12 rounded-full bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700 group-hover:bg-primary/10 group-hover:text-primary transition-colors">
        {topic.status === 'locked' ? (
          <Lock className="w-5 h-5 text-gray-400 group-hover:text-primary" aria-label="Verrouillé" />
        ) : topic.pinned ? (
          <Pin className="w-5 h-5 text-primary" aria-label="Épinglé" />
        ) : (
          <MessageSquare className="w-5 h-5 text-gray-400 group-hover:text-primary" aria-label="Sujet ouvert" />
        )}
      </div>

      {/* Main Content */}
      <div className="flex-1 min-w-0 flex flex-col gap-1.5">
        <div className="flex flex-wrap items-center gap-2 mb-0.5">
          <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md ${getCategoryColor(topic.category)}`}>
            {getCategoryLabel(topic.category)}
          </span>
          {topic.pinned && (
            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400 flex items-center gap-1">
              <Pin className="w-3 h-3" /> Épinglé
            </span>
          )}
        </div>
        
        <h3 className="font-bold text-gray-900 dark:text-white text-base leading-tight group-hover:text-primary transition-colors line-clamp-2">
          {topic.title}
        </h3>
        
        <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500 dark:text-gray-400 mt-1">
          <span className="flex items-center gap-1 min-w-0">
            <User className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate max-w-[120px]">{topic.author.name}</span>
          </span>
          <span className="flex items-center gap-1 shrink-0">
            <MessageSquare className="w-3.5 h-3.5" />
            <span>{topic.repliesCount} rép.</span>
          </span>
          <span className="flex items-center gap-1 shrink-0">
            <Clock className="w-3.5 h-3.5" />
            <span>{new Date(topic.lastActivity).toLocaleDateString('fr-FR')}</span>
          </span>
        </div>
      </div>
    </div>
  );
};
