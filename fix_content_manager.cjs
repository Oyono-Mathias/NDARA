const fs = require('fs');
const file = 'src/components/instructor/course-content/ContentManager.tsx';
let code = fs.readFileSync(file, 'utf8');

// Add states for editing chapter
code = code.replace(
  "const [newChapterTitle, setNewChapterTitle] = useState('');",
  "const [newChapterTitle, setNewChapterTitle] = useState('');\n  const [editingChapterId, setEditingChapterId] = useState<string | null>(null);\n  const [editingChapterTitle, setEditingChapterTitle] = useState('');"
);

// Add edit chapter handlers
code = code.replace(
  "const handleAddChapter = async () => {",
  `const handleRenameChapter = async (chapterId: string) => {
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

  const handleAddChapter = async () => {`
);

// Add icons for arrows in import
code = code.replace(
  "Settings, Trash2, FileVideo, FileText, Dumbbell, HelpCircle, FileAudio } from 'lucide-react';",
  "Settings, Trash2, FileVideo, FileText, Dumbbell, HelpCircle, FileAudio, ArrowUp, ArrowDown, Edit2, Check } from 'lucide-react';"
);

// Replace chapter rendering
code = code.replace(
  /<div className="flex items-center gap-4">\s*<GripVertical className="w-5 h-5 text-slate-500 cursor-grab" \/>\s*<h3 className="font-bold text-white">\{chapter\.title\}<\/h3>\s*<\/div>/g,
  `<div className="flex items-center gap-4">
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
                </div>`
);

// Replace lesson rendering (GripVertical)
code = code.replace(
  /<GripVertical className="w-4 h-4 text-slate-600 cursor-grab" \/>/g,
  `<div className="flex flex-col gap-1">
                        <button onClick={() => moveLesson(chapterLessons, chapterLessons.indexOf(lesson), 'up')} disabled={chapterLessons.indexOf(lesson) === 0} className="text-slate-600 hover:text-white disabled:opacity-30"><ArrowUp className="w-3 h-3" /></button>
                        <button onClick={() => moveLesson(chapterLessons, chapterLessons.indexOf(lesson), 'down')} disabled={chapterLessons.indexOf(lesson) === chapterLessons.length - 1} className="text-slate-600 hover:text-white disabled:opacity-30"><ArrowDown className="w-3 h-3" /></button>
                      </div>`
);

fs.writeFileSync(file, code);
