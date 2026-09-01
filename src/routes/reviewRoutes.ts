export class ReviewRoutes {
  static get CourseReviews(): string { return '/courses/:courseId/reviews'; }
}

// Note: Ces routes devront être intégrées dans le routeur principal (App.tsx)
// lors d'une phase d'intégration ultérieure. Elles sont actuellement isolées
// pour respecter le périmètre de la phase 37.
