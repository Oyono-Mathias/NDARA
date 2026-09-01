export class CouponRoutes {
  static get CouponsValidation(): string { return '/coupons/validate'; }
  static get Promotions(): string { return '/promotions'; }
  static get AdminCouponManager(): string { return '/admin/coupons'; }
}

// Note: Ces routes devront être intégrées dans le routeur principal (App.tsx)
// lors d'une phase d'intégration ultérieure. Elles sont actuellement isolées
// pour respecter le périmètre de la phase 38.
