import { Ticket } from "lucide-react";

export function CouponsList({ coupons }: { coupons: any[] }) {
  if (coupons.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 px-8 text-center bg-[#1e293b]/50 rounded-[3rem] border-2 border-dashed border-white/5">
        <Ticket className="h-12 w-12 text-slate-700 mb-4" />
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">
          Aucun coupon actif
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {coupons.map((coupon, idx) => (
        <div
          key={idx}
          className="p-5 bg-[#1e293b] border border-white/5 rounded-[2rem] hover:border-primary/30 transition-colors"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="px-3 py-1 bg-primary/20 text-primary text-[10px] font-black uppercase tracking-widest rounded-lg">
              {coupon.code}
            </span>
            <span className="text-slate-400 text-xs font-bold">
              {coupon.discount}% off
            </span>
          </div>
          <p className="text-slate-500 text-xs">
            {coupon.courses?.length || 0} cours éligibles
          </p>
        </div>
      ))}
    </div>
  );
}
