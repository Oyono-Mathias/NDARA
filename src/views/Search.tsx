import { useState, useEffect, useMemo, Suspense } from 'react';
import { getFirestore, collection, query, where, onSnapshot, getDocs } from 'firebase/firestore';
import { 
    Search as SearchIcon, 
    Frown, 
    ArrowLeft, 
    ShoppingCart, 
    Loader2, 
    Mic,
    Leaf,
    ChartLine,
    Coins,
    Cpu,
    Code,
    Star
} from 'lucide-react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useRole } from '../context/RoleContext';
import { cn, formatImageUrl } from '../lib/utils';
import { db } from '../firebase';
import { TouchArea } from '../components/ui/TouchArea';
import { Skeleton } from '../components/ui/Skeleton';
import { BottomSheet } from '../components/ui/BottomSheet';
import { Filter } from 'lucide-react';

const CATEGORIES = [
    { name: "AgriTech", icon: Leaf },
    { name: "FinTech", icon: ChartLine },
    { name: "Trading", icon: Coins },
    { name: "Mécatronique", icon: Cpu },
    { name: "Dév Web", icon: Code }
];

// Inline CourseCard adapted to the structure requested
function CourseCard({ course, instructor, variant }: any) {
  return (
    <Link to={`/student/catalog/${course.id}`} className="block">
        <TouchArea className="glass rounded-2xl sm:rounded-[2rem] p-3 sm:p-4 card-hover flex gap-3 sm:gap-4 bg-[#111111] border border-white/5 relative overflow-hidden">
            <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-xl sm:rounded-2xl overflow-hidden bg-card shrink-0 relative">
                <img src={course.thumbnail ? formatImageUrl(course.thumbnail) : 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&q=80'} alt={course.title} className="w-full h-full object-cover opacity-80" />
            </div>
            <div className="flex-1 py-1 flex flex-col justify-center">
                <span className="text-primary text-[10px] font-bold uppercase tracking-wider mb-1">{course.category || 'Formation'}</span>
                <h3 className="font-bold text-white text-sm sm:text-base line-clamp-2 mb-1 leading-snug">{course.title}</h3>
                {instructor && <p className="text-xs text-slate-400 font-medium mb-2">Par {instructor.fullName || instructor.name || 'Instructeur'}</p>}
                
                <div className="mt-auto flex items-center justify-between">
                    <div className="flex items-center gap-1">
                        <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                        <span className="text-gray-400 text-xs font-medium">4.8</span>
                    </div>
                    <span className="text-black font-bold text-xs sm:text-sm bg-primary px-2 py-0.5 rounded-md">
                        {course.price ? `${course.price} XAF` : 'Gratuit'}
                    </span>
                </div>
            </div>
        </TouchArea>
    </Link>
  );
}

function SearchPageContent() {
  const [searchTerm, setSearchTerm] = useState('');
  const [courses, setCourses] = useState<any[]>([]);
  const [instructorsMap, setInstructorsMap] = useState<Map<string, any>>(new Map());
  const [isLoading, setIsLoading] = useState(true);
  const [cartCount, setCartCount] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  
  const navigate = useNavigate();
  const { currentUser } = useRole();
  const [searchParams] = useSearchParams();

  // Translations hardcoded for React adaptation
  const tCat = (key: string) => key === 'all' ? 'Tous' : key;
  const tCommon = (key: string, props?: any) => {
    switch (key) {
      case 'catalogue': return "Catalogue";
      case 'found_results': return `résultats trouvés`;
      case 'no_results': return "Aucun résultat";
      case 'reset_filters': return "Réinitialiser les filtres";
      default: return key;
    }
  };
  const t = (key: string) => {
    if (key === 'search_placeholder') return "Que voulez-vous apprendre ?";
    if (key === 'subtitle') return "Essayez un autre mot-clé";
    return key;
  };

  useEffect(() => {
      const affId = searchParams.get('aff');
      if (affId && typeof window !== 'undefined') {
          const cookieData = {
              id: affId,
              timestamp: Date.now(),
              expiresAt: Date.now() + (30 * 24 * 60 * 60 * 1000)
          };
          localStorage.setItem('ndara_affiliate_id', JSON.stringify(cookieData));
      }
  }, [searchParams]);

  useEffect(() => {
    setIsLoading(true);
    const q = query(collection(db, "courses"), where("status", "==", "Published"));

    const unsubscribe = onSnapshot(q, async (snapshot) => {
      const coursesData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as any));
      setCourses(coursesData);
      
      if (coursesData.length > 0) {
        const instructorIds = [...new Set(coursesData.map(c => c.instructorId).filter(Boolean))];
        const instructorsRef = collection(db, 'users');
        const newMap = new Map();
        
        for (let i = 0; i < instructorIds.length; i += 30) {
            const chunk = instructorIds.slice(i, i + 30) as string[];
            if(chunk.length > 0){
                const qInst = query(instructorsRef, where('uid', 'in', chunk));
                const snap = await getDocs(qInst);
                snap.forEach(d => newMap.set(d.data().uid, d.data()));
            }
        }
        setInstructorsMap(newMap);
      }
      setIsLoading(false);
    });
    return () => unsubscribe();
  }, [db]);

  useEffect(() => {
    if (!currentUser?.uid) return;
    const cartRef = collection(db, 'users', currentUser.uid, 'cart');
    const unsubscribe = onSnapshot(cartRef, (snap) => {
        setCartCount(snap.size);
    });
    return () => unsubscribe();
  }, [currentUser?.uid, db]);

  const filteredResults = useMemo(() => {
    let results = [...courses];
    
    if (selectedCategory !== 'all') {
        results = results.filter(c => c.category === selectedCategory);
    }

    if (searchTerm.trim()) {
        results = results.filter(c => 
            c.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            c.category?.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }

    return results;
  }, [courses, searchTerm, selectedCategory]);

  return (
    <div className="min-h-screen bg-black pb-24 animate-in fade-in duration-700 relative overflow-x-hidden">
      <div className="absolute inset-0 bg-primary/5 blur-[120px] rounded-full pointer-events-none" />
      
      <header className="fixed top-0 w-full z-50 bg-black/95 backdrop-blur-md safe-area-pt border-b border-white/5 max-w-3xl mx-auto left-0 right-0">
        <div className="px-4 py-4 space-y-4">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <button onClick={() => navigate(-1)} className="w-10 h-10 rounded-full bg-[#111111] border border-white/5 flex items-center justify-center text-gray-400 hover:text-white transition active:scale-90">
                        <ArrowLeft className="h-5 w-5" />
                    </button>
                    <h1 className="font-black text-xl text-white uppercase tracking-tight">{tCommon('catalogue')}</h1>
                </div>
                {currentUser && (
                    <Link to="/student/cart" className="relative group">
                        <button className="w-10 h-10 rounded-full bg-[#111111] border border-white/5 flex items-center justify-center text-gray-400 hover:text-white transition active:scale-90">
                            <ShoppingCart className="h-5 w-5" />
                            {cartCount > 0 && (
                                <span className="absolute -top-0.5 -right-0.5 h-4 w-4 bg-red-500 text-white text-[9px] font-black rounded-full flex items-center justify-center border-2 border-black group-hover:scale-110 transition-transform">
                                    {cartCount}
                                </span>
                            )}
                        </button>
                    </Link>
                )}
            </div>

            <div className="flex gap-2 relative">
                <div className="relative flex-1 group">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                        <SearchIcon className="h-4 w-4 text-primary" />
                    </div>
                    <input
                        type="text"
                        placeholder={t('search_placeholder')}
                        className="w-full h-12 pl-14 pr-4 rounded-[2rem] bg-[#111111] border border-white/5 text-white shadow-xl focus-visible:outline-none focus:border-primary/50 transition-all text-sm"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <button onClick={() => setIsFilterOpen(true)} className="w-12 h-12 rounded-full bg-[#111111] border border-white/5 flex items-center justify-center text-primary active:scale-90 transition-transform shadow-xl">
                    <Filter className="h-5 w-5" />
                </button>
            </div>
        </div>
      </header>

      <main className="px-4 pt-44 max-w-3xl mx-auto w-full z-10 relative">
        <div className="flex items-center justify-between mb-6 px-1">
            <p className="text-[11px] font-black text-slate-500 uppercase tracking-widest">
                <span className="text-white">{filteredResults.length}</span> {tCommon('found_results', { count: filteredResults.length })}
            </p>
        </div>

        {isLoading ? (
          <div className="space-y-4">
            {[...Array(4)].map((_, i) => (
                <div key={i} className="flex gap-4 p-4 bg-[#111111] rounded-[2rem] border border-white/5">
                    <Skeleton className="w-24 h-24 sm:w-32 sm:h-32 rounded-2xl shrink-0" />
                    <div className="flex-1 space-y-3 py-2">
                        <Skeleton className="h-4 w-3/4 rounded" />
                        <Skeleton className="h-3 w-1/2 rounded" />
                    </div>
                </div>
            ))}
          </div>
        ) : filteredResults.length > 0 ? (
          <div className="flex flex-col gap-4 animate-in slide-in-from-bottom-4 duration-700">
            {filteredResults.map(course => (
              <CourseCard 
                key={course.id} 
                course={course} 
                instructor={course.instructorId ? instructorsMap.get(course.instructorId) : null}
                variant="search-result" 
              />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-32 text-center opacity-70 animate-in zoom-in duration-500">
            <Frown className="h-16 w-16 mb-4 text-slate-600" />
            <h3 className="text-xl font-black text-white uppercase tracking-tight">{tCommon('no_results')}</h3>
            <p className="text-sm text-slate-500 mt-2 font-medium">{t('subtitle')}</p>
            <button onClick={() => { setSearchTerm(''); setSelectedCategory('all'); }} className="text-primary mt-6 font-black uppercase text-[10px] tracking-widest hover:underline active:scale-95 transition-all">
                {tCommon('reset_filters')}
            </button>
          </div>
        )}
      </main>

      <BottomSheet isOpen={isFilterOpen} onClose={() => setIsFilterOpen(false)} title="Filtres & Catégories">
        <div className="space-y-4 pb-8">
            <h3 className="text-sm font-bold text-white mb-2 uppercase tracking-widest text-[10px]">Catégories</h3>
            <div className="grid grid-cols-2 gap-2">
                <button 
                    onClick={() => { setSelectedCategory('all'); setIsFilterOpen(false); }}
                    className={cn(
                        "p-4 rounded-2xl border transition-all text-left",
                        selectedCategory === 'all' 
                            ? "bg-primary text-black border-primary font-bold shadow-[0_0_15px_rgba(16,185,129,0.3)]" 
                            : "bg-[#111111] border-white/5 text-gray-400 font-medium hover:bg-white/5"
                    )}
                >
                    {tCat('all')}
                </button>
                {CATEGORIES.map(cat => {
                    const Icon = cat.icon;
                    return (
                        <button 
                            key={cat.name}
                            onClick={() => { setSelectedCategory(cat.name); setIsFilterOpen(false); }}
                            className={cn(
                                "p-4 rounded-2xl border transition-all flex flex-col gap-2",
                                selectedCategory === cat.name 
                                    ? "bg-primary text-black border-primary font-bold shadow-[0_0_15px_rgba(16,185,129,0.3)]" 
                                    : "bg-[#111111] border-white/5 text-gray-400 font-medium hover:bg-white/5"
                            )}
                        >
                            <Icon className={cn("h-5 w-5", selectedCategory === cat.name ? "text-black" : "text-primary")} />
                            <span className="text-sm">{cat.name}</span>
                        </button>
                    )
                })}
            </div>
        </div>
      </BottomSheet>
    </div>
  );
}

export function SearchAndCatalog() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-black px-4 pt-32 max-w-3xl mx-auto w-full z-10 relative">
                <div className="space-y-4">
                    {[...Array(4)].map((_, i) => (
                        <div key={i} className="flex gap-4 p-4 bg-[#111111] rounded-[2rem] border border-white/5">
                            <Skeleton className="w-24 h-24 sm:w-32 sm:h-32 rounded-2xl shrink-0" />
                            <div className="flex-1 space-y-3 py-2">
                                <Skeleton className="h-4 w-3/4 rounded" />
                                <Skeleton className="h-3 w-1/2 rounded" />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        }>
            <SearchPageContent />
        </Suspense>
    )
}

