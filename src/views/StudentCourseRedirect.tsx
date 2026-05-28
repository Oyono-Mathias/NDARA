import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Loader2 } from 'lucide-react';

/**
 * @fileOverview Redirection bridge to the unified course player.
 * Resolves routing conflicts by ensuring only [slug] is used at the courses level.
 */
export function StudentCourseRedirect() {
  const navigate = useNavigate();
  const params = useParams();
  const slug = params.slug as string;

  useEffect(() => {
    if (slug) {
      // Redirect to the unified course player
      navigate(`/student/courses/${slug}`, { replace: true });
    }
  }, [slug, navigate]);

  return (
    <div className="h-screen flex flex-col items-center justify-center bg-slate-950 text-white pb-40">
      <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
      <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500">Ouverture du lecteur...</p>
    </div>
  );
}
