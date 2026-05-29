/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Landing } from "./views/Landing";
import { AuthView } from "./views/Auth";
import { BrowserRouter, Routes, Route, useNavigate, Link } from "react-router-dom";
import { Bell, Menu } from "lucide-react";
import { Navigation } from "./components/Navigation";
import { Sidebar } from "./components/Sidebar";
import { Dashboard } from "./views/Dashboard";
import { SearchAndCatalog } from "./views/Search";
import { WalletView } from "./views/Wallet";
import { BourseView } from "./views/Bourse";
import { ProfileView } from "./views/Profile";
import { CoursesView } from "./views/Courses";
import { CoursePlayer } from "./views/CoursePlayer";
import { MathiasTutor } from "./views/MathiasTutor";
import { CartView } from "./views/Cart";
import { CertificatesView } from "./views/Certificates";
import { AssignmentsView } from "./views/Assignments";
import { AssignmentDetail } from "./views/AssignmentDetail";
import { QuizView } from "./views/Quiz";
import { ResultsView } from "./views/Results";
import { PaymentsView } from "./views/Payments";
import { EbooksView } from "./views/Ebooks";
import { CheckoutView } from "./views/Checkout";
import { AmbassadorView } from "./views/Ambassador";
import { DirectoryView } from "./views/Directory";
import { MessagesView } from "./views/Messages";
import { AccountView } from "./views/Account";
import { SupportView } from "./views/Support";
import { NotificationsView } from "./views/Notifications";
import { InstructorLayout } from "./views/instructor/InstructorLayout";
import { StudentCourseRedirect } from "./views/StudentCourseRedirect";
import { RedirectAssignments } from "./views/RedirectAssignments";
import { RedirectWishlist } from "./views/RedirectWishlist";
import { RedirectMesDevoirs } from "./views/RedirectMesDevoirs";
import { RedirectMesFormations } from "./views/RedirectMesFormations";
import { AdminLayout } from "./views/admin/AdminLayout";
import { useState } from "react";

function StudentLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="antialiased min-h-screen flex justify-center bg-black">
      {/* Mobile Container (Simulating Phone Screen on Desktop) */}
      <div className="w-full max-w-md bg-background min-h-screen relative flex flex-col shadow-[0_0_50px_rgba(0,0,0,0.5)] overflow-hidden">
        
        {/* Background Gradients */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-primary/10 rounded-full blur-[100px] -mr-40 -mt-40 pointer-events-none z-0"></div>
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-blue-500/10 rounded-full blur-[100px] -ml-40 -mb-40 pointer-events-none z-0"></div>

        {/* Header */}
        <header className="fixed top-0 w-full max-w-md z-40 glass safe-top">
          <div className="flex items-center justify-between px-6 py-4">
            {/* Logo */}
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-primary to-teal-600 flex items-center justify-center text-white font-black text-sm shadow-[0_0_15px_rgba(16,185,129,0.3)]">
                N
              </div>
              <span className="font-serif font-bold text-lg tracking-tight text-white drop-shadow-md">NDARA</span>
            </div>

            {/* Right Actions */}
            <div className="flex items-center gap-4">
              <Link to="/student/notifications" className="w-10 h-10 rounded-full glass-light flex items-center justify-center text-gray-400 hover:text-white transition card-hover relative">
                <Bell className="w-5 h-5" />
                <span className="absolute top-2 right-2.5 w-2 h-2 bg-red-500 rounded-full shadow-[0_0_8px_rgba(239,68,68,0.8)]"></span>
              </Link>
              <button 
                onClick={() => setIsSidebarOpen(true)}
                className="w-10 h-10 rounded-full glass-light flex items-center justify-center text-white ring-2 ring-primary/50 shadow-[0_0_10px_rgba(16,185,129,0.2)] focus:outline-none hover:bg-white/10 transition"
              >
                <Menu className="w-5 h-5" />
              </button>
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 pt-32 pb-28 px-6 overflow-y-auto hide-scrollbar z-10 relative">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="search" element={<SearchAndCatalog />} />
            <Route path="courses" element={<CoursesView />} />
            <Route path="wallet" element={<WalletView />} />
            <Route path="bourse" element={<BourseView />} />
            <Route path="profile" element={<ProfileView />} />
            <Route path="course-redirect/:slug" element={<StudentCourseRedirect />} />
            <Route path="courses/:slug" element={<CoursePlayer />} />
            <Route path="cart" element={<CartView />} />
            <Route path="mathias" element={<MathiasTutor />} />
            <Route path="certificates" element={<CertificatesView />} />
            <Route path="assignments" element={<RedirectAssignments />} />
            <Route path="mes-devoirs" element={<RedirectMesDevoirs />} />
            <Route path="mes-formations" element={<RedirectMesFormations />} />
            <Route path="wishlist" element={<RedirectWishlist />} />
            <Route path="devoirs" element={<AssignmentsView />} />
            <Route path="devoirs/:id" element={<AssignmentDetail />} />
            <Route path="quiz/:id" element={<QuizView />} />
            <Route path="results" element={<ResultsView />} />
            <Route path="payments" element={<PaymentsView />} />
            <Route path="checkout/:slug" element={<CheckoutView />} />
            <Route path="ambassador" element={<AmbassadorView />} />
            <Route path="directory" element={<DirectoryView />} />
            <Route path="messages" element={<MessagesView />} />
            <Route path="account" element={<AccountView />} />
            <Route path="support" element={<SupportView />} />
            <Route path="notifications" element={<NotificationsView />} />
            <Route path="ebooks" element={<EbooksView />} />
          </Routes>
        </main>

        <Navigation />
        <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      </div>
    </div>
  );
}

function GenericPlaceholder({ title }: { title: string }) {
  const navigate = useNavigate();
  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-6 animate-in fade-in duration-500">
      <div className="w-20 h-20 rounded-full glass flex items-center justify-center glow-green">
        <div className="w-10 h-10 border-t-2 border-r-2 border-primary rounded-full animate-spin"></div>
      </div>
      <h2 className="font-serif text-2xl text-white text-center">{title}</h2>
      <p className="text-gray-400 text-sm text-center max-w-[250px]">
        Ce module est en cours d'initialisation dans l'infrastructure de Ndara.
      </p>
      <button 
        onClick={() => navigate(-1)}
        className="px-6 py-3 rounded-2xl glass-light text-white font-bold text-sm hover:bg-white/10 transition-colors"
      >
        Retour
      </button>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/auth" element={<AuthView />} />
        <Route path="/admin/*" element={<AdminLayout />} />
        <Route path="/instructor/*" element={<InstructorLayout />} />
        <Route path="/student/*" element={<StudentLayout />} />
      </Routes>
    </BrowserRouter>
  );
}
