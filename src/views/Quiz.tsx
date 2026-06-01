import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useRole } from '../context/RoleContext';
import {
  getFirestore,
  doc,
  collection,
  query,
  getDocs,
  setDoc,
  serverTimestamp,
  orderBy, 
  collectionGroup,
  where,
  onSnapshot
} from 'firebase/firestore';
import { Loader2, Award, CheckCircle2, X } from 'lucide-react';
import { cn } from '../lib/utils';
import confetti from 'canvas-confetti';
import { db } from '../firebase';

// Since we're using a toast but may not have the hook
function useToast() {
  return {
    toast: ({ title, description, variant }: any) => {
      console.log(`TOAST: ${title} - ${description}`);
      alert(`${title}\n${description || ''}`);
    }
  }
}

// Ensure types are matching or use any locally
type Question = {
    id: string;
    text: string;
    options: { text: string; isCorrect: boolean }[];
    order?: number;
};

type Quiz = {
    id: string;
    title: string;
    courseId?: string;
};

export function QuizView() {
  const params = useParams();
  const { quizId } = params;
  const navigate = useNavigate();
  const { currentUser: user } = useRole();
  const { toast } = useToast();

  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [finalScore, setFinalScore] = useState<number | null>(null);
  const [quizData, setQuizData] = useState<Quiz | null>(null);
  const [isQuizLoading, setIsQuizLoading] = useState(true);

  // Fallback mode if no quizId provided
  useEffect(() => {
    if (!quizId) {
        setIsQuizLoading(false);
        return;
    }

    let unsubscribeQuestions: (() => void) | undefined;
    
    const fetchQuizAndQuestions = () => {
      setIsQuizLoading(true);
      const quizQuery = query(collectionGroup(db, 'quizzes'), where('id', '==', quizId));
      
      const unsubscribeQuiz = onSnapshot(quizQuery, (quizSnap) => {
        if (quizSnap.empty) {
          toast({ variant: 'destructive', title: "Quiz introuvable" });
          navigate(-1);
          return;
        }

        const quizDoc = quizSnap.docs[0];
        const data = { id: quizDoc.id, ...quizDoc.data() } as Quiz;
        setQuizData(data);

        if (unsubscribeQuestions) unsubscribeQuestions();

        const questionsQuery = query(collection(quizDoc.ref, 'questions'), orderBy('order', 'asc'));
        unsubscribeQuestions = onSnapshot(questionsQuery, (questionsSnap) => {
          setQuestions(questionsSnap.docs.map(d => ({ id: d.id, ...d.data() } as Question)));
          setIsQuizLoading(false);
        }, (err) => {
          console.error("Erreur chargement questions:", err);
          setIsQuizLoading(false);
        });
      }, (e) => {
        console.error("Erreur chargement quiz:", e);
        setIsQuizLoading(false);
      });
      
      return unsubscribeQuiz;
    };

    const unsubQuiz = fetchQuizAndQuestions();
    return () => {
       if (unsubQuiz) unsubQuiz();
       if (unsubscribeQuestions) unsubscribeQuestions();
    };
  }, [quizId, navigate, toast]);

  const handleAnswerSelect = (optionIndex: number) => {
    if (!questions.length) return;
    const currentQuestionId = questions[currentQuestionIndex].id;
    setAnswers(prev => ({ ...prev, [currentQuestionId]: optionIndex }));
  };

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  };

  const handleSubmit = async () => {
    if (Object.keys(answers).length !== questions.length) {
      toast({ variant: 'destructive', title: 'Attention', description: 'Répondez à toutes les questions avant de valider.' });
      return;
    }
    setIsSubmitting(true);
    let score = 0;
    questions.forEach(q => {
      const correctIndex = q.options.findIndex(opt => opt.isCorrect);
      if (answers[q.id] === correctIndex) score++;
    });
    const percentageScore = Math.round((score / questions.length) * 100);
    setFinalScore(percentageScore);
    
    if (percentageScore >= 70) {
        confetti({
            particleCount: 150,
            spread: 70,
            origin: { y: 0.6 },
            colors: ['#10b981', '#ffffff']
        });
    }

    if (user?.uid && quizId) {
        try {
            const attemptId = `${user.uid}_${quizId}`;
            const attemptRef = doc(db, `quiz_submissions`, attemptId);
            await setDoc(attemptRef, {
                id: attemptId,
                studentId: user.uid,
                quizId,
                quizTitle: quizData?.title || 'Quiz',
                courseId: quizData?.courseId || '',
                courseTitle: quizData?.title || 'Formation',
                answers,
                score: percentageScore,
                submittedAt: serverTimestamp(),
            });
        } catch (error) {
            console.error("Error saving quiz attempt:", error);
        }
    }
    setIsSubmitting(false);
  };

  if (isQuizLoading || (questions.length === 0 && !finalScore)) {
    return (
        <div className="h-screen bg-[#050505] flex flex-col items-center justify-center gap-4 fixed inset-0 z-50">
            <Loader2 className="h-10 w-10 animate-spin text-amber-500" />
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">Initialisation de l'évaluation...</p>
        </div>
    );
  }
  
  if (finalScore !== null) {
      return (
          <div className="h-screen fixed inset-0 z-50 bg-[#050505] flex flex-col items-center justify-center p-6 bg-grainy">
              <div className="absolute inset-0 bg-amber-500/5 blur-[120px] rounded-full pointer-events-none" />
              
              <div className="w-full max-w-sm text-center bg-slate-900 border border-white/5 rounded-[3rem] overflow-hidden shadow-2xl animate-in zoom-in duration-500 z-10 flex flex-col">
                  <div className="pt-12 pb-6">
                      <div className="w-24 h-24 rounded-full bg-amber-500/10 flex items-center justify-center mx-auto mb-6">
                          <Award className={cn("h-12 w-12", finalScore >= 70 ? "text-emerald-500" : "text-amber-500")} />
                      </div>
                      <h3 className="text-2xl font-black text-white uppercase tracking-tight">Résultats</h3>
                      <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mt-1">{quizData?.title}</p>
                  </div>
                  
                  <div className="space-y-4 pb-10 px-6">
                      <div className="relative inline-block">
                          <p className={cn(
                              "text-8xl font-black tracking-tighter",
                              finalScore >= 70 ? "text-emerald-500" : "text-amber-500"
                          )}>
                              {finalScore}<span className="text-2xl opacity-30">%</span>
                          </p>
                      </div>
                      <p className="text-slate-400 font-medium italic text-sm">
                          {finalScore >= 70 
                            ? "Félicitations Ndara, ton savoir est validé !" 
                            : "Tu peux faire mieux. Réexamine tes erreurs avec Mathias."}
                      </p>
                  </div>
                  
                  <div className="flex flex-col gap-3 p-6 bg-black/40 w-full mt-auto">
                      <button 
                        onClick={() => quizData?.courseId ? navigate(`/courses/${quizData.courseId}`) : navigate(-1)} 
                        className="w-full h-16 rounded-2xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-black uppercase text-xs tracking-widest shadow-xl transition-all active:scale-95 flex items-center justify-center"
                      >
                          Continuer l'étude
                      </button>
                      <button 
                        onClick={() => { setFinalScore(null); setCurrentQuestionIndex(0); setAnswers({}); }}
                        className="text-[10px] font-black text-slate-500 uppercase tracking-widest py-2 hover:text-white transition"
                      >
                        Recommencer le test
                      </button>
                  </div>
              </div>
          </div>
      )
  }

  const currentQuestion = questions[currentQuestionIndex];

  return (
    <div className="h-screen flex flex-col bg-[#050505] font-sans relative fixed inset-0 z-50">
      <div className="grain-overlay" />
      
      {/* Header Immersif */}
      <header className="px-4 py-6 border-b border-white/5 flex items-center justify-between z-20 bg-black/40 backdrop-blur-md safe-area-pt">
        <button onClick={() => navigate(-1)} className="w-10 h-10 rounded-full bg-slate-900 flex items-center justify-center text-slate-500 active:scale-90 transition hover:text-white">
          <X className="h-5 w-5" />
        </button>
        <div className="text-center">
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">Évaluation</p>
            <h1 className="text-xs font-bold text-white uppercase tracking-widest mt-0.5 max-w-[180px] break-words line-clamp-1">{quizData?.title}</h1>
        </div>
        <div className="w-10 h-10 rounded-full bg-amber-500/10 flex items-center justify-center text-amber-500 font-black text-[10px]">
            {currentQuestionIndex + 1}/{questions.length}
        </div>
      </header>
      
      {/* Barre de Progression Glowy */}
      <div className="h-1 w-full bg-slate-900 overflow-hidden z-20">
        <div 
            className="h-full bg-amber-500 transition-all duration-500 shadow-[0_0_15px_rgba(245,158,11,0.6)]" 
            style={{ width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }} 
        />
      </div>

      <main className="flex-1 overflow-y-auto px-6 py-12 z-10 flex flex-col max-w-2xl mx-auto w-full">
        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <h2 className="text-2xl md:text-3xl font-black text-white leading-tight uppercase tracking-tight">
                {currentQuestion?.text}
            </h2>
            
            <div className="space-y-4">
                {currentQuestion?.options.map((option, index) => {
                    const isSelected = answers[currentQuestion.id] === index;
                    return (
                        <button 
                            key={index}
                            onClick={() => handleAnswerSelect(index)}
                            className={cn(
                                "w-full flex items-center gap-4 p-6 rounded-[2rem] border-2 transition-all active:scale-[0.98] cursor-pointer text-left focus:outline-none",
                                isSelected 
                                    ? "border-amber-500 bg-amber-500/5 shadow-[0_0_30px_rgba(245,158,11,0.1)]" 
                                    : "border-white/5 bg-slate-900/40 hover:bg-slate-900/60"
                            )}
                        >
                            <div className={cn(
                                "flex items-center justify-center w-6 h-6 rounded-full border-2 shrink-0 transition-colors",
                                isSelected ? "border-amber-500 bg-amber-500" : "border-slate-700"
                            )}>
                                {isSelected && <div className="w-2.5 h-2.5 bg-[#050505] rounded-full" />}
                            </div>
                            <span className={cn(
                                "text-base font-bold leading-relaxed",
                                isSelected ? "text-white" : "text-slate-400"
                            )}>
                                {option.text}
                            </span>
                        </button>
                    );
                })}
            </div>
        </div>
      </main>

      {/* Action Bar */}
      <footer className="p-6 bg-black/80 backdrop-blur-xl border-t border-white/5 z-20 safe-area-pb">
        <div className="max-w-2xl mx-auto">
            {currentQuestionIndex < questions.length - 1 ? (
                <button 
                    onClick={handleNext} 
                    disabled={answers[currentQuestion?.id] === undefined} 
                    className="w-full h-16 rounded-[2rem] flex items-center justify-center bg-amber-500 hover:bg-amber-600 disabled:opacity-50 disabled:cursor-not-allowed text-slate-950 font-black uppercase text-xs tracking-widest shadow-2xl transition-all"
                >
                    Question suivante
                </button>
            ) : (
                <button 
                    onClick={handleSubmit} 
                    disabled={isSubmitting || answers[currentQuestion?.id] === undefined} 
                    className="w-full h-16 rounded-[2rem] flex items-center justify-center bg-amber-500 hover:bg-amber-600 disabled:opacity-50 disabled:cursor-not-allowed text-slate-950 font-black uppercase text-xs tracking-widest shadow-2xl transition-all"
                >
                    {isSubmitting ? <Loader2 className="h-5 w-5 animate-spin" /> : <><CheckCircle2 className="mr-2 h-4 w-4 shrink-0" /> Valider mon Quiz</>}
                </button>
            )}
        </div>
      </footer>
    </div>
  );
}
