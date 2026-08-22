import { useState, useEffect } from 'react';
import { Lesson } from '../../../types/models';
import { LessonsService } from '../../../services/db';
import { Loader2, Video, FileText, HelpCircle, Save } from 'lucide-react';
import { toast } from '../../../hooks/use-toast';

export function LessonEditor({ lesson, onClose }: { lesson: Lesson, onClose: () => void }) {
  const [title, setTitle] = useState(lesson.title);
  const [type, setType] = useState<Lesson['type']>(lesson.type || 'video');
  const [content, setContent] = useState(lesson.content || '');
  const [videoUrl, setVideoUrl] = useState(lesson.videoUrl || '');
  const [documentUrl, setDocumentUrl] = useState(lesson.documentUrl || '');
  const [description, setDescription] = useState(lesson.description || '');
  const [duration, setDuration] = useState(lesson.duration || 0);
  const [isFreePreview, setIsFreePreview] = useState(lesson.isFreePreview || false);
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await LessonsService.update(lesson.id!, {
        title,
        type,
        content,
        videoUrl,
        documentUrl,
        description,
        duration: Number(duration) || 0,
        isFreePreview
      });
      toast({ title: 'Leçon mise à jour' });
      onClose();
    } catch (e) {
      toast({ variant: 'destructive', title: 'Erreur de sauvegarde' });
    }
    setIsSaving(false);
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-white/10 rounded-3xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="p-6 border-b border-white/10 flex justify-between items-center">
          <h3 className="text-xl font-bold text-white">Éditer la leçon</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-white">Fermer</button>
        </div>
        
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          <div>
            <label className="text-sm font-bold text-slate-400 mb-2 block">Titre de la leçon</label>
            <input type="text" value={title} onChange={e => setTitle(e.target.value)} className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-3 text-white" />
          </div>

          <div className="grid grid-cols-4 gap-4">
            <button onClick={() => setType('video')} className={`p-4 rounded-xl border flex flex-col items-center gap-2 transition-colors ${type === 'video' ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-500' : 'bg-slate-950 border-white/5 text-slate-400'}`}>
              <Video className="w-6 h-6" /> <span className="text-xs font-bold uppercase">Vidéo</span>
            </button>
            <button onClick={() => setType('text')} className={`p-4 rounded-xl border flex flex-col items-center gap-2 transition-colors ${type === 'text' ? 'bg-blue-500/20 border-blue-500/50 text-blue-500' : 'bg-slate-950 border-white/5 text-slate-400'}`}>
              <FileText className="w-6 h-6" /> <span className="text-xs font-bold uppercase">Texte</span>
            </button>
            <button onClick={() => setType('document')} className={`p-4 rounded-xl border flex flex-col items-center gap-2 transition-colors ${type === 'document' ? 'bg-amber-500/20 border-amber-500/50 text-amber-500' : 'bg-slate-950 border-white/5 text-slate-400'}`}>
              <FileText className="w-6 h-6" /> <span className="text-xs font-bold uppercase">Document</span>
            </button>
            <button onClick={() => setType('quiz')} className={`p-4 rounded-xl border flex flex-col items-center gap-2 transition-colors ${type === 'quiz' ? 'bg-purple-500/20 border-purple-500/50 text-purple-500' : 'bg-slate-950 border-white/5 text-slate-400'}`}>
              <HelpCircle className="w-6 h-6" /> <span className="text-xs font-bold uppercase">Quiz</span>
            </button>
          </div>

          {type === 'video' && (
            <div>
              <label className="text-sm font-bold text-slate-400 mb-2 block">URL de la vidéo (Bunny, YouTube, etc.)</label>
              <input type="text" value={videoUrl} onChange={e => setVideoUrl(e.target.value)} placeholder="https://..." className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-3 text-white" />
            </div>
          )}

          {type === 'document' && (
            <div>
              <label className="text-sm font-bold text-slate-400 mb-2 block">URL du document (PDF, etc.)</label>
              <input type="text" value={documentUrl} onChange={e => setDocumentUrl(e.target.value)} placeholder="https://..." className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-3 text-white" />
            </div>
          )}

          
          {type === 'quiz' && (
            <div className="space-y-4">
              <div className="bg-orange-500/10 border border-orange-500/20 text-orange-400 p-4 rounded-xl text-sm leading-relaxed">
                <strong>Format du Quiz :</strong> Entrez les questions au format JSON ou texte libre structuré dans le contenu.
              </div>
              <div>
                <label className="text-sm font-bold text-slate-400 mb-2 block">Contenu du Quiz (Questions/Réponses)</label>
                <textarea value={content} onChange={e => setContent(e.target.value)} rows={8} placeholder={`[
  {
    "question": "Quelle est la capitale ?",
    "options": ["Paris", "Londres"],
    "correct": 0
  }
]`} className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-3 text-white font-mono text-xs resize-none" />
              </div>
            </div>
          )}

          {type === 'text' && (
            <div>
              <label className="text-sm font-bold text-slate-400 mb-2 block">Contenu textuel de la leçon</label>
              <textarea value={content} onChange={e => setContent(e.target.value)} rows={6} className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-3 text-white resize-none" />
            </div>
          )}
          {type === 'video' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-bold text-slate-400 mb-2 block">Description courte</label>
                <textarea value={description} onChange={e => setDescription(e.target.value)} rows={3} className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-3 text-white resize-none" />
              </div>
              <div>
                <label className="text-sm font-bold text-slate-400 mb-2 block">Durée (en secondes)</label>
                <input type="number" min="0" value={duration} onChange={e => setDuration(Number(e.target.value))} className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-3 text-white" />
              </div>
            </div>
          )}

          <div className="flex items-center gap-3">
            <input type="checkbox" id="freePreview" checked={isFreePreview} onChange={e => setIsFreePreview(e.target.checked)} className="w-5 h-5 accent-emerald-500 rounded" />
            <label htmlFor="freePreview" className="text-sm font-bold text-white cursor-pointer">Aperçu gratuit (accessible sans achat)</label>
          </div>

        </div>

        <div className="p-6 border-t border-white/10 flex justify-end gap-4 bg-white/5">
          <button onClick={onClose} className="px-6 py-3 font-bold text-white hover:bg-white/5 rounded-xl">Annuler</button>
          <button onClick={handleSave} disabled={isSaving} className="px-6 py-3 bg-emerald-500 text-slate-950 font-bold rounded-xl flex items-center gap-2 hover:bg-emerald-400 disabled:opacity-50">
            {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Enregistrer
          </button>
        </div>
      </div>
    </div>
  );
}
