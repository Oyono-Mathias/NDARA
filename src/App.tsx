/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  BrowserRouter,
  Routes,
  Route,
  useNavigate,
  Link,
  Navigate,
} from "react-router-dom";
import { LandingPage } from "./views/public/LandingPage";
import { AuthView } from "./views/Auth";
import { Dashboard } from "./views/Dashboard";
import { SearchAndCatalog } from "./views/Search";
import { WalletView } from "./views/Wallet";
import { BourseView } from "./views/Bourse";
import { EbookDetail } from "./views/EbookDetail";
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
import { VerificationView } from "./views/VerificationView";
import { ReferralCaptureView } from "./views/ReferralCaptureView";
import { ProfileRedirect } from "./views/ProfileRedirect";
import { LegalView } from "./views/LegalView";
import { LeaderboardView } from "./views/LeaderboardView";
import { InviteRedirectView } from "./views/InviteRedirectView";
import { StudentSquads } from "./views/StudentSquads";
import { StudentSquadDetails } from "./views/StudentSquadDetails";
import { UniversalPlayground } from "./views/UniversalPlayground";
import { TemplateMarket } from "./views/TemplateMarket";
import { EbookMarket } from "./views/EbookMarket";
import OfflineDownloads from "./views/OfflineDownloads";

import { CourseDetail } from "./views/CourseDetail";

// Layouts
import { PublicLayout } from "./layouts/PublicLayout";
import { StudentLayout } from "./layouts/StudentLayout";
import { AdminLayout } from "./views/admin/AdminLayout";

// Admin Views
import { AdminDashboard } from "./views/admin/AdminDashboard";
import { AdminMembers } from "./views/admin/AdminMembers";
import { AdminSquads } from "./views/admin/AdminSquads";
import { AdminCourses } from "./views/admin/AdminCourses";
import { AdminTransactions } from "./views/admin/AdminTransactions";
import { AdminModeration } from "./views/admin/AdminModeration";
import { AdminInterface } from "./views/admin/AdminInterface";
import { AdminMarketing } from "./views/admin/AdminMarketing";
import { AdminMonitoring } from "./views/admin/AdminMonitoring";
import { AdminSecurity } from "./views/admin/AdminSecurity";
import { AdminSupport } from "./views/admin/AdminSupport";
import { AdminSettings } from "./views/admin/AdminSettings";
import { AdminAiConfig } from "./views/admin/AdminAiConfig";
import { AdminMarketControl } from "./views/admin/AdminMarketControl";
import { AdminInstructors } from "./views/admin/AdminInstructors";

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
        {/* === PUBLIC ROUTES === */}
        <Route element={<PublicLayout />}>
          <Route path="/" element={<LandingPage />} />
          <Route path="/auth" element={<AuthView />} />
          <Route path="/login" element={<Navigate to="/auth" replace />} />
          <Route
            path="/register"
            element={<Navigate to="/auth?tab=register" replace />}
          />
          <Route path="/legal" element={<LegalView />} />
          <Route path="/leaderboard" element={<LeaderboardView />} />
          <Route path="/invite/:slug" element={<ReferralCaptureView />} />
          <Route
            path="/invite-short/:username"
            element={<InviteRedirectView />}
          />
          <Route path="/verify/:certificateId" element={<VerificationView />} />
          <Route
            path="/instructor/p/:slug"
            element={<InstructorPublicProfile />}
          />
          {/* Les pages cours / e-books publiques peuvent aussi être ici si besoin */}
        </Route>

        <Route path="/profile" element={<ProfileRedirect />} />

        <Route path="/student/courses/:slug" element={<CoursePlayer />} />

        {/* === STUDENT ROUTES === */}
        <Route path="/student" element={<StudentLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="search" element={<SearchAndCatalog />} />
          <Route path="catalog/:slug" element={<CourseDetail />} />
          <Route path="courses" element={<CoursesView />} />
          <Route path="wallet" element={<WalletView />} />
          <Route path="bourse" element={<BourseView />} />
          <Route path="bourse/:id" element={<BourseLicenseDetail />} />
          <Route path="profile" element={<ProfileView />} />
          <Route path="downloads" element={<OfflineDownloads />} />
          <Route
            path="course-redirect/:slug"
            element={<StudentCourseRedirect />}
          />
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
          <Route path="ebooks" element={<EbookMarket />} />
          <Route path="ebooks/:id" element={<EbookDetail />} />
          <Route path="tools" element={<TemplateMarket />} />
          <Route path="squads" element={<StudentSquads />} />
          <Route path="squads/:squadId" element={<StudentSquadDetails />} />
          <Route path="sandbox" element={<UniversalPlayground />} />
          <Route
            path="*"
            element={<Navigate to="/student/dashboard" replace />}
          />
        </Route>

        {/* === INSTRUCTOR ROUTES === */}
        <Route path="/instructor/*" element={<InstructorLayout />} />

        {/* === ADMIN ROUTES === */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminDashboard />} />
          <Route path="analytics" element={<AdminMonitoring />} />
          <Route path="monitoring" element={<AdminMonitoring />} />
          <Route path="members" element={<AdminMembers />} />
          <Route path="instructors" element={<AdminInstructors />} />
          <Route path="squads" element={<AdminSquads />} />
          <Route path="markets" element={<AdminMarketControl />} />
          <Route path="marketcontrol" element={<AdminMarketControl />} />
          <Route path="catalog" element={<AdminCourses />} />
          <Route path="moderation" element={<AdminModeration />} />
          <Route path="push" element={<AdminMarketing />} />
          <Route path="marketing" element={<AdminMarketing />} />
          <Route path="countries" element={<AdminSettings />} />
          <Route path="treasury" element={<AdminTransactions />} />
          <Route path="transactions" element={<AdminTransactions />} />
          <Route path="growth" element={<AdminMarketing />} />
          <Route path="ai" element={<AdminAiConfig />} />
          <Route path="help" element={<AdminSupport />} />
          <Route path="messages" element={<AdminSupport />} />
          <Route path="faq" element={<AdminSupport />} />
          <Route path="vitrine" element={<AdminInterface />} />
          <Route path="carousel" element={<AdminInterface />} />
          <Route path="visuals" element={<AdminInterface />} />
          <Route path="seo" element={<AdminSettings />} />
          <Route path="settings" element={<AdminSettings />} />
          <Route path="roles" element={<AdminSecurity />} />
          <Route path="audit" element={<AdminSecurity />} />
          <Route path="*" element={<Navigate to="/admin" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
