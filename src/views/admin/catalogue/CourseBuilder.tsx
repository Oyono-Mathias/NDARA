import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useCourseBuilder, useCoursesAdmin, useCategoriesAdmin } from '../../../hooks/catalog/useCatalogAdmin';
import { TouchArea } from '../../../components/ui/TouchArea';
import { Loader2, ArrowLeft, Save, Plus, GripVertical, FileVideo, FileText, HelpCircle, Dumbbell, Settings, FileAudio } from 'lucide-react';

export function CourseBuilder() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const isNew = courseId === 'new';
  
  const { courses, addCourse, updateCourse } = useCoursesAdmin();
  const { categories } = useCategoriesAdmin();
  
  const currentCourse = courses.find(c => c.id === courseId);
  
  const [activeTab, setActiveTab] = useState<'details' | 'curriculum'>('details');
  const [isSaving, setIsSaving] = useState(false);

  // Detail States
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [shortDesc, setShortDesc] = useState('');
  const [fullDesc, setFullDesc] = useState('');
  const [price, setPrice] = useState(0);
  const [isFree, setIsFree] = useState(true);
  const [level, setLevel] = useState<'beginner' | 'intermediate' | 'advanced' | 'all'>('all');
  const [language, setLanguage] = useState('fr');
  const [categoryId, setCategoryId] = useState('');
  
  useEffect(() => {
    if (currentCourse && !isNew) {
      setTitle(currentCourse.title);
      setSlug(currentCourse.slug);
      setShortDesc(currentCourse.shortDescription);
      setFullDesc(currentCourse.fullDescription);
      setPrice(currentCourse.price);
      setIsFree(currentCourse.isFree);
      setLevel(currentCourse.level);
      setLanguage(currentCourse.language);
      setCategoryId(currentCourse.categoryId);
    }
  }, [currentCourse, isNew]);

  const handleSaveDetails = async () => {
    setIsSaving(true);
    try {
      const data = {
        title, slug, shortDescription: shortDesc, fullDescription: fullDesc,
        price: isFree ? 0 : price, isFree, level, language, categoryId,
        instructorId: 'admin', // Should be current user auth ID
        thumbnail: '', tags: [], objectives: [], prerequisites: [], skillsAcquired: []
      };
      
      if (isNew) {
        const docRef = await addCourse(data);
        navigate(`/admin/catalog/courses/${docRef.id}/builder`, { replace: true });
      } else {
        await updateCourse(courseId!, data);
      }
    } catch(e) {
      console.error(e);
    }
    setIsSaving(false);
  };

  if (!isNew && !currentCourse) return <div className="p-8 text-center"><Loader2 className="w-8 h-8 animate-spin mx-auto text-emerald-500" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/admin/catalog')} className="p-2 text-slate-400 hover:text-white bg-white/5 rounded-xl">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h2 className="text-xl font-bold text-white">{isNew ? 'Nouvelle Formation' : title}</h2>
        </div>
        
        <TouchArea as="button" onClick={handleSaveDetails} disabled={isSaving} className="px-6 py-2 bg-emerald-500 text-slate-950 font-bold uppercase tracking-widest text-xs rounded-xl flex items-center gap-2 disabled:opacity-50">
          {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          Enregistrer
        </TouchArea>
      </div>

      <div className="flex border-b border-white/10">
        <button onClick={() => setActiveTab('details')} className={`px-4 py-3 font-bold text-sm tracking-wider uppercase border-b-2 transition-colors ${activeTab === 'details' ? 'border-emerald-500 text-emerald-500' : 'border-transparent text-slate-400'}`}>Détails</button>
        {!isNew && <button onClick={() => setActiveTab('curriculum')} className={`px-4 py-3 font-bold text-sm tracking-wider uppercase border-b-2 transition-colors ${activeTab === 'curriculum' ? 'border-emerald-500 text-emerald-500' : 'border-transparent text-slate-400'}`}>Programme</button>}
      </div>

      {activeTab === 'details' && (
        <div className="grid grid-cols-3 gap-8">
          <div className="col-span-2 space-y-6">
            <div className="bg-white/5 p-6 rounded-3xl border border-white/10 space-y-4">
              <h3 className="font-bold text-white border-b border-white/10 pb-2">Informations Générales</h3>
              
              <div>
                <label className="text-xs font-bold text-slate-400 mb-1 block">Titre</label>
                <input type="text" value={title} onChange={e => setTitle(e.target.value)} className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-emerald-500 outline-none" />
              </div>
              
              <div>
                <label className="text-xs font-bold text-slate-400 mb-1 block">Slug (URL)</label>
                <input type="text" value={slug} onChange={e => setSlug(e.target.value)} className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-emerald-500 outline-none" />
              </div>
              
              <div>
                <label className="text-xs font-bold text-slate-400 mb-1 block">Description Courte</label>
                <textarea value={shortDesc} onChange={e => setShortDesc(e.target.value)} rows={3} className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-emerald-500 outline-none resize-none" />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-400 mb-1 block">Description Complète</label>
                <textarea value={fullDesc} onChange={e => setFullDesc(e.target.value)} rows={6} className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-emerald-500 outline-none resize-none" />
              </div>
            </div>
          </div>
          
          <div className="col-span-1 space-y-6">
            <div className="bg-white/5 p-6 rounded-3xl border border-white/10 space-y-4">
              <h3 className="font-bold text-white border-b border-white/10 pb-2">Paramètres</h3>
              
              <div>
                <label className="text-xs font-bold text-slate-400 mb-1 block">Catégorie</label>
                <select value={categoryId} onChange={e => setCategoryId(e.target.value)} className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-emerald-500 outline-none">
                  <option value="">Sélectionner</option>
                  {categories.filter(c => c.status !== 'archived').map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-400 mb-1 block">Niveau</label>
                <select value={level} onChange={e => setLevel(e.target.value as any)} className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-emerald-500 outline-none">
                  <option value="all">Tous niveaux</option>
                  <option value="beginner">Débutant</option>
                  <option value="intermediate">Intermédiaire</option>
                  <option value="advanced">Avancé</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-400 mb-1 block">Tarification</label>
                <div className="flex gap-4 mb-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="radio" checked={isFree} onChange={() => setIsFree(true)} className="accent-emerald-500" />
                    <span className="text-sm font-bold text-white">Gratuit</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="radio" checked={!isFree} onChange={() => setIsFree(false)} className="accent-emerald-500" />
                    <span className="text-sm font-bold text-white">Payant</span>
                  </label>
                </div>
                {!isFree && (
                  <input type="number" value={price} onChange={e => setPrice(Number(e.target.value))} placeholder="Prix en FCFA" className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-emerald-500 outline-none" />
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'curriculum' && !isNew && (
        <CurriculumBuilder courseId={courseId!} />
      )}
    </div>
  );
}

function CurriculumBuilder({ courseId }: { courseId: string }) {
  const { chapters, lessons, loading, addChapter, updateChapter, deleteChapter, addLesson } = useCourseBuilder(courseId);
  const [newChapterTitle, setNewChapterTitle] = useState('');

  const handleAddChapter = async () => {
    if (!newChapterTitle) return;
    await addChapter(newChapterTitle);
    setNewChapterTitle('');
  };

  const activeChapters = chapters.filter(c => c.status !== 'archived').sort((a,b) => a.order - b.order);

  if (loading) return <div className="py-12 flex justify-center"><Loader2 className="w-8 h-8 animate-spin text-emerald-500" /></div>;

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      
      <div className="flex gap-2">
        <input 
          type="text" 
          placeholder="Titre du nouveau chapitre..." 
          value={newChapterTitle}
          onChange={e => setNewChapterTitle(e.target.value)}
          className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-emerald-500 outline-none" 
        />
        <TouchArea as="button" onClick={handleAddChapter} className="px-6 bg-white/10 text-white font-bold uppercase tracking-widest text-xs rounded-xl flex items-center gap-2 hover:bg-white/20 transition-colors">
          <Plus className="w-4 h-4" /> Ajouter un chapitre
        </TouchArea>
      </div>

      <div className="space-y-4">
        {activeChapters.map(chapter => {
          const chapterLessons = lessons.filter(l => l.chapterId === chapter.id && l.status !== 'archived').sort((a,b) => a.order - b.order);
          return (
            <div key={chapter.id} className="bg-white/5 border border-white/10 rounded-3xl overflow-hidden">
              <div className="p-4 bg-white/5 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <GripVertical className="w-5 h-5 text-slate-500 cursor-grab" />
                  <h3 className="font-bold text-white">{chapter.title}</h3>
                </div>
                <div className="relative group/menu">
                  <button className="px-3 py-1.5 bg-emerald-500/10 text-emerald-500 rounded-lg text-xs font-bold uppercase tracking-widest hover:bg-emerald-500/20">
                    + Leçon
                  </button>
                  <div className="absolute right-0 top-full mt-2 w-48 bg-slate-800 rounded-xl shadow-xl border border-white/10 hidden group-hover/menu:block z-50 overflow-hidden">
                    <button onClick={() => addLesson(chapter.id, 'Nouvelle Vidéo', 'video')} className="w-full text-left px-4 py-2 text-sm text-slate-300 hover:bg-white/5 hover:text-white flex items-center gap-2"><FileVideo className="w-4 h-4"/> Vidéo</button>
                    <button onClick={() => addLesson(chapter.id, 'Nouveau Texte', 'text')} className="w-full text-left px-4 py-2 text-sm text-slate-300 hover:bg-white/5 hover:text-white flex items-center gap-2"><FileText className="w-4 h-4"/> Texte & Images</button>
                    <button onClick={() => addLesson(chapter.id, 'Nouveau Quiz', 'quiz')} className="w-full text-left px-4 py-2 text-sm text-slate-300 hover:bg-white/5 hover:text-white flex items-center gap-2"><HelpCircle className="w-4 h-4"/> Quiz</button>
                    <button onClick={() => addLesson(chapter.id, 'Nouvel Exercice', 'exercise')} className="w-full text-left px-4 py-2 text-sm text-slate-300 hover:bg-white/5 hover:text-white flex items-center gap-2"><Dumbbell className="w-4 h-4"/> Exercice</button>
                  </div>
                </div>
              </div>
              
              <div className="divide-y divide-white/5 p-2">
                {chapterLessons.map(lesson => (
                  <div key={lesson.id} className="flex items-center justify-between p-3 hover:bg-white/5 rounded-xl group transition-colors">
                    <div className="flex items-center gap-4">
                      <GripVertical className="w-4 h-4 text-slate-600 cursor-grab" />
                      <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center">
                        {lesson.type === 'video' ? <FileVideo className="w-4 h-4 text-blue-400" /> : 
                         lesson.type === 'quiz' ? <HelpCircle className="w-4 h-4 text-amber-400" /> :
                         lesson.type === 'exercise' ? <Dumbbell className="w-4 h-4 text-emerald-400" /> :
                         lesson.type === 'audio' ? <FileAudio className="w-4 h-4 text-purple-400" /> :
                         <FileText className="w-4 h-4 text-slate-400" />}
                      </div>
                      <span className="font-bold text-sm text-slate-300 group-hover:text-white transition-colors">{lesson.title}</span>
                    </div>
                    <button className="p-2 text-slate-500 hover:text-white bg-slate-900 rounded-lg">
                      <Settings className="w-4 h-4" />
                    </button>
                  </div>
                ))}
                {chapterLessons.length === 0 && (
                  <div className="p-4 text-center text-slate-500 text-sm">Aucune leçon dans ce chapitre</div>
                )}
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
}
