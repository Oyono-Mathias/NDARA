import { Resource, Action, MOCK_ROLES } from '../services/roleService';

export interface PermissionCheckResult {
  allowed: boolean;
  denied: boolean;
  reason?: 'UNAUTHORIZED' | 'FORBIDDEN' | 'BACKEND_UNAVAILABLE' | 'MOCK';
}

/**
 * WARNING: ZERO TRUST
 * 
 * Ce middleware est EXCLUSIVEMENT destiné au Frontend (UI).
 * Il sert à masquer des boutons ou désactiver des sections pour améliorer l'UX.
 * 
 * IL NE CONSTITUE EN AUCUN CAS UNE PROTECTION CONTRE UN ATTAQUANT.
 * 
 * Toute opération sensible déclenchée par une UI autorisée ici DOIT être revalidée
 * par Firebase Cloud Functions et les Security Rules (avec PIN si transactionnel).
 */
export class PermissionMiddleware {
  static can(
    userRoles: string[],
    resource: Resource,
    action: Action
  ): PermissionCheckResult {
    
    if (!userRoles || userRoles.length === 0) {
      return { allowed: false, denied: true, reason: 'UNAUTHORIZED' };
    }

    // Extraction et aplatissement des permissions liées aux rôles de l'utilisateur (Mock simulation)
    const userPermissionIds = new Set<string>();
    
    userRoles.forEach(roleId => {
      const role = MOCK_ROLES.find(r => r.id === roleId);
      if (role && role.status === 'active') {
        role.permissions.forEach(p => userPermissionIds.add(p));
      }
    });

    // Règle 1: Super Admin (all.*) a tous les droits
    if (userPermissionIds.has('all.*')) {
      return { allowed: true, denied: false, reason: 'MOCK' };
    }

    // Règle 2: Match exact 'resource.action'
    const exactMatch = `${resource}.${action}`;
    if (userPermissionIds.has(exactMatch)) {
      return { allowed: true, denied: false, reason: 'MOCK' };
    }

    // Règle 3: Wildcard par ressource 'resource.*' ou 'resource.manage'
    const wildcardMatch = `${resource}.*`;
    const manageMatch = `${resource}.manage`;
    if (userPermissionIds.has(wildcardMatch) || userPermissionIds.has(manageMatch)) {
      return { allowed: true, denied: false, reason: 'MOCK' };
    }

    // Refus par défaut
    return { allowed: false, denied: true, reason: 'FORBIDDEN' };
  }
}
