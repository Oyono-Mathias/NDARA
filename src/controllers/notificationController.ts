import { 
  NotificationPayload, 
  NotificationCategory,
  NotificationResult 
} from '../services/notificationService';
import { EmailService } from '../services/emailService';
import { PushNotificationService } from '../services/pushNotificationService';
import { SmsService } from '../services/smsService';

/**
 * Controller d'Orchestration des Notifications
 * Valide les entrées, appelle le service approprié et normalise les erreurs.
 * ZERO TRUST: Ne contient aucune logique d'administration ou attribution de rôle.
 */
export class NotificationController {
  
  /**
   * Tente d'initier une requête de notification sortante via le backend.
   * (Ne doit pas être utilisé pour créer des événements financiers client-side).
   */
  static async requestNotificationDelivery(
    recipientId: string, 
    _category: NotificationCategory, 
    payload: NotificationPayload
  ): Promise<NotificationResult> {
    
    // Validation des entrées
    if (!recipientId || typeof recipientId !== 'string') {
      return this.createErrorResult('INVALID_RECIPIENT');
    }
    
    if (!payload || !payload.body) {
      return this.createErrorResult('INVALID_PAYLOAD');
    }

    // Le contrôleur délègue la requête au service de domaine.
    // L'autorité réelle d'envoi doit se trouver côté backend, ici nous ne pouvons que propager les "BLOCKED".
    
    const results: NotificationResult = {
      success: false, // Bloqué par défaut
      channelResults: {}
    };

    // Pour l'instant, toute infrastructure externe (Email, Push, SMS) est bloquée
    const emailRes = await EmailService.sendEmailIntent(recipientId, payload);
    const pushRes = await PushNotificationService.sendPushIntent(recipientId, payload);
    const smsRes = await SmsService.sendSmsIntent(recipientId, payload);

    results.channelResults = {
      email: emailRes.channelResults.email,
      push: pushRes.channelResults.push,
      sms: smsRes.channelResults.sms
    };

    return results;
  }

  /**
   * Helper pour construire un résultat d'erreur générique
   */
  private static createErrorResult(errorCode: string): NotificationResult {
    return {
      success: false,
      channelResults: {
        'in-app': {
          success: false,
          status: 'ERROR',
          error: errorCode
        }
      }
    };
  }
}
