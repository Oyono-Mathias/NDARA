import { NotificationPayload, NotificationResult } from './notificationService';

/**
 * Service Email (Façade)
 * ZERO TRUST: Le navigateur ne contient aucune clé API email, aucun secret SMTP.
 * Ce service prépare uniquement une intention d'envoi destinée à un backend sécurisé.
 */
export class EmailService {
  /**
   * Tente d'envoyer une intention de notification par email au backend.
   * Si le backend n'est pas opérationnel, retourne une erreur explicite.
   */
  static async sendEmailIntent(_recipientId: string, _payload: NotificationPayload): Promise<NotificationResult> {
    console.warn("[EmailService] BLOCKED / BACKEND_REQUIRED: Email backend infrastructure is not configured in this environment.");
    
    // Nous ne simulons pas un faux succès. L'absence d'infrastructure backend 
    // doit remonter comme un échec (BLOCKED).
    return {
      success: false,
      channelResults: {
        email: {
          success: false,
          status: 'BLOCKED',
          error: 'BACKEND_REQUIRED: Cannot send email directly from client.'
        }
      }
    };
  }
}
