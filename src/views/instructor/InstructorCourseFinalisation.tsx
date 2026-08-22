import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useRole } from '../../context/RoleContext';
import { db } from '../../firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { toast } from '../../hooks/use-toast';
import { useCourseBuilder } from '../../hooks/catalog/useCatalogAdmin';
import { Check, Edit2, Play, FileText, Link as LinkIcon, MonitorPlay, AlertTriangle, ArrowLeft, Loader2, Send } from 'lucide-react';
import { Course } from '../../types/models';

export function InstructorCourseFinalisation() {
    const navigate = useNavigate();
    const { id: courseId } = useParams<{ id: string }>();
    const { currentUser } = useRole();
    const { chapters, lessons, loading: builderLoading } = useCourseBuilder(courseId!);

    const [course, setCourse] = useState<Course | null>(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [showSuccessModal, setShowSuccessModal] = useState(false);

    useEffect(() => {
        if (!courseId) return;
        const fetchCourse = async () => {
            try {
                const docRef = doc(db, 'courses', courseId);
                const docSnap = await getDoc(docRef);
                if (docSnap.exists()) {
                    setCourse({ id: docSnap.id, ...docSnap.data() } as any);
                } else {
                    toast({ variant: 'destructive', title: 'Cours introuvable' });
                    navigate('/instructor/courses');
                }
            } catch (err) {
                console.error(err instanceof Error ? err.message : String(err));
                toast({ variant: 'destructive', title: 'Erreur lors du chargement' });
            } finally {
                setLoading(false);
            }
        };
        fetchCourse();
    }, [courseId, navigate]);

    // Derived states
    const hasTitleDesc = !!(course?.title && course?.shortDescription && course?.title.length > 5 && course?.shortDescription.length > 20);
    const hasCover = !!course?.thumbnail;
    const hasProgram = chapters.length > 0 && lessons.length > 0 && chapters.every(c => lessons.some(l => l.chapterId === c.id));
    const hasObjectives = !!(course?.objectives && course.objectives.length > 0);
    const hasValidPrice = course?.price !== undefined && course.price >= 0;

    // Check media constraints: 50% rule based on lesson type
    const validLessonsCount = lessons.filter(l => {
        if (l.type === 'video') return !!l.videoUrl;
        if (l.type === 'text') return !!l.content && l.content.length > 10;
         // assuming link uses videoUrl or content
        if (l.type === 'quiz') return !!l.content; // simplistic validation
        if (l.type === 'exercise') return !!l.content;
        return !!l.videoUrl || !!l.documentUrl || !!l.content;
    }).length;
    
    // We only count published/active lessons, maybe all?
    const hasMedia = lessons.length > 0 && validLessonsCount >= Math.ceil(lessons.length / 2);

    const isAllChecked = hasTitleDesc && hasCover && hasProgram && hasObjectives && hasValidPrice && hasMedia;

    const handleSubmit = async () => {
        if (!courseId || !isAllChecked) return;
        setSubmitting(true);
        try {
            await updateDoc(doc(db, "courses", courseId), {
                status: 'pending_review'
            });
            setShowSuccessModal(true);
        } catch (error) {
            console.error(error instanceof Error ? error.message : String(error));
            toast({ variant: 'destructive', title: 'Erreur lors de la soumission' });
        } finally {
            setSubmitting(false);
        }
    };

    if (loading || builderLoading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500"></div>
            </div>
        );
    }

    if (!course) return null;

    const totalDuration = lessons.reduce((acc, l) => acc + (l.duration || 0), 0);
    const durationHours = Math.floor(totalDuration / 3600);
    const durationMins = Math.floor((totalDuration % 3600) / 60);
    const durationString = durationHours > 0 ? `${durationHours}h ${durationMins}min` : `${durationMins} min`;

    const instructorName = currentUser?.displayName || "Formateur Anonyme";

    return (
        <div className="max-w-5xl mx-auto px-4 pt-10 pb-24">
            
            {/* Page Header */}
            <div className="mb-8 animate-fade-in">
                <h1 className="text-2xl sm:text-3xl font-black text-white">FINALISATION DU COURS</h1>
                <p className="text-sm text-gray-400 mt-2">Vérifiez les informations et soumettez votre cours à la modération</p>
            </div>

            {/* Progress Stepper */}
            <div className="flex items-center gap-2 mb-8 overflow-x-auto pb-2 animate-fade-in">
                <div className="flex items-center gap-2 flex-shrink-0" onClick={() => navigate(`/instructor/courses/edit/${courseId}`)}>
                    <div className="w-8 h-8 rounded-full bg-emerald-500 border border-emerald-500 text-white flex items-center justify-center text-xs font-bold flex-shrink-0 cursor-pointer">
                        <Check className="w-4 h-4" />
                    </div>
                    <span className="text-xs font-semibold text-emerald-400 hidden sm:inline cursor-pointer">Infos</span>
                </div>
                <div className="w-6 sm:w-10 h-0.5 bg-emerald-500 rounded-full flex-shrink-0"></div>
                <div className="flex items-center gap-2 flex-shrink-0" onClick={() => navigate(`/instructor/courses/edit/${courseId}/program`)}>
                    <div className="w-8 h-8 rounded-full bg-emerald-500 border border-emerald-500 text-white flex items-center justify-center text-xs font-bold flex-shrink-0 cursor-pointer">
                        <Check className="w-4 h-4" />
                    </div>
                    <span className="text-xs font-semibold text-emerald-400 hidden sm:inline cursor-pointer">Programme</span>
                </div>
                <div className="w-6 sm:w-10 h-0.5 bg-emerald-500 rounded-full flex-shrink-0"></div>
                <div className="flex items-center gap-2 flex-shrink-0" onClick={() => navigate(`/instructor/courses/edit/${courseId}/media`)}>
                    <div className="w-8 h-8 rounded-full bg-emerald-500 border border-emerald-500 text-white flex items-center justify-center text-xs font-bold flex-shrink-0 cursor-pointer">
                        <Check className="w-4 h-4" />
                    </div>
                    <span className="text-xs font-semibold text-emerald-400 hidden sm:inline cursor-pointer">Médias</span>
                </div>
                <div className="w-6 sm:w-10 h-0.5 bg-emerald-500 rounded-full flex-shrink-0"></div>
                <div className="flex items-center gap-2 flex-shrink-0" onClick={() => navigate(`/instructor/courses/edit/${courseId}/parametres`)}>
                    <div className="w-8 h-8 rounded-full bg-emerald-500 border border-emerald-500 text-white flex items-center justify-center text-xs font-bold flex-shrink-0 cursor-pointer">
                        <Check className="w-4 h-4" />
                    </div>
                    <span className="text-xs font-semibold text-emerald-400 hidden sm:inline cursor-pointer">Prix</span>
                </div>
                <div className="w-6 sm:w-10 h-0.5 bg-emerald-500 rounded-full flex-shrink-0"></div>
                <div className="flex items-center gap-2 flex-shrink-0">
                    <div className="w-8 h-8 rounded-full bg-blue-500 border-2 border-blue-500 text-white shadow-[0_0_0_4px_rgba(59,130,246,0.2)] flex items-center justify-center text-xs font-bold flex-shrink-0">5</div>
                    <span className="text-xs font-semibold text-blue-400 hidden sm:inline">Publier</span>
                </div>
            </div>

            <div className="grid lg:grid-cols-3 gap-6">
                
                {/* Left: Course Summary & Checklist */}
                <div className="lg:col-span-2 space-y-6">
                    
                    {/* Course Preview Card */}
                    <div className="bg-[#161B22]/60 backdrop-blur-xl border border-[#30363D]/50 rounded-2xl overflow-hidden animate-fade-in">
                        <div className="px-5 py-4 border-b border-[#30363D] flex items-center justify-between">
                            <h3 className="text-sm font-bold text-white">📋 Résumé du cours</h3>
                            <button onClick={() => navigate(`/instructor/courses/edit/${courseId}`)} className="text-xs text-blue-400 hover:text-blue-300 transition-colors flex items-center gap-1">
                                <Edit2 className="w-4 h-4" />
                                Modifier
                            </button>
                        </div>
                        
                        <div className="p-5">
                            <div className="w-full h-40 bg-gradient-to-br from-emerald-500/20 to-blue-500/20 rounded-xl mb-4 overflow-hidden">
                                {course.thumbnail ? (
                                    <img src={course.thumbnail} alt="Cover" className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-gray-500">Aucune couverture</div>
                                )}
                            </div>

                            <div className="space-y-3">
                                <div>
                                    <h4 className="text-lg font-bold text-white">{course.title || "Sans titre"}</h4>
                                    <p className="text-sm text-gray-400 mt-1">{course.shortDescription || "Aucune description"}</p>
                                </div>

                                <div className="flex flex-wrap gap-2">
                                    {course.categoryId && <span className="px-2 py-1 bg-purple-500/10 text-purple-400 text-xs rounded-lg font-semibold">{course.categoryId}</span>}
                                    {course.level && <span className="px-2 py-1 bg-blue-500/10 text-blue-400 text-xs rounded-lg font-semibold">{course.level}</span>}
                                    {course.language && <span className="px-2 py-1 bg-emerald-500/10 text-emerald-400 text-xs rounded-lg font-semibold">{course.language}</span>}
                                </div>

                                <div className="flex items-center gap-3 text-xs text-gray-400">
                                    <span>📖 {lessons.length} leçons</span>
                                    <span>⏱️ {durationString}</span>
                                </div>

                                {/* Objectives */}
                                {course.objectives && course.objectives.length > 0 && (
                                    <div className="mt-4">
                                        <p className="text-xs text-gray-400 mb-2 font-semibold">Ce que les étudiants apprendront :</p>
                                        <div className="space-y-1.5">
                                            {course.objectives.slice(0, 4).map((obj, i) => (
                                                <div key={i} className="flex items-center gap-2">
                                                    <span className="text-emerald-400 text-xs flex-shrink-0">✓</span>
                                                    <span className="text-xs text-gray-300">{obj}</span>
                                                </div>
                                            ))}
                                            {course.objectives.length > 4 && (
                                                <div className="text-xs text-gray-500">+ {course.objectives.length - 4} autres</div>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {/* Price */}
                                <div className="mt-4 pt-4 border-t border-[#30363D] flex items-center justify-between">
                                    <div>
                                        <span className="text-2xl font-black text-emerald-400">{course.isFree ? "Gratuit" : `${course.price?.toLocaleString()} F`}</span>
                                        {course.promoPrice && course.promoPrice < (course.price || 0) && (
                                            <span className="text-sm text-gray-500 line-through ml-2">{course.price?.toLocaleString()} F</span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Final Checklist */}
                    <div className="bg-[#161B22]/60 backdrop-blur-xl border border-[#30363D]/50 rounded-2xl p-5 sm:p-6 animate-fade-in">
                        <h3 className="text-base font-bold text-white mb-4">✅ Checklist finale avant soumission</h3>
                        <p className="text-xs text-gray-400 mb-4">Assurez-vous que tous les éléments sont corrects avant de soumettre votre cours à la modération.</p>
                        
                        <div className="space-y-2">
                            <label className="flex items-center gap-3 p-3 bg-[#111827] rounded-xl cursor-pointer hover:bg-emerald-500/5 transition-colors">
                                <input type="checkbox" readOnly checked={hasTitleDesc} className="w-5 h-5 rounded bg-[#30363D] border-[#30363D] text-emerald-500 accent-emerald-500" />
                                <div className="flex-1">
                                    <p className="text-sm text-white font-medium">Titre et description corrects</p>
                                    <p className="text-xs text-gray-500">Le titre est accrocheur et la description détaille bien le contenu</p>
                                </div>
                            </label>
                            <label className="flex items-center gap-3 p-3 bg-[#111827] rounded-xl cursor-pointer hover:bg-emerald-500/5 transition-colors">
                                <input type="checkbox" readOnly checked={hasCover} className="w-5 h-5 rounded bg-[#30363D] border-[#30363D] text-emerald-500 accent-emerald-500" />
                                <div className="flex-1">
                                    <p className="text-sm text-white font-medium">Image de couverture de qualité</p>
                                    <p className="text-xs text-gray-500">L'image est claire, professionnelle et au bon format</p>
                                </div>
                            </label>
                            <label className="flex items-center gap-3 p-3 bg-[#111827] rounded-xl cursor-pointer hover:bg-emerald-500/5 transition-colors">
                                <input type="checkbox" readOnly checked={hasProgram} className="w-5 h-5 rounded bg-[#30363D] border-[#30363D] text-emerald-500 accent-emerald-500" />
                                <div className="flex-1">
                                    <p className="text-sm text-white font-medium">Programme complet</p>
                                    <p className="text-xs text-gray-500">Chapitres et leçons structurés</p>
                                </div>
                            </label>
                            <label className="flex items-center gap-3 p-3 bg-[#111827] rounded-xl cursor-pointer hover:bg-emerald-500/5 transition-colors">
                                <input type="checkbox" readOnly checked={hasObjectives} className="w-5 h-5 rounded bg-[#30363D] border-[#30363D] text-emerald-500 accent-emerald-500" />
                                <div className="flex-1">
                                    <p className="text-sm text-white font-medium">Objectifs d'apprentissage clairs</p>
                                    <p className="text-xs text-gray-500">Minimum 1 objectif défini pour les étudiants</p>
                                </div>
                            </label>
                            <label className="flex items-center gap-3 p-3 bg-[#111827] rounded-xl cursor-pointer hover:bg-emerald-500/5 transition-colors">
                                <input type="checkbox" readOnly checked={hasMedia} className="w-5 h-5 rounded bg-[#30363D] border-[#30363D] text-emerald-500 accent-emerald-500" />
                                <div className="flex-1">
                                    <p className="text-sm text-white font-medium">Contenu média suffisant</p>
                                    <p className="text-xs text-gray-500">Au moins 50% des leçons ont un contenu valide (vidéo, texte, etc.)</p>
                                </div>
                            </label>
                            <label className="flex items-center gap-3 p-3 bg-[#111827] rounded-xl cursor-pointer hover:bg-emerald-500/5 transition-colors">
                                <input type="checkbox" readOnly checked={hasValidPrice} className="w-5 h-5 rounded bg-[#30363D] border-[#30363D] text-emerald-500 accent-emerald-500" />
                                <div className="flex-1">
                                    <p className="text-sm text-white font-medium">Prix défini et cohérent</p>
                                    <p className="text-xs text-gray-500">Le prix correspond à la valeur du contenu proposé</p>
                                </div>
                            </label>
                        </div>
                    </div>

                </div>

                {/* Right: Status & Actions */}
                <div className="lg:col-span-1">
                    <div className="sticky top-20 space-y-6">
                        
                        {/* Quality Score */}
                        <div className="bg-[#161B22]/60 backdrop-blur-xl border border-[#30363D]/50 rounded-2xl p-5 animate-fade-in">
                            <h3 className="text-sm font-bold text-white mb-4">📊 Score qualité (Aperçu)</h3>
                            
                            <div className="flex items-center gap-4 mb-4">
                                <div className="relative w-16 h-16 flex items-center justify-center bg-[#111827] rounded-full border-4 border-emerald-500">
                                    <span className="text-xl font-black text-emerald-400">
                                        {Math.round(((Number(hasTitleDesc) + Number(hasCover) + Number(hasProgram) + Number(hasObjectives) + Number(hasValidPrice) + Number(hasMedia)) / 6) * 100)}%
                                    </span>
                                </div>
                                <div>
                                    <p className="text-sm font-semibold text-emerald-400">Prêt</p>
                                    <p className="text-xs text-gray-500">Optimisation évaluée</p>
                                </div>
                            </div>
                        </div>

                        {/* Moderation Status */}
                        <div className="bg-[#161B22]/60 backdrop-blur-xl border border-[#30363D]/50 rounded-2xl p-5 animate-fade-in">
                            <h3 className="text-sm font-bold text-white mb-4">Statut de modération</h3>
                            
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-12 h-12 rounded-xl bg-orange-500/10 flex items-center justify-center">
                                    <AlertTriangle className="w-6 h-6 text-orange-400" />
                                </div>
                                <div>
                                    <p className="text-sm font-semibold text-orange-400">En attente</p>
                                    <p className="text-xs text-gray-500">Prêt à être soumis</p>
                                </div>
                            </div>
                        </div>

                        {/* Quick Stats */}
                        <div className="bg-[#161B22]/60 backdrop-blur-xl border border-[#30363D]/50 rounded-2xl p-5 animate-fade-in">
                            <h3 className="text-sm font-bold text-white mb-4">⚡ Aperçu rapide</h3>
                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <span className="text-xs text-gray-400">Chapitres</span>
                                    <span className="text-sm font-bold text-white">{chapters.length}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-xs text-gray-400">Leçons</span>
                                    <span className="text-sm font-bold text-white">{lessons.length}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-xs text-gray-400">Objectifs</span>
                                    <span className="text-sm font-bold text-white">{course.objectives?.length || 0}</span>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>

            </div>

            {/* Student Preview Section */}
            <div className="mt-8 animate-fade-in">
                <h3 className="text-base font-bold text-white mb-4">👁️ Aperçu étudiant</h3>
                <p className="text-sm text-gray-400 mb-4">Voici comment votre cours apparaîtra aux étudiants</p>
                
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {/* Mobile Preview */}
                    <div className="bg-[#161B22]/60 backdrop-blur-xl border border-[#30363D]/50 rounded-2xl p-4">
                        <p className="text-xs text-gray-400 mb-3 flex items-center gap-2">
                            <MonitorPlay className="w-4 h-4" />
                            Vue Mobile
                        </p>
                        <div className="border-2 border-[#30363D] rounded-2xl overflow-hidden bg-[#0D1117] p-3 max-w-[280px] mx-auto">
                            <div className="w-full h-24 bg-gradient-to-br from-emerald-500/20 to-blue-500/20 rounded-lg mb-2 overflow-hidden">
                                {course.thumbnail && <img src={course.thumbnail} alt="" className="w-full h-full object-cover" />}
                            </div>
                            <p className="text-xs font-bold text-white line-clamp-2">{course.title || "Titre"}</p>
                            <p className="text-[10px] text-gray-400 mt-1">{instructorName}</p>
                            <div className="flex items-center justify-between mt-2 pt-2 border-t border-[#30363D]">
                                <span className="text-sm font-bold text-emerald-400">{course.isFree ? "Gratuit" : `${course.price?.toLocaleString()} F`}</span>
                                <span className="text-[10px] px-2 py-1 bg-emerald-500 text-white rounded">S'inscrire</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Sticky Bottom Action */}
            <div className="fixed bottom-0 left-0 right-0 bg-gradient-to-t from-[#06080F] via-[#06080F]/90 to-transparent pt-20 pb-6 z-40">
                <div className="max-w-5xl mx-auto px-4">
                    <div className="flex gap-3 max-w-2xl ml-auto">
                        <button onClick={() => toast({ title: 'Brouillon enregistré' })} className="flex-1 py-3.5 bg-[#161B22] border border-[#30363D] text-white text-sm font-semibold rounded-xl hover:bg-[#1E2530] transition-colors">
                            Sauvegarder le brouillon
                        </button>
                        <button 
                            onClick={handleSubmit} 
                            disabled={!isAllChecked || submitting}
                            className="flex-1 py-3.5 bg-gradient-to-r from-emerald-500 to-emerald-700 text-white text-sm font-bold rounded-xl hover:shadow-lg hover:shadow-emerald-500/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed">
                            {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                            Soumettre à la modération
                        </button>
                    </div>
                </div>
            </div>

            {/* Success Modal */}
            {showSuccessModal && (
                <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
                    <div className="bg-[#161B22] border border-[#30363D] rounded-3xl p-6 sm:p-8 w-full max-w-md text-center animate-scale-in">
                        <div className="w-20 h-20 rounded-full bg-emerald-500/20 flex items-center justify-center mx-auto mb-6">
                            <Check className="w-10 h-10 text-emerald-500" />
                        </div>
                        <h3 className="text-xl font-black text-white mb-2">Soumission réussie !</h3>
                        <p className="text-sm text-gray-400 mb-6">Votre cours "{course.title}" a été envoyé pour modération. Vous recevrez une notification dès qu'il sera publié.</p>
                        
                        <div className="space-y-3">
                            <button onClick={() => navigate('/instructor/courses')} className="w-full py-3 bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-bold rounded-xl transition-colors">
                                Aller au tableau de bord
                            </button>
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
}
