/**
 * Contrats des routes de messagerie Ndara (Client API layer).
 * ZERO TRUST: L'identité et les permissions sont toujours résolues côté serveur.
 */
export class ChatRoutes {
  // Routes préparées pour l'intégration future dans le routeur global (App.tsx)
  
  static get ChatHomePath(): string {
    return '/messages';
  }

  static getConversationPath(conversationId: string): string {
    // Ne jamais faire confiance à l'ID côté serveur. Le serveur vérifiera 
    // si l'utilisateur courant a le droit d'accéder à 'conversationId'.
    return `/messages/${encodeURIComponent(conversationId)}`;
  }
}
