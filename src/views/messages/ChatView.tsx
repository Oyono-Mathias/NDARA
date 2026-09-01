import React, { useState } from 'react';
import { useChat } from '../../hooks/useChat';
import { ConversationList } from './ConversationList';
import { ChatWindow } from '../../components/chat/ChatWindow';
import { ChatInput } from '../../components/chat/ChatInput';
import { ChevronLeft, Info, WifiOff } from 'lucide-react';

export const ChatView: React.FC = () => {
  const { 
    conversations, 
    activeConversationId, 
    messages, 
    loadingConversations, 
    loadingMessages, 
    wsStatus,
    error,
    openConversation, 
    sendMessage,
    retryMessage
  } = useChat();

  // Dans une architecture complète, l'ID viendrait du contexte d'Auth
  const CURRENT_USER_ID = "u1"; // Mock ID pour le currentUser
  const [mobileView, setMobileView] = useState<'list' | 'chat'>('list');

  const handleSelectConversation = (id: string) => {
    openConversation(id);
    setMobileView('chat');
  };

  const handleBackToList = () => {
    setMobileView('list');
  };

  const activeConversation = conversations.find(c => c.id === activeConversationId);
  const isOffline = wsStatus === 'disconnected' || wsStatus === 'error';

  return (
    <div className="flex h-[calc(100vh-4rem)] max-h-[900px] w-full max-w-7xl mx-auto bg-white dark:bg-gray-900 rounded-xl overflow-hidden shadow-lg border border-gray-200 dark:border-gray-800">
      
      {/* Colonne Liste (Visible sur desktop, ou sur mobile si view='list') */}
      <div className={`w-full md:w-80 lg:w-96 flex-shrink-0 flex flex-col ${mobileView === 'list' ? 'flex' : 'hidden md:flex'}`}>
        <div className="p-4 border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50 flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Messages</h2>
          {isOffline && <WifiOff className="w-5 h-5 text-amber-500" aria-label="Mode hors ligne (Mock)" />}
        </div>
        <div className="flex-1 overflow-hidden">
          <ConversationList 
            conversations={conversations} 
            activeId={activeConversationId} 
            onSelect={handleSelectConversation}
            loading={loadingConversations}
            error={error}
          />
        </div>
      </div>

      {/* Colonne Conversation (Visible sur desktop, ou sur mobile si view='chat') */}
      <div className={`flex-1 flex flex-col min-w-0 bg-gray-50 dark:bg-gray-900/50 ${mobileView === 'chat' ? 'flex' : 'hidden md:flex'}`}>
        {activeConversationId ? (
          <>
            {/* Header de la conversation active */}
            <div className="p-4 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 flex items-center shadow-sm z-10">
              <button 
                onClick={handleBackToList}
                className="md:hidden p-2 -ml-2 mr-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full"
                aria-label="Retour aux messages"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
              
              <div className="flex-1 min-w-0">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white truncate">
                  {activeConversation?.participants[0]?.displayName || 'Conversation'}
                </h3>
                <p className="text-xs text-amber-600 dark:text-amber-500 font-medium">
                  Mode Simulation (Backend non connecté)
                </p>
              </div>
            </div>

            {/* Historique des messages */}
            <ChatWindow 
              messages={messages} 
              currentUserId={CURRENT_USER_ID}
              loading={loadingMessages}
              onRetryMessage={(msgId) => retryMessage(msgId, CURRENT_USER_ID)}
            />

            {/* Zone de saisie */}
            <ChatInput 
              onSendMessage={(content) => sendMessage(content, CURRENT_USER_ID)}
              disabled={isOffline}
            />
          </>
        ) : (
          /* État vide quand aucune conversation n'est sélectionnée (Desktop uniquement) */
          <div className="flex-1 hidden md:flex flex-col items-center justify-center p-8 text-center bg-gray-50 dark:bg-gray-900">
            <div className="w-20 h-20 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-6">
              <Info className="w-10 h-10 text-gray-400" />
            </div>
            <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-2">Vos Messages</h3>
            <p className="text-gray-500 dark:text-gray-400 max-w-sm">
              Sélectionnez une conversation dans la liste pour commencer à échanger de manière sécurisée.
            </p>
          </div>
        )}
      </div>

    </div>
  );
};
