import { useState, useMemo, useEffect } from 'react';
import { getFirestore, collection, query, where, onSnapshot, getDocs, documentId } from 'firebase/firestore';
import { db, auth } from '../firebase';
import { Award, Trophy, Share2, Eye, ArrowRight, Clock, ShieldCheck, Download } from 'lucide-react';
import { CertificateModal } from '../components/modals/certificate-modal';
import { Link } from 'react-router-dom';

interface Course {
    id: string;
    title: string;
    instructorId?: string;
}

interface Enrollment {
    id: string;
    courseId: string;
    studentId: string;
    progress?: number;
    lastAccessedAt?: any;
}

interface EnrichedCertificate extends Enrollment {
    course?: Partial<Course>;
    instructorName?: string;
}

export function CertificatesView() {
    const [currentUser, setCurrentUser] = useState<any>(null);
    const [enrichedData, setEnrichedData] = useState<EnrichedCertificate[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedCert, setSelectedCert] = useState<EnrichedCertificate | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    useEffect(() => {
        const unsubAuth = auth.onAuthStateChanged((user) => {
            if (user) {
                setCurrentUser(user);
                
                const enrollmentsRef = collection(db, 'enrollments');
                const q = query(enrollmentsRef, where('studentId', '==', user.uid), where('progress', '==', 100));
                
                const unsubEnroll = onSnapshot(q, async (snap) => {
                    if (snap.empty) {
                        setEnrichedData([]);
                        setIsLoading(false);
                        return;
                    }

                    const enrollmentsData = snap.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Enrollment[];
                    const courseIds = [...new Set(enrollmentsData.map(e => e.courseId))];
                    
                    const coursesMap = new Map();
                    if (courseIds.length > 0) {
                        // Max 30 conditions in 'in' clause roughly, usually fine for a few certificates
                        const chunkedIds = courseIds.slice(0, 30);
                        const coursesQuery = query(collection(db, 'courses'), where(documentId(), 'in', chunkedIds));
                        const coursesSnap = await getDocs(coursesQuery);
                        coursesSnap.forEach(d => coursesMap.set(d.id, { id: d.id, ...d.data() }));
                    }

                    const newEnrichedData = enrollmentsData.map(e => ({
                        ...e,
                        course: coursesMap.get(e.courseId) || undefined,
                        instructorName: "Oyono Mathias" // Default instructor
                    })).sort((a, b) => {
                        const dateA = a.lastAccessedAt?.toDate?.() || new Date(0);
                        const dateB = b.lastAccessedAt?.toDate?.() || new Date(0);
                        return dateB.getTime() - dateA.getTime();
                    });

                    setEnrichedData(newEnrichedData);
                    setIsLoading(false);
                });

                return () => unsubEnroll();

            } else {
                setCurrentUser(null);
                setEnrichedData([]);
                setIsLoading(false);
            }
        });

        return () => unsubAuth();
    }, []);

    const handleViewCertificate = (cert: EnrichedCertificate) => {
        setSelectedCert(cert);
        setIsModalOpen(true);
    };

    const formatter = new Intl.DateTimeFormat('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' });

    return (
        <div className="flex flex-col gap-8 pb-24 bg-slate-950 min-h-screen">
            {selectedCert && (
                <CertificateModal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    courseName={selectedCert.course?.title || ''}
                    studentName={currentUser?.displayName || 'Étudiant'}
                    instructorName={selectedCert.instructorName || 'Oyono Mathias'}
                    completionDate={selectedCert.lastAccessedAt?.toDate?.() || new Date()}
                    certificateId={selectedCert.id}
                    courseId={selectedCert.courseId}
                    userId={selectedCert.studentId}
                />
            )}

            <header className="pt-8 space-y-2">
                <div className="flex items-center gap-2 text-amber-500 mb-2">
                    <Trophy className="h-5 w-5" />
                    <span className="text-[10px] font-black uppercase tracking-[0.2em]">Réussite & Mérite</span>
                </div>
                <h1 className="text-3xl font-black text-white leading-tight uppercase tracking-tight">Mes <br/><span className="text-amber-500">Certificats</span></h1>
                <p className="text-slate-500 text-sm font-medium">Vos compétences certifiées par l'excellence panafricaine.</p>
            </header>

            <div className="space-y-4 w-full">
                {isLoading ? (
                    <div className="grid gap-4">
                        {[...Array(2)].map((_, i) => <div key={i} className="h-64 w-full rounded-[2.5rem] bg-slate-900 border border-slate-800 animate-pulse" />)}
                    </div>
                ) : enrichedData.length > 0 ? (
                    <div className="grid gap-6 animate-in fade-in duration-700">
                        {enrichedData.map(cert => (
                            <div key={cert.id} className="bg-slate-900 border border-slate-800 overflow-hidden shadow-2xl group active:scale-[0.98] transition-all rounded-[2.5rem]">
                                <div className="p-6 space-y-4">
                                    <div className="flex justify-between items-start">
                                        <div className="p-3 bg-amber-500/10 rounded-2xl">
                                            <Award className="h-8 w-8 text-amber-500" />
                                        </div>
                                        <span className="bg-slate-800 text-slate-500 py-1 px-3 rounded-full font-bold text-[8px] uppercase tracking-tighter">
                                            ID: {cert.id.substring(0, 12)}
                                        </span>
                                    </div>
                                    
                                    <div className="space-y-1">
                                        <h3 className="text-xl font-bold text-white line-clamp-2 leading-tight group-hover:text-amber-500 transition-colors">
                                            {cert.course?.title || 'Formation Ndara'}
                                        </h3>
                                        <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
                                            <Clock className="h-3 w-3" />
                                            <span>
                                                Obtenu le {cert.lastAccessedAt && typeof cert.lastAccessedAt.toDate === 'function' 
                                                    ? formatter.format(cert.lastAccessedAt.toDate()) 
                                                    : 'récemment'}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                
                                <div className="p-4 bg-slate-900/50 flex gap-2 border-t border-white/5">
                                    <button 
                                        className="flex-1 flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black uppercase text-[10px] tracking-widest h-14 rounded-[1.5rem] transition-colors"
                                        onClick={() => handleViewCertificate(cert)}
                                    >
                                        <Eye className="h-4 w-4" />
                                        Voir le diplôme
                                    </button>
                                    <button 
                                        className="h-14 w-14 rounded-[1.5rem] border border-slate-800 bg-slate-900 text-slate-400 hover:text-white flex items-center justify-center transition-colors"
                                        onClick={() => {
                                            const url = `${window.location.origin}/verify/${cert.id}`;
                                            window.open(`https://wa.me/?text=Je suis très fier de vous partager mon nouveau certificat Ndara Afrique ! 🚀🎓\n\nVérifiez mon diplôme ici : ${url}`, '_blank');
                                        }}
                                    >
                                        <Share2 className="h-5 w-5" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center py-20 px-8 text-center bg-slate-900/20 rounded-[3rem] border-2 border-dashed border-slate-800/50">
                        <div className="p-6 bg-slate-800/50 rounded-full mb-6">
                            <Award className="h-16 w-16 text-slate-700" />
                        </div>
                        <h3 className="text-xl font-black text-white leading-tight uppercase">Votre mur est vide.</h3>
                        <p className="text-slate-500 text-sm mt-3 leading-relaxed max-w-[220px] mx-auto font-medium">
                            Terminez vos formations à <span className="text-white font-bold">100%</span> pour débloquer vos certificats officiels.
                        </p>
                        <Link to="/student/courses" className="mt-8 flex items-center justify-center bg-primary hover:bg-primary/90 text-primary-foreground rounded-2xl h-14 px-8 font-black uppercase text-[10px] tracking-widest shadow-xl shadow-primary/20">
                            Reprendre l'apprentissage
                            <ArrowRight className="ml-2 h-4 w-4" />
                        </Link>
                    </div>
                )}
            </div>

            <div className="py-8">
                <div className="p-6 bg-slate-900/30 border border-slate-800 rounded-[2.5rem] flex items-start gap-4">
                    <ShieldCheck className="h-6 w-6 text-emerald-500 shrink-0" />
                    <div>
                        <p className="text-xs font-black text-white uppercase tracking-widest">Sécurité Ndara</p>
                        <p className="text-[10px] text-slate-500 mt-1 leading-relaxed font-medium italic">
                            Chaque certificat possède un code de vérification unique permettant aux entreprises de confirmer vos acquis en temps réel.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

