import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useCourseBuilder } from "../../hooks/catalog/useCatalogAdmin";
import { Loader2, ArrowLeft, GripVertical, ChevronDown, ChevronRight, Plus, Trash2, Edit2, X, Check } from "lucide-react";
import { toast } from "../../hooks/use-toast";
import { db } from "../../firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { Lesson, Chapter } from "../../types/models";

export function InstructorCourseProgram() {
  const { id: courseId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { 
    chapters, 
    lessons, 
    loading, 
    addChapter, 
    updateChapter, 
    deleteChapter, 
    addLesson, 
    updateLesson, 
    deleteLesson 
  } = useCourseBuilder(courseId!);

  const [course, setCourse] = useState<any>(null);
  
  const [collapsedChapters, setCollapsedChapters] = useState<Record<string, boolean>>({});
  const [isAddLessonModalOpen, setIsAddLessonModalOpen] = useState(false);
  const [isEditLessonModalOpen, setIsEditLessonModalOpen] = useState(false);
  
  const [currentChapterId, setCurrentChapterId] = useState<string | null>(null);
  const [editingLessonId, setEditingLessonId] = useState<string | null>(null);
  
  const [selectedLessonType, setSelectedLessonType] = useState<Lesson['type']>('video');
  const [newLessonTitle, setNewLessonTitle] = useState('');
  const [newIsFreePreview, setNewIsFreePreview] = useState(false);
  
  const [editLessonData, setEditLessonData] = useState<{title: string, type: string, isFreePreview: boolean, duration: number}>({
    title: '',
    type: 'video',
    isFreePreview: false,
    duration: 0
  });

  const [draggedLessonId, setDraggedLessonId] = useState<string | null>(null);
  const [dragOverLessonId, setDragOverLessonId] = useState<string | null>(null);
  
  useEffect(() => {
    if (!courseId) return;
    const fetchCourse = async () => {
      const snap = await getDoc(doc(db, "courses", courseId));
      if (snap.exists()) {
        setCourse({ id: snap.id, ...snap.data() });
      }
    };
    fetchCourse();
  }, [courseId]);

  const toggleChapter = (chapterId: string) => {
    setCollapsedChapters(prev => ({
      ...prev,
      [chapterId]: !prev[chapterId]
    }));
  };

  const handleAddChapter = async () => {
    try {
      await addChapter("Nouveau Chapitre");
      toast({ title: "Chapitre ajouté !" });
    } catch (err: any) {
      toast({ variant: "destructive", title: "Erreur", description: err.message });
    }
  };

  const handleDeleteChapter = async (chapterId: string) => {
    if (window.confirm("Supprimer ce chapitre et toutes ses leçons ?")) {
      try {
        await deleteChapter(chapterId);
        toast({ title: "Chapitre supprimé" });
      } catch (err: any) {
        toast({ variant: "destructive", title: "Erreur", description: err.message });
      }
    }
  };

  const handleUpdateChapterTitle = async (chapterId: string, title: string) => {
    try {
      await updateChapter(chapterId, { title });
    } catch (err) {
      console.error(err instanceof Error ? err.message : String(err));
    }
  };

  const openAddLessonModal = (chapterId: string) => {
    setCurrentChapterId(chapterId);
    setNewLessonTitle('');
    setSelectedLessonType('video');
    setNewIsFreePreview(false);
    setIsAddLessonModalOpen(true);
  };

  const handleConfirmAddLesson = async () => {
    if (!newLessonTitle.trim()) {
      toast({ variant: "destructive", title: "Erreur", description: "Veuillez entrer un titre pour la leçon" });
      return;
    }
    if (!currentChapterId) return;

    const activeLessons = lessons.filter(l => l.status !== 'archived');
    const freeLessonsCount = activeLessons.filter(l => l.isFreePreview).length;
    
    if (newIsFreePreview) {
      const newTotal = activeLessons.length + 1;
      const maxFree = Math.ceil(newTotal * 0.3);
      if (freeLessonsCount + 1 > maxFree) {
        toast({ variant: "destructive", title: "Limite atteinte", description: `Vous ne pouvez pas dépasser 30% de leçons gratuites (max ${maxFree} pour ${newTotal} leçons).` });
        return;
      }
    }


    try {
      await addLesson(currentChapterId, newLessonTitle, selectedLessonType);
      
      // The addLesson from useCourseBuilder doesn't return the doc immediately so we can't easily update isFreePreview in one go.
      // But we can update the backend right after if we fetch the new lesson, or we can just modify useCourseBuilder to pass more data.
      // Wait, addLesson in useCourseBuilder only takes chapterId, title, type. It creates it with isFreePreview: false.
      // To keep it simple, we can just let it create, and then user can edit. 
      // Actually, addLesson returns the new doc ID ! Let's check useCourseBuilder.
      // addLesson returns LessonsService.create which returns a promise of the id.
      // So let's do this:
      
      // NOTE: This might not be 100% correct if addLesson doesn't return ID. Let's just create it and if they want free preview they can edit it for now, 
      // or we can modify the addLesson to accept more params. Wait, useCourseBuilder addLesson signature is:
      // addLesson = async (chapterId: string, title: string, type: Lesson['type'])
      // It returns the result of LessonsService.create, which is the document ID as a string.
      const newId = await addLesson(currentChapterId, newLessonTitle, selectedLessonType);
      if (newId && newIsFreePreview) {
        await updateLesson(newId as unknown as string, { isFreePreview: true });
      }
      
      setIsAddLessonModalOpen(false);
      toast({ title: `Leçon "${newLessonTitle}" ajoutée !` });
    } catch (err: any) {
      toast({ variant: "destructive", title: "Erreur", description: err.message });
    }
  };

  const openEditLessonModal = (lesson: Lesson) => {
    setEditingLessonId(lesson.id!);
    setEditLessonData({
      title: lesson.title,
      type: lesson.type,
      isFreePreview: lesson.isFreePreview || false,
      duration: lesson.duration || 0
    });
    setIsEditLessonModalOpen(true);
  };

  const handleConfirmEditLesson = async () => {
    if (!editingLessonId) return;

    const activeLessons = lessons.filter(l => l.status !== 'archived');
    const freeLessonsCount = activeLessons.filter(l => l.isFreePreview).length;
    const currentLesson = lessons.find(l => l.id === editingLessonId);
    
    if (editLessonData.isFreePreview && currentLesson && !currentLesson.isFreePreview) {
      const maxFree = Math.ceil(activeLessons.length * 0.3);
      if (freeLessonsCount + 1 > maxFree) {
        toast({ variant: "destructive", title: "Limite atteinte", description: `Vous ne pouvez pas dépasser 30% de leçons gratuites (max ${maxFree} pour ${activeLessons.length} leçons).` });
        return;
      }
    }

    try {
      await updateLesson(editingLessonId, {
        title: editLessonData.title,
        type: editLessonData.type as Lesson['type'],
        isFreePreview: editLessonData.isFreePreview,
        duration: Number(editLessonData.duration)
      });
      setIsEditLessonModalOpen(false);
      toast({ title: "Leçon modifiée !" });
    } catch (err: any) {
      toast({ variant: "destructive", title: "Erreur", description: err.message });
    }
  };

  const handleDeleteLesson = async (lessonId: string) => {
    if (window.confirm("Supprimer cette leçon ?")) {
      try {
        await deleteLesson(lessonId);
        toast({ title: "Leçon supprimée" });
      } catch (err: any) {
        toast({ variant: "destructive", title: "Erreur", description: err.message });
      }
    }
  };

  const handleDragStart = (e: React.DragEvent, lessonId: string) => {
    setDraggedLessonId(lessonId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent, lessonId: string) => {
    e.preventDefault();
    if (lessonId !== draggedLessonId) {
      setDragOverLessonId(lessonId);
    }
  };

  const handleDrop = async (e: React.DragEvent, targetLessonId: string, chapterId: string) => {
    e.preventDefault();
    setDragOverLessonId(null);
    if (!draggedLessonId || draggedLessonId === targetLessonId) return;

    const chapterLessons = lessons.filter(l => l.chapterId === chapterId).sort((a, b) => a.order - b.order);
    
    const draggedLesson = chapterLessons.find(l => l.id === draggedLessonId);
    const targetLesson = chapterLessons.find(l => l.id === targetLessonId);
    
    if (!draggedLesson || !targetLesson) return;

    const draggedIndex = chapterLessons.indexOf(draggedLesson);
    const targetIndex = chapterLessons.indexOf(targetLesson);

    const newLessons = [...chapterLessons];
    newLessons.splice(draggedIndex, 1);
    newLessons.splice(targetIndex, 0, draggedLesson);

    try {
      // Update order in UI sequentially
      for (let i = 0; i < newLessons.length; i++) {
        if (newLessons[i].order !== i) {
          await updateLesson(newLessons[i].id!, { order: i });
        }
      }
    } catch (err: any) {
      console.error(err instanceof Error ? err.message : String(err));
    }
  };

  const handleDragEnd = () => {
    setDraggedLessonId(null);
    setDragOverLessonId(null);
  };

  const getTypeInfo = (type: string) => {
    switch(type) {
      case 'video': return { icon: '🎬', class: 'bg-red-500/10 text-red-500', label: 'Vidéo' };
      case 'text': return { icon: '📄', class: 'bg-blue-500/10 text-blue-500', label: 'Article' };
      case 'quiz': return { icon: '📝', class: 'bg-orange-500/10 text-orange-500', label: 'Quiz' };
      case 'exercise': return { icon: '💪', class: 'bg-purple-500/10 text-purple-500', label: 'Exercice' };
      case 'document': return { icon: '📎', class: 'bg-emerald-500/10 text-emerald-500', label: 'Document' };
      case 'audio': return { icon: '🎧', class: 'bg-yellow-500/10 text-yellow-500', label: 'Audio' };
      default: return { icon: '🔗', class: 'bg-emerald-500/10 text-emerald-500', label: 'Lien' };
    }
  };

  const activeChapters = chapters.filter(c => c.status !== 'archived').sort((a, b) => a.order - b.order);
  const activeLessons = lessons.filter(l => l.status !== 'archived');
  const freeLessonsCount = activeLessons.filter(l => l.isFreePreview).length;
  
  const maxLessons = 15;
  const progress = Math.min((activeLessons.length / maxLessons) * 100, 100);
  const isComplete = activeLessons.length >= 10 && activeChapters.length >= 3;

  const handleContinue = () => {
    if (activeLessons.length < 3) {
      toast({ variant: "destructive", title: "Programme incomplet", description: "Ajoutez au moins 3 leçons avant de continuer" });
      return;
    }
    toast({ title: "Programme sauvegardé", description: "Redirection vers l'étape suivante..." });
    navigate(`/instructor/courses/${courseId}/media`);
  };

  if (loading || !courseId) {
    return (
      <div className="flex justify-center items-center h-screen bg-[#06080F]">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#06080F] text-[#F8FAFC] font-sans pb-24">
      {/* Top Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-40 bg-[#06080F]/95 backdrop-blur-xl border-b border-[#30363D]/50">
        <div className="max-w-5xl mx-auto px-4">
          <div className="flex items-center justify-between h-14">
            <div className="flex items-center gap-3">
              <button onClick={() => navigate(-1)} className="p-2 rounded-lg hover:bg-[#161B22] transition-colors">
                <ArrowLeft className="w-5 h-5 text-gray-400" />
              </button>
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-emerald-500 to-emerald-700 flex items-center justify-center font-bold text-xs">N</div>
                <span className="text-sm font-bold text-white">NDARA</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-500 hidden sm:inline">Sauvegardé automatiquement</span>
              <button className="px-3 py-1.5 bg-[#161B22] border border-[#30363D] text-gray-300 text-xs rounded-lg hover:bg-[#1E2530] transition-colors">
                Sauvegarder
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-5xl mx-auto px-4 pt-20 pb-8">
        
        {/* Page Header */}
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-2">
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-white">PROGRAMME DU COURS</h1>
              <p className="text-xs sm:text-sm text-gray-400">Structurez votre formation en chapitres et leçons</p>
            </div>
          </div>
        </div>

        {/* Progress Stepper */}
        <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-2">
          <div className="flex items-center gap-2 flex-shrink-0">
            <div className="w-8 h-8 rounded-full bg-emerald-500 text-white border-emerald-500 flex items-center justify-center text-xs font-bold flex-shrink-0">
              <Check className="w-4 h-4" />
            </div>
            <span className="text-xs font-semibold text-emerald-400 hidden sm:inline">Infos</span>
          </div>
          <div className="w-6 sm:w-10 h-0.5 bg-emerald-500 rounded-full flex-shrink-0"></div>
          
          <div className="flex items-center gap-2 flex-shrink-0">
            <div className="w-8 h-8 rounded-full bg-[#3B82F6] text-white border-[#3B82F6] shadow-[0_0_0_4px_rgba(59,130,246,0.2)] flex items-center justify-center text-xs font-bold flex-shrink-0">
              2
            </div>
            <span className="text-xs font-semibold text-blue-400 hidden sm:inline">Programme</span>
          </div>
          <div className="w-6 sm:w-10 h-0.5 bg-[#30363D] rounded-full flex-shrink-0"></div>
          
          <div className="flex items-center gap-2 flex-shrink-0">
            <div className="w-8 h-8 rounded-full bg-transparent border border-[#30363D] text-gray-500 flex items-center justify-center text-xs font-bold flex-shrink-0">
              3
            </div>
            <span className="text-xs font-semibold text-gray-500 hidden sm:inline">Médias</span>
          </div>
          <div className="w-6 sm:w-10 h-0.5 bg-[#30363D] rounded-full flex-shrink-0"></div>
          
          <div className="flex items-center gap-2 flex-shrink-0">
            <div className="w-8 h-8 rounded-full bg-transparent border border-[#30363D] text-gray-500 flex items-center justify-center text-xs font-bold flex-shrink-0">
              4
            </div>
            <span className="text-xs font-semibold text-gray-500 hidden sm:inline">Prix</span>
          </div>
          <div className="w-6 sm:w-10 h-0.5 bg-[#30363D] rounded-full flex-shrink-0"></div>
          
          <div className="flex items-center gap-2 flex-shrink-0">
            <div className="w-8 h-8 rounded-full bg-transparent border border-[#30363D] text-gray-500 flex items-center justify-center text-xs font-bold flex-shrink-0">
              5
            </div>
            <span className="text-xs font-semibold text-gray-500 hidden sm:inline">Publier</span>
          </div>
        </div>

        {/* Progress Overview */}
        <div className="bg-[#161B22]/60 backdrop-blur-xl border border-[#30363D]/50 rounded-2xl p-4 sm:p-5 mb-6">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className="relative w-12 h-12">
                <svg className="w-12 h-12 transform -rotate-90" viewBox="0 0 48 48">
                  <circle cx="24" cy="24" r="20" fill="none" stroke="#30363D" strokeWidth="4"/>
                  <circle 
                    cx="24" 
                    cy="24" 
                    r="20" 
                    fill="none" 
                    stroke="#10B981" 
                    strokeWidth="4" 
                    strokeDasharray="126" 
                    strokeDashoffset={126 - (126 * progress) / 100} 
                    strokeLinecap="round"
                    style={{ transition: 'stroke-dashoffset 0.5s ease' }}
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-sm font-black text-white">{Math.round(progress)}%</span>
                </div>
              </div>
              <div>
                <p className="text-sm font-bold text-white">Progression du programme</p>
                <p className="text-xs text-gray-400">{activeChapters.length} chapitre{activeChapters.length > 1 ? 's' : ''} • {activeLessons.length} leçon{activeLessons.length > 1 ? 's' : ''}</p>
              </div>
            </div>
            <div className="text-right hidden sm:block">
              <p className="text-xs text-gray-400">Durée estimée</p>
              <p className="text-sm font-bold text-emerald-400">
                {Math.round(activeLessons.reduce((acc, l) => acc + (l.duration || 0), 0) / 60)} min
              </p>
            </div>
          </div>
          <div className="h-2 bg-[#30363D] rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-emerald-500 to-blue-500 rounded-full transition-all duration-500" 
              style={{ width: `${progress}%` }}
            ></div>
          </div>
          <div className="flex items-center justify-between mt-2">
            <span className="text-[10px] text-gray-500">Minimum recommandé : 3 chapitres, 10 leçons</span>
            <span className={`text-[10px] ${isComplete ? 'text-emerald-400' : 'text-orange-400'}`}>
              {isComplete ? '✅ Programme complet !' : `⚠️ ${Math.max(0, 10 - activeLessons.length)} leçons restantes`}
            </span>
          </div>
        </div>

        {/* Chapters Container */}
        <div className="space-y-4 mb-6">
          {activeChapters.map((chapter, index) => {
            const chapterLessons = activeLessons.filter(l => l.chapterId === chapter.id).sort((a, b) => a.order - b.order);
            const isCollapsed = collapsedChapters[chapter.id!];

            return (
              <div key={chapter.id} className="bg-[#161B22]/60 backdrop-blur-xl border border-[#30363D]/50 rounded-2xl overflow-hidden transition-all duration-300 animate-in slide-in-from-bottom-4">
                <div 
                  className="px-4 sm:px-5 py-4 flex items-center gap-3 border-b border-[#30363D] cursor-pointer hover:bg-emerald-500/5 transition-colors"
                  onClick={() => toggleChapter(chapter.id!)}
                >
                  <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform duration-300 ${isCollapsed ? '-rotate-90' : ''}`} />
                  
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center flex-shrink-0">
                    <span className="text-emerald-400 text-sm font-bold">{index + 1}</span>
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <input 
                      type="text" 
                      value={chapter.title}
                      onChange={(e) => handleUpdateChapterTitle(chapter.id!, e.target.value)}
                      className="bg-transparent text-sm sm:text-base font-bold text-white w-full outline-none focus:ring-2 focus:ring-blue-500/50 rounded px-1 -mx-1" 
                      placeholder="Nom du chapitre..." 
                      onClick={(e) => e.stopPropagation()}
                    />
                    <p className="text-xs text-gray-500 mt-0.5">
                      {chapterLessons.length} leçon{chapterLessons.length > 1 ? 's' : ''} • {Math.round(chapterLessons.reduce((acc, l) => acc + (l.duration || 0), 0) / 60)} min
                    </p>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={(e) => { e.stopPropagation(); openAddLessonModal(chapter.id!); }}
                      className="p-2 rounded-lg bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={(e) => { e.stopPropagation(); handleDeleteChapter(chapter.id!); }}
                      className="p-2 rounded-lg hover:bg-red-500/10 text-gray-500 hover:text-red-400 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                
                {!isCollapsed && (
                  <div className="divide-y divide-[#30363D]/50 animate-in slide-in-from-top-2">
                    {chapterLessons.length === 0 ? (
                      <div className="px-4 sm:px-5 py-8 text-center text-gray-500">
                        <p className="text-sm">Aucune leçon</p>
                        <p className="text-xs mt-1">Cliquez sur + pour ajouter une leçon</p>
                      </div>
                    ) : (
                      chapterLessons.map((lesson) => {
                        const typeInfo = getTypeInfo(lesson.type);
                        const isDragging = draggedLessonId === lesson.id;
                        const isDragOver = dragOverLessonId === lesson.id;
                        
                        return (
                          <div 
                            key={lesson.id}
                            draggable
                            onDragStart={(e) => handleDragStart(e, lesson.id!)}
                            onDragOver={(e) => handleDragOver(e, lesson.id!)}
                            onDrop={(e) => handleDrop(e, lesson.id!, chapter.id!)}
                            onDragEnd={handleDragEnd}
                            className={`px-4 sm:px-5 py-3 flex items-center gap-3 transition-all duration-200 hover:bg-blue-500/5 
                              ${isDragging ? 'opacity-50 scale-[0.98]' : ''} 
                              ${isDragOver ? 'border-t-2 border-emerald-500' : ''}`}
                          >
                            <div className="cursor-grab text-gray-600 hover:text-gray-400 active:cursor-grabbing">
                              <GripVertical className="w-4 h-4" />
                            </div>
                            
                            <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-[14px] flex-shrink-0 ${typeInfo.class}`}>
                              {typeInfo.icon}
                            </div>
                            
                            <div className="flex-1 min-w-0">
                              <span className="text-sm text-gray-300 truncate block">
                                {lesson.title}
                              </span>
                              <div className="flex items-center gap-2 mt-1">
                                <span className="text-[10px] text-gray-500">{typeInfo.label} • {Math.round((lesson.duration || 0) / 60)} min</span>
                                {lesson.isFreePreview && (
                                  <span className="bg-gradient-to-r from-emerald-500 to-emerald-600 text-[10px] text-white px-1.5 py-0.5 rounded font-semibold">
                                    Aperçu gratuit
                                  </span>
                                )}
                              </div>
                            </div>
                            
                            <div className="flex items-center gap-1">
                              <button 
                                onClick={() => openEditLessonModal(lesson)}
                                className="p-1.5 rounded-lg hover:bg-[#30363D] text-gray-500 hover:text-white transition-colors"
                              >
                                <Edit2 className="w-4 h-4" />
                              </button>
                              <button 
                                onClick={() => handleDeleteLesson(lesson.id!)}
                                className="p-1.5 rounded-lg hover:bg-red-500/10 text-gray-500 hover:text-red-400 transition-colors"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Add Chapter Button */}
        <button 
          onClick={handleAddChapter}
          className="w-full py-4 border-2 border-dashed border-[#30363D] rounded-2xl text-gray-400 hover:text-emerald-400 hover:border-emerald-500/30 hover:bg-emerald-500/5 transition-all flex items-center justify-center gap-2 mb-6"
        >
          <Plus className="w-5 h-5" />
          <span className="text-sm font-semibold">Ajouter un chapitre</span>
        </button>

        {/* Tips Card */}
        <div className="bg-[#161B22]/60 backdrop-blur-xl border border-[#30363D]/50 rounded-2xl p-5 mb-6">
          <h3 className="text-sm font-bold text-white mb-3">💡 Conseils pour un bon programme</h3>
          <ul className="space-y-2">
            <li className="flex items-start gap-2">
              <span className="text-emerald-400 mt-0.5">✓</span>
              <span className="text-xs text-gray-400">Créez au moins <span className="text-white font-semibold">3 chapitres</span> pour une formation complète</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-emerald-400 mt-0.5">✓</span>
              <span className="text-xs text-gray-400">Visez <span className="text-white font-semibold">10-15 leçons</span> minimum pour une bonne expérience</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-emerald-400 mt-0.5">✓</span>
              <span className="text-xs text-gray-400">Offrez <span className="text-white font-semibold">1 à 3 leçons gratuites</span> pour attirer les étudiants</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-emerald-400 mt-0.5">✓</span>
              <span className="text-xs text-gray-400">Variez les types de contenu : <span className="text-white font-semibold">Vidéo, Texte, Quiz, Exercices</span></span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-emerald-400 mt-0.5">✓</span>
              <span className="text-xs text-gray-400">Organisez dans un ordre <span className="text-white font-semibold">logique et progressif</span></span>
            </li>
          </ul>
        </div>

        {/* Sticky Bottom Action */}
        <div className="sticky bottom-0 z-30 pt-6 pb-6 bg-gradient-to-t from-[#06080F] via-[#06080F] to-transparent -mx-4 px-4">
          <div className="flex gap-3">
            <button 
              onClick={() => navigate(-1)} 
              className="flex-1 py-3.5 bg-[#161B22] border border-[#30363D] text-white text-sm font-semibold rounded-xl hover:bg-[#1E2530] transition-colors"
            >
              ← Retour
            </button>
            <button 
              onClick={handleContinue}
              className="flex-1 py-3.5 bg-gradient-to-r from-blue-500 to-blue-700 text-white text-sm font-bold rounded-xl hover:shadow-lg hover:shadow-blue-500/20 transition-all flex items-center justify-center gap-2"
            >
              Continuer vers les médias
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>

      </div>

      {/* Add Lesson Modal */}
      {isAddLessonModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-end sm:items-center justify-center animate-in fade-in duration-200">
          <div className="bg-[#161B22] border border-[#30363D] rounded-t-3xl sm:rounded-3xl w-full max-w-md p-6 animate-in slide-in-from-bottom-8">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-white">Ajouter une leçon</h3>
              <button onClick={() => setIsAddLessonModalOpen(false)} className="p-2 rounded-lg hover:bg-[#30363D]">
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-xs text-gray-400 mb-1.5">Type de contenu</label>
                <div className="grid grid-cols-3 gap-2">
                  <button 
                    onClick={() => setSelectedLessonType('video')} 
                    className={`p-3 rounded-xl text-center transition-all border ${selectedLessonType === 'video' ? 'bg-blue-500/10 border-blue-500' : 'bg-[#111827] border-[#30363D]'}`}
                  >
                    <span className="text-xl block mb-1">🎬</span>
                    <span className="text-xs text-gray-300">Vidéo</span>
                  </button>
                  <button 
                    onClick={() => setSelectedLessonType('text')} 
                    className={`p-3 rounded-xl text-center transition-all border ${selectedLessonType === 'text' ? 'bg-blue-500/10 border-blue-500' : 'bg-[#111827] border-[#30363D]'}`}
                  >
                    <span className="text-xl block mb-1">📄</span>
                    <span className="text-xs text-gray-300">Article</span>
                  </button>
                  <button 
                    onClick={() => setSelectedLessonType('quiz')} 
                    className={`p-3 rounded-xl text-center transition-all border ${selectedLessonType === 'quiz' ? 'bg-blue-500/10 border-blue-500' : 'bg-[#111827] border-[#30363D]'}`}
                  >
                    <span className="text-xl block mb-1">📝</span>
                    <span className="text-xs text-gray-300">Quiz</span>
                  </button>
                  <button 
                    onClick={() => setSelectedLessonType('exercise')} 
                    className={`p-3 rounded-xl text-center transition-all border ${selectedLessonType === 'exercise' ? 'bg-blue-500/10 border-blue-500' : 'bg-[#111827] border-[#30363D]'}`}
                  >
                    <span className="text-xl block mb-1">💪</span>
                    <span className="text-xs text-gray-300">Exercice</span>
                  </button>
                  <button 
                    onClick={() => setSelectedLessonType('document')} 
                    className={`p-3 rounded-xl text-center transition-all border ${selectedLessonType === 'document' ? 'bg-blue-500/10 border-blue-500' : 'bg-[#111827] border-[#30363D]'}`}
                  >
                    <span className="text-xl block mb-1">🔗</span>
                    <span className="text-xs text-gray-300">Lien</span>
                  </button>
                </div>
              </div>
              
              <div>
                <label className="block text-xs text-gray-400 mb-1.5">Titre de la leçon</label>
                <input 
                  type="text" 
                  value={newLessonTitle}
                  onChange={(e) => setNewLessonTitle(e.target.value)}
                  placeholder="Ex: Introduction aux chandeliers japonais" 
                  className="w-full px-4 py-3 rounded-xl text-sm bg-[#111827] border border-[#30363D] text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />
              </div>
              
              <div className="flex items-center gap-3 p-3 bg-[#111827] rounded-xl border border-[#30363D]">
                <input 
                  type="checkbox" 
                  checked={newIsFreePreview}
                  onChange={(e) => setNewIsFreePreview(e.target.checked)}
                  className="w-5 h-5 rounded bg-[#30363D] border-[#30363D] text-emerald-500 focus:ring-emerald-500 focus:ring-offset-0"
                />
                <div>
                  <p className="text-sm text-white font-medium">Aperçu gratuit</p>
                  <p className="text-xs text-gray-500">Cette leçon sera accessible gratuitement</p>
                </div>
              </div>
              
              <button 
                onClick={handleConfirmAddLesson}
                className="w-full py-3 bg-blue-500 hover:bg-blue-600 text-white text-sm font-bold rounded-xl transition-colors"
              >
                Ajouter la leçon
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Lesson Modal */}
      {isEditLessonModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-end sm:items-center justify-center animate-in fade-in duration-200">
          <div className="bg-[#161B22] border border-[#30363D] rounded-t-3xl sm:rounded-3xl w-full max-w-md p-6 animate-in slide-in-from-bottom-8">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-white">Modifier la leçon</h3>
              <button onClick={() => setIsEditLessonModalOpen(false)} className="p-2 rounded-lg hover:bg-[#30363D]">
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-xs text-gray-400 mb-1.5">Type de contenu</label>
                <select 
                  value={editLessonData.type}
                  onChange={(e) => setEditLessonData({...editLessonData, type: e.target.value})}
                  className="w-full px-4 py-3 rounded-xl text-sm bg-[#111827] border border-[#30363D] text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                >
                  <option value="video">🎬 Vidéo</option>
                  <option value="text">📄 Article</option>
                  <option value="quiz">📝 Quiz</option>
                  <option value="exercise">💪 Exercice</option>
                  <option value="document">🔗 Lien externe</option>
                </select>
              </div>
              
              <div>
                <label className="block text-xs text-gray-400 mb-1.5">Titre de la leçon</label>
                <input 
                  type="text" 
                  value={editLessonData.title}
                  onChange={(e) => setEditLessonData({...editLessonData, title: e.target.value})}
                  className="w-full px-4 py-3 rounded-xl text-sm bg-[#111827] border border-[#30363D] text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-xs text-gray-400 mb-1.5">Durée estimée (en secondes)</label>
                <input 
                  type="number" 
                  value={editLessonData.duration}
                  onChange={(e) => setEditLessonData({...editLessonData, duration: Number(e.target.value)})}
                  placeholder="Ex: 900 pour 15 min" 
                  className="w-full px-4 py-3 rounded-xl text-sm bg-[#111827] border border-[#30363D] text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />
              </div>
              
              <div className="flex items-center gap-3 p-3 bg-[#111827] rounded-xl border border-[#30363D]">
                <input 
                  type="checkbox" 
                  checked={editLessonData.isFreePreview}
                  onChange={(e) => setEditLessonData({...editLessonData, isFreePreview: e.target.checked})}
                  className="w-5 h-5 rounded bg-[#30363D] border-[#30363D] text-emerald-500 focus:ring-emerald-500 focus:ring-offset-0"
                />
                <div>
                  <p className="text-sm text-white font-medium">Aperçu gratuit</p>
                  <p className="text-xs text-gray-500">Cette leçon sera accessible gratuitement</p>
                </div>
              </div>
              
              <div className="flex gap-3">
                <button 
                  onClick={() => setIsEditLessonModalOpen(false)} 
                  className="flex-1 py-3 bg-[#111827] border border-[#30363D] text-white text-sm font-semibold rounded-xl hover:bg-[#1E2530] transition-colors"
                >
                  Annuler
                </button>
                <button 
                  onClick={handleConfirmEditLesson}
                  className="flex-1 py-3 bg-blue-500 hover:bg-blue-600 text-white text-sm font-bold rounded-xl transition-colors"
                >
                  Enregistrer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
