import { useNavigate } from "react-router-dom";
import { formatImageUrl } from "../lib/utils";
import { Play, BookOpen, Award, ArrowRight, Bot, Sparkles, Search, CheckCircle2, ChevronRight, Flame, Loader2, MessageCircleQuestion } from "lucide-react";
import { useState, useEffect } from "react";
import { useRole } from "../context/RoleContext";
import { collection, query, where, onSnapshot, getDocs, limit, getCountFromServer, orderBy, getDoc, doc } from "firebase/firestore";
import { db } from "../firebase";

export function Dashboard() {
  const navigate = useNavigate();
  const { currentUser } = useRole();
  const [coursesCount, setCoursesCount] = useState({ total: 0, active: 0, completed: 0 });
  const [recentCourses, setRecentCourses] = useState<any[]>([]);
  const [recommendedCourses, setRecommendedCourses] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [avgProgress, setAvgProgress] = useState(0);
  const [studentBadges, setStudentBadges] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!currentUser?.uid) return;
    
    let isMounted = true;
    
    const fetchDashboardStats = async () => {
        try {
            // FinOps: Utilisation de getCountFromServer (1 read) pour les compteurs globaux
            const enrollmentsRef = collection(db, 'enrollments');
            const totalSnap = await getCountFromServer(query(enrollmentsRef, where('studentId', '==', currentUser.uid)));
            const completedSnap = await getCountFromServer(query(enrollmentsRef, where('studentId', '==', currentUser.uid), where('progress', '==', 100)));
            const activeSnap = await getCountFromServer(query(enrollmentsRef, where('studentId', '==', currentUser.uid), where('progress', '>', 0), where('progress', '<', 100)));
            
            if (isMounted) {
                setCoursesCount({ 
                    total: totalSnap.data().count, 
                    active: activeSnap.data().count, 
                    completed: completedSnap.data().count 
                });
            }

            // Récupération de quelques cours (Limité à 2)
            const enrolSnap = await getDocs(query(enrollmentsRef, where('studentId', '==', currentUser.uid), limit(2)));
            const enrolledCourseIds = enrolSnap.docs.map(d => d.data().courseId);
            
            if (enrolledCourseIds.length > 0) {
                 const coursesRef = collection(db, 'courses');
                 // En prod, vous devriez utiliser 'in' sur ces IDs, mais pour éviter les erreurs d'Index/where-in avec tableaux vides, on fait 2 reads directs :
                 const myRecentPromises = enrolledCourseIds.map(async id => {
                     try {
                         const snap = await getDoc(doc(coursesRef, id));
                         if (snap.exists()) return snap;
                     } catch (e) {
                         console.warn("Failed to fetch course: " + id, e);
                     }
                     return null;
                 });
                 const myRecentSnaps = await Promise.all(myRecentPromises);
                 // Fusion avec la progression
                 const myRecent = myRecentSnaps.map((snap, i) => {
                     if (snap) {
                        return { id: snap.id, ...snap.data(), progress: enrolSnap.docs[i].data().progress || 0 }
                     }
                     return null;
                 }).filter(Boolean);
                 if (isMounted) setRecentCourses(myRecent);
            }

            // Recommended (Limité à 5)
            const allCoursesSnap = await getDocs(query(collection(db, 'courses'), where('status', '==', 'Published'), limit(5)));
            if (isMounted) {
                 const recommended = allCoursesSnap.docs
                     .filter(d => !enrolledCourseIds.includes(d.id))
                     .map(d => ({ id: d.id, ...d.data() }));
                 setRecommendedCourses(recommended.length > 0 ? recommended : allCoursesSnap.docs.map(d => ({id: d.id, ...d.data()})));
                 setLoading(false);
            }

        } catch (error) {
            console.error("Dashboard FinOps Error:", error);
            if (isMounted) setLoading(false);
        }
    };
    
    fetchDashboardStats();
    
    // Temps Réel Hyper-Optimisé : Flux direct avec l'instructeur (QnA "Résolues" par exemple)
    const unsubNotifications = onSnapshot(
        query(
            collection(db, 'course_qna'),
            where('studentId', '==', currentUser.uid),
            where('isAnswered', '==', true),
            limit(3)
        ), 
        (snap) => {
            if (isMounted) {
                setNotifications(snap.docs.map(d => ({ id: d.id, ...d.data() })));
            }
        },
        (error) => console.log("Realtime QnA stream error (Index probably missing, graceful degradation)", error)
    );

    // Progression globale en temps réel
    const unsubProgress = onSnapshot(
        query(collection(db, 'enrollments'), where('studentId', '==', currentUser.uid)),
        (snap) => {
            let total = 0;
            snap.forEach(d => { total += Number(d.data().progress) || 0; });
            const avg = snap.size > 0 ? Math.round(total / snap.size) : 0;
            if (isMounted) setAvgProgress(avg);
        },
        (error) => console.log('Error pulling progress:', error)
    );

    // Badges en temps réel
    const unsubBadges = onSnapshot(
        query(collection(db, 'student_badges'), where('userId', '==', currentUser.uid)),
        (snap) => {
            if (isMounted) {
                setStudentBadges(snap.docs.map(d => ({ id: d.id, ...d.data() })));
            }
        },
        (error) => console.log('Error pulling badges:', error)
    );

    return () => {
        isMounted = false;
        unsubNotifications();
        unsubProgress();
        unsubBadges();
    };
  }, [currentUser?.uid]);



  if (loading) {
    return (
      <div className="space-y-6 px-1 pb-24 animate-pulse pt-4">
        <div className="h-12 w-3/4 bg-white/5 rounded-lg mb-4"></div>
        <div className="grid grid-cols-4 gap-3">
          {[1,2,3,4].map(i => <div key={i} className="h-24 bg-white/5 rounded-2xl"></div>)}
        </div>
        <div className="h-32 bg-white/5 rounded-2xl w-full"></div>
        <div className="h-48 bg-white/5 rounded-3xl w-full"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-top-4 duration-700 relative pb-24">
      {/* Welcome Section */}
      <header className="px-1">
        <p className="text-gray-400 text-xs font-medium mb-1 tracking-widest uppercase">Bonjour</p>
        <h1 className="font-serif text-4xl text-white mb-1 leading-[1.1] tracking-tight">
          {currentUser?.fullName?.split(' ')[0] || "Étudiant"}.
        </h1>
        <p className="text-primary text-sm font-medium">Bara ala, Tonga na ndara</p>
      </header>

      {/* Stats Grid */}
      <section className="grid grid-cols-4 gap-3 px-1">
        <div className="glass-light rounded-2xl p-3 text-center card-hover cursor-pointer border border-white/5" onClick={() => navigate('/student/courses')}>
          <div className="w-9 h-9 rounded-xl bg-primary/20 flex items-center justify-center mx-auto mb-2 text-primary">
            <BookOpen className="w-4 h-4" />
          </div>
          <p className="font-serif text-xl font-black text-white leading-[1.2]">{coursesCount.active}</p>
          <p className="text-gray-400 text-[9px] font-semibold tracking-wide uppercase mt-1">En cours</p>
        </div>
        
        <div className="glass-light rounded-2xl p-3 text-center card-hover cursor-pointer border border-white/5" onClick={() => navigate('/student/courses')}>
          <div className="w-9 h-9 rounded-xl bg-blue-500/20 flex items-center justify-center mx-auto mb-2 text-blue-400">
            <CheckCircle2 className="w-4 h-4" />
          </div>
          <p className="font-serif text-xl font-black text-white leading-[1.2]">{coursesCount.completed}</p>
          <p className="text-gray-400 text-[9px] font-semibold tracking-wide uppercase mt-1">Terminés</p>
        </div>
        
        <div className="glass-light rounded-2xl p-3 text-center card-hover cursor-pointer border border-white/5" onClick={() => navigate('/student/certificates')}>
          <div className="w-9 h-9 rounded-xl bg-amber-500/20 flex items-center justify-center mx-auto mb-2 text-amber-500">
            <Award className="w-4 h-4" />
          </div>
          <p className="font-serif text-xl font-black text-white leading-[1.2]">0</p>
          <p className="text-gray-400 text-[9px] font-semibold tracking-wide uppercase mt-1">Certificats</p>
        </div>
        
        <div className="glass-light rounded-2xl p-3 text-center card-hover cursor-pointer border border-orange-500/20 bg-gradient-to-br from-orange-500/10 to-transparent">
          <div className="w-9 h-9 rounded-xl bg-orange-500/20 flex items-center justify-center mx-auto mb-2 text-orange-500">
            <Flame className="w-4 h-4" />
          </div>
          <p className="font-serif text-xl font-black text-orange-500 leading-[1.2]">1</p>
          <p className="text-gray-400 text-[9px] font-semibold tracking-wide uppercase mt-1">Jours 🔥</p>
        </div>
      </section>

      {/* Overall Progress */}
      <section className="px-1">
        <div className="rounded-2xl p-5 border border-primary/20 bg-gradient-to-br from-primary/10 to-transparent">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-sm font-bold text-white">Progression Globale</h2>
            <span className="text-xs font-semibold text-primary">{avgProgress}% complété</span>
          </div>
          <div className="w-full bg-white/10 rounded-full h-3 mb-2 overflow-hidden border border-white/5">
              <div 
                  className="bg-gradient-to-r from-primary to-emerald-400 h-3 rounded-full transition-all duration-1000 ease-out"
                  style={{ width: `${avgProgress}%` }}
              ></div>
          </div>
          <p className="text-[10px] text-gray-400">Basé sur la moyenne de tous vos cours en cours et terminés.</p>
        </div>
      </section>

      {/* Continue Learning */}
      <section className="px-1">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-base font-bold text-white tracking-tight">Continuer à apprendre</h2>
          <button 
            onClick={() => navigate('/student/courses')}
            className="text-xs font-semibold text-primary hover:text-emerald-400 flex items-center gap-1 transition-colors"
          >
            Tout voir <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
        
        <div className="space-y-4">
            {recentCourses.length === 0 ? (
                <div className="text-center py-6 text-slate-400 text-sm">
                    Vous n'avez pas encore de cours en cours. Parcourez le catalogue !
                </div>
            ) : (
                recentCourses.map((course: any) => (
                    <div 
                        key={course.id}
                        className="glass rounded-3xl overflow-hidden card-hover cursor-pointer border border-white/5 relative group"
                        onClick={() => navigate(`/student/catalog/${course.id}`)}
                    >
                    <div className="relative w-full h-32">
                        <img src={formatImageUrl(course.thumbnail) || "https://images.unsplash.com/photo-1526379095098-d400fd0bfce8?auto=format&fit=crop&q=80"} alt={course.title} className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/30 group-hover:bg-black/40 transition-colors flex items-center justify-center">
                            <div className="w-12 h-12 rounded-full bg-primary/90 flex items-center justify-center shadow-[0_4px_20px_rgba(16,185,129,0.5)] transform scale-0 group-hover:scale-100 transition-transform">
                                <Play className="w-5 h-5 text-black fill-current ml-1" />
                            </div>
                        </div>
                    </div>
                    <div className="p-4">
                        <div className="text-[10px] font-bold text-primary tracking-widest uppercase mb-1.5">{course.category || "Formation"}</div>
                        <h3 className="text-sm font-bold text-white mb-1 leading-tight">{course.title}</h3>
                        
                        <div className="flex items-center gap-3 mt-3">
                            <div className="flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden">
                                <div className="h-full bg-gradient-to-r from-primary to-emerald-400 w-1/3 rounded-full" />
                            </div>
                            <span className="text-xs font-bold text-primary">33%</span>
                        </div>
                    </div>
                    </div>
                ))
            )}
        </div>
      </section>

      {/* Recommended for you (Horizontal Scroll) */}
      <section>
        <div className="flex justify-between items-center mb-4 px-2">
          <h2 className="text-base font-bold text-white tracking-tight">Recommandés pour vous</h2>
          <button 
            onClick={() => navigate('/student/search')}
            className="text-xs font-semibold text-primary hover:text-emerald-400 flex items-center gap-1 transition-colors"
          >
            Tout voir <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
        
        <div className="flex gap-4 overflow-x-auto hide-scrollbar sm:px-2 px-1 pb-4 snap-x snap-mandatory">
            {recommendedCourses.map((course, i) => (
                <div key={course.id || i} onClick={() => navigate(`/student/catalog/${course.id}`)} className="min-w-[160px] max-w-[160px] glass-light rounded-2xl overflow-hidden border border-white/5 cursor-pointer card-hover snap-start shrink-0">
                    <img src={formatImageUrl(course.thumbnail) || "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&q=80"} alt={course.title} className="w-full h-24 object-cover" />
                    <div className="p-3">
                        <div className="text-[9px] font-bold text-primary tracking-widest uppercase mb-1">{course.category || "Formation"}</div>
                        <h3 className="text-xs font-bold text-white mb-2 leading-snug line-clamp-2">{course.title}</h3>
                        <div className="flex items-center justify-between">
                            <span className="flex items-center gap-1 text-[11px] font-semibold text-amber-500">
                                <Award className="w-3 h-3 fill-amber-500 text-amber-500" />
                                {course.rating || "Nouveau"}
                            </span>
                            <span className="text-[10px] font-medium text-gray-400">{course.price || "Gratuit"} XAF</span>
                        </div>
                    </div>
                </div>
            ))}
        </div>
      </section>

      {/* Realtime Notifications Feed */}
      {notifications.length > 0 && (
          <section className="px-1 mb-8">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
                  <MessageCircleQuestion className="w-4 h-4 text-emerald-400" /> Réponses récentes
              </h2>
            </div>
            <div className="space-y-3">
                {notifications.map((notif: any) => (
                    <div key={notif.id} className="p-4 glass-light rounded-2xl border border-emerald-500/20 bg-emerald-500/5 animate-in fade-in slide-in-from-left-4">
                        <div className="flex justify-between items-start mb-2">
                            <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400 bg-emerald-400/10 px-2 py-1 rounded">Instructeur a répondu</span>
                        </div>
                        <p className="text-sm text-slate-300 line-clamp-2">"{notif.answer || "Voir la réponse"}"</p>
                    </div>
                ))}
            </div>
          </section>
      )}

      {/* Badges / Achievements */}
      <section className="mb-8">
        <div className="flex justify-between items-center mb-4 px-2">
          <h2 className="text-base font-bold text-white tracking-tight">Vos badges</h2>
        </div>
        
        <div className="flex gap-3 overflow-x-auto hide-scrollbar sm:px-2 px-1 snap-x snap-mandatory pb-4">
            {studentBadges.length > 0 ? (
                studentBadges.map(badge => (
                    <div key={badge.id} className="min-w-[130px] shrink-0 p-4 rounded-2xl bg-gradient-to-br from-amber-500/15 to-transparent border border-amber-500/20 text-center snap-start card-hover cursor-pointer">
                        <div className="text-3xl mb-2">{badge.icon || "🏅"}</div>
                        <h3 className="text-[11px] font-bold text-white mb-1">{badge.title}</h3>
                        <p className="text-[9px] text-gray-400">{badge.description}</p>
                    </div>
                ))
            ) : (
                <div className="text-center w-full py-4 text-xs text-slate-500">
                    Complétez des cours pour gagner des badges !
                </div>
            )}
        </div>
      </section>
      
      <button 
        onClick={() => navigate('/student/search')}
        className="fixed bottom-[104px] right-6 h-14 w-14 rounded-full bg-primary hover:bg-emerald-400 flex items-center justify-center shadow-[0_4px_20px_rgba(16,185,129,0.5)] z-50 active:scale-95 transition-all outline-none border-none"
      >
        <Search className="h-6 w-6 text-black font-black" />
      </button>

    </div>
  );
}

