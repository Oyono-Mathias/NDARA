import React from 'react';
import { RefreshCw, AlertCircle, Check, CheckCheck, Clock } from 'lucide-react';
import { ChatMessage } from '../../services/chatService';

export interface MessageBubbleProps {
  message: ChatMessage;
  isOwn: boolean;
  onRetry?: (messageId: string) => void;
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({ message, isOwn, onRetry }) => {
  const isFailed = message.status === 'failed';
  const isSending = message.status === 'sending';

  const formatTime = (isoString: string) => {
    return new Date(isoString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className={`flex w-full mb-4 ${isOwn ? 'justify-end' : 'justify-start'}`}>
      <div className={`flex flex-col max-w-[85%] sm:max-w-[75%] ${isOwn ? 'items-end' : 'items-start'}`}>
        
        {/* Bulle de message principale */}
        <div 
          className={`relative px-4 py-2.5 rounded-2xl text-sm ${
            isOwn 
              ? 'bg-primary text-white rounded-tr-sm' 
              : 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white rounded-tl-sm'
          } ${isFailed ? 'opacity-80' : ''}`}
        >
          {/* SÉCURITÉ ZERO TRUST: Pas de dangerouslySetInnerHTML. Le contenu texte est safe. */}
          <p className="whitespace-pre-wrap break-words">{message.content}</p>
        </div>

        {/* Méta informations (Heure, statut, erreur) */}
        <div className={`flex items-center mt-1 text-xs ${isOwn ? 'justify-end text-gray-500' : 'justify-start text-gray-500'}`}>
          <span className="mr-1">{formatTime(message.createdAt)}</span>
          
          {isOwn && (
            <span className="flex items-center ml-1">
              {isSending && <Clock className="w-3 h-3 text-gray-400" />}
              {message.status === 'sent' && <Check className="w-3 h-3 text-gray-400" />}
              {(message.status === 'delivered' || message.status === 'read') && (
                <CheckCheck className={`w-3 h-3 ${message.status === 'read' ? 'text-blue-500' : 'text-gray-400'}`} />
              )}
              {isFailed && <AlertCircle className="w-3 h-3 text-red-500" />}
            </span>
          )}
        </div>

        {/* Message d'erreur et bouton Retry */}
        {isOwn && isFailed && (
          <div className="flex items-center mt-1 text-xs text-red-500">
            <span className="mr-2">Échec de l'envoi</span>
            {onRetry && (
              <button 
                onClick={() => onRetry(message.id)}
                className="flex items-center font-medium hover:underline focus:outline-none"
                aria-label="Réessayer l'envoi"
              >
                <RefreshCw className="w-3 h-3 mr-1" />
                Réessayer
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
