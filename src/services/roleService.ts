export type Resource = 
  | 'wallet' | 'bank' | 'usdt' | 'airtime' | 'tv' | 'bills' | 'taxes' 
  | 'users' | 'subscriptions' | 'affiliation' | 'coupons' | 'reviews' 
  | 'mentoring' | 'courses' | 'audit' | 'roles' | 'permissions' | 'all';

export type Action = 'read' | 'create' | 'update' | 'delete' | 'approve' | 'manage' | 'execute' | '*';

export type RoleStatus = 'active' | 'inactive';

export interface Permission {
  id: string;
  resource: Resource;
  action: Action;
  description: string;
  sensitive: boolean;
}

export interface Role {
  id: string;
  name: string;
  description: string;
  permissions: string[];
  status: RoleStatus;
  isSystem?: boolean;
  createdAt: string;
  updatedAt: string;
}

// MOCK DATA
export const MOCK_PERMISSIONS: Permission[] = [
  { id: 'wallet.read', resource: 'wallet', action: 'read', description: 'Consulter le solde du portefeuille', sensitive: false },
  { id: 'wallet.manage', resource: 'wallet', action: 'manage', description: 'Gérer les fonds du portefeuille (Transactions)', sensitive: true },
  { id: 'users.read', resource: 'users', action: 'read', description: 'Consulter la liste des utilisateurs', sensitive: false },
  { id: 'users.manage', resource: 'users', action: 'manage', description: 'Modifier les statuts et informations des utilisateurs', sensitive: true },
  { id: 'roles.read', resource: 'roles', action: 'read', description: 'Consulter les rôles', sensitive: false },
  { id: 'roles.manage', resource: 'roles', action: 'manage', description: 'Modifier les attributions de rôles', sensitive: true },
  { id: 'audit.read', resource: 'audit', action: 'read', description: 'Consulter les journaux d\'audit', sensitive: true },
  { id: 'all.*', resource: 'all', action: '*', description: 'Accès total', sensitive: true },
];

export const MOCK_ROLES: Role[] = [
  {
    id: 'super_admin',
    name: 'Super Administrateur',
    description: 'Accès complet au système',
    permissions: ['all.*'],
    status: 'active',
    isSystem: true,
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
  },
  {
    id: 'support',
    name: 'Support Client',
    description: 'Assistance aux utilisateurs',
    permissions: ['users.read', 'wallet.read'],
    status: 'active',
    isSystem: false,
    createdAt: '2026-01-10T00:00:00Z',
    updatedAt: '2026-01-10T00:00:00Z',
  },
];

export class RoleService {
  public static readonly STATUS = {
    isMock: true,
    backendConnected: false,
  };

  private static delay(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  static async getPermissions(): Promise<Permission[]> {
    await this.delay(400);
    return [...MOCK_PERMISSIONS];
  }

  static async getRoles(): Promise<Role[]> {
    await this.delay(500);
    return [...MOCK_ROLES];
  }

  static async assignRoleToUser(_userId: string, roleId: string): Promise<{ success: boolean; message: string }> {
    await this.delay(800);
    if (this.STATUS.isMock) {
      return { success: true, message: `Le rôle ${roleId} a été attribué (MOCK).` };
    }
    throw new Error('Backend non connecté (BACKEND_UNAVAILABLE).');
  }

  static async updateRolePermissions(roleId: string, _permissions: string[]): Promise<{ success: boolean; message: string }> {
    await this.delay(1000);
    
    const role = MOCK_ROLES.find(r => r.id === roleId);
    if (role?.isSystem) {
      throw new Error('Impossible de modifier un rôle système.');
    }

    if (this.STATUS.isMock) {
      return { success: true, message: 'Permissions mises à jour avec succès (MOCK).' };
    }
    throw new Error('Backend non connecté (BACKEND_UNAVAILABLE).');
  }
}
