/**
 * Types conceptuels pour la validation des requêtes liées au RGPD
 */

export type GdprOperationType = 'read_personal_data' | 'update_preferences' | 'export_data' | 'delete_data';

export interface GdprContext {
  userId: string | null;
  isAuthenticated: boolean;
  hasConsentedToTerms: boolean;
}

export interface MiddlewareResult {
  allowed: boolean;
  reason?: string;
  requiresReAuth?: boolean;
}

/**
 * Middleware de conformité RGPD.
 * Conçu pour préparer les contrôles de sécurité et de conformité.
 * NOTE : Ce middleware agit au niveau frontend/client en guise de garde-fou UI.
 * L'autorité finale RESTE et DOIT RESTER le backend (Zero Trust).
 */
export class GdprMiddleware {
  
  /**
   * Évalue si l'opération sensible est autorisée au niveau de l'interface.
   */
  static validateOperation(operation: GdprOperationType, context: GdprContext): MiddlewareResult {
    // Règle 1 : L'utilisateur doit être authentifié pour toute opération RGPD
    if (!context.isAuthenticated || !context.userId) {
      return {
        allowed: false,
        reason: 'L\'utilisateur doit être authentifié pour accéder à ses données personnelles.'
      };
    }

    // Règle 2 : Le consentement de base est requis
    if (!context.hasConsentedToTerms) {
      return {
        allowed: false,
        reason: 'Les conditions d\'utilisation générales doivent être acceptées.'
      };
    }

    // Règle 3 : Opérations ultra-sensibles
    if (operation === 'delete_data' || operation === 'export_data') {
      // Dans un système réel, on vérifierait ici si l'utilisateur a récemment 
      // saisi son mot de passe ou validé un MFA (requiresReAuth: true).
      // Pour l'instant, on bloque conceptuellement si on détecte une anomalie.
      return {
        allowed: true, // Autorisé par le middleware UI (le backend fera le vrai check)
        requiresReAuth: true // Indication qu'une ré-authentification serait exigée par le backend
      };
    }

    return { allowed: true };
  }
}
