import { useState, useMemo, useEffect } from "react";
import { CourseForm } from "../../components/instructor/CourseForm";
import { ContentManager } from "../../components/instructor/course-content/ContentManager";
import { CourseBuyoutTab } from "../../components/instructor/CourseBuyoutTab";
import { db } from "../../firebase";
import {
  doc,
  getFirestore,
  getDoc,
  updateDoc,
  onSnapshot,
} from "firebase/firestore";
import {
  Loader2,
  ArrowLeft,
  Send,
  CheckCircle2,
  ShoppingCart,
  ShieldAlert,
} from "lucide-react";
import { useRole } from "../../context/RoleContext";
import { Link, useParams } from "react-router-dom";

export function InstructorCourseEdit() {
  const { id: courseId } = useParams<{ id: string }>();
  const { currentUser } = useRole();
  const [course, setCourse] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [activeTab, setActiveTab] = useState("content");

  useEffect(() => {
    if (!courseId) return;

    const unsubscribe = onSnapshot(
      doc(db, "courses", courseId),
      (snap) => {
        if (snap.exists()) {
          setCourse({ id: snap.id, ...snap.data() });
        } else {
          setError(true);
        }
        setIsLoading(false);
      },
      (err) => {
        console.error(err);
        setError(true);
        setIsLoading(false);
      },
    );

    return () => unsubscribe();
  }, [courseId]);

  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleUpdateCourse = async (data: any) => {
    if (!courseId) {
      console.error("Erreur: ID de cours manquant ou invalide.");
      return;
    }
    setIsSaving(true);
    setSaveSuccess(false);
    try {
      await updateDoc(doc(db, "courses", courseId), data);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (e: any) {
      console.error("Erreur détaillée lors de la mise à jour:", e);
      alert(
        "Erreur de sauvegarde: " + (e.message || "Permissions insuffisantes."),
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleSubmitForReview = async () => {
    if (!currentUser?.uid || !course?.id) {
      console.error("Erreur: Utilisateur non connecté ou ID cours manquant.");
      return;
    }
    setIsSubmittingReview(true);

    try {
      await updateDoc(doc(db, "courses", course.id), {
        status: "Pending Review",
      });
      setCourse({ ...course, status: "Pending Review" });
      alert(
        "C'est envoyé ! Votre cours est en cours d'examen par nos administrateurs.",
      );
    } catch (e: any) {
      console.error("Erreur lors de la soumission pour examen:", e);
      alert(
        "Erreur de soumission: " + (e.message || "Permissions insuffisantes."),
      );
    }

    setIsSubmittingReview(false);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !course) {
    return (
      <div className="text-center text-red-500 py-20 font-bold">
        Impossible de charger le cours.
      </div>
    );
  }

  const isAuthorized =
    course.instructorId === currentUser?.uid ||
    (course.isPlatformOwned && currentUser?.role === "admin");

  if (!isAuthorized) {
    return (
      <div className="max-w-2xl mx-auto py-20 px-4 text-center space-y-6">
        <div className="p-6 bg-red-500/10 rounded-full inline-block">
          <ShieldAlert className="h-16 w-16 text-red-500" />
        </div>
        <h1 className="text-3xl font-black text-white uppercase tracking-tight">
          Accès Révoqué
        </h1>
        <p className="text-slate-400 leading-relaxed">
          Cette formation a été acquise par <b>Ndara Afrique</b>. <br />
          Vous ne disposez plus des droits de modification ou de suppression sur
          ce contenu.
        </p>
        <Link
          to="/instructor/courses"
          className="inline-flex mt-8 h-14 rounded-2xl bg-primary hover:bg-primary/90 text-slate-950 font-black uppercase items-center text-xs tracking-widest px-10 transition-colors"
        >
          Retour à mon catalogue
        </Link>
      </div>
    );
  }

  const isDraft = course.status === "Draft";
  const isPending = course.status === "Pending Review";
  const isPublished = course.status === "Published";
  const isRequestedBuyout = course.buyoutStatus === "requested";
  const isApprovedBuyout = course.buyoutStatus === "approved";

  return (
    <div className="space-y-8 bg-slate-900/50 p-6 -m-6 rounded-2xl min-h-full">
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link
            to="/instructor/courses"
            className="flex items-center justify-center w-10 h-10 bg-[#1e293b] border border-white/10 rounded-xl text-white hover:bg-white/10 transition"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div>
            <h1 className="text-2xl font-black text-white line-clamp-1 uppercase tracking-tight">
              {course.title}
            </h1>
            <div className="flex items-center gap-2 mt-1">
              <span
                className={`text-[9px] font-black uppercase px-2 py-1 rounded-md border-none ${isPublished ? "bg-green-500/10 text-green-500" : isPending ? "bg-amber-500/10 text-amber-500" : "bg-slate-500/10 text-slate-400"}`}
              >
                {isPublished
                  ? "Publié"
                  : isPending
                    ? "En attente de validation"
                    : "Brouillon"}
              </span>
              {isRequestedBuyout && (
                <span className="px-2 py-1 bg-primary/10 text-primary text-[9px] border-none font-black uppercase rounded-md">
                  Rachat demandé
                </span>
              )}
              {isApprovedBuyout && (
                <span className="px-2 py-1 bg-emerald-500/10 text-emerald-500 text-[9px] border-none font-black uppercase rounded-md">
                  Acquis par Ndara
                </span>
              )}
            </div>
          </div>
        </div>

        {isDraft && !isRequestedBuyout && (
          <button
            onClick={handleSubmitForReview}
            disabled={isSubmittingReview || isSaving}
            className="flex items-center justify-center h-12 px-8 rounded-xl bg-primary hover:bg-primary/90 text-slate-950 font-black uppercase text-xs tracking-widest shadow-xl shadow-primary/20 transition-all active:scale-95 disabled:opacity-50"
          >
            {isSubmittingReview || isSaving ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <Send className="h-4 w-4 mr-2" />
            )}
            {isSaving ? "Sauvegarde..." : "Soumettre pour validation"}
          </button>
        )}

        {isPublished && (
          <div className="flex items-center gap-2 text-green-500 bg-green-500/5 px-4 py-2 rounded-xl border border-green-500/20">
            <CheckCircle2 className="h-5 w-5" />
            <span className="text-xs font-bold uppercase tracking-widest">
              En ligne
            </span>
          </div>
        )}

        {saveSuccess && (
          <div className="flex items-center gap-2 text-emerald-500 bg-emerald-500/5 px-4 py-2 rounded-xl border border-emerald-500/20">
            <CheckCircle2 className="h-5 w-5" />
            <span className="text-xs font-bold uppercase tracking-widest">
              Enregistré
            </span>
          </div>
        )}
      </header>

      <div className="w-full">
        <div
          className={`grid w-full bg-[#1e293b] p-1 rounded-xl h-auto gap-1 mb-6 ${!course.isPlatformOwned ? "grid-cols-3" : "grid-cols-2"}`}
        >
          <button
            onClick={() => setActiveTab("content")}
            className={`py-2.5 rounded-lg active:scale-95 transition-all font-bold uppercase text-[10px] tracking-widest ${activeTab === "content" ? "bg-primary text-slate-950 shadow-md" : "text-slate-400 hover:text-white hover:bg-white/5"}`}
          >
            Contenu
          </button>
          <button
            onClick={() => setActiveTab("details")}
            className={`py-2.5 rounded-lg active:scale-95 transition-all font-bold uppercase text-[10px] tracking-widest ${activeTab === "details" ? "bg-primary text-slate-950 shadow-md" : "text-slate-400 hover:text-white hover:bg-white/5"}`}
          >
            Détails
          </button>
          {!course.isPlatformOwned && (
            <button
              onClick={() => setActiveTab("buyout")}
              className={`flex items-center justify-center py-2.5 rounded-lg active:scale-95 transition-all font-bold uppercase text-[10px] tracking-widest ${activeTab === "buyout" ? "bg-primary text-slate-950 shadow-md" : "text-primary hover:bg-white/5"}`}
            >
              <ShoppingCart className="h-3 w-3 mr-2" /> Vendre à Ndara
            </button>
          )}
        </div>

        {activeTab === "content" && (
          <div className="mt-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
            <ContentManager courseId={courseId} />
          </div>
        )}

        {activeTab === "details" && (
          <div className="mt-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
            <CourseForm
              mode="edit"
              initialData={course}
              onSubmit={handleUpdateCourse}
              isSubmitting={isSaving}
            />
          </div>
        )}

        {!course.isPlatformOwned && activeTab === "buyout" && (
          <div className="mt-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
            <CourseBuyoutTab course={course} />
          </div>
        )}
      </div>
    </div>
  );
}
