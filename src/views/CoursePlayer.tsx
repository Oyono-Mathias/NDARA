import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { db } from "../firebase";
import { collection, query, where, getDocs, onSnapshot } from "firebase/firestore";
import { Play, Pause, Maximize, SkipForward, SkipBack, Settings, CheckCircle2, ListVideo, PlayCircle, Loader2, ArrowLeft } from "lucide-react";

export function CoursePlayer() {
  const { slug } = useParams<{slug: string}>();
  const [course, setCourse] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeModule, setActiveModule] = useState<number>(0);
  const [activeLesson, setActiveLesson] = useState<number>(0);

  useEffect(() => {
    if (!slug) return;
    const q = query(collection(db, "courses"), where("slug", "==", slug));
    const unsubscribe = onSnapshot(q, (snap) => {
      if (!snap.empty) {
        setCourse({ id: snap.docs[0].id, ...snap.docs[0].data() });
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, [slug]);

  if (loading) {
    return <div className="flex justify-center items-center h-[60vh]"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;
  }

  if (!course) {
    return <div className="text-center py-20 text-white font-bold">Formation introuvable.</div>;
  }

  const content = course.content || [];
  const currentModuleData = content[activeModule];
  const currentLessonData = currentModuleData?.lessons?.[activeLesson];

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-20">
      <Link to="/student/courses" className="inline-flex items-center text-primary text-xs font-bold uppercase tracking-widest hover:underline">
        <ArrowLeft className="w-4 h-4 mr-2" /> Retour à mes formations
      </Link>
      
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
          </div>
          
          <div className="p-6 bg-slate-900 rounded-3xl border border-white/5 text-slate-300 text-sm leading-relaxed">
             <h3 className="font-bold text-white mb-2">Description du cours</h3>
             <p>{course.description || "Aucune description fournie."}</p>
          </div>
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
                                <PlayCircle className="w-4 h-4" />
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
