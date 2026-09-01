/**
 * Routes du module Support Tickets (Ndara Phase 24)
 * Ces constantes préparent l'intégration au routeur global sans le modifier directement.
 */
export class SupportRoutes {
  static get SupportDashboardPath(): string {
    return '/support';
  }

  static get CreateTicketPath(): string {
    return '/support/create';
  }

  static getTicketDetailPath(ticketId: string = ':ticketId'): string {
    return `/support/${ticketId}`;
  }
}
