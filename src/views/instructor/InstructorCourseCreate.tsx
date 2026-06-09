import { useRole } from '../../context/RoleContext';
import { useNavigate } from 'react-router-dom';
import { ShieldAlert, ArrowLeft, Loader2 } from 'lucide-react';
import { CourseForm } from '../../components/instructor/CourseForm';
import { db } from '../../firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

export function InstructorCourseCreate() {
  const { currentUser, isUserLoading } = useRole();
  const navigate = useNavigate();

  if (isUserLoading) {
    return (
        <div className="h-[60vh] flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
    );
  }

  // Bypass temporaire pour le développement : suppression de la vérification stricte du statut
  if (false && currentUser?.status !== 'approved' && currentUser?.role !== 'admin' && currentUser?.role !== 'ceo') {
    return (
      <div className="max-w-2xl mx-auto py-12 px-4 space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
        <div className="flex justify-center mb-8">
            <div className="p-6 bg-red-500/10 rounded-full border-4 border-red-500/20">
                <ShieldAlert className="h-16 w-16 text-red-500" />
            </div>
        </div>
        <div className="text-center space-y-4">
            <h1 className="text-3xl font-black text-white uppercase tracking-tight">Accès restreint</h1>
            <p className="text-slate-400 max-w-md mx-auto leading-relaxed">
                Votre compte formateur est en cours d'examen par notre équipe pédagogique. 
                Dès approbation, vous pourrez créer vos formations et partager votre savoir.
            </p>
        </div>
        <button onClick={() => navigate('/instructor/dashboard')} className="w-full flex items-center justify-center gap-2 h-14 rounded-2xl bg-[#1e293b] border-white/5 text-slate-300 font-bold uppercase text-[10px] tracking-widest mt-8 border transition hover:bg-white/5">
          <ArrowLeft className="h-4 w-4" />
          Retour au tableau de bord
        </button>
      </div>
    );
  }

  const handleCreateCourse = async (data: any) => {
    if (!currentUser) return;
    try {
        const docRef = await addDoc(collection(db, 'courses'), {
            ...data,
            title: data.title || "Nouvelle formation",
            instructorId: currentUser.uid,
            status: 'Draft',
            createdAt: serverTimestamp()
        });
        navigate(`/instructor/courses/edit/${docRef.id}`);
    } catch (e) {
        console.error(e);
        alert("Erreur lors de la création.");
    }
  };

  return (
    <div className="min-h-full bg-slate-950/50 -m-6 p-6 rounded-2xl">
        <CourseForm mode="create" onSubmit={handleCreateCourse} />
    </div>
  );
}
