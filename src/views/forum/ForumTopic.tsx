import React, { useEffect } from 'react';
import { useForum } from '../../hooks/useForum';
import { CommentThread } from '../../components/forum/CommentThread';
import { ForumPost } from './ForumPost';
import { Loader2, AlertCircle, ArrowLeft, Pin, Lock, User, Clock, MessageSquare } from 'lucide-react';

interface ForumTopicViewProps {
  topicId: string;
  onBack: () => void;
}

export const ForumTopicView: React.FC<ForumTopicViewProps> = ({ topicId, onBack }) => {
  const { currentTopic, loading, error, isMockData, fetchTopicById, submitPost } = useForum();

  useEffect(() => {
    fetchTopicById(topicId);
  }, [topicId, fetchTopicById]);

  const handlePostSubmit = async (content: string) => {
    await submitPost({ topicId, content });
  };

  if (loading) {
    return (
      <div className="w-full max-w-4xl mx-auto p-4 flex flex-col items-center justify-center min-h-[50vh]">
        <Loader2 className="w-10 h-10 animate-spin text-primary mb-4" />
        <p className="text-gray-500">Chargement de la discussion...</p>
      </div>
    );
  }

  if (error || !currentTopic) {
    return (
      <div className="w-full max-w-4xl mx-auto p-4 sm:p-6 flex flex-col gap-4">
        <button onClick={onBack} className="self-start flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 transition-colors min-h-[44px]">
          <ArrowLeft className="w-4 h-4" /> Retour
        </button>
        <div className="bg-red-50 dark:bg-red-900/20 p-8 rounded-2xl border border-red-200 dark:border-red-800/50 text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-red-700 dark:text-red-400 mb-2">Sujet introuvable</h2>
          <p className="text-red-600 dark:text-red-300">{error || "Cette discussion n'existe pas ou a été supprimée."}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto p-4 sm:p-6 lg:p-8 flex flex-col gap-6 pb-16">
      {/* Navigation & Status Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <button 
          onClick={onBack} 
          className="self-start flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 transition-colors min-h-[44px] font-medium"
        >
          <ArrowLeft className="w-4 h-4" /> Liste des sujets
        </button>

        <div className="flex flex-wrap items-center gap-2">
          {isMockData && (
            <span className="bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400 text-xs px-2 py-1 rounded-md font-bold uppercase tracking-wider border border-amber-200 dark:border-amber-800">
              Mock
            </span>
          )}
          {currentTopic.pinned && (
            <span className="bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400 text-xs px-2 py-1 rounded-md font-bold uppercase tracking-wider flex items-center gap-1">
              <Pin className="w-3 h-3" /> Épinglé
            </span>
          )}
          {currentTopic.status === 'locked' && (
            <span className="bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300 text-xs px-2 py-1 rounded-md font-bold uppercase tracking-wider flex items-center gap-1">
              <Lock className="w-3 h-3" /> Verrouillé
            </span>
          )}
        </div>
      </div>

      {/* Main Topic Header */}
      <header className="bg-white dark:bg-gray-900 p-6 sm:p-8 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm flex flex-col gap-4">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white leading-tight">
          {currentTopic.title}
        </h1>
        
        <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 dark:text-gray-400 pt-4 border-t border-gray-100 dark:border-gray-800">
          <div className="flex items-center gap-2 text-gray-900 dark:text-white font-medium">
            <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center shrink-0 overflow-hidden">
              {currentTopic.author.avatar ? (
                <img src={currentTopic.author.avatar} alt={currentTopic.author.name} className="w-full h-full object-cover" />
              ) : (
                <User className="w-4 h-4 text-gray-500 dark:text-gray-400" />
              )}
            </div>
            <span>{currentTopic.author.name}</span>
          </div>
          <span className="hidden sm:inline text-gray-300 dark:text-gray-700">•</span>
          <span className="flex items-center gap-1.5 shrink-0">
            <Clock className="w-4 h-4" /> {new Date(currentTopic.createdAt).toLocaleDateString('fr-FR')}
          </span>
          <span className="hidden sm:inline text-gray-300 dark:text-gray-700">•</span>
          <span className="flex items-center gap-1.5 shrink-0">
            <MessageSquare className="w-4 h-4" /> {currentTopic.repliesCount} réponses
          </span>
        </div>
      </header>

      {/* Replies Thread */}
      <section className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-4 sm:p-6 shadow-sm">
        <h3 className="font-bold text-gray-900 dark:text-white mb-6 text-lg">
          Discussions
        </h3>
        <CommentThread posts={currentTopic.posts} />
      </section>

      {/* Reply Form */}
      <ForumPost 
        topicId={topicId} 
        onSubmit={handlePostSubmit} 
        disabled={currentTopic.status === 'locked'} 
      />
    </div>
  );
};
