import { useState, useMemo, useEffect } from "react";
import { useRole } from "../../context/RoleContext";
import {
  getFirestore,
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
} from "firebase/firestore";
import { Plus, Search, Ticket, Loader2, Sparkles, Filter } from "lucide-react";
import { CouponFormModal } from "../../components/instructor/coupons/CouponFormModal";
import { CouponsList } from "../../components/instructor/coupons/CouponsList";
import { db } from "../../firebase";
import { Skeleton } from "../../components/ui/Skeleton";

export function InstructorCoupons() {
  const { currentUser } = useRole();
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [courses, setCourses] = useState<any[]>([]);
  const [coupons, setCoupons] = useState<any[]>([]);
  const [coursesLoading, setCoursesLoading] = useState(true);
  const [couponsLoading, setCouponsLoading] = useState(true);

  useEffect(() => {
    if (!currentUser?.uid) return;

    const qCourses = query(
      collection(db, "courses"),
      where("instructorId", "==", currentUser.uid),
    );
    const unsubCourses = onSnapshot(qCourses, (snap) => {
      setCourses(snap.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
      setCoursesLoading(false);
    });

    const qCoupons = query(
      collection(db, "course_coupons"),
      where("instructorId", "==", currentUser.uid),
      orderBy("createdAt", "desc"),
    );
    const unsubCoupons = onSnapshot(qCoupons, (snap) => {
      setCoupons(snap.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
      setCouponsLoading(false);
    });

    return () => {
      unsubCourses();
      unsubCoupons();
    };
  }, [currentUser?.uid]);

  const filteredCoupons = useMemo(() => {
    return (
      coupons?.filter((c) =>
        c.code?.toLowerCase().includes(searchTerm.toLowerCase()),
      ) || []
    );
  }, [coupons, searchTerm]);

  return (
    <div className="flex flex-col gap-8 pb-40 min-h-screen relative overflow-hidden bg-transparent font-sans px-4 pt-4 md:p-8">
      <div className="grain-overlay opacity-[0.03] pointer-events-none" />

      <CouponFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        courses={courses || []}
      />

      <header className="z-10 bg-[#0f172a]/95 backdrop-blur-md rounded-3xl p-6 mb-2 border border-white/5 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-black text-2xl text-white uppercase tracking-tight">
              Coupons Promo
            </h1>
            <p className="text-primary text-[10px] font-black uppercase tracking-widest mt-1">
              Outils Marketing 📈
            </p>
          </div>
          <button className="w-10 h-10 rounded-full bg-[#1e293b] border border-white/5 flex items-center justify-center text-slate-500 hover:text-white transition">
            <Filter size={18} />
          </button>
        </div>

        <div className="relative group">
          <div className="absolute left-4 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center">
            <Search className="h-3.5 w-3.5 text-slate-500 group-focus-within:text-primary transition-colors" />
          </div>
          <input
            type="text"
            placeholder="Chercher un code (ex: NDARA20)"
            className="w-full h-14 pl-14 pr-4 bg-[#1e293b] border-none rounded-[2rem] text-white placeholder:text-slate-600 focus:outline-none focus:ring-1 focus:ring-primary/20 shadow-inner"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </header>

      <main className="flex-1 space-y-6 animate-in fade-in duration-700">
        <div className="flex items-center justify-between px-1">
          <h2 className="font-black text-slate-500 text-[10px] uppercase tracking-[0.3em]">
            Mes Offres Actives
          </h2>
          <span className="text-primary text-[10px] font-black uppercase">
            {filteredCoupons.length} coupons
          </span>
        </div>

        {couponsLoading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <Skeleton
                key={i}
                className="h-32 w-full rounded-[2rem] bg-slate-900 border border-white/5"
              />
            ))}
          </div>
        ) : (
          <CouponsList coupons={filteredCoupons} />
        )}
      </main>

      {/* --- FLOATING ACTION BUTTON --- */}
      <button
        onClick={() => setIsModalOpen(true)}
        className="fixed bottom-24 right-6 md:auto md:bottom-8 md:right-8 w-16 h-16 bg-gradient-to-r from-primary to-emerald-600 rounded-full flex items-center justify-center text-slate-950 shadow-2xl shadow-primary/40 z-40 transition-all active:scale-90 hover:scale-110"
      >
        <Ticket size={28} className="fill-current" />
      </button>
    </div>
  );
}
