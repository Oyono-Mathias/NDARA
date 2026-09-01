import { NotificationPayload, NotificationResult } from './notificationService';

export type PushStatus = 'unsupported' | 'permission_required' | 'denied' | 'ready' | 'error';

/**
 * Service Push Notification (Façade)
 * ZERO TRUST: Ne stocke aucun secret serveur. Le token push (s'il existait)
 * ne serait jamais considéré comme une preuve d'identité par le serveur.
 */
export class PushNotificationService {
  
  /**
   * Vérifie le statut de support et de permission du navigateur.
   */
  static getStatus(): PushStatus {
    if (typeof window === 'undefined' || !('Notification' in window) || !('serviceWorker' in navigator)) {
      return 'unsupported';
    }

    const permission = Notification.permission;
    if (permission === 'default') return 'permission_required';
    if (permission === 'denied') return 'denied';
    
    return 'ready';
  }

  /**
   * Demande la permission à l'utilisateur.
   */
  static async requestPermission(): Promise<PushStatus> {
    const status = this.getStatus();
    if (status === 'unsupported' || status === 'denied') {
      return status;
    }

    try {
      const permission = await Notification.requestPermission();
      return permission === 'granted' ? 'ready' : 'denied';
    } catch (error) {
      console.error('[PushService] Error requesting permission:', error);
      return 'error';
    }
  }

  /**
   * Tente d'enregistrer le device auprès du backend pour recevoir des push.
   */
  static async registerDevice(): Promise<{ success: boolean; status: string; error?: string }> {
    const status = this.getStatus();
    if (status !== 'ready') {
      return { success: false, status, error: 'Permission not granted or unsupported' };
    }

    console.warn("[PushService] BLOCKED / BACKEND_REQUIRED: Push backend infrastructure is not configured in this environment.");
    return { success: false, status: 'BLOCKED', error: 'BACKEND_REQUIRED: Cannot register device without push backend.' };
  }

  /**
   * Tente d'envoyer une intention de notification push (depuis le client vers le backend).
   * Note: Habituellement, un client n'envoie pas de push directement aux autres,
   * mais délègue la requête au backend.
   */
  static async sendPushIntent(_recipientId: string, _payload: NotificationPayload): Promise<NotificationResult> {
    console.warn("[PushService] BLOCKED / BACKEND_REQUIRED: Push backend infrastructure is not configured.");
    return {
      success: false,
      channelResults: {
        push: {
          success: false,
          status: 'BLOCKED',
          error: 'BACKEND_REQUIRED: Cannot send push directly from client.'
        }
      }
    };
  }
}
