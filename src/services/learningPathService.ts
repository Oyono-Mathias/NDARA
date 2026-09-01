export type PathStatus = 'locked' | 'available' | 'in_progress' | 'completed';
export type CourseStatus = 'locked' | 'available' | 'completed';

export interface PathCourse {
  courseId: string;
  title: string;
  description: string;
  durationMinutes: number;
  status: CourseStatus;
  order: number;
}

export interface LearningPath {
  pathId: string;
  title: string;
  description: string;
  level: 'Débutant' | 'Intermédiaire' | 'Avancé';
  totalCourses: number;
  completedCourses: number;
  progressPercentage: number;
  status: PathStatus;
  courses?: PathCourse[];
  isMock: boolean;
}

const mockPaths: LearningPath[] = [
  {
    pathId: 'path-web-dev',
    title: 'Développeur Web Frontend',
    description: 'Maîtrisez les bases du web et devenez un développeur frontend accompli avec React et TypeScript.',
    level: 'Débutant',
    totalCourses: 3,
    completedCourses: 1,
    progressPercentage: 33,
    status: 'in_progress',
    isMock: true,
    courses: [
      { courseId: 'course-html-css', title: 'Fondamentaux HTML & CSS', description: 'Les bases de la création web.', durationMinutes: 120, status: 'completed', order: 1 },
      { courseId: 'course-js-basics', title: 'JavaScript Moderne', description: 'Programmation interactive pour le web.', durationMinutes: 240, status: 'available', order: 2 },
      { courseId: 'course-react', title: 'React & Tailwind', description: 'Création d\'interfaces dynamiques.', durationMinutes: 300, status: 'locked', order: 3 },
    ]
  },
  {
    pathId: 'path-data',
    title: 'Analyste de Données',
    description: 'Découvrez comment extraire de la valeur des données.',
    level: 'Intermédiaire',
    totalCourses: 4,
    completedCourses: 0,
    progressPercentage: 0,
    status: 'available',
    isMock: true,
    courses: [
      { courseId: 'course-sql', title: 'SQL pour l\'analyse', description: 'Requêtes de bases de données.', durationMinutes: 180, status: 'available', order: 1 },
      { courseId: 'course-python-data', title: 'Python & Pandas', description: 'Manipulation de données.', durationMinutes: 240, status: 'locked', order: 2 },
      { courseId: 'course-dataviz', title: 'Data Visualization', description: 'Création de tableaux de bord.', durationMinutes: 150, status: 'locked', order: 3 },
      { courseId: 'course-ml-basics', title: 'Intro Machine Learning', description: 'Concepts de base.', durationMinutes: 200, status: 'locked', order: 4 },
    ]
  },
  {
    pathId: 'path-completed',
    title: 'Initiation au Numérique',
    description: 'Parcours d\'initiation complété avec succès.',
    level: 'Débutant',
    totalCourses: 2,
    completedCourses: 2,
    progressPercentage: 100,
    status: 'completed',
    isMock: true,
    courses: [
      { courseId: 'course-computer-101', title: 'L\'ordinateur de A à Z', description: 'Utilisation basique.', durationMinutes: 60, status: 'completed', order: 1 },
      { courseId: 'course-internet-safety', title: 'Sécurité sur Internet', description: 'Naviguer en toute sécurité.', durationMinutes: 90, status: 'completed', order: 2 },
    ]
  }
];

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export class LearningPathService {
  /**
   * Récupère la liste des parcours pour un utilisateur.
   */
  static async getLearningPaths(): Promise<{ data: LearningPath[], isMock: boolean }> {
    await delay(600);
    // Retourne la liste sans le détail complet des cours pour alléger le payload
    const pathsList = mockPaths.map(({ courses, ...path }) => path);
    return { data: pathsList as LearningPath[], isMock: true };
  }

  /**
   * Récupère le détail complet d'un parcours.
   */
  static async getPathDetail(pathId: string): Promise<{ data: LearningPath, isMock: boolean }> {
    await delay(800);
    const path = mockPaths.find(p => p.pathId === pathId);
    if (!path) {
      throw new Error('PATH_NOT_FOUND');
    }
    return { data: { ...path }, isMock: true };
  }
}
