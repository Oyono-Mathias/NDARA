export class ScheduleRoutes {
  static get SchedulePath(): string {
    return '/schedule';
  }

  static LiveSessionPath(sessionId: string = ':sessionId'): string {
    return `/schedule/live/${sessionId}`;
  }
}
