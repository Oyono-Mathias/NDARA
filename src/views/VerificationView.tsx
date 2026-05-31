import { useParams, Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { BadgeCheck, ShieldAlert, Loader2 } from 'lucide-react';
import { db } from '../firebase';
import { cn } from '../lib/utils';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

export function VerificationView() {
  const { certificateId } = useParams();

  const [isLoading, setIsLoading] = useState(true);
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    async function verifyCertificate() {
        if (!certificateId) {
            setError(true);
            setIsLoading(false);
            return;
        }

        try {
            const enrollmentRef = doc(db, 'enrollments', certificateId);
            const enrollmentSnap = await getDoc(enrollmentRef);

            if (!enrollmentSnap.exists()) {
                setError(true);
                setIsLoading(false);
                return;
            }

            const enrollmentData = enrollmentSnap.data();

            if (enrollmentData.progress < 100) {
                 setError(true);
                 setIsLoading(false);
                 return;
            }

            let courseData = { title: 'Unknown Course', instructorId: '' };
            if (enrollmentData.courseId) {
                const courseRef = doc(db, 'courses', enrollmentData.courseId);
                const courseSnap = await getDoc(courseRef);
                if (courseSnap.exists()) {
                    courseData = courseSnap.data() as any;
                }
            }

            let studentData = { fullName: 'Unknown Student' };
            if (enrollmentData.studentId) {
                const studentRef = doc(db, 'users', enrollmentData.studentId);
                const studentSnap = await getDoc(studentRef);
                if (studentSnap.exists()) {
                    studentData = studentSnap.data() as any;
                }
            }
            
            let instructorData = { fullName: 'Ndara Afrique' };
            if (courseData.instructorId) {
                const instructorRef = doc(db, 'users', courseData.instructorId);
                const instructorSnap = await getDoc(instructorRef);
                if (instructorSnap.exists()) {
                    instructorData = instructorSnap.data() as any;
                }
            }

            setData({
                enrollment: enrollmentData,
                course: courseData,
                student: studentData,
                instructor: instructorData
            });

        } catch (err) {
            console.error('Error verifying certificate:', err);
            setError(true);
        } finally {
            setIsLoading(false);
        }
    }

    verifyCertificate();
  }, [certificateId, db]);

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center p-6 relative overflow-hidden">
        {/* Gradients */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-primary/10 rounded-full blur-[100px] pointer-events-none z-0"></div>
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-blue-500/10 rounded-full blur-[100px] pointer-events-none z-0"></div>

        <Link to="/" className="flex items-center gap-3 group transition-transform hover:scale-105 mb-12 relative z-10 glass px-6 py-3 rounded-full border border-white/5">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-primary to-teal-600 flex items-center justify-center text-white font-black text-sm shadow-[0_0_15px_rgba(16,185,129,0.3)]">
                N
            </div>
            <span className="text-lg font-black tracking-tighter text-white uppercase">Ndara Afrique</span>
        </Link>
        
        <div className="w-full max-w-lg z-10 relative">
            {isLoading ? (
                <div className="max-w-2xl mx-auto bg-[#111111] border border-white/5 rounded-3xl shadow-2xl p-12 text-center animate-pulse">
                     <Loader2 className="h-12 w-12 text-primary animate-spin mx-auto mb-6" />
                     <div className="h-6 w-1/2 bg-white/10 rounded mx-auto mb-4" />
                     <div className="h-4 w-3/4 bg-white/10 rounded mx-auto" />
                </div>
            ) : error || !data ? (
                <div className="max-w-2xl mx-auto bg-[#111111] border border-white/5 rounded-3xl shadow-2xl p-12 text-center">
                    <ShieldAlert className="w-16 h-16 text-red-500 mx-auto mb-6" />
                    <h1 className="text-3xl font-black text-white uppercase tracking-tight">Certificat Invalide</h1>
                    <p className="text-slate-400 mt-3 max-w-sm mx-auto text-sm font-medium">
                        Le numéro de certificat est incorrect ou la formation n'est pas encore terminée.
                    </p>
                </div>
            ) : (
                <div className="max-w-2xl mx-auto bg-[#111111] border border-white/5 rounded-3xl shadow-2xl overflow-hidden glass">
                    <div className="p-8 md:p-12 text-center bg-black/40 border-b border-white/5">
                        <BadgeCheck className="h-20 w-20 text-emerald-400 mx-auto animate-pulse drop-shadow-[0_0_15px_rgba(52,211,153,0.5)]" />
                        <h1 className="text-3xl md:text-4xl font-black text-white mt-6 uppercase tracking-tight">Certificat Vérifié</h1>
                        <p className="text-emerald-400 font-bold mt-2 text-sm tracking-widest uppercase">Authenticité confirmée par Ndara Afrique</p>
                    </div>
                    
                    <div className="p-8 md:p-10 space-y-6">
                        <InfoRow label="Décerné à" value={data.student.fullName || data.student.name || 'Étudiant'} />
                        <InfoRow label="Pour la formation" value={data.course.title || 'Formation Ndara'} />
                        {data.enrollment.lastAccessedAt && (
                            <InfoRow 
                                label="Obtenu le" 
                                value={format(data.enrollment.lastAccessedAt.toDate ? data.enrollment.lastAccessedAt.toDate() : new Date(data.enrollment.lastAccessedAt), 'dd MMMM yyyy', { locale: fr })} 
                            />
                        )}
                        <InfoRow label="Instructeur" value={data.instructor.fullName || data.instructor.name || 'Ndara Afrique'} />
                        <InfoRow label="ID du Certificat" value={certificateId as string} isMono />
                    </div>
                </div>
            )}
        </div>
    </div>
  );
}

const InfoRow = ({ label, value, isMono = false }: { label: string, value: string, isMono?: boolean }) => (
    <div className="bg-black/20 p-4 rounded-2xl border border-white/5">
        <p className="text-[10px] font-black text-slate-500 mb-1 uppercase tracking-widest">{label}</p>
        <p className={cn("text-lg text-white font-medium", isMono ? 'font-mono text-base tracking-wider text-emerald-400' : '')}>{value}</p>
    </div>
);
