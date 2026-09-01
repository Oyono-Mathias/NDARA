export class AffiliationRoutes {
  static get Dashboard(): string { return '/affiliation'; }
  static get Links(): string { return '/affiliation/links'; }
  static get History(): string { return '/affiliation/history'; }
}

// Note: Ces routes devront être intégrées dans le routeur principal (App.tsx)
// lors d'une phase d'intégration ultérieure. Elles sont actuellement isolées
// pour respecter le périmètre de la phase 35.
