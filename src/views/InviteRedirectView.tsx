import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getFirestore, collection, query, where, getDocs, limit } from 'firebase/firestore';
import { Loader2 } from 'lucide-react';
import { db } from '../firebase';

export function InviteRedirectView() {
    const { username } = useParams();
    const navigate = useNavigate();

    useEffect(() => {
        const resolveUsername = async () => {
            const q = query(collection(db, 'users'), where('username', '==', username), limit(1));
            try {
                const snap = await getDocs(q);

                if (!snap.empty) {
                    const userData = snap.docs[0].data();
                    const uid = snap.docs[0].id;
                    const code = userData.referralCode || 'NDARA';
                    navigate(`/invite/${uid}?code=${code}`, { replace: true });
                } else {
                    navigate('/student/search', { replace: true });
                }
            } catch(e) {
                console.error(e);
                navigate('/', { replace: true });
            }
        };

        if (username) {
            resolveUsername();
        }
    }, [username, navigate]);

    return (
        <div className="h-screen flex flex-col items-center justify-center bg-black text-white font-sans overflow-hidden relative">
            <div className="absolute inset-0 bg-primary/5 blur-[120px] rounded-full pointer-events-none" />
            <div className="relative z-10 text-center flex flex-col items-center">
                <Loader2 className="h-10 w-10 animate-spin text-primary mb-6" />
                <h1 className="text-[10px] font-black uppercase tracking-[0.4em] text-white/80 animate-pulse">
                    Connexion Ndara...
                </h1>
                <p className="text-[9px] text-slate-600 font-bold uppercase tracking-widest mt-3">
                    Redirection vers le profil de l'expert
                </p>
            </div>
        </div>
    );
}
