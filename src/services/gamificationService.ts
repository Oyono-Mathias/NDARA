export interface GamificationProfile {
  userId: string;
  xp: number;
  level: number;
  currentLevelXp: number;
  nextLevelXp: number;
  totalXp: number;
  completedCourses: number;
  completedLessons: number;
  completedQuizzes: number;
  streak: number;
  achievementsUnlocked: number;
  badgesUnlocked: number;
  isMock: boolean;
}

export type AchievementCategory = 'course' | 'quiz' | 'streak' | 'general';

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  category: AchievementCategory;
  progress: number;
  target: number;
  completed: boolean;
  completedAt?: string;
  rewardXp: number;
  isMock: boolean;
}

export interface LeaderboardEntry {
  rank: number;
  userId: string;
  displayName: string;
  avatar?: string;
  xp: number;
  level: number;
  badgesCount: number;
  isCurrentUser: boolean;
  isMock: boolean;
}

export type SkillNodeStatus = 'locked' | 'unlocked' | 'completed';

export interface SkillNode {
  id: string;
  title: string;
  description: string;
  category: string;
  requiredXp: number;
  status: SkillNodeStatus;
  progress: number;
  prerequisites: string[];
  badgeId?: string;
  isMock: boolean;
}

const mockProfile: GamificationProfile = {
  userId: 'u-123',
  xp: 1250,
  level: 4,
  currentLevelXp: 250,
  nextLevelXp: 1000,
  totalXp: 3250,
  completedCourses: 2,
  completedLessons: 14,
  completedQuizzes: 5,
  streak: 3,
  achievementsUnlocked: 8,
  badgesUnlocked: 2,
  isMock: true
};

const mockAchievements: Achievement[] = [
  {
    id: 'a-1',
    title: 'Boulimique de Savoir',
    description: 'Terminer 5 leçons en une seule journée.',
    icon: 'book',
    category: 'course',
    progress: 5,
    target: 5,
    completed: true,
    completedAt: new Date().toISOString(),
    rewardXp: 100,
    isMock: true
  },
  {
    id: 'a-2',
    title: 'Semaine Parfaite',
    description: 'Se connecter 7 jours consécutifs.',
    icon: 'flame',
    category: 'streak',
    progress: 3,
    target: 7,
    completed: false,
    rewardXp: 250,
    isMock: true
  },
  {
    id: 'a-3',
    title: 'Sans Faute',
    description: 'Obtenir 100% à un quiz de fin de module.',
    icon: 'check',
    category: 'quiz',
    progress: 0,
    target: 1,
    completed: false,
    rewardXp: 150,
    isMock: true
  }
];

const mockLeaderboard: LeaderboardEntry[] = [
  { rank: 1, userId: 'u-991', displayName: 'Alexandre D.', xp: 8400, level: 12, badgesCount: 15, isCurrentUser: false, isMock: true },
  { rank: 2, userId: 'u-992', displayName: 'Sarah M.', xp: 7200, level: 10, badgesCount: 12, isCurrentUser: false, isMock: true },
  { rank: 3, userId: 'u-123', displayName: 'Vous', xp: 3250, level: 4, badgesCount: 2, isCurrentUser: true, isMock: true },
  { rank: 4, userId: 'u-994', displayName: 'Kevin L.', xp: 2900, level: 4, badgesCount: 1, isCurrentUser: false, isMock: true },
  { rank: 5, userId: 'u-995', displayName: 'Julie B.', xp: 1100, level: 2, badgesCount: 0, isCurrentUser: false, isMock: true },
];

const mockSkillTree: SkillNode[] = [
  {
    id: 's-1',
    title: 'Fondations Web',
    description: 'Comprendre HTML, CSS et le fonctionnement d\'Internet.',
    category: 'frontend',
    requiredXp: 0,
    status: 'completed',
    progress: 100,
    prerequisites: [],
    badgeId: 'b-1',
    isMock: true
  },
  {
    id: 's-2',
    title: 'JavaScript Essentiel',
    description: 'Maîtriser les bases du langage JavaScript.',
    category: 'frontend',
    requiredXp: 500,
    status: 'unlocked',
    progress: 60,
    prerequisites: ['s-1'],
    isMock: true
  },
  {
    id: 's-3',
    title: 'Écosystème React',
    description: 'Créer des interfaces modernes avec React.',
    category: 'frontend',
    requiredXp: 1500,
    status: 'locked',
    progress: 0,
    prerequisites: ['s-2'],
    badgeId: 'b-3',
    isMock: true
  }
];

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export class GamificationService {
  static async getGamificationProfile(): Promise<GamificationProfile> {
    await delay(500);
    return { ...mockProfile };
  }

  static async getAchievements(): Promise<Achievement[]> {
    await delay(600);
    return [...mockAchievements];
  }

  static async getLeaderboard(): Promise<LeaderboardEntry[]> {
    await delay(800);
    return [...mockLeaderboard];
  }

  static async getSkillTree(): Promise<SkillNode[]> {
    await delay(700);
    return [...mockSkillTree];
  }
}
