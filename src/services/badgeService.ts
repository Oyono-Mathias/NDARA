export type BadgeRarity = 'common' | 'rare' | 'epic' | 'legendary';
export type BadgeCategory = 'learning' | 'social' | 'community' | 'special';

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: BadgeCategory;
  rarity: BadgeRarity;
  requirement: string;
  progress: number;
  target: number;
  unlocked: boolean;
  unlockedAt?: string;
  isMock: boolean;
}

const mockBadges: Badge[] = [
  {
    id: 'b-1',
    name: 'Premier Pas',
    description: 'Compléter votre première leçon sur la plateforme.',
    icon: 'star',
    category: 'learning',
    rarity: 'common',
    requirement: '1 leçon complétée',
    progress: 1,
    target: 1,
    unlocked: true,
    unlockedAt: new Date(Date.now() - 86400000 * 10).toISOString(),
    isMock: true
  },
  {
    id: 'b-2',
    name: 'Apprenti Assidu',
    description: 'Se connecter 3 jours consécutifs.',
    icon: 'zap',
    category: 'social',
    rarity: 'common',
    requirement: '3 jours de suite',
    progress: 3,
    target: 3,
    unlocked: true,
    unlockedAt: new Date(Date.now() - 86400000 * 5).toISOString(),
    isMock: true
  },
  {
    id: 'b-3',
    name: 'Expert React',
    description: 'Compléter tous les modules du parcours React.',
    icon: 'award',
    category: 'learning',
    rarity: 'rare',
    requirement: 'Parcours React complété',
    progress: 4,
    target: 5,
    unlocked: false,
    isMock: true
  },
  {
    id: 'b-4',
    name: 'Protecteur du Code',
    description: 'Signaler 5 bugs pertinents sur la plateforme.',
    icon: 'shield',
    category: 'community',
    rarity: 'epic',
    requirement: '5 bugs signalés',
    progress: 1,
    target: 5,
    unlocked: false,
    isMock: true
  },
  {
    id: 'b-5',
    name: 'Maître Absolu',
    description: 'Atteindre le niveau 50 et obtenir 20 certificats.',
    icon: 'target',
    category: 'special',
    rarity: 'legendary',
    requirement: 'Niveau 50 + 20 certificats',
    progress: 10,
    target: 100,
    unlocked: false,
    isMock: true
  }
];

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export class BadgeService {
  static async getAllBadges(): Promise<Badge[]> {
    await delay(500);
    return [...mockBadges];
  }

  static async getUnlockedBadges(): Promise<Badge[]> {
    await delay(400);
    return mockBadges.filter(b => b.unlocked);
  }

  static async getLockedBadges(): Promise<Badge[]> {
    await delay(400);
    return mockBadges.filter(b => !b.unlocked);
  }
}
