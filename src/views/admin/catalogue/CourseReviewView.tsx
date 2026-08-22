import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useCourseBuilder, useCoursesAdmin } from '../../../hooks/catalog/useCatalogAdmin';
import { TouchArea } from '../../../components/ui/TouchArea';
import { Loader2, ArrowLeft, CheckCircle, XCircle, FileVideo, FileText, HelpCircle, Dumbbell, PlayCircle } from 'lucide-react';
import { db } from '../../../firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { toast } from '../../../hooks/use-toast';
import { NotificationsService } from '../../../services/db';

export function CourseReviewView() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const { courses, updateCourse } = useCoursesAdmin();
  const { chapters, lessons, loading } = useCourseBuilder(courseId!);
  
  const course = courses.find(c => c.id === courseId);
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [activeLesson, setActiveLesson] = useState<any>(null);

  if (!course) return <div className="p-8 text-center"><Loader2 className="w-8 h-8 animate-spin mx-auto text-emerald-500" /></div>;

  const logModerationAction = async (action: string, newStatus: string, reason: string = '') => {
    try {
      await addDoc(collection(db, 'moderation_logs'), {
        courseId: course.id,
        action,
        previousStatus: course.status,
        newStatus,
        reason,
        timestamp: serverTimestamp()
      });
      
      // Notify instructor
      await NotificationsService.create({
        userId: course.instructorId,
        title: action === 'Approuver' ? 'Formation publiée !' : 'Formation rejetée',
        message: action === 'Approuver' 
          ? `Votre formation "${course.title}" a été approuvée et publiée.` 
          : `Votre formation "${course.title}" a été rejetée. Motif: ${reason}`,
        type: 'course_status',
        read: false
      } as any);

    } catch (e) {
      console.error(e instanceof Error ? e.message : String(e));
    }
  };

  const handleApprove = async () => {
    setIsSubmitting(true);
    try {
      await updateCourse(course.id!, { 
        status: 'published',
        reviewedAt: serverTimestamp()
      });
      await logModerationAction('Approuver', 'published');
      toast({ title: 'Formation publiée avec succès' });
      navigate('/admin/catalog');
    } catch (e) {
      toast({ variant: 'destructive', title: 'Erreur lors de la publication' });
    }
    setIsSubmitting(false);
  };

  const handleReject = async () => {
    if (!rejectReason.trim()) {
      toast({ variant: 'destructive', title: 'Veuillez indiquer un motif' });
      return;
    }
    setIsSubmitting(true);
    try {
      await updateCourse(course.id!, { 
        status: 'rejected',
        rejectionReason: rejectReason,
        reviewedAt: serverTimestamp()
      });
      await logModerationAction('Rejeter', 'rejected', rejectReason);
      toast({ title: 'Formation rejetée' });
      navigate('/admin/catalog');
    } catch (e) {
      toast({ variant: 'destructive', title: 'Erreur lors du rejet' });
    }
    setIsSubmitting(false);
  };

  const activeChapters = chapters.filter(c => c.status !== 'archived').sort((a,b) => a.order - b.order);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <TouchArea as="button" onClick={() => navigate('/admin/catalog')} className="p-2 text-slate-400 hover:text-white bg-white/5 rounded-xl">
            <ArrowLeft className="w-5 h-5" />
          </TouchArea>
          <div>
            <h1 className="text-2xl font-black uppercase tracking-widest text-white">Modération: {course.title}</h1>
            <p className="text-sm text-slate-400">Statut: <span className="font-bold text-white">{course.status}</span></p>
          </div>
        </div>

        {course.status === 'pending_review' && (
          <div className="flex gap-2">
            <button onClick={() => setShowRejectModal(true)} disabled={isSubmitting} className="px-4 py-2 bg-red-500/10 text-red-500 font-bold uppercase tracking-widest text-xs rounded-xl flex items-center gap-2 hover:bg-red-500/20">
              <XCircle className="w-4 h-4" /> Rejeter
            </button>
            <button onClick={handleApprove} disabled={isSubmitting} className="px-4 py-2 bg-emerald-500 text-slate-950 font-bold uppercase tracking-widest text-xs rounded-xl flex items-center gap-2 hover:bg-emerald-400">
              <CheckCircle className="w-4 h-4" /> Approuver
            </button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          {activeChapters.map((chapter, index) => {
            const chapterLessons = lessons.filter(l => l.chapterId === chapter.id && l.status !== 'archived').sort((a,b) => a.order - b.order);
            return (
              <div key={chapter.id} className="bg-white/5 border border-white/10 rounded-3xl overflow-hidden">
                <div className="p-4 bg-white/5 border-b border-white/5">
                  <h3 className="font-bold text-white">Chapitre {index + 1}: {chapter.title}</h3>
                </div>
                <div className="divide-y divide-white/5 p-2">
                  {chapterLessons.map(lesson => (
                    <div key={lesson.id} onClick={() => setActiveLesson(lesson)} className={`flex items-center gap-4 p-3 rounded-xl cursor-pointer transition-colors ${activeLesson?.id === lesson.id ? 'bg-emerald-500/20' : 'hover:bg-white/5'}`}>
                      <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center shrink-0">
                        {lesson.type === 'video' ? <FileVideo className="w-4 h-4 text-blue-400" /> : 
                         lesson.type === 'quiz' ? <HelpCircle className="w-4 h-4 text-amber-400" /> : 
                         lesson.type === 'document' ? <FileText className="w-4 h-4 text-amber-500" /> : 
                         <FileText className="w-4 h-4 text-slate-400" />}
                      </div>
                      <div className="flex-1">
                        <span className="font-bold text-sm text-slate-300 group-hover:text-white block">{lesson.title}</span>
                        <span className="text-[10px] text-slate-500 uppercase tracking-wider">{lesson.type}</span>
                      </div>
                      {lesson.isFreePreview && <span className="px-1.5 py-0.5 bg-emerald-500/20 text-emerald-500 text-[9px] uppercase tracking-widest rounded">Aperçu</span>}
                    </div>
                  ))}
                  {chapterLessons.length === 0 && <div className="p-4 text-center text-slate-500 text-sm">Aucune leçon</div>}
                </div>
              </div>
            );
          })}
        </div>

        <div className="space-y-6">
          <div className="bg-white/5 p-6 rounded-3xl border border-white/10">
            <h3 className="font-bold text-white mb-4">Aperçu du contenu</h3>
            {activeLesson ? (
              <div className="space-y-4">
                <h4 className="font-bold text-lg text-emerald-400">{activeLesson.title}</h4>
                <div className="text-sm text-slate-300 bg-black/20 p-4 rounded-xl border border-white/5 break-words">
                  {activeLesson.type === 'video' && (
                    <div className="space-y-2">
                      <div className="aspect-video bg-black rounded-lg flex items-center justify-center">
                        <PlayCircle className="w-12 h-12 text-slate-600" />
                      </div>
                      <p className="text-xs text-slate-400">URL: {activeLesson.videoUrl || 'Aucune'}</p>
                    </div>
                  )}
                  {activeLesson.type === 'document' && (
                    <p className="text-xs text-slate-400">URL Doc: {activeLesson.documentUrl || 'Aucune'}</p>
                  )}
                  {activeLesson.content && (
                    <div className="mt-4 pt-4 border-t border-white/10">
                      <p className="text-xs text-slate-400 mb-1">Contenu texte:</p>
                      <p className="whitespace-pre-wrap">{activeLesson.content}</p>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <p className="text-sm text-slate-500">Sélectionnez une leçon pour en voir les détails.</p>
            )}
          </div>
          
          <div className="bg-white/5 p-6 rounded-3xl border border-white/10">
            <h3 className="font-bold text-white mb-4">Informations</h3>
            <ul className="space-y-2 text-sm text-slate-300">
              <li><span className="text-slate-500">Prix:</span> {course.isFree ? 'Gratuit' : `${course.price} FCFA`}</li>
              <li><span className="text-slate-500">Formateur (ID):</span> {course.instructorId}</li>
              <li><span className="text-slate-500">Soumis le:</span> {course.updatedAt ? new Date(course.updatedAt.toMillis?.() || Date.now()).toLocaleDateString() : 'N/A'}</li>
            </ul>
          </div>
        </div>
      </div>

      {showRejectModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-white/10 rounded-3xl w-full max-w-md overflow-hidden flex flex-col p-6 space-y-4">
            <h3 className="text-xl font-bold text-white">Rejeter la formation</h3>
            <p className="text-sm text-slate-400">Veuillez indiquer le motif du rejet qui sera envoyé au formateur.</p>
            <textarea 
              value={rejectReason} 
              onChange={e => setRejectReason(e.target.value)} 
              placeholder="Ex: La vidéo du module 2 est manquante..."
              rows={4}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-red-500 outline-none resize-none"
            />
            <div className="flex justify-end gap-2 pt-2">
              <button onClick={() => setShowRejectModal(false)} className="px-4 py-2 text-slate-400 hover:text-white">Annuler</button>
              <button onClick={handleReject} disabled={isSubmitting} className="px-4 py-2 bg-red-500 text-white font-bold rounded-xl hover:bg-red-400 flex items-center gap-2">
                {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />} Confirmer le rejet
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
