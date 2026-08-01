import { useState, useMemo } from 'react';
import { BookOpen, Search, Compass, PlayCircle, Loader2 } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useMyCourses } from '../hooks/catalog/useCatalogClient';
import { TouchArea } from '../components/ui/TouchArea';
import { motion, AnimatePresence } from 'motion/react';

const TABS = [
  { id: 'all', label: 'Tous' },
  { id: 'inprogress', label: 'En cours' },
  { id: 'completed', label: 'Terminés' }
];

export function CoursesView() {
  const navigate = useNavigate();
  const { courses, loading: uiLoading } = useMyCourses();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('all');

  const filteredResults = useMemo(() => {
    let list = [...courses];
    
    if (activeTab === 'inprogress') {
        list = list.filter(c => c.progress > 0 && c.progress < 100);
    } else if (activeTab === 'completed') {
        list = list.filter(c => c.progress === 100);
    } else if (activeTab === 'favorites') {
        list = list.filter(c => c.isFavorite);
    }

    if (searchTerm.trim()) {
        const s = searchTerm.toLowerCase();
        list = list.filter(c => (c.title || '').toLowerCase().includes(s));
    }
    return list;
  }, [courses, activeTab, searchTerm]);

  const handleDragEnd = (event: any, info: any) => {
    const swipe = info.offset.x;
    if (swipe < -100) {
      const currentIndex = TABS.findIndex(t => t.id === activeTab);
      if (currentIndex < TABS.length - 1) setActiveTab(TABS[currentIndex + 1].id);
    } else if (swipe > 100) {
      const currentIndex = TABS.findIndex(t => t.id === activeTab);
      if (currentIndex > 0) setActiveTab(TABS[currentIndex - 1].id);
    }
  };

  if (uiLoading) {
    return (
      <div className="h-full w-full bg-[#0B0F19] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="h-full w-full flex flex-col overflow-hidden bg-[#0B0F19] antialiased">
      <header className="z-40 bg-[#0B0F19]/95 backdrop-blur-md border-b border-white/5 pt-4 shrink-0">
        <div className="px-4 pb-4">
            <h1 className="font-black text-2xl sm:text-3xl text-white mb-1 uppercase tracking-tight">Mes Formations</h1>
            <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">Suivi de progression</p>
        </div>

        <div className="w-full flex border-b border-white/5 h-12 px-4 justify-between gap-2 overflow-x-auto hide-scrollbar relative">
            {TABS.map(tab => (
                <button 
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex-1 relative h-full px-2 font-black text-[10px] uppercase tracking-widest transition-colors whitespace-nowrap
                        ${activeTab === tab.id ? 'text-emerald-400' : 'text-slate-500 hover:text-white'}`}
                >
                    {tab.label}
                    {activeTab === tab.id && (
                        <motion.div 
                            layoutId="activeTabUnderline"
                            className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-500"
                        />
                    )}
                </button>
            ))}
        </div>

        <div className="px-4 py-3 pb-2">
            <div className="relative group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-600 group-focus-within:text-emerald-400 transition-colors" />
                <input 
                    placeholder="Rechercher mes cours..." 
                    className="w-full h-10 sm:h-12 pl-11 pr-4 bg-white/5 border border-white/5 focus:border-emerald-500/50 outline-none rounded-full text-white placeholder:text-slate-600 transition-colors text-sm"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto hide-scrollbar px-2 sm:px-4 pt-4 pb-24 relative">
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
                           <Link key={course.id} to={`/student/courses/${course.slug || course.id}`} className="block">
                              <TouchArea className="rounded-2xl sm:rounded-3xl p-3 sm:p-4 card-hover relative overflow-hidden flex gap-3 sm:gap-4 border border-white/5 bg-white/[0.02] hover:bg-white/5 transition-colors">
                                  <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-xl sm:rounded-2xl bg-slate-900 overflow-hidden shrink-0 relative">
                                     <img src={course.thumbnail} alt={course.title} className={`w-full h-full object-cover transition-all ${course.progress === 0 ? 'opacity-50 grayscale' : 'opacity-80'}`} />
                                     {course.progress > 0 && course.progress < 100 && (
                                        <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-[2px]">
                                           <PlayCircle className="text-white w-8 h-8 shadow-lg" />
                                        </div>
                                     )}
                                  </div>
                                  <div className="flex-1 flex flex-col justify-center">
                                    <h3 className={`font-bold text-sm sm:text-base line-clamp-2 mb-2 ${course.progress === 0 ? 'text-slate-400' : 'text-white'}`}>{course.title}</h3>
                                    
                                    <div className="flex justify-between text-[9px] sm:text-[10px] uppercase font-black text-slate-500 mb-1.5 tracking-widest">
                                      <span>{course.progress}% • {course.completedLessons}/{course.totalLessons} leçons</span>
                                      <span className={course.progress === 100 ? 'text-emerald-400' : ''}>
                                        {course.progress === 100 ? 'Terminé' : course.progress === 0 ? 'Non commencé' : 'En cours'}
                                      </span>
                                    </div>
                                    <div className="w-full bg-white/5 rounded-full h-1 sm:h-1.5 overflow-hidden">
                                      <div 
                                        className={`h-full rounded-full ${course.progress === 100 ? 'bg-emerald-500' : course.progress === 0 ? 'bg-transparent' : 'bg-gradient-to-r from-emerald-500 to-teal-400 shadow-[0_0_10px_rgba(16,185,129,0.3)]'}`}
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
                        <div className="flex flex-col items-center justify-center py-16 px-4 text-center bg-white/[0.02] rounded-[2rem] border border-dashed border-white/5 animate-in zoom-in duration-500">
                            <div className="w-16 h-16 rounded-full bg-slate-800/50 flex items-center justify-center mx-auto mb-4 border border-white/5">
                                <BookOpen className="h-8 w-8 text-slate-500" />
                            </div>
                            <h3 className="text-sm font-bold text-slate-300 mb-2">Vous n'avez pas encore commencé de formation.</h3>
                            <p className="text-[11px] text-slate-500 leading-relaxed font-medium mb-6">
                                Explorez le catalogue pour acquérir vos premières compétences.
                            </p>
                            <button onClick={() => navigate("/student/catalog")} className="bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 rounded-full h-10 px-6 font-bold uppercase text-[10px] tracking-widest flex items-center justify-center transition-all active:scale-95 group">
                                <Compass className="h-4 w-4 mr-2 group-hover:rotate-45 transition-transform" />
                                Parcourir le catalogue
                            </button>
                        </div>
                    )}
                </motion.div>
            </AnimatePresence>
      </main>
    </div>
  );
}
