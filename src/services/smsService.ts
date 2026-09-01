import { NotificationPayload, NotificationResult } from './notificationService';

/**
 * Service SMS (Façade)
 * ZERO TRUST: Aucune clé API, aucun secret, aucun token fournisseur hardcodé.
 * Le client délègue l'intention d'envoi au backend.
 */
export class SmsService {
  /**
   * Tente d'envoyer une intention de notification par SMS au backend.
   */
  static async sendSmsIntent(_recipientPhoneId: string, _payload: NotificationPayload): Promise<NotificationResult> {
    console.warn("[SmsService] BLOCKED — SMS BACKEND NOT CONFIGURED.");
    
    // Le comportement explicite est d'échouer puisque l'infrastructure backend manque.
    return {
      success: false,
      channelResults: {
        sms: {
          success: false,
          status: 'BLOCKED',
          error: 'SMS_BACKEND_NOT_CONFIGURED: Cannot trigger SMS directly from client.'
        }
      }
    };
  }
}
