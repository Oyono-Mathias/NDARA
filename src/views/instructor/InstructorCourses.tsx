import { useState, useMemo, useEffect } from 'react';
import { useRole } from '../../context/RoleContext';
import { getFirestore, collection, query, where, onSnapshot, doc, deleteDoc } from 'firebase/firestore';
import { PlusCircle, Search, SlidersHorizontal, BookOpen, Trash2, Edit2, Play, Users } from 'lucide-react';
import { Link } from 'react-router-dom';
import { db } from '../../firebase';
import { formatImageUrl } from '../../lib/utils';

export function InstructorCourses() {
  const { currentUser } = useRole();
  const [courses, setCourses] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (!currentUser?.uid) return;

    setIsLoading(true);
    const q = query(collection(db, 'courses'), where('instructorId', '==', currentUser.uid));

    const unsubscribe = onSnapshot(q, (snap) => {
      const courseData = snap.docs.map(doc => ({ id: doc.id, ...(doc.data() as any) }));
      const sortedCourses = courseData.sort((a, b) => {
          const dateA = (a.createdAt as any)?.toDate?.() || new Date(0);
          const dateB = (b.createdAt as any)?.toDate?.() || new Date(0);
          return dateB.getTime() - dateA.getTime();
      });
      setCourses(sortedCourses);
      setIsLoading(false);
    }, (error) => {
        console.error("Error fetching instructor courses:", error);
        setIsLoading(false);
    });

    return () => unsubscribe();
  }, [currentUser?.uid]);

  const filteredCourses = useMemo(() => {
    return courses.filter(c => c.title.toLowerCase().includes(searchTerm.toLowerCase()));
  }, [courses, searchTerm]);

  const handleDeleteCourse = async (courseId: string) => {
      if (window.confirm("Supprimer cette formation ? Cette action est irréversible.")) {
          try {
              await deleteDoc(doc(db, 'courses', courseId));
              alert("Formation supprimée");
          } catch (error) {
              alert("Erreur lors de la suppression");
          }
      }
  };

  return (
    <div className="flex flex-col gap-0 pb-40 min-h-full relative font-sans -m-4 md:-m-8 p-4 md:p-8">
      <div className="grain-overlay opacity-[0.03] pointer-events-none" />

      {/* --- HEADER IMMERSIF --- */}
      <header className="z-10 bg-[#0f172a]/95 backdrop-blur-md rounded-3xl p-6 mb-8 border border-white/5">
        <div className="flex items-center justify-between mb-6">
            <h1 className="font-black text-2xl text-white tracking-tight uppercase">Mon Catalogue</h1>
            <button className="w-10 h-10 rounded-full bg-[#1e293b] flex items-center justify-center text-slate-400 hover:text-white transition active:scale-90">
                <SlidersHorizontal className="h-5 w-5" />
            </button>
        </div>

        {/* Search Bar */}
        <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500 group-focus-within:text-primary transition-colors" />
            <input 
                type="text"
                placeholder="Rechercher un cours..." 
                className="w-full h-14 pl-12 pr-4 bg-[#1e293b] border border-white/5 rounded-[2rem] text-white placeholder:text-slate-600 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all shadow-xl"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
            />
        </div>
      </header>

      {/* --- MAIN CONTENT --- */}
      <main className="flex-1 space-y-6 animate-in fade-in duration-700">
        
        {isLoading ? (
            <div className="space-y-6">
                {[...Array(2)].map((_, i) => (
                    <div key={i} className="space-y-4">
                        <div className="aspect-video w-full rounded-[2.5rem] bg-slate-900 border border-white/5 animate-pulse" />
                        <div className="h-4 w-3/4 bg-slate-900 animate-pulse rounded" />
                    </div>
                ))}
            </div>
        ) : filteredCourses.length > 0 ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {filteredCourses.map(course => (
                    <CourseCard 
                        key={course.id} 
                        course={course} 
                        onDelete={() => handleDeleteCourse(course.id)}
                    />
                ))}
            </div>
        ) : (
            <div className="flex flex-col items-center justify-center py-20 px-8 text-center bg-[#1e293b]/50 rounded-[3rem] border-2 border-dashed border-white/5 animate-in zoom-in duration-500">
                <div className="p-8 bg-slate-800/50 rounded-full mb-6">
                    <BookOpen className="h-16 w-16 text-slate-700" />
                </div>
                <h3 className="text-2xl font-black text-white uppercase tracking-tight">Catalogue vide</h3>
                <p className="text-slate-500 text-sm mt-3 leading-relaxed max-w-[220px] mx-auto font-medium italic">
                    "Le savoir se partage." <br/>Créez votre première formation pour inspirer la communauté.
                </p>
                <Link to="/instructor/courses/create" className="mt-8 flex items-center justify-center gap-2 bg-primary hover:bg-primary/90 text-slate-950 rounded-[2rem] h-14 px-8 font-black uppercase text-xs tracking-widest shadow-xl shadow-primary/20 transition-all active:scale-95 group">
                    <PlusCircle className="h-5 w-5" />
                    Créer mon cours
                </Link>
            </div>
        )}
      </main>

      {/* --- STICKY ACTION BUTTON --- */}
      <div className="fixed bottom-0 md:bottom-auto md:right-8 md:top-8 left-0 right-0 p-6 md:p-0 md:w-auto bg-gradient-to-t from-[#0f172a] via-[#0f172a] to-transparent md:bg-transparent z-40">
          <Link to="/instructor/courses/create" className="flex items-center justify-center w-full md:w-auto h-16 md:h-14 md:px-8 rounded-[2rem] bg-gradient-to-r from-primary to-emerald-600 text-slate-950 font-black uppercase text-sm md:text-xs tracking-widest shadow-[0_0_25px_rgba(16,185,129,0.4)] hover:scale-105 active:scale-95 transition-all gap-3">
              <PlusCircle className="h-6 w-6 md:h-5 md:w-5" />
              Nouvelle Formation
          </Link>
      </div>
    </div>
  );
}

function CourseCard({ course, onDelete }: any) {
    const isDraft = course.status === 'Draft';
    
    return (
        <div className="bg-[#1e293b] rounded-[2.5rem] p-5 relative overflow-hidden group border border-white/5 hover:border-primary/30 transition-colors shadow-2xl">
            <div className={`absolute top-0 left-0 w-full h-1 ${isDraft ? 'bg-amber-500' : 'bg-primary'} opacity-50`}></div>
            <div className="w-full h-48 rounded-[2rem] overflow-hidden bg-slate-900 mb-5 relative group-hover:shadow-[0_0_20px_rgba(16,185,129,0.15)] transition-all">
               <img src={course.thumbnail ? formatImageUrl(course.thumbnail) : `https://images.unsplash.com/photo-1516321497487-e288fb19713f?auto=format&fit=crop&q=80&w=400&h=300`} alt="Course" className="w-full h-full object-cover opacity-60 group-hover:scale-105 transition-transform duration-700" />
               <div className="absolute top-3 left-3">
                   <span className={`px-3 py-1 text-[10px] font-black uppercase tracking-wider rounded-lg backdrop-blur-md border border-white/10 ${isDraft ? 'bg-amber-500/20 text-amber-500' : 'bg-primary/20 text-primary'}`}>
                       {course.status || 'Draft'}
                   </span>
               </div>
               
               <button 
                  onClick={onDelete}
                  disabled={course.buyoutStatus === 'requested'}
                  className="absolute top-3 right-3 w-10 h-10 rounded-xl bg-red-500/80 backdrop-blur-md flex items-center justify-center text-white hover:bg-red-600 transition disabled:opacity-30 active:scale-90"
               >
                   <Trash2 className="w-5 h-5" />
               </button>
            </div>
            
            <h3 className="font-black text-lg text-white line-clamp-2 mb-4 leading-tight uppercase tracking-tight">{course.title}</h3>
            
            <div className="flex gap-2">
                <Link to={`/instructor/courses/edit/${course.id}`} className="flex-1 bg-white/5 py-3 rounded-2xl text-center text-[10px] uppercase tracking-widest font-black text-white hover:bg-white/10 transition flex items-center justify-center gap-2">
                   <Edit2 className="w-4 h-4"/> Éditeur
                </Link>
                <Link to={`/student/courses/${course.id}`} className="flex-1 bg-primary/10 py-3 rounded-2xl text-center text-[10px] uppercase tracking-widest font-black text-primary hover:bg-primary/20 transition flex items-center justify-center gap-2">
                   <Play className="w-4 h-4"/> Aperçu
                </Link>
            </div>
        </div>
    );
}