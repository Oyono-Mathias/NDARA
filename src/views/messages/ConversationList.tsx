import React from 'react';
import { Conversation } from '../../services/chatService';
import { User, RefreshCw, AlertCircle } from 'lucide-react';

export interface ConversationListProps {
  conversations: Conversation[];
  activeId: string | null;
  onSelect: (id: string) => void;
  loading?: boolean;
  error?: string | null;
}

export const ConversationList: React.FC<ConversationListProps> = ({
  conversations,
  activeId,
  onSelect,
  loading,
  error
}) => {

  const formatTime = (isoString: string) => {
    const date = new Date(isoString);
    const now = new Date();
    if (date.toDateString() === now.toDateString()) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    return date.toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center p-8 text-gray-400">
        <RefreshCw className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col h-full items-center justify-center p-6 text-center">
        <AlertCircle className="w-10 h-10 text-red-400 mb-3" />
        <p className="text-sm text-red-600 dark:text-red-400 font-medium">{error}</p>
      </div>
    );
  }

  if (conversations.length === 0) {
    return (
      <div className="flex h-full flex-col items-center justify-center p-6 text-center">
        <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4">
          <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
          </svg>
        </div>
        <p className="text-gray-500 dark:text-gray-400 font-medium">Aucune conversation</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full overflow-y-auto bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800">
      {conversations.map((conv) => {
        // En mock, on affiche le premier participant
        const otherParticipant = conv.participants[0] || { displayName: 'Utilisateur Inconnu' };
        
        return (
          <button
            key={conv.id}
            onClick={() => onSelect(conv.id)}
            className={`w-full flex items-start p-4 text-left border-b border-gray-100 dark:border-gray-800 transition-colors focus:outline-none focus:bg-gray-50 dark:focus:bg-gray-800 ${
              activeId === conv.id 
                ? 'bg-blue-50 dark:bg-blue-900/20' 
                : 'hover:bg-gray-50 dark:hover:bg-gray-800'
            }`}
          >
            <div className="flex-shrink-0 w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center overflow-hidden">
              {otherParticipant.avatarUrl ? (
                <img src={otherParticipant.avatarUrl} alt={otherParticipant.displayName} className="w-full h-full object-cover" />
              ) : (
                <User className="w-6 h-6 text-gray-500 dark:text-gray-400" />
              )}
            </div>
            
            <div className="ml-3 flex-1 min-w-0">
              <div className="flex justify-between items-baseline">
                <h3 className={`text-sm font-semibold truncate ${conv.unreadCount > 0 ? 'text-gray-900 dark:text-white' : 'text-gray-700 dark:text-gray-300'}`}>
                  {otherParticipant.displayName}
                </h3>
                <span className="text-xs text-gray-400 flex-shrink-0 ml-2">
                  {conv.updatedAt ? formatTime(conv.updatedAt) : ''}
                </span>
              </div>
              
              <div className="flex justify-between items-center mt-1">
                <p className={`text-sm truncate pr-2 ${conv.unreadCount > 0 ? 'text-gray-900 dark:text-gray-200 font-medium' : 'text-gray-500 dark:text-gray-400'}`}>
                  {conv.lastMessage?.content || 'Nouvelle conversation'}
                </p>
                {conv.unreadCount > 0 && (
                  <span className="inline-flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-primary rounded-full flex-shrink-0">
                    {conv.unreadCount > 99 ? '99+' : conv.unreadCount}
                  </span>
                )}
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
};
