// @ts-nocheck
import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useCourse } from '../hooks/catalog/useCatalogClient';
import { ChaptersService, LessonsService, ProgressService, CertificatesService } from '../services/db';
import { Chapter, Lesson, Progress, Certificate } from '../types/models';
import { where, orderBy, doc, collection, setDoc, serverTimestamp, addDoc, getDocs, query, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../contexts/AuthContext';
import { Video,  Loader2, Clock, ArrowLeft, Menu, X, PlayCircle, FileText, CheckCircle2, ChevronRight, HelpCircle, Dumbbell, FileAudio, Settings, Award, Star, MessageSquare, Send } from 'lucide-react';
import { VideoPlayer } from '../components/ui/VideoPlayer';
import { QuizPlayer } from './QuizPlayer';

export function CoursePlayer() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { firebaseUser } = useAuth();
  const { course, loading: courseLoading, enrollmentLoading, isEnrolled } = useCourse(slug || '');
  
  
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [progressData, setProgressData] = useState<Progress[]>([]);
  const [loadingContent, setLoadingContent] = useState(true);
  const [certificate, setCertificate] = useState<Certificate | null>(null);


  const [activeLesson, setActiveLesson] = useState<Lesson | null>(null);
  const [globalVideoPlayer, setGlobalVideoPlayer] = useState("bunny");
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  
  // Auto-save logic
  const lastSaveTime = useRef(0);

  useEffect(() => {
    const configRef = doc(db, 'settings', 'ai_config');
    const unsubConfig = onSnapshot(configRef, (snap) => {
      if (snap.exists()) {
        const data = snap.data();
        if (data.defaultVideoPlayer) {
           setGlobalVideoPlayer(data.defaultVideoPlayer);
        }
      }
    });
    return () => unsubConfig();
  }, []);

  useEffect(() => {
    if (!course || !isEnrolled || !firebaseUser) return;
    
    let unsubC: any = () => {};
    let unsubL: any = () => {};
    
    let courseContent = course.content;
    if (!courseContent || (Array.isArray(courseContent) && courseContent.length === 0)) {
        courseContent = course.sections;
    }

    if (courseContent && Array.isArray(courseContent) && courseContent.length > 0) {
      const embeddedChapters: Chapter[] = [];
      const embeddedLessons: Lesson[] = [];
      
      courseContent.forEach((mod: any, index: number) => {
        const chapterId = mod.id || `mod_${index}`;
        embeddedChapters.push({
          id: chapterId,
          courseId: course.id,
          title: mod.title || mod.name || `Chapitre ${index + 1}`,
          order: index,
          description: '',
        } as Chapter);
        
        if (mod.lessons && Array.isArray(mod.lessons)) {
          mod.lessons.forEach((les: any, lIndex: number) => {
            let durationSec = 0;
            if (typeof les.duration === 'string') {
                const parts = les.duration.split(':').map(Number);
                if (parts.length === 2) durationSec = (parts[0] || 0) * 60 + (parts[1] || 0);
                else if (parts.length === 3) durationSec = (parts[0] || 0) * 3600 + (parts[1] || 0) * 60 + (parts[2] || 0);
            } else if (typeof les.duration === 'number') {
                durationSec = les.duration;
            }

            let videoUrl = les.videoUrl;
            let type = les.type || (videoUrl ? 'video' : 'text');
            
            // If it's a video but missing URL, try to find it in course.files.videos
            if (type === 'video' && !videoUrl && course.files && course.files.videos && course.files.videos.length > 0) {
                // Try to find a video that might match, or just take the first one available
                // To keep it simple, just take the first video if there is one.
                // A better approach would be mapping by index if we kept track of video lesson index.
                videoUrl = course.files.videos[0].url || course.files.videos[0].iframeUrl;
            }

            // Also check if course.files.videos has videos and this lesson isn't explicitly text
            if (!videoUrl && !les.type && course.files && course.files.videos && course.files.videos.length > 0) {
                videoUrl = course.files.videos[0].url || course.files.videos[0].iframeUrl;
                type = 'video';
            }

            embeddedLessons.push({
              id: les.id || `les_${index}_${lIndex}`,
              courseId: course.id,
              chapterId: chapterId,
              title: les.title || `Leçon ${lIndex + 1}`,
              type: type,
              videoUrl: videoUrl,
              duration: durationSec,
              order: lIndex,
            } as Lesson);
          });
        }
      });
      
      setChapters(embeddedChapters);
      setLessons(embeddedLessons);
      setLoadingContent(false);
    } else {
      unsubC = ChaptersService.subscribe([where('courseId', '==', course.id), orderBy('order', 'asc')], (data) => setChapters(data));
      unsubL = LessonsService.subscribe([where('courseId', '==', course.id), orderBy('order', 'asc')], (data) => {
        setLessons(data);
        setLoadingContent(false);
      });
    }

    const unsubP = ProgressService.subscribe([where('courseId', '==', course.id), where('studentId', '==', firebaseUser.uid)], (data) => setProgressData(data));
    const unsubCert = CertificatesService.subscribe([where('courseId', '==', course.id), where('studentId', '==', firebaseUser.uid)], (data) => {
      if (data.length > 0) setCertificate(data[0]);
    });

    return () => { if (unsubC) unsubC(); if (unsubL) unsubL(); unsubP(); unsubCert(); };
  }, [course, isEnrolled, firebaseUser]);

  useEffect(() => {
    console.log("activeLesson changed:", activeLesson);
  }, [activeLesson]);

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

  const activeChapter = chapters.find(c => c.id === activeLesson?.chapterId);
  const activeProgress = activeLesson ? progressData.find(p => p.lessonId === activeLesson.id) : null;
  const completedLessonsCount = lessons.filter(l => progressData.some(p => p.lessonId === l.id && p.completed)).length;
  const isCourseCompleted = lessons.length > 0 && completedLessonsCount === lessons.length;

  const [isClaiming, setIsClaiming] = useState(false);
  const [showAvisModal, setShowAvisModal] = useState(false);
  const [liveSessions, setLiveSessions] = useState<any[]>([]);
  const [avisRating, setAvisRating] = useState(5);
  const [avisComment, setAvisComment] = useState('');
  const [isSubmittingAvis, setIsSubmittingAvis] = useState(false);
  const [hasSubmittedAvis, setHasSubmittedAvis] = useState(false);

  const [showQnaModal, setShowQnaModal] = useState(false);
  const [qnaText, setQnaText] = useState('');
  const [isSubmittingQna, setIsSubmittingQna] = useState(false);
  const [lessonQnas, setLessonQnas] = useState<any[]>([]);

  useEffect(() => {
    if (!activeLesson || !course) return;
    const q = query(
      collection(db, 'course_qna'),
      where('courseId', '==', course.id),
      where('lessonId', '==', activeLesson.id)
    );
    const unsub = onSnapshot(q, snap => {
      const qnas = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      // Sort by creation date
      qnas.sort((a: any, b: any) => {
        const dA = a.createdAt?.toMillis?.() || 0;
        const dB = b.createdAt?.toMillis?.() || 0;
        return dB - dA;
      });
      setLessonQnas(qnas);
    });
    return () => unsub();
  }, [activeLesson?.id, course?.id]);

  useEffect(() => {
    if (!firebaseUser || !course) return;
    const checkAvis = async () => {
       const q = query(collection(db, 'course_reviews'), where('courseId', '==', course.id), where('studentId', '==', firebaseUser.uid));
       const snap = await getDocs(q);
       if (!snap.empty) {
           setHasSubmittedAvis(true);
       }
    };
    checkAvis();
  }, [firebaseUser, course]);

  const submitAvis = async () => {
    if (!firebaseUser || !course || !avisComment.trim()) return;
    setIsSubmittingAvis(true);
    try {
      await addDoc(collection(db, 'course_reviews'), {
        courseId: course.id,
        courseTitle: course.title,
        instructorId: course.instructorId,
        studentId: firebaseUser.uid,
        studentName: firebaseUser.displayName || 'Étudiant',
        rating: avisRating,
        comment: avisComment,
        createdAt: serverTimestamp()
      });
      setHasSubmittedAvis(true);
      setShowAvisModal(false);
    } catch(e) {
      console.error(e);
    } finally {
      setIsSubmittingAvis(false);
    }
  };

  const submitQna = async () => {
    if (!firebaseUser || !course || !activeLesson || !qnaText.trim()) return;
    setIsSubmittingQna(true);
    try {
      await addDoc(collection(db, 'course_qna'), {
        courseId: course.id,
        courseTitle: course.title,
        lessonId: activeLesson.id,
        lessonTitle: activeLesson.title,
        instructorId: course.instructorId,
        studentId: firebaseUser.uid,
        studentName: firebaseUser.displayName || 'Étudiant',
        question: qnaText,
        answer: null,
        needsValidation: false,
        createdAt: serverTimestamp()
      });
      setShowQnaModal(false);
      setQnaText('');
      alert("Votre question a été envoyée au formateur.");
    } catch(e) {
      console.error(e);
    } finally {
      setIsSubmittingQna(false);
    }
  };

  const claimCertificate = async () => {
    if (!firebaseUser || !course || certificate || !isCourseCompleted || isClaiming) return;
    setIsClaiming(true);
    let success = false;
    try {
      const certNumber = 'CERT-' + Math.random().toString(36).substr(2, 9).toUpperCase();
      // Automatiquement sauvegarder le certificat (Admin Drive Export)
      try {
        const certContent = `Certificat d'Achèvement\n\nDécerné à: ${firebaseUser.displayName || 'Étudiant'}\nFormation: ${course.title}\nDate: ${new Date().toLocaleDateString('fr-FR')}\nNuméro: ${certNumber}`;
        
        await fetch('/api/admin/drive/export', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            fileName: `Certificat_${firebaseUser.displayName || 'Etudiant'}_${course.title.substring(0,20)}.txt`,
            content: certContent,
            mimeType: 'text/plain'
          })
        });
        console.log("Certificat sauvegardé automatiquement sur Google Drive.");
      } catch (err) {
        console.warn("Échec de la sauvegarde Google Drive:", err);
      }

      await CertificatesService.create({
        studentId: firebaseUser.uid,
        courseId: course.id,
        courseTitle: course.title,
        studentName: firebaseUser.displayName || 'Étudiant',
        issuedAt: Date.now(),
        certificateNumber: certNumber
      } as any);
      
      // Notify the student
      const notifRef = doc(collection(db, `users/${firebaseUser.uid}/notifications`));
      await setDoc(notifRef, {
        title: "Certificat obtenu !",
        message: `Félicitations, vous avez obtenu votre certificat pour la formation "${course.title}".`,
        type: 'certificate_earned',
        link: '/student/certificates',
        read: false,
        userId: firebaseUser.uid,
        createdAt: serverTimestamp()
      }).catch(e => console.warn("Failed to send notification to student", e));
      
      success = true;
    } catch (error) {
      console.error(error);
    } finally {
      if (!success) {
        setIsClaiming(false);
      }
    }
  };

  useEffect(() => {
    if (isCourseCompleted && !certificate && !isClaiming) {
      claimCertificate();
    }
  }, [isCourseCompleted, certificate, isClaiming]);

  if (courseLoading || enrollmentLoading || (isEnrolled && loadingContent)) {
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
          {liveSessions.length > 0 && (
            <div className="mx-4 md:mx-8 mt-6">
              {liveSessions.map(session => (
                <div key={session.id} className="bg-emerald-900/40 border border-emerald-500/30 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4 mb-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-emerald-500/20 text-emerald-500 rounded-full flex items-center justify-center shrink-0">
                      <Video className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-white font-bold text-lg">{session.title}</h3>
                      <p className="text-emerald-400 text-sm">Prévu le {new Date(session.scheduledAt).toLocaleString('fr-FR', { dateStyle: 'long', timeStyle: 'short' })}</p>
                    </div>
                  </div>
                  <a href={session.meetingUri} target="_blank" rel="noreferrer" className="px-6 py-2 bg-emerald-500 text-slate-950 font-bold uppercase tracking-widest text-sm rounded-xl hover:bg-emerald-400 transition-colors shrink-0">
                    Rejoindre le Live
                  </a>
                </div>
              ))}
            </div>
          )}

          {isCourseCompleted && !activeLesson && (
            <div className="flex flex-col items-center justify-center p-8 mt-12 text-center max-w-2xl mx-auto">
              <div className="w-24 h-24 bg-emerald-500/20 text-emerald-500 rounded-full flex items-center justify-center mb-6">
                <Award className="w-12 h-12" />
              </div>
              <h1 className="text-3xl font-black text-white mb-4">Félicitations !</h1>
              <p className="text-slate-400 mb-8 leading-relaxed">
                Vous avez terminé la formation "{course.title}" avec succès.
              </p>
              <div className="flex gap-4">
                {certificate ? (
                  <Link to="/student/certificates" className="px-8 py-4 bg-emerald-500 text-slate-950 font-bold uppercase tracking-widest rounded-xl hover:bg-emerald-400 transition-colors shadow-[0_0_30px_rgba(16,185,129,0.3)]">
                    Voir mon certificat
                  </Link>
                ) : (
                  <button onClick={claimCertificate} disabled={isClaiming} className="px-8 py-4 bg-emerald-500 text-slate-950 font-bold uppercase tracking-widest rounded-xl hover:bg-emerald-400 transition-colors shadow-[0_0_30px_rgba(16,185,129,0.3)] disabled:opacity-50">
                    {isClaiming ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : 'Obtenir mon certificat'}
                  </button>
                )}
                {!hasSubmittedAvis && (
                   <button onClick={() => setShowAvisModal(true)} className="px-8 py-4 bg-white/10 text-white font-bold uppercase tracking-widest rounded-xl hover:bg-white/20 transition-colors flex items-center gap-2 border border-white/10">
                     <Star className="w-5 h-5 text-amber-400" /> Évaluer
                   </button>
                )}
              </div>
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
                  playerType={globalVideoPlayer}
                />
              )}
              
              {!activeLesson.videoUrl && (activeLesson.type === 'video' || activeLesson.type === 'audio') && (
                <div className="w-full aspect-video bg-slate-900 rounded-3xl flex flex-col items-center justify-center text-slate-500 border border-white/5">
                  <PlayCircle className="w-16 h-16 mb-4 opacity-50" />
                  <p>Média non disponible</p>
                </div>
              )}

              {/* Q&A Section */}
              <div className="bg-white/5 border border-white/10 rounded-3xl p-6 md:p-8 mt-8">
                <div className="flex items-center justify-between mb-8">
                  <h3 className="text-xl font-black text-white uppercase tracking-tight">Questions & Réponses</h3>
                  <button onClick={() => setShowQnaModal(true)} className="px-4 py-2 bg-primary/10 text-primary text-[10px] font-bold uppercase tracking-widest rounded-lg hover:bg-primary/20 transition-colors flex items-center gap-2">
                    <MessageSquare className="w-4 h-4" /> Poser une question
                  </button>
                </div>
                
                {lessonQnas.length === 0 ? (
                  <div className="text-center py-12 border border-white/5 border-dashed rounded-2xl bg-white/[0.02]">
                    <MessageSquare className="w-8 h-8 text-slate-600 mx-auto mb-3" />
                    <p className="text-slate-400 text-sm">Aucune question pour cette leçon. Soyez le premier !</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {lessonQnas.map(q => (
                      <div key={q.id} className="bg-white/[0.02] border border-white/5 rounded-2xl p-6">
                        <div className="flex items-start gap-4">
                          <div className="w-10 h-10 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold">
                            {q.studentName ? q.studentName[0].toUpperCase() : '?'}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-1">
                              <h4 className="text-white font-bold text-sm">{q.studentName}</h4>
                              <span className="text-[10px] text-slate-500 uppercase tracking-widest">
                                {q.createdAt?.toDate ? q.createdAt.toDate().toLocaleDateString() : ''}
                              </span>
                            </div>
                            <p className="text-slate-300 text-sm leading-relaxed mb-4">{q.question}</p>
                            
                            {q.answer && q.isAnswered ? (
                              <div className="bg-[#1e293b] rounded-xl p-4 border border-white/5 relative">
                                <div className="absolute -left-2 top-4 w-4 h-4 rotate-45 bg-[#1e293b] border-l border-t border-white/5" />
                                <div className="flex items-center gap-2 mb-2">
                                  <div className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-500 flex items-center justify-center">
                                    <CheckCircle2 className="w-3 h-3" />
                                  </div>
                                  <span className="text-emerald-400 text-[10px] font-bold uppercase tracking-widest">Réponse du formateur</span>
                                </div>
                                <p className="text-slate-300 text-sm">{q.answer}</p>
                              </div>
                            ) : (
                              <div className="flex items-center gap-2 text-slate-500 text-xs">
                                <Clock className="w-3 h-3" />
                                <span>En attente d'une réponse</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

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
                  
                  <div className="pt-8 flex flex-col md:flex-row justify-center gap-4">
                    <button onClick={() => setShowQnaModal(true)} className="flex-1 py-4 bg-white/5 text-slate-300 text-sm font-bold uppercase tracking-widest rounded-xl hover:bg-white/10 border border-white/10 transition-colors flex items-center justify-center gap-2">
                      <MessageSquare className="w-4 h-4" /> Poser une question
                    </button>
                    <button onClick={() => markCompleted(activeLesson)} className="flex-1 py-4 bg-emerald-500 text-slate-950 text-sm font-bold uppercase tracking-widest rounded-xl hover:bg-emerald-400 transition-colors">
                      Marquer comme terminé
                    </button>
                  </div>
                </div>
              )}
              
            </div>
          )}
        </main>
      </div>

      {/* Avis Modal */}
      {showAvisModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setShowAvisModal(false)} />
            <div className="relative bg-[#0B0F19] border border-white/10 p-8 rounded-[2rem] w-full max-w-md shadow-2xl animate-in zoom-in-95 duration-200">
                <h3 className="text-2xl font-black text-white uppercase tracking-tight mb-2">Évaluer ce cours</h3>
                <p className="text-slate-400 text-sm mb-6">Partagez votre expérience avec les autres étudiants.</p>
                <div className="flex gap-2 mb-6">
                    {[1,2,3,4,5].map(r => (
                        <button key={r} onClick={() => setAvisRating(r)}>
                            <Star className={`w-8 h-8 ${r <= avisRating ? 'text-amber-400 fill-amber-400' : 'text-slate-700'}`} />
                        </button>
                    ))}
                </div>
                <textarea 
                    className="w-full bg-black border border-white/10 rounded-xl p-4 text-white placeholder-slate-500 min-h-[120px] focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary mb-6"
                    placeholder="Qu'avez-vous pensé de cette formation ?"
                    value={avisComment}
                    onChange={e => setAvisComment(e.target.value)}
                />
                <div className="flex gap-3">
                    <button onClick={() => setShowAvisModal(false)} className="flex-1 py-4 bg-white/5 hover:bg-white/10 text-white rounded-xl font-bold uppercase text-xs tracking-widest transition-colors">Annuler</button>
                    <button onClick={submitAvis} disabled={isSubmittingAvis || !avisComment.trim()} className="flex-[2] py-4 bg-primary hover:bg-primary/90 text-black rounded-xl font-bold uppercase text-xs tracking-widest transition-colors disabled:opacity-50">
                        {isSubmittingAvis ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : 'Publier'}
                    </button>
                </div>
            </div>
        </div>
      )}

      {/* QnA Modal */}
      {showQnaModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setShowQnaModal(false)} />
            <div className="relative bg-[#0B0F19] border border-white/10 p-8 rounded-[2rem] w-full max-w-lg shadow-2xl animate-in zoom-in-95 duration-200">
                <h3 className="text-2xl font-black text-white uppercase tracking-tight mb-2">Poser une question</h3>
                <p className="text-slate-400 text-sm mb-6">Sur la leçon : <span className="font-bold text-white">{activeLesson?.title}</span></p>
                <textarea 
                    className="w-full bg-black border border-white/10 rounded-xl p-4 text-white placeholder-slate-500 min-h-[120px] focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary mb-6"
                    placeholder="Votre question..."
                    value={qnaText}
                    onChange={e => setQnaText(e.target.value)}
                />
                <div className="flex gap-3">
                    <button onClick={() => setShowQnaModal(false)} className="flex-1 py-4 bg-white/5 hover:bg-white/10 text-white rounded-xl font-bold uppercase text-xs tracking-widest transition-colors">Annuler</button>
                    <button onClick={submitQna} disabled={isSubmittingQna || !qnaText.trim()} className="flex-[2] py-4 bg-primary hover:bg-primary/90 text-black rounded-xl font-bold uppercase text-xs tracking-widest transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
                        {isSubmittingQna ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : <><Send className="w-4 h-4" /> Envoyer</>}
                    </button>
                </div>
            </div>
        </div>
      )}

    </div>
  );
}
