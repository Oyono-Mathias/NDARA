import {
  Routes,
  Route,
  useNavigate,
  Navigate,
  useLocation,
  useOutlet,
} from "react-router-dom";
import { useRole } from "../../context/RoleContext";
import { InstructorNavigation } from "../../components/InstructorNavigation";
import { Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import { Sidebar } from "../../components/Sidebar";
import { AnimatePresence, motion } from "motion/react";

import { InstructorDashboard } from "./InstructorDashboard";
import { InstructorCourses } from "./InstructorCourses";
import { InstructorCourseCreate } from "./InstructorCourseCreate";
import { InstructorCourseEdit } from "./InstructorCourseEdit";
import { InstructorDevoirs } from "./InstructorDevoirs";
import { InstructorWealth } from "./InstructorWealth";
import { InstructorAnnouncements } from "./InstructorAnnouncements";
import { InstructorAvis } from "./InstructorAvis";
import { MessagesView } from "../Messages";
import { InstructorCoupons } from "./InstructorCoupons";
import { InstructorCertificates } from "./InstructorCertificates";

import { InstructorQna } from "./InstructorQna";
import { InstructorQuiz } from "./InstructorQuiz";
import { InstructorResources } from "./InstructorResources";
import { InstructorProfile } from "./InstructorProfile";

import { InstructorSettings } from "./InstructorSettings";
import { InstructorStudents } from "./InstructorStudents";

export function InstructorLayout() {
  const { loading, currentUser } = useRole();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-black">
        <Loader2 className="h-8 w-8 animate-spin text-[#10B981]" />
      </div>
    );
  }

  if (!currentUser) return <Navigate to="/auth" replace />;
  if (currentUser?.role !== "expert" && currentUser?.role !== "instructor")
    return <Navigate to="/student/dashboard" replace />;

  const isFullScreenView = [
    "/messages",
    "/courses/create",
    "/courses/edit",
    "/quiz/", // Notice trailing slash so list page isn't fullscreen
    "/devoirs/", // Notice trailing slash
    "/settings",
    "/profile"
  ].some(path => location.pathname.includes(path));

  useEffect(() => {
    const metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (metaThemeColor) {
      if (isFullScreenView) {
        metaThemeColor.setAttribute("content", "#020617"); // slate-950 for full screen views
      } else {
        metaThemeColor.setAttribute("content", "#000000"); // black for main views
      }
    }
  }, [isFullScreenView]);

  return (
    <div className="flex flex-col relative selection:bg-[#10B981] selection:text-black antialiased h-[100dvh] overflow-hidden bg-black">
      {/* Background Gradients */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-secondary/10 rounded-full blur-[100px] -mr-40 -mt-40 pointer-events-none z-0"></div>
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-primary/10 rounded-full blur-[100px] -ml-40 -mb-40 pointer-events-none z-0"></div>

      <div className="flex-1 w-full max-w-7xl mx-auto flex overflow-hidden">
        {/* Desktop Sidebar */}
        <Sidebar
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
        />

        <main
          id="main-scroll-container"
          className="flex-1 w-full max-w-md md:max-w-none mx-auto relative z-10 hide-scrollbar flex flex-col overflow-hidden"
        >
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={location.pathname}
              initial={{ x: "100%", opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: "100%", opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className={`flex-1 flex flex-col h-full w-full overflow-y-auto hide-scrollbar ${isFullScreenView ? "pb-0 pt-0 px-0" : "px-4 pb-32 md:pb-8 pt-4 md:pt-8"}`}
            >
              <Routes location={location}>
                <Route path="/" element={<InstructorDashboard />} />
                <Route path="dashboard" element={<InstructorDashboard />} />
                <Route path="courses" element={<InstructorCourses />} />
                <Route
                  path="courses/create"
                  element={<InstructorCourseCreate />}
                />
                <Route
                  path="courses/edit/:id"
                  element={<InstructorCourseEdit />}
                />
                <Route path="quiz" element={<InstructorQuiz />} />
                <Route
                  path="quiz/:id"
                  element={
                    <GenericPlaceholder
                      title="Éditeur de Quiz"
                      subtitle="Création de questions et aide IA"
                    />
                  }
                />
                <Route path="qna" element={<InstructorQna />} />
                <Route path="resources" element={<InstructorResources />} />
                <Route path="devoirs" element={<InstructorDevoirs />} />
                <Route
                  path="devoirs/:id"
                  element={
                    <GenericPlaceholder
                      title="Correcteur Mathias IA"
                      subtitle="Aide à la notation et feedback"
                    />
                  }
                />
                <Route path="students" element={<InstructorStudents />} />
                <Route path="messages" element={<MessagesView />} />
                <Route path="revenus" element={<InstructorWealth />} />
                <Route
                  path="ambassador"
                  element={
                    <GenericPlaceholder
                      title="Ambassadeur Elite"
                      subtitle="Programme de partenariat Premium"
                    />
                  }
                />
                <Route path="annonces" element={<InstructorAnnouncements />} />
                <Route path="coupons" element={<InstructorCoupons />} />
                <Route path="avis" element={<InstructorAvis />} />
                <Route
                  path="certificats"
                  element={<InstructorCertificates />}
                />
                <Route path="settings" element={<InstructorSettings />} />
                <Route path="profile" element={<InstructorProfile />} />
              </Routes>
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      {!isFullScreenView && (
        <div className="fixed bottom-0 w-full z-50 md:hidden">
          <InstructorNavigation onMenuClick={() => setIsSidebarOpen(true)} />
        </div>
      )}
    </div>
  );
}

function GenericPlaceholder({
  title,
  subtitle,
}: {
  title: string;
  subtitle?: string;
}) {
  const navigate = useNavigate();
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-6 animate-in fade-in duration-500 p-4">
      <div className="w-24 h-24 rounded-full bg-slate-900 border border-secondary/30 flex items-center justify-center shadow-[0_0_30px_rgba(204,119,34,0.15)] relative">
        <div className="absolute inset-0 rounded-full border-t-2 border-r-2 border-secondary animate-spin"></div>
        <div className="w-12 h-12 rounded-full bg-secondary/10 flex items-center justify-center">
          <span className="text-secondary font-serif font-black text-xl">
            N
          </span>
        </div>
      </div>
      <div className="text-center space-y-2">
        <h2 className="font-serif text-3xl font-bold text-white">{title}</h2>
        {subtitle && (
          <p className="text-primary text-sm font-bold uppercase tracking-wider">
            {subtitle}
          </p>
        )}
      </div>
      <p className="text-slate-400 text-sm text-center max-w-md leading-relaxed">
        L'infrastructure souveraine de Ndara Afrique prépare cette interface
        expert. La synchronisation des noeuds blockchain est en cours.
      </p>
      <button
        onClick={() => navigate(-1)}
        className="px-8 py-4 rounded-2xl bg-secondary text-background font-bold text-sm hover:bg-amber-600 transition-colors shadow-[0_0_20px_rgba(204,119,34,0.4)]"
      >
        Retour au Command Center
      </button>
    </div>
  );
}
