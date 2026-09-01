import React, { useRef, useEffect } from 'react';
import { ChatMessage } from '../../services/chatService';
import { MessageBubble } from './MessageBubble';
import { RefreshCw } from 'lucide-react';

export interface ChatWindowProps {
  messages: ChatMessage[];
  currentUserId: string;
  loading?: boolean;
  onRetryMessage?: (messageId: string) => void;
}

export const ChatWindow: React.FC<ChatWindowProps> = ({ 
  messages, 
  currentUserId, 
  loading, 
  onRetryMessage 
}) => {
  const bottomRef = useRef<HTMLDivElement>(null);

  // Auto-scroll au chargement ou lors d'un nouveau message
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  if (loading && messages.length === 0) {
    return (
      <div className="flex-1 flex justify-center items-center bg-gray-50 dark:bg-gray-900/50">
        <RefreshCw className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  if (messages.length === 0) {
    return (
      <div className="flex-1 flex flex-col justify-center items-center bg-gray-50 dark:bg-gray-900/50 p-6 text-center">
        <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4">
          <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
        </div>
        <p className="text-gray-500 dark:text-gray-400">Aucun message pour le moment.</p>
        <p className="text-sm text-gray-400 mt-1">Envoyez un message pour démarrer la discussion.</p>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto bg-gray-50 dark:bg-gray-900/50 p-4 sm:p-6 flex flex-col">
      <div className="flex-1 flex flex-col justify-end">
        {messages.map((msg) => (
          <MessageBubble
            key={msg.id}
            message={msg}
            isOwn={msg.senderId === currentUserId}
            onRetry={onRetryMessage}
          />
        ))}
        <div ref={bottomRef} className="h-1" />
      </div>
    </div>
  );
};
