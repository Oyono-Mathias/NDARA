import { useState, useEffect } from 'react';
import { collection, query, where, getDocs, addDoc, serverTimestamp, onSnapshot, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../../../firebase';
import { useRole } from '../../../context/RoleContext';
import { Megaphone, Send, Clock, Trash2, CheckCircle2, Loader2, MessageSquare } from 'lucide-react';

export function AnnouncementsClient() {
    const { currentUser } = useRole();
    const [courses, setCourses] = useState<any[]>([]);
    const [announcements, setAnnouncements] = useState<any[]>([]);
    
    const [selectedCourse, setSelectedCourse] = useState('');
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [toastMessage, setToastMessage] = useState<string | null>(null);

    useEffect(() => {
        if (!currentUser?.uid) return;
        
        const fetchCourses = async () => {
            const q = query(collection(db, 'courses'), where('instructorId', '==', currentUser.uid));
            const snap = await getDocs(q);
            setCourses(snap.docs.map(d => ({ id: d.id, ...d.data() })));
        };
        fetchCourses();

        const qAnnounce = query(collection(db, 'course_announcements'), where('instructorId', '==', currentUser.uid));
        const unsub = onSnapshot(qAnnounce, (snap) => {
            const arr = snap.docs.map(d => ({ id: d.id, ...d.data() }));
            // Client-side sort to avoid composite index requirements
            arr.sort((a: any, b: any) => {
                const ta = a.createdAt?.toMillis ? a.createdAt.toMillis() : Date.now();
                const tb = b.createdAt?.toMillis ? b.createdAt.toMillis() : Date.now();
                return tb - ta;
            });
            setAnnouncements(arr);
        });
        
        return () => unsub();
    }, [currentUser?.uid]);

    const handlePublish = async () => {
        if (!selectedCourse || !title || !content || !currentUser?.uid) return;
        
        setIsSubmitting(true);
        try {
            const courseObj = courses.find(c => c.id === selectedCourse);
            await addDoc(collection(db, 'course_announcements'), {
                instructorId: currentUser.uid,
                courseId: selectedCourse,
                courseTitle: courseObj?.title || 'Formation',
                title,
                content,
                createdAt: serverTimestamp()
            });
            
            setSelectedCourse('');
            setTitle('');
            setContent('');
            
            setToastMessage("Annonce diffusée avec succès");
            setTimeout(() => setToastMessage(null), 3000);
        } catch (error) {
            console.error("Erreur de publication:", error);
            alert("Erreur lors de la diffusion de l'annonce.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!id) return;
        if (confirm("Supprimer cette annonce ?")) {
            try {
                await deleteDoc(doc(db, 'course_announcements', id));
            } catch (error: any) {
                console.error("Erreur lors de la suppression de l'annonce:", error);
                alert("Erreur lors de la suppression : " + (error.message || "Permissions insuffisantes."));
            }
        }
    };

    return (
        <div className="space-y-8 mt-6 relative">
            {toastMessage && (
                <div className="fixed top-4 left-1/2 -translate-x-1/2 bg-emerald-500 text-white px-4 py-2 rounded-xl text-xs font-bold tracking-widest flex items-center gap-2 shadow-lg z-50 animate-in slide-in-from-top fade-in whitespace-nowrap">
                    <CheckCircle2 className="w-4 h-4" />
                    {toastMessage}
                </div>
            )}

            <div className="bg-[#1e293b] border border-white/5 rounded-[2.5rem] p-8 shadow-2xl relative overflow-hidden">
                <div className="absolute -top-24 -right-24 w-48 h-48 bg-orange-500/10 rounded-full blur-3xl pointer-events-none"></div>
                
                <h2 className="font-black uppercase tracking-tight text-xl mb-2 text-white flex items-center gap-2">
                    <Megaphone className="w-6 h-6 text-orange-400" />
                    Créer une annonce
                </h2>
                <p className="text-sm font-medium text-slate-400 mb-8 italic">Informez vos étudiants des nouveautés, des prochains live ou des mises à jour de contenu.</p>
                
                <div className="space-y-5">
                    <div className="space-y-2">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 ml-2">Formation cible</label>
                        <select 
                            className="w-full bg-[#0f172a] border border-white/10 rounded-2xl p-4 text-sm text-white focus:ring-1 focus:ring-orange-500/50 outline-none"
                            value={selectedCourse}
                            onChange={e => setSelectedCourse(e.target.value)}
                            disabled={isSubmitting}
                        >
                            <option value="">Sélectionner une formation</option>
                            {courses.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
                        </select>
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 ml-2">Titre de l'annonce</label>
                        <input 
                            className="w-full bg-[#0f172a] border border-white/10 rounded-2xl p-4 text-sm text-white focus:ring-1 focus:ring-orange-500/50 outline-none placeholder:text-slate-600"
                            placeholder="Ex: Mise à jour majeure du module 3"
                            value={title}
                            onChange={e => setTitle(e.target.value)}
                            disabled={isSubmitting}
                            maxLength={100}
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 ml-2">Corps du message</label>
                        <textarea 
                            className="w-full bg-[#0f172a] border border-white/10 rounded-2xl p-4 text-sm text-white focus:ring-1 focus:ring-orange-500/50 outline-none placeholder:text-slate-600 min-h-[160px] resize-y"
                            placeholder="Rédigez votre annonce ici..."
                            value={content}
                            onChange={e => setContent(e.target.value)}
                            disabled={isSubmitting}
                        />
                    </div>

                    <div className="pt-2 flex justify-end">
                        <button 
                            onClick={handlePublish}
                            disabled={!selectedCourse || !title || !content || isSubmitting}
                            className="bg-orange-500 text-white h-[52px] px-8 rounded-2xl font-black uppercase tracking-widest text-xs flex items-center justify-center gap-2 hover:bg-orange-600 disabled:opacity-50 disabled:hover:bg-orange-500 transition shadow-lg shadow-orange-500/20 w-full md:w-auto"
                        >
                            {isSubmitting ? (
                                <><Loader2 size={16} className="animate-spin" /> Diffusion...</>
                            ) : (
                                <><Send size={16} /> Diffuser l'annonce</>
                            )}
                        </button>
                    </div>
                </div>
            </div>

            <div>
                <h3 className="font-bold text-white text-lg mb-6 flex items-center gap-2">
                    <MessageSquare className="text-orange-400 w-5 h-5" /> 
                    Historique des annonces ({announcements.length})
                </h3>
                
                {announcements.length === 0 ? (
                    <div className="bg-[#1e293b] border border-white/5 rounded-3xl p-12 text-center flex flex-col items-center justify-center">
                        <Megaphone className="w-12 h-12 text-slate-600 mb-4 opacity-50" />
                        <p className="text-slate-400 text-sm font-medium">Vous n'avez pas encore publié d'annonce.</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {announcements.map(announce => (
                            <div key={announce.id} className="p-6 bg-[#1e293b] border border-white/5 rounded-[2rem] group hover:border-white/10 transition relative overflow-hidden">
                                <div className="absolute top-0 right-0 p-4">
                                    <button 
                                        onClick={() => handleDelete(announce.id)}
                                        className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-slate-500 hover:text-red-500 hover:bg-red-500/10 transition opacity-0 group-hover:opacity-100"
                                        title="Supprimer l'annonce"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                                <div className="pr-12">
                                    <div className="flex items-center gap-3 mb-3">
                                        <span className="px-3 py-1 bg-orange-500/10 text-orange-400 rounded-lg text-[10px] font-black uppercase tracking-widest">
                                            {announce.courseTitle}
                                        </span>
                                        <div className="flex items-center gap-1.5 text-slate-500 text-xs font-medium">
                                            <Clock size={12} />
                                            {announce.createdAt?.toDate ? announce.createdAt.toDate().toLocaleString('fr-FR', { 
                                                day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' 
                                            }) : 'À l\'instant'}
                                        </div>
                                    </div>
                                    <h4 className="font-bold text-white text-lg mb-2">{announce.title}</h4>
                                    <p className="text-slate-400 text-sm leading-relaxed whitespace-pre-wrap">{announce.content}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
