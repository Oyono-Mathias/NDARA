export class AuditRoutes {
  static get List(): string { return '/admin/audit-logs'; }
  static get Detail(): string { return '/admin/audit-logs/:id'; }
}

// Note: Ces routes devront être intégrées dans le routeur principal (App.tsx)
// lors d'une phase d'intégration ultérieure. Elles sont actuellement isolées
// pour respecter le périmètre de la phase 34.
