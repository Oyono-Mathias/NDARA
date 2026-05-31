import { useParams } from 'react-router-dom';
import { PublicInstructorProfile } from '../components/instructor/PublicInstructorProfile';
import { Suspense } from 'react';
import { Loader2 } from 'lucide-react';

export function InstructorPublicProfile() {
  const { slug } = useParams();

  return (
    <Suspense fallback={
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center gap-4">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">Chargement de l'expert...</p>
      </div>
    }>
      <PublicInstructorProfile instructorId={slug!} />
    </Suspense>
  );
}
