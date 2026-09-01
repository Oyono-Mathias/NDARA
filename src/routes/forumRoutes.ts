export class ForumRoutes {
  static get ForumListPath(): string {
    return '/forum';
  }

  static ForumTopicPath(topicId: string = ':topicId'): string {
    return `/forum/${topicId}`;
  }

  static ForumNewTopicPath(): string {
    return '/forum/new';
  }
}
