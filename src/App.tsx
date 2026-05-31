/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Landing } from "./views/Landing";
import { AuthView } from "./views/Auth";
import { BrowserRouter, Routes, Route, useNavigate, Link, Navigate } from "react-router-dom";
import { Bell, Menu, Loader2 } from "lucide-react";
import { Navigation } from "./components/Navigation";
import { Sidebar } from "./components/Sidebar";
import { useRole } from "./context/RoleContext";
import { Dashboard } from "./views/Dashboard";
import { SearchAndCatalog } from "./views/Search";
import { WalletView } from "./views/Wallet";
import { BourseView } from "./views/Bourse";
import { EbookDetail } from "./views/EbookDetail";
import { ToolsView } from "./views/Tools";
import { BourseLicenseDetail } from "./views/BourseLicenseDetail";
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
import { InstructorPublicProfile } from "./views/InstructorPublicProfile";
import { StudentCourseRedirect } from "./views/StudentCourseRedirect";
import { RedirectAssignments } from "./views/RedirectAssignments";
import { WishlistView } from "./views/WishlistView";
import { RedirectMesDevoirs } from "./views/RedirectMesDevoirs";
import { RedirectMesFormations } from "./views/RedirectMesFormations";
import { AdminLayout } from "./views/admin/AdminLayout";
import { VerificationView } from "./views/VerificationView";
import { ReferralCaptureView } from "./views/ReferralCaptureView";
import { ProfileRedirect } from "./views/ProfileRedirect";
import { LegalView } from "./views/LegalView";
import { LeaderboardView } from "./views/LeaderboardView";
import { InviteRedirectView } from "./views/InviteRedirectView";
import { useState } from "react";

function StudentLayout() {
  const { isUserLoading } = useRole();

  if (isUserLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-black">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-black relative">
       {/* Background Gradients */}
       <div className="absolute top-0 right-0 w-80 h-80 bg-primary/10 rounded-full blur-[100px] -mr-40 -mt-40 pointer-events-none z-0"></div>
       <div className="absolute bottom-0 left-0 w-80 h-80 bg-blue-500/10 rounded-full blur-[100px] -ml-40 -mb-40 pointer-events-none z-0"></div>
       
       <header className="w-full z-40 glass safe-top">
          <div className="flex items-center justify-between px-6 py-4 max-w-md mx-auto">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-primary to-teal-600 flex items-center justify-center text-white font-black text-sm shadow-[0_0_15px_rgba(16,185,129,0.3)]">
                N
              </div>
              <span className="font-serif font-bold text-lg tracking-tight text-white drop-shadow-md">NDARA</span>
            </div>
            <div className="flex items-center gap-4">
              <Link to="/student/notifications" className="w-10 h-10 rounded-full glass-light flex items-center justify-center text-gray-400 hover:text-white transition card-hover relative">
                <Bell className="w-5 h-5" />
                <span className="absolute top-2 right-2.5 w-2 h-2 bg-red-500 rounded-full shadow-[0_0_8px_rgba(239,68,68,0.8)]"></span>
              </Link>
            </div>
          </div>
        </header>

       <main className="flex-1 w-full max-w-md mx-auto relative z-10 hide-scrollbar pb-24">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="search" element={<SearchAndCatalog />} />
            <Route path="courses" element={<CoursesView />} />
            <Route path="wallet" element={<WalletView />} />
            <Route path="bourse" element={<BourseView />} />
            <Route path="bourse/:id" element={<BourseLicenseDetail />} />
            <Route path="profile" element={<ProfileView />} />
            <Route path="course-redirect/:slug" element={<StudentCourseRedirect />} />
            <Route path="courses/:slug" element={<CoursePlayer />} />
            <Route path="cart" element={<CartView />} />
            <Route path="mathias" element={<MathiasTutor />} />
            <Route path="certificates" element={<CertificatesView />} />
            <Route path="assignments" element={<RedirectAssignments />} />
            <Route path="mes-devoirs" element={<RedirectMesDevoirs />} />
            <Route path="mes-formations" element={<RedirectMesFormations />} />
            <Route path="wishlist" element={<WishlistView />} />
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
            <Route path="ebooks/:id" element={<EbookDetail />} />
            <Route path="tools" element={<ToolsView />} />
          </Routes>
       </main>
       
       <div className="fixed bottom-0 w-full z-50">
          <Navigation />
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
        <Route path="/login" element={<Navigate to="/auth" replace />} />
        <Route path="/register" element={<Navigate to="/auth?tab=register" replace />} />
        <Route path="/profile" element={<ProfileRedirect />} />
        <Route path="/legal" element={<LegalView />} />
        <Route path="/leaderboard" element={<LeaderboardView />} />
        <Route path="/invite/:slug" element={<ReferralCaptureView />} />
        <Route path="/invite-short/:username" element={<InviteRedirectView />} />
        <Route path="/verify/:certificateId" element={<VerificationView />} />
        <Route path="/instructor/p/:slug" element={<InstructorPublicProfile />} />
        <Route path="/admin/*" element={<AdminLayout />} />
        <Route path="/instructor/*" element={<InstructorLayout />} />
        <Route path="/student/*" element={<StudentLayout />} />
      </Routes>
    </BrowserRouter>
  );
}
