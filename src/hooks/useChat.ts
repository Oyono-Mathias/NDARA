import { useState, useCallback, useEffect } from 'react';
import { ChatService, Conversation, ChatMessage } from '../services/chatService';
import { useWebSocket } from './useWebSocket';

export function useChat() {
  const { status: wsStatus, connect, disconnect } = useWebSocket();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loadingConversations, setLoadingConversations] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize and load conversations
  useEffect(() => {
    let isMounted = true;
    const fetchConversations = async () => {
      try {
        setLoadingConversations(true);
        const data = await ChatService.getConversations();
        if (isMounted) setConversations(data);
      } catch (err: any) {
        if (isMounted) setError(err.message || "Failed to load conversations");
      } finally {
        if (isMounted) setLoadingConversations(false);
      }
    };

    fetchConversations();
    connect();

    return () => {
      isMounted = false;
      disconnect();
    };
  }, [connect, disconnect]);

  const openConversation = useCallback(async (conversationId: string) => {
    setActiveConversationId(conversationId);
    setLoadingMessages(true);
    setError(null);
    try {
      const data = await ChatService.getMessages(conversationId);
      setMessages(data);
      await ChatService.markAsRead(conversationId);
    } catch (err: any) {
      setError(err.message || "Failed to load messages");
    } finally {
      setLoadingMessages(false);
    }
  }, []);

  const sendMessage = useCallback(async (content: string, senderId: string) => {
    if (!activeConversationId) return;

    // Création d'un message temporaire local
    const tempId = `temp_${Date.now()}`;
    const newMsg: ChatMessage = {
      id: tempId,
      conversationId: activeConversationId,
      senderId,
      content,
      status: 'sending',
      createdAt: new Date().toISOString()
    };

    setMessages(prev => [...prev, newMsg]);

    try {
      // Tentative d'envoi réel au backend (qui échouera en mode MOCK strict)
      const confirmedMsg = await ChatService.sendMessage(activeConversationId, content, senderId);
      setMessages(prev => prev.map(m => m.id === tempId ? confirmedMsg : m));
    } catch (err: any) {
      console.error("[useChat] Erreur d'envoi :", err);
      // Mise à jour du message en erreur pour permettre un Retry depuis l'UI
      setMessages(prev => prev.map(m => 
        m.id === tempId ? { ...m, status: 'failed', errorDetail: err.message } : m
      ));
    }
  }, [activeConversationId]);

  const retryMessage = useCallback(async (messageId: string, senderId: string) => {
    const msgToRetry = messages.find(m => m.id === messageId);
    if (!msgToRetry || !activeConversationId) return;

    // Remettre le message en statut sending
    setMessages(prev => prev.map(m => m.id === messageId ? { ...m, status: 'sending', errorDetail: undefined } : m));

    try {
      const confirmedMsg = await ChatService.sendMessage(activeConversationId, msgToRetry.content, senderId);
      setMessages(prev => prev.map(m => m.id === messageId ? confirmedMsg : m));
    } catch (err: any) {
      setMessages(prev => prev.map(m => 
        m.id === messageId ? { ...m, status: 'failed', errorDetail: err.message } : m
      ));
    }
  }, [activeConversationId, messages]);

  return {
    wsStatus,
    conversations,
    activeConversationId,
    messages,
    loadingConversations,
    loadingMessages,
    error,
    openConversation,
    sendMessage,
    retryMessage
  };
}
