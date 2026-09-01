import { AppNotification, NotificationPreference } from '../services/notificationService';

/**
 * Contrats des routes de notifications (Client API layer).
 * ZERO TRUST: 
 * L'identité cible est toujours résolue côté serveur via le contexte d'authentification (ex: token JWT).
 * Il est strictement interdit d'utiliser un paramètre client comme `/api/notifications/:userId`.
 */
export class NotificationRoutes {
  // private static readonly BASE_URL = '/api/notifications/my';

  /**
   * Récupère les notifications de l'utilisateur authentifié.
   */
  static async fetchNotifications(_limit: number = 20, _offset: number = 0): Promise<AppNotification[]> {
    console.warn("[NotificationRoutes] BACKEND_REQUIRED: Cannot fetch notifications. Backend is not operational.");
    // Retourne un mock vide sécurisé au lieu de crasher
    return [];
  }

  /**
   * Récupère le compteur de notifications non lues.
   */
  static async fetchUnreadCount(): Promise<number> {
    console.warn("[NotificationRoutes] BACKEND_REQUIRED: Cannot fetch unread count.");
    return 0;
  }

  /**
   * Marque une notification spécifique comme lue.
   */
  static async markAsRead(notificationId: string): Promise<boolean> {
    if (!notificationId) return false;
    console.warn("[NotificationRoutes] BACKEND_REQUIRED: Cannot mark notification as read.");
    return false;
  }

  /**
   * Marque toutes les notifications comme lues.
   */
  static async markAllAsRead(): Promise<boolean> {
    console.warn("[NotificationRoutes] BACKEND_REQUIRED: Cannot mark all as read.");
    return false;
  }

  /**
   * Récupère les préférences de l'utilisateur authentifié.
   */
  static async fetchPreferences(): Promise<NotificationPreference[]> {
    console.warn("[NotificationRoutes] BACKEND_REQUIRED: Cannot fetch preferences.");
    return [];
  }

  /**
   * Met à jour les préférences de l'utilisateur authentifié.
   */
  static async updatePreferences(_preferences: NotificationPreference[]): Promise<boolean> {
    console.warn("[NotificationRoutes] BACKEND_REQUIRED: Cannot update preferences.");
    return false;
  }
}
