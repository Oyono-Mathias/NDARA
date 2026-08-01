import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { db } from "../../firebase";
import { doc, onSnapshot, collection, query, where, getDocs, orderBy } from "firebase/firestore";
import { Loader2, ArrowLeft, Eye, Edit2, Users, BarChart2, CheckCircle2, AlertCircle, ChevronDown, ChevronUp, Star, PlayCircle, FileText, CheckCircle } from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import { ChaptersService, LessonsService } from "../../services/db";

export function InstructorCoursePreview() {
  const { id: courseId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { firebaseUser } = useAuth();
  
  const [course, setCourse] = useState<any>(null);
  const [chapters, setChapters] = useState<any[]>([]);
  const [lessons, setLessons] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);
  const [activeTab, setActiveTab] = useState<'modules' | 'reviews' | 'settings'>('modules');
  const [expandedModules, setExpandedModules] = useState<Record<string, boolean>>({});
  
  // Dummy data for reviews and stats
  const stats = {
    students: 1247,
    rating: 4.9,
    revenue: "18.6M",
    completion: "68%"
  };

  useEffect(() => {
    if (!courseId) return;

    const unsubscribe = onSnapshot(
      doc(db, "courses", courseId),
      (snap) => {
        if (snap.exists()) {
          setCourse({ id: snap.id, ...snap.data() });
        } else {
          setError(true);
        }
        setIsLoading(false);
      },
      (err) => {
        console.error("Erreur:", err);
        setError(true);
        setIsLoading(false);
      }
    );

    const loadContent = async () => {
      try {
        const chaps = await ChaptersService.getAll([where('courseId', '==', courseId), orderBy('order', 'asc')]);
        setChapters(chaps);
        const less = await LessonsService.getAll([where('courseId', '==', courseId), orderBy('order', 'asc')]);
        setLessons(less);
      } catch (e) {
        console.error("Failed to load content", e);
      }
    };
    
    loadContent();

    return () => unsubscribe();
  }, [courseId]);

  const toggleModule = (id: string) => {
    setExpandedModules(prev => ({ ...prev, [id]: !prev[id] }));
  };

  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-[#0B0F19]">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
      </div>
    );
  }

  if (error || !course) {
    return (
      <div className="flex flex-col h-screen w-full items-center justify-center bg-[#0B0F19] text-white space-y-4">
        <AlertCircle className="w-12 h-12 text-red-500" />
        <h2 className="text-xl font-bold">Cours introuvable</h2>
        <button onClick={() => navigate('/instructor/courses')} className="text-emerald-500 hover:underline">
          Retour aux cours
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-[100dvh] bg-[#0B0F19] pb-24 text-slate-50 font-sans">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-[#0B0F19]/95 backdrop-blur-xl border-b border-[#334155]">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate(-1)} className="p-2 rounded-lg hover:bg-[#1E293B] transition-colors">
              <ArrowLeft className="w-5 h-5 text-gray-400" />
            </button>
            <div>
              <h1 className="text-sm font-bold text-white">Aperçu du Cours</h1>
              <p className="text-[10px] text-gray-500">Vérifiez avant de publier</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {course.status === 'published' ? (
              <span className="px-2 py-1 bg-emerald-500/15 text-emerald-500 text-[10px] font-semibold rounded-lg flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                Publié
              </span>
            ) : (
              <span className="px-2 py-1 bg-orange-500/15 text-orange-500 text-[10px] font-semibold rounded-lg flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-orange-500"></span>
                Brouillon
              </span>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-4 space-y-4">
        
        {/* Course Banner */}
        <div className="relative rounded-2xl overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="h-40 sm:h-48 bg-gradient-to-r from-emerald-500/20 via-blue-500/20 to-purple-500/20 relative">
            {course.thumbnailUrl && (
                <img src={course.thumbnailUrl} alt={course.title} className="w-full h-full object-cover opacity-50 absolute inset-0" />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-[#0B0F19] via-[#0B0F19]/40 to-transparent"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500/30 to-blue-500/30 flex items-center justify-center animate-in zoom-in duration-500">
                <span className="text-3xl">📢</span>
              </div>
            </div>
          </div>
          <div className="px-4 pb-4 -mt-12 relative z-10">
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1">
                <h2 className="text-xl sm:text-2xl font-extrabold text-white mb-1">{course.title}</h2>
                <p className="text-sm text-gray-400 line-clamp-2">{course.shortDescription || "Aucune description fournie."}</p>
              </div>
              <div className="flex-shrink-0 flex gap-2">
                <Link to={`/student/courses/${course.slug}`} className="px-3 py-2 bg-blue-500/10 border border-blue-500/30 text-blue-400 text-xs font-semibold rounded-xl hover:bg-blue-500/20 flex items-center gap-1.5 transition-colors">
                  <Eye className="w-4 h-4" />
                  Voir
                </Link>
                <Link to={`/instructor/courses/edit/${course.id}`} className="px-3 py-2 bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-semibold rounded-xl shadow-lg shadow-emerald-500/20 flex items-center gap-1.5 transition-colors">
                  <Edit2 className="w-4 h-4" />
                  Modifier
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-100 fill-mode-both">
          <div className="bg-[#1E293B] border border-[#334155] rounded-xl p-3 text-center transition-all hover:-translate-y-0.5 hover:shadow-lg">
            <div className="text-2xl font-bold text-emerald-400">{course.enrollmentsCount || stats.students}</div>
            <div className="text-[10px] text-gray-500 mt-0.5">Étudiants</div>
          </div>
          <div className="bg-[#1E293B] border border-[#334155] rounded-xl p-3 text-center transition-all hover:-translate-y-0.5 hover:shadow-lg">
            <div className="text-2xl font-bold text-amber-400">{course.averageRating || stats.rating}</div>
            <div className="text-[10px] text-gray-500 mt-0.5">Note ⭐</div>
          </div>
          <div className="bg-[#1E293B] border border-[#334155] rounded-xl p-3 text-center transition-all hover:-translate-y-0.5 hover:shadow-lg">
            <div className="text-2xl font-bold text-blue-400">{stats.revenue}</div>
            <div className="text-[10px] text-gray-500 mt-0.5">Revenus (F)</div>
          </div>
          <div className="bg-[#1E293B] border border-[#334155] rounded-xl p-3 text-center transition-all hover:-translate-y-0.5 hover:shadow-lg">
            <div className="text-2xl font-bold text-purple-400">{stats.completion}</div>
            <div className="text-[10px] text-gray-500 mt-0.5">Complétion</div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-[#1E293B] border border-[#334155] rounded-xl p-4 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-150 fill-mode-both">
          <h3 className="text-xs font-semibold text-gray-300 mb-3">Actions rapides</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <Link to={`/student/courses/${course.slug}`} className="flex flex-col items-center gap-2 p-3 bg-[#111827] rounded-xl hover:bg-[#1E293B] border border-[#334155] hover:border-blue-500/30 transition-all active:scale-95">
              <span className="text-xl">👁️</span>
              <span className="text-[10px] text-gray-400 font-medium">Aperçu étudiant</span>
            </Link>
            <Link to={`/instructor/courses/edit/${course.id}`} className="flex flex-col items-center gap-2 p-3 bg-[#111827] rounded-xl hover:bg-[#1E293B] border border-[#334155] hover:border-emerald-500/30 transition-all active:scale-95">
              <span className="text-xl">✏️</span>
              <span className="text-[10px] text-gray-400 font-medium">Modifier</span>
            </Link>
            <Link to={`/instructor/students`} className="flex flex-col items-center gap-2 p-3 bg-[#111827] rounded-xl hover:bg-[#1E293B] border border-[#334155] hover:border-purple-500/30 transition-all active:scale-95">
              <span className="text-xl">👥</span>
              <span className="text-[10px] text-gray-400 font-medium">Étudiants</span>
            </Link>
            <button className="flex flex-col items-center gap-2 p-3 bg-[#111827] rounded-xl hover:bg-[#1E293B] border border-[#334155] hover:border-amber-500/30 transition-all active:scale-95">
              <span className="text-xl">📊</span>
              <span className="text-[10px] text-gray-400 font-medium">Analytiques</span>
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-[#1E293B] border border-[#334155] rounded-xl overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500 delay-200 fill-mode-both">
          <div className="flex border-b border-[#334155] overflow-x-auto hide-scrollbar">
            <button onClick={() => setActiveTab('modules')} className={`flex-shrink-0 px-4 py-3 text-xs font-semibold border-b-2 transition-all ${activeTab === 'modules' ? 'text-emerald-400 border-emerald-500' : 'text-gray-400 border-transparent hover:text-white'}`}>📚 Programme</button>
            <button onClick={() => setActiveTab('reviews')} className={`flex-shrink-0 px-4 py-3 text-xs font-semibold border-b-2 transition-all ${activeTab === 'reviews' ? 'text-emerald-400 border-emerald-500' : 'text-gray-400 border-transparent hover:text-white'}`}>⭐ Avis (234)</button>
            <button onClick={() => setActiveTab('settings')} className={`flex-shrink-0 px-4 py-3 text-xs font-semibold border-b-2 transition-all ${activeTab === 'settings' ? 'text-emerald-400 border-emerald-500' : 'text-gray-400 border-transparent hover:text-white'}`}>⚙️ Paramètres</button>
          </div>

          <div className="p-4">
            {/* Tab: Modules */}
            {activeTab === 'modules' && (
              <div className="space-y-4">
                {chapters.length === 0 ? (
                  <p className="text-sm text-slate-500 italic text-center py-4">Aucun module n'a été créé.</p>
                ) : (
                  chapters.map((chapter, index) => {
                    const chapLessons = lessons.filter(l => l.chapterId === chapter.id);
                    const isExpanded = expandedModules[chapter.id] !== false; // Default expanded
                    const colorClasses = ["bg-emerald-500/10 text-emerald-400", "bg-blue-500/10 text-blue-400", "bg-orange-500/10 text-orange-400", "bg-purple-500/10 text-purple-400"];
                    const colorClass = colorClasses[index % colorClasses.length];

                    return (
                      <div key={chapter.id} className="mb-3">
                        <div className="flex items-center justify-between mb-2 cursor-pointer hover:bg-slate-800/50 p-2 rounded-lg transition-colors" onClick={() => toggleModule(chapter.id)}>
                          <div className="flex items-center gap-2">
                            <div className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs font-bold ${colorClass}`}>{index + 1}</div>
                            <h4 className="text-sm font-bold text-white">{chapter.title}</h4>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] text-gray-500">{chapLessons.length} leçons</span>
                            <ChevronDown className={`w-4 h-4 text-gray-500 transform transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                          </div>
                        </div>
                        
                        {isExpanded && (
                          <div className="space-y-1 ml-8 mt-2 animate-in slide-in-from-top-2 duration-200">
                            {chapLessons.map((lesson, lIndex) => (
                              <div key={lesson.id} className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-slate-800 transition-colors">
                                {lesson.type === 'video' ? <PlayCircle className="w-4 h-4 text-emerald-400 flex-shrink-0" /> : <FileText className="w-4 h-4 text-blue-400 flex-shrink-0" />}
                                <span className="text-xs text-gray-300 flex-1">{index + 1}.{lIndex + 1} {lesson.title}</span>
                                {lesson.duration && <span className="text-[10px] text-gray-600">{Math.floor(lesson.duration / 60)}:{(lesson.duration % 60).toString().padStart(2, '0')}</span>}
                              </div>
                            ))}
                            {chapLessons.length === 0 && <p className="text-[10px] text-slate-500 italic pl-3">Aucune leçon dans ce module.</p>}
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            )}

            {/* Tab: Reviews */}
            {activeTab === 'reviews' && (
              <div className="space-y-3">
                {[1, 2, 3].map((_, i) => (
                  <div key={i} className="bg-[#111827] rounded-xl p-3 border border-[#334155]">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-[10px] font-bold text-white">
                        {['JT', 'AK', 'PF'][i]}
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-white">{['Jean Talla', 'Amina Konaté', 'Paul Fotso'][i]}</p>
                        <p className="text-[10px] text-gray-500">{['Il y a 2 jours', 'Il y a 1 semaine', 'Il y a 2 semaines'][i]}</p>
                      </div>
                      <div className="ml-auto flex gap-0.5">
                        <Star className="w-3 h-3 text-amber-400 fill-amber-400" /><Star className="w-3 h-3 text-amber-400 fill-amber-400" /><Star className="w-3 h-3 text-amber-400 fill-amber-400" /><Star className="w-3 h-3 text-amber-400 fill-amber-400" /><Star className={`w-3 h-3 ${i === 2 ? 'text-gray-600' : 'text-amber-400 fill-amber-400'}`} />
                      </div>
                    </div>
                    <p className="text-xs text-gray-300 leading-relaxed">
                      {['Excellent cours ! Les exemples concrets du marché africain font toute la différence.', 'Très complet et bien structuré. Le module sur le SEO local est une pépite.', 'Bon cours dans l\'ensemble. J\'aurais aimé plus de contenu sur TikTok.'][i]}
                    </p>
                  </div>
                ))}
              </div>
            )}

            {/* Tab: Settings */}
            {activeTab === 'settings' && (
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-[#111827] rounded-xl">
                  <div>
                    <p className="text-sm text-white font-medium">Prix du cours</p>
                    <p className="text-[10px] text-gray-500">{course.isFree ? 'Gratuit' : `${course.price?.toLocaleString()} FCFA`}</p>
                  </div>
                  <Link to={`/instructor/courses/edit/${course.id}`} className="px-3 py-1.5 bg-[#1E293B] border border-[#334155] rounded-lg text-xs text-gray-400 hover:text-white transition-colors">Modifier</Link>
                </div>
                <div className="flex items-center justify-between p-3 bg-[#111827] rounded-xl">
                  <div>
                    <p className="text-sm text-white font-medium">Certificat</p>
                    <p className="text-[10px] text-emerald-400">Activé</p>
                  </div>
                  <div className="w-10 h-5 rounded-full bg-emerald-500 relative"><div className="w-4 h-4 rounded-full bg-white absolute top-0.5 right-0.5"></div></div>
                </div>
                <div className="flex items-center justify-between p-3 bg-[#111827] rounded-xl">
                  <div>
                    <p className="text-sm text-white font-medium">Contenu progressif</p>
                    <p className="text-[10px] text-gray-500">Désactivé</p>
                  </div>
                  <div className="w-10 h-5 rounded-full bg-[#334155] relative"><div className="w-4 h-4 rounded-full bg-gray-400 absolute top-0.5 left-0.5"></div></div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Preview Banner */}
        <div className="bg-gradient-to-r from-emerald-500/10 to-blue-500/10 border border-emerald-500/20 rounded-xl p-4 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-300 fill-mode-both">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center flex-shrink-0">
              <Eye className="w-5 h-5 text-blue-400" />
            </div>
            <div className="flex-1">
              <h4 className="text-sm font-bold text-white mb-1">Vérifiez votre cours avant publication</h4>
              <p className="text-xs text-gray-400 leading-relaxed">Utilisez l'aperçu pour voir exactement ce que vos étudiants verront. Vérifiez le contenu, les vidéos et les ressources.</p>
              <div className="flex flex-wrap items-center gap-2 mt-3">
                <Link to={`/student/courses/${course.slug}`} className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white text-xs font-semibold rounded-xl transition-colors flex items-center gap-1.5">
                  <PlayCircle className="w-4 h-4" />
                  Lire le cours
                </Link>
                <Link to={`/instructor/courses/edit/${course.id}`} className="px-4 py-2 bg-[#1E293B] hover:bg-[#334155] text-white text-xs font-medium rounded-xl border border-[#334155] transition-colors flex items-center gap-1.5">
                  <Edit2 className="w-4 h-4" />
                  Modifier
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Course Info */}
        <div className="bg-[#1E293B] border border-[#334155] rounded-xl p-4 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-500 fill-mode-both">
          <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
            <FileText className="w-4 h-4 text-emerald-400" />
            Informations du cours
          </h3>
          <div className="space-y-2.5">
            <div className="flex items-center gap-3 text-xs">
              <span className="text-gray-500 w-24">Catégorie</span>
              <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-400 rounded-md text-[10px] font-semibold">{course.categoryName || 'Général'}</span>
            </div>
            <div className="flex items-center gap-3 text-xs">
              <span className="text-gray-500 w-24">Niveau</span>
              <span className="text-gray-300 capitalize">{course.level || 'Tous niveaux'}</span>
            </div>
            <div className="flex items-center gap-3 text-xs">
              <span className="text-gray-500 w-24">Langue</span>
              <span className="text-gray-300">🇫🇷 Français</span>
            </div>
            <div className="flex items-center gap-3 text-xs">
              <span className="text-gray-500 w-24">Leçons</span>
              <span className="text-gray-300">{lessons.length} leçons</span>
            </div>
            <div className="flex items-center gap-3 text-xs">
              <span className="text-gray-500 w-24">Créé le</span>
              <span className="text-gray-300">{course.createdAt?.toDate ? course.createdAt.toDate().toLocaleDateString() : new Date().toLocaleDateString()}</span>
            </div>
          </div>
        </div>

      </main>

      {/* Bottom Action Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-[#0B0F19]/95 backdrop-blur-xl border-t border-[#334155] z-30">
        <div className="flex items-center justify-between px-4 py-3 max-w-4xl mx-auto">
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500 hidden sm:inline">Votre part :</span>
            <span className="text-sm font-bold text-emerald-400">{(course.price ? course.price * 0.7 : 0).toLocaleString()} F / étudiant</span>
          </div>
          <div className="flex items-center gap-2">
            <Link to={`/instructor/courses/edit/${course.id}`} className="px-4 py-2.5 bg-[#1E293B] border border-[#334155] text-white text-xs font-semibold rounded-xl hover:bg-[#334155] transition-colors flex items-center gap-1.5">
              <Edit2 className="w-4 h-4 hidden sm:inline" />
              Modifier
            </Link>
            <Link to={`/student/courses/${course.slug}`} className="px-4 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-slate-950 text-xs font-bold rounded-xl transition-colors shadow-[0_0_20px_rgba(16,185,129,0.3)] flex items-center gap-1.5">
              <PlayCircle className="w-4 h-4 hidden sm:inline" />
              Lire le cours
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
