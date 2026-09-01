export type ReviewStatus = 'pending' | 'published' | 'rejected';
export type RatingValue = 1 | 2 | 3 | 4 | 5;

export interface Review {
  id: string;
  courseId: string;
  userId: string;
  userDisplayName: string;
  rating: RatingValue;
  comment: string;
  status: ReviewStatus;
  createdAt: string;
  updatedAt: string;
  isVerifiedLearner: boolean;
  isMock: boolean;
}

export interface RatingDistribution {
  1: number;
  2: number;
  3: number;
  4: number;
  5: number;
}

export interface CourseRatingSummary {
  courseId: string;
  averageRating: number;
  totalReviews: number;
  distribution: RatingDistribution;
  isMock: boolean;
}

export interface SubmitReviewPayload {
  rating: RatingValue;
  comment: string;
}

export interface ReviewResponse<T> {
  data: T;
  isMock: boolean;
}

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const MOCK_REVIEWS: Review[] = [
  {
    id: 'rev-1',
    courseId: 'course-123',
    userId: 'usr-001',
    userDisplayName: 'Aminata Diallo',
    rating: 5,
    comment: 'Un cours exceptionnel qui m\'a permis de comprendre les fondamentaux rapidement. Très clair et bien structuré.',
    status: 'published',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(),
    isVerifiedLearner: true,
    isMock: true
  },
  {
    id: 'rev-2',
    courseId: 'course-123',
    userId: 'usr-002',
    userDisplayName: 'Kossi M.',
    rating: 4,
    comment: 'Très bon contenu, mais j\'aurais aimé un peu plus d\'exercices pratiques à la fin du module 3.',
    status: 'published',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString(),
    isVerifiedLearner: true,
    isMock: true
  },
  {
    id: 'rev-3',
    courseId: 'course-123',
    userId: 'usr-003',
    userDisplayName: 'Fatou N.',
    rating: 3,
    comment: 'Correct, mais le rythme est un peu lent pour quelqu\'un qui a déjà des bases.',
    status: 'published',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 12).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 12).toISOString(),
    isVerifiedLearner: false,
    isMock: true
  },
  {
    id: 'rev-4',
    courseId: 'course-123',
    userId: 'usr-me',
    userDisplayName: 'Vous',
    rating: 5,
    comment: 'Mon propre avis, en attente de modération.',
    status: 'pending',
    createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    isVerifiedLearner: true,
    isMock: true
  }
];

const MOCK_SUMMARY: CourseRatingSummary = {
  courseId: 'course-123',
  averageRating: 4.2,
  totalReviews: 28,
  distribution: {
    1: 0,
    2: 1,
    3: 3,
    4: 10,
    5: 14
  },
  isMock: true
};

/**
 * Service de gestion des avis et évaluations.
 * ZERO TRUST: Toutes les opérations d'écriture et les calculs d'agrégats
 * doivent, à terme, être effectués et validés par le backend.
 */
export class ReviewService {
  /**
   * Récupère les statistiques et l'agrégation des notes d'un cours.
   */
  static async getCourseRatingSummary(courseId: string): Promise<ReviewResponse<CourseRatingSummary>> {
    await delay(600);
    // Simulation: Normalement on interroge Firestore (ou Cloud Functions)
    return {
      data: { ...MOCK_SUMMARY, courseId },
      isMock: true
    };
  }

  /**
   * Récupère la liste paginée des avis d'un cours.
   * Ne retourne que les avis 'published' (ou les 'pending' appartenant à l'utilisateur courant).
   */
  static async getCourseReviews(_courseId: string, _limit: number = 10, _cursor?: string): Promise<ReviewResponse<Review[]>> {
    await delay(800);
    // Simulation: Normalement Firestore filtre par status == 'published'
    return {
      data: [...MOCK_REVIEWS],
      isMock: true
    };
  }

  /**
   * Soumet un nouvel avis.
   * ZERO TRUST: Le frontend ne peut pas attribuer le statut 'published'.
   * L'avis est automatiquement mis en 'pending' en attente de validation backend.
   */
  static async submitReview(courseId: string, payload: SubmitReviewPayload): Promise<ReviewResponse<Review>> {
    await delay(1200);
    
    // Anti-Spam: Dans la vraie architecture, une Cloud Function vérifiera
    // si l'utilisateur a déjà publié un avis et s'il a acheté le cours.
    
    const newReview: Review = {
      id: `rev-mock-${Date.now()}`,
      courseId,
      userId: 'usr-mock', // A remplacer par le vrai uid Firebase Auth
      userDisplayName: 'Utilisateur Actuel',
      rating: payload.rating,
      comment: payload.comment.trim(),
      status: 'pending', // MODÉRATION: Toujours 'pending' par défaut
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isVerifiedLearner: true,
      isMock: true
    };

    return {
      data: newReview,
      isMock: true
    };
  }
}
