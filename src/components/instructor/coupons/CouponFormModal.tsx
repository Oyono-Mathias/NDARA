import { useState } from 'react';
import { useRole } from '../../../context/RoleContext';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../../firebase';
import { Loader2 } from 'lucide-react';

export function CouponFormModal({ isOpen, onClose, courses }: any) {
    const { currentUser } = useRole();
    const [code, setCode] = useState('');
    const [discount, setDiscount] = useState('');
    const [selectedCourseIds, setSelectedCourseIds] = useState<string[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    if (!isOpen) return null;

    const handleToggleCourse = (courseId: string) => {
        setSelectedCourseIds(prev => 
            prev.includes(courseId) 
                ? prev.filter(id => id !== courseId)
                : [...prev, courseId]
        );
    };

    const handleCreateCoupon = async () => {
        if (!code || !discount || !currentUser?.uid) return;
        setIsSubmitting(true);
        try {
            await addDoc(collection(db, 'course_coupons'), {
                code: code.toUpperCase(),
                discount: Number(discount),
                courses: selectedCourseIds.length > 0 ? selectedCourseIds : courses.map((c: any) => c.id),
                instructorId: currentUser.uid,
                createdAt: serverTimestamp(),
                active: true,
                uses: 0
            });
            setCode('');
            setDiscount('');
            setSelectedCourseIds([]);
            onClose();
        } catch (error: any) {
            console.error("Erreur lors de la création du coupon:", error);
            alert("Erreur lors de la création : " + (error.message || "Permissions insuffisantes."));
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-black/80 backdrop-blur-sm p-0 md:p-4 animate-in fade-in duration-300">
            <div className="w-full max-w-md p-8 bg-[#0f172a] border-t border-white/10 md:border md:rounded-[2.5rem] rounded-t-[2.5rem] shadow-2xl relative animate-in slide-in-from-bottom-8">
                <h2 className="font-black text-2xl text-white uppercase tracking-tight mb-2">Générer un Coupon</h2>
                <p className="text-slate-400 text-sm mb-8">Boostez vos ventes avec des codes promos limités.</p>
                
                <div className="space-y-6">
                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-2">Code Promo</label>
                        <input 
                            value={code} onChange={e => setCode(e.target.value)}
                            placeholder="ex: RENTREE23"
                            className="w-full bg-[#1e293b] border border-white/5 rounded-2xl h-14 px-4 text-white uppercase font-bold focus:ring-1 focus:ring-primary/50 outline-none placeholder:normal-case placeholder:font-normal placeholder:text-slate-600"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-2">Réduction (%)</label>
                        <input 
                            type="number" min="1" max="100"
                            value={discount} onChange={e => setDiscount(e.target.value)}
                            placeholder="ex: 20"
                            className="w-full bg-[#1e293b] border border-white/5 rounded-2xl h-14 px-4 text-white font-bold focus:ring-1 focus:ring-primary/50 outline-none placeholder:text-slate-600"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-2">Appliquer aux formations</label>
                        <div className="max-h-40 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
                            {courses?.length === 0 ? (
                                <p className="text-xs text-slate-500 italic">Aucune formation disponible.</p>
                            ) : (
                                courses.map((c: any) => (
                                    <label key={c.id} className="flex items-center gap-3 p-3 bg-slate-900 rounded-xl border border-white/5 cursor-pointer hover:border-primary/30 transition">
                                        <input 
                                            type="checkbox" 
                                            checked={selectedCourseIds.includes(c.id)}
                                            onChange={() => handleToggleCourse(c.id)}
                                            className="w-4 h-4 rounded text-primary focus:ring-primary/50 bg-slate-800 border-white/10"
                                        />
                                        <span className="text-sm font-bold text-slate-300 truncate">{c.title}</span>
                                    </label>
                                ))
                            )}
                        </div>
                        <p className="text-[10px] text-slate-500 italic px-2">Si aucun n'est sélectionné, s'appliquera à tous vos cours.</p>
                    </div>
                </div>
                
                <div className="flex gap-3 mt-8">
                    <button onClick={onClose} className="flex-1 h-14 bg-slate-900 border border-white/5 text-slate-400 font-bold text-xs uppercase tracking-widest rounded-2xl hover:text-white transition">Annuler</button>
                    <button 
                        onClick={handleCreateCoupon} 
                        disabled={isSubmitting || !code || !discount}
                        className="flex-1 flex items-center justify-center h-14 bg-primary text-slate-950 font-black text-xs uppercase tracking-widest rounded-2xl hover:bg-emerald-400 transition disabled:opacity-50"
                    >
                        {isSubmitting ? <Loader2 className="animate-spin h-5 w-5" /> : 'Générer'}
                    </button>
                </div>
            </div>
        </div>
    );
}
