import { useEffect, useState, useMemo } from 'react';
import { useRole } from '../../../context/RoleContext';
import { collection, query, where, onSnapshot, getDocs, documentId, doc } from 'firebase/firestore';
import { db } from '../../../firebase';
import { 
    Users, 
    Search, 
    BookOpen, 
    TrendingUp, 
    Award, 
    ChevronRight, 
    MessageSquare, 
    Filter,
    HelpCircle,
    UserCheck,
    CheckCircle,
    Loader2,
    Database,
    Mail
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface Enrollment {
  id: string;
  studentId: string;
  courseId: string;
  courseTitle?: string;
  progress: number;
  enrolledAt?: any;
}

interface StudentUser {
  uid: string;
  fullName?: string;
  email?: string;
  profilePictureURL?: string;
}

export function StudentsClient() {
    const { currentUser: instructor } = useRole();
    const navigate = useNavigate();

    const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
    const [studentsMap, setStudentsMap] = useState<Record<string, StudentUser>>({});
    const [courses, setCourses] = useState<any[]>([]);
    
    const [loadingEnrollments, setLoadingEnrollments] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCourseId, setSelectedCourseId] = useState('all');
    const [selectedProgressFilter, setSelectedProgressFilter] = useState<'all' | 'completed' | 'in_progress'>('all');

    // 1. Fetch Instructor Courses and Enrollments
    useEffect(() => {
        if (!instructor?.uid) return;

        // Fetch Courses
        const qCourses = query(collection(db, 'courses'), where('instructorId', '==', instructor.uid));
        const unsubCourses = onSnapshot(qCourses, (snap) => {
             setCourses(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        });

        // Fetch Enrollments
        const qEnrollments = query(collection(db, 'enrollments'), where('instructorId', '==', instructor.uid));
        const unsubEnrollments = onSnapshot(qEnrollments, async (snap) => {
            const enrollList = snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Enrollment));
            setEnrollments(enrollList);
            setLoadingEnrollments(false);

            // Fetch Student profile details for these enrollments
            const studentIds = Array.from(new Set(enrollList.map(e => e.studentId))).filter(Boolean);
            if (studentIds.length === 0) return;

            // Firestore "in" operator strictly allows maximum 30 items
            const chunks: string[][] = [];
            for (let i = 0; i < studentIds.length; i += 30) {
                chunks.push(studentIds.slice(i, i + 30));
            }

            const tempMap: Record<string, StudentUser> = {};
            for (const chunk of chunks) {
                try {
                    const qUsers = query(collection(db, 'users'), where('uid', 'in', chunk));
                    const usersSnap = await getDocs(qUsers);
                    usersSnap.forEach(d => {
                        tempMap[d.id] = { uid: d.id, ...d.data() } as StudentUser;
                    });
                } catch (err) {
                    console.error("Error fetching students: ", err);
                }
            }
            setStudentsMap(prev => ({ ...prev, ...tempMap }));
        });

        return () => {
            unsubCourses();
            unsubEnrollments();
        };
    }, [instructor?.uid]);

    // 2. Computed Analytics
    const stats = useMemo(() => {
        const uniqueStudentIds = Array.from(new Set(enrollments.map(e => e.studentId))).length;
        const totalProgress = enrollments.reduce((acc, e) => acc + (e.progress || 0), 0);
        const averageProgress = enrollments.length > 0 ? Math.round(totalProgress / enrollments.length) : 0;
        const certifiedCount = enrollments.filter(e => (e.progress || 0) === 100).length;

        return {
            uniqueStudentsCount: uniqueStudentIds,
            averageProgress,
            certifiedCount,
            totalEnrollmentsCount: enrollments.length
        };
    }, [enrollments]);

    // 3. Filtered Lists
    const filteredStudents = useMemo(() => {
        return enrollments.filter(e => {
            const student = studentsMap[e.studentId] || {};
            const studentName = (student.fullName || 'Étudiant Anonyme').toLowerCase();
            const studentEmail = (student.email || '').toLowerCase();
            
            // Search match
            const matchesSearch = studentName.includes(searchTerm.toLowerCase()) || 
                                  studentEmail.includes(searchTerm.toLowerCase());

            // Course match
            const matchesCourse = selectedCourseId === 'all' || e.courseId === selectedCourseId;

            // Progress match
            const matchesProgress = selectedProgressFilter === 'all' || 
                (selectedProgressFilter === 'completed' && e.progress === 100) ||
                (selectedProgressFilter === 'in_progress' && e.progress < 100);

            return matchesSearch && matchesCourse && matchesProgress;
        });
    }, [enrollments, studentsMap, searchTerm, selectedCourseId, selectedProgressFilter]);

    if (loadingEnrollments) {
        return (
            <div className="flex flex-col items-center justify-center py-20 bg-slate-900/50 rounded-3xl border border-white/5 space-y-4">
                <Loader2 className="h-10 w-10 text-primary animate-spin" />
                <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">Calcul de la base de données...</p>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            
            {/* STATS SECTION */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-gradient-to-br from-[#1e293b] to-slate-900 border border-white/5 rounded-[2rem] p-6 shadow-xl relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-full blur-2xl group-hover:scale-110 transition-transform" />
                    <div className="flex items-center justify-between mb-4">
                        <span className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Effectif Total</span>
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                            <Users size={16} />
                        </div>
                    </div>
                    <h3 className="text-3xl font-black text-white tracking-tight">{stats.uniqueStudentsCount}</h3>
                    <p className="text-xs text-slate-400 mt-2 font-medium">Apprenants inscrits uniques</p>
                </div>

                <div className="bg-gradient-to-br from-[#1e293b] to-slate-900 border border-white/5 rounded-[2rem] p-6 shadow-xl relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/5 rounded-full blur-2xl group-hover:scale-110 transition-transform" />
                    <div className="flex items-center justify-between mb-4">
                        <span className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Progression Globale</span>
                        <div className="w-8 h-8 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-400">
                            <TrendingUp size={16} />
                        </div>
                    </div>
                    <h3 className="text-3xl font-black text-white tracking-tight">{stats.averageProgress}%</h3>
                    <p className="text-xs text-slate-400 mt-2 font-medium">Progression moyenne sur les cours</p>
                </div>

                <div className="bg-gradient-to-br from-[#1e293b] to-slate-900 border border-white/5 rounded-[2rem] p-6 shadow-xl relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full blur-2xl group-hover:scale-110 transition-transform" />
                    <div className="flex items-center justify-between mb-4">
                        <span className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Diplômés (100%)</span>
                        <div className="w-8 h-8 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-400">
                            <Award size={16} />
                        </div>
                    </div>
                    <h3 className="text-3xl font-black text-[#10b981] tracking-tight">{stats.certifiedCount}</h3>
                    <p className="text-xs text-slate-400 mt-2 font-medium">Élèves ayant terminé leur syllabus</p>
                </div>
            </div>

            {/* CONTROLS AREA (Search + Course Filter + Progress Selector) */}
            <div className="bg-[#1e293b] border border-white/5 rounded-[2rem] p-6 space-y-6 shadow-xl">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="relative flex-1 group">
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center">
                            <Search className="h-3.5 w-3.5 text-slate-500 group-focus-within:text-primary transition-colors" />
                        </div>
                        <input 
                            type="text"
                            placeholder="Rechercher par nom ou email d'étudiant..." 
                            className="w-full h-12 pl-14 pr-4 bg-[#0f172a]/45 border border-white/5 rounded-2xl text-white placeholder:text-slate-600 focus:outline-none focus:ring-1 focus:ring-primary/20 shadow-inner text-sm font-medium"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    
                    <div className="flex flex-wrap gap-2">
                        {/* Course Dropdown filter */}
                        <div className="relative">
                            <select
                                className="appearance-none h-12 pl-4 pr-10 bg-slate-950/80 border border-white/5 rounded-2xl text-slate-300 focus:outline-none focus:ring-1 focus:ring-primary/20 text-xs font-bold uppercase tracking-wider cursor-pointer"
                                value={selectedCourseId}
                                onChange={(e) => setSelectedCourseId(e.target.value)}
                            >
                                <option value="all">Syllabus : Tous</option>
                                {courses.map(c => (
                                    <option key={c.id} value={c.id}>{c.title}</option>
                                ))}
                            </select>
                            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-slate-500">
                                <BookOpen size={14} />
                            </div>
                        </div>

                        {/* Progress Selector */}
                        <div className="relative">
                            <select
                                className="appearance-none h-12 pl-4 pr-10 bg-slate-950/80 border border-white/5 rounded-2xl text-slate-300 focus:outline-none focus:ring-1 focus:ring-primary/20 text-xs font-bold uppercase tracking-wider cursor-pointer"
                                value={selectedProgressFilter}
                                onChange={(e) => setSelectedProgressFilter(e.target.value as any)}
                            >
                                <option value="all">Statut : Tous</option>
                                <option value="completed">Diplômés (100%)</option>
                                <option value="in_progress">En Cours (&lt;100%)</option>
                            </select>
                            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-slate-500">
                                <Filter size={14} />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* STUDENTS DYNAMIC SYNC PANEL */}
            <div className="bg-[#1e293b]/40 border border-white/5 rounded-[2.5rem] overflow-hidden shadow-2xl">
                <div className="p-6 border-b border-white/5 flex items-center justify-between">
                    <h4 className="font-black text-slate-500 text-[10px] uppercase tracking-[0.3em]">Liste des Inscriptions ({filteredStudents.length})</h4>
                    <span className="text-slate-500 text-[9px] font-mono flex items-center gap-1.5 uppercase">
                        <Database size={10} /> Real-time active database
                    </span>
                </div>

                <div className="divide-y divide-white/5">
                    {filteredStudents.length > 0 ? (
                        filteredStudents.map((enrollment) => {
                            const student = studentsMap[enrollment.studentId] || {};
                            const hasFinished = enrollment.progress === 100;

                            return (
                                <div key={enrollment.id} className="p-6 hover:bg-white/[0.02] transition-colors flex flex-col md:flex-row md:items-center justify-between gap-6">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-white/5 bg-slate-800 flex items-center justify-center text-slate-400 font-black uppercase shrink-0 shadow-inner">
                                            {student.profilePictureURL ? (
                                                <img src={student.profilePictureURL} alt="" className="object-cover w-full h-full" referrerPolicy="no-referrer" />
                                            ) : (
                                                student.fullName?.charAt(0) || '?'
                                            )}
                                        </div>
                                        <div className="min-w-0">
                                            <div className="flex items-center gap-2">
                                                <h4 className="font-bold text-white text-base truncate tracking-tight">{student.fullName || 'Étudiant Ndara'}</h4>
                                                {hasFinished && (
                                                    <span className="bg-emerald-500/10 text-emerald-400 rounded-md p-0.5" title="Syllabus validé">
                                                        <CheckCircle size={14} />
                                                    </span>
                                                )}
                                            </div>
                                            <div className="flex items-center gap-1.5 text-slate-500 text-xs mt-0.5">
                                                <Mail size={12} className="opacity-70" />
                                                <span className="truncate">{student.email || 'non renseigné'}</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Progression dynamic metrics */}
                                    <div className="flex-1 md:max-w-xs space-y-2">
                                        <div className="flex justify-between items-center text-xs">
                                            <span className="text-slate-400 truncate font-semibold uppercase text-[10px] tracking-wider">
                                                {enrollment.courseTitle || 'Formation Ndara'}
                                            </span>
                                            <span className={`font-black tracking-tight ${hasFinished ? 'text-emerald-400' : 'text-primary'}`}>{enrollment.progress}%</span>
                                        </div>
                                        <div className="w-full h-2 bg-slate-950 rounded-full overflow-hidden p-[1px]">
                                            <div 
                                                className={`h-full rounded-full transition-all duration-700 ${hasFinished ? 'bg-gradient-to-r from-emerald-600 to-teal-400' : 'bg-gradient-to-r from-primary to-emerald-500'}`} 
                                                style={{ width: `${enrollment.progress}%` }}
                                            />
                                        </div>
                                    </div>

                                    {/* Action items */}
                                    <div className="flex items-center gap-2 self-end md:self-center">
                                        <button 
                                            onClick={() => navigate(`/student/messages?chatId=${enrollment.studentId}`)}
                                            className="h-10 px-4 bg-slate-900 hover:bg-slate-850 border border-white/5 hover:border-primary/20 hover:text-primary transition rounded-xl flex items-center justify-center gap-2 text-slate-400 text-xs font-bold uppercase tracking-wider"
                                            title="Envoyer un message de coaching"
                                        >
                                            <MessageSquare size={14} /> Message
                                        </button>
                                        <button 
                                            onClick={() => navigate(`/instructor/students`)} // Focus/select info if detailed tracking modal exists or reset
                                            className="w-10 h-10 bg-slate-900 border border-white/5 hover:border-white/10 hover:text-white transition rounded-xl flex items-center justify-center text-slate-400"
                                        >
                                            <ChevronRight size={16} />
                                        </button>
                                    </div>
                                </div>
                            );
                        })
                    ) : (
                        <div className="py-20 text-center opacity-[0.55] transition-opacity">
                            <Users className="h-12 w-12 text-slate-600 mx-auto mb-4" />
                            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Aucun étudiant ne correspond à cette recherche</p>
                        </div>
                    )}
                </div>
            </div>

            {/* COACHING DYNAMIC ASSIST PANEL */}
            <div className="bg-gradient-to-r from-slate-900 to-slate-950 border border-white/5 rounded-[2rem] p-6 shadow-inner relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
                <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary font-black shrink-0">
                        ✨
                    </div>
                    <div className="space-y-1">
                        <h4 className="text-sm font-black uppercase tracking-wider text-white">Ndara Coaching Mathias IA</h4>
                        <p className="text-xs text-slate-400 leading-relaxed max-w-2xl font-medium">
                            Vos élèves bénéficient des cours et d'un accompagnement personnalisé par Mathias. Utilisez la touche <span className="text-[#10b981] font-bold">Message</span> ci-dessus pour leur offrir des feedbacks directs sur leurs devoirs ou syllabus en cours.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
