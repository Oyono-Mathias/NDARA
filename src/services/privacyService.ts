/**
 * Types de données pour les préférences de confidentialité
 */
export interface PrivacyPreferences {
  marketingCommunications: boolean;
  analyticsCollection: boolean;
  experiencePersonalization: boolean;
}

export type OperationStatus = 'idle' | 'pending' | 'completed' | 'failed' | 'backend_not_connected';

export interface PrivacyServiceResponse<T> {
  data: T;
  isMock: boolean;
  status: OperationStatus;
  message?: string;
}

export interface DataExportRequest {
  requestId: string;
  requestedAt: string;
  status: 'processing' | 'ready';
}

export interface DataDeletionRequest {
  deletionId: string;
  requestedAt: string;
  estimatedDeletionDate: string;
}

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export class PrivacyService {
  /**
   * Récupère les préférences de confidentialité actuelles de l'utilisateur.
   * MOCK : Retourne des valeurs par défaut.
   */
  static async getPreferences(): Promise<PrivacyServiceResponse<PrivacyPreferences>> {
    await delay(600);
    
    return {
      isMock: true,
      status: 'completed',
      data: {
        marketingCommunications: false,
        analyticsCollection: true,
        experiencePersonalization: true,
      }
    };
  }

  /**
   * Met à jour les préférences de confidentialité de l'utilisateur.
   * MOCK : Simule une sauvegarde réussie sans persistance réelle.
   */
  static async updatePreferences(preferences: PrivacyPreferences): Promise<PrivacyServiceResponse<PrivacyPreferences>> {
    await delay(800);

    return {
      isMock: true,
      status: 'completed',
      message: 'Préférences sauvegardées avec succès (Mock).',
      data: preferences
    };
  }

  /**
   * Demande un export des données personnelles.
   * MOCK : Ne génère aucun fichier réel, simule uniquement l'enregistrement de la demande.
   */
  static async requestDataExport(): Promise<PrivacyServiceResponse<DataExportRequest>> {
    await delay(1200);

    return {
      isMock: true,
      status: 'backend_not_connected',
      message: 'L\'infrastructure backend requise pour l\'export réel n\'est pas connectée.',
      data: {
        requestId: `req-export-${Date.now()}`,
        requestedAt: new Date().toISOString(),
        status: 'processing'
      }
    };
  }

  /**
   * Demande la suppression totale du compte et des données personnelles.
   * MOCK : Ne supprime aucune donnée réelle.
   */
  static async requestDataDeletion(): Promise<PrivacyServiceResponse<DataDeletionRequest>> {
    await delay(1500);

    // Calcul d'une date de suppression estimée (+30 jours en théorie RGPD)
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 30);

    return {
      isMock: true,
      status: 'backend_not_connected',
      message: 'La suppression réelle nécessite une connexion au service sécurisé. Cette démonstration n\'a pas supprimé votre compte.',
      data: {
        deletionId: `req-del-${Date.now()}`,
        requestedAt: new Date().toISOString(),
        estimatedDeletionDate: futureDate.toISOString()
      }
    };
  }
}
