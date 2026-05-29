import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';

export function RedirectWishlist() {
    const navigate = useNavigate();

    useEffect(() => {
        // Redirection de l'ancienne route vers la nouvelle route unifiée 'wishlist' (ou courses/search si non défini)
        navigate('/student/search', { replace: true });
    }, [navigate]);

    return (
        <div className="h-screen bg-slate-950 flex flex-col items-center justify-center gap-4 -mt-32">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Chargement de vos favoris...</p>
        </div>
    );
}
