import { useEffect, useState } from 'react';
import { formatImageUrl } from '../../lib/utils';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../firebase';
import { Star, Users, BookOpen, ExternalLink, BadgeCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function PublicInstructorProfile({ instructorId }: { instructorId: string }) {
    const navigate = useNavigate();
    const [instructor, setInstructor] = useState<any>(null);
    const [courses, setCourses] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                // Fetch user/instructor basic info (assuming some users collection data is available or mock if not)
                const qUser = query(collection(db, 'users'), where('uid', '==', instructorId));
                const userSnap = await getDocs(qUser);
                if (!userSnap.empty) {
                    setInstructor(userSnap.docs[0].data());
                } else {
                    // fallback if 'users' doesn't have uid properly mapped
                    setInstructor({ displayName: "Formateur Ndara", photoURL: "", bio: "Expert passionné sur Ndara." });
                }

                // Fetch published courses by this instructor
                const qCourses = query(collection(db, 'courses'), where('instructorId', '==', instructorId), where('status', '==', 'published'));
                const coursesSnap = await getDocs(qCourses);
                setCourses(coursesSnap.docs.map(d => ({ id: d.id, ...d.data() })));
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };
        fetchProfile();
    }, [instructorId]);

    if (loading) return <div className="min-h-screen bg-slate-950 flex items-center justify-center"><div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin"></div></div>;

    return (
        <div className="min-h-screen bg-slate-950 pb-24 font-sans">
            <div className="h-64 bg-slate-900 border-b border-white/5 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-transparent"></div>
            </div>
            
            <div className="max-w-4xl mx-auto px-6 -mt-20 relative z-10">
                <div className="bg-[#0f172a] border border-white/10 rounded-[2.5rem] p-8 shadow-2xl flex flex-col md:flex-row items-center md:items-start gap-8">
                    <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-slate-950 bg-slate-800 flex items-center justify-center shrink-0">
                        {instructor?.photoURL ? (
                            <img src={instructor.photoURL} alt="Profile" className="w-full h-full object-cover" />
                        ) : (
                            <span className="text-4xl font-black text-white">{instructor?.displayName?.[0] || 'I'}</span>
                        )}
                    </div>
                    
                    <div className="flex-1 text-center md:text-left">
                        <div className="flex items-center justify-center md:justify-start gap-2 mb-2">
                           <h1 className="text-3xl font-black text-white tracking-tight">{instructor?.displayName || 'Expert Ndara'}</h1>
                           <BadgeCheck className="text-primary w-6 h-6" />
                        </div>
                        <p className="text-slate-400 text-sm leading-relaxed mb-6 max-w-xl">{instructor?.bio || "Ce formateur n'a pas encore rempli sa biographie."}</p>
                        
                        <div className="flex flex-wrap items-center justify-center md:justify-start gap-4">
                            <div className="flex items-center gap-2 bg-slate-900/50 px-4 py-2 rounded-2xl border border-white/5">
                                <Users className="text-slate-400 w-4 h-4" />
                                <div className="text-left">
                                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Apprenants</p>
                                    <p className="text-white font-black text-sm">{courses.reduce((acc, c) => acc + (c.studentsCount || 0), 0)}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2 bg-slate-900/50 px-4 py-2 rounded-2xl border border-white/5">
                                <Star className="text-orange-400 w-4 h-4" />
                                <div className="text-left">
                                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Note Globale</p>
                                    <p className="text-white font-black text-sm">4.8</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2 bg-slate-900/50 px-4 py-2 rounded-2xl border border-white/5">
                                <BookOpen className="text-primary w-4 h-4" />
                                <div className="text-left">
                                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Formations</p>
                                    <p className="text-white font-black text-sm">{courses.length}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="mt-12">
                    <h2 className="text-xl font-black text-white uppercase tracking-tight mb-8">Catalogue du formateur</h2>
                    
                    <div className="grid md:grid-cols-2 gap-6">
                        {courses.length === 0 ? (
                            <div className="col-span-2 p-12 text-center bg-slate-900/50 rounded-3xl border border-dashed border-white/10">
                                <BookOpen className="mx-auto w-10 h-10 text-slate-600 mb-4" />
                                <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Aucune formation publiée</p>
                            </div>
                        ) : (
                            courses.map(course => (
                                <div key={course.id} onClick={() => navigate(`/student/courses/${course.id}`)} className="bg-[#1e293b] rounded-3xl border border-white/5 overflow-hidden group cursor-pointer hover:border-primary/50 transition">
                                    <div className="aspect-video bg-slate-800 relative overflow-hidden">
                                        {course.thumbnail ? (
                                            <img src={formatImageUrl(course.thumbnail)} alt={course.title} className="w-full h-full object-cover group-hover:scale-105 transition duration-500" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-800 to-slate-900">
                                                <BookOpen className="w-12 h-12 text-slate-700" />
                                            </div>
                                        )}
                                        <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-md text-white font-black px-3 py-1.5 rounded-xl text-sm">
                                            {course.price > 0 ? `${course.price} FCFA` : 'Gratuit'}
                                        </div>
                                    </div>
                                    <div className="p-6">
                                        <h3 className="font-bold text-white text-lg mb-2 line-clamp-2">{course.title}</h3>
                                        <p className="text-slate-400 text-xs mb-4 line-clamp-2">{course.description}</p>
                                        <button className="w-full py-3 bg-[#0f172a] text-primary font-bold text-xs uppercase tracking-widest rounded-xl hover:bg-primary hover:text-black transition flex items-center justify-center gap-2">
                                            Découvrir <ExternalLink size={14} />
                                        </button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
