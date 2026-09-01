export type ProjectStatus = 'draft' | 'published' | 'archived';
export type PortfolioVisibility = 'private' | 'public';

export interface Project {
  projectId: string;
  title: string;
  description: string;
  imageUrl?: string;
  technologies: string[];
  projectUrl?: string;
  repositoryUrl?: string;
  courseId?: string;
  courseTitle?: string;
  completedAt: string; // ISO date string
  status: ProjectStatus;
  isMock: boolean;
}

export interface Portfolio {
  portfolioId: string;
  userId: string;
  displayName: string;
  headline: string;
  bio: string;
  avatarUrl?: string;
  skills: string[];
  projects: Project[];
  visibility: PortfolioVisibility;
  updatedAt: string; // ISO date string
  isMock: boolean;
}

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const mockProjects: Project[] = [
  {
    projectId: 'proj-1',
    title: 'Plateforme E-learning Ndara',
    description: 'Une application complète avec gestion de portfolio, certificats et parcours d\'apprentissage.',
    technologies: ['React', 'TypeScript', 'Tailwind CSS', 'Vite'],
    projectUrl: 'https://ndara.example.com',
    repositoryUrl: 'https://github.com/example/ndara',
    courseId: 'course-react-advanced',
    courseTitle: 'Masterclass: React avancé',
    completedAt: new Date('2024-02-15T10:00:00Z').toISOString(),
    status: 'published',
    isMock: true
  },
  {
    projectId: 'proj-2',
    title: 'Générateur de Certificats PDF',
    description: 'Micro-service pour la génération sécurisée de certificats.',
    technologies: ['Node.js', 'PDFKit', 'Firebase'],
    repositoryUrl: 'https://github.com/example/cert-gen',
    completedAt: new Date('2023-11-20T14:30:00Z').toISOString(),
    status: 'published',
    isMock: true
  },
  {
    projectId: 'proj-3',
    title: 'Dashboard Analytique',
    description: 'Tableau de bord de suivi des étudiants, actuellement en développement.',
    technologies: ['Vue.js', 'D3.js'],
    completedAt: new Date().toISOString(),
    status: 'draft',
    isMock: true
  }
];

let mockPortfolio: Portfolio = {
  portfolioId: 'port-123',
  userId: 'user-mock-1',
  displayName: 'Alice Ndara',
  headline: 'Développeuse Frontend Passionnée | React & TypeScript',
  bio: 'Je suis une développeuse frontend spécialisée dans la création d\'interfaces utilisateur accessibles et performantes. Toujours en quête d\'apprentissage, j\'aime résoudre des problèmes complexes avec des solutions élégantes.',
  avatarUrl: undefined,
  skills: ['JavaScript', 'TypeScript', 'React', 'Tailwind CSS', 'Git', 'Accessibilité (a11y)'],
  projects: mockProjects,
  visibility: 'private', // starts private for testing
  updatedAt: new Date().toISOString(),
  isMock: true
};

export class PortfolioService {
  /**
   * Récupère le portfolio de l'étudiant connecté.
   */
  static async getMyPortfolio(): Promise<{ data: Portfolio, isMock: boolean }> {
    await delay(600);
    return { data: { ...mockPortfolio }, isMock: true };
  }

  /**
   * Récupère un portfolio public via l'ID de l'utilisateur.
   */
  static async getPublicPortfolio(userId: string): Promise<{ data: Portfolio, isMock: boolean }> {
    await delay(800);
    
    // Simulate user not found
    if (userId !== mockPortfolio.userId && userId !== 'user-mock-1') {
      throw new Error("PORTFOLIO_NOT_FOUND");
    }

    // Critical security check : backend refuses to return data if not public
    if (mockPortfolio.visibility !== 'public') {
      throw new Error("PORTFOLIO_NOT_PUBLIC");
    }

    // Filter projects to only return published ones in public view
    const publicData = {
      ...mockPortfolio,
      projects: mockPortfolio.projects.filter(p => p.status === 'published')
    };

    return { data: publicData, isMock: true };
  }

  /**
   * Modifie la visibilité du portfolio.
   */
  static async updateVisibility(newVisibility: PortfolioVisibility): Promise<{ success: boolean, message: string, data: Portfolio, isMock: boolean }> {
    await delay(1000);
    
    // BACKEND_NOT_CONNECTED simulation, but we apply to mock state for UI testing
    mockPortfolio.visibility = newVisibility;
    mockPortfolio.updatedAt = new Date().toISOString();
    
    return { 
      success: true, 
      message: "Visibilité mise à jour (Mock). BACKEND_NOT_CONNECTED.", 
      data: { ...mockPortfolio },
      isMock: true 
    };
  }
}
