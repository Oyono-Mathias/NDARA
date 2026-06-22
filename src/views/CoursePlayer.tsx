import { useState, useEffect, useRef } from "react";
import { useParams, Link, useNavigate, Navigate } from "react-router-dom";
import { db } from "../firebase";
import { collection, query, where, onSnapshot, doc, updateDoc, getDoc, addDoc, serverTimestamp, deleteDoc } from "firebase/firestore";
import { VideoPlayer } from "../components/ui/VideoPlayer";
import { ArrowLeft, Download, List, Clock, FileText, CheckCircle, StickyNote, Share2, PlayCircle, Lock, Home, Compass, BookOpen, User, X, Check, Loader2 } from "lucide-react";
import { useRole } from "../context/RoleContext";
import { downloadVideoForOffline } from "../lib/offlineSync";
import { isVideoOffline, saveVideoOfflineState, removeVideoOffline } from "../lib/offlineStorage";

export function CoursePlayer() {
  const { slug } = useParams<{slug: string}>();
  const navigate = useNavigate();
  const { currentUser, loading: authLoading } = useRole();
  
  const [course, setCourse] = useState<any>(null);
  const [enrollment, setEnrollment] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  const [activeModule, setActiveModule] = useState<number>(0);
  const [activeLesson, setActiveLesson] = useState<number>(0);
  
  const [isUpdatingProgress, setIsUpdatingProgress] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  
  // UI states corresponding to HTML template
  const [isCurriculumOpen, setIsCurriculumOpen] = useState(false);
  const [isNotesOpen, setIsNotesOpen] = useState(false);
  const [isDownloadModalOpen, setIsDownloadModalOpen] = useState(false);
  
  // Notes state
  const [lessonNote, setLessonNote] = useState("");
  const [savedNotes, setSavedNotes] = useState<any[]>([]);
  
  // Offline
  const [downloadStatus, setDownloadStatus] = useState<'idle' | 'downloading' | 'completed'>('idle');
  const [downloadProgress, setDownloadProgress] = useState(0);

  useEffect(() => {
    if (!slug) return;
    
    const courseRef = doc(db, "courses", slug);
    getDoc(courseRef).then(docSnap => {
        if (docSnap.exists()) {
            const courseData = { id: docSnap.id, ...docSnap.data() };
            setCourse(courseData);
            
            if (currentUser?.uid) {
                const q = query(
                    collection(db, "enrollments"),
                    where("studentId", "==", currentUser.uid),
                    where("courseId", "==", courseData.id)
                );
                const unsub = onSnapshot(q, (snap) => {
                    if (!snap.empty) {
                        setEnrollment({ id: snap.docs[0].id, ...snap.docs[0].data() });
                    } else {
                        setEnrollment(null);
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
    }).catch(err => {
        console.error(err);
        setLoading(false);
    });
  }, [slug, currentUser?.uid]);

  const content = course?.content || [];
  const currentModuleData = content[activeModule];
  const currentLessonData = currentModuleData?.lessons?.[activeLesson];

  // Load offline status
  useEffect(() => {
    if (currentLessonData?.videoUrl) {
      const parts = currentLessonData.videoUrl.split('/').filter(Boolean);
      const videoId = parts[parts.length - 1];
      if (isVideoOffline(videoId)) {
        setDownloadStatus('completed');
      } else {
        setDownloadStatus('idle');
      }
    } else {
      setDownloadStatus('idle');
    }
  }, [currentLessonData?.videoUrl]);

  // Load User Notes for the specific lesson
  useEffect(() => {
    if (currentUser?.uid && course?.id && currentLessonData?.id) {
       const lessonIdStr = currentLessonData.id || `m${activeModule}_l${activeLesson}`;
       const qNotes = query(collection(db, "course_notes"), 
         where("studentId", "==", currentUser.uid),
         where("courseId", "==", course.id),
         where("lessonId", "==", lessonIdStr)
       );
       const unsub = onSnapshot(qNotes, snap => {
           const n: any[] = [];
           snap.forEach(d => n.push({ id: d.id, ...d.data() }));
           setSavedNotes(n.sort((a,b) => b.createdAt - a.createdAt));
       });
       return () => unsub();
    }
  }, [currentUser?.uid, course?.id, currentLessonData?.id, activeModule, activeLesson]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(""), 2500);
  };

  const handleDownload = async () => {
    setIsDownloadModalOpen(false);
    if (downloadStatus === 'idle') {
      try {
        setDownloadStatus('downloading');
        setDownloadProgress(0);
        showToast('Téléchargement en cours...');
        
        let videoId = currentLessonData?.videoUrl;
        
        if (currentLessonData?.provider !== 'bunny') {
            await new Promise(resolve => setTimeout(resolve, 1500));
            showToast("Mode hors-ligne non disponible pour cette source.");
            setDownloadStatus('idle');
            return;
        }

        if (videoId) {
            let cdnHostname = import.meta.env.VITE_BUNNY_STREAM_CDN_HOSTNAME || "vz-a8b9c7d6.b-cdn.net";
            if (videoId.startsWith('http')) {
                try {
                    const urlObj = new URL(videoId);
                    cdnHostname = urlObj.hostname;
                } catch(e) {}
            }
            if (videoId.includes('playlist.m3u8')) {
                const parts = videoId.split('/').filter(Boolean);
                videoId = parts[parts.length - 2];
            } else if (videoId.includes('/')) {
                const parts = videoId.split('/').filter(Boolean);
                videoId = parts[parts.length - 1];
            }
            
            
            await downloadVideoForOffline(videoId, cdnHostname, (progress) => {
                setDownloadProgress(progress);
            });
            
            saveVideoOfflineState({
              videoId,
              courseId: course.id,
              courseTitle: course.title,
              lessonId: currentLessonData.id || `m${activeModule}_l${activeLesson}`,
              lessonTitle: currentLessonData.title,
              downloadedAt: Date.now()
            });

            setDownloadStatus('completed');
            showToast('Téléchargement terminé !');
        } else {
            console.error("Aucune URL de vidéo valide.");
            setDownloadStatus('idle');
        }
      } catch (e) {
        console.error("Échec du téléchargement", e);
        setDownloadStatus('idle');
        showToast('Échec du téléchargement.');
      }
    }
  };

  const saveNote = async () => {
    if (!lessonNote.trim() || !currentUser?.uid || !course?.id) return;
    try {
        const lessonIdStr = currentLessonData?.id || `m${activeModule}_l${activeLesson}`;
        await addDoc(collection(db, "course_notes"), {
            courseId: course.id,
            lessonId: lessonIdStr,
            studentId: currentUser.uid,
            text: lessonNote,
            createdAt: serverTimestamp()
        });
        setLessonNote("");
        showToast('Note enregistrée');
    } catch(e) {
        console.error(e);
        showToast('Erreur lors de l\'enregistrement');
    }
  };

  const deleteNote = async (id: string) => {
      try {
          await deleteDoc(doc(db, "course_notes", id));
          showToast('Note supprimée');
      } catch(e) {
          console.error(e);
      }
  };

  const toggleLessonComplete = async () => {
      if (!course || isUpdatingProgress) return;
      setIsUpdatingProgress(true);
      
      try {
          let totalLessons = 0;
          content.forEach((m: any) => totalLessons += (m.lessons?.length || 0));
          if (totalLessons === 0) return;
          
          let currentCompleted = enrollment?.completedLessons || [];
          const lessonId = currentLessonData.id || `m${activeModule}_l${activeLesson}`;
          
          let actionMessage = 'Leçon terminée !';
          if (currentCompleted.includes(lessonId)) {
              currentCompleted = currentCompleted.filter((l: string) => l !== lessonId);
              actionMessage = 'Leçon marquée comme non lue';
          } else {
              currentCompleted.push(lessonId);
          }
          
          const newProgress = Math.round((currentCompleted.length / totalLessons) * 100);
          const isFinished = newProgress >= 100;
          
          if (enrollment) {
              await updateDoc(doc(db, 'enrollments', enrollment.id), {
                  completedLessons: currentCompleted,
                  progress: newProgress,
                  isEligibleForCertificate: isFinished,
                  completedAt: isFinished ? new Date() : null
              });
          } else {
              await addDoc(collection(db, 'enrollments'), {
                  studentId: currentUser?.uid,
                  courseId: course.id,
                  enrolledAt: serverTimestamp(),
                  completedLessons: currentCompleted,
                  progress: newProgress,
                  isEligibleForCertificate: isFinished,
                  completedAt: isFinished ? new Date() : null
              });
          }
          showToast(actionMessage);
      } catch (error) {
          console.error("Error updating progress:", error);
          showToast('Erreur.');
      } finally {
          setIsUpdatingProgress(false);
      }
  };

  // Find next lesson
  const getNextLesson = () => {
     if (!content || content.length === 0) return null;
     if (activeLesson + 1 < currentModuleData.lessons.length) {
         return { mIdx: activeModule, lIdx: activeLesson + 1, lesson: currentModuleData.lessons[activeLesson + 1] };
     } else if (activeModule + 1 < content.length && content[activeModule + 1].lessons?.length > 0) {
         return { mIdx: activeModule + 1, lIdx: 0, lesson: content[activeModule + 1].lessons[0] };
     }
     return null;
  };
  const nextL = getNextLesson();

  const playLesson = (mIdx: number, lIdx: number) => {
      setActiveModule(mIdx);
      setActiveLesson(lIdx);
      setIsCurriculumOpen(false);
      showToast('Chargement de la leçon...');
  };

  if (authLoading || loading) {
     return <div className="fixed inset-0 z-[100] bg-gray-50 flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-orange-500" /></div>;
  }

  if (!currentUser) {
     return <Navigate to="/auth" replace />;
  }

  if (!course) {
     return <div className="fixed inset-0 z-[100] bg-gray-50 flex items-center justify-center text-gray-800">Cours introuvable.</div>;
  }

  const completedLessons = enrollment?.completedLessons || [];
  const lessonIdStr = currentLessonData?.id || `m${activeModule}_l${activeLesson}`;
  const isCurrentComplete = completedLessons.includes(lessonIdStr);

  return (
    <div className="fixed inset-0 z-[100] bg-gray-50 text-gray-800 flex flex-col font-sans overflow-hidden">
        
        {/* Top Bar */}
        <header className="bg-white shadow-sm shrink-0 z-40 sticky top-0" style={{ paddingTop: 'env(safe-area-inset-top)' }}>
            <div className="flex items-center justify-between px-4 py-3">
                <div className="flex items-center gap-3 overflow-hidden flex-1">
                    <button onClick={() => navigate(-1)} className="w-10 h-10 rounded-full hover:bg-gray-100 flex items-center justify-center transition shrink-0">
                        <ArrowLeft className="w-5 h-5 text-gray-600" />
                    </button>
                    <div className="flex-1 min-w-0">
                        <h1 className="font-bold text-slate-800 text-sm truncate font-serif">{course.title}</h1>
                        <p className="text-xs text-gray-500 truncate">Section {activeModule + 1} • Leçon {activeLesson + 1}/{currentModuleData?.lessons?.length || 0}</p>
                    </div>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                    <button onClick={() => setIsDownloadModalOpen(true)} className="w-10 h-10 rounded-full hover:bg-gray-100 flex items-center justify-center transition relative">
                        <Download className="w-5 h-5 text-gray-600" />
                        {downloadStatus === 'completed' && <div className="absolute top-2 right-2 w-2 h-2 bg-emerald-500 rounded-full border border-white"></div>}
                    </button>
                    <button onClick={() => setIsCurriculumOpen(true)} className="w-10 h-10 rounded-full hover:bg-gray-100 flex items-center justify-center transition">
                        <List className="w-5 h-5 text-gray-600" />
                    </button>
                </div>
            </div>
            
            {/* Progress Bar */}
            <div className="h-1 bg-gray-200">
                <div className="h-full bg-orange-500 transition-all duration-300" style={{ width: `${enrollment?.progress || 0}%` }}></div>
            </div>
        </header>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto pb-20 scrollbar-hide">
            {/* Video Player */}
            <div className="relative w-full bg-black aspect-video flex items-center justify-center group">
                {currentLessonData?.videoUrl ? (
                    <VideoPlayer 
                        src={currentLessonData.videoUrl} 
                        provider={currentLessonData.provider}
                        className="w-full h-full object-contain bg-black"
                        poster={course.thumbnail}
                    />
                ) : (
                    <>
                        <img src={course.thumbnail || "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&q=80"} alt="Video cover" className="absolute inset-0 w-full h-full object-cover opacity-80" />
                        <button className="absolute w-16 h-16 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center shadow-lg hover:bg-white/30 transition z-10">
                            <PlayCircle className="text-white w-10 h-10" />
                        </button>
                    </>
                )}
            </div>

            {/* Lesson Info */}
            <div className="bg-white px-4 py-4 border-b border-gray-100">
                <h2 className="font-bold text-slate-800 text-lg mb-2">{currentLessonData?.title || 'Leçon sans titre'}</h2>
                <div className="flex items-center gap-4 text-sm text-gray-500">
                    <span className="flex items-center"><Clock className="w-4 h-4 mr-1" /> {currentLessonData?.duration || '00:00'}</span>
                    {currentLessonData?.resources && currentLessonData.resources.length > 0 && (
                        <span className="flex items-center"><FileText className="w-4 h-4 mr-1" /> Ressources ({currentLessonData.resources.length})</span>
                    )}
                </div>
                
                {/* Action Buttons */}
                <div className="flex gap-2 mt-4">
                    <button 
                        onClick={toggleLessonComplete} 
                        disabled={isUpdatingProgress}
                        className={`flex-1 font-medium py-2.5 rounded-lg flex items-center justify-center gap-2 transition ${isCurrentComplete ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                    >
                        {isUpdatingProgress ? <Loader2 className="w-4 h-4 animate-spin" /> : isCurrentComplete ? <CheckCircle className="w-4 h-4" /> : <Check className="w-4 h-4" />}
                        <span className="text-sm">{isCurrentComplete ? 'Terminé' : 'Marquer lu'}</span>
                    </button>
                    <button 
                        onClick={() => setIsNotesOpen(!isNotesOpen)}
                        className={`flex-1 font-medium py-2.5 rounded-lg flex items-center justify-center gap-2 transition ${isNotesOpen ? 'bg-orange-500 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                    >
                        <StickyNote className="w-4 h-4" />
                        <span className="text-sm">Notes</span>
                    </button>
                    {/* Share mock button */}
                    <button className="flex-1 bg-gray-100 text-gray-700 font-medium py-2.5 rounded-lg flex items-center justify-center gap-2 hover:bg-gray-200 transition">
                        <Share2 className="w-4 h-4" />
                        <span className="text-sm">Partager</span>
                    </button>
                </div>
            </div>

            {/* Course Content Preview */}
            <div className="bg-white mt-2 px-4 py-4 border-t border-gray-100">
                <h3 className="font-bold text-slate-800 mb-3">À propos de cette leçon</h3>
                <p className="text-gray-600 text-sm leading-relaxed whitespace-pre-line">
                    {currentLessonData?.description || "Aucune description détaillée n'a été fournie pour cette leçon."}
                </p>
                
                {/* Resources */}
                {currentLessonData?.resources?.length > 0 && (
                    <div className="mt-5 space-y-2">
                        <h4 className="font-medium text-slate-800 text-sm mb-3">Ressources téléchargeables</h4>
                        
                        {currentLessonData.resources.map((res: any, idx: number) => (
                            <a key={idx} href={res.url || '#'} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition border border-gray-100">
                                <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center text-orange-600 shrink-0">
                                    <FileText className="w-5 h-5" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="font-medium text-sm text-gray-800 truncate">{res.title || `Document ${idx+1}`}</p>
                                    <p className="text-xs text-gray-500">{res.size || 'PDF'}</p>
                                </div>
                                <Download className="w-4 h-4 text-gray-400 shrink-0" />
                            </a>
                        ))}
                    </div>
                )}
            </div>

            {/* Notes Section */}
            {isNotesOpen && (
                <div className="bg-white mt-2 px-4 py-4 border-t border-gray-100 animate-in slide-in-from-top-2">
                    <h3 className="font-bold text-slate-800 mb-3 font-serif">Vos Notes</h3>
                    <textarea 
                        value={lessonNote}
                        onChange={(e) => setLessonNote(e.target.value)}
                        className="w-full p-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 resize-none bg-gray-50" 
                        rows={4} 
                        placeholder="Prenez des notes sur cette leçon..."
                    />
                    <button 
                        onClick={saveNote}
                        disabled={!lessonNote.trim()}
                        className="mt-3 w-full bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white font-medium py-2.5 rounded-lg transition"
                    >
                        Enregistrer la note
                    </button>
                    
                    {/* Saved Notes */}
                    <div className="mt-4 space-y-3">
                        {savedNotes.map((note) => (
                            <div key={note.id} className="p-3 bg-orange-50/50 rounded-lg border border-orange-100 relative group">
                                <p className="text-xs text-orange-600 mb-1">
                                    {note.createdAt?.toDate ? new Date(note.createdAt.toDate()).toLocaleDateString() : 'Maintenant'}
                                </p>
                                <p className="text-sm text-gray-700">{note.text}</p>
                                <button onClick={() => deleteNote(note.id)} className="absolute top-2 right-2 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition">
                                    <X className="w-4 h-4" />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Next Lesson Preview */}
            {nextL && (
                <div className="bg-white mt-2 px-4 py-4 border-t border-gray-100">
                    <h3 className="font-bold text-slate-800 mb-3 font-serif">Leçon Suivante</h3>
                    <div className="flex gap-4 cursor-pointer group" onClick={() => playLesson(nextL.mIdx, nextL.lIdx)}>
                        <div className="w-24 h-16 flex-shrink-0 bg-gray-200 rounded-lg overflow-hidden relative">
                            {course.thumbnail ? (
                                <img src={course.thumbnail} alt="" className="w-full h-full object-cover group-hover:scale-105 transition duration-500" />
                            ) : (
                                <div className="w-full h-full bg-slate-200 flex items-center justify-center">
                                    <PlayCircle className="w-6 h-6 text-slate-400" />
                                </div>
                            )}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="font-medium text-slate-800 text-sm truncate group-hover:text-orange-500 transition">{nextL.lesson.title}</p>
                            <p className="text-xs text-gray-500 mt-1 truncate">Section {nextL.mIdx + 1} • Leçon {nextL.lIdx + 1}</p>
                            <p className="text-xs text-gray-500 mt-1 flex items-center"><Clock className="w-3 h-3 mr-1" /> {nextL.lesson.duration || '--'} </p>
                        </div>
                        <button className="self-center w-10 h-10 shrink-0 bg-orange-500 rounded-full flex items-center justify-center text-white group-hover:bg-orange-600 transition">
                            <PlayCircle className="w-5 h-5 fill-current ml-0.5" />
                        </button>
                    </div>
                </div>
            )}
        </div>

        {/* Bottom Navigation */}
        <nav className="absolute inset-x-0 bottom-0 bg-white border-t border-gray-200 z-40" style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>
            <div className="flex justify-around items-center">
                <Link to="/student" className="flex flex-col items-center gap-1 px-4 py-3 text-gray-400 hover:text-gray-600">
                    <Home className="w-5 h-5" />
                    <span className="text-[10px] font-medium">Accueil</span>
                </Link>
                <Link to="/student/search" className="flex flex-col items-center gap-1 px-4 py-3 text-gray-400 hover:text-gray-600">
                    <Compass className="w-5 h-5" />
                    <span className="text-[10px] font-medium">Explorer</span>
                </Link>
                <Link to="/student/courses" className="flex flex-col items-center gap-1 px-4 py-3 text-orange-500 relative">
                    <BookOpen className="w-5 h-5" />
                    <span className="text-[10px] font-medium">Mes Cours</span>
                    <span className="absolute top-3 right-3 w-2 h-2 bg-red-500 rounded-full"></span>
                </Link>
                <Link to="/student/profile" className="flex flex-col items-center gap-1 px-4 py-3 text-gray-400 hover:text-gray-600">
                    <User className="w-5 h-5" />
                    <span className="text-[10px] font-medium">Profil</span>
                </Link>
            </div>
        </nav>

        {/* Curriculum Panel (Slide-in right) */}
        {isCurriculumOpen && (
            <>
                <div className="fixed inset-0 bg-black/50 z-[150] transition-opacity" onClick={() => setIsCurriculumOpen(false)} />
                <div className="fixed inset-y-0 right-0 w-full max-w-sm bg-white z-[151] flex flex-col animate-in slide-in-from-right duration-300 shadow-2xl">
                    <div className="shrink-0 bg-white border-b border-gray-100 px-4 py-4 flex items-center justify-between shadow-sm z-10" style={{ paddingTop: 'calc(env(safe-area-inset-top) + 16px)' }}>
                        <h2 className="font-bold text-slate-800 text-lg font-serif">Programme du Cours</h2>
                        <button onClick={() => setIsCurriculumOpen(false)} className="w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center text-gray-500 transition">
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                    
                    <div className="flex-1 overflow-y-auto pb-20 scrollbar-hide">
                        {/* Course Progress Header */}
                        <div className="px-4 py-4 bg-gray-50 border-b border-gray-100">
                            <div className="flex justify-between text-sm mb-2">
                                <span className="text-gray-600 font-medium">Progression</span>
                                <span className="font-bold text-orange-500">{enrollment?.progress || 0}%</span>
                            </div>
                            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                                <div className="h-full bg-orange-500 rounded-full" style={{ width: `${enrollment?.progress || 0}%` }}></div>
                            </div>
                            <p className="text-xs text-gray-500 mt-2">{completedLessons.length} leçons terminées</p>
                        </div>
                        
                        {/* Sections */}
                        <div className="py-2">
                            {content.map((mod: any, mIdx: number) => {
                                const modLessons = mod.lessons || [];
                                const modCompleteCount = modLessons.filter((l:any, i:number) => completedLessons.includes(l.id || `m${mIdx}_l${i}`)).length;
                                
                                return (
                                    <div key={mod.id || mIdx} className="border-b border-gray-100">
                                        <div className="px-4 py-3 bg-gray-50 flex justify-between items-center sticky top-0 z-[5]">
                                            <h3 className="font-bold text-slate-800 text-sm">Section {mIdx + 1}: {mod.title}</h3>
                                            <span className="text-xs text-gray-500 font-medium">{modCompleteCount}/{modLessons.length} {modCompleteCount === modLessons.length && modLessons.length > 0 && '✓'}</span>
                                        </div>
                                        <div className="divide-y divide-gray-50">
                                            {modLessons.map((les: any, lIdx: number) => {
                                                const isActive = activeModule === mIdx && activeLesson === lIdx;
                                                const isCompleted = completedLessons.includes(les.id || `m${mIdx}_l${lIdx}`);
                                                
                                                return (
                                                    <div 
                                                        key={les.id || lIdx} 
                                                        onClick={() => playLesson(mIdx, lIdx)}
                                                        className={`px-4 py-4 flex items-center gap-3 cursor-pointer transition ${isActive ? 'bg-orange-50/50 border-l-[3px] border-orange-500' : 'border-l-[3px] border-transparent hover:bg-gray-50'}`}
                                                    >
                                                        <div className="shrink-0 flex items-center justify-center w-5 h-5">
                                                            {isActive ? (
                                                                <PlayCircle className="text-orange-500 w-5 h-5" />
                                                            ) : isCompleted ? (
                                                                <CheckCircle className="text-emerald-500 w-5 h-5" />
                                                            ) : (
                                                                <div className="w-4 h-4 rounded-full border-2 border-gray-300" />
                                                            )}
                                                        </div>
                                                        
                                                        <div className="flex-1 min-w-0">
                                                            <p className={`text-sm truncate ${isActive ? 'font-medium text-slate-900' : isCompleted ? 'text-slate-800' : 'text-slate-600'}`}>{les.title || 'Leçon sans titre'}</p>
                                                            <p className="text-xs text-gray-400 mt-0.5">{les.duration || ''}</p>
                                                        </div>
                                                        
                                                        {/* Lock Icon mock condition */}
                                                        {!enrollment && !isCompleted && !isActive && (
                                                            <Lock className="w-3 h-3 text-gray-300 ml-2 shrink-0" />
                                                        )}
                                                    </div>
                                                );
                                            })}
                                            {modLessons.length === 0 && (
                                                <p className="px-4 py-3 text-xs text-gray-400 italic">Aucune leçon</p>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </>
        )}

        {/* Download Modal */}
        {isDownloadModalOpen && (
            <>
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[200] flex items-center justify-center p-4 transition-opacity animate-in fade-in" onClick={() => setIsDownloadModalOpen(false)}>
                    <div className="bg-white rounded-2xl p-6 w-full max-w-sm relative shadow-xl animate-in zoom-in-95" onClick={e => e.stopPropagation()}>
                        <div className="text-center">
                            <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-emerald-100">
                                <Download className="text-emerald-500 w-8 h-8" />
                            </div>
                            <h3 className="font-bold text-slate-800 text-lg mb-2">Télécharger pour hors-ligne</h3>
                            <p className="text-gray-500 text-sm mb-6 leading-relaxed">Cette leçon sera stockée en toute sécurité de manière chiffrée sur votre appareil. L'application gérera l'espace disponible.</p>
                            
                            <div className="flex gap-3">
                                <button onClick={() => setIsDownloadModalOpen(false)} className="flex-1 py-3 border border-gray-200 rounded-xl font-medium text-gray-700 hover:bg-gray-50 transition">Annuler</button>
                                <button 
                                    onClick={handleDownload} 
                                    disabled={downloadStatus === 'downloading' || !currentLessonData?.videoUrl}
                                    className="flex-1 py-3 bg-orange-500 disabled:opacity-50 text-white rounded-xl font-medium hover:bg-orange-600 transition"
                                >
                                    {downloadStatus === 'downloading' ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : 'Télécharger'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </>
        )}

        {/* Toast Notification */}
        <div className={`fixed top-[15%] left-1/2 transform -translate-x-1/2 bg-slate-900 text-white px-6 py-3 rounded-full shadow-[0_10px_30px_rgba(0,0,0,0.2)] z-[300] transition-all duration-300 pointer-events-none flex items-center gap-2 ${toastMessage ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 -translate-y-4 scale-95'}`}>
            <CheckCircle className="w-4 h-4 text-emerald-400" />
            <span className="text-sm font-medium whitespace-nowrap">{toastMessage}</span>
        </div>
        
    </div>
  );
}
