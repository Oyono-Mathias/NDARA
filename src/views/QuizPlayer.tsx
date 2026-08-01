import { logger } from '../lib/logger';
import { toast } from '../hooks/use-toast';
import React, { useState, useEffect } from 'react';
import { Lesson, Quiz, QuizQuestion } from '../types/models';
import { db } from '../firebase';
import { doc, getDoc, setDoc, collection, query, where, getDocs, serverTimestamp } from 'firebase/firestore';
import { useAuth } from '../contexts/AuthContext';
import { ArrowUp, ArrowDown } from 'lucide-react';
import { CheckCircle2, XCircle, ChevronRight, ChevronLeft, RefreshCw, Loader2, Award, Maximize2, Minimize2 } from 'lucide-react';

interface QuizPlayerProps {
  lesson?: Lesson; // Optional now, we can pass quizId directly
  quizId?: string;
  courseId: string;
  onComplete?: () => void;
  standalone?: boolean;
}

export function QuizPlayer({ lesson, quizId: providedQuizId, courseId, onComplete, standalone = false }: QuizPlayerProps) {
  const { firebaseUser } = useAuth();
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [loading, setLoading] = useState(true);
  
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [showResults, setShowResults] = useState(false);
  const [score, setScore] = useState(0);
  
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [fraudWarnings, setFraudWarnings] = useState(0);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden' && !showResults && quiz && !loading) {
        setFraudWarnings(prev => {
          const newWarnings = prev + 1;
          toast({
            title: "Avertissement de fraude",
            description: `Vous avez quitté l'onglet (${newWarnings}/3). Au 3ème avertissement, le quiz sera soumis automatiquement.`,
            variant: "destructive"
          });
          if (newWarnings >= 3) {
            submitQuiz();
          }
          return newWarnings;
        });
      }
    };
    
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, [showResults, quiz, loading]);

  useEffect(() => {
    const fetchQuiz = async () => {
      try {
        const idToFetch = (lesson as any)?.quizId || providedQuizId;
        if (!idToFetch) {
          setLoading(false);
          return;
        }

        const qSnap = await getDoc(doc(db, 'quizzes', idToFetch));
        if (qSnap.exists()) {
          const finalQuiz = { id: qSnap.id, ...qSnap.data() } as Quiz;
          setQuiz(finalQuiz);
          
          if (firebaseUser) {
             const progressSnap = await getDoc(doc(db, `quiz_submissions/${firebaseUser.uid}_${finalQuiz.id}`));
             if (progressSnap.exists() && !progressSnap.data()?.completed) {
                setAnswers(progressSnap.data()?.answers || {});
                if (finalQuiz.settings?.durationMinutes && progressSnap.data()?.startedAt) {
                   const startedAt = progressSnap.data()?.startedAt?.toMillis ? progressSnap.data()?.startedAt?.toMillis() : Date.now();
                   const now = Date.now();
                   const elapsed = (now - startedAt) / 1000;
                   const totalSecs = finalQuiz.settings.durationMinutes * 60;
                   const remaining = Math.max(0, totalSecs - elapsed);
                   setTimeLeft(remaining);
                }
             } else if (!progressSnap.exists() && finalQuiz.settings?.durationMinutes) {
                // Initialize startedAt
                await setDoc(doc(db, `quiz_submissions/${firebaseUser.uid}_${finalQuiz.id}`), {
                   studentId: firebaseUser.uid,
                   quizId: finalQuiz.id,
                   courseId: courseId,
                   instructorId: finalQuiz.instructorId || null,
                   startedAt: serverTimestamp(),
                   answers: {},
                   completed: false
                }, { merge: true });
                setTimeLeft(finalQuiz.settings.durationMinutes * 60);
             } else if (!progressSnap.exists()) {
                await setDoc(doc(db, `quiz_submissions/${firebaseUser.uid}_${finalQuiz.id}`), {
                   studentId: firebaseUser.uid,
                   quizId: finalQuiz.id,
                   courseId: courseId,
                   instructorId: finalQuiz.instructorId || null,
                   answers: {},
                   completed: false
                }, { merge: true });
             }
             if (progressSnap.exists() && progressSnap.data()?.completed) {
                 setAnswers(progressSnap.data()?.answers || {});
                 setScore(progressSnap.data()?.score || 0);
                 setShowResults(true);
             }
          }
        }
      } catch (e) {
        logger.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchQuiz();
  }, [lesson, providedQuizId, firebaseUser, courseId]);

  useEffect(() => {
    if (timeLeft === null || showResults) return;
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev === null) return null;
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [timeLeft === null, showResults]);

  useEffect(() => {
    if (timeLeft === 0 && !showResults) {
      submitQuiz();
    }
  }, [timeLeft, showResults]);


  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (!showResults && Object.keys(answers).length > 0) {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [showResults, answers]);


  // Auto-save
  useEffect(() => {
    if (!quiz || !firebaseUser || showResults || Object.keys(answers).length === 0) return;
    const saveProgress = async () => {
      await setDoc(doc(db, `quiz_submissions/${firebaseUser.uid}_${quiz.id}`), {
        studentId: firebaseUser.uid,
        quizId: quiz.id,
        courseId: courseId,
        instructorId: quiz.instructorId || null,
        answers,
        updatedAt: serverTimestamp(),
        completed: false
      }, { merge: true });
    };
    const t = setTimeout(saveProgress, 2000);
    return () => clearTimeout(t);
  }, [answers, quiz, firebaseUser, showResults, courseId]);

  if (loading) return <div className="p-12 flex justify-center"><Loader2 className="w-8 h-8 animate-spin text-emerald-500" /></div>;
  if (!quiz || !quiz.questions || quiz.questions.length === 0) return <div className="p-12 text-center text-slate-500">Aucun quiz configuré.</div>;

  const currentQuestion = quiz.questions[currentQuestionIdx];

  const handleAnswerChange = (value: any) => {
    if (showResults) return;
    setAnswers(prev => ({ ...prev, [currentQuestion.id]: value }));
  };

  const handleNext = () => {
    if (currentQuestionIdx < quiz.questions.length - 1) {
      setCurrentQuestionIdx(prev => prev + 1);
    } else {
      submitQuiz();
    }
  };

  
  const submitQuiz = async () => {
    try {
      setLoading(true);
      const token = await firebaseUser?.getIdToken();
      const res = await fetch('/api/quiz/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          quizId: quiz.id,
          courseId,
          answers
        })
      });
      
      const data = await res.json();
      if (data.success) {
        setScore(data.score);
        setShowResults(true);
        if (data.passed && onComplete) {
          onComplete();
        }
      } else {
        toast({ variant: 'destructive', title: 'Erreur', description: String("Erreur: " + data.error) });
      }
    } catch(e) {
      logger.error(e);
      toast({ variant: 'destructive', title: 'Erreur', description: String("Erreur de soumission") });
    } finally {
      setLoading(false);
    }
  };
const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(e => logger.error(e));
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const renderInput = () => {
    const ans = answers[currentQuestion.id];
    switch (currentQuestion.type) {
      case 'single':
      case 'true_false':
        return (
          <div className="space-y-3 mt-6">
            {currentQuestion.options.map(opt => (
              <label key={opt.id} className={`flex items-center gap-4 p-4 rounded-2xl border cursor-pointer transition ${ans === opt.id ? 'border-primary bg-primary/5 text-white' : 'border-white/5 bg-[#1e293b] text-slate-300 hover:border-white/10'}`}>
                <input 
                  type="radio" 
                  name={currentQuestion.id} 
                  checked={ans === opt.id}
                  onChange={() => handleAnswerChange(opt.id)}
                  className="w-5 h-5 accent-primary"
                />
                <span className="font-bold text-lg">{opt.text}</span>
              </label>
            ))}
          </div>
        );
      case 'multiple':
        const selectedIds = ans || [];
        return (
          <div className="space-y-3 mt-6">
            {currentQuestion.options.map(opt => (
              <label key={opt.id} className={`flex items-center gap-4 p-4 rounded-2xl border cursor-pointer transition ${selectedIds.includes(opt.id) ? 'border-primary bg-primary/5 text-white' : 'border-white/5 bg-[#1e293b] text-slate-300 hover:border-white/10'}`}>
                <input 
                  type="checkbox" 
                  checked={selectedIds.includes(opt.id)}
                  onChange={(e) => {
                    if (e.target.checked) handleAnswerChange([...selectedIds, opt.id]);
                    else handleAnswerChange(selectedIds.filter((id: string) => id !== opt.id));
                  }}
                  className="w-5 h-5 accent-primary rounded"
                />
                <span className="font-bold text-lg">{opt.text}</span>
              </label>
            ))}
          </div>
        );
      case 'short_answer':
      case 'fill_blank':
        return (
           <div className="mt-6">
             <input 
               type="text" 
               value={ans || ''}
               onChange={e => handleAnswerChange(e.target.value)}
               placeholder="Saisissez votre réponse ici..."
               className="w-full bg-[#1e293b] border border-white/10 rounded-2xl p-6 text-xl text-white focus:outline-none focus:border-primary shadow-inner"
             />
           </div>
        );
      
      case 'long_answer':
        return (
           <div className="mt-6">
             <textarea 
               value={ans || ''}
               onChange={e => handleAnswerChange(e.target.value)}
               placeholder="Détaillez votre réponse..."
               className="w-full bg-[#1e293b] border border-white/10 rounded-2xl p-6 text-lg text-white focus:outline-none focus:border-primary shadow-inner min-h-[150px]"
             />
           </div>
        );
      case 'order': {
        const items = ans || currentQuestion.options.map((o: any) => ({ id: o.id, text: o.text }));
        
        const moveItem = (idx: number, dir: number) => {
           const newItems = [...items];
           if (idx + dir < 0 || idx + dir >= newItems.length) return;
           const temp = newItems[idx];
           newItems[idx] = newItems[idx + dir];
           newItems[idx + dir] = temp;
           handleAnswerChange(newItems);
        };
        
        return (
           <div className="mt-6 space-y-3">
             {items.map((item: any, i: number) => (
                <div key={item.id} className="flex items-center gap-4 bg-[#1e293b] border border-white/5 p-4 rounded-xl">
                   <div className="flex flex-col gap-1">
                      <button onClick={() => moveItem(i, -1)} disabled={i === 0} className="text-slate-500 hover:text-white disabled:opacity-30"><ArrowUp size={16}/></button>
                      <button onClick={() => moveItem(i, 1)} disabled={i === items.length - 1} className="text-slate-500 hover:text-white disabled:opacity-30"><ArrowDown size={16}/></button>
                   </div>
                   <div className="font-bold text-lg text-slate-300">{item.text}</div>
                </div>
             ))}
           </div>
        );
      }
      case 'match':
      case 'drag_drop': {
         const leftItems = currentQuestion.options;
         // Generate scrambled right items once
         const [rightItems] = useState(() => [...currentQuestion.options.map((o: any) => ({ id: o.id, text: o.matchId }))].sort(() => Math.random() - 0.5));
         const pairs = ans || {}; // leftId -> rightId
         
         return (
            <div className="mt-6 space-y-4">
               {leftItems.map((left: any) => (
                  <div key={left.id} className="flex flex-col md:flex-row items-center gap-4">
                     <div className="w-full md:w-1/2 p-4 bg-[#1e293b] border border-white/5 rounded-xl font-bold text-slate-300">
                        {left.text}
                     </div>
                     <div className="text-slate-500 hidden md:block">{"->"}</div>
                     <select 
                        value={pairs[left.id] || ""}
                        onChange={(e) => handleAnswerChange({ ...pairs, [left.id]: e.target.value })}
                        className="w-full md:w-1/2 bg-[#0f172a] border border-white/10 rounded-xl p-4 text-white focus:outline-none focus:border-primary"
                     >
                        <option value="">Sélectionnez une correspondance...</option>
                        {rightItems.map((r: any, ri: number) => (
                           <option key={ri} value={r.id}>{r.text}</option>
                        ))}
                     </select>
                  </div>
               ))}
            </div>
         );
      }

      default:
        return <div className="p-4 text-slate-500">Type de question non supporté dans cet aperçu.</div>;
    }
  };

  if (showResults) {
    const passed = score >= (quiz.settings?.passingScore || 70);
    return (
      <div className="max-w-2xl mx-auto bg-[#1e293b] border border-white/5 rounded-3xl p-8 text-center animate-in fade-in zoom-in duration-500 shadow-2xl">
        <div className={`w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6 ${passed ? 'bg-emerald-500/20 text-emerald-500' : 'bg-rose-500/20 text-rose-500'}`}>
          {passed ? <Award className="w-12 h-12" /> : <XCircle className="w-12 h-12" />}
        </div>
        <h2 className="text-3xl font-black text-white mb-2">{passed ? 'Félicitations !' : 'Oups...'}</h2>
        <p className="text-slate-400 mb-8">
          Vous avez obtenu <strong className={passed ? 'text-emerald-400' : 'text-rose-400'}>{score}%</strong>.
          {quiz.settings?.passingScore && <span className="block text-sm mt-1">Score requis : {quiz.settings.passingScore}%.</span>}
        </p>

        {quiz.settings?.showAnswers && (
           <div className="text-left space-y-6 mt-8 border-t border-white/5 pt-8">
             <h3 className="font-bold text-white uppercase tracking-widest text-sm mb-4">Correction</h3>
             {quiz.questions.map((q, i) => (
               <div key={q.id} className="bg-[#0f172a] p-4 rounded-xl border border-white/5">
                 <p className="font-bold text-white mb-2"><span className="text-primary">{i+1}.</span> {q.text}</p>
                 {q.explanation && <p className="text-sm text-slate-400 bg-slate-800 p-3 rounded-lg mb-2">💡 {q.explanation}</p>}
               </div>
             ))}
           </div>
        )}

        {(!passed && !quiz.settings?.singleAttempt) && (
          <button onClick={() => { setShowResults(false); setCurrentQuestionIdx(0); setAnswers({}); setScore(0); }} className="mt-8 px-8 py-4 bg-slate-800 text-white rounded-xl font-bold hover:bg-slate-700 transition">
            Réessayer
          </button>
        )}
      </div>
    );
  }

  return (
    <div className={`flex flex-col bg-[#0f172a] transition-all duration-300 ${isFullscreen ? 'fixed inset-0 z-50' : 'w-full max-w-4xl mx-auto rounded-3xl border border-white/5 overflow-hidden'}`}>
      
      {/* Header */}
      <div className="bg-[#1e293b] p-4 px-6 border-b border-white/5 flex items-center justify-between">
        <h2 className="font-black text-white text-lg tracking-tight line-clamp-1">{quiz.title}</h2>
        <div className="flex items-center gap-4">
          {timeLeft !== null && (
            <div className={`px-3 py-1.5 rounded-lg font-mono font-bold text-sm ${timeLeft < 60 ? 'bg-rose-500/20 text-rose-500 animate-pulse' : 'bg-slate-800 text-slate-300'}`}>
              {formatTime(timeLeft)}
            </div>
          )}
          <button onClick={toggleFullscreen} className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-white/5 transition hidden md:block">
            {isFullscreen ? <Minimize2 size={18}/> : <Maximize2 size={18}/>}
          </button>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full h-1 bg-slate-800">
        <div className="h-full bg-primary transition-all duration-300" style={{ width: `${((currentQuestionIdx + 1) / quiz.questions.length) * 100}%` }} />
      </div>

      {/* Question Content */}
      <div className="flex-1 overflow-y-auto p-6 md:p-12 relative min-h-[50vh]">
        <span className="text-primary font-black uppercase tracking-widest text-xs mb-4 block">Question {currentQuestionIdx + 1} / {quiz.questions.length}</span>
        <h3 className="text-2xl md:text-3xl font-bold text-white leading-tight">
          {currentQuestion.text}
        </h3>
        
        {currentQuestion.media && (
          <div className="mt-6 max-w-lg">
             {currentQuestion.media.type === 'image' && <img src={currentQuestion.media.url} alt="Media" className="rounded-xl border border-white/10 w-full" />}
          </div>
        )}

        {renderInput()}
      </div>

      {/* Footer Navigation */}
      <div className="bg-[#1e293b] p-4 px-6 border-t border-white/5 flex items-center justify-between">
         <div className="flex gap-2">
            <button 
              onClick={() => setCurrentQuestionIdx(prev => Math.max(0, prev - 1))}
              disabled={currentQuestionIdx === 0}
              className="px-4 py-3 rounded-xl font-bold text-sm text-slate-400 hover:text-white hover:bg-slate-800 transition disabled:opacity-30 flex items-center gap-2"
            >
              <ChevronLeft size={16}/> Précédent
            </button>
         </div>
         
         <div className="hidden md:flex gap-1">
           {quiz.questions.map((q, i) => (
             <button 
               key={q.id}
               onClick={() => setCurrentQuestionIdx(i)}
               className={`w-8 h-8 rounded-lg text-xs font-bold transition flex items-center justify-center ${currentQuestionIdx === i ? 'bg-primary text-black' : answers[q.id] ? 'bg-white/10 text-white' : 'text-slate-500 hover:bg-white/5'}`}
             >
               {i + 1}
             </button>
           ))}
         </div>

         <button 
            onClick={handleNext}
            className="px-6 py-3 rounded-xl font-black uppercase tracking-widest text-sm bg-primary text-black hover:bg-emerald-400 transition flex items-center gap-2 shadow-lg shadow-primary/20"
          >
            {currentQuestionIdx === quiz.questions.length - 1 ? 'Terminer' : 'Suivant'} <ChevronRight size={16}/>
          </button>
      </div>

    </div>
  );
}
