import { useState, useMemo, useEffect } from "react";
import { useRole } from "../../context/RoleContext";
import {
  collection,
  query,
  where,
  onSnapshot,
  doc,
  deleteDoc,
} from "firebase/firestore";
import {
  PlusCircle,
  Search,
  SlidersHorizontal,
  BookOpen,
  Trash2,
  Edit2,
  Play,
  Users,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { db } from "../../firebase";
import { formatImageUrl } from "../../lib/utils";
import { Skeleton } from "../../components/ui/Skeleton";
import { SwipeableItem } from "../../components/ui/SwipeableItem";
import { TouchArea } from "../../components/ui/TouchArea";
import { TopAppBar } from "../../components/ui/TopAppBar";
import { BottomSheet } from "../../components/ui/BottomSheet";

export function InstructorCourses() {
  const { currentUser } = useRole();
  const navigate = useNavigate();
  const [courses, setCourses] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    if (!currentUser?.uid) return;

    setIsLoading(true);
    const q = query(
      collection(db, "courses"),
      where("instructorId", "==", currentUser.uid),
    );

    const unsubscribe = onSnapshot(
      q,
      (snap) => {
        const courseData = snap.docs.map((doc) => ({
          id: doc.id,
          ...(doc.data() as any),
        }));
        const sortedCourses = courseData.sort((a, b) => {
          const dateA = (a.createdAt as any)?.toDate?.() || new Date(0);
          const dateB = (b.createdAt as any)?.toDate?.() || new Date(0);
          return dateB.getTime() - dateA.getTime();
        });
        setCourses(sortedCourses);
        setIsLoading(false);
      },
      (error) => {
        console.error("Error fetching instructor courses:", error);
        setIsLoading(false);
      },
    );

    return () => unsubscribe();
  }, [currentUser?.uid]);

  const filteredCourses = useMemo(() => {
    return courses.filter((c) => {
      const matchesSearch = c.title
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === "all" || c.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [courses, searchTerm, statusFilter]);

  const handleDeleteCourse = async (courseId: string) => {
    if (!courseId) {
      console.error("Erreur: L'ID de la formation est invalide.");
      return;
    }
    if (
      window.confirm(
        "Supprimer cette formation ? Cette action est irréversible.",
      )
    ) {
      try {
        await deleteDoc(doc(db, "courses", courseId));
        alert("Formation supprimée avec succès.");
      } catch (error: any) {
        console.error("Erreur lors de la suppression du cours:", error);
        alert(
          "Erreur lors de la suppression : " +
            (error.message || "Permissions insuffisantes."),
        );
      }
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#0f172a] relative overflow-hidden font-sans">
      <TopAppBar
        title="CATALOGUE"
        rightAction={
          <button onClick={() => navigate("/instructor/courses/create")} className="p-2 -mr-2 text-white hover:bg-white/10 rounded-full transition-colors active:scale-95">
             <PlusCircle className="w-5 h-5 text-gray-400" />
          </button>
        }
      />
      <div className="grain-overlay opacity-[0.03] pointer-events-none" />

      <main className="flex-1 overflow-y-auto pb-32 px-4 mt-6 animate-in fade-in duration-700">
        {/* Search Bar */}
        <div className="flex items-center gap-3 mb-8">
          <div className="relative group flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500 group-focus-within:text-primary transition-colors" />
            <input
              type="text"
              placeholder="Rechercher un cours..."
              className="w-full h-14 pl-12 pr-4 bg-[#1e293b] border border-white/5 rounded-[2rem] text-white placeholder:text-slate-600 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all shadow-xl"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <TouchArea
            as="button"
            onClick={() => setIsFilterOpen(true)}
            className="w-14 h-14 rounded-[2rem] bg-[#1e293b] border border-white/5 flex items-center justify-center text-slate-400 hover:text-white transition active:scale-90 shrink-0"
          >
            <SlidersHorizontal className="h-5 w-5" />
          </TouchArea>
        </div>

        {isLoading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex gap-4">
                <Skeleton className="h-20 w-20 rounded-2xl bg-slate-900 border border-white/5 shrink-0" />
                <div className="flex-1 space-y-2 py-2">
                  <Skeleton className="h-4 w-3/4 bg-slate-900 rounded" />
                  <Skeleton className="h-3 w-1/2 bg-slate-900 rounded" />
                </div>
              </div>
            ))}
          </div>
        ) : filteredCourses.length > 0 ? (
          <div className="flex flex-col">
            {filteredCourses.map((course) => (
              <CourseListItem
                key={course.id}
                course={course}
                onEdit={() => navigate(`/instructor/courses/edit/${course.id}`)}
                onDelete={() => handleDeleteCourse(course.id)}
                onPreview={() => navigate(`/student/courses/${course.id}`)}
              />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 px-8 text-center bg-[#1e293b]/50 rounded-[3rem] border-2 border-dashed border-white/5 animate-in zoom-in duration-500">
            <div className="p-8 bg-slate-800/50 rounded-full mb-6">
              <BookOpen className="h-16 w-16 text-slate-700" />
            </div>
            <h3 className="text-2xl font-black text-white uppercase tracking-tight">
              Catalogue vide
            </h3>
            <p className="text-slate-500 text-sm mt-3 leading-relaxed max-w-[220px] mx-auto font-medium italic">
              "Le savoir se partage." <br />
              Créez votre première formation pour inspirer la communauté.
            </p>
            <TouchArea
              as="button"
              onClick={() => navigate("/instructor/courses/create")}
              className="mt-8 flex items-center justify-center gap-2 bg-primary hover:bg-primary/90 text-slate-950 rounded-[2rem] h-14 px-8 font-black uppercase text-xs tracking-widest shadow-xl shadow-primary/20"
            >
              <PlusCircle className="h-5 w-5" />
              Créer mon cours
            </TouchArea>
          </div>
        )}
      </main>

      <BottomSheet
        isOpen={isFilterOpen}
        onClose={() => setIsFilterOpen(false)}
        title="Filtres"
      >
        <div className="space-y-6">
          <div className="space-y-3">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
              Statut
            </label>
            <div className="relative">
              <select
                className="w-full appearance-none h-14 px-4 bg-slate-950 border border-white/5 rounded-2xl text-white focus:outline-none focus:ring-1 focus:ring-primary/20 text-sm font-medium cursor-pointer"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="all">Tous les statuts</option>
                <option value="Published">Publié</option>
                <option value="Draft">Brouillon</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-500">
                <SlidersHorizontal size={16} />
              </div>
            </div>
          </div>

          <TouchArea
            as="button"
            onClick={() => setIsFilterOpen(false)}
            className="w-full h-14 rounded-2xl bg-primary text-black font-black uppercase tracking-widest text-sm flex items-center justify-center mt-4"
          >
            Appliquer
          </TouchArea>
        </div>
      </BottomSheet>
    </div>
  );
}

function CourseListItem({ course, onEdit, onDelete, onPreview }: any) {
  const isDraft = course.status === "Draft";

  return (
    <SwipeableItem
      onSwipeRight={onEdit}
      onSwipeLeft={onDelete}
      rightAction={
        <div className="flex flex-col items-center gap-1 text-primary">
          <Edit2 size={20} />
          <span className="text-[10px] uppercase font-bold tracking-widest">
            Éditer
          </span>
        </div>
      }
      leftAction={
        <div className="flex flex-col items-center gap-1 text-red-500">
          <Trash2 size={20} />
          <span className="text-[10px] uppercase font-bold tracking-widest">
            Sup
          </span>
        </div>
      }
    >
      <TouchArea
        as="div"
        onClick={onPreview}
        className="bg-[#1e293b] p-3 rounded-2xl border border-white/5 flex gap-4 w-full text-left"
      >
        <div className="w-20 h-20 rounded-xl overflow-hidden bg-slate-900 shrink-0 relative">
          <img
            src={
              course.thumbnail
                ? formatImageUrl(course.thumbnail)
                : `https://images.unsplash.com/photo-1516321497487-e288fb19713f?auto=format&fit=crop&q=80&w=400&h=300`
            }
            alt="Course"
            className="w-full h-full object-cover opacity-80"
          />
          <div className="absolute top-1 right-1">
            <span
              className={`px-1.5 py-0.5 text-[8px] font-black uppercase tracking-wider rounded backdrop-blur-md ${isDraft ? "bg-amber-500/80 text-white" : "bg-primary/80 text-slate-900"}`}
            >
              {course.status || "Draft"}
            </span>
          </div>
        </div>

        <div className="flex-1 flex flex-col justify-center min-w-0">
          <h3 className="font-black text-sm text-white line-clamp-2 leading-tight uppercase tracking-tight">
            {course.title}
          </h3>
          <div className="flex items-center gap-3 mt-2">
            <div className="flex items-center gap-1 text-[10px] text-slate-500 uppercase font-bold tracking-wider">
              <BookOpen className="w-3 h-3" />
              <span>{course.modules?.length || 0} Modules</span>
            </div>
          </div>
        </div>
      </TouchArea>
    </SwipeableItem>
  );
}
