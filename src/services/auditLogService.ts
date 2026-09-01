export type AuditSeverity = 'info' | 'warning' | 'critical';
export type AuditStatus = 'success' | 'failed' | 'denied';
export type AuditAction = 
  | 'login' | 'logout' | 'login_failed' 
  | 'password_changed' | 'profile_updated' 
  | 'role_changed' | 'permission_changed' 
  | 'resource_created' | 'resource_updated' | 'resource_deleted' 
  | 'access_denied' | 'security_event' | 'system_event';

export interface AuditActor {
  id: string;
  name?: string;
  role?: string;
}

export interface AuditResource {
  type: string;
  id: string;
  name?: string;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  actor: AuditActor;
  action: AuditAction;
  severity: AuditSeverity;
  status: AuditStatus;
  resource?: AuditResource;
  ipAddress?: string;
  userAgent?: string;
  source: 'web' | 'mobile' | 'system';
  metadata?: Record<string, any>;
  isMock: boolean;
}

export interface AuditLogResponse {
  logs: AuditLog[];
  total: number;
  isMock: boolean;
}

export interface AuditFilters {
  severity?: AuditSeverity | 'all';
  action?: AuditAction | 'all';
  status?: AuditStatus | 'all';
  search?: string;
}

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const MOCK_LOGS: AuditLog[] = [
  {
    id: 'log-101',
    timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
    actor: { id: 'usr-1', name: 'Ahmadou Diallo', role: 'admin' },
    action: 'role_changed',
    severity: 'warning',
    status: 'success',
    resource: { type: 'user', id: 'usr-42', name: 'Fatou Ndiaye' },
    source: 'web',
    metadata: { oldRole: 'student', newRole: 'instructor' },
    isMock: true
  },
  {
    id: 'log-102',
    timestamp: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
    actor: { id: 'usr-unknown', name: 'Unknown IP', role: 'guest' },
    action: 'login_failed',
    severity: 'critical',
    status: 'failed',
    source: 'web',
    metadata: { reason: 'invalid_credentials', attempts: 5 },
    isMock: true
  },
  {
    id: 'log-103',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
    actor: { id: 'usr-2', name: 'Kossi Mensah', role: 'instructor' },
    action: 'resource_deleted',
    severity: 'info',
    status: 'success',
    resource: { type: 'course', id: 'crs-99', name: 'Draft Course 1' },
    source: 'web',
    isMock: true
  },
  {
    id: 'log-104',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
    actor: { id: 'usr-3', name: 'Aminata Sy', role: 'student' },
    action: 'access_denied',
    severity: 'warning',
    status: 'denied',
    resource: { type: 'admin_panel', id: 'admin-dashboard' },
    source: 'mobile',
    metadata: { requiredRole: 'admin', userRole: 'student' },
    isMock: true
  },
  {
    id: 'log-105',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    actor: { id: 'sys-0', name: 'System Scheduler', role: 'system' },
    action: 'system_event',
    severity: 'info',
    status: 'success',
    source: 'system',
    metadata: { job: 'daily_backup', result: 'completed' },
    isMock: true
  }
];

/**
 * Service d'Audit Logs.
 * Gère la communication avec l'infrastructure de journalisation.
 */
export class AuditLogService {
  /**
   * Récupère la liste des logs avec filtres.
   */
  static async getLogs(filters?: AuditFilters): Promise<AuditLogResponse> {
    await delay(800); // Simule la latence réseau

    let filtered = [...MOCK_LOGS];

    if (filters) {
      if (filters.severity && filters.severity !== 'all') {
        filtered = filtered.filter(l => l.severity === filters.severity);
      }
      if (filters.action && filters.action !== 'all') {
        filtered = filtered.filter(l => l.action === filters.action);
      }
      if (filters.status && filters.status !== 'all') {
        filtered = filtered.filter(l => l.status === filters.status);
      }
      if (filters.search) {
        const query = filters.search.toLowerCase();
        filtered = filtered.filter(l => 
          l.actor.name?.toLowerCase().includes(query) ||
          l.actor.id.toLowerCase().includes(query) ||
          l.resource?.name?.toLowerCase().includes(query) ||
          l.action.toLowerCase().includes(query)
        );
      }
    }

    // Tri par ordre antéchronologique
    filtered.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    return {
      logs: filtered,
      total: filtered.length,
      isMock: true
    };
  }

  /**
   * Simule l'enregistrement d'un log.
   * L'architecture cible (Firebase) imposera un append-only via Cloud Functions.
   */
  static async logEvent(event: Omit<AuditLog, 'id' | 'timestamp' | 'isMock'>): Promise<{ success: boolean; isMock: boolean }> {
    await delay(300);
    console.log('[AUDIT MOCK] Événement enregistré:', event);
    return { success: true, isMock: true };
  }
}
