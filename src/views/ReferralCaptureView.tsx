import { useEffect, useState } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { getFirestore, doc, getDoc } from 'firebase/firestore';
import { Loader2, ArrowRight } from 'lucide-react';
import { db } from '../firebase';

export function ReferralCaptureView() {
    const { slug } = useParams();
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    
    const referralCode = searchParams.get('code');
    const [instructor, setInstructor] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (!slug) return;
        
        async function fetchInstructor() {
            try {
                const instructorRef = doc(db, 'users', slug as string);
                const snap = await getDoc(instructorRef);
                if (snap.exists()) {
                    setInstructor(snap.data());
                }
            } catch(e) {
                console.error(e);
            } finally {
                setIsLoading(false);
            }
        }
        
        fetchInstructor();
        
        const referralData = {
            instructorId: slug,
            referralCode: referralCode || 'NDARA',
            timestamp: Date.now(),
            expiresAt: Date.now() + (30 * 24 * 60 * 60 * 1000)
        };

        localStorage.setItem('ndara_referral', JSON.stringify(referralData));
    }, [slug, referralCode, db]);

    if (isLoading) {
        return (
            <div className="h-screen bg-black flex flex-col items-center justify-center gap-4">
                <Loader2 className="h-10 w-10 animate-spin text-primary" />
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">Connexion Ndara...</p>
            </div>
        );
    }

    return (
        <div className="h-screen bg-black flex flex-col items-center justify-center p-6 relative overflow-hidden">
            <div className="absolute inset-0 bg-primary/5 blur-[120px] rounded-full pointer-events-none" />
            <div className="w-full max-w-sm space-y-8 text-center z-10 animate-in fade-in zoom-in duration-700 glass p-8 rounded-[2rem] border border-white/5">
                <div className="h-24 w-24 rounded-full border-4 border-[#111111] shadow-2xl mx-auto overflow-hidden bg-[#111111] flex items-center justify-center text-3xl font-black text-slate-500 relative">
                     {instructor?.profilePictureURL ? (
                         <img src={instructor.profilePictureURL} alt={instructor.fullName} className="w-full h-full object-cover" />
                     ) : (
                         instructor?.fullName?.charAt(0) || instructor?.name?.charAt(0) || 'N'
                     )}
                </div>

                <div className="space-y-3">
                    <h1 className="text-2xl font-black text-white uppercase tracking-tight leading-tight">
                        <span className="text-primary">{instructor?.fullName || instructor?.name || "Un expert"}</span> <br/>
                        vous invite à apprendre.
                    </h1>
                </div>

                <button 
                  onClick={() => navigate('/student/search')} 
                  className="w-full h-16 flex items-center justify-center rounded-2xl bg-primary text-black font-black uppercase text-xs tracking-widest shadow-[0_4px_20px_rgba(16,185,129,0.3)] active:scale-95 transition-all group hover:bg-emerald-400"
                >
                    Explorer le catalogue
                    <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </button>
            </div>
        </div>
    );
}
