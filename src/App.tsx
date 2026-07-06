import React, { Suspense } from 'react';
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useEffect } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  useNavigate,
  Link,
  Navigate,
} from "react-router-dom";

import { AuthLayout } from "./layouts/AuthLayout";
import { AuthGuard } from "./guards/AuthGuard";
import { GuestGuard } from "./guards/GuestGuard";
import { RoleGuard } from "./guards/RoleGuard";




import { OfflineIndicator } from "./components/ui/OfflineIndicator";

// Layouts
import { PublicLayout } from "./layouts/PublicLayout";
import { StudentLayout } from "./layouts/StudentLayout";
const CourseDetailView = React.lazy(() => import('./views/catalog/CourseDetailView').then(module => ({ default: module.CourseDetailView })));
const CatalogView = React.lazy(() => import('./views/catalog/CatalogView').then(module => ({ default: module.CatalogView })));
const LandingPage = React.lazy(() => import('./views/public/LandingPage').then(module => ({ default: module.LandingPage })));
const LoginView = React.lazy(() => import('./views/auth/LoginView').then(module => ({ default: module.LoginView })));
const RegisterView = React.lazy(() => import('./views/auth/RegisterView').then(module => ({ default: module.RegisterView })));
const ForgotPasswordView = React.lazy(() => import('./views/auth/ForgotPasswordView').then(module => ({ default: module.ForgotPasswordView })));
const VerifyEmailView = React.lazy(() => import('./views/auth/VerifyEmailView').then(module => ({ default: module.VerifyEmailView })));
const Dashboard = React.lazy(() => import('./views/Dashboard').then(module => ({ default: module.Dashboard })));
const SearchAndCatalog = React.lazy(() => import('./views/Search').then(module => ({ default: module.SearchAndCatalog })));
const WalletView = React.lazy(() => import('./views/Wallet').then(module => ({ default: module.WalletView })));
const BourseView = React.lazy(() => import('./views/Bourse').then(module => ({ default: module.BourseView })));
const EbookDetail = React.lazy(() => import('./views/EbookDetail').then(module => ({ default: module.EbookDetail })));
const BourseLicenseDetail = React.lazy(() => import('./views/BourseLicenseDetail').then(module => ({ default: module.BourseLicenseDetail })));
const ProfileHubView = React.lazy(() => import('./views/profile/ProfileHubView').then(module => ({ default: module.ProfileHubView })));
const EditProfileView = React.lazy(() => import('./views/profile/EditProfileView').then(module => ({ default: module.EditProfileView })));
const AccountSettingsView = React.lazy(() => import('./views/profile/AccountSettingsView').then(module => ({ default: module.AccountSettingsView })));
const CoursesView = React.lazy(() => import('./views/Courses').then(module => ({ default: module.CoursesView })));
const CoursePlayer = React.lazy(() => import('./views/CoursePlayer').then(module => ({ default: module.CoursePlayer })));
const MathiasTutor = React.lazy(() => import('./views/MathiasTutor').then(module => ({ default: module.MathiasTutor })));
const CartView = React.lazy(() => import('./views/Cart').then(module => ({ default: module.CartView })));
const CertificatesView = React.lazy(() => import('./views/Certificates').then(module => ({ default: module.CertificatesView })));
const AssignmentsView = React.lazy(() => import('./views/Assignments').then(module => ({ default: module.AssignmentsView })));
const AssignmentDetail = React.lazy(() => import('./views/AssignmentDetail').then(module => ({ default: module.AssignmentDetail })));
const QuizView = React.lazy(() => import('./views/Quiz').then(module => ({ default: module.QuizView })));
const ResultsView = React.lazy(() => import('./views/Results').then(module => ({ default: module.ResultsView })));
const PaymentsView = React.lazy(() => import('./views/Payments').then(module => ({ default: module.PaymentsView })));
const CheckoutView = React.lazy(() => import('./views/Checkout').then(module => ({ default: module.CheckoutView })));
const AmbassadorView = React.lazy(() => import('./views/Ambassador').then(module => ({ default: module.AmbassadorView })));
const DirectoryView = React.lazy(() => import('./views/Directory').then(module => ({ default: module.DirectoryView })));
const MessagesView = React.lazy(() => import('./views/Messages').then(module => ({ default: module.MessagesView })));
const AccountView = React.lazy(() => import('./views/Account').then(module => ({ default: module.AccountView })));
const SupportView = React.lazy(() => import('./views/Support').then(module => ({ default: module.SupportView })));
const NotificationsView = React.lazy(() => import('./views/Notifications').then(module => ({ default: module.NotificationsView })));
const InstructorLayout = React.lazy(() => import('./views/instructor/InstructorLayout').then(module => ({ default: module.InstructorLayout })));
const InstructorPublicProfile = React.lazy(() => import('./views/InstructorPublicProfile').then(module => ({ default: module.InstructorPublicProfile })));
const StudentCourseRedirect = React.lazy(() => import('./views/StudentCourseRedirect').then(module => ({ default: module.StudentCourseRedirect })));
const WishlistView = React.lazy(() => import('./views/WishlistView').then(module => ({ default: module.WishlistView })));
const VerificationView = React.lazy(() => import('./views/VerificationView').then(module => ({ default: module.VerificationView })));
const ReferralCaptureView = React.lazy(() => import('./views/ReferralCaptureView').then(module => ({ default: module.ReferralCaptureView })));
const ProfileRedirect = React.lazy(() => import('./views/ProfileRedirect').then(module => ({ default: module.ProfileRedirect })));
const LegalView = React.lazy(() => import('./views/LegalView').then(module => ({ default: module.LegalView })));
const LeaderboardView = React.lazy(() => import('./views/LeaderboardView').then(module => ({ default: module.LeaderboardView })));
const InviteRedirectView = React.lazy(() => import('./views/InviteRedirectView').then(module => ({ default: module.InviteRedirectView })));
const StudentSquads = React.lazy(() => import('./views/StudentSquads').then(module => ({ default: module.StudentSquads })));
const StudentSquadDetails = React.lazy(() => import('./views/StudentSquadDetails').then(module => ({ default: module.StudentSquadDetails })));
const UniversalPlayground = React.lazy(() => import('./views/UniversalPlayground').then(module => ({ default: module.UniversalPlayground })));
const TemplateMarket = React.lazy(() => import('./views/TemplateMarket').then(module => ({ default: module.TemplateMarket })));
const EbookMarket = React.lazy(() => import('./views/EbookMarket').then(module => ({ default: module.EbookMarket })));
const OfflineDownloads = React.lazy(() => import('./views/OfflineDownloads'));
const CourseDetail = React.lazy(() => import('./views/CourseDetail').then(module => ({ default: module.CourseDetail })));
const AdminLayout = React.lazy(() => import('./views/admin/AdminLayout').then(module => ({ default: module.AdminLayout })));
const AdminDashboard = React.lazy(() => import('./views/admin/AdminDashboard').then(module => ({ default: module.AdminDashboard })));
const AdminMembers = React.lazy(() => import('./views/admin/AdminMembers').then(module => ({ default: module.AdminMembers })));
const AdminSquads = React.lazy(() => import('./views/admin/AdminSquads').then(module => ({ default: module.AdminSquads })));
const AdminCatalogView = React.lazy(() => import('./views/admin/catalogue/AdminCatalogView').then(module => ({ default: module.AdminCatalogView })));
const AdminTransactions = React.lazy(() => import('./views/admin/AdminTransactions').then(module => ({ default: module.AdminTransactions })));
const AdminModeration = React.lazy(() => import('./views/admin/AdminModeration').then(module => ({ default: module.AdminModeration })));
const AdminInterface = React.lazy(() => import('./views/admin/AdminInterface').then(module => ({ default: module.AdminInterface })));
const AdminMarketing = React.lazy(() => import('./views/admin/AdminMarketing').then(module => ({ default: module.AdminMarketing })));
const AdminMonitoring = React.lazy(() => import('./views/admin/AdminMonitoring').then(module => ({ default: module.AdminMonitoring })));
const AdminSecurity = React.lazy(() => import('./views/admin/AdminSecurity').then(module => ({ default: module.AdminSecurity })));
const AdminSupport = React.lazy(() => import('./views/admin/AdminSupport').then(module => ({ default: module.AdminSupport })));
const AdminSettings = React.lazy(() => import('./views/admin/AdminSettings').then(module => ({ default: module.AdminSettings })));
const AdminAiConfig = React.lazy(() => import('./views/admin/AdminAiConfig').then(module => ({ default: module.AdminAiConfig })));
const AdminMarketControl = React.lazy(() => import('./views/admin/AdminMarketControl').then(module => ({ default: module.AdminMarketControl })));
const AdminInstructors = React.lazy(() => import('./views/admin/AdminInstructors').then(module => ({ default: module.AdminInstructors })));


// Admin Views

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
  useEffect(() => {
    const setVh = () => {
      let vh = window.innerHeight * 0.01;
      document.documentElement.style.setProperty('--vh', `${vh}px`);
    };
    setVh();
    window.addEventListener('resize', setVh);
    return () => window.removeEventListener('resize', setVh);
  }, []);

  return (
    <BrowserRouter>
      <OfflineIndicator />
      <Suspense fallback={<div className="h-screen flex items-center justify-center"><div className="animate-spin w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full"></div></div>}>
      <Routes>
        {/* === PUBLIC ROUTES === */}
        <Route element={<PublicLayout />}>
          <Route path="/" element={<LandingPage />} />
          
        {/* === AUTH ROUTES === */}
        <Route element={<GuestGuard><AuthLayout /></GuestGuard>}>
          <Route path="/auth/login" element={<LoginView />} />
          <Route path="/auth/register" element={<RegisterView />} />
          <Route path="/auth/forgot-password" element={<ForgotPasswordView />} />
        </Route>
        
        {/* Verify Email requires user to be logged in but not necessarily verified */}
        <Route element={<AuthLayout />}>
           <Route path="/auth/verify-email" element={<VerifyEmailView />} />
        </Route>
        
        <Route path="/auth" element={<Navigate to="/auth/login" replace />} />
        <Route path="/login" element={<Navigate to="/auth/login" replace />} />
        <Route path="/register" element={<Navigate to="/auth/register" replace />} />

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
        <Route path="/student" element={<AuthGuard><StudentLayout /></AuthGuard>}>
          <Route index element={<Dashboard />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="catalog" element={<CatalogView />} />
          <Route path="catalog/:slug" element={<CourseDetailView />} />
          <Route path="courses" element={<CoursesView />} />
          <Route path="wallet" element={<WalletView />} />
          <Route path="bourse" element={<BourseView />} />
          <Route path="bourse/:id" element={<BourseLicenseDetail />} />
          
          <Route path="profile" element={<ProfileHubView />} />
          <Route path="profile/edit" element={<EditProfileView />} />
          <Route path="profile/settings" element={<AccountSettingsView />} />

          <Route path="downloads" element={<OfflineDownloads />} />
          <Route
            path="course-redirect/:slug"
            element={<StudentCourseRedirect />}
          />
          <Route path="cart" element={<CartView />} />
          <Route path="mathias" element={<MathiasTutor />} />
          <Route path="certificates" element={<CertificatesView />} />
          <Route path="assignments" element={<AssignmentsView />} />
          <Route path="mes-devoirs" element={<AssignmentsView />} />
          <Route path="mes-formations" element={<CoursesView />} />
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
          <Route path="catalog/*" element={<AdminCatalogView />} />
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
      </Suspense>
    </BrowserRouter>
  );
}
