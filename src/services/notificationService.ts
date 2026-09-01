export type NotificationCategory = 
  | 'transaction' 
  | 'wallet' 
  | 'payment' 
  | 'commission' 
  | 'security' 
  | 'account' 
  | 'course' 
  | 'message' 
  | 'system' 
  | 'marketing';

export type NotificationStatus = 'created' | 'sent' | 'delivered' | 'read' | 'failed';
export type NotificationChannel = 'in-app' | 'push' | 'email' | 'sms';

export interface NotificationPayload {
  title: string;
  body: string;
  data?: Record<string, string | number | boolean>;
}

export interface AppNotification {
  id: string;
  category: NotificationCategory;
  status: NotificationStatus;
  channels: NotificationChannel[];
  payload: NotificationPayload;
  createdAt: string; // ISO 8601
  readAt?: string;
  errorDetail?: string;
}

export interface NotificationPreference {
  category: NotificationCategory;
  channels: NotificationChannel[];
  enabled: boolean;
  isCritical: boolean; // e.g., security or transactions cannot be disabled
}

export interface NotificationResult {
  success: boolean;
  notificationId?: string;
  channelResults: Partial<Record<NotificationChannel, { success: boolean; error?: string; status: string }>>;
}

export interface NotificationError {
  code: string;
  message: string;
  channel?: NotificationChannel;
}

/**
 * Service Métier Central des Notifications
 * Orchestre la normalisation et la délégation sans gérer de secrets client-side.
 */
export class NotificationService {
  /**
   * Normalise une payload entrante
   */
  static normalize(raw: unknown): AppNotification | null {
    if (!raw || typeof raw !== 'object') return null;
    const n = raw as Partial<AppNotification>;
    
    if (!n.id || !n.category || !n.payload) return null;
    
    return {
      id: n.id,
      category: n.category,
      status: n.status || 'created',
      channels: n.channels || ['in-app'],
      payload: {
        title: n.payload.title || '',
        body: n.payload.body || '',
        data: n.payload.data
      },
      createdAt: n.createdAt || new Date().toISOString(),
      readAt: n.readAt,
      errorDetail: n.errorDetail
    };
  }

  /**
   * Détermine le type/catégorie à partir d'un événement
   */
  static determineType(eventType: string): NotificationCategory {
    const map: Record<string, NotificationCategory> = {
      'TX_SUCCESS': 'transaction',
      'WALLET_CREDIT': 'wallet',
      'COMMISSION_EARNED': 'commission',
      'LOGIN_NEW_DEVICE': 'security',
      'COURSE_PUBLISHED': 'course'
    };
    return map[eventType] || 'system';
  }

  /**
   * Vérifie si une catégorie peut être désactivée par l'utilisateur.
   * Les notifications critiques (sécurité, transactions) sont imposées.
   */
  static isCriticalCategory(category: NotificationCategory): boolean {
    return ['security', 'transaction', 'payment', 'wallet'].includes(category);
  }

  /**
   * Retourne les préférences par défaut
   */
  static getDefaultPreferences(): NotificationPreference[] {
    const categories: NotificationCategory[] = [
      'transaction', 'wallet', 'payment', 'commission', 'security', 
      'account', 'course', 'message', 'system', 'marketing'
    ];

    return categories.map(cat => ({
      category: cat,
      channels: this.isCriticalCategory(cat) ? ['in-app', 'email', 'push'] : ['in-app'],
      enabled: true,
      isCritical: this.isCriticalCategory(cat)
    }));
  }

  /**
   * Expose des erreurs structurées pour l'UI
   */
  static createError(code: string, message: string, channel?: NotificationChannel): NotificationError {
    return { code, message, channel };
  }
}
