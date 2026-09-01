/**
 * Service de Sauvegarde (Backup)
 * 
 * NOTE DE SÉCURITÉ :
 * La politique "Zero Trust" de Ndara Afrique interdit formellement au client 
 * d'exporter les données de Firestore de manière brute pour des raisons de sécurité.
 * Ce service agit comme une abstraction appelant les futures Cloud Functions dédiées.
 */

export interface BackupStatus {
  id: string;
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  createdAt: string;
  url?: string;
}

export class BackupService {
  /**
   * Demande la création d'une nouvelle sauvegarde côté serveur.
   */
  static async requestBackup(): Promise<string> {
    // Cette fonction sera branchée sur une Cloud Function (ex: HTTPS Callable)
    // accessible uniquement aux administrateurs.
    console.info("Demande de sauvegarde envoyée au backend (Simulation Phase 3).");
    return "backup_req_" + Date.now();
  }

  /**
   * Vérifie le statut d'une sauvegarde demandée.
   */
  static async getBackupStatus(backupId: string): Promise<BackupStatus> {
    return {
      id: backupId,
      status: 'completed',
      createdAt: new Date().toISOString(),
    };
  }
}
