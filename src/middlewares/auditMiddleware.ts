import { AuditLog, AuditAction, AuditSeverity, AuditStatus, AuditActor, AuditResource } from '../services/auditLogService';

/**
 * Interface pour capturer un événement brut avant audit.
 */
export interface RawAuditEvent {
  actor: AuditActor;
  action: AuditAction;
  severity: AuditSeverity;
  status: AuditStatus;
  resource?: AuditResource;
  metadata?: Record<string, any>;
}

/**
 * Middleware d'audit (Frontend)
 *
 * RÔLE : Préparer et nettoyer les événements avant de les transmettre au service (et ultérieurement au backend).
 * ZERO TRUST : Ce middleware s'exécute côté client. Le backend devra lui-même forcer
 * le timestamp, valider l'identité réelle de l'acteur via le token, et vérifier les droits.
 */
export class AuditMiddleware {
  // Liste des clés sensibles à ne JAMAIS loguer
  private static readonly SENSITIVE_KEYS = [
    'password', 'pin', 'token', 'access_token', 'refresh_token', 
    'secret', 'card_number', 'cvv', 'credit_card', 'api_key'
  ];

  /**
   * Nettoie les métadonnées pour éviter la fuite de secrets (Data Minimization).
   */
  private static sanitizeMetadata(metadata?: Record<string, any>): Record<string, any> | undefined {
    if (!metadata) return undefined;

    const sanitized = { ...metadata };
    
    for (const key of Object.keys(sanitized)) {
      const lowerKey = key.toLowerCase();
      // Si la clé correspond à une donnée sensible, on la caviarde
      if (this.SENSITIVE_KEYS.some(sensitive => lowerKey.includes(sensitive))) {
        sanitized[key] = '***REDACTED***';
      }
    }
    
    return sanitized;
  }

  /**
   * Prépare un événement pour le service d'audit.
   */
  static prepareEvent(raw: RawAuditEvent): Omit<AuditLog, 'id' | 'timestamp' | 'isMock'> {
    return {
      actor: raw.actor,
      action: raw.action,
      severity: raw.severity,
      status: raw.status,
      resource: raw.resource,
      source: 'web', // Peut être dynamique selon le contexte
      metadata: this.sanitizeMetadata(raw.metadata),
    };
  }
}
