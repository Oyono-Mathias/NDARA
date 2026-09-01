export class LearningPathRoutes {
  static get PathsList(): string {
    return '/learning-paths';
  }

  static PathDetail(pathId: string = ':pathId'): string {
    return `/learning-paths/${pathId}`;
  }
}
