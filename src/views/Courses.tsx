import { useState, useMemo, useEffect } from 'react';
import { BookOpen, Search, Compass, PlayCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { db } from '../firebase';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { useRole } from '../context/RoleContext';
import { TouchArea } from '../components/ui/TouchArea';
import { Skeleton } from '../components/ui/Skeleton';
import { motion, AnimatePresence } from 'motion/react';

const TABS = [
  { id: 'all', label: 'Tous' },
  { id: 'inprogress', label: 'En cours' },
  { id: 'completed', label: 'Terminés' }
];

export function CoursesView() {
  const { currentUser } = useRole();
  const [courses, setCourses] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('all');

  useEffect(() => {
    if (!currentUser?.uid) {
        setIsLoading(false);
        return;
    }
    const q = query(collection(db, 'enrollments'), where('studentId', '==', currentUser.uid));
    const unsubscribe = onSnapshot(q, (snap) => {
        const loadedCourses: any[] = [];
        
        for (const docSnap of snap.docs) {
             const data = docSnap.data();
             loadedCourses.push({
                  id: data.courseId,
                  title: data.courseTitle || 'Formation Ndara',
                  progress: data.progress || 0,
                  image: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&q=80&w=200&h=200',
                  active: data.progress > 0
             });
        }
        setCourses(loadedCourses);
        setIsLoading(false);
    }, (e) => {
        console.error("Error fetching courses", e);
        setIsLoading(false);
    });

    return () => unsubscribe();
  }, [currentUser?.uid]);

  const filteredResults = useMemo(() => {
    let list = [...courses];
    
    if (activeTab === 'inprogress') {
        list = list.filter(c => c.progress > 0 && c.progress < 100);
    } else if (activeTab === 'completed') {
        list = list.filter(c => c.progress === 100);
    }

    if (searchTerm.trim()) {
        const s = searchTerm.toLowerCase();
        list = list.filter(c => c.title.toLowerCase().includes(s));
    }

    return list;
  }, [courses, activeTab, searchTerm]);

  // Handle Swipe logic
  const handleDragEnd = (e: any, { offset, velocity }: any) => {
    const swipe = Math.abs(offset.x) * velocity.x;
    
    if (swipe < -100) {
      // Swiped left, go to next tab
      const currentIndex = TABS.findIndex(t => t.id === activeTab);
      if (currentIndex < TABS.length - 1) setActiveTab(TABS[currentIndex + 1].id);
    } else if (swipe > 100) {
      // Swiped right, go to prev tab
      const currentIndex = TABS.findIndex(t => t.id === activeTab);
      if (currentIndex > 0) setActiveTab(TABS[currentIndex - 1].id);
    }
  };

  return (
    <div className="flex flex-col gap-0 pb-24 min-h-screen relative overflow-hidden bg-black max-w-md mx-auto z-10 w-full pt-16">
      {/* --- HEADER FIXE --- */}
      <header className="sticky top-0 z-40 bg-black/95 backdrop-blur-md border-b border-white/5 safe-area-pt">
        <div className="px-4 py-4 pt-4">
            <h1 className="font-black text-2xl sm:text-3xl text-white mb-1 uppercase tracking-tight">Mes Formations</h1>
            <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">Gérez votre apprentissage</p>
        </div>

        {/* Onglets Style Qwen avec Motion */}
        <div className="w-full flex border-b border-white/5 h-12 px-4 justify-between gap-2 overflow-x-auto hide-scrollbar relative">
            {TABS.map(tab => (
                <button 
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex-1 relative h-full px-2 font-black text-[10px] uppercase tracking-widest transition-colors whitespace-nowrap
                        ${activeTab === tab.id ? 'text-primary' : 'text-slate-500 hover:text-white'}`}
                >
                    {tab.label}
                    {activeTab === tab.id && (
                        <motion.div 
                            layoutId="activeTabUnderline"
                            className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary"
                        />
                    )}
                </button>
            ))}
        </div>

        {/* Barre de Recherche Locale */}
        <div className="px-4 py-3 pb-2">
            <div className="relative group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-600 group-focus-within:text-primary transition-colors" />
                <input 
                    placeholder="Rechercher mes cours..." 
                    className="w-full h-10 sm:h-12 pl-11 pr-4 bg-[#111111] border border-white/5 focus:border-primary/50 outline-none rounded-full text-white placeholder:text-slate-600 transition-colors text-sm"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>
        </div>
      </header>

      {/* --- LISTE DES COURS --- */}
      <main className="px-2 sm:px-4 pt-4 relative min-h-[300px] overflow-hidden">
        {isLoading ? (
            <div className="space-y-3">
                {[...Array(3)].map((_, i) => (
                    <Skeleton key={i} className="h-28 w-full rounded-3xl" />
                ))}
            </div>
        ) : (
            <AnimatePresence mode="wait">
                <motion.div
                    key={activeTab}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.2 }}
                    drag="x"
                    dragConstraints={{ left: 0, right: 0 }}
                    dragElastic={0.2}
                    onDragEnd={handleDragEnd}
                    className="space-y-3 pb-8"
                >
                    {filteredResults.length > 0 ? (
                        filteredResults.map((course: any) => (
                           <Link key={course.id} to={`/student/catalog/${course.id}`} className="block">
                              <TouchArea className="glass rounded-2xl sm:rounded-3xl p-3 sm:p-4 card-hover relative overflow-hidden flex gap-3 sm:gap-4 border border-white/5 bg-[#111111]">
                                  <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-xl sm:rounded-2xl bg-card overflow-hidden shrink-0 relative">
                                     <img src={course.image} alt={course.title} className={`w-full h-full object-cover transition-all ${course.progress === 0 ? 'opacity-50 grayscale' : 'opacity-80'}`} />
                                     {course.progress > 0 && course.progress < 100 && (
                                        <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                                           <PlayCircle className="text-white w-8 h-8 shadow-lg" />
                                        </div>
                                     )}
                                  </div>
                                  <div className="flex-1 flex flex-col justify-center">
                                    <h3 className={`font-bold text-sm sm:text-base line-clamp-2 mb-2 ${course.progress === 0 ? 'text-gray-400' : 'text-white'}`}>{course.title}</h3>
                                    
                                    <div className="flex justify-between text-[9px] sm:text-[10px] uppercase font-black text-gray-500 mb-1.5 tracking-widest">
                                      <span>{course.progress}%</span>
                                      <span>{course.progress === 100 ? 'Complété' : course.progress === 0 ? 'Non commencé' : 'En progression'}</span>
                                    </div>
                                    <div className="w-full bg-black/50 rounded-full h-1 sm:h-1.5 overflow-hidden">
                                      <div 
                                        className={`h-full rounded-full ${course.progress === 100 ? 'bg-amber-500' : course.progress === 0 ? 'bg-white/10' : 'bg-gradient-to-r from-primary to-teal-400 shadow-[0_0_10px_rgba(16,185,129,0.8)]'}`}
                                        style={{ width: `${course.progress > 0 ? course.progress : 0}%` }}
                                      />
                                    </div>
                                  </div>
                              </TouchArea>
                           </Link>
                        ))
                    ) : searchTerm ? (
                        <div className="py-20 text-center flex flex-col items-center opacity-30">
                            <Search className="h-12 w-12 mb-4 text-slate-600" />
                            <p className="text-sm font-black uppercase tracking-widest text-slate-500">Aucun résultat</p>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-16 px-4 text-center bg-[#111111] rounded-[2rem] border border-white/5 animate-in zoom-in duration-500">
                            <div className="p-6 sm:p-8 bg-black rounded-full mb-6 relative">
                                <BookOpen className="h-8 w-8 sm:h-10 sm:w-10 text-slate-700" />
                            </div>
                            <h3 className="text-lg sm:text-xl font-black text-white uppercase tracking-tight">Aucune formation</h3>
                            <p className="text-slate-500 text-xs mt-3 leading-relaxed max-w-[220px] mx-auto font-medium italic">
                                "Le savoir n'attend pas." <br/>Explorez notre catalogue pour commencer.
                            </p>
                            <TouchArea as={Link} to="/student/search" className="mt-8 bg-primary hover:bg-emerald-400 text-black rounded-full h-12 px-8 font-black uppercase text-[10px] tracking-widest flex items-center justify-center shadow-[0_4px_20px_rgba(16,185,129,0.3)] transition-all active:scale-95 group">
                                <Compass className="h-4 w-4 mr-2 group-hover:rotate-45 transition-transform" />
                                Parcourir le catalogue
                            </TouchArea>
                        </div>
                    )}
                </motion.div>
            </AnimatePresence>
        )}
      </main>
    </div>
  );
}
