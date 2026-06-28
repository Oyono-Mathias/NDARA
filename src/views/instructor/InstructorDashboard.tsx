import { useRole } from "../../context/RoleContext";
import {
  collection,
  query,
  where,
  getFirestore,
  onSnapshot,
  orderBy,
  limit,
  getDocs,
  getCountFromServer,
  getAggregateFromServer,
  sum,
} from "firebase/firestore";
import { useEffect, useState } from "react";
import { Skeleton } from "../../components/ui/Skeleton";
import {
  Users,
  TrendingUp,
  ClipboardCheck,
  History,
  Wallet,
  ChartLine,
  Percent,
  Video,
  Megaphone,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { format, subMonths, isSameMonth } from "date-fns";
import { fr } from "date-fns/locale";
import { db } from "../../firebase";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import { TopAppBar } from "../../components/ui/TopAppBar";
import { TouchArea } from "../../components/ui/TouchArea";

export function InstructorDashboard() {
  const { currentUser: instructor, isUserLoading } = useRole();
  const navigate = useNavigate();

  const [pendingSubmissions, setPendingSubmissions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [analytics, setAnalytics] = useState({
    totalRevenue: 0,
    totalStudentsCount: 0,
    successRate: 100,
    totalExpectedModules: 0,
    totalExpectedVideos: 0,
    chartData: [] as any[],
  });

  useEffect(() => {
    if (!instructor?.uid) return;

    let isMounted = true;
    setIsLoading(true);

    const fetchAnalytics = async () => {
      try {
        // 1. Total Inscriptions et Taux de Complétion (< 2 reads total !)
        const enrollmentsRef = collection(db, "enrollments");
        let totalStudents = 0;
        try {
          const totalStudentsSnap = await getCountFromServer(
            query(enrollmentsRef, where("instructorId", "==", instructor.uid)),
          );
          totalStudents = totalStudentsSnap.data().count;
        } catch (err) {
          console.error("Query enrollments failed (totalStudents):", err);
          throw err;
        }

        let successRate = 100;
        if (totalStudents > 0) {
          try {
            const completedSnap = await getCountFromServer(
              query(
                enrollmentsRef,
                where("instructorId", "==", instructor.uid),
                where("progress", "==", 100),
              ),
            );
            successRate = Math.round(
              (completedSnap.data().count / totalStudents) * 100,
            );
          } catch (err) {
            console.error("Query enrollments failed (successRate):", err);
            throw err;
          }
        }

        // 2. Chiffre d'Affaires Global (Server-side aggregation < 1 read)
        const paymentsRef = collection(db, "payments");
        let totalRevenue = 0;
        let recentPayments: any[] = [];
        try {
          const qChartPayments = query(
            paymentsRef,
            where("instructorId", "==", instructor.uid),
            where("status", "==", "Completed"),
            orderBy("date", "desc"),
            limit(200),
          );
          const recentPaymentsSnap = await getDocs(qChartPayments);
          recentPayments = recentPaymentsSnap.docs.map((d) => d.data());

          // Fallback using the fetched documents if aggregation is not supported or skipped
          totalRevenue = recentPayments.reduce(
            (acc, p) => acc + (p.amount || 0),
            0,
          );

          try {
            const revenueSnap = await getAggregateFromServer(
              query(
                paymentsRef,
                where("instructorId", "==", instructor.uid),
                where("status", "==", "Completed"),
              ),
              { totalRevenue: sum("amount") },
            );
            if (revenueSnap.data().totalRevenue) {
              totalRevenue = revenueSnap.data().totalRevenue;
            }
          } catch (aggErr) {
            console.warn(
              "Aggregate server failed, using local calculation (fallback):",
              aggErr,
            );
            // totalRevenue is already calculated from recentPayments
          }
        } catch (err) {
          console.error("Query payments failed (list + aggregate):", err);
          // Do not throw, keep totalRevenue = 0
        }

        const now = new Date();
        const chartData = [];
        for (let i = 5; i >= 0; i--) {
          const monthDate = subMonths(now, i);
          const monthLabel = format(monthDate, "MMM", { locale: fr });
          const monthRevenue = recentPayments
            .filter((p) =>
              isSameMonth(
                (p.date as any)?.toDate?.() || new Date(0),
                monthDate,
              ),
            )
            .reduce((acc, p) => acc + (p.amount || 0), 0);

          chartData.push({ name: monthLabel, total: monthRevenue });
        }

        // 3. Structure Analytics (Courses total modules & videos)
        let totalExpectedModules = 0;
        let totalExpectedVideos = 0;
        try {
          const coursesSnap = await getDocs(
            query(collection(db, "courses"), where("instructorId", "==", instructor.uid))
          );
          coursesSnap.forEach((doc) => {
            const data = doc.data();
            totalExpectedModules += data.totalModules || 0;
            totalExpectedVideos += data.totalVideos || 0;
          });
        } catch (err) {
          console.error("Query courses failed (structure analytics):", err);
        }

        if (isMounted) {
          setAnalytics({
            totalRevenue,
            totalStudentsCount: totalStudents,
            successRate,
            totalExpectedModules,
            totalExpectedVideos,
            chartData,
          });
        }
      } catch (error) {
        console.error("Dashboard Analytics Fetch Error:", error);
      }
    };

    fetchAnalytics();

    // ONLY keep real-time for pending submissions (Limité aux 5 dernières demandes)
    const unsubDevoirs = onSnapshot(
      query(
        collection(db, "assignments_submissions"),
        where("instructorId", "==", instructor.uid),
        where("status", "==", "submitted"),
        orderBy("submittedAt", "desc"),
        limit(5),
      ),
      (snap) => {
        if (isMounted) {
          setPendingSubmissions(
            snap.docs.map((d) => ({ id: d.id, ...d.data() })),
          );
          setIsLoading(false);
        }
      },
      (err) => {
        console.error("Dashboard Realtime Submissions Error:", err);
        if (isMounted) setIsLoading(false);
      },
    );

    return () => {
      isMounted = false;
      unsubDevoirs();
    };
  }, [instructor?.uid, db]);

  if (isUserLoading || isLoading) {
    return (
      <div className="flex flex-col h-full bg-[#0f172a]">
        <TopAppBar title="COCKPIT" />
        <div className="flex flex-col gap-8 p-4">
          <Skeleton className="h-12 w-1/2 bg-slate-800 rounded-xl" />
          <div className="grid grid-cols-1 gap-4">
            <Skeleton className="h-48 rounded-[2.5rem] bg-slate-800" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Skeleton className="h-28 rounded-[2rem] bg-slate-800" />
            <Skeleton className="h-28 rounded-[2rem] bg-slate-800" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-[#0f172a] relative overflow-hidden font-sans">
      <TopAppBar title="COCKPIT" />
      <div className="absolute inset-0 bg-noise opacity-5 pointer-events-none" />

      <main className="flex-1 overflow-y-auto pb-32 px-4 space-y-6 animate-in fade-in duration-700">
        <div className="grid grid-cols-1 gap-4 mt-6">
          <TouchArea
            as="button"
            onClick={() => navigate("/instructor/revenus")}
            className="block group w-full text-left"
          >
            <div className="bg-gradient-to-br from-[#10b981] to-[#047857] rounded-[2.5rem] p-6 border-none shadow-2xl shadow-[#10b981]/20 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl -mr-10 -mt-10 transition-transform duration-700" />
              <div className="relative z-10">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                    <ChartLine className="text-white h-4 w-4" />
                  </div>
                  <span className="text-emerald-100 text-[10px] font-black uppercase tracking-[0.2em]">
                    Solde Disponible
                  </span>
                </div>
                <h2 className="text-white font-black text-4xl mb-1 tracking-tight">
                  {analytics.totalRevenue.toLocaleString("fr-FR")}{" "}
                  <span className="text-lg opacity-60">FCFA</span>
                </h2>
                <p className="text-emerald-200 text-[10px] font-bold uppercase tracking-widest flex items-center gap-1.5">
                  <TrendingUp size={14} /> Croissance live
                </p>

                <div className="mt-6 w-full flex items-center justify-center h-12 rounded-2xl bg-white text-[#047857] hover:bg-slate-50 font-black uppercase text-[10px] tracking-widest shadow-xl border-none transition-colors">
                  <Wallet className="mr-2 h-4 w-4" /> Demander un virement
                </div>
              </div>
            </div>
          </TouchArea>

          <div className="grid grid-cols-2 gap-4">
            <TouchArea
              as="div"
              className="bg-[#1e293b] rounded-[2rem] p-5 border border-[#10b981]/20 shadow-xl"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="w-8 h-8 rounded-xl bg-blue-500/20 flex items-center justify-center text-blue-400">
                  <Users size={16} />
                </div>
                <span className="text-slate-500 text-[9px] font-black uppercase tracking-widest">
                  Mes Ndara
                </span>
              </div>
              <p className="text-white font-black text-2xl leading-none">
                {analytics.totalStudentsCount}
              </p>
              <p className="text-slate-600 text-[8px] font-bold uppercase tracking-tighter mt-1.5">
                Étudiants actifs
              </p>
            </TouchArea>

            <TouchArea
              as="div"
              className="bg-[#1e293b] rounded-[2rem] p-5 border border-[#10b981]/20 shadow-xl"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="w-8 h-8 rounded-xl bg-[#10b981]/20 flex items-center justify-center text-[#10b981]">
                  <Percent size={16} />
                </div>
                <span className="text-slate-500 text-[9px] font-black uppercase tracking-widest">
                  Réussite
                </span>
              </div>
              <p className="text-white font-black text-2xl leading-none">
                {analytics.successRate}%
              </p>
              <p className="text-slate-600 text-[8px] font-bold uppercase tracking-tighter mt-1.5">
                Taux de complétion
              </p>
            </TouchArea>
          </div>
        </div>

        {/* Progression Certification */}
        <div className="bg-[#1e293b] rounded-[2.5rem] p-6 border border-white/5 shadow-2xl relative overflow-hidden">
          <div className="absolute -right-10 -top-10 w-40 h-40 bg-[#10b981]/5 rounded-full blur-3xl pointer-events-none" />
          <div className="flex items-center justify-between mb-5">
            <h3 className="font-black text-white text-xs uppercase tracking-[0.2em] flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#10b981] shadow-[0_0_10px_rgba(16,185,129,0.5)]"></span>
              Progression & Certification
            </h3>
            <div className="bg-[#0f172a] px-3 py-1.5 rounded-full border border-white/10 text-[9px] font-black text-slate-400 uppercase tracking-widest">
              Automatique
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-[#0f172a]/50 rounded-2xl p-4 border border-white/5">
              <div className="text-slate-500 text-[9px] font-black uppercase tracking-widest mb-1">
                Modules cibles
              </div>
              <div className="text-white font-black text-xl">
                {analytics.totalExpectedModules}
              </div>
              <div className="text-[#10b981] text-[8px] font-bold uppercase tracking-tighter mt-1">
                Définis par vos soins
              </div>
            </div>
            <div className="bg-[#0f172a]/50 rounded-2xl p-4 border border-white/5">
              <div className="text-slate-500 text-[9px] font-black uppercase tracking-widest mb-1">
                Vidéos cibles
              </div>
              <div className="text-white font-black text-xl">
                {analytics.totalExpectedVideos}
              </div>
              <div className="text-[#10b981] text-[8px] font-bold uppercase tracking-tighter mt-1">
                À valider (100%)
              </div>
            </div>
          </div>
          <div className="mt-4 text-xs text-slate-400 leading-relaxed italic">
            Les certificats seront générés automatiquement lorsque les étudiants auront visionné la totalité des {analytics.totalExpectedVideos} vidéos requises.
          </div>
        </div>

        <div className="bg-[#1e293b] rounded-[2.5rem] p-6 border border-white/5 shadow-2xl overflow-hidden">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-black text-white text-xs uppercase tracking-[0.2em]">
              Trésorerie
            </h3>
            <div className="bg-[#0f172a] px-3 py-1.5 rounded-full border border-white/10 text-[9px] font-black text-primary uppercase tracking-widest">
              6 MOIS
            </div>
          </div>
          <div className="h-48 w-full -ml-4">
            <ResponsiveContainer
              width="100%"
              height="100%"
              minHeight={200}
              minWidth={200}
            >
              <AreaChart data={analytics.chartData}>
                <defs>
                  <linearGradient
                    id="chartGradient"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop offset="0%" stopColor="#10b981" stopOpacity={0.4} />
                    <stop offset="100%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="white"
                  opacity={0.05}
                />
                <XAxis
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#64748b", fontSize: 10, fontWeight: "900" }}
                  dy={10}
                />
                <YAxis hide />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#1e293b",
                    border: "1px solid rgba(255,255,255,0.1)",
                    borderRadius: "16px",
                    fontSize: "12px",
                  }}
                  itemStyle={{ color: "#10b981", fontWeight: "bold" }}
                />
                <Area
                  type="monotone"
                  dataKey="total"
                  stroke="#10b981"
                  strokeWidth={4}
                  fill="url(#chartGradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <section className="space-y-4">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-xs font-black uppercase tracking-[0.3em] text-slate-500 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]"></span>
              À Corriger
            </h2>
            <Link
              to="/instructor/devoirs"
              className="text-primary text-[10px] font-black uppercase tracking-widest hover:text-white transition"
            >
              VOIR TOUT
            </Link>
          </div>

          <div className="grid gap-3">
            {pendingSubmissions.length > 0 ? (
              pendingSubmissions.map((sub) => (
                <TouchArea
                  as="div"
                  key={sub.id}
                  className="bg-[#1e293b] rounded-[2rem] p-4 border border-white/5 flex items-center gap-4 shadow-xl"
                >
                  <div className="h-12 w-12 rounded-full border-2 border-white/10 shadow-lg overflow-hidden bg-slate-800 flex items-center justify-center font-bold uppercase text-slate-500 shrink-0">
                    {sub.studentAvatarUrl ? (
                      <img
                        src={sub.studentAvatarUrl}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      sub.studentName?.charAt(0) || "E"
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-black text-white text-sm truncate uppercase tracking-tight">
                      {sub.studentName}
                    </h4>
                    <p className="text-slate-500 text-[10px] font-medium truncate italic">
                      "{sub.assignmentTitle}"
                    </p>
                    <p className="text-slate-600 text-[8px] font-black uppercase tracking-tighter mt-1 flex items-center gap-1">
                      <History size={10} /> Remis récemment
                    </p>
                  </div>
                  <Link
                    to="/instructor/devoirs"
                    className="h-10 flex items-center justify-center px-5 rounded-2xl bg-[#10b981] hover:bg-emerald-600 text-slate-950 font-black uppercase text-[10px] tracking-widest shadow-lg border-none transition-colors"
                  >
                    Noter
                  </Link>
                </TouchArea>
              ))
            ) : (
              <div className="py-12 text-center bg-slate-900/20 rounded-[2.5rem] border-2 border-dashed border-white/5 opacity-20">
                <ClipboardCheck className="h-10 w-10 mx-auto text-slate-700 mb-3" />
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-600">
                  Tout est corrigé !
                </p>
              </div>
            )}
          </div>
        </section>

        <div className="grid grid-cols-2 gap-4 pb-12">
          <TouchArea
            as="button"
            onClick={() => navigate("/instructor/courses/create")}
            className="block group w-full text-left"
          >
            <div className="bg-[#1e293b] rounded-[2rem] p-6 border border-white/5 flex flex-col items-center justify-center gap-4 shadow-xl">
              <div className="w-14 h-14 rounded-3xl bg-[#10b981]/10 flex items-center justify-center text-[#10b981] group-hover:bg-[#10b981] group-hover:text-slate-950 transition-all shadow-inner">
                <Video size={24} />
              </div>
              <span className="text-white text-[10px] font-black uppercase tracking-[0.2em]">
                Nouveau Cours
              </span>
            </div>
          </TouchArea>

          <TouchArea
            as="button"
            onClick={() => navigate("/instructor/annonces")}
            className="block group w-full text-left"
          >
            <div className="bg-[#1e293b] rounded-[2rem] p-6 border border-white/5 flex flex-col items-center justify-center gap-4 shadow-xl">
              <div className="w-14 h-14 rounded-3xl bg-blue-500/10 flex items-center justify-center text-blue-400 group-hover:bg-blue-500 group-hover:text-white transition-all shadow-inner">
                <Megaphone size={24} />
              </div>
              <span className="text-white text-[10px] font-black uppercase tracking-[0.2em]">
                Annonce
              </span>
            </div>
          </TouchArea>
        </div>
      </main>
    </div>
  );
}
