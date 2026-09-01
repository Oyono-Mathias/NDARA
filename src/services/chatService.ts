export type MessageStatus = 'sending' | 'sent' | 'delivered' | 'read' | 'failed';
export type ConnectionStatus = 'disconnected' | 'connecting' | 'connected' | 'error';

export interface ChatParticipant {
  id: string;
  displayName: string;
  avatarUrl?: string;
  role: 'student' | 'instructor' | 'admin';
}

export interface ChatMessage {
  id: string;
  conversationId: string;
  senderId: string;
  content: string;
  status: MessageStatus;
  createdAt: string; // ISO 8601
  errorDetail?: string;
}

export interface Conversation {
  id: string;
  participants: ChatParticipant[];
  lastMessage?: ChatMessage;
  unreadCount: number;
  updatedAt: string;
}

/**
 * Service Métier Central du Chat (Ndara)
 * Gère l'abstraction des communications.
 * ZERO TRUST: Le frontend ne décide pas des autorisations.
 */
export class ChatService {
  /**
   * Récupère la liste des conversations (Mock pour UX)
   */
  static async getConversations(): Promise<Conversation[]> {
    console.warn("[ChatService] BACKEND NOT CONNECTED: Returning UX Mock data.");
    // Mock sécurisé pour démontrer l'UX sans exposer de vraies données
    return [
      {
        id: 'conv_1',
        participants: [{ id: 'u2', displayName: 'Prof. Martin', role: 'instructor' }],
        unreadCount: 2,
        updatedAt: new Date().toISOString(),
        lastMessage: {
          id: 'msg_0',
          conversationId: 'conv_1',
          senderId: 'u2',
          content: 'N\'oubliez pas le devoir pour demain.',
          status: 'delivered',
          createdAt: new Date(Date.now() - 3600000).toISOString()
        }
      }
    ];
  }

  /**
   * Récupère l'historique d'une conversation (Mock pour UX)
   */
  static async getMessages(_conversationId: string, _limit: number = 20): Promise<ChatMessage[]> {
    console.warn("[ChatService] BACKEND NOT CONNECTED: Returning UX Mock messages.");
    return [
      {
        id: 'msg_1',
        conversationId: _conversationId,
        senderId: 'u2',
        content: 'Bonjour, avez-vous des questions sur le dernier chapitre ?',
        status: 'read',
        createdAt: new Date(Date.now() - 86400000).toISOString()
      }
    ];
  }

  /**
   * Tente d'envoyer un message.
   * RÈGLE ABSOLUE : Ne jamais simuler un succès définitif si le backend est absent.
   */
  static async sendMessage(_conversationId: string, _content: string, _senderId: string): Promise<ChatMessage> {
    console.warn("[ChatService] BLOCKED: Backend non connecté. L'action ne sera pas persistée.");
    
    // Nous retournons intentionnellement une erreur pour que l'UI affiche le statut 'failed'
    // et permette de tester le flux de "Retry", plutôt que de mentir à l'utilisateur.
    throw new Error('BACKEND_NOT_CONNECTED');
  }

  /**
   * Marque une conversation comme lue.
   */
  static async markAsRead(_conversationId: string): Promise<boolean> {
    console.warn("[ChatService] BLOCKED: Backend non connecté. Lecture non persistée.");
    return false;
  }
}
