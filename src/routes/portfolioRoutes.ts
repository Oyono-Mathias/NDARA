export class PortfolioRoutes {
  static get MyPortfolioPath(): string {
    return '/portfolio';
  }

  static PublicPortfolioPath(userId: string = ':userId'): string {
    return `/portfolio/u/${userId}`;
  }
}
