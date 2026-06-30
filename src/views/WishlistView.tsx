import { useState, useEffect } from 'react';
import { useRole } from '../context/RoleContext';
import { db } from '../firebase';
import { collection, onSnapshot, query, getDocs, documentId, where } from 'firebase/firestore';
import { Heart, ArrowRight, Sparkles, Compass } from 'lucide-react';
import { Link } from 'react-router-dom';
import { formatImageUrl } from '../lib/utils';

export function WishlistView() {
  const { currentUser } = useRole();
  const [wishlistCourses, setWishlistCourses] = useState<any[]>([]);
  const [instructorsMap, setInstructorsMap] = useState<Map<string, any>>(new Map());
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!currentUser?.uid) return;

    setIsLoading(true);
    // Écoute de la collection 'user_wishlist'
    const qWish = query(collection(db, 'user_wishlist'), where('userId', '==', currentUser.uid));
    
    const unsubscribe = onSnapshot(qWish, async (snap) => {
      if (snap.empty) {
        setWishlistCourses([]);
        setIsLoading(false);
        return;
      }

      const wishlistItems = snap.docs.map(doc => doc.data());
      const courseIds = wishlistItems.filter(item => item.type === 'course' || !item.type).map(item => item.courseId).filter(Boolean);
      const ebookIds = wishlistItems.filter(item => item.type === 'ebook').map(item => item.ebookId).filter(Boolean);
      
      try {
          const combinedData: any[] = [];
          
          if(courseIds.length > 0) {
            const idsToFetch = courseIds.slice(0, 10);
            const coursesQuery = query(collection(db, 'courses'), where(documentId(), 'in', idsToFetch), where('status', '==', 'Published'));
            const coursesSnap = await getDocs(coursesQuery);
            coursesSnap.docs.forEach(doc => combinedData.push({ id: doc.id, itemType: 'course', ...doc.data() }));
          }

          if (ebookIds.length > 0) {
            const idsToFetch = ebookIds.slice(0, 10);
            const ebooksQuery = query(collection(db, 'market_ebooks'), where(documentId(), 'in', idsToFetch));
            const ebooksSnap = await getDocs(ebooksQuery);
            ebooksSnap.docs.forEach(doc => combinedData.push({ id: doc.id, itemType: 'ebook', ...doc.data() }));
          }
          
          setWishlistCourses(combinedData);

          if (combinedData.length > 0) {
            const instructorIds = [...new Set(combinedData.map((c: any) => c.instructorId || c.authorId).filter(Boolean))];
            if (instructorIds.length > 0) {
                const idsArray = instructorIds.slice(0, 10) as string[];
                const instructorsSnap = await getDocs(query(collection(db, 'users'), where('uid', 'in', idsArray)));
                const newMap = new Map();
                instructorsSnap.forEach(d => newMap.set(d.data().uid, d.data()));
                setInstructorsMap(newMap);
            }
          }
      } catch (err) {
          console.error("Fetch wishlist items error:", err);
      } finally {
          setIsLoading(false);
      }
    });

    return () => unsubscribe();
  }, [currentUser?.uid]);

  return (
    <div className="flex flex-col gap-8 pb-24 bg-black min-h-screen relative overflow-hidden -mt-32 max-w-3xl mx-auto z-10 w-full pt-32">
      <header className="px-6 pt-8 animate-in fade-in slide-in-from-top-4 duration-700">
        <div className="flex items-center gap-2 text-primary mb-2">
            <Heart className="h-5 w-5 fill-primary" />
            <span className="text-[10px] font-black uppercase tracking-[0.2em]">Ma Sélection</span>
        </div>
        <h1 className="text-3xl font-black text-white leading-tight uppercase tracking-tight">Liste de <br/><span className="text-primary">Souhaits</span></h1>
        <p className="text-slate-500 text-sm mt-2 font-medium">Vos futures compétences n'attendent que vous.</p>
      </header>

      <div className="px-6">
        {isLoading ? (
          <div className="grid gap-6">
            {[...Array(3)].map((_, i) => (
                <div key={i} className="space-y-4">
                    <div className="h-48 w-full rounded-[2rem] bg-[#111111] animate-pulse border border-white/5" />
                    <div className="h-4 w-3/4 rounded-full bg-[#111111] animate-pulse" />
                </div>
            ))}
          </div>
        ) : wishlistCourses.length > 0 ? (
          <div className="grid gap-6 animate-in fade-in duration-700">
            {wishlistCourses.map(course => {
               const isEbook = course.itemType === 'ebook';
               const instructor = (course.instructorId || course.authorId) ? instructorsMap.get(course.instructorId || course.authorId) : null;
               return (
                  <Link key={`${course.itemType}-${course.id}`} to={isEbook ? `/student/ebooks/${course.id}` : `/student/courses/${course.id}`} className="block">
                      <div className="glass rounded-[2rem] p-5 card-hover relative overflow-hidden flex flex-col gap-4 border border-white/5 bg-[#111111]">
                          <div className={`w-full h-40 rounded-2xl bg-card overflow-hidden shrink-0 relative ${isEbook ? 'flex items-center justify-center bg-gradient-to-br from-orange-500/20 to-orange-700/20' : ''}`}>
                             {isEbook ? (
                                <div className="text-5xl">{course.icon || '📖'}</div>
                             ) : (
                                <img src={course.thumbnail ? formatImageUrl(course.thumbnail) : 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&q=80'} alt={course.title} className="w-full h-full object-cover opacity-80 transition-all group-hover:scale-105" />
                             )}
                             <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-md rounded-full p-2">
                                <Heart className="h-4 w-4 fill-primary text-primary" />
                             </div>
                             {isEbook && (
                               <div className="absolute top-3 left-3 bg-orange-500/80 backdrop-blur-md px-2 py-1 rounded-md text-[10px] font-bold text-white uppercase">Ebook</div>
                             )}
                          </div>
                          <div>
                            <h3 className="font-bold text-lg leading-tight line-clamp-2 mb-2 text-white">{course.title}</h3>
                            {instructor && (
                                <p className="text-xs text-slate-400 font-medium">Par {instructor.fullName || instructor.name || 'Instructeur'}</p>
                            )}
                            {isEbook && course.author && !instructor && (
                                <p className="text-xs text-slate-400 font-medium">Par {course.author}</p>
                            )}
                          </div>
                      </div>
                   </Link>
               )
            })}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 px-8 text-center bg-[#111111] rounded-[2.5rem] border border-white/5 animate-in zoom-in duration-500">
            <div className="p-6 bg-black rounded-full mb-6 relative">
              <Heart className="h-10 w-10 text-slate-700" />
            </div>
            <h3 className="text-xl font-black text-white leading-tight uppercase tracking-tight">Votre liste est vide</h3>
            <p className="text-slate-500 text-xs mt-3 leading-relaxed max-w-[220px] mx-auto font-medium italic">
              Explorez le catalogue et marquez d'un cœur les formations qui vous inspirent.
            </p>
            <Link to="/student/search" className="mt-8 bg-primary hover:bg-emerald-400 text-black rounded-full h-12 px-8 font-black uppercase text-[10px] tracking-widest flex items-center justify-center shadow-[0_4px_20px_rgba(16,185,129,0.3)] transition-all active:scale-95 group">
                Parcourir le catalogue
                <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        )}
      </div>

      <div className="px-6 py-12">
          <div className="p-6 bg-primary/5 border border-primary/10 rounded-3xl flex items-start gap-4">
              <Sparkles className="h-6 w-6 text-primary shrink-0" />
              <div>
                  <p className="text-[10px] font-black text-primary uppercase tracking-widest">Conseil Ndara</p>
                  <p className="text-xs text-slate-400 mt-1 leading-relaxed font-medium italic">
                      Les cours dans votre liste de souhaits sont analysés par MATHIAS pour vous proposer des recommandations encore plus personnalisées.
                  </p>
              </div>
          </div>
      </div>
    </div>
  );
}
