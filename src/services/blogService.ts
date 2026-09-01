export type BlogPostStatus = 'draft' | 'published' | 'archived';

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  coverImage?: string;
  authorId: string;
  authorName: string;
  category: string;
  tags: string[];
  status: BlogPostStatus;
  publishedAt?: string;
  updatedAt: string;
  readingTime: number;
  featured: boolean;
  isMock: boolean; // Identifiant explicite de mock
}

export interface BlogListResponse {
  posts: BlogPost[];
  total: number;
  isMock: boolean;
}

export type CreateBlogPostPayload = Omit<BlogPost, 'id' | 'authorId' | 'authorName' | 'publishedAt' | 'updatedAt' | 'isMock'>;

// Données mockées initiales
let mockPosts: BlogPost[] = [
  {
    id: 'p-1',
    title: 'Comment structurer une application React en 2026',
    slug: 'structurer-app-react-2026',
    excerpt: 'Découvrez les meilleures pratiques pour architecturer vos applications React modernes avec TypeScript et Tailwind CSS.',
    content: 'La structuration d\'une application React est cruciale pour sa maintenabilité.\n\nDans cet article, nous abordons la séparation des responsabilités. Le pattern View-Hook-Service-Controller s\'impose comme un standard pour les applications complexes.\n\nN\'oubliez pas de typer vos props et de ne jamais faire confiance au frontend pour la sécurité.',
    category: 'Développement',
    tags: ['React', 'TypeScript', 'Architecture'],
    status: 'published',
    publishedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    updatedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    readingTime: 5,
    featured: true,
    authorId: 'a-1',
    authorName: 'Ndara Team',
    isMock: true
  },
  {
    id: 'p-2',
    title: 'L\'importance de l\'accessibilité web (a11y)',
    slug: 'importance-accessibilite-web',
    excerpt: 'Pourquoi concevoir des plateformes accessibles n\'est plus une option mais une nécessité éthique et légale.',
    content: 'L\'accessibilité web consiste à rendre le web utilisable par tous, y compris les personnes en situation de handicap.\n\nUtilisez des contrastes suffisants, des balises sémantiques et des attributs aria-label pour les icônes. Pensez également à la navigation au clavier.',
    coverImage: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&q=80&w=800',
    category: 'Design',
    tags: ['a11y', 'UX', 'Web'],
    status: 'published',
    publishedAt: new Date(Date.now() - 86400000 * 5).toISOString(),
    updatedAt: new Date(Date.now() - 86400000 * 5).toISOString(),
    readingTime: 4,
    featured: false,
    authorId: 'a-1',
    authorName: 'Ndara Team',
    isMock: true
  },
  {
    id: 'p-3',
    title: 'Nouvelle mise à jour de la plateforme (Brouillon)',
    slug: 'nouvelle-mise-a-jour-plateforme',
    excerpt: 'Découvrez les nouveautés de la version 2.0 de Ndara.',
    content: 'Nous avons introduit un nouveau module Blog & Actualités...',
    category: 'Annonces',
    tags: ['Mise à jour', 'Ndara'],
    status: 'draft',
    updatedAt: new Date(Date.now() - 86400000 * 1).toISOString(),
    readingTime: 2,
    featured: false,
    authorId: 'a-1',
    authorName: 'Ndara Team',
    isMock: true
  }
];

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export class BlogService {
  /**
   * Récupère tous les articles publiés (Blog Public)
   */
  static async getPublishedPosts(category?: string, search?: string): Promise<BlogListResponse> {
    await delay(600);
    
    let filtered = mockPosts.filter(p => p.status === 'published');
    
    if (category && category !== 'all') {
      filtered = filtered.filter(p => p.category === category);
    }
    
    if (search) {
      const q = search.toLowerCase();
      filtered = filtered.filter(p => 
        p.title.toLowerCase().includes(q) || 
        p.excerpt.toLowerCase().includes(q) ||
        p.tags.some(t => t.toLowerCase().includes(q))
      );
    }
    
    return {
      posts: filtered.sort((a, b) => new Date(b.publishedAt || 0).getTime() - new Date(a.publishedAt || 0).getTime()),
      total: filtered.length,
      isMock: true
    };
  }

  /**
   * Récupère un article spécifique par son slug
   */
  static async getPostBySlug(slug: string): Promise<{ post: BlogPost, isMock: boolean }> {
    await delay(500);
    const post = mockPosts.find(p => p.slug === slug && p.status === 'published');
    if (!post) throw new Error("Article introuvable ou non publié.");
    return { post, isMock: true };
  }

  /**
   * Récupère TOUS les articles pour l'interface Admin
   */
  static async getAdminPosts(): Promise<BlogListResponse> {
    await delay(700);
    return {
      posts: [...mockPosts].sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()),
      total: mockPosts.length,
      isMock: true
    };
  }

  /**
   * Crée un nouvel article (Intention pour le futur backend)
   */
  static async createPost(payload: CreateBlogPostPayload): Promise<BlogPost> {
    await delay(800);
    
    // Validation basique simulée (le backend fera une vraie validation)
    if (!payload.title || !payload.slug || !payload.content) {
      throw new Error("Champs obligatoires manquants.");
    }
    
    const newPost: BlogPost = {
      ...payload,
      id: `p-${Date.now()}`,
      authorId: 'a-current-user', // Mock session
      authorName: 'Admin Actuel',
      publishedAt: payload.status === 'published' ? new Date().toISOString() : undefined,
      updatedAt: new Date().toISOString(),
      isMock: true
    };
    
    mockPosts.push(newPost);
    return newPost;
  }

  /**
   * Met à jour un article existant
   */
  static async updatePost(id: string, payload: Partial<CreateBlogPostPayload>): Promise<BlogPost> {
    await delay(700);
    const index = mockPosts.findIndex(p => p.id === id);
    if (index === -1) throw new Error("Article introuvable.");
    
    const oldStatus = mockPosts[index].status;
    const newStatus = payload.status || oldStatus;
    
    let publishedAt = mockPosts[index].publishedAt;
    if (oldStatus !== 'published' && newStatus === 'published') {
      publishedAt = new Date().toISOString();
    }
    
    const updatedPost: BlogPost = {
      ...mockPosts[index],
      ...payload,
      publishedAt,
      updatedAt: new Date().toISOString()
    };
    
    mockPosts[index] = updatedPost;
    return updatedPost;
  }

  /**
   * Supprime un article
   */
  static async deletePost(id: string): Promise<boolean> {
    await delay(600);
    const initialLength = mockPosts.length;
    mockPosts = mockPosts.filter(p => p.id !== id);
    if (mockPosts.length === initialLength) throw new Error("Article introuvable.");
    return true;
  }
}
