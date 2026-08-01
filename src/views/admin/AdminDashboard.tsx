import { logger } from '../../lib/logger';
import React, { useEffect, useState } from 'react';
import { 
  collection, query, where, getDocs, onSnapshot,
  limit, orderBy, getCountFromServer, collectionGroup
} from 'firebase/firestore';
import { db } from '../../firebase';
import { 
  Users, BookOpen, Wallet, Target, ArrowUpRight, 
  Loader2, BadgeCheck, AlertCircle, Clock,
  GraduationCap, UserCog, Layers, PlayCircle,
  FileText, Download, UsersRound, MessageSquare, Bell,
  Activity, UserPlus, LogIn, Sparkles
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar
} from 'recharts';
import { useRole } from '../../context/RoleContext';

export function AdminDashboard() {
  const { isUserLoading, role } = useRole();
  const [stats, setStats] = useState({
    users: 0,
    students: 0,
    instructors: 0,
    courses: 0,
    categories: 0,
    publishedCourses: 0,
    enrollments: 0,
    certificates: 0,
    downloads: 0,
    communities: 0,
    messages: 0,
    notifications: 0,
  });

  const [recentUsers, setRecentUsers] = useState<any[]>([]);
  const [recentCourses, setRecentCourses] = useState<any[]>([]);
  const [recentEnrollments, setRecentEnrollments] = useState<any[]>([]);
  const [recentConnections, setRecentConnections] = useState<any[]>([]);
  const [chartData, setChartData] = useState<any[]>([]);
  
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isUserLoading) return;
    if (role !== 'admin' && role !== 'ceo') {
      setLoading(false);
      return;
    }

    let isMounted = true;

    async function fetchDashboardData() {
      try {
        // 1. Fetch KPI counts
        const usersRef = collection(db, 'users');
        const coursesRef = collection(db, 'courses');
        
        const [
          totalUsers, students, instructors, totalCourses,
          publishedCourses, categories, enrollments, certificates,
          downloads, communities, messages, notifications
        ] = await Promise.all([
          getCountFromServer(usersRef),
          getCountFromServer(query(usersRef, where('role', '==', 'student'))),
          getCountFromServer(query(usersRef, where('role', '==', 'instructor'))),
          getCountFromServer(coursesRef),
          getCountFromServer(query(coursesRef, where('status', '==', 'Published'))),
          getCountFromServer(collection(db, 'categories')).catch(() => ({ data: () => ({ count: 0 }) })),
          getCountFromServer(collection(db, 'enrollments')),
          getCountFromServer(collectionGroup(db, 'certificates')),
          getCountFromServer(collection(db, 'downloads')).catch(() => ({ data: () => ({ count: 0 }) })),
          getCountFromServer(collection(db, 'squads')),
          getCountFromServer(collectionGroup(db, 'messages')),
          getCountFromServer(collection(db, 'notifications'))
        ]);

        if (isMounted) {
          setStats({
            users: totalUsers.data().count,
            students: students.data().count,
            instructors: instructors.data().count,
            courses: totalCourses.data().count,
            publishedCourses: publishedCourses.data().count,
            categories: categories.data().count,
            enrollments: enrollments.data().count,
            certificates: certificates.data().count,
            downloads: downloads.data().count,
            communities: communities.data().count,
            messages: messages.data().count,
            notifications: notifications.data().count,
          });
        }
      } catch (error) {
        logger.error("Erreur KPI:", error);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    fetchDashboardData();

    // Listeners for recent activities
    const unsubUsers = onSnapshot(query(collection(db, 'users'), orderBy('createdAt', 'desc'), limit(5)), (snap) => {
      if (isMounted) setRecentUsers(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });

    const unsubCourses = onSnapshot(query(collection(db, 'courses'), orderBy('createdAt', 'desc'), limit(5)), (snap) => {
      if (isMounted) setRecentCourses(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });

    const unsubEnrollments = onSnapshot(query(collection(db, 'enrollments'), orderBy('enrolledAt', 'desc'), limit(5)), (snap) => {
      if (isMounted) setRecentEnrollments(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });

    const unsubConnections = onSnapshot(query(collection(db, 'audit_logs'), where('action', '==', 'LOGIN'), orderBy('timestamp', 'desc'), limit(5)), (snap) => {
      if (isMounted) setRecentConnections(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });

    return () => {
      isMounted = false;
      unsubUsers();
      unsubCourses();
      unsubEnrollments();
      unsubConnections();
    };
  }, [isUserLoading, role]);

  if (loading || isUserLoading) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
      </div>
    );
  }

  const kpis = [
    { label: "Total Utilisateurs", value: stats.users, icon: Users, color: "text-emerald-400", bg: "bg-emerald-400/10" },
    { label: "Étudiants", value: stats.students, icon: GraduationCap, color: "text-blue-400", bg: "bg-blue-400/10" },
    { label: "Formateurs", value: stats.instructors, icon: UserCog, color: "text-purple-400", bg: "bg-purple-400/10" },
    { label: "Total Formations", value: stats.courses, icon: BookOpen, color: "text-amber-400", bg: "bg-amber-400/10" },
    { label: "Cours Publiés", value: stats.publishedCourses, icon: PlayCircle, color: "text-emerald-400", bg: "bg-emerald-400/10" },
    { label: "Catégories", value: stats.categories, icon: Layers, color: "text-indigo-400", bg: "bg-indigo-400/10" },
    { label: "Inscriptions", value: stats.enrollments, icon: Target, color: "text-rose-400", bg: "bg-rose-400/10" },
    { label: "Certificats", value: stats.certificates, icon: BadgeCheck, color: "text-yellow-400", bg: "bg-yellow-400/10" },
    { label: "Téléchargements", value: stats.downloads, icon: Download, color: "text-cyan-400", bg: "bg-cyan-400/10" },
    { label: "Communautés", value: stats.communities, icon: UsersRound, color: "text-orange-400", bg: "bg-orange-400/10" },
    { label: "Messages", value: stats.messages, icon: MessageSquare, color: "text-pink-400", bg: "bg-pink-400/10" },
    { label: "Notifications", value: stats.notifications, icon: Bell, color: "text-slate-400", bg: "bg-slate-400/10" },
  ];

  return (
    <div className="space-y-6 pb-20 md:pb-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white tracking-widest uppercase">Tableau de bord</h1>
          <p className="text-sm text-slate-400 mt-1">Vue d'ensemble en temps réel de la plateforme.</p>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {kpis.map((kpi, index) => (
          <div key={index} className="p-4 bg-slate-800/50 border border-slate-700/50 rounded-2xl flex flex-col justify-between">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm text-slate-400 font-medium">{kpi.label}</span>
              <div className={`p-2 rounded-xl ${kpi.bg}`}>
                <kpi.icon className={`w-4 h-4 ${kpi.color}`} />
              </div>
            </div>
            <div className="text-3xl font-black text-white">{kpi.value.toLocaleString()}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Nouveaux utilisateurs */}
        <div className="bg-slate-800/30 border border-slate-700/50 rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-6">
            <UserPlus className="w-5 h-5 text-blue-400" />
            <h2 className="text-lg font-bold text-white uppercase tracking-widest text-sm">Nouveaux utilisateurs</h2>
          </div>
          <div className="space-y-3">
            {recentUsers.map(user => (
              <div key={user.id} className="flex items-center justify-between p-3 bg-slate-800/50 rounded-xl border border-slate-700/50">
                <div>
                  <div className="text-sm font-bold text-white">{user.fullName || user.email}</div>
                  <div className="text-xs text-slate-400">{user.email} • {user.role}</div>
                </div>
                <div className="text-[10px] text-slate-500 font-mono">
                  {user.createdAt?.toDate ? user.createdAt.toDate().toLocaleDateString() : 'N/A'}
                </div>
              </div>
            ))}
            {recentUsers.length === 0 && <p className="text-slate-500 text-sm">Aucun utilisateur récent.</p>}
          </div>
        </div>

        {/* Dernières formations */}
        <div className="bg-slate-800/30 border border-slate-700/50 rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-6">
            <Sparkles className="w-5 h-5 text-amber-400" />
            <h2 className="text-lg font-bold text-white uppercase tracking-widest text-sm">Dernières formations créées</h2>
          </div>
          <div className="space-y-3">
            {recentCourses.map(course => (
              <div key={course.id} className="flex items-center justify-between p-3 bg-slate-800/50 rounded-xl border border-slate-700/50">
                <div className="flex-1 min-w-0 pr-4">
                  <div className="text-sm font-bold text-white truncate">{course.title}</div>
                  <div className="text-xs text-slate-400">{course.status}</div>
                </div>
                <div className="text-[10px] text-slate-500 font-mono shrink-0">
                  {course.createdAt?.toDate ? course.createdAt.toDate().toLocaleDateString() : 'N/A'}
                </div>
              </div>
            ))}
            {recentCourses.length === 0 && <p className="text-slate-500 text-sm">Aucune formation récente.</p>}
          </div>
        </div>

        {/* Dernières inscriptions */}
        <div className="bg-slate-800/30 border border-slate-700/50 rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-6">
            <Target className="w-5 h-5 text-emerald-400" />
            <h2 className="text-lg font-bold text-white uppercase tracking-widest text-sm">Dernières inscriptions</h2>
          </div>
          <div className="space-y-3">
            {recentEnrollments.map(enr => (
              <div key={enr.id} className="flex items-center justify-between p-3 bg-slate-800/50 rounded-xl border border-slate-700/50">
                <div className="flex-1 min-w-0 pr-4">
                  <div className="text-sm font-bold text-white truncate">{enr.courseTitle || 'ID: ' + enr.courseId}</div>
                  <div className="text-xs text-slate-400">Progression: {enr.progress || 0}%</div>
                </div>
                <div className="text-[10px] text-slate-500 font-mono shrink-0">
                  {enr.enrolledAt?.toDate ? enr.enrolledAt.toDate().toLocaleDateString() : 'N/A'}
                </div>
              </div>
            ))}
            {recentEnrollments.length === 0 && <p className="text-slate-500 text-sm">Aucune inscription récente.</p>}
          </div>
        </div>

        {/* Dernières connexions */}
        <div className="bg-slate-800/30 border border-slate-700/50 rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-6">
            <LogIn className="w-5 h-5 text-indigo-400" />
            <h2 className="text-lg font-bold text-white uppercase tracking-widest text-sm">Dernières connexions</h2>
          </div>
          <div className="space-y-3">
            {recentConnections.map(log => (
              <div key={log.id} className="flex items-center justify-between p-3 bg-slate-800/50 rounded-xl border border-slate-700/50">
                <div>
                  <div className="text-sm font-bold text-white">{log.userEmail || log.userId}</div>
                  <div className="text-xs text-slate-400">IP: {log.ipAddress || 'Inconnue'}</div>
                </div>
                <div className="text-[10px] text-slate-500 font-mono">
                  {log.timestamp?.toDate ? log.timestamp.toDate().toLocaleString() : 'N/A'}
                </div>
              </div>
            ))}
            {recentConnections.length === 0 && <p className="text-slate-500 text-sm">Aucune connexion récente dans le journal d'activité.</p>}
          </div>
        </div>
      </div>
    </div>
  );
}
