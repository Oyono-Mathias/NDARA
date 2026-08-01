// @ts-nocheck
import { logger } from '../../../../lib/logger';
import { toast } from '../../../../hooks/use-toast';
import { z } from "zod";
import { useState, useEffect } from "react";
import { Quiz, QuizQuestion } from "../../../../types/models";
import { TopAppBar } from "../../../ui/TopAppBar";
import { CheckCircle2, ChevronLeft, Save, Plus, Settings, List, Image as ImageIcon, Trash2, Copy, Eye } from "lucide-react";
import { db } from "../../../../firebase";
import { doc, setDoc, serverTimestamp, getDoc } from "firebase/firestore";
import { useRole } from "../../../../context/RoleContext";
import { QuestionBuilder } from "./QuestionBuilder";
import { QuestionBankModal } from "./QuestionBankModal";
import { BookOpen } from "lucide-react";

interface QuizEditorProps {
  quizId?: string;
  courseId: string;
  courseTitle: string;
  onClose: () => void;
}


const QuizSchema = z.object({
  title: z.string().min(3, "Titre trop court (min 3 caractères)"),
  description: z.string().optional(),
  questions: z.array(z.any()).min(1, "Le quiz doit contenir au moins une question"),
  passingScore: z.number().min(0).max(100).optional(),
  timeLimit: z.number().min(0).optional(),
});

export function QuizEditor({ quizId, courseId, courseTitle, onClose }: QuizEditorProps) {
  const { currentUser: instructor } = useRole();
  const [quiz, setQuiz] = useState<Partial<Quiz>>({
    title: "",
    description: "",
    status: "draft",
    questions: [],
    settings: {
      passingScore: 70,
      singleAttempt: false,
      randomOrder: false,
      immediateFeedback: true,
      showAnswers: true,
      autoCertificate: false,
    }
  });
  const [activeTab, setActiveTab] = useState<"questions" | "settings">("questions");
  const [isSaving, setIsSaving] = useState(false);
  const [isBankOpen, setIsBankOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(!!quizId);

  useEffect(() => {
    if (quizId && courseId) {
      const fetchQuiz = async () => {
        try {
          const docRef = doc(db, `courses/${courseId}/quizzes/${quizId}`);
          const snap = await getDoc(docRef);
          if (snap.exists()) {
            setQuiz(snap.data() as Quiz);
          }
        } catch (e) {
          logger.error("Error fetching quiz", e);
        } finally {
          setIsLoading(false);
        }
      };
      fetchQuiz();
    }
  }, [quizId, courseId]);

  const handleSave = async (publish: boolean = false) => {
    if (!instructor?.uid || !courseId) return;
    setIsSaving(true);
    try {

      const validation = QuizSchema.safeParse(quiz);
      if (!validation.success) {
        toast({ variant: 'destructive', title: 'Erreur de validation', description: validation.error.issues[0].message });
        setIsSaving(false);
        return;
      }

      const ref = quizId ? doc(db, `courses/${courseId}/quizzes/${quizId}`) : doc(db, `courses/${courseId}/quizzes`, Date.now().toString());
      const newRef = quizId ? ref : doc(db, `courses/${courseId}/quizzes`);
      
      const payload = {
        ...quiz,
        id: newRef.id,
        courseId,
        courseTitle,
        instructorId: instructor.uid,
        status: publish ? "published" : quiz.status,
        updatedAt: serverTimestamp(),
      };
      
      if (!quizId) {
        payload.createdAt = serverTimestamp();
      }

      await setDoc(newRef, payload, { merge: true });
      onClose();
    } catch (e) {
      logger.error("Save error", e);
      toast({ variant: 'destructive', title: 'Erreur', description: String("Erreur de sauvegarde.") });
    } finally {
      setIsSaving(false);
    }
  };

  const addQuestion = (type: QuizQuestion['type']) => {
    const newQuestion: QuizQuestion = {
      id: Date.now().toString(),
      type,
      text: "",
      options: [
        { id: Date.now().toString() + "_1", text: "", isCorrect: true },
        { id: Date.now().toString() + "_2", text: "", isCorrect: false },
      ],
      points: 1,
      difficulty: "medium",
    };
    setQuiz(prev => ({ ...prev, questions: [...(prev.questions || []), newQuestion] }));
  };

  const updateQuestion = (index: number, q: QuizQuestion) => {
    const n = [...(quiz.questions || [])];
    n[index] = q;
    setQuiz({ ...quiz, questions: n });
  };

  const removeQuestion = (index: number) => {
    const n = [...(quiz.questions || [])];
    n.splice(index, 1);
    setQuiz({ ...quiz, questions: n });
  };

  if (isLoading) return <div className="p-8 text-center text-slate-400">Chargement...</div>;

  return (
    <div className="fixed inset-0 bg-[#0f172a] z-50 overflow-y-auto pb-20">
      <div className="sticky top-0 z-10 bg-[#0f172a]/90 backdrop-blur-md border-b border-white/5 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full text-slate-400 transition-colors">
            <ChevronLeft size={20} />
          </button>
          <div>
            <h2 className="text-white font-bold text-lg">{quiz.title || "Nouveau Quiz"}</h2>
            <p className="text-xs text-slate-500">{courseTitle}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => handleSave(false)} disabled={isSaving} className="px-4 py-2 bg-slate-800 text-white text-xs font-bold uppercase rounded-full hover:bg-slate-700 transition">
            Brouillon
          </button>
          <button onClick={() => handleSave(true)} disabled={isSaving} className="px-6 py-2 bg-primary text-black text-xs font-black uppercase tracking-wider rounded-full hover:bg-primary/90 transition flex items-center gap-2">
            <Save size={16} /> Publier
          </button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto mt-8 px-4">
        {/* Basic Info */}
        <div className="bg-[#1e293b] p-6 rounded-3xl border border-white/5 space-y-4 mb-8">
          <div>
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 block">Titre du Quiz</label>
            <input 
              value={quiz.title} 
              onChange={e => setQuiz({...quiz, title: e.target.value})}
              className="w-full bg-[#0f172a] border border-white/10 rounded-xl p-4 text-white focus:border-primary focus:outline-none"
              placeholder="Ex: Évaluation Chapitre 1"
            />
          </div>
          <div>
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 block">Description</label>
            <textarea 
              value={quiz.description} 
              onChange={e => setQuiz({...quiz, description: e.target.value})}
              className="w-full bg-[#0f172a] border border-white/10 rounded-xl p-4 text-white focus:border-primary focus:outline-none h-24"
              placeholder="Instructions pour les étudiants..."
            />
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-4 border-b border-white/10 mb-8">
          <button 
            onClick={() => setActiveTab('questions')}
            className={`pb-4 px-4 text-sm font-bold uppercase tracking-wider border-b-2 transition-colors ${activeTab === 'questions' ? 'border-primary text-primary' : 'border-transparent text-slate-500 hover:text-slate-300'}`}
          >
            Questions ({quiz.questions?.length || 0})
          </button>
          <button 
            onClick={() => setIsBankOpen(true)}
            className="pb-4 px-4 text-sm font-bold uppercase tracking-wider border-b-2 border-transparent text-emerald-400 hover:text-emerald-300 ml-auto flex items-center gap-2"
          >
            <BookOpen size={16} /> Banque
          </button>
          <button 
            onClick={() => setActiveTab('settings')}
            className={`pb-4 px-4 text-sm font-bold uppercase tracking-wider border-b-2 transition-colors ${activeTab === 'settings' ? 'border-primary text-primary' : 'border-transparent text-slate-500 hover:text-slate-300'}`}
          >
            Paramètres
          </button>
        </div>

        {activeTab === 'questions' && (
          <div className="space-y-6">
            {quiz.questions?.map((q, idx) => (
              <QuestionBuilder key={q.id || idx} 
                question={q} 
                index={idx} 
                updateQuestion={updateQuestion} 
                removeQuestion={removeQuestion} 
              />
            ))}

            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              <button onClick={() => addQuestion('single')} className="py-3 border border-dashed border-white/10 rounded-2xl text-slate-400 hover:bg-white/5 hover:text-white transition font-bold text-xs flex flex-col items-center gap-1">
                <CheckCircle2 size={16} /> Choix Unique
              </button>
              <button onClick={() => addQuestion('multiple')} className="py-3 border border-dashed border-white/10 rounded-2xl text-slate-400 hover:bg-white/5 hover:text-white transition font-bold text-xs flex flex-col items-center gap-1">
                <List size={16} /> Choix Multiples
              </button>
              <button onClick={() => addQuestion('true_false')} className="py-3 border border-dashed border-white/10 rounded-2xl text-slate-400 hover:bg-white/5 hover:text-white transition font-bold text-xs flex flex-col items-center gap-1">
                <CheckCircle2 size={16} /> Vrai / Faux
              </button>
              <button onClick={() => addQuestion('short_answer')} className="py-3 border border-dashed border-white/10 rounded-2xl text-slate-400 hover:bg-white/5 hover:text-white transition font-bold text-xs flex flex-col items-center gap-1">
                <Plus size={16} /> Rép. Courte
              </button>
              <button onClick={() => addQuestion('long_answer')} className="py-3 border border-dashed border-white/10 rounded-2xl text-slate-400 hover:bg-white/5 hover:text-white transition font-bold text-xs flex flex-col items-center gap-1">
                <Plus size={16} /> Rép. Longue
              </button>
              <button onClick={() => addQuestion('order')} className="py-3 border border-dashed border-white/10 rounded-2xl text-slate-400 hover:bg-white/5 hover:text-white transition font-bold text-xs flex flex-col items-center gap-1">
                <List size={16} /> Ordonner
              </button>
              <button onClick={() => addQuestion('match')} className="py-3 border border-dashed border-white/10 rounded-2xl text-slate-400 hover:bg-white/5 hover:text-white transition font-bold text-xs flex flex-col items-center gap-1">
                <List size={16} /> Associer
              </button>
              <button onClick={() => addQuestion('fill_blank')} className="py-3 border border-dashed border-white/10 rounded-2xl text-slate-400 hover:bg-white/5 hover:text-white transition font-bold text-xs flex flex-col items-center gap-1">
                <Plus size={16} /> Compléter
              </button>
            </div>
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="bg-[#1e293b] p-8 rounded-3xl border border-white/5 space-y-6">
            <h3 className="text-white font-bold text-lg mb-6">Paramètres d'évaluation</h3>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 block">Score de passage (%)</label>
                <input type="number" min="0" max="100" value={quiz.settings?.passingScore || 70} onChange={e => setQuiz({...quiz, settings: {...quiz.settings!, passingScore: Number(e.target.value)}})} className="w-full bg-[#0f172a] border border-white/10 rounded-xl p-4 text-white" />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 block">Temps limite (minutes, 0 = illimité)</label>
                <input type="number" min="0" value={quiz.settings?.durationMinutes || 0} onChange={e => setQuiz({...quiz, settings: {...quiz.settings!, durationMinutes: Number(e.target.value)}})} className="w-full bg-[#0f172a] border border-white/10 rounded-xl p-4 text-white" />
              </div>
            </div>

            <div className="space-y-4 pt-6 border-t border-white/5">
              <label className="flex items-center gap-3 p-4 bg-[#0f172a] rounded-xl border border-white/5 cursor-pointer hover:border-white/10 transition">
                <input type="checkbox" checked={quiz.settings?.singleAttempt || false} onChange={e => setQuiz({...quiz, settings: {...quiz.settings!, singleAttempt: e.target.checked}})} className="w-5 h-5 accent-primary rounded" />
                <div>
                  <div className="text-white font-bold text-sm">Tentative Unique</div>
                  <div className="text-slate-500 text-xs">L'étudiant ne peut passer ce quiz qu'une seule fois.</div>
                </div>
              </label>

              <label className="flex items-center gap-3 p-4 bg-[#0f172a] rounded-xl border border-white/5 cursor-pointer hover:border-white/10 transition">
                <input type="checkbox" checked={quiz.settings?.randomOrder || false} onChange={e => setQuiz({...quiz, settings: {...quiz.settings!, randomOrder: e.target.checked}})} className="w-5 h-5 accent-primary rounded" />
                <div>
                  <div className="text-white font-bold text-sm">Ordre Aléatoire</div>
                  <div className="text-slate-500 text-xs">Mélanger l'ordre des questions pour chaque étudiant.</div>
                </div>
              </label>

              <label className="flex items-center gap-3 p-4 bg-[#0f172a] rounded-xl border border-white/5 cursor-pointer hover:border-white/10 transition">
                <input type="checkbox" checked={quiz.settings?.showAnswers || false} onChange={e => setQuiz({...quiz, settings: {...quiz.settings!, showAnswers: e.target.checked}})} className="w-5 h-5 accent-primary rounded" />
                <div>
                  <div className="text-white font-bold text-sm">Afficher les réponses</div>
                  <div className="text-slate-500 text-xs">Montrer les bonnes réponses à la fin du quiz.</div>
                </div>
              </label>
            </div>
          </div>
        )}
      </div>
      {isBankOpen && (
        <QuestionBankModal 
          onClose={() => setIsBankOpen(false)}
          currentQuestions={quiz.questions || []}
          onImport={(imported) => {
            setQuiz(prev => ({ ...prev, questions: [...(prev.questions || []), ...imported] }));
          }}
        />
      )}
    </div>
  );
}
