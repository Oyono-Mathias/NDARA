export interface ChatSpace {
  name: string;
  displayName: string;
}

export interface ChatMessage {
  name: string;
  text: string;
  createTime: string;
}

export class GoogleChatService {
  // NO HARDCODED SECRETS ALLOWED
  // All real calls must go through a secure Cloud Function or backend endpoint.

  static async listSpaces(): Promise<ChatSpace[]> {
    // Mock offline/unconnected state
    return Promise.reject(new Error('Intégration Google Workspace non connectée. Configuration serveur OAuth manquante.'));
  }

  static async sendMessage(spaceName: string, text: string): Promise<ChatMessage> {
    console.debug(`Intention d'envoi vers ${spaceName}: ${text}`);
    return Promise.reject(new Error('Intégration Google Workspace non connectée. Impossible d\'envoyer un message sans validation backend.'));
  }
}
