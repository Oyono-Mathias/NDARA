import { useState } from 'react';
import { useCourseBuilder } from '../../../hooks/catalog/useCatalogAdmin';
import { Loader2, Plus, GripVertical, Settings, Trash2, FileVideo, FileText, Dumbbell, HelpCircle, FileAudio, ArrowUp, ArrowDown, Edit2, Check } from 'lucide-react';
import { toast } from '../../../hooks/use-toast';
import { LessonEditor } from './LessonEditor';
import { Lesson } from '../../../types/models';
import { TouchArea } from '../../ui/TouchArea';

export function ContentManager({ courseId }: { courseId: string }) {
  const { chapters, lessons, loading, addChapter, updateChapter, deleteChapter, addLesson, deleteLesson } = useCourseBuilder(courseId);
  const [newChapterTitle, setNewChapterTitle] = useState('');
  const [editingChapterId, setEditingChapterId] = useState<string | null>(null);
  const [editingChapterTitle, setEditingChapterTitle] = useState('');
  const [editingLesson, setEditingLesson] = useState<Lesson | null>(null);

  const handleRenameChapter = async (chapterId: string) => {
    if (!editingChapterTitle.trim()) {
      setEditingChapterId(null);
      return;
    }
    try {
      await updateChapter(chapterId, { title: editingChapterTitle });
      setEditingChapterId(null);
      toast({ title: 'Chapitre renommé' });
    } catch (err: any) {
      toast({ variant: 'destructive', title: 'Erreur', description: "Impossible de renommer: " + err.message });
    }
  };

  const moveChapter = async (index: number, direction: 'up' | 'down') => {
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= activeChapters.length) return;
    
    const chaptersToUpdate = [...activeChapters];
    const temp = chaptersToUpdate[index];
    chaptersToUpdate[index] = chaptersToUpdate[newIndex];
    chaptersToUpdate[newIndex] = temp;
    
    // Update all orders sequentially
    chaptersToUpdate.forEach(async (chap, i) => {
      if (chap.order !== i) {
        await updateChapter(chap.id!, { order: i });
      }
    });
  };

  const moveLesson = async (chapterLessons: Lesson[], index: number, direction: 'up' | 'down') => {
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= chapterLessons.length) return;
    
    const lessonsToUpdate = [...chapterLessons];
    const temp = lessonsToUpdate[index];
    lessonsToUpdate[index] = lessonsToUpdate[newIndex];
    lessonsToUpdate[newIndex] = temp;
    
    // Update all orders sequentially
    lessonsToUpdate.forEach(async (less, i) => {
      if (less.order !== i) {
        await updateLesson(less.id!, { order: i });
      }
    });
  };

  const handleAddChapter = async () => {
    if (!newChapterTitle.trim()) return;
    try {
      await addChapter(newChapterTitle);
      setNewChapterTitle('');
    } catch (err: any) {
      console.error(err instanceof Error ? err.message : String(err));
      toast({ variant: 'destructive', title: 'Erreur', description: "Impossible d'ajouter le chapitre: " + err.message });
    }
  };

  const activeChapters = chapters.filter(c => c.status !== 'archived').sort((a,b) => a.order - b.order);

  if (loading) return <div className="py-12 flex justify-center"><Loader2 className="w-8 h-8 animate-spin text-emerald-500" /></div>;

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {editingLesson && (
        <LessonEditor lesson={editingLesson} onClose={() => setEditingLesson(null)} />
      )}
      
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
                  <div className="flex flex-col gap-1">
                    <button onClick={() => moveChapter(activeChapters.indexOf(chapter), 'up')} disabled={activeChapters.indexOf(chapter) === 0} className="text-slate-500 hover:text-white disabled:opacity-30"><ArrowUp className="w-4 h-4" /></button>
                    <button onClick={() => moveChapter(activeChapters.indexOf(chapter), 'down')} disabled={activeChapters.indexOf(chapter) === activeChapters.length - 1} className="text-slate-500 hover:text-white disabled:opacity-30"><ArrowDown className="w-4 h-4" /></button>
                  </div>
                  {editingChapterId === chapter.id ? (
                    <div className="flex items-center gap-2">
                      <input type="text" value={editingChapterTitle} onChange={e => setEditingChapterTitle(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleRenameChapter(chapter.id!)} className="bg-slate-900 border border-white/10 rounded px-2 py-1 text-white text-sm outline-none" autoFocus />
                      <button onClick={() => handleRenameChapter(chapter.id!)} className="text-emerald-500 hover:text-emerald-400"><Check className="w-4 h-4" /></button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 group/title">
                      <h3 className="font-bold text-white">{chapter.title}</h3>
                      <button onClick={() => { setEditingChapterId(chapter.id!); setEditingChapterTitle(chapter.title); }} className="text-slate-500 opacity-0 group-hover/title:opacity-100 hover:text-white transition-opacity"><Edit2 className="w-3 h-3" /></button>
                    </div>
                  )}
                </div>
                
                <div className="flex items-center gap-2">
                  <div className="relative group/menu">
                    <button className="px-3 py-1.5 bg-emerald-500/10 text-emerald-500 rounded-lg text-xs font-bold uppercase tracking-widest hover:bg-emerald-500/20">
                      + Leçon
                    </button>
                    <div className="absolute right-0 top-full mt-2 w-48 bg-slate-800 rounded-xl shadow-xl border border-white/10 hidden group-hover/menu:block z-50 overflow-hidden">
                      <button onClick={() => addLesson(chapter.id, 'Nouvelle Vidéo', 'video')} className="w-full text-left px-4 py-2 text-sm text-slate-300 hover:bg-white/5 hover:text-white flex items-center gap-2"><FileVideo className="w-4 h-4"/> Vidéo</button>
                      <button onClick={() => addLesson(chapter.id, 'Nouveau Texte', 'text')} className="w-full text-left px-4 py-2 text-sm text-slate-300 hover:bg-white/5 hover:text-white flex items-center gap-2"><FileText className="w-4 h-4"/> Texte</button>
                      <button onClick={() => addLesson(chapter.id, 'Nouveau Document', 'document')} className="w-full text-left px-4 py-2 text-sm text-slate-300 hover:bg-white/5 hover:text-white flex items-center gap-2"><FileText className="w-4 h-4"/> Document / PDF</button>
                      <button onClick={() => addLesson(chapter.id, 'Nouveau Quiz', 'quiz')} className="w-full text-left px-4 py-2 text-sm text-slate-300 hover:bg-white/5 hover:text-white flex items-center gap-2"><HelpCircle className="w-4 h-4"/> Quiz</button>
                    </div>
                  </div>
                  <button onClick={() => deleteChapter(chapter.id!)} className="p-1.5 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              
              <div className="divide-y divide-white/5 p-2">
                {chapterLessons.map(lesson => (
                  <div key={lesson.id} className="flex items-center justify-between p-3 hover:bg-white/5 rounded-xl group transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="flex flex-col gap-1">
                        <button onClick={() => moveLesson(chapterLessons, chapterLessons.indexOf(lesson), 'up')} disabled={chapterLessons.indexOf(lesson) === 0} className="text-slate-600 hover:text-white disabled:opacity-30"><ArrowUp className="w-3 h-3" /></button>
                        <button onClick={() => moveLesson(chapterLessons, chapterLessons.indexOf(lesson), 'down')} disabled={chapterLessons.indexOf(lesson) === chapterLessons.length - 1} className="text-slate-600 hover:text-white disabled:opacity-30"><ArrowDown className="w-3 h-3" /></button>
                      </div>
                      <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center">
                        {lesson.type === 'video' ? <FileVideo className="w-4 h-4 text-blue-400" /> : 
                         lesson.type === 'quiz' ? <HelpCircle className="w-4 h-4 text-amber-400" /> : 
                         lesson.type === 'document' ? <FileText className="w-4 h-4 text-amber-500" /> : 
                         lesson.type === 'exercise' ? <Dumbbell className="w-4 h-4 text-emerald-400" /> : 
                         lesson.type === 'audio' ? <FileAudio className="w-4 h-4 text-purple-400" /> : 
                         <FileText className="w-4 h-4 text-slate-400" />}
                      </div>
                      <div className="flex flex-col">
                        <span className="font-bold text-sm text-slate-300 group-hover:text-white transition-colors flex items-center gap-2">
                          {lesson.title}
                          {lesson.isFreePreview && <span className="px-1.5 py-0.5 bg-emerald-500/20 text-emerald-500 text-[9px] uppercase tracking-widest rounded">Aperçu Gratuit</span>}
                        </span>
                        <span className="text-[10px] text-slate-500 uppercase tracking-wider">{lesson.type}</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <button onClick={() => setEditingLesson(lesson)} className="p-2 text-slate-500 hover:text-white bg-slate-900 rounded-lg">
                        <Settings className="w-4 h-4" />
                      </button>
                      <button onClick={() => deleteLesson(lesson.id!)} className="p-2 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
                
                {chapterLessons.length === 0 && (
                  <div className="p-4 text-center text-slate-500 text-sm">Aucune leçon dans ce chapitre</div>
                )}
              </div>
            </div>
          );
        })}
        {activeChapters.length === 0 && (
          <div className="p-12 text-center text-slate-500 border border-dashed border-white/10 rounded-3xl">
            Commencez par ajouter un chapitre à votre formation.
          </div>
        )}
      </div>
    </div>
  );
}
