export function CouponFormModal({ isOpen, onClose, courses }: any) {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <div className="w-full max-w-md p-6 bg-[#1e293b] border border-white/10 rounded-[2rem] shadow-2xl relative">
                <h2 className="font-black text-xl text-white uppercase tracking-tight mb-4">Créer un coupon</h2>
                <p className="text-slate-400 text-sm mb-6">Sélectionnez les cours et appliquez une réduction.</p>
                
                <div className="flex bg-slate-900 border border-white/5 rounded-xl p-3 mb-6 items-center justify-center text-slate-500 text-xs italic">
                    <p>Formulaire en développement</p>
                </div>
                
                <div className="flex gap-3">
                    <button onClick={onClose} className="flex-1 py-3 text-slate-400 font-black text-xs uppercase tracking-widest hover:text-white transition">Annuler</button>
                    <button onClick={onClose} className="flex-1 py-3 bg-primary text-slate-950 font-black text-xs uppercase tracking-widest rounded-xl hover:bg-emerald-500 transition">Créer</button>
                </div>
            </div>
        </div>
    );
}
