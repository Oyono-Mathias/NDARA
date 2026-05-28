import { Megaphone, Ticket, Zap } from "lucide-react";

export function AdminMarketing() {
  return (
    <div className="space-y-6 animate-in fade-in duration-500 font-mono">
       <div className="flex items-center justify-between border-b border-[#10B981]/20 pb-6 mb-6">
         <h1 className="text-2xl font-black text-white tracking-widest uppercase flex items-center gap-3">
            <Megaphone className="text-[#10B981] w-6 h-6" /> GROWTH_HUB
        </h1>
      </div>

       <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="bg-[#10B981]/5 border border-[#10B981]/20 p-6 flex items-start gap-4">
                <Ticket className="w-8 h-8 text-[#10B981]" />
                <div>
                     <h3 className="text-white font-bold text-lg mb-2">Usine à Coupons (Cinema Ticket)</h3>
                     <p className="text-gray-400 text-xs mb-4">Générer des codes promos viraux pour les événements.</p>
                     <button className="text-xs font-bold uppercase tracking-widest text-black bg-[#10B981] px-4 py-2 hover:bg-[#10B981]/80 transition">
                         Générer Coupon
                     </button>
                </div>
            </div>
             <div className="bg-[#050505] border border-white/10 hover:border-[#10B981]/30 p-6 flex items-start gap-4 transition group">
                <Zap className="w-8 h-8 text-gray-500 group-hover:text-amber-500 transition" />
                <div>
                     <h3 className="text-white font-bold text-lg mb-2">Campagnes de Parrainage</h3>
                     <p className="text-gray-400 text-xs mb-4">Ajuster les taux de commissions (actuel: 10%).</p>
                     <button className="text-xs font-bold uppercase tracking-widest text-[#10B981] border border-[#10B981]/30 px-4 py-2 hover:bg-[#10B981]/10 transition">
                         Modifier Taux
                     </button>
                </div>
            </div>
       </div>

       <h3 className="text-white font-bold tracking-widest uppercase text-sm mb-4">Coupons Actifs</h3>
        <div className="space-y-4">
             <CouponCard code="NDARA_LAUNCH" discount="50%" uses="142/500" expires="30 Juin 2026" />
             <CouponCard code="AFRICA_TECH" discount="25%" uses="89/100" expires="15 Juillet 2026" />
        </div>
    </div>
  );
}

function CouponCard({ code, discount, uses, expires }: any) {
    return (
        <div className="border border-white/10 flex flex-col sm:flex-row bg-[#050505]">
            <div className="p-6 border-b sm:border-b-0 sm:border-r border-dashed border-gray-600 flex flex-col justify-center bg-white/5 relative">
                <div className="absolute top-0 left-0 w-2 h-full bg-[#10B981]"></div>
                <span className="text-[10px] uppercase font-bold text-gray-500 tracking-widest mb-1">CODE PROMO</span>
                <span className="text-2xl font-black text-white tracking-widest">{code}</span>
            </div>
            <div className="p-6 flex-1 grid grid-cols-3 gap-4 items-center">
                 <div>
                     <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-1">Réduction</p>
                     <p className="text-[#10B981] text-xl font-black">{discount}</p>
                 </div>
                 <div>
                     <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-1">Utilisations</p>
                     <p className="text-white text-sm font-bold">{uses}</p>
                 </div>
                 <div className="text-right">
                     <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-1">Expire le</p>
                     <p className="text-white text-sm font-bold">{expires}</p>
                 </div>
            </div>
        </div>
    )
}
