import { BaseDBService } from '../services/db/baseService';
import { AuditLog } from '../types/models';

const auditService = new BaseDBService<AuditLog>('audit_logs');

/**
 * Enregistre techniquement une tentative de connexion.
 * 
 * Note : Le suivi est asynchrone pour ne jamais bloquer le flux principal.
 * L'écriture depuis le client peut être soumise à des restrictions 
 * (ex. `firestore.rules`), auquel cas cette fonction délèguera à 
 * une Cloud Function dans une phase ultérieure.
 */
export const trackLoginEvent = async (
  userId: string, 
  status: 'success' | 'failed', 
  ipAddress?: string
): Promise<void> => {
  try {
    const logData = {
      action: status === 'success' ? 'LOGIN_SUCCESS' : 'LOGIN_FAILED',
      userId,
      ipAddress: ipAddress || 'unknown',
      timestamp: new Date().toISOString()
    };
    
    await auditService.create(logData as any);
  } catch (error) {
    // Évite d'exposer ou de bloquer quoi que ce soit en cas d'erreur de tracking
    console.error('Erreur technique lors du suivi de connexion (ignorable):', error);
  }
};
