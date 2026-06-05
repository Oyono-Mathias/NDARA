import React, { useState, useEffect } from "react";
import { 
  Search, Plus, Users, BookOpen, LogIn, LogOut, X, Loader2, Trophy
} from "lucide-react";
import { 
  collection, 
  query, 
  onSnapshot, 
  addDoc, 
  serverTimestamp, 
  doc, 
  runTransaction,
  orderBy
} from "firebase/firestore";
import { db } from "../firebase";
import { useRole } from "../context/RoleContext";
import { useNavigate } from "react-router-dom";

interface Squad {
  id: string;
  name: string;
  description: string;
  courseId: string;
  courseTitle: string;
  creatorId: string;
  membersCount: number;
  membersList: string[];
  createdAt: any;
}

export function StudentSquads() {
  const { currentUser, isUserLoading } = useRole();
  const navigate = useNavigate();
  const [squads, setSquads] = useState<Squad[]>([]);
  const [courses, setCourses] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  
  // Drawer / Creation state
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [actionStatus, setActionStatus] = useState<{type: 'success'|'error', text: string} | null>(null);

  // Form state
  const [newSquadName, setNewSquadName] = useState("");
  const [newSquadDesc, setNewSquadDesc] = useState("");
  const [selectedCourse, setSelectedCourse] = useState("");

  useEffect(() => {
    if (isUserLoading) return;
    if (!currentUser) {
      setIsLoading(false);
      return;
    }

    // Listen to squads
    const q = query(collection(db, "squads"), orderBy("createdAt", "desc"));
    const unsubSquads = onSnapshot(q, (snap) => {
      const data = snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Squad));
      setSquads(data);
      setIsLoading(false);
    }, (err) => {
      console.error("Error fetching squads:", err);
      setIsLoading(false);
    });

    // Listen to courses for the dropdown
    const coursesQ = query(collection(db, "courses"), where('status', '==', 'Published'));
    const unsubCourses = onSnapshot(coursesQ, (snap) => {
       const data = snap.docs.map(c => ({ id: c.id, ...c.data() }));
       setCourses(data);
    }, (err) => console.log('Error loading courses for dropdown:', err));

    return () => {
      unsubSquads();
      unsubCourses();
    };
  }, [currentUser, isUserLoading]);

  const handleCreateSquad = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser?.uid) return;
    if (!newSquadName.trim() || !selectedCourse) return;

    setIsSubmitting(true);
    setActionStatus(null);
    try {
      const courseDetails = courses.find(c => c.id === selectedCourse);
      
      await addDoc(collection(db, "squads"), {
        name: newSquadName.trim(),
        description: newSquadDesc.trim(),
        courseId: selectedCourse,
        courseTitle: courseDetails?.title || "Cours inconnu",
        creatorId: currentUser.uid,
        membersCount: 1,
        membersList: [currentUser.uid],
        createdAt: serverTimestamp()
      });

      setActionStatus({ type: 'success', text: 'Squad créée avec succès !' });
      setNewSquadName("");
      setNewSquadDesc("");
      setSelectedCourse("");
      setTimeout(() => {
        setIsDrawerOpen(false);
        setActionStatus(null);
      }, 2000);
    } catch (error: any) {
      console.error("Create squad error:", error);
      setActionStatus({ type: 'error', text: "Erreur lors de la création de la Squad." });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleJoin = async (squad: Squad) => {
    if (!currentUser?.uid) return;
    setIsSubmitting(true);
    setActionStatus(null);
    
    const isMember = squad.membersList.includes(currentUser.uid);
    const squadRef = doc(db, "squads", squad.id);

    try {
      await runTransaction(db, async (transaction) => {
        const squadDoc = await transaction.get(squadRef);
        if (!squadDoc.exists()) {
          throw new Error("Cette Squad n'existe plus.");
        }

        const data = squadDoc.data() as Squad;
        const currentList = data.membersList || [];
        
        if (isMember) {
          // Leave squad
          const newList = currentList.filter(id => id !== currentUser.uid);
          transaction.update(squadRef, {
            membersList: newList,
            membersCount: newList.length
          });
        } else {
          // Join squad
          if (currentList.includes(currentUser.uid)) return; // already in
          const newList = [...currentList, currentUser.uid];
          transaction.update(squadRef, {
            membersList: newList,
            membersCount: newList.length
          });
        }
      });

      setActionStatus({ 
        type: 'success', 
        text: isMember ? 'Vous avez quitté la Squad.' : 'Vous avez rejoint la Squad !' 
      });
      setTimeout(() => setActionStatus(null), 3000);
    } catch (err: any) {
      console.error("Join/Leave error:", err);
      setActionStatus({ type: 'error', text: err.message || "Erreur réseau." });
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredSquads = squads.filter(s => 
    s.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    s.courseTitle?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-transparent animate-in fade-in pb-24 relative">
      
      {/* Search Header */}
      <div className="sticky top-0 z-20 bg-background/80 backdrop-blur-xl border-b border-white/5 pt-4 pb-4 px-4">
         <div className="flex justify-between items-center mb-4">
            <div>
              <h1 className="text-2xl font-black text-white">Student Squads</h1>
              <p className="text-xs text-slate-400 mt-1">Apprenez ensemble, réussissez plus vite.</p>
            </div>
            <button 
              onClick={() => setIsDrawerOpen(true)}
              className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-background hover:scale-105 transition-transform shadow-[0_0_15px_rgba(16,185,129,0.3)] shadow-primary/20 shrink-0"
            >
              <Plus className="w-5 h-5" />
            </button>
         </div>

         <div className="relative">
            <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-slate-500" />
            </div>
            <input
              type="text"
              className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 pl-10 pr-4 text-sm text-slate-200 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all placeholder:text-slate-500"
              placeholder="Rechercher une squad, un sujet..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
         </div>

         {/* Toast Notifications */}
         {actionStatus && (
           <div className={`mt-3 p-3 rounded-xl text-xs font-bold flex items-center gap-2 animate-in slide-in-from-top-2 ${actionStatus.type === 'success' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/20' : 'bg-red-500/20 text-red-400 border border-red-500/20'}`}>
             {actionStatus.type === 'success' ? <Trophy className="w-4 h-4" /> : <X className="w-4 h-4" />}
             {actionStatus.text}
           </div>
         )}
      </div>

      {/* Main Content Grid */}
      <div className="p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {isLoading ? (
          // Skeletal Loading
          Array(6).fill(0).map((_, i) => (
             <div key={i} className="bg-white/5 border border-white/5 rounded-2xl p-4 animate-pulse">
                <div className="flex gap-3 mb-4">
                   <div className="w-12 h-12 rounded-xl bg-white/10 shrink-0" />
                   <div className="space-y-2 flex-1 pt-1">
                     <div className="h-4 bg-white/10 rounded w-2/3" />
                     <div className="h-3 bg-white/10 rounded w-1/2" />
                   </div>
                </div>
                <div className="h-3 bg-white/10 rounded w-full mb-2" />
                <div className="h-3 bg-white/10 rounded w-5/6 mb-4" />
                <div className="flex justify-between items-center">
                  <div className="w-16 h-6 bg-white/10 rounded-full" />
                  <div className="w-24 h-8 bg-white/10 rounded-lg" />
                </div>
             </div>
          ))
        ) : filteredSquads.length > 0 ? (
          filteredSquads.map(squad => {
            const isMember = squad.membersList.includes(currentUser?.uid || "");
            const amICreator = squad.creatorId === currentUser?.uid;

            return (
              <div 
                key={squad.id} 
                onClick={() => isMember && navigate(`/student/squads/${squad.id}`)}
                className={`bg-gradient-to-br from-white/[0.04] to-transparent border border-white/10 rounded-2xl p-4 flex flex-col transition-all ${isMember ? 'cursor-pointer hover:bg-white/[0.08]' : ''}`}
              >
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="text-[15px] font-bold text-white mb-1 leading-tight line-clamp-1">{squad.name}</h3>
                    <div className="flex items-center gap-1.5 text-[11px] font-semibold text-primary/80 bg-primary/10 w-fit px-2 py-0.5 rounded-md">
                      <BookOpen className="w-3.5 h-3.5" />
                      <span className="line-clamp-1">{squad.courseTitle}</span>
                    </div>
                  </div>
                  <div className="px-2 py-1 bg-white/5 rounded-lg flex items-center justify-center border border-white/10 shrink-0">
                     <Users className="w-4 h-4 text-slate-400 mr-1.5" />
                     <span className="text-xs font-bold text-slate-300">{squad.membersCount}</span>
                  </div>
                </div>

                <p className="text-[13px] text-slate-400 leading-relaxed mb-5 line-clamp-2 flex-1">
                  {squad.description || "Aucune description fournie pour cette squad."}
                </p>

                <div className="flex justify-between items-center mt-auto">
                    {/* Avatars preview (mocked visuals based on count) */}
                    <div className="flex -space-x-2 overflow-hidden">
                       {Array.from({ length: Math.min(squad.membersCount, 3) }).map((_, i) => (
                           <div key={i} className="inline-block h-7 w-7 rounded-full ring-2 ring-background bg-slate-800 flex items-center justify-center text-[10px] text-slate-400 font-bold border border-white/20">
                             {String.fromCharCode(65 + (i * 2))}
                           </div>
                       ))}
                       {squad.membersCount > 3 && (
                           <div className="inline-block h-7 w-7 rounded-full ring-2 ring-background bg-white/5 flex items-center justify-center text-[10px] text-slate-400 font-bold border border-white/10 relative z-10 backdrop-blur-sm">
                             +{squad.membersCount - 3}
                           </div>
                       )}
                    </div>

                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        if (isMember) {
                          navigate(`/student/squads/${squad.id}`);
                        } else {
                          handleToggleJoin(squad);
                        }
                      }}
                      disabled={isSubmitting}
                      className={`text-xs font-bold px-4 py-2 rounded-xl flex items-center gap-1.5 transition-all active:scale-95 disabled:opacity-50 ${
                        isMember 
                         ? 'bg-primary/20 text-primary hover:bg-primary/30 border border-primary/20' 
                         : 'bg-primary text-background shadow-[0_4px_15px_rgba(16,185,129,0.3)] hover:scale-105'
                      }`}
                    >
                      {isSubmitting ? (
                         <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : isMember ? (
                         <><LogIn className="w-3.5 h-3.5" /> Ouvrir</>
                      ) : (
                         <><LogIn className="w-3.5 h-3.5" /> Rejoindre</>
                      )}
                    </button>
                </div>
              </div>
            );
          })
        ) : (
          <div className="col-span-full py-12 text-center">
            <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-4 border border-white/10">
               <Users className="w-8 h-8 text-slate-500" />
            </div>
            <h3 className="text-white font-bold mb-1">Aucune Squad trouvée</h3>
            <p className="text-xs text-slate-500 max-w-[250px] mx-auto">
              Soyez le premier à créer un groupe d'étude pour ce sujet !
            </p>
          </div>
        )}
      </div>

      {/* Creation Bottom Sheet / Drawer */}
      {isDrawerOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-background/80 backdrop-blur-sm animate-in fade-in duration-300">
           <div 
             className="bg-card w-full sm:w-[450px] rounded-t-3xl sm:rounded-3xl border border-white/10 shadow-2xl p-6 relative animate-in slide-in-from-bottom-8 sm:slide-in-from-bottom-2 duration-300"
             onClick={e => e.stopPropagation()}
           >
              <button 
                onClick={() => !isSubmitting && setIsDrawerOpen(false)}
                disabled={isSubmitting}
                className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-white/5 hover:bg-white/10 text-slate-400 transition-colors disabled:opacity-50"
              >
                 <X className="w-5 h-5" />
              </button>

              <div className="mb-6">
                <h2 className="text-xl font-black text-white">Nouvelle Squad</h2>
                <p className="text-xs text-slate-400 mt-1">Créez un espace de travail collaboratif.</p>
              </div>

              <form onSubmit={handleCreateSquad} className="space-y-4">
                 <div>
                    <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 ml-1">Nom du groupe</label>
                    <input 
                      type="text"
                      className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-sm text-white focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all"
                      placeholder="Ex: Les As du React..."
                      value={newSquadName}
                      onChange={e => setNewSquadName(e.target.value)}
                      required
                      disabled={isSubmitting}
                    />
                 </div>

                 <div>
                    <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 ml-1">Cours associé</label>
                    <select
                      className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-sm text-white focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all appearance-none"
                      value={selectedCourse}
                      onChange={e => setSelectedCourse(e.target.value)}
                      required
                      disabled={isSubmitting}
                    >
                      <option value="" disabled className="text-slate-500 bg-background">Sélectionner un cours thématique</option>
                      {courses.filter(c => c.status === "Published").map(course => (
                         <option key={course.id} value={course.id} className="bg-background text-white">
                           {course.title}
                         </option>
                      ))}
                    </select>
                 </div>

                 <div>
                    <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 ml-1">Description courte</label>
                    <textarea 
                      className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-sm text-white focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all resize-none h-24"
                      placeholder="Objectifs, rythme de travail, règles du groupe..."
                      value={newSquadDesc}
                      onChange={e => setNewSquadDesc(e.target.value)}
                      disabled={isSubmitting}
                    />
                 </div>

                 <button 
                    type="submit"
                    disabled={isSubmitting || !newSquadName.trim() || !selectedCourse}
                    className="w-full py-3.5 rounded-xl bg-gradient-to-br from-emerald-600 to-primary text-background font-black text-sm uppercase tracking-widest flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98] transition-transform shadow-[0_0_20px_rgba(16,185,129,0.3)] disabled:opacity-50 disabled:hover:scale-100 mt-2"
                 >
                    {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : "Créer la Squad"}
                 </button>
              </form>
           </div>
        </div>
      )}

    </div>
  );
}
