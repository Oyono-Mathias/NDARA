import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useCourse } from '../hooks/catalog/useCatalogClient';
import { ChaptersService, LessonsService, ProgressService, CertificatesService } from '../services/db';
import { Chapter, Lesson, Progress, Certificate } from '../types/models';
import { where, orderBy } from 'firebase/firestore';
import { useAuth } from '../contexts/AuthContext';
import { Loader2, ArrowLeft, Menu, X, PlayCircle, FileText, CheckCircle2, ChevronRight, HelpCircle, Dumbbell, FileAudio, Settings, Award } from 'lucide-react';
import { VideoPlayer } from '../components/ui/VideoPlayer';
import { QuizPlayer } from './QuizPlayer';

export function CoursePlayer() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { firebaseUser } = useAuth();
  const { course, loading: courseLoading, isEnrolled } = useCourse(slug || '');
  
  
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [progressData, setProgressData] = useState<Progress[]>([]);
  const [loadingContent, setLoadingContent] = useState(true);
  const [certificate, setCertificate] = useState<Certificate | null>(null);


  const [activeLesson, setActiveLesson] = useState<Lesson | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  
  // Auto-save logic
  const lastSaveTime = useRef(0);

  useEffect(() => {
    if (!course || !isEnrolled || !firebaseUser) return;
    
    const unsubC = ChaptersService.subscribe([where('courseId', '==', course.id), orderBy('order', 'asc')], (data) => setChapters(data));
    const unsubL = LessonsService.subscribe([where('courseId', '==', course.id), orderBy('order', 'asc')], (data) => {
      setLessons(data);
      setLoadingContent(false);
    });

    
    const unsubP = ProgressService.subscribe([where('courseId', '==', course.id), where('studentId', '==', firebaseUser.uid)], (data) => setProgressData(data));
    const unsubCert = CertificatesService.subscribe([where('courseId', '==', course.id), where('studentId', '==', firebaseUser.uid)], (data) => {
      if (data.length > 0) setCertificate(data[0]);
    });

    return () => { unsubC(); unsubL(); unsubP(); unsubCert(); };

  }, [course, isEnrolled, firebaseUser]);

  useEffect(() => {
    if (lessons.length > 0 && !activeLesson && !loadingContent) {
      // Find the first uncompleted lesson
      const firstUncompleted = lessons.find(l => !progressData.find(p => p.lessonId === l.id && p.completed));
      setActiveLesson(firstUncompleted || lessons[0]);
    }
  }, [lessons, progressData, activeLesson, loadingContent]);

  const saveProgress = async (lesson: Lesson, watchTime: number, completed: boolean = false) => {
    if (!firebaseUser || !course) return;
    
    const now = Date.now();
    if (now - lastSaveTime.current < 5000 && !completed) return; // Debounce saves to 5s unless completed
    lastSaveTime.current = now;

    const existing = progressData.find(p => p.lessonId === lesson.id);
    if (!existing) {
      await ProgressService.create({
        studentId: firebaseUser.uid,
        courseId: course.id,
        lessonId: lesson.id,
        completed,
        watchTime
      } as any);
    } else {
      if (existing.completed && !completed) return; // Don't uncomplete
      await ProgressService.update(existing.id, { 
        watchTime: Math.max(existing.watchTime || 0, watchTime),
        completed: existing.completed || completed
      });
    }
  };

  const handleVideoProgress = (time: number) => {
    if (activeLesson) {
      saveProgress(activeLesson, time);
      
      // Auto complete if watched 90%
      if (activeLesson.duration && time > activeLesson.duration * 0.9) {
        saveProgress(activeLesson, time, true);
      }
    }
  };

  const markCompleted = async (lesson: Lesson) => {
    await saveProgress(lesson, 0, true);
    
    // Go to next lesson
    const currentIndex = lessons.findIndex(l => l.id === lesson.id);
    if (currentIndex < lessons.length - 1) {
      setActiveLesson(lessons[currentIndex + 1]);
    }
  };

  if (courseLoading || loadingContent) {
    return <div className="h-[100dvh] w-full bg-[#0B0F19] flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-emerald-500" /></div>;
  }

  if (!course || !isEnrolled) {
    return (
      <div className="h-[100dvh] w-full bg-[#0B0F19] flex flex-col items-center justify-center text-white p-4 text-center">
        <h2 className="text-xl font-bold mb-4">Accès refusé</h2>
        <p className="text-slate-400 mb-6">Vous n'êtes pas inscrit à cette formation.</p>
        <button onClick={() => navigate(`/student/catalog/${slug}`)} className="px-6 py-3 bg-emerald-500 text-slate-950 font-bold uppercase tracking-widest text-sm rounded-xl">
          Voir la formation
        </button>
      </div>
    );
  }

  const activeChapter = chapters.find(c => c.id === activeLesson?.chapterId);
  const activeProgress = activeLesson ? progressData.find(p => p.lessonId === activeLesson.id) : null;
  const completedLessonsCount = lessons.filter(l => progressData.some(p => p.lessonId === l.id && p.completed)).length;
  const isCourseCompleted = lessons.length > 0 && completedLessonsCount === lessons.length;

  const claimCertificate = async () => {
    if (!firebaseUser || !course || certificate || !isCourseCompleted) return;
    const certNumber = 'CERT-' + Math.random().toString(36).substr(2, 9).toUpperCase();
    await CertificatesService.create({
      studentId: firebaseUser.uid,
      courseId: course.id,
      issuedAt: Date.now(),
      certificateNumber: certNumber
    } as any);
  };


  return (
    <div className="flex h-[100dvh] bg-[#0B0F19] text-white overflow-hidden">
      
      {/* Sidebar */}
      <div className={`w-80 bg-[#0B0F19]/95 backdrop-blur-xl border-r border-white/5 flex flex-col transition-all duration-300 absolute md:relative z-40 h-full ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0 md:w-0 md:opacity-0 md:overflow-hidden'}`}>
        <div className="h-16 flex items-center justify-between px-4 border-b border-white/5 shrink-0">
          <button onClick={() => navigate('/student/courses')} className="p-2 -ml-2 text-slate-400 hover:text-white rounded-lg">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <span className="font-bold text-sm truncate px-2">{course.title}</span>
          <button onClick={() => setIsSidebarOpen(false)} className="md:hidden p-2 -mr-2 text-slate-400 hover:text-white rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto hide-scrollbar p-4 space-y-6">
          {chapters.map((chapter, i) => {
            const chapLessons = lessons.filter(l => l.chapterId === chapter.id);
            return (
              <div key={chapter.id} className="space-y-2">
                <h3 className="font-bold text-slate-300 text-sm uppercase tracking-wider mb-3">
                  {i+1}. {chapter.title}
                </h3>
                <div className="space-y-1">
                  {chapLessons.map((lesson, j) => {
                    const isCompleted = progressData.some(p => p.lessonId === lesson.id && p.completed);
                    const isActive = activeLesson?.id === lesson.id;
                    return (
                      <button 
                        key={lesson.id} 
                        onClick={() => { setActiveLesson(lesson); setIsSidebarOpen(false); }}
                        className={`w-full text-left p-3 rounded-xl flex items-start gap-3 transition-colors ${isActive ? 'bg-emerald-500/10 border border-emerald-500/20' : 'hover:bg-white/5 border border-transparent'}`}
                      >
                        <div className="mt-0.5 shrink-0">
                          {isCompleted ? (
                            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                          ) : (
                            <div className={`w-4 h-4 rounded-full border-2 ${isActive ? 'border-emerald-500' : 'border-slate-600'}`}></div>
                          )}
                        </div>
                        <div className="flex-1">
                          <p className={`text-sm font-medium leading-tight ${isActive ? 'text-emerald-400' : 'text-slate-300'}`}>{lesson.title}</p>
                          <div className="flex items-center gap-2 mt-2">
                            {lesson.type === 'video' ? <PlayCircle className="w-3 h-3 text-blue-400" /> : 
                             lesson.type === 'quiz' ? <HelpCircle className="w-3 h-3 text-amber-400" /> :
                             lesson.type === 'exercise' ? <Dumbbell className="w-3 h-3 text-emerald-400" /> :
                             lesson.type === 'audio' ? <FileAudio className="w-3 h-3 text-purple-400" /> :
                             <FileText className="w-3 h-3 text-slate-400" />}
                            <span className="text-[10px] text-slate-500 uppercase tracking-widest">{lesson.duration ? `${Math.round(lesson.duration/60)} min` : lesson.type}</span>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 relative bg-black">
        <header className="h-16 flex items-center justify-between px-4 border-b border-white/5 bg-[#0B0F19] shrink-0 absolute top-0 left-0 right-0 z-10">
          <div className="flex items-center gap-4">
            {!isSidebarOpen && (
              <button onClick={() => setIsSidebarOpen(true)} className="p-2 -ml-2 text-slate-400 hover:text-white rounded-lg transition-colors">
                <Menu className="w-5 h-5" />
              </button>
            )}
            <div>
              <p className="text-xs text-slate-500 uppercase tracking-widest hidden md:block">{activeChapter?.title}</p>
              <h2 className="font-bold text-white text-sm">{activeLesson?.title}</h2>
            </div>
          </div>
          <div className="flex items-center gap-4">
            {activeLesson && !progressData.some(p => p.lessonId === activeLesson.id && p.completed) && (
              <button onClick={() => markCompleted(activeLesson)} className="px-4 py-2 bg-emerald-500/10 text-emerald-500 text-[10px] font-bold uppercase tracking-widest rounded-lg hover:bg-emerald-500/20 transition-colors hidden md:block">
                Marquer comme terminé
              </button>
            )}
          </div>
        </header>

        
        <main className="flex-1 overflow-y-auto mt-16 bg-[#090E17]">
          {isCourseCompleted && !activeLesson && (
            <div className="flex flex-col items-center justify-center p-8 mt-12 text-center max-w-2xl mx-auto">
              <div className="w-24 h-24 bg-emerald-500/20 text-emerald-500 rounded-full flex items-center justify-center mb-6">
                <Award className="w-12 h-12" />
              </div>
              <h1 className="text-3xl font-black text-white mb-4">Félicitations !</h1>
              <p className="text-slate-400 mb-8 leading-relaxed">
                Vous avez terminé la formation "{course.title}" avec succès.
              </p>
              {certificate ? (
                <Link to="/student/certificates" className="px-8 py-4 bg-emerald-500 text-slate-950 font-bold uppercase tracking-widest rounded-xl hover:bg-emerald-400 transition-colors shadow-[0_0_30px_rgba(16,185,129,0.3)]">
                  Voir mon certificat
                </Link>
              ) : (
                <button onClick={claimCertificate} className="px-8 py-4 bg-emerald-500 text-slate-950 font-bold uppercase tracking-widest rounded-xl hover:bg-emerald-400 transition-colors shadow-[0_0_30px_rgba(16,185,129,0.3)]">
                  Obtenir mon certificat
                </button>
              )}
            </div>
          )}

          {!isCourseCompleted && activeLesson && (

            <div className={`w-full ${activeLesson.type === 'video' ? 'h-[calc(100vh-64px)]' : 'p-4 md:p-8 max-w-5xl mx-auto'}`}>
              
              {/* Media Player */}
              {(activeLesson.type === 'video' || activeLesson.type === 'audio') && activeLesson.videoUrl && (
                <VideoPlayer 
                  url={activeLesson.videoUrl} 
                  startTime={activeProgress?.watchTime || 0}
                  onProgress={handleVideoProgress}
                  onEnded={() => markCompleted(activeLesson)}
                  className={activeLesson.type === 'video' ? 'w-full h-full bg-black' : 'w-full aspect-video rounded-3xl'}
                />
              )}
              
              {!activeLesson.videoUrl && (activeLesson.type === 'video' || activeLesson.type === 'audio') && (
                <div className="w-full aspect-video bg-slate-900 rounded-3xl flex flex-col items-center justify-center text-slate-500 border border-white/5">
                  <PlayCircle className="w-16 h-16 mb-4 opacity-50" />
                  <p>Média non disponible</p>
                </div>
              )}

              {/* Quiz Player */}
              {activeLesson.type === 'quiz' && (
                <QuizPlayer lesson={activeLesson} courseId={course.id} onComplete={() => markCompleted(activeLesson)} />
              )}

              {/* PDF Reader */}
              {activeLesson.type === 'document' && activeLesson.documentUrl && (
                <div className="w-full h-[80vh] bg-slate-900 rounded-3xl border border-white/5 overflow-hidden">
                  <iframe src={`${activeLesson.documentUrl}#toolbar=0`} className="w-full h-full" title={activeLesson.title} />
                </div>
              )}

              {/* Rich Text / Content */}
              {activeLesson.type !== 'video' && activeLesson.type !== 'quiz' && (
                <div className="bg-white/5 border border-white/10 p-6 md:p-8 rounded-3xl mt-8">
                  <h1 className="text-2xl font-bold text-white mb-6">{activeLesson.title}</h1>
                  <div className="prose prose-invert prose-emerald max-w-none">
                    {activeLesson.content ? (
                      <div dangerouslySetInnerHTML={{ __html: activeLesson.content }} />
                    ) : activeLesson.description ? (
                      <p className="text-slate-300 leading-relaxed">{activeLesson.description}</p>
                    ) : (
                      <p className="text-slate-500 italic">Aucun contenu supplémentaire.</p>
                    )}
                  </div>
                  
                  <div className="pt-8 flex justify-center md:hidden">
                    <button onClick={() => markCompleted(activeLesson)} className="w-full py-4 bg-emerald-500 text-slate-950 text-sm font-bold uppercase tracking-widest rounded-xl hover:bg-emerald-400 transition-colors">
                      Marquer comme terminé
                    </button>
                  </div>
                </div>
              )}
              
            </div>
          )}
        </main>
      </div>

    </div>
  );
}
