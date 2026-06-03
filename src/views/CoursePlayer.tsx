import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { db } from "../firebase";
import { collection, query, where, getDocs, onSnapshot, doc, updateDoc, getDoc, addDoc, serverTimestamp } from "firebase/firestore";
import { Play, Pause, Maximize, SkipForward, SkipBack, Settings, CheckCircle2, ListVideo, PlayCircle, Loader2, ArrowLeft, Trophy, MessageCircleQuestion, Send, Bot } from "lucide-react";
import { useRole } from "../context/RoleContext";

function StudentQnaForm({ courseId, courseTitle, instructorId }: { courseId: string, courseTitle: string, instructorId: string }) {
    const { currentUser } = useRole();
    const [question, setQuestion] = useState("");
    const [isAsking, setIsAsking] = useState(false);
    const [successMessage, setSuccessMessage] = useState("");

    const handleAskQuestion = async () => {
        if (!question.trim() || !currentUser?.uid) return;
        setIsAsking(true);
        setSuccessMessage("");
        try {
            // Demande à Mathias IA
            const res = await fetch("/api/ai/auto-answer", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    studentQuestion: question,
                    courseContext: `Cours: ${courseTitle}`,
                })
            });
            const data = await res.json();
            const aiAnswer = !data.error && data.answer ? data.answer : null;
            
            await addDoc(collection(db, "course_qna"), {
                courseId,
                courseTitle,
                instructorId,
                studentId: currentUser.uid,
                studentName: currentUser.displayName || "Étudiant",
                question,
                answer: aiAnswer,
                isAnswered: !!aiAnswer,
                needsValidation: !!aiAnswer, // Nécessite la validation de l'instructeur
                generatedBy: aiAnswer ? 'MathiasIA' : null,
                validatedByInstructor: false,
                createdAt: serverTimestamp(),
                answeredAt: aiAnswer ? serverTimestamp() : null
            });

            setSuccessMessage("Votre question a été envoyée. Si Mathias IA a trouvé une réponse, elle apparaîtra dans votre tableau de bord, et l'instructeur a été notifié.");
            setQuestion("");
            setTimeout(() => setSuccessMessage(""), 6000);
        } catch (error) {
            console.error(error);
        } finally {
            setIsAsking(false);
        }
    };

    return (
        <div className="mt-8 p-6 bg-slate-900 rounded-3xl border border-white/5 relative overflow-hidden">
             <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
                 <Bot className="w-32 h-32 text-primary" />
             </div>
             <h3 className="font-bold text-white mb-2 flex items-center gap-2">
                 <MessageCircleQuestion className="w-5 h-5 text-primary" />
                 Poser une question
             </h3>
             <p className="text-sm text-slate-400 mb-6">Un doute ? Demandez à <strong className="text-primary">Mathias IA</strong> (support instantané) ou à votre instructeur.</p>
             
             {successMessage ? (
                 <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-400 text-sm font-medium animate-in fade-in">
                     {successMessage}
                 </div>
             ) : (
                 <div className="space-y-4 relative z-10">
                     <textarea 
                         value={question}
                         onChange={e => setQuestion(e.target.value)}
                         placeholder="Ex: Je ne comprends pas bien la différence entre..."
                         className="w-full bg-[#1e293b] border border-white/10 rounded-2xl p-4 text-sm focus:ring-1 focus:ring-primary/50 text-slate-300 min-h-[100px] resize-y"
                     />
                     <button 
                         onClick={handleAskQuestion}
                         disabled={!question.trim() || isAsking}
                         className="h-12 px-6 bg-primary text-[#0f172a] font-black uppercase tracking-widest text-xs rounded-2xl flex items-center justify-center gap-2 hover:bg-emerald-400 disabled:opacity-50 transition w-full sm:w-auto"
                     >
                         {isAsking ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Send size={16} /> Envoyer la question</>}
                     </button>
                 </div>
             )}
        </div>
    );
}

export function CoursePlayer() {
  const { slug } = useParams<{slug: string}>();
  const { currentUser } = useRole();
  const [course, setCourse] = useState<any>(null);
  const [enrollment, setEnrollment] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeModule, setActiveModule] = useState<number>(0);
  const [activeLesson, setActiveLesson] = useState<number>(0);
  const [isUpdatingProgress, setIsUpdatingProgress] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);

  useEffect(() => {
    if (!slug) return;
    
    // First, get the course
    const qCourse = query(collection(db, "courses"), where("slug", "==", slug));
    
    getDocs(qCourse).then(snap => {
        if (!snap.empty) {
            const courseData = { id: snap.docs[0].id, ...snap.docs[0].data() };
            setCourse(courseData);
            
            // Then subscribe to the enrollment to get real-time progress
            if (currentUser?.uid) {
                const enrollmentId = `${currentUser.uid}_${courseData.id}`;
                const unsub = onSnapshot(doc(db, "enrollments", enrollmentId), (docSnap) => {
                    if (docSnap.exists()) {
                        setEnrollment({ id: docSnap.id, ...docSnap.data() });
                    }
                    setLoading(false);
                });
                return () => unsub();
            } else {
                setLoading(false);
            }
        } else {
            setLoading(false);
        }
    });

  }, [slug, currentUser?.uid]);

  const toggleLessonComplete = async (modIdx: number, lesIdx: number) => {
      if (!enrollment || !course || isUpdatingProgress) return;
      setIsUpdatingProgress(true);
      
      try {
          const content = course.content || [];
          let totalLessons = 0;
          content.forEach((m: any) => totalLessons += (m.lessons?.length || 0));
          
          if (totalLessons === 0) return;
          
          let currentCompleted = enrollment.completedLessons || [];
          const lessonId = `m${modIdx}_l${lesIdx}`;
          
          if (currentCompleted.includes(lessonId)) {
              currentCompleted = currentCompleted.filter((l: string) => l !== lessonId);
          } else {
              currentCompleted.push(lessonId);
          }
          
          const newProgress = Math.round((currentCompleted.length / totalLessons) * 100);
          const isFinished = newProgress >= 100;
          
          await updateDoc(doc(db, 'enrollments', enrollment.id), {
              completedLessons: currentCompleted,
              progress: newProgress,
              isEligibleForCertificate: isFinished,
              completedAt: isFinished ? new Date() : null
          });
          
          if (isFinished && enrollment.progress < 100) {
              setShowCelebration(true);
              setTimeout(() => setShowCelebration(false), 5000);
          }
      } catch (error) {
          console.error("Error updating progress:", error);
      } finally {
          setIsUpdatingProgress(false);
      }
  };

  if (loading) {
    return (
        <div className="flex flex-col flex-1 gap-6 p-6">
             <div className="h-64 bg-[#1e293b] rounded-3xl animate-pulse"></div>
             <div className="flex gap-6">
                <div className="flex-[2] h-40 bg-[#1e293b] rounded-3xl animate-pulse"></div>
                <div className="flex-1 h-96 bg-[#1e293b] rounded-3xl animate-pulse"></div>
             </div>
        </div>
    );
  }

  if (!course) {
    return <div className="text-center py-20 text-white font-bold">Formation introuvable.</div>;
  }

  const content = course.content || [];
  const currentModuleData = content[activeModule];
  const currentLessonData = currentModuleData?.lessons?.[activeLesson];
  const completedLessons = enrollment?.completedLessons || [];

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-20 relative">
      {/* Célébration UI */}
      {showCelebration && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm pointer-events-none fade-in duration-300">
              <div className="bg-[#1e293b] p-8 rounded-[2rem] border border-amber-500/50 shadow-[0_0_50px_rgba(245,158,11,0.3)] flex flex-col items-center animate-in zoom-in-50 slide-in-from-bottom-10 pointer-events-auto">
                  <div className="h-24 w-24 bg-gradient-to-br from-amber-400 to-amber-600 rounded-full flex items-center justify-center mb-6 shadow-xl">
                      <Trophy className="h-12 w-12 text-white" />
                  </div>
                  <h2 className="text-2xl font-black text-white uppercase tracking-tight text-center mb-2">Félicitations !</h2>
                  <p className="text-slate-300 text-center text-sm max-w-xs mb-6">Vous avez terminé à 100% cette formation ! Vous êtes maintenant éligible pour votre certificat.</p>
                  <button onClick={() => setShowCelebration(false)} className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl font-bold transition">Continuer</button>
              </div>
          </div>
      )}

      <div className="flex justify-between items-center">
          <Link to="/student/courses" className="inline-flex items-center text-primary text-xs font-bold uppercase tracking-widest hover:underline">
            <ArrowLeft className="w-4 h-4 mr-2" /> Retour à mes formations
          </Link>
          {enrollment && (
              <div className="flex items-center gap-3">
                  <div className="text-right">
                      <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Progression</p>
                      <p className="text-sm font-bold text-white">{enrollment.progress || 0}%</p>
                  </div>
                  <div className="w-24 h-2 bg-white/10 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-primary to-emerald-400 transition-all duration-500" style={{ width: `${enrollment.progress || 0}%` }} />
                  </div>
              </div>
          )}
      </div>
      
      <div className="flex flex-col md:flex-row gap-8">
        
        {/* Main Video Area */}
        <div className="flex-[2] space-y-6">
          <div>
            <p className="text-primary text-xs font-bold uppercase tracking-wider mb-1">
              {currentModuleData ? currentModuleData.title : 'Formation'}
            </p>
            <h1 className="font-serif text-2xl text-white leading-tight">
              {currentLessonData ? currentLessonData.title : course.title}
            </h1>
          </div>

          <div className="relative w-full aspect-video bg-black rounded-3xl overflow-hidden border border-white/10 group shadow-[0_0_30px_rgba(16,185,129,0.15)] glow-green flex items-center justify-center">
            {currentLessonData?.videoUrl ? (
              <video 
                src={currentLessonData.videoUrl} 
                controls 
                className="w-full h-full object-cover"
                autoPlay
              />
            ) : (
              <div className="text-center relative z-10 p-6 flex flex-col items-center">
                <div className="w-16 h-16 rounded-full bg-primary/20 backdrop-blur-md border border-primary/50 flex items-center justify-center text-primary mb-4">
                  <Play className="w-8 h-8 fill-current ml-1" />
                </div>
                <p className="text-slate-400">Aucune vidéo disponible pour cette session.</p>
              </div>
            )}
            {!currentLessonData?.videoUrl && (
               <img src="https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&q=80&w=1200" alt="Video cover" className="absolute inset-0 w-full h-full object-cover opacity-30" />
            )}
            
            {/* Mark as read button */}
            {enrollment && currentLessonData && (
                <div className="absolute bottom-4 right-4 z-20">
                    {completedLessons.includes(`m${activeModule}_l${activeLesson}`) ? (
                        <button 
                            disabled={isUpdatingProgress}
                            onClick={() => toggleLessonComplete(activeModule, activeLesson)}
                            className="px-4 py-2 bg-emerald-500/90 backdrop-blur-sm text-black font-bold text-xs uppercase tracking-widest rounded-xl flex items-center gap-2 hover:bg-emerald-400 transition"
                        >
                            <CheckCircle2 className="w-4 h-4" /> Terminée
                        </button>
                    ) : (
                        <button 
                            disabled={isUpdatingProgress}
                            onClick={() => toggleLessonComplete(activeModule, activeLesson)}
                            className="px-4 py-2 bg-black/60 backdrop-blur-sm border border-white/20 text-white font-bold text-xs uppercase tracking-widest rounded-xl hover:bg-white/20 transition flex items-center gap-2"
                        >
                            {isUpdatingProgress ? <Loader2 className="w-4 h-4 animate-spin" /> : "Marquer comme terminée"}
                        </button>
                    )}
                </div>
            )}
          </div>
          
          <div className="p-6 bg-slate-900 rounded-3xl border border-white/5 text-slate-300 text-sm leading-relaxed">
             <h3 className="font-bold text-white mb-2">Description du cours</h3>
             <p>{course.description || "Aucune description fournie."}</p>
          </div>
          
          <StudentQnaForm courseId={course.id} courseTitle={course.title} instructorId={course.instructorId} />
        </div>

        {/* Sidebar Syllabus */}
        <div className="flex-1">
          <div className="glass rounded-3xl p-6 border border-white/5 sticky top-24">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-serif text-xl text-white flex items-center gap-2">
                <ListVideo className="w-5 h-5 text-primary"/> Programme
              </h2>
            </div>
            
            {content.length === 0 ? (
              <p className="text-slate-500 text-sm">Le programme n'a pas encore été publié pour ce cours.</p>
            ) : (
              <div className="space-y-6">
                {content.map((mod: any, mIdx: number) => (
                  <div key={mod.id}>
                    <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-3">{mod.title}</h3>
                    <div className="space-y-2">
                      {mod.lessons?.map((les: any, lIdx: number) => {
                        const isActive = activeModule === mIdx && activeLesson === lIdx;
                        return (
                          <div 
                            key={les.id} 
                            onClick={() => { setActiveModule(mIdx); setActiveLesson(lIdx); }}
                            className={`flex items-center justify-between p-3 rounded-2xl cursor-pointer transition border ${isActive ? 'bg-primary/10 border-primary/30' : 'bg-background/50 border-white/5 hover:border-white/20'}`}
                          >
                            <div className="flex items-center gap-3">
                              <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${isActive ? 'bg-primary text-background' : 'bg-white/5 text-gray-500'}`}>
                                {completedLessons.includes(`m${mIdx}_l${lIdx}`) ? (
                                    <CheckCircle2 className={`w-4 h-4 ${isActive ? 'text-black' : 'text-emerald-500'}`} />
                                ) : (
                                    <PlayCircle className="w-4 h-4" />
                                )}
                              </div>
                              <div>
                                <p className={`font-bold text-sm ${isActive ? 'text-white' : 'text-gray-300'}`}>
                                  {les.title || 'Leçon sans titre'}
                                </p>
                                <p className="text-gray-500 text-xs">{les.duration || '00:00'}</p>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                      {(!mod.lessons || mod.lessons.length === 0) && (
                         <p className="text-slate-600 text-xs italic pl-2">Aucune leçon dans ce module.</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
        
      </div>
    </div>
  );
}
