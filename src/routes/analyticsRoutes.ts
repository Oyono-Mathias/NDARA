/**
 * Contrats des routes Analytics Ndara.
 * ZERO TRUST: L'identité et les permissions sont toujours résolues côté serveur.
 */
export class AnalyticsRoutes {
  static get DashboardPath(): string {
    return '/analytics';
  }

  static get UserAnalyticsPath(): string {
    return '/analytics/users';
  }

  static get CourseAnalyticsPath(): string {
    return '/analytics/courses';
  }

  static get RevenueAnalyticsPath(): string {
    return '/analytics/revenue';
  }

  static get EngagementAnalyticsPath(): string {
    return '/analytics/engagement';
  }
}
