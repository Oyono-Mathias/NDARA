import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getFirestore, doc, collection, query, where, getDocs, setDoc, serverTimestamp, collectionGroup, onSnapshot } from 'firebase/firestore';
import { db, auth, storage } from '../firebase';
import { 
  ArrowLeft, 
  Paperclip, 
  Send, 
  Loader2, 
  FileText, 
  Clock, 
  CheckCircle2, 
  AlertCircle,
  Download,
  BookOpen,
  Sparkles
} from 'lucide-react';

import { TopAppBar } from '../components/ui/TopAppBar';
import { Skeleton } from '../components/ui/Skeleton';
export function AssignmentDetail() {
  const { assignmentId } = useParams();
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState<any>(null);

  const [assignment, setAssignment] = useState<any>(null);
  const [submission, setSubmission] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [textWork, setTextWork] = useState("");
  const [fileUrl, setFileUrl] = useState("");
  const [fileName, setFileName] = useState("");
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);

  useEffect(() => {
    if (!assignmentId) return;

    const unsubAuth = auth.onAuthStateChanged((user) => {
        if (user) {
            setCurrentUser(user);
            setIsLoading(true);

            // Recherche du devoir dans toutes les sous-collections assignments
            const qAssign = query(collectionGroup(db, 'assignments'), where('__name__', '==', assignmentId));
            const unsubAssign = onSnapshot(qAssign, (snap) => {
                if (snap.empty) {
                    navigate('/student/assignments');
                    return;
                }
                const assignDoc = snap.docs[0];
                setAssignment({ id: assignDoc.id, ...assignDoc.data() });
            });

            // Vérifier si l'étudiant a déjà rendu ce devoir
            const qSub = query(collection(db, 'assignments_submissions'), where('studentId', '==', user.uid), where('assignmentId', '==', assignmentId));
            const unsubSub = onSnapshot(qSub, (subSnap) => {
                if (!subSnap.empty) {
                    setSubmission(subSnap.docs[0].data());
                } else {
                    setSubmission(null);
                }
                setIsLoading(false);
            });

            return () => {
                unsubAssign();
                unsubSub();
            };
        } else {
            setCurrentUser(null);
            setIsLoading(false);
        }
    });

    return () => unsubAuth();
  }, [assignmentId, navigate]);

  const handleFileUpload = async (e: any) => {
    const file = e.target.files?.[0];
    if (!file || !currentUser || !assignmentId) return;

    setFileName(file.name);
    setUploadProgress(0);

    try {
      const { uploadToR2 } = await import("../lib/r2Upload");
      const downloadURL = await uploadToR2(file, `assignments/${assignmentId}`, (progress) => {
        setUploadProgress(progress);
      });
      
      setFileUrl(downloadURL);
      setUploadProgress(null);
    } catch (error) {
      console.error("Erreur d'upload", error);
      setUploadProgress(null);
      setFileName("");
      alert("Erreur lors de l'upload du fichier");
    }
  };

  const handleSubmit = async () => {
    if (!assignment || isSubmitting) return;
    if (!textWork.trim() && !fileUrl) {
        alert("Veuillez rédiger un texte ou joindre un fichier.");
        return;
    }

    setIsSubmitting(true);
    
    if (!currentUser) return;

    try {
      const subId = `${currentUser.uid}_${assignmentId}`;
      const subRef = doc(db, 'assignments_submissions', subId);
      
      const payload = {
        id: subId,
        studentId: currentUser.uid,
        studentName: currentUser?.displayName || 'Étudiant Ndara',
        studentAvatarUrl: currentUser?.photoURL || '',
        instructorId: assignment.instructorId || '',
        courseId: assignment.courseId,
        courseTitle: assignment.courseTitle || 'Formation Ndara',
        assignmentId: assignment.id,
        assignmentTitle: assignment.title,
        submissionContent: textWork,
        submissionUrl: fileUrl,
        status: 'submitted',
        submittedAt: serverTimestamp(),
      };

      await setDoc(subRef, payload);
      navigate('/student/assignments');
    } catch (error) {
      console.error("Erreur d'envoi", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const [scrollY, setScrollY] = useState(0);

  if (isLoading) {
    return (
      <div className="p-4 space-y-6 bg-[#050505] h-screen">
        <Skeleton className="h-10 w-3/4 rounded-xl" />
        <Skeleton className="h-64 w-full rounded-[2.5rem]" />
      </div>
    );
  }

  if (!assignment) return null;

  const isGraded = submission?.status === 'graded';
  const dueDate = assignment.dueDate?.toDate?.() || assignment.dueDate || null;
  const formatter = new Intl.DateTimeFormat('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' });
  const timeFormatter = new Intl.DateTimeFormat('fr-FR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });

  return (
    <div className="h-[100dvh] overflow-y-auto bg-[#050505] flex flex-col relative" onScroll={(e) => setScrollY(e.currentTarget.scrollTop)}>
      {/* Collapsing Header */}
      <header className="sticky top-0 w-full h-[280px] flex-shrink-0 z-0 overflow-hidden">
        <div 
            className="absolute inset-0 origin-center"
            style={{ 
                transform: `translateY(${scrollY * 0.4}px) scale(${1 + scrollY * 0.001})`,
                opacity: Math.max(0, 1 - scrollY / 200)
            }}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-[#020617] via-slate-900 to-[#020617]"></div>
          <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(255,255,255,0.15) 1px, transparent 0)', backgroundSize: '24px 24px' }}></div>
          
          <div className="relative z-10 flex flex-col items-center justify-center h-full gap-4 px-6 text-center pt-8">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-emerald-700 flex items-center justify-center shadow-xl rotate-3">
              <FileText className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-white leading-tight uppercase tracking-tight line-clamp-2">{assignment.title}</h1>
              <div className="flex items-center justify-center gap-2 text-[10px] font-black text-emerald-400 uppercase tracking-widest mt-2">
                  <BookOpen className="h-3 w-3" />
                  {assignment.courseTitle}
              </div>
            </div>
          </div>
        </div>

        <div className="absolute top-0 left-0 right-0 z-20">
            <TopAppBar title="" showBack={true} transparent />
        </div>
      </header>

      <main className="flex-1 px-4 pb-32 -mt-8 relative z-10 w-full max-w-md mx-auto">
        <div className="bg-[#0f172a] rounded-t-[2rem] p-5 min-h-screen">
          <div className="space-y-6">
            {/* CONSIGNES */}
        <div className="bg-slate-900 border border-slate-800 rounded-[2.5rem] overflow-hidden shadow-2xl">
          <div className="border-b border-white/5 bg-slate-800/30 p-6">
            <h2 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">Consignes du formateur</h2>
          </div>
          <div className="p-6 space-y-6">
            <p className="text-slate-300 text-sm leading-relaxed whitespace-pre-wrap">
                {assignment.description || "Aucune instruction spécifique fournie."}
            </p>

            {assignment.attachments && assignment.attachments.length > 0 && (
                <div className="space-y-3 pt-4 border-t border-white/5">
                    <p className="text-[9px] font-black uppercase text-slate-500 tracking-widest">Supports de travail</p>
                    <div className="grid gap-2">
                        {assignment.attachments.map((att: any, i: number) => (
                            <a 
                                key={i} 
                                href={att.url} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="flex items-center justify-between p-4 bg-slate-800/50 border border-slate-700 rounded-xl hover:bg-slate-800 transition-all group"
                            >
                                <div className="flex items-center gap-3">
                                    <FileText className="h-4 w-4 text-primary" />
                                    <span className="text-xs font-bold text-slate-200 truncate max-w-[200px]">{att.name}</span>
                                </div>
                                <Download className="h-4 w-4 text-slate-500 group-hover:text-white transition-colors" />
                            </a>
                        ))}
                    </div>
                </div>
            )}

            <div className="flex items-center gap-4 pt-4 border-t border-white/5">
                <div className="flex items-center gap-1.5 text-[10px] font-black text-slate-500 uppercase tracking-widest">
                    <Clock className="h-3.5 w-3.5 text-slate-700" />
                    Date limite : {dueDate ? formatter.format(new Date(dueDate)) : 'Non définie'}
                </div>
            </div>
          </div>
        </div>

        {/* AFFICHAGE DU RÉSULTAT OU FORMULAIRE */}
        {submission ? (
            <div className={`border-2 rounded-[2.5rem] overflow-hidden shadow-2xl animate-in fade-in duration-700
                ${isGraded ? "border-green-500/20 bg-green-500/5" : "border-primary/20 bg-primary/5"}`}>
                <div className="p-8 pb-4">
                    <div className="flex justify-between items-center">
                        <h2 className="text-xl font-black text-white uppercase tracking-tight">Mon Travail</h2>
                        <span className={`font-black text-[10px] uppercase px-3 py-1 rounded-full text-white
                            ${isGraded ? "bg-green-500" : "bg-primary"}`}>
                            {isGraded ? "Note publiée" : "Correction en cours"}
                        </span>
                    </div>
                </div>
                <div className="p-8 space-y-8">
                    {isGraded ? (
                        <div className="space-y-8">
                            <div className="flex flex-col items-center py-10 bg-slate-900 rounded-[2.5rem] border border-green-500/20 shadow-xl relative overflow-hidden">
                                <div className="absolute top-0 left-0 w-full h-1 bg-green-500/20" />
                                <p className="text-[10px] font-black uppercase text-slate-500 tracking-[0.3em] mb-3">Score de réussite</p>
                                <h2 className="text-8xl font-black text-green-400 leading-none">
                                    {submission.grade}<span className="text-3xl opacity-30">/20</span>
                                </h2>
                            </div>
                            <div className="space-y-4">
                                <div className="flex items-center gap-2 text-primary">
                                    <Sparkles className="h-4 w-4" />
                                    <p className="text-[10px] font-black uppercase tracking-widest">Commentaires de l'expert</p>
                                </div>
                                <div className="p-6 bg-slate-900 border border-slate-800 rounded-3xl italic text-sm text-slate-300 leading-relaxed whitespace-pre-wrap shadow-inner">
                                    "{submission.feedback || "Votre travail a été validé avec succès."}"
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            <div className="flex items-center gap-5 p-6 bg-slate-900/50 rounded-3xl border border-slate-800">
                                <div className="p-4 bg-primary/10 rounded-2xl">
                                    <CheckCircle2 className="h-8 w-8 text-primary" />
                                </div>
                                <div>
                                    <p className="text-base font-bold text-white leading-tight">Soumission confirmée</p>
                                    <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mt-1">
                                        Transmis le {submission.submittedAt && typeof submission.submittedAt.toDate === 'function' ? timeFormatter.format(submission.submittedAt.toDate()) : submission.submittedAt ? timeFormatter.format(new Date(submission.submittedAt)) : 'récemment'}
                                    </p>
                                </div>
                            </div>
                            <div className="p-6 bg-slate-900/30 rounded-2xl border border-slate-800">
                                <p className="text-[10px] font-black uppercase text-slate-600 tracking-widest mb-3">Ma réponse transmise</p>
                                <p className="text-sm text-slate-400 leading-relaxed whitespace-pre-wrap">{submission.submissionContent || "Sans texte descriptif."}</p>
                                {submission.submissionUrl && (
                                    <div className="mt-4 pt-4 border-t border-slate-800">
                                      <a href={submission.submissionUrl} target="_blank" rel="noreferrer" className="inline-flex items-center text-[10px] font-bold text-primary hover:text-emerald-400 transition-colors uppercase tracking-widest">
                                         <Paperclip className="h-3 w-3 mr-1" />
                                         Voir ma pièce jointe
                                      </a>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        ) : (
            <div className="bg-slate-900 border border-slate-800 rounded-[2.5rem] overflow-hidden shadow-2xl">
                <div className="p-8 pb-4">
                    <h2 className="text-xl font-black text-white uppercase tracking-tight">Rendre mon devoir</h2>
                    <p className="text-slate-500 text-sm font-medium mt-1">Développez votre réponse ou joignez un document.</p>
                </div>
                <div className="p-8 space-y-8">
                    <div className="space-y-3">
                        <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest ml-1">Ma réponse rédigée</label>
                        <textarea 
                            placeholder="Écrivez votre réponse ici..."
                            rows={6}
                            className="w-full bg-[#1e293b] border border-slate-700 rounded-[1.5rem] text-white resize-none p-5 focus:outline-none focus:ring-2 focus:ring-primary/30 text-base leading-relaxed"
                            value={textWork}
                            onChange={(e) => setTextWork(e.target.value)}
                        />
                    </div>

                    <div className="space-y-4">
                        <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest ml-1">Document joint</label>
                        {fileUrl ? (
                            <div className="flex items-center justify-between p-5 bg-primary/10 border border-primary/20 rounded-2xl shadow-xl animate-in zoom-in duration-300">
                                <div className="flex items-center gap-3">
                                    <Paperclip className="h-5 w-5 text-primary" />
                                    <span className="text-sm font-bold text-white truncate max-w-[200px]">{fileName}</span>
                                </div>
                                <button onClick={() => { setFileUrl(""); setFileName(""); }} className="text-[10px] font-black uppercase text-red-400 hover:text-red-500 hover:bg-red-500/10 h-8 px-3 rounded-lg transition-colors">Retirer</button>
                            </div>
                        ) : (
                            <div className="relative">
                                <input 
                                    type="file" 
                                    className="hidden" 
                                    id="submission-file" 
                                    onChange={handleFileUpload}
                                    disabled={uploadProgress !== null}
                                />
                                <label 
                                    htmlFor="submission-file"
                                    className={`flex flex-col items-center justify-center py-12 border-2 border-dashed border-slate-800 rounded-[1.5rem] cursor-pointer hover:border-primary/50 transition-all active:scale-[0.98] bg-slate-950/30
                                        ${uploadProgress !== null ? "opacity-50 pointer-events-none" : ""}`}
                                >
                                    <Paperclip className="h-10 w-10 text-slate-700 mb-3" />
                                    <span className="text-xs font-black uppercase text-slate-500 tracking-widest">Choisir un fichier</span>
                                </label>
                                {uploadProgress !== null && (
                                    <div className="absolute inset-0 flex items-center justify-center bg-slate-950/80 rounded-[1.5rem] backdrop-blur-sm">
                                        <div className="text-center space-y-3">
                                            <Loader2 className="h-10 w-10 animate-spin text-primary mx-auto" />
                                            <p className="text-[10px] font-black text-white uppercase tracking-[0.3em]">{Math.round(uploadProgress)}%</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
                <div className="p-8 pt-0">
                    <button 
                        onClick={handleSubmit}
                        disabled={isSubmitting || uploadProgress !== null || (!textWork.trim() && !fileUrl)}
                        className="w-full h-16 flex items-center justify-center rounded-2xl bg-primary hover:bg-primary/90 text-[#0f172a] font-black uppercase text-sm tracking-[0.15em] shadow-2xl shadow-primary/20 active:scale-[0.98] transition-all disabled:opacity-50"
                    >
                        {isSubmitting ? <Loader2 className="h-6 w-6 animate-spin" /> : <>Soumettre mon travail <Send className="ml-2 h-4 w-4" /></>}
                    </button>
                </div>
            </div>
        )}

        <div className="bg-slate-900/30 border border-slate-800 rounded-[2rem] p-6 flex items-start gap-4">
            <AlertCircle className="h-6 w-6 text-amber-500 shrink-0 mt-0.5" />
            <p className="text-[10px] text-slate-500 leading-relaxed font-bold uppercase tracking-tight">
                Une fois votre travail soumis, il devient la propriété pédagogique de Ndara Afrique pour correction.
            </p>
        </div>
      </div>
      </div>
      </main>
    </div>
  );
}
