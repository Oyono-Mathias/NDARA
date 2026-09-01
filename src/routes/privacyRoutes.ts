export class PrivacyRoutes {
  static get Settings(): string { return '/privacy/settings'; }
  static get Export(): string { return '/privacy/export'; }
  static get Deletion(): string { return '/privacy/deletion'; }
}

// Note: Ces routes devront être intégrées dans le routeur principal (ex: react-router)
// lors d'une phase d'intégration ultérieure.
