import { logger } from '../../../lib/logger';
import { useConfirm } from '../../../components/ui/ConfirmDialog';
import { toast } from '../../../hooks/use-toast';
import { useState, useEffect } from "react";
import {
  collection,
  query,
  where,
  onSnapshot,
  collectionGroup,
  doc,
  deleteDoc,
} from "firebase/firestore";
import { db } from "../../../firebase";
import { useRole } from "../../../context/RoleContext";
import {
  Plus,
  ListCheck,
  Edit2,
  Trash2,
  Eye,
  BookOpen,
} from "lucide-react";
import { QuizEditor } from "./editor/QuizEditor";
import { QuizSubmissions } from "./QuizSubmissions";
import { Quiz } from "../../../types/models";

export function QuizPageClient() {
  const confirm = useConfirm();

  const { currentUser: instructor } = useRole();
  const [courses, setCourses] = useState<any[]>([]);
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingQuizId, setEditingQuizId] = useState<string | undefined>();
  const [editingCourseId, setEditingCourseId] = useState<string>("");
  const [editingCourseTitle, setEditingCourseTitle] = useState<string>("");
  const [viewingSubmissionsQuizId, setViewingSubmissionsQuizId] = useState<string | null>(null);

  useEffect(() => {
    if (!instructor?.uid) return;

    // Fetch courses
    const qCourses = query(
      collection(db, "courses"),
      where("instructorId", "==", instructor.uid),
    );
    const unsubCourses = onSnapshot(qCourses, (snap) => {
      setCourses(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    });

    // Fetch existing quizzes using collectionGroup (assuming courses/{courseId}/quizzes/{quizId})
    const qQuizzes = query(
      collectionGroup(db, "quizzes"),
      where("instructorId", "==", instructor.uid),
    );
    const unsubQuizzes = onSnapshot(qQuizzes, (snap) => {
      setQuizzes(snap.docs.map((d) => ({ id: d.id, ...d.data() } as Quiz)));
    });

    return () => {
      unsubCourses();
      unsubQuizzes();
    };
  }, [instructor?.uid]);

  const handleCreateNew = () => {
    if (courses.length === 0) {
      toast({ title: 'Information', description: String("Veuillez d'abord créer une formation.") });
      return;
    }
    // Simplification for now: Pick the first course if not specified
    setEditingCourseId(courses[0].id);
    setEditingCourseTitle(courses[0].title);
    setEditingQuizId(undefined);
    setIsEditorOpen(true);
  };

  const handleEdit = (quiz: Quiz) => {
    setEditingCourseId(quiz.courseId);
    setEditingCourseTitle(quiz.courseTitle || "Formation");
    setEditingQuizId(quiz.id);
    setIsEditorOpen(true);
  };

  const handleDelete = async (quiz: Quiz) => {
    if ((await confirm(`Êtes-vous sûr de vouloir supprimer le quiz "${quiz.title}" ?`))) {
      try {
        await deleteDoc(doc(db, `courses/${quiz.courseId}/quizzes/${quiz.id}`));
      } catch (e) {
        logger.error(e);
        toast({ variant: 'destructive', title: 'Erreur', description: String("Erreur lors de la suppression.") });
      }
    }
  };

  if (viewingSubmissionsQuizId) {
    return <QuizSubmissions quizId={viewingSubmissionsQuizId} onClose={() => setViewingSubmissionsQuizId(null)} />;
  }

  if (isEditorOpen) {
    return (
      <QuizEditor 
        quizId={editingQuizId} 
        courseId={editingCourseId} 
        courseTitle={editingCourseTitle} 
        onClose={() => setIsEditorOpen(false)} 
      />
    );
  }

  return (
    <div className="space-y-8 mt-4">
      <div className="flex justify-between items-center bg-[#1e293b] p-6 rounded-[2.5rem] border border-white/5 shadow-2xl">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center">
            <ListCheck className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h2 className="text-xl font-black text-white uppercase tracking-tight">
              Mes Quiz
            </h2>
            <p className="text-xs text-slate-400">
              Gérez vos évaluations et questions
            </p>
          </div>
        </div>
        <button
          onClick={handleCreateNew}
          className="h-12 px-6 bg-primary text-black font-black uppercase tracking-widest text-xs rounded-2xl hover:bg-emerald-400 transition shadow-xl shadow-primary/20 flex items-center gap-2"
        >
          <Plus className="h-4 w-4" /> Créer
        </button>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {quizzes.length === 0 ? (
          <div className="col-span-full p-12 text-center bg-[#1e293b]/40 rounded-[2rem] border border-dashed border-white/10">
            <ListCheck className="mx-auto h-12 w-12 text-slate-500 opacity-50 mb-4" />
            <p className="text-slate-400 font-bold uppercase tracking-widest text-xs mb-2">
              Aucun quiz existant
            </p>
            <p className="text-slate-500 text-sm">Créez votre première évaluation pour tester vos étudiants.</p>
          </div>
        ) : (
          quizzes.map((quiz) => (
            <div
              key={quiz.id}
              className="bg-[#1e293b] p-6 rounded-[2rem] border border-white/5 shadow-xl hover:border-primary/20 transition-all group relative overflow-hidden flex flex-col"
            >
              <div className={`absolute top-0 left-0 w-full h-1 transition-colors ${quiz.status === 'published' ? 'bg-primary' : 'bg-slate-600'}`} />
              
              <div className="flex justify-between items-start mb-4 mt-2">
                <span className={`text-[10px] font-black px-2 py-1 rounded uppercase tracking-widest ${quiz.status === 'published' ? 'bg-primary/10 text-primary' : 'bg-slate-800 text-slate-400'}`}>
                  {quiz.status === 'published' ? 'Publié' : 'Brouillon'}
                </span>
                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => setViewingSubmissionsQuizId(quiz.id)} className="p-1.5 bg-slate-800 rounded-lg hover:bg-slate-700 text-emerald-400 transition" title="Voir les copies"><Eye size={14}/></button>
                  <button onClick={() => handleEdit(quiz)} className="p-1.5 bg-slate-800 rounded-lg hover:bg-slate-700 text-slate-300 transition" title="Éditer"><Edit2 size={14}/></button>
                  <button onClick={() => handleDelete(quiz)} className="p-1.5 bg-slate-800 rounded-lg hover:bg-red-500/20 text-red-400 transition"><Trash2 size={14}/></button>
                </div>
              </div>

              <h3 className="font-black text-white text-lg leading-tight mb-2 line-clamp-2">
                {quiz.title}
              </h3>
              <p className="text-xs font-bold text-slate-500 flex items-center gap-1 mb-4">
                <BookOpen size={14}/> {quiz.courseTitle}
              </p>
              
              <div className="mt-auto pt-4 border-t border-white/5 flex justify-between items-center">
                <div className="text-xs text-slate-400">
                  <strong className="text-white">{quiz.questions?.length || 0}</strong> questions
                </div>
                {quiz.settings?.durationMinutes ? (
                  <div className="text-xs text-slate-400">
                    <strong className="text-white">{quiz.settings.durationMinutes}</strong> min
                  </div>
                ) : null}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
