import { useState, useCallback, useEffect, useRef } from 'react';
import { 
  QuizService, 
  Quiz, 
  QuizSession, 
  QuizAnswer, 
  QuizResult, 
  CertificateEligibility, 
  QuizStatus,
  QuizQuestion
} from '../services/quizService';

export const useQuizEngine = (quizId: string) => {
  // Core Data
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [session, setSession] = useState<QuizSession | null>(null);
  
  // State Machine
  const [status, setStatus] = useState<QuizStatus>('idle');
  const [error, setError] = useState<string | null>(null);
  
  // Quiz Progress & Interaction
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [answers, setAnswers] = useState<QuizAnswer>({});
  
  // Timer
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Results
  const [result, setResult] = useState<QuizResult | null>(null);
  const [eligibility, setEligibility] = useState<CertificateEligibility | null>(null);

  /**
   * Mélange un tableau (Fisher-Yates) - utilisé pour la randomisation des questions.
   */
  const shuffleArray = <T,>(array: T[]): T[] => {
    const arr = [...array];
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  };

  /**
   * Charge la configuration du quiz (métadonnées)
   */
  const loadQuiz = useCallback(async () => {
    if (!quizId) return;
    setStatus('loading');
    setError(null);
    try {
      const res = await QuizService.getQuiz(quizId);
      if (res.error || !res.data) {
        throw new Error(res.error || 'Impossible de charger le quiz.');
      }
      setQuiz(res.data);
      setStatus('ready');
    } catch (err: any) {
      setError(err.message || 'Une erreur est survenue.');
      setStatus('error');
    }
  }, [quizId]);

  /**
   * Démarre une session
   */
  const startQuiz = useCallback(async () => {
    if (!quiz) return;
    setStatus('loading');
    setError(null);
    try {
      const res = await QuizService.startSession(quiz.id);
      if (res.error || !res.data) {
        throw new Error(res.error || 'Impossible de démarrer la session.');
      }
      setSession(res.data);
      
      // Randomisation fixe des questions pour cette tentative
      const randomized = shuffleArray(quiz.questions);
      setQuestions(randomized);
      setCurrentIndex(0);
      setAnswers({});
      
      // Configuration du timer
      if (quiz.durationSeconds) {
        setTimeRemaining(quiz.durationSeconds);
      } else {
        setTimeRemaining(null);
      }

      setStatus('playing');
    } catch (err: any) {
      setError(err.message);
      setStatus('error');
    }
  }, [quiz]);

  /**
   * Gestion du minuteur
   */
  useEffect(() => {
    if (status === 'playing' && timeRemaining !== null) {
      timerRef.current = setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev === null || prev <= 1) {
            // Le temps est écoulé
            clearInterval(timerRef.current!);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [status, timeRemaining]);

  /**
   * Surveillance du timer pour expiration
   */
  useEffect(() => {
    // Si le temps tombe à 0 et qu'on jouait, on soumet automatiquement
    if (status === 'playing' && timeRemaining === 0) {
      submitQuiz();
    }
  }, [timeRemaining, status]);

  /**
   * Enregistre une réponse temporaire
   */
  const selectAnswer = useCallback((questionId: string, optionId: string) => {
    if (status !== 'playing') return;
    setAnswers((prev) => ({
      ...prev,
      [questionId]: optionId
    }));
  }, [status]);

  /**
   * Navigation
   */
  const nextQuestion = useCallback(() => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(prev => prev + 1);
    }
  }, [currentIndex, questions.length]);

  const prevQuestion = useCallback(() => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
    }
  }, [currentIndex]);

  /**
   * Soumission finale
   */
  const submitQuiz = useCallback(async () => {
    if (!quiz || !session || status === 'submitting') return;
    
    if (timerRef.current) clearInterval(timerRef.current);
    setStatus('submitting');
    setError(null);
    
    try {
      const res = await QuizService.submitAnswers(session.sessionId, quiz.id, answers);
      if (res.error || !res.data) {
        throw new Error(res.error || 'Erreur lors de l\'évaluation.');
      }
      setResult(res.data.result);
      setEligibility(res.data.eligibility);
      setStatus('completed');
    } catch (err: any) {
      setError(err.message);
      setStatus('error'); // Pourrait aussi afficher une modale et permettre un retry, selon l'UX voulue
    }
  }, [quiz, session, answers, status]);

  const retry = useCallback(() => {
    loadQuiz();
  }, [loadQuiz]);

  return {
    quiz,
    session,
    status,
    error,
    
    questions,
    currentQuestion: questions[currentIndex],
    currentIndex,
    totalQuestions: questions.length,
    
    answers,
    timeRemaining,
    
    result,
    eligibility,

    // Actions
    loadQuiz,
    startQuiz,
    selectAnswer,
    nextQuestion,
    prevQuestion,
    submitQuiz,
    retry
  };
};
