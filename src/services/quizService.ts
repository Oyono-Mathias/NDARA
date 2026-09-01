export type QuizStatus = 'idle' | 'loading' | 'ready' | 'playing' | 'submitting' | 'completed' | 'error' | 'expired';

export interface QuizOption {
  id: string;
  text: string;
}

export interface QuizQuestion {
  id: string;
  text: string;
  options: QuizOption[];
}

export interface Quiz {
  id: string;
  title: string;
  description: string;
  durationSeconds?: number;
  passingScore: number; // en pourcentage (0-100)
  questions: QuizQuestion[];
  isMock: boolean;
}

export interface QuizSession {
  sessionId: string;
  quizId: string;
  userId: string;
  startedAt: string;
  expiresAt?: string;
}

export type QuizAnswer = Record<string, string>; // questionId -> optionId

export interface QuizResult {
  quizId: string;
  score: number;
  correctAnswers: number;
  incorrectAnswers: number;
  totalQuestions: number;
  percentage: number;
  passingScore: number;
  isPassed: boolean;
  timeUsedSeconds?: number;
  isMock: boolean;
}

export interface CertificateEligibility {
  isEligible: boolean;
  reason?: string;
  isMock: boolean;
}

export interface QuizServiceResponse<T> {
  data: T;
  isMock: boolean;
  error?: string;
}

// ---------------------------------------------------------------------------
// MOCK DATA
// ---------------------------------------------------------------------------
const MOCK_QUIZZES: Record<string, Quiz> = {
  'quiz-1': {
    id: 'quiz-1',
    title: 'Évaluation : Les bases du développement Web',
    description: 'Testez vos connaissances sur HTML, CSS et JavaScript.',
    durationSeconds: 120, // 2 minutes pour test rapide
    passingScore: 75,
    isMock: true,
    questions: [
      {
        id: 'q1',
        text: 'Que signifie HTML ?',
        options: [
          { id: 'opt1', text: 'Hyper Text Markup Language' },
          { id: 'opt2', text: 'High Tech Modern Language' },
          { id: 'opt3', text: 'Hyperlink and Text Markup Language' }
        ]
      },
      {
        id: 'q2',
        text: 'Quelle balise est utilisée pour insérer un script JavaScript ?',
        options: [
          { id: 'opt1', text: '<js>' },
          { id: 'opt2', text: '<javascript>' },
          { id: 'opt3', text: '<script>' }
        ]
      },
      {
        id: 'q3',
        text: 'En CSS, comment sélectionner l\'élément avec l\'id "header" ?',
        options: [
          { id: 'opt1', text: '.header' },
          { id: 'opt2', text: '#header' },
          { id: 'opt3', text: 'header' }
        ]
      },
      {
        id: 'q4',
        text: 'Lequel n\'est pas un type de donnée primitif en JavaScript ?',
        options: [
          { id: 'opt1', text: 'String' },
          { id: 'opt2', text: 'Boolean' },
          { id: 'opt3', text: 'Object' }
        ]
      }
    ]
  }
};

const MOCK_SOLUTIONS: Record<string, Record<string, string>> = {
  'quiz-1': {
    'q1': 'opt1',
    'q2': 'opt3',
    'q3': 'opt2',
    'q4': 'opt3'
  }
};

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Service de gestion des quiz et des résultats.
 * ZERO TRUST: Toutes les validations (score, temps, réponses) 
 * doivent être effectuées côté backend dans l'environnement de production.
 */
export class QuizService {
  /**
   * Récupère un quiz par son identifiant.
   */
  static async getQuiz(quizId: string): Promise<QuizServiceResponse<Quiz>> {
    await delay(500);
    const quiz = MOCK_QUIZZES[quizId];
    if (!quiz) {
      return { data: {} as Quiz, isMock: true, error: 'Quiz introuvable.' };
    }
    // Deep clone to avoid mutating the original mock
    return { data: JSON.parse(JSON.stringify(quiz)), isMock: true };
  }

  /**
   * Démarre une session sécurisée.
   * Le backend doit générer un sessionId, inscrire la tentative et fixer l'heure d'expiration.
   */
  static async startSession(quizId: string, userId: string = 'user-mock'): Promise<QuizServiceResponse<QuizSession>> {
    await delay(300);
    const quiz = MOCK_QUIZZES[quizId];
    if (!quiz) {
      return { data: {} as QuizSession, isMock: true, error: 'Quiz introuvable.' };
    }
    
    const now = new Date();
    const expiresAt = quiz.durationSeconds 
      ? new Date(now.getTime() + (quiz.durationSeconds + 5) * 1000).toISOString() // 5s grace period
      : undefined;

    return {
      data: {
        sessionId: `sess-${Date.now()}`,
        quizId,
        userId,
        startedAt: now.toISOString(),
        expiresAt
      },
      isMock: true
    };
  }

  /**
   * Soumet les réponses pour évaluation.
   * ZERO TRUST: Le frontend ne calcule pas le score final, c'est le backend qui
   * corrige la copie, valide le temps et vérifie les tentatives.
   * 
   * NOTE: Si cette soumission entrainait un achat ou une certification payante, 
   * le contrat nécessiterait ici un argument `pinCode: string` pour valider l'action.
   */
  static async submitAnswers(
    sessionId: string, 
    quizId: string, 
    answers: QuizAnswer
  ): Promise<QuizServiceResponse<{ result: QuizResult, eligibility: CertificateEligibility }>> {
    await delay(800);
    console.debug(`[Mock] Submitting answers for session: ${sessionId}`);
    
    const quiz = MOCK_QUIZZES[quizId];
    if (!quiz) {
      return { data: {} as any, isMock: true, error: 'Erreur système: Quiz introuvable.' };
    }

    const solutions = MOCK_SOLUTIONS[quizId];
    let correctAnswers = 0;
    const totalQuestions = quiz.questions.length;

    for (const question of quiz.questions) {
      if (answers[question.id] === solutions[question.id]) {
        correctAnswers++;
      }
    }

    const incorrectAnswers = totalQuestions - correctAnswers;
    const percentage = totalQuestions > 0 ? (correctAnswers / totalQuestions) * 100 : 0;
    const isPassed = percentage >= quiz.passingScore;

    const result: QuizResult = {
      quizId,
      score: correctAnswers, // points
      correctAnswers,
      incorrectAnswers,
      totalQuestions,
      percentage,
      passingScore: quiz.passingScore,
      isPassed,
      isMock: true
    };

    const eligibility: CertificateEligibility = {
      isEligible: isPassed,
      reason: isPassed ? 'Seuil de réussite atteint.' : 'Score insuffisant pour la certification.',
      isMock: true
    };

    return {
      data: { result, eligibility },
      isMock: true
    };
  }
}
