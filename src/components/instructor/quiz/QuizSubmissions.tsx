import { logger } from '../../../lib/logger';
import { toast } from '../../../hooks/use-toast';
import { useState, useEffect } from "react";
import { collection, query, where, getDocs, doc, setDoc, serverTimestamp, getDoc } from "firebase/firestore";
import { db } from "../../../firebase";
import { useRole } from "../../../context/RoleContext";
import { CheckCircle2, ChevronLeft, MessageSquare, Award, Clock } from "lucide-react";

export function QuizSubmissions({ quizId, onClose }: { quizId: string, onClose: () => void }) {
  const { currentUser: instructor } = useRole();
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSub, setSelectedSub] = useState<any>(null);
  const [quiz, setQuiz] = useState<any>(null);
  const [gradeScore, setGradeScore] = useState<number>(0);
  const [gradeFeedback, setGradeFeedback] = useState<string>("");

  
  useEffect(() => {
    const fetchSubmissions = async () => {
      const q = query(collection(db, "quiz_submissions"), where("quizId", "==", quizId));
      const snap = await getDocs(q);
      setSubmissions(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      
      const qDoc = await getDoc(doc(db, "quizzes", quizId));
      if (qDoc.exists()) setQuiz(qDoc.data());
      
      setLoading(false);
    };
    fetchSubmissions();
  }, [quizId]);


  useEffect(() => {
    if (selectedSub) {
      setGradeScore(selectedSub.score || 0);
      setGradeFeedback(selectedSub.instructorFeedback || "");
    }
  }, [selectedSub]);
  const handleGradeUpdate = async (subId: string, newScore: number, feedback: string) => {
    try {
      await setDoc(doc(db, "quiz_submissions", subId), {
        score: newScore,
        instructorFeedback: feedback,
        gradedAt: serverTimestamp(),
        status: 'graded'
      }, { merge: true });
      
      setSubmissions(prev => prev.map(s => s.id === subId ? { ...s, score: newScore, instructorFeedback: feedback, status: 'graded' } : s));
      setSelectedSub(null);
    } catch (e) {
      logger.error(e);
      toast({ variant: 'destructive', title: 'Erreur', description: String("Erreur") });
    }
  };

  if (loading) return <div className="p-8 text-center text-slate-400">Chargement des copies...</div>;

  
  if (selectedSub && quiz) {
    return (
      <div className="fixed inset-0 bg-[#0f172a] z-50 overflow-y-auto pb-20">
         <div className="sticky top-0 z-10 bg-[#0f172a]/90 backdrop-blur-md border-b border-white/5 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={() => setSelectedSub(null)} className="p-2 hover:bg-white/5 rounded-full text-slate-400 transition-colors">
              <ChevronLeft size={20} />
            </button>
            <div>
              <h2 className="text-white font-bold text-lg">Correction Manuelle</h2>
              <p className="text-xs text-slate-500">Étudiant: {selectedSub.studentId}</p>
            </div>
          </div>
        </div>
        
        <div className="max-w-4xl mx-auto mt-8 px-4 space-y-6">
        
          <div className="space-y-6">
             {quiz.questions?.map((q: any, idx: number) => {
               const ans = selectedSub.answers?.[q.id];
               const isManualGrading = ['short_answer', 'long_answer'].includes(q.type);
               
               return (
                 <div key={q.id} className="bg-[#1e293b] p-6 rounded-3xl border border-white/5">
                   <div className="flex justify-between items-start mb-4">
                     <h4 className="text-white font-bold"><span className="text-primary">{idx + 1}.</span> {q.text}</h4>
                     <span className="text-xs font-bold text-slate-500 bg-slate-800 px-2 py-1 rounded-lg uppercase tracking-widest">{q.type}</span>
                   </div>
                   
                   <div className="bg-[#0f172a] p-4 rounded-xl border border-white/5 mb-4">
                     <p className="text-sm text-slate-400 mb-1">Réponse de l'étudiant :</p>
                     <p className="text-white font-bold">
                       {Array.isArray(ans) ? ans.join(', ') : (ans || <span className="text-slate-600 italic">Aucune réponse</span>)}
                     </p>
                   </div>
                   
                   {isManualGrading && (
                      <div className="border-t border-white/5 pt-4">
                         <p className="text-sm font-bold text-primary mb-2">Correction manuelle :</p>
                         <textarea 
                           className="w-full bg-[#0f172a] border border-white/10 rounded-xl p-3 text-white text-sm"
                           placeholder="Commentaire pour cette question..."
                         />
                      </div>
                   )}
                 </div>
               )
             })}
          </div>

          <div className="bg-[#1e293b] p-6 rounded-3xl border border-primary/20 sticky bottom-4 shadow-2xl">
             <h3 className="text-white font-bold mb-4">Ajustement du score global</h3>
             <div className="flex gap-4 items-center">
                <input 
                  type="number" 
                  defaultValue={selectedSub.score} 
                  id="new_score"
                  className="w-24 bg-[#0f172a] border border-white/10 rounded-xl p-3 text-white text-center font-black focus:border-primary focus:outline-none"
                />
                <span className="text-slate-500 font-bold">%</span>
             </div>
             
             <h3 className="text-white font-bold mt-6 mb-4">Commentaire global (Feedback)</h3>
             <textarea
                value={gradeFeedback}
                onChange={e => setGradeFeedback(e.target.value)}
                className="w-full bg-[#0f172a] border border-white/10 rounded-xl p-4 text-white min-h-[100px] focus:border-primary focus:outline-none"
                placeholder="Excellent travail..."
             />
             
             <button 
                onClick={() => {
                  const score = gradeScore;
const feedback = gradeFeedback;
                  handleGradeUpdate(selectedSub.id, score, feedback);
                }}
                className="mt-6 px-6 py-3 w-full bg-primary text-black font-black uppercase tracking-widest rounded-xl hover:bg-emerald-400 transition"
             >
               Valider la correction
             </button>
          </div>
        </div>
      </div>
    );
  }


  return (
    <div className="fixed inset-0 bg-[#0f172a] z-50 overflow-y-auto pb-20">
      <div className="sticky top-0 z-10 bg-[#0f172a]/90 backdrop-blur-md border-b border-white/5 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full text-slate-400 transition-colors">
            <ChevronLeft size={20} />
          </button>
          <div>
            <h2 className="text-white font-bold text-lg">Copies des étudiants</h2>
            <p className="text-xs text-slate-500">{submissions.length} soumissions</p>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto mt-8 px-4 space-y-4">
        {submissions.map(sub => (
          <div key={sub.id} className="bg-[#1e293b] p-6 rounded-3xl border border-white/5 flex items-center justify-between">
            <div>
              <p className="text-white font-bold mb-1">Étudiant ID: {sub.studentId.substring(0,8)}...</p>
              <div className="flex gap-4 text-xs font-bold text-slate-500 uppercase tracking-widest">
                <span className="flex items-center gap-1"><Clock size={12}/> {new Date(sub.completedAt?.toMillis?.() || Date.now()).toLocaleDateString()}</span>
                {sub.status === 'graded' ? (
                  <span className="text-primary flex items-center gap-1"><CheckCircle2 size={12}/> Corrigé</span>
                ) : (
                  <span className="text-amber-500 flex items-center gap-1"><MessageSquare size={12}/> À corriger</span>
                )}
              </div>
            </div>
            
            <div className="flex items-center gap-6">
              <div className="text-center">
                <div className={`text-2xl font-black ${sub.passed ? 'text-primary' : 'text-rose-400'}`}>{sub.score}%</div>
                <div className="text-[10px] uppercase font-bold text-slate-500">Score Auto</div>
              </div>
              <button 
                onClick={() => setSelectedSub(sub)}
                className="px-6 py-3 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl text-sm transition"
              >
                Ouvrir
              </button>
            </div>
          </div>
        ))}
        {submissions.length === 0 && <div className="text-center text-slate-500 py-12">Aucune soumission.</div>}
      </div>
    </div>
  );
}
