import { useEffect, useState } from "react";
import {
  collection,
  query,
  where,
  doc,
  onSnapshot,
  addDoc,
  deleteDoc,
} from "firebase/firestore";
import { db } from "../../firebase";
import {
  Star,
  Users,
  Book,
  ArrowLeft,
  Share2,
  Check,
  Award,
  MessageCircle,
  UserPlus,
  UserMinus,
  Quote,
  Globe,
  Twitter,
  Linkedin,
  Youtube,
  Instagram,
  Home,
  Search,
  BookOpen,
  User,
} from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { formatImageUrl } from "../../lib/utils";
import { useRole } from "../../context/RoleContext";

export function PublicInstructorProfile({
  instructorId,
}: {
  instructorId: string;
}) {
  const navigate = useNavigate();
  const { currentUser } = useRole();
  const [instructor, setInstructor] = useState<any>(null);
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followDocId, setFollowDocId] = useState<string | null>(null);
  const [followersCount, setFollowersCount] = useState(0);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    let isFirstLoadFinished = false;

    const handleLoad = () => {
      if (!isFirstLoadFinished) {
        isFirstLoadFinished = true;
        setLoading(false);
      }
    };

    const userRef = doc(db, "users", instructorId);
    const unsubscribeUser = onSnapshot(
      userRef,
      (userSnap) => {
        if (userSnap.exists()) {
          setInstructor({ id: userSnap.id, ...userSnap.data() });
        } else {
          // Fallback to searching by uid just in case
          const qUser = query(
            collection(db, "users"),
            where("uid", "==", instructorId),
          );
          onSnapshot(qUser, (querySnapshot) => {
            if (!querySnapshot.empty) {
              setInstructor({
                id: querySnapshot.docs[0].id,
                ...querySnapshot.docs[0].data(),
              });
            } else {
              setInstructor({
                displayName: "Formateur Ndara",
                photoURL: "",
                bio: "Expert passionné sur Ndara.",
              });
            }
          });
        }
      },
      (error) => console.error("Error fetching user:", error),
    );

    const qCourses = query(
      collection(db, "courses"),
      where("instructorId", "==", instructorId),
      where("status", "==", "Published"),
    );
    const unsubscribeCourses = onSnapshot(
      qCourses,
      (coursesSnap) => {
        setCourses(coursesSnap.docs.map((d) => ({ id: d.id, ...d.data() })));
        handleLoad();
      },
      (error) => {
        console.error("Error fetching courses:", error);
        handleLoad();
      },
    );

    const qFollowers = query(
      collection(db, "user_follows"),
      where("instructorId", "==", instructorId),
    );
    const unsubscribeFollowers = onSnapshot(
      qFollowers,
      (snap) => {
        setFollowersCount(snap.size);
        if (currentUser) {
          const myFollowerDoc = snap.docs.find(
            (d) => d.data().followerId === currentUser.uid,
          );
          if (myFollowerDoc) {
            setIsFollowing(true);
            setFollowDocId(myFollowerDoc.id);
          } else {
            setIsFollowing(false);
            setFollowDocId(null);
          }
        } else {
          setIsFollowing(false);
          setFollowDocId(null);
        }
      },
      (error) => console.error("Error fetching followers:", error),
    );

    return () => {
      unsubscribeUser();
      unsubscribeCourses();
      unsubscribeFollowers();
    };
  }, [instructorId, currentUser]);

  const goBack = () => {
    navigate(-1);
  };

  const handleFollow = async () => {
    if (!currentUser) {
      alert("Vous devez être connecté pour suivre un formateur.");
      navigate("/auth");
      return;
    }
    if (actionLoading) return;

    setActionLoading(true);
    const previousState = isFollowing;
    const previousDocId = followDocId;

    // Optimistic update
    setIsFollowing(!isFollowing);

    try {
      if (previousState && previousDocId) {
        await deleteDoc(doc(db, "user_follows", previousDocId));
        setFollowDocId(null);
      } else {
        const newDoc = await addDoc(collection(db, "user_follows"), {
          followerId: currentUser.uid,
          instructorId: instructorId,
          createdAt: new Date().toISOString(),
        });
        setFollowDocId(newDoc.id);
      }
    } catch (error) {
      console.error("Error toggling follow:", error);
      // Revert optimistic update on error
      setIsFollowing(previousState);
      setFollowDocId(previousDocId);
    } finally {
      setActionLoading(false);
    }
  };

  const location = useLocation();
  const [scrollY, setScrollY] = useState(0);

  const handleContact = () => {
    if (!currentUser) {
      alert("Vous devez être connecté pour contacter un formateur.");
      navigate("/auth");
      return;
    }
    const basePath = location.pathname.startsWith("/instructor")
      ? "/instructor/messages"
      : "/student/messages";
    navigate(`${basePath}?newChatUser=${instructorId}`);
  };

  if (loading)
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );

  const totalStudents = courses.reduce(
    (acc, c) => acc + (c.studentsCount || 0),
    0,
  );

  return (
    <div
      className="bg-[#050505] text-white h-[100dvh] overflow-y-auto flex flex-col font-sans relative"
      onScroll={(e) => setScrollY(e.currentTarget.scrollTop)}
    >
      <style>{`
                .glass-card { background: rgba(26, 26, 26, 0.6); backdrop-filter: blur(20px); border: 1px solid rgba(255, 255, 255, 0.08); }
                .glass-btn { background: rgba(255, 255, 255, 0.03); backdrop-filter: blur(10px); border: 1px solid rgba(255, 255, 255, 0.05); }
                .gradient-bg-animate { background: linear-gradient(-45deg, #10B981, #059669, #047857, #10B981); background-size: 400% 400%; animation: gradient 8s linear infinite; }
                @keyframes gradient { 0%, 100% { background-position: 0% 50%; } 50% { background-position: 100% 50%; } }
                @keyframes float { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-10px); } }
                .floating-badge { animation: float 6s ease-in-out infinite; }
            `}</style>

      {/* Collapsing Header */}
      <header className="sticky top-0 w-full h-[280px] flex-shrink-0 z-0 overflow-hidden bg-[#050505]">
        <div
          className="absolute inset-0 origin-center"
          style={{
            transform: `translateY(${scrollY * 0.4}px) scale(${1 + scrollY * 0.001})`,
            opacity: Math.max(0, 1 - scrollY / 200),
          }}
        >
          {/* Background Hero Image (Blurred Profile Pic) */}
          <div className="absolute inset-0">
            {instructor?.photoURL || instructor?.profilePictureURL ? (
              <img
                src={instructor.photoURL || instructor.profilePictureURL}
                alt=""
                className="w-full h-full object-cover blur-2xl opacity-40 scale-110"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-emerald-900/50 to-[#050505]"></div>
            )}
            <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-[#050505]"></div>
          </div>
        </div>

        <div className="absolute top-safe-pt mt-4 left-0 right-0 px-4 flex justify-between z-20">
          <button
            onClick={goBack}
            className="w-10 h-10 rounded-full bg-black/50 backdrop-blur-md flex items-center justify-center text-white hover:bg-white/10 transition active:scale-95"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <button className="w-10 h-10 rounded-full bg-black/50 backdrop-blur-md flex items-center justify-center text-white hover:bg-white/10 transition active:scale-95">
            <Share2 className="w-5 h-5" />
          </button>
        </div>
      </header>

      <main className="flex-1 w-full max-w-md mx-auto relative z-10 px-4 -mt-20 pb-24">
        <div className="bg-[#0f121e]/95 backdrop-blur-2xl rounded-[2.5rem] border border-white/5 p-6 text-center shadow-2xl min-h-screen">
          <div className="relative inline-block mb-4 -mt-16">
            <div className="w-28 h-28 rounded-full overflow-hidden ring-4 ring-emerald-500/30 mx-auto bg-slate-800 flex items-center justify-center">
              {instructor?.photoURL || instructor?.profilePictureURL ? (
                <img
                  src={instructor.photoURL || instructor.profilePictureURL}
                  alt={instructor.displayName || instructor.fullName}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-4xl font-bold text-white">
                  {instructor?.displayName?.[0] ||
                    instructor?.fullName?.[0] ||
                    "E"}
                </span>
              )}
            </div>
            <div className="absolute bottom-1 right-1 w-8 h-8 rounded-full gradient-bg-animate flex items-center justify-center floating-badge">
              <Check className="w-4 h-4 text-white" />
            </div>
          </div>

          <h1 className="text-2xl font-bold text-white mb-1">
            {instructor?.displayName || instructor?.fullName || "Expert Ndara"}
          </h1>
          <p className="text-emerald-500 text-sm font-semibold mb-2">
            {instructor?.professionalTitle || "Expert Certifié"}
          </p>

          <div className="flex items-center justify-center gap-2 mb-4">
            <span className="glass-btn px-3 py-1 rounded-full text-xs font-semibold text-emerald-500 flex items-center gap-1">
              <Award className="w-3 h-3" /> Expert Certifié
            </span>
            <span className="glass-btn px-3 py-1 rounded-full text-xs font-semibold text-amber-400 flex items-center gap-1">
              <Star className="w-3 h-3 fill-current" /> 4.9/5
            </span>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="glass-card rounded-3xl p-4 active:scale-95 transition">
              <p className="text-2xl font-bold text-white">
                {followersCount > 1000
                  ? `${(followersCount / 1000).toFixed(1)}k`
                  : followersCount}
              </p>
              <p className="text-gray-400 text-xs">Abonnés</p>
            </div>
            <div className="glass-card rounded-3xl p-4 active:scale-95 transition">
              <p className="text-2xl font-bold text-white">{courses.length}</p>
              <p className="text-gray-400 text-xs">Cours</p>
            </div>
            <div className="glass-card rounded-3xl p-4 active:scale-95 transition">
              <p className="text-2xl font-bold text-white">
                {totalStudents > 1000
                  ? `${(totalStudents / 1000).toFixed(1)}k`
                  : totalStudents}
              </p>
              <p className="text-gray-400 text-xs">Étudiants</p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button
              onClick={handleContact}
              className="flex-1 glass-btn py-3.5 rounded-2xl font-semibold text-sm hover:bg-white/10 transition active:scale-95 flex items-center justify-center gap-2"
            >
              <MessageCircle className="w-4 h-4" /> <span>Contacter</span>
            </button>
            <button
              onClick={handleFollow}
              disabled={actionLoading}
              className={`flex-1 py-3.5 rounded-2xl font-semibold text-sm transition active:scale-95 flex items-center justify-center gap-2 ${isFollowing ? "bg-white/10 text-white hover:bg-white/20" : "bg-emerald-500 text-black hover:bg-emerald-400"} disabled:opacity-50`}
            >
              {isFollowing ? (
                <UserMinus className="w-4 h-4" />
              ) : (
                <UserPlus className="w-4 h-4" />
              )}
              <span>{isFollowing ? "Abonné" : "Suivre"}</span>
            </button>
          </div>

          {/* Main Content Sections (About, Courses) */}
          <div className="space-y-6 text-left mt-8">
            {/* About Section */}
            <div>
              <h2 className="text-base font-bold text-white mb-4">À propos</h2>
              <div className="glass-card rounded-3xl p-6 transition">
                <div className="flex items-start gap-3 mb-4">
                  <Quote className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5 fill-emerald-500/20" />
                  <p className="font-serif italic text-gray-300 text-sm leading-relaxed">
                    "Partager mon savoir pour la réussite de tous."
                  </p>
                </div>
                <p className="text-gray-400 text-sm leading-relaxed">
                  {instructor?.bio ||
                    "Aucune biographie disponible pour ce formateur."}
                </p>

                {instructor?.domains && instructor.domains.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-4">
                    {instructor.domains.map((domain: string, idx: number) => (
                      <span
                        key={idx}
                        className="glass-btn px-3 py-1.5 rounded-full text-xs font-medium"
                      >
                        {domain}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Courses Section */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-base font-bold text-white">Formations</h2>
              </div>

              <div className="space-y-3">
                {courses.length === 0 ? (
                  <p className="text-gray-500 text-sm text-center py-4 italic">
                    Aucune formation disponible
                  </p>
                ) : (
                  courses.map((course) => (
                    <div
                      key={course.id}
                      onClick={() => navigate(`/student/courses/${course.id}`)}
                      className="glass-card rounded-3xl p-4 active:scale-95 transition flex items-center gap-4 cursor-pointer"
                    >
                      <div className="w-20 h-14 rounded-2xl overflow-hidden flex-shrink-0 bg-slate-800">
                        {course.thumbnail ? (
                          <img
                            src={formatImageUrl(course.thumbnail)}
                            alt="Course"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-emerald-500">
                            <BookOpen className="w-6 h-6" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-white text-sm leading-tight mb-1 line-clamp-1">
                          {course.title}
                        </h3>
                        <div className="flex items-center gap-2 text-[10px] text-gray-400">
                          <span className="flex items-center gap-1">
                            <Users className="w-3 h-3" />{" "}
                            {course.studentsCount || 0}
                          </span>
                          <span>•</span>
                          <span className="flex items-center gap-1">
                            <Star className="w-3 h-3 text-amber-400 fill-current" />{" "}
                            4.9
                          </span>
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="text-emerald-500 font-bold text-sm">
                          {course.price > 0 ? course.price : "Gratuit"}
                        </p>
                        {course.price > 0 && (
                          <p className="text-gray-500 text-[9px] uppercase">
                            FCFA
                          </p>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Social Links */}
            {instructor?.socials &&
              Object.values(instructor.socials).some((val) => val) && (
                <div>
                  <h2 className="text-base font-bold text-white mb-4">
                    Réseaux
                  </h2>
                  <div className="flex justify-center gap-4 flex-wrap">
                    {instructor.socials.linkedin && (
                      <a
                        href={instructor.socials.linkedin}
                        target="_blank"
                        rel="noreferrer"
                        className="w-12 h-12 rounded-full glass-btn flex items-center justify-center text-gray-400 hover:text-[#0A66C2] hover:bg-[#0A66C2]/20 transition active:scale-90"
                      >
                        <Linkedin className="w-5 h-5" />
                      </a>
                    )}
                    {instructor.socials.youtube && (
                      <a
                        href={instructor.socials.youtube}
                        target="_blank"
                        rel="noreferrer"
                        className="w-12 h-12 rounded-full glass-btn flex items-center justify-center text-gray-400 hover:text-[#FF0000] hover:bg-[#FF0000]/20 transition active:scale-90"
                      >
                        <Youtube className="w-5 h-5" />
                      </a>
                    )}
                    {instructor.socials.twitter && (
                      <a
                        href={instructor.socials.twitter}
                        target="_blank"
                        rel="noreferrer"
                        className="w-12 h-12 rounded-full glass-btn flex items-center justify-center text-gray-400 hover:text-[#1DA1F2] hover:bg-[#1DA1F2]/20 transition active:scale-90"
                      >
                        <Twitter className="w-5 h-5" />
                      </a>
                    )}
                    {instructor.socials.instagram && (
                      <a
                        href={instructor.socials.instagram}
                        target="_blank"
                        rel="noreferrer"
                        className="w-12 h-12 rounded-full glass-btn flex items-center justify-center text-gray-400 hover:text-[#E1306C] hover:bg-[#E1306C]/20 transition active:scale-90"
                      >
                        <Instagram className="w-5 h-5" />
                      </a>
                    )}
                    {instructor.socials.website && (
                      <a
                        href={instructor.socials.website}
                        target="_blank"
                        rel="noreferrer"
                        className="w-12 h-12 rounded-full glass-btn flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/20 transition active:scale-90"
                      >
                        <Globe className="w-5 h-5" />
                      </a>
                    )}
                    {instructor.socials.tiktok && (
                      <a
                        href={instructor.socials.tiktok}
                        target="_blank"
                        rel="noreferrer"
                        className="w-12 h-12 rounded-full glass-btn flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/20 transition active:scale-90"
                      >
                        <span className="font-bold text-xs">Tik</span>
                      </a>
                    )}
                  </div>
                </div>
              )}
          </div>
        </div>
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 w-full max-w-md glass-card z-50 rounded-t-3xl border-b-0 pb-[env(safe-area-inset-bottom)]">
        <div className="flex justify-around items-center h-20 px-2">
          <button
            onClick={() => navigate("/dashboard")}
            className="flex flex-col items-center justify-center w-full gap-1.5 text-gray-400 hover:text-white transition"
          >
            <Home className="w-6 h-6" />
            <span className="text-[10px] font-semibold">Accueil</span>
          </button>
          <button
            onClick={() => navigate("/search")}
            className="flex flex-col items-center justify-center w-full gap-1.5 text-gray-400 hover:text-white transition"
          >
            <Search className="w-6 h-6" />
            <span className="text-[10px] font-semibold">Recherche</span>
          </button>
          <button
            onClick={() => navigate("/student/courses")}
            className="flex flex-col items-center justify-center w-full gap-1.5 text-gray-400 hover:text-white transition"
          >
            <BookOpen className="w-6 h-6" />
            <span className="text-[10px] font-semibold">Cours</span>
          </button>
          <button className="flex flex-col items-center justify-center w-full gap-1.5 text-emerald-500">
            <User className="w-6 h-6" />
            <span className="text-[10px] font-semibold">Profil</span>
          </button>
        </div>
      </nav>
    </div>
  );
}
