export type RecommendationType = 'personalized' | 'similar' | 'category' | 'level' | 'progression' | 'popular';

export interface CourseRecommendation {
  courseId: string;
  title: string;
  description: string;
  thumbnail?: string;
  category: string;
  level: 'Débutant' | 'Intermédiaire' | 'Avancé';
  instructor: string;
  rating?: number;
  duration: number; // en minutes
  reason: string;
  score: number; // 0-100 (Pertinence interne)
  recommendationType: RecommendationType;
  isMock: boolean;
}

export interface RecommendationSection {
  id: string;
  title: string;
  description?: string;
  recommendations: CourseRecommendation[];
}

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const MOCK_COURSES: CourseRecommendation[] = [
  {
    courseId: 'rec-1',
    title: 'React Natif pour les développeurs Web',
    description: 'Transitionnez vos compétences web vers le mobile.',
    category: 'Développement Mobile',
    level: 'Intermédiaire',
    instructor: 'Ahmadou Diallo',
    rating: 4.8,
    duration: 320,
    reason: 'Basé sur vos cours récents',
    score: 95,
    recommendationType: 'personalized',
    isMock: true
  },
  {
    courseId: 'rec-2',
    title: 'Design UI/UX Mobile-First',
    description: 'Créez des interfaces accessibles et fluides.',
    category: 'Design',
    level: 'Débutant',
    instructor: 'Fatou Ndiaye',
    rating: 4.9,
    duration: 210,
    reason: 'Correspond à vos centres d\'intérêt',
    score: 88,
    recommendationType: 'category',
    isMock: true
  },
  {
    courseId: 'rec-3',
    title: 'Architecture Node.js & Firebase',
    description: 'Montez en compétence sur le backend.',
    category: 'Backend',
    level: 'Avancé',
    instructor: 'Samir Traoré',
    duration: 450,
    reason: 'Complète votre parcours',
    score: 75,
    recommendationType: 'progression',
    isMock: true
  },
  {
    courseId: 'rec-4',
    title: 'Introduction au TypeScript',
    description: 'Typage statique pour JavaScript.',
    category: 'Développement Web',
    level: 'Débutant',
    instructor: 'Léa Dubois',
    rating: 4.6,
    duration: 180,
    reason: 'Populaire auprès des apprenants',
    score: 92,
    recommendationType: 'popular',
    isMock: true
  },
  {
    courseId: 'rec-5',
    title: 'Masterclass: Animations CSS & Framer Motion',
    description: 'Donnez vie à vos composants React.',
    category: 'Développement Web',
    level: 'Intermédiaire',
    instructor: 'Ahmadou Diallo',
    rating: 4.7,
    duration: 260,
    reason: 'Adapté à votre niveau',
    score: 82,
    recommendationType: 'level',
    isMock: true
  }
];

export class RecommendationService {
  /**
   * Récupère le feed de recommandations personnalisé.
   */
  static async getPersonalizedFeed(): Promise<{ sections: RecommendationSection[], isMock: boolean }> {
    await delay(700);

    const sections: RecommendationSection[] = [
      {
        id: 'sec-progression',
        title: 'Continuer votre apprentissage',
        description: 'Cours suggérés pour compléter vos compétences actuelles.',
        recommendations: MOCK_COURSES.filter(c => c.recommendationType === 'progression' || c.recommendationType === 'personalized')
      },
      {
        id: 'sec-level',
        title: 'Pour votre niveau',
        description: 'Des contenus adaptés à votre maîtrise actuelle.',
        recommendations: MOCK_COURSES.filter(c => c.level === 'Intermédiaire' || c.recommendationType === 'level')
      },
      {
        id: 'sec-popular',
        title: 'Tendances Ndara',
        recommendations: MOCK_COURSES.filter(c => c.recommendationType === 'popular' || c.recommendationType === 'category')
      }
    ];

    return { sections, isMock: true };
  }

  /**
   * Récupère des cours similaires à un cours donné.
   */
  static async getSimilarCourses(courseId: string): Promise<{ recommendations: CourseRecommendation[], isMock: boolean }> {
    await delay(500);

    // Simulation : on retourne une partie aléatoire des cours mockés
    const similar = MOCK_COURSES.filter(c => c.courseId !== courseId).slice(0, 3).map(c => ({
      ...c,
      reason: 'Cours similaire à celui que vous consultez',
      recommendationType: 'similar' as RecommendationType,
      score: 80
    }));

    return { recommendations: similar, isMock: true };
  }
}
