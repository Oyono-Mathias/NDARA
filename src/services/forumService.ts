export type ForumCategory = 'general' | 'course' | 'support' | 'technical' | 'announcement';
export type ForumTopicStatus = 'open' | 'locked' | 'archived';

export interface ForumAuthor {
  id: string;
  name: string;
  avatar?: string;
}

export interface ForumPostType {
  id: string;
  topicId: string;
  author: ForumAuthor;
  content: string;
  createdAt: string;
  replyToId?: string;
}

export interface ForumTopic {
  id: string;
  title: string;
  category: ForumCategory;
  status: ForumTopicStatus;
  pinned: boolean;
  author: ForumAuthor;
  repliesCount: number;
  lastActivity: string;
  createdAt: string;
  isMock: boolean;
}

export interface ForumTopicDetail extends ForumTopic {
  posts: ForumPostType[];
}

export interface CreatePostPayload {
  topicId: string;
  content: string;
}

// Mocks
const mockAuthor1: ForumAuthor = { id: 'u-1', name: 'Alice Ndara', avatar: 'https://i.pravatar.cc/150?u=a' };
const mockAuthor2: ForumAuthor = { id: 'u-2', name: 'Bob Étudiant' };
const mockAuthor3: ForumAuthor = { id: 'u-3', name: 'Charlie Modérateur' };

let mockTopics: ForumTopicDetail[] = [
  {
    id: 't-1',
    title: 'Bienvenue sur le forum Ndara !',
    category: 'announcement',
    status: 'locked',
    pinned: true,
    author: mockAuthor3,
    repliesCount: 1,
    lastActivity: new Date(Date.now() - 86400000 * 5).toISOString(),
    createdAt: new Date(Date.now() - 86400000 * 10).toISOString(),
    isMock: true,
    posts: [
      {
        id: 'p-1',
        topicId: 't-1',
        author: mockAuthor3,
        content: 'Bienvenue à tous sur notre nouvel espace de discussion. Merci de respecter les règles de courtoisie.',
        createdAt: new Date(Date.now() - 86400000 * 10).toISOString()
      },
      {
        id: 'p-2',
        topicId: 't-1',
        author: mockAuthor1,
        content: 'Merci pour l\'accueil !',
        createdAt: new Date(Date.now() - 86400000 * 5).toISOString()
      }
    ]
  },
  {
    id: 't-2',
    title: 'Entraide : Module React Hooks',
    category: 'course',
    status: 'open',
    pinned: false,
    author: mockAuthor2,
    repliesCount: 0,
    lastActivity: new Date(Date.now() - 3600000 * 2).toISOString(),
    createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
    isMock: true,
    posts: [
      {
        id: 'p-3',
        topicId: 't-2',
        author: mockAuthor2,
        content: 'Bonjour, je ne comprends pas très bien comment fonctionne le hook useEffect avec un tableau de dépendances vide. Quelqu\'un peut m\'expliquer ?',
        createdAt: new Date(Date.now() - 3600000 * 2).toISOString()
      }
    ]
  },
  {
    id: 't-3',
    title: 'Problème de connexion vidéo',
    category: 'technical',
    status: 'open',
    pinned: false,
    author: mockAuthor1,
    repliesCount: 2,
    lastActivity: new Date(Date.now() - 1800000).toISOString(),
    createdAt: new Date(Date.now() - 86400000 * 1).toISOString(),
    isMock: true,
    posts: [
      {
        id: 'p-4',
        topicId: 't-3',
        author: mockAuthor1,
        content: 'Depuis la dernière mise à jour, les vidéos saccadent sur Chrome. Suis-je le seul ?',
        createdAt: new Date(Date.now() - 86400000 * 1).toISOString()
      },
      {
        id: 'p-5',
        topicId: 't-3',
        author: mockAuthor2,
        content: 'Non, j\'ai le même problème. Essaie de vider le cache.',
        createdAt: new Date(Date.now() - 3600000 * 5).toISOString()
      },
      {
        id: 'p-6',
        topicId: 't-3',
        author: mockAuthor3,
        content: 'L\'équipe technique est sur le coup. Un correctif arrive ce soir.',
        createdAt: new Date(Date.now() - 1800000).toISOString(),
        replyToId: 'p-4'
      }
    ]
  }
];

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export class ForumService {
  /**
   * Récupère la liste des topics.
   */
  static async getTopics(category?: ForumCategory, search?: string): Promise<{ topics: ForumTopic[], isMock: boolean }> {
    await delay(600);
    
    let filtered = mockTopics.map(({ posts, ...topicData }) => topicData);

    if (category && category !== 'general' as any) { // using general as 'all' for simplicity in UI, if needed
      filtered = filtered.filter(t => t.category === category);
    }

    if (search) {
      const q = search.toLowerCase();
      filtered = filtered.filter(t => t.title.toLowerCase().includes(q));
    }

    // Sort: pinned first, then by last activity
    filtered.sort((a, b) => {
      if (a.pinned && !b.pinned) return -1;
      if (!a.pinned && b.pinned) return 1;
      return new Date(b.lastActivity).getTime() - new Date(a.lastActivity).getTime();
    });

    return { topics: filtered, isMock: true };
  }

  /**
   * Récupère le détail d'un topic avec ses posts.
   */
  static async getTopicById(topicId: string): Promise<{ topic: ForumTopicDetail, isMock: boolean }> {
    await delay(500);
    const topic = mockTopics.find(t => t.id === topicId);
    if (!topic) {
      throw new Error("TOPIC_NOT_FOUND");
    }
    return { topic, isMock: true };
  }

  /**
   * Ajoute un post à un topic existant.
   */
  static async createPost(payload: CreatePostPayload): Promise<ForumPostType> {
    await delay(800);
    
    const topicIndex = mockTopics.findIndex(t => t.id === payload.topicId);
    if (topicIndex === -1) {
      throw new Error("TOPIC_NOT_FOUND");
    }

    if (mockTopics[topicIndex].status === 'locked') {
      throw new Error("TOPIC_LOCKED");
    }

    if (!payload.content || payload.content.trim().length === 0) {
      throw new Error("VALIDATION_ERROR: Le contenu ne peut pas être vide.");
    }

    const newPost: ForumPostType = {
      id: `p-${Date.now()}`,
      topicId: payload.topicId,
      author: { id: 'u-me', name: 'Moi (Testeur)' }, // Mock current user
      content: payload.content.trim(),
      createdAt: new Date().toISOString()
    };

    mockTopics[topicIndex].posts.push(newPost);
    mockTopics[topicIndex].repliesCount += 1;
    mockTopics[topicIndex].lastActivity = newPost.createdAt;

    return newPost;
  }
}
