/**
 * Routes du module Gamification (Ndara Phase 26)
 * Ces constantes préparent l'intégration au routeur global.
 */
export class GamificationRoutes {
  static get BadgesPath(): string {
    return '/gamification/badges';
  }

  static get AchievementsPath(): string {
    return '/gamification/achievements';
  }

  static get LeaderboardPath(): string {
    return '/gamification/leaderboard';
  }

  static get SkillTreePath(): string {
    return '/gamification/skills';
  }
}
