import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { doc, onSnapshot, collection, query, where, getDocs, setDoc, deleteDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';
import { useRole } from '../context/RoleContext';
import { ArrowLeft, Play, Coins, Lock, ShieldCheck, Award, ChevronDown, CheckCircle, Star, MessageCircle, Info, BookOpen, Heart } from 'lucide-react';
import { formatImageUrl } from '../lib/utils'; // Suppose we have this

export function CourseDetail() {
    const { slug } = useParams<{ slug: string }>();
    const navigate = useNavigate();
    const { currentUser } = useRole();
    
    const [course, setCourse] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [instructor, setInstructor] = useState<any>(null);
    const [reviews, setReviews] = useState<any[]>([]);
    
    const [openModules, setOpenModules] = useState<Record<string, boolean>>({});
    const [isFavorite, setIsFavorite] = useState(false);
    const [wishlistDocId, setWishlistDocId] = useState<string | null>(null);
    const [isEnrolled, setIsEnrolled] = useState(false);

    useEffect(() => {
        if (!slug) return;
        
        // Fetch Course
        const courseRef = doc(db, 'courses', slug);
        const unsub = onSnapshot(courseRef, async (docSnap) => {
            if (docSnap.exists()) {
                const data = { id: docSnap.id, ...docSnap.data() } as any;
                setCourse(data);
                
                // Initialize first module as open
                if (data.content && data.content.length > 0) {
                    setOpenModules({ [data.content[0].id || '0']: true });
                }
                
                // Fetch Instructor
                if (data.instructorId) {
                    const instRef = doc(db, 'users', data.instructorId);
                    import('firebase/firestore').then(({ getDoc }) => {
                        getDoc(instRef).then(iSnap => {
                            if (iSnap.exists()) {
                                setInstructor({ id: iSnap.id, ...iSnap.data() });
                            }
                        });
                    });
                }
                
                // Fetch Reviews (simulated or real from 'course_reviews')
                const reviewsQuery = query(collection(db, 'course_reviews'), where('courseId', '==', data.id));
                import('firebase/firestore').then(({ getDocs }) => {
                    getDocs(reviewsQuery).then(rSnap => {
                        setReviews(rSnap.docs.map(d => ({ id: d.id, ...d.data() })));
                    });
                });
            }
            setLoading(false);
        });
        
        return () => unsub();
    }, [slug]);

    useEffect(() => {
        if (!currentUser || !course) return;
        
        const qWish = query(
            collection(db, 'user_wishlist'),
            where('userId', '==', currentUser.uid),
            where('courseId', '==', course.id)
        );
        const unsubWish = onSnapshot(qWish, (snap) => {
            if (!snap.empty) {
                setIsFavorite(true);
                setWishlistDocId(snap.docs[0].id);
            } else {
                setIsFavorite(false);
                setWishlistDocId(null);
            }
        });

        // Check if enrolled
        const qEnroll = query(
            collection(db, 'enrollments'),
            where('studentId', '==', currentUser.uid),
            where('courseId', '==', course.id)
        );
        const unsubEnroll = onSnapshot(qEnroll, (snap) => {
            setIsEnrolled(!snap.empty);
        });

        return () => {
            unsubWish();
            unsubEnroll();
        };
    }, [currentUser, course]);

    const toggleAccordion = (id: string) => {
        setOpenModules(prev => ({ ...prev, [id]: !prev[id] }));
    };

    const handleEnroll = async () => {
        if (!course) return;
        if (isEnrolled) {
            navigate(`/student/courses/${course.id}`);
        } else if (!course.price || course.price <= 0) {
            if (currentUser) {
                 try {
                     const { setDoc, doc, collection } = await import("firebase/firestore");
                     await setDoc(doc(collection(db, 'enrollments')), {
                         studentId: currentUser.uid,
                         courseId: course.id,
                         enrolledAt: new Date(),
                         progress: 0,
                         instructorId: course.instructorId || 'admin'
                     });
                     navigate(`/student/courses/${course.id}`);
                 } catch(e) {
                     console.error("Auto-enroll failed", e);
                     navigate(`/student/checkout/${course.slug || slug || course.id}`);
                 }
            } else {
                 navigate(`/student/checkout/${course.slug || slug || course.id}`);
            }
        } else {
            navigate(`/student/checkout/${course.slug || slug || course.id}`);
        }
    };

    const toggleFavorite = async () => {
        if (!currentUser || !course) return;
        try {
            if (isFavorite && wishlistDocId) {
                await deleteDoc(doc(db, 'user_wishlist', wishlistDocId));
            } else {
                const newDocRef = doc(collection(db, 'user_wishlist'));
                await setDoc(newDocRef, {
                    userId: currentUser.uid,
                    courseId: course.id,
                    createdAt: serverTimestamp()
                });
            }
        } catch (error) {
            console.error("Erreur lors de l'ajout aux favoris", error);
        }
    };

    if (loading) {
        return (
            <div className="antialiased min-h-screen flex justify-center bg-black">
                <div className="w-full max-w-md bg-[#0f172a] min-h-screen relative flex flex-col shadow-2xl overflow-hidden animate-pulse">
                    {/* Header Skeleton */}
                    <div className="h-64 bg-[#1e293b] flex-shrink-0 relative">
                        <div className="absolute top-12 left-4 w-12 h-12 bg-white/5 rounded-full"></div>
                        <div className="absolute inset-0 flex items-center justify-center">
                            <div className="w-16 h-16 bg-white/5 rounded-full"></div>
                        </div>
                        <div className="absolute top-12 right-4 w-12 h-12 bg-white/5 rounded-full"></div>
                    </div>

                    <div className="flex-1 px-4 pb-32 -mt-8 relative z-10">
                        <div className="bg-[#0f172a] rounded-t-[2rem] p-5 pt-8">
                            {/* Category Skeleton */}
                            <div className="w-32 h-6 bg-white/5 rounded-full mb-4"></div>
                            
                            {/* Title Skeleton */}
                            <div className="w-3/4 h-8 bg-white/5 rounded-lg mb-3"></div>
                            <div className="w-1/2 h-8 bg-white/5 rounded-lg mb-6"></div>

                            {/* Ratings Skeleton */}
                            <div className="flex items-center gap-4 mb-8">
                                <div className="w-24 h-4 bg-white/5 rounded-md"></div>
                                <div className="w-20 h-4 bg-white/5 rounded-md"></div>
                            </div>

                            {/* Info Badges Skeleton */}
                            <div className="grid grid-cols-3 gap-3 mb-8">
                                {[1, 2, 3].map(i => (
                                    <div key={i} className="bg-[#1e293b] rounded-3xl p-3 border border-white/5 flex flex-col items-center justify-center gap-2 h-24">
                                        <div className="w-10 h-10 rounded-full bg-white/5"></div>
                                        <div className="w-16 h-2 bg-white/5 rounded-full"></div>
                                    </div>
                                ))}
                            </div>

                            {/* Instructor Skeleton */}
                            <div className="flex items-center gap-3 mb-8 p-4 bg-[#1e293b] rounded-3xl border border-white/5">
                                <div className="w-14 h-14 rounded-full bg-white/5 shrink-0"></div>
                                <div className="flex-1 space-y-2">
                                    <div className="w-20 h-3 bg-white/5 rounded-full"></div>
                                    <div className="w-32 h-4 bg-white/5 rounded-full"></div>
                                    <div className="w-24 h-3 bg-white/5 rounded-full"></div>
                                </div>
                            </div>

                            {/* Description Skeleton */}
                            <div className="space-y-3 mb-8">
                                <div className="w-32 h-5 bg-white/5 rounded-md mb-4"></div>
                                <div className="w-full h-4 bg-white/5 rounded-md"></div>
                                <div className="w-full h-4 bg-white/5 rounded-md"></div>
                                <div className="w-2/3 h-4 bg-white/5 rounded-md"></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (!course) {
        return <div className="text-white text-center p-10 font-bold">Formation introuvable.</div>;
    }

    const price = course.price || 0;
    const oldPrice = Math.floor(price * 1.5);

    return (
        <div className="antialiased min-h-screen flex justify-center bg-black">
            <div className="fixed top-0 left-0 w-full h-full pointer-events-none z-[9999] opacity-[0.04]" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=%270 0 200 200%27 xmlns=%27http://www.w3.org/2000/svg%27%3E%3Cfilter id=%27noiseFilter%27%3E%3CfeTurbulence type=%27fractalNoise%27 baseFrequency=%270.65%27 numOctaves=%273%27 stitchTiles=%27stitch%27/%3E%3C/filter%3E%3Crect width=%27100%25%27 height=%27100%25%27 filter=%27url(%23noiseFilter)%27/%3E%3C/svg%3E")' }}></div>

            <div className="w-full max-w-md bg-[#0f172a] min-h-screen relative flex flex-col shadow-2xl overflow-hidden">
                <header className="relative h-64 flex-shrink-0">
                    <div className="absolute inset-0">
                        <img src={course.thumbnail ? formatImageUrl(course.thumbnail) : "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&q=80"} alt="Course Cover" className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[#0f172a]"></div>
                    </div>

                    <button onClick={() => navigate(-1)} className="absolute top-12 left-4 w-12 h-12 backdrop-blur-md bg-[#1e293b]/80 rounded-full flex items-center justify-center text-white hover:bg-white/20 transition z-10">
                        <ArrowLeft className="w-5 h-5" />
                    </button>

                    <div className="absolute inset-0 flex items-center justify-center z-0">
                        <button onClick={handleEnroll} className="w-16 h-16 bg-emerald-500/90 rounded-full flex items-center justify-center text-white hover:bg-emerald-500 transition shadow-[0_0_20px_rgba(16,185,129,0.5)]">
                            <Play className="w-8 h-8 ml-1 fill-current" />
                        </button>
                    </div>
                    
                    <button onClick={toggleFavorite} className="absolute top-12 right-4 w-12 h-12 backdrop-blur-md bg-[#1e293b]/80 rounded-full flex items-center justify-center text-white hover:bg-white/20 transition z-10">
                        <Heart className={`w-5 h-5 transition-all ${isFavorite ? 'fill-red-500 text-red-500 scale-110' : ''}`} />
                    </button>
                </header>

                <main className="flex-1 overflow-y-auto px-4 pb-32 -mt-8 relative z-10" style={{ scrollbarWidth: 'none' }}>
                    <div className="bg-[#0f172a] rounded-t-[2rem] p-5">
                        <span className="inline-flex items-center px-3 py-1.5 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-500 text-[10px] font-black uppercase tracking-wider mb-3">
                            <Coins className="w-3 h-3 mr-1.5" /> {course.category || "Formation Professionnelle"}
                        </span>

                        <h1 className="font-black text-2xl text-white leading-tight mb-3">
                            {course.title}
                        </h1>

                        <div className="flex items-center gap-4 mb-6">
                            <div className="flex items-center gap-1.5">
                                <div className="flex items-center text-yellow-500">
                                    <Star className="w-3.5 h-3.5 fill-current" />
                                    <Star className="w-3.5 h-3.5 fill-current" />
                                    <Star className="w-3.5 h-3.5 fill-current" />
                                    <Star className="w-3.5 h-3.5 fill-current" />
                                    <Star className="w-3.5 h-3.5 fill-current opacity-50" />
                                </div>
                                <span className="text-white text-sm font-black">{course.rating || "0.0"}</span>
                            </div>
                            <span className="text-gray-500 text-sm font-medium">•</span>
                            <span className="text-gray-400 text-sm font-medium">{course.enrolledCount || 0} élèves</span>
                        </div>

                        <div className="grid grid-cols-3 gap-3 mb-8">
                            <div className="bg-[#1e293b] rounded-3xl p-3 border border-white/5 flex flex-col items-center justify-center gap-2">
                                <div className="w-10 h-10 rounded-full bg-green-500/10 flex items-center justify-center text-green-400">
                                    <Lock className="w-4 h-4" />
                                </div>
                                <span className="text-gray-400 text-[9px] font-black uppercase text-center leading-tight">Paiement Sécurisé</span>
                            </div>
                            <div className="bg-[#1e293b] rounded-3xl p-3 border border-white/5 flex flex-col items-center justify-center gap-2">
                                <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-400">
                                    <ShieldCheck className="w-4 h-4" />
                                </div>
                                <span className="text-gray-400 text-[9px] font-black uppercase text-center leading-tight">Garantie 7j</span>
                            </div>
                            <div className="bg-[#1e293b] rounded-3xl p-3 border border-white/5 flex flex-col items-center justify-center gap-2">
                                <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                                    <Award className="w-4 h-4" />
                                </div>
                                <span className="text-gray-400 text-[9px] font-black uppercase text-center leading-tight">Certifié Ndara</span>
                            </div>
                        </div>

                        <div className="flex items-center gap-3 mb-8 p-4 bg-[#1e293b] rounded-3xl border border-white/5 relative group cursor-pointer transition-all hover:bg-[#1e293b]/80" onClick={() => instructor?.id ? navigate(`/instructor/p/${instructor.id}`) : null}>
                            <img src={instructor?.photoURL || instructor?.profilePictureURL || "https://i.pravatar.cc/100?img=12"} alt="Instructor" className="w-14 h-14 rounded-full border-2 border-emerald-500/30 object-cover" />
                            <div className="flex-1">
                                <p className="text-gray-400 text-[10px] font-bold uppercase tracking-wide mb-0.5">Instructeur</p>
                                <h3 className="text-white font-black text-base group-hover:text-emerald-400 transition-colors">{instructor?.fullName || instructor?.displayName || "Instructeur Ndara"}</h3>
                                <p className="text-gray-500 text-xs font-medium line-clamp-1">{instructor?.bio || instructor?.professionalTitle || "Expert Certifié"}</p>
                            </div>
                            <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-gray-400 group-hover:text-emerald-400 group-hover:bg-emerald-500/10 transition">
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"/></svg>
                            </div>
                        </div>

                        <section className="mb-8">
                            <h2 className="font-black text-lg text-white mb-3 flex items-center gap-2">
                                <Info className="w-5 h-5 text-emerald-500" /> DESCRIPTION
                            </h2>
                            <div className="text-gray-400 text-sm leading-relaxed space-y-3">
                                <p>{course.description || "Aucune description fournie pour le moment."}</p>
                                <ul className="space-y-2 mt-4">
                                    <li className="flex items-start gap-2">
                                        <CheckCircle className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                                        <span>Accès à 100% du contenu en ligne</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <CheckCircle className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                                        <span>Téléchargement hors ligne des modules</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <CheckCircle className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                                        <span>Mises à jour gratuites incluses</span>
                                    </li>
                                </ul>
                            </div>
                        </section>

                        {course.content && course.content.length > 0 && (
                            <section className="mb-8">
                                <h2 className="font-black text-lg text-white mb-3 flex items-center gap-2">
                                    <BookOpen className="w-5 h-5 text-emerald-500" /> PROGRAMME
                                </h2>
                                <div className="space-y-3">
                                    {course.content.map((mod: any, mIdx: number) => {
                                        const modId = mod.id || mIdx.toString();
                                        const isOpen = openModules[modId];
                                        return (
                                            <div key={modId} className="bg-[#1e293b] rounded-3xl border border-white/5 overflow-hidden">
                                                <button onClick={() => toggleAccordion(modId)} className="w-full px-5 py-4 flex items-center justify-between">
                                                    <div className="flex items-center gap-4">
                                                        <span className="text-emerald-500 text-2xl font-black opacity-50">{(mIdx + 1).toString().padStart(2, '0')}</span>
                                                        <div className="text-left">
                                                            <h3 className="text-white font-bold text-sm">{mod.title}</h3>
                                                            <p className="text-gray-500 text-xs font-medium">{mod.lessons?.length || 0} leçons</p>
                                                        </div>
                                                    </div>
                                                    <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                                                </button>
                                                <div className={`overflow-hidden transition-all duration-300 ${isOpen ? 'max-h-[500px]' : 'max-h-0'}`}>
                                                    <div className="px-5 pb-4 space-y-2 bg-[#0f172a]/50">
                                                        {mod.lessons?.map((les: any, lIdx: number) => (
                                                            <div key={lIdx} className="flex items-center gap-3 py-2 border-b border-white/5 last:border-0">
                                                                <Play className="w-3.5 h-3.5 text-gray-500" />
                                                                <span className="text-gray-400 text-xs flex-1 truncate">{les.title}</span>
                                                            </div>
                                                        ))}
                                                        {(!mod.lessons || mod.lessons.length === 0) && (
                                                            <div className="text-xs text-gray-500 py-2">Aucune leçon.</div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </section>
                        )}
                        
                        {reviews.length > 0 && (
                            <section className="mb-4">
                                <div className="flex items-center gap-2 mb-4">
                                    <MessageCircle className="w-5 h-5 text-emerald-500" />
                                    <h2 className="font-black text-lg text-white">AVIS ÉTUDIANTS</h2>
                                </div>
                                <div className="space-y-4">
                                    {reviews.slice(0, 3).map(rev => (
                                        <div key={rev.id} className="bg-[#1e293b] rounded-3xl p-4 border border-white/5">
                                            <div className="flex items-center gap-3 mb-3">
                                                <img src={rev.studentPhoto || "https://i.pravatar.cc/100"} alt="User" className="w-10 h-10 rounded-full" />
                                                <div className="flex-1">
                                                    <h4 className="text-white font-bold text-sm">{rev.studentName}</h4>
                                                    <div className="flex items-center text-yellow-500 text-[10px]">
                                                        {Array(5).fill(0).map((_, i) => (
                                                            <Star key={i} className={`w-2.5 h-2.5 ${i < (rev.rating || 5) ? 'fill-current' : 'opacity-30'}`} />
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                            <p className="text-gray-400 text-sm leading-relaxed">"{rev.comment}"</p>
                                        </div>
                                    ))}
                                </div>
                            </section>
                        )}
                        {reviews.length === 0 && (
                            <section className="mb-4">
                               <div className="bg-[#1e293b] rounded-3xl p-6 border border-white/5 text-center">
                                   <p className="text-gray-400 text-sm italic">Sois le premier à donner ton avis !</p>
                               </div>
                            </section>
                        )}
                    </div>
                </main>

                <div className="fixed bottom-0 w-full max-w-md bg-[#1e293b]/95 backdrop-blur-lg border-t border-white/5 z-50 shadow-[0_-10px_40px_rgba(0,0,0,0.5)] safe-bottom">
                    <div className="flex items-center justify-between px-4 py-4">
                        <div>
                            <p className="text-gray-400 text-[10px] font-bold uppercase tracking-wide mb-0.5">Prix de la formation</p>
                            <div className="flex items-baseline gap-2">
                                <span className="text-2xl font-black text-emerald-500">{price.toLocaleString()}</span>
                                <span className="text-sm font-black text-emerald-500">FCFA</span>
                            </div>
                        </div>
                        <button onClick={handleEnroll} className="bg-emerald-500 text-[#0f172a] px-6 py-3.5 rounded-full font-black text-sm uppercase tracking-wide hover:bg-emerald-400 transition shadow-[0_0_15px_rgba(16,185,129,0.3)] min-w-[140px]">
                            {isEnrolled ? "Reprendre" : (price > 0 ? "Acheter" : "S'inscrire")}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
