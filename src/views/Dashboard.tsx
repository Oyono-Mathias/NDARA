import { useNavigate } from "react-router-dom";
import { Play, BookOpen, Award, ArrowRight, Bot, Sparkles, Search, CheckCircle2, ChevronRight, Flame, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import { useRole } from "../context/RoleContext";
import { collection, query, where, onSnapshot, getDocs, limit } from "firebase/firestore";
import { db } from "../firebase";

export function Dashboard() {
  const navigate = useNavigate();
  const { currentUser } = useRole();
  const [coursesCount, setCoursesCount] = useState({ total: 0, active: 0, completed: 0 });
  const [recentCourses, setRecentCourses] = useState<any[]>([]);
  const [recommendedCourses, setRecommendedCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!currentUser?.uid) return;
    
    // Enrollments
    const q = query(collection(db, 'enrollments'), where('studentId', '==', currentUser.uid));
    const unsubscribe = onSnapshot(q, async (snap) => {
        let total = snap.size;
        let active = 0;
        let completed = 0;
        const enrolledCourseIds: string[] = [];
        
        snap.forEach(doc => {
            const data = doc.data();
            enrolledCourseIds.push(data.courseId);
            if (data.progress === 100) completed++;
            else if (data.progress > 0) active++;
        });
        setCoursesCount({ total, active, completed });
        
        // Fetch recent enrolled courses
        if (enrolledCourseIds.length > 0) {
            // For simplicity, just get all courses and filter, or just query first 2 if we have IDs
            const coursesRef = collection(db, 'courses');
            const recentSnap = await getDocs(coursesRef); // In prod, use 'in' query in chunks
            const myRecent = recentSnap.docs
                .filter(d => enrolledCourseIds.includes(d.id))
                .slice(0, 2)
                .map(d => ({ id: d.id, ...d.data() }));
            setRecentCourses(myRecent);
        }
        
        // Recommended (Any course not enrolled)
        const coursesRef = collection(db, 'courses');
        const allCoursesSnap = await getDocs(query(coursesRef, where('status', '==', 'Published'), limit(5)));
        const recommended = allCoursesSnap.docs
            .filter(d => !enrolledCourseIds.includes(d.id))
            .map(d => ({ id: d.id, ...d.data() }));
        
        setRecommendedCourses(recommended.length > 0 ? recommended : allCoursesSnap.docs.map(d => ({id: d.id, ...d.data()})));
        setLoading(false);
    });
    
    return () => unsubscribe();
  }, [currentUser?.uid]);

  const days = [
    { label: 'Lun', status: 'completed', value: '✓' },
    { label: 'Mar', status: 'completed', value: '✓' },
    { label: 'Mer', status: 'completed', value: '✓' },
    { label: 'Jeu', status: 'completed', value: '✓' },
    { label: 'Ven', status: 'completed', value: '✓' },
    { label: 'Sam', status: 'today', value: '6h' },
    { label: 'Dim', status: 'upcoming', value: '-' },
  ];

  if (loading) {
    return <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;
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

      {/* Weekly Progress */}
      <section className="px-1">
        <div className="rounded-2xl p-5 border border-primary/20 bg-gradient-to-br from-primary/10 to-transparent">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-sm font-bold text-white">Progression hebdo</h2>
            <span className="text-xs font-semibold text-primary">+12% vs sem. dernière</span>
          </div>
          <div className="flex justify-between items-center">
            {days.map((day, i) => (
              <div key={i} className="flex flex-col items-center gap-2 flex-1">
                <span className={`text-[11px] font-semibold ${day.status === 'today' ? 'text-primary' : (day.status === 'completed' ? 'text-white' : 'text-slate-500')}`}>
                  {day.label}
                </span>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-bold transition-all ${
                  day.status === 'completed' ? 'bg-gradient-to-br from-emerald-600 to-primary text-white shadow-[0_2px_8px_rgba(16,185,129,0.4)]' : 
                  day.status === 'today' ? 'border-2 border-primary bg-primary/20 text-primary' : 
                  'bg-white/5 text-slate-500'
                }`}>
                  {day.value}
                </div>
              </div>
            ))}
          </div>
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
                        onClick={() => navigate(`/student/courses/${course.slug}`)}
                    >
                    <div className="relative w-full h-32">
                        <img src={course.thumbnail || "https://images.unsplash.com/photo-1526379095098-d400fd0bfce8?auto=format&fit=crop&q=80"} alt={course.title} className="w-full h-full object-cover" />
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
                <div key={course.id || i} onClick={() => navigate(`/student/courses/${course.slug}`)} className="min-w-[160px] max-w-[160px] glass-light rounded-2xl overflow-hidden border border-white/5 cursor-pointer card-hover snap-start shrink-0">
                    <img src={course.thumbnail || "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&q=80"} alt={course.title} className="w-full h-24 object-cover" />
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

      {/* Badges / Achievements */}
      <section className="mb-8">
        <div className="flex justify-between items-center mb-4 px-2">
          <h2 className="text-base font-bold text-white tracking-tight">Vos badges</h2>
        </div>
        
        <div className="flex gap-3 overflow-x-auto hide-scrollbar sm:px-2 px-1 snap-x snap-mandatory pb-4">
            <div className="min-w-[130px] shrink-0 p-4 rounded-2xl bg-gradient-to-br from-amber-500/15 to-transparent border border-amber-500/20 text-center snap-start card-hover cursor-pointer">
                <div className="text-3xl mb-2">🏅</div>
                <h3 className="text-[11px] font-bold text-white mb-1">Bienvenue</h3>
                <p className="text-[9px] text-gray-400">Inscrit sur Ndara</p>
            </div>
            <div className="min-w-[130px] shrink-0 p-4 rounded-2xl bg-gradient-to-br from-orange-500/15 to-transparent border border-orange-500/20 text-center snap-start card-hover cursor-pointer">
                <div className="text-3xl mb-2">🔥</div>
                <h3 className="text-[11px] font-bold text-white mb-1">Motivé</h3>
                <p className="text-[9px] text-gray-400">Série de connexion</p>
            </div>
            <div className="min-w-[130px] shrink-0 p-4 rounded-2xl bg-white/5 border border-white/5 text-center snap-start opacity-70 card-hover cursor-pointer">
                <div className="text-3xl mb-2 grayscale">🏆</div>
                <h3 className="text-[11px] font-bold text-white mb-1">Premier cours</h3>
                <p className="text-[9px] text-gray-400">Terminez un cours</p>
            </div>
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

