import React, { useState, useEffect } from 'react';
import { Lesson, Quiz } from '../types/models';
import { db } from '../firebase';
import { collection, query, where, getDocs, addDoc } from 'firebase/firestore';
import { useAuth } from '../contexts/AuthContext';
import { CheckCircle2, XCircle, ChevronRight, RefreshCw, Loader2, Award } from 'lucide-react';

interface QuizPlayerProps {
  lesson: Lesson;
  courseId: string;
  onComplete: () => void;
}

export function QuizPlayer({ lesson, courseId, onComplete }: QuizPlayerProps) {
  const { firebaseUser } = useAuth();
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [loading, setLoading] = useState(true);
  
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>({});
  const [showResults, setShowResults] = useState(false);
  const [score, setScore] = useState(0);

  useEffect(() => {
    const fetchQuiz = async () => {
      const q = query(collection(db, 'quizzes'), where('lessonId', '==', lesson.id));
      const snap = await getDocs(q);
      if (!snap.empty) {
        setQuiz({ id: snap.docs[0].id, ...snap.docs[0].data() } as Quiz);
      }
      setLoading(false);
    };
    fetchQuiz();
  }, [lesson.id]);

  if (loading) return <div className="p-12 flex justify-center"><Loader2 className="w-8 h-8 animate-spin text-emerald-500" /></div>;
  if (!quiz || !quiz.questions || quiz.questions.length === 0) return <div className="p-12 text-center text-slate-500">Aucun quiz configuré.</div>;

  const currentQuestion = quiz.questions[currentQuestionIdx];

  const handleSelect = (optionId: string) => {
    if (showResults) return;
    setSelectedOptions(prev => ({ ...prev, [currentQuestion.id]: optionId }));
  };

  const handleNext = () => {
    if (currentQuestionIdx < quiz.questions.length - 1) {
      setCurrentQuestionIdx(prev => prev + 1);
    } else {
      calculateScore();
    }
  };

  const calculateScore = async () => {
    let s = 0;
    quiz.questions.forEach(q => {
      const selectedId = selectedOptions[q.id];
      const correctOption = q.options.find(o => o.isCorrect);
      if (correctOption && selectedId === correctOption.id) s += 1;
    });
    const finalScore = Math.round((s / quiz.questions.length) * 100);
    setScore(finalScore);
    setShowResults(true);

    if (firebaseUser) {
      await addDoc(collection(db, 'quiz_results'), {
        studentId: firebaseUser.uid,
        quizId: quiz.id,
        courseId,
        score: finalScore,
        passed: finalScore >= (quiz.passingScore || 70),
        answers: selectedOptions,
        completedAt: Date.now()
      });
    }

    if (finalScore >= (quiz.passingScore || 70)) {
      onComplete();
    }
  };

  const retry = () => {
    setSelectedOptions({});
    setCurrentQuestionIdx(0);
    setShowResults(false);
    setScore(0);
  };

  if (showResults) {
    const passed = score >= (quiz.passingScore || 70);
    return (
      <div className="max-w-2xl mx-auto bg-white/5 border border-white/10 rounded-3xl p-8 text-center animate-in fade-in zoom-in duration-500">
        <div className={`w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6 ${passed ? 'bg-emerald-500/20 text-emerald-500' : 'bg-rose-500/20 text-rose-500'}`}>
          {passed ? <Award className="w-12 h-12" /> : <XCircle className="w-12 h-12" />}
        </div>
        <h2 className="text-3xl font-black text-white mb-2">{passed ? 'Félicitations !' : 'Oups...'}</h2>
        <p className="text-slate-400 mb-8">
          Vous avez obtenu <strong className={passed ? 'text-emerald-400' : 'text-rose-400'}>{score}%</strong> de bonnes réponses.
          {quiz.passingScore && <span className="block text-sm mt-1">Le score minimum requis est de {quiz.passingScore}%.</span>}
        </p>

        <div className="flex gap-4 justify-center">
          {!passed && (
            <button onClick={retry} className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl font-bold flex items-center gap-2 transition-colors">
              <RefreshCw className="w-4 h-4" /> Réessayer
            </button>
          )}
          {passed && (
            <button onClick={onComplete} className="px-6 py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-xl font-bold flex items-center gap-2 transition-colors shadow-lg shadow-emerald-500/20">
              Continuer <ChevronRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    );
  }

  const selectedOptionId = selectedOptions[currentQuestion.id];

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-xl font-bold text-white">{quiz.title}</h2>
        <span className="px-3 py-1 bg-white/10 rounded-full text-xs font-bold text-slate-300">
          Question {currentQuestionIdx + 1} / {quiz.questions.length}
        </span>
      </div>

      <div className="bg-white/5 border border-white/10 rounded-3xl p-6 md:p-8 mb-8 relative overflow-hidden">
        <div className="absolute top-0 left-0 h-1 bg-white/10 w-full">
          <div className="h-full bg-emerald-500 transition-all duration-300" style={{ width: `${((currentQuestionIdx) / quiz.questions.length) * 100}%` }} />
        </div>

        <h3 className="text-lg md:text-xl font-medium text-white mb-8">{currentQuestion.text}</h3>

        <div className="space-y-3">
          {currentQuestion.options.map(option => (
            <button
              key={option.id}
              onClick={() => handleSelect(option.id)}
              className={`w-full text-left p-4 rounded-xl border transition-all duration-200 flex items-center gap-4
                ${selectedOptionId === option.id 
                  ? 'border-emerald-500 bg-emerald-500/10' 
                  : 'border-white/10 bg-white/[0.02] hover:bg-white/5'}`}
            >
              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0
                ${selectedOptionId === option.id ? 'border-emerald-500' : 'border-slate-500'}`}>
                {selectedOptionId === option.id && <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full" />}
              </div>
              <span className={selectedOptionId === option.id ? 'text-white font-medium' : 'text-slate-300'}>
                {option.text}
              </span>
            </button>
          ))}
        </div>
      </div>

      <div className="flex justify-end">
        <button 
          onClick={handleNext} 
          disabled={!selectedOptionId}
          className={`px-8 py-3 rounded-xl font-bold uppercase tracking-widest text-sm flex items-center gap-2 transition-all
            ${selectedOptionId 
              ? 'bg-emerald-500 text-slate-950 hover:bg-emerald-400 shadow-lg shadow-emerald-500/20 cursor-pointer' 
              : 'bg-white/5 text-slate-500 cursor-not-allowed'}`}
        >
          {currentQuestionIdx < quiz.questions.length - 1 ? 'Suivant' : 'Terminer'} <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
