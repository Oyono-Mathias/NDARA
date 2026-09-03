import { Suspense, lazy } from 'react';
import { Routes, Route } from 'react-router-dom';
import { AuthGuard } from './guards/AuthGuard';
import { GuestGuard } from './guards/GuestGuard';
import { RoleGuard } from './guards/RoleGuard';

import { Loader2 } from 'lucide-react';

const safeLazy = (importFunc: () => Promise<any>, exportName: string) => {
  return lazy(() => 
    importFunc()
      .then(m => ({ default: m[exportName] || m.default || (() => <div>Composant manquant: {exportName}</div>) }))
      .catch(err => {
        console.warn(`Erreur de chargement pour ${exportName}:`, err);
        return { default: () => <div className="p-4 text-red-500">Composant introuvable ({exportName})</div> };
      })
  );
};

// Public
const Landing = safeLazy(() => import('./views/Landing'), 'Landing');
const AuthView = safeLazy(() => import('./views/auth/AuthView').then(m => ({ default: m.AuthView })), 'AuthView');
const RegisterView = safeLazy(() => import('./views/auth/RegisterView').then(m => ({ default: m.RegisterView })), 'RegisterView');
const ForgotPasswordView = safeLazy(() => import('./views/auth/ForgotPasswordView'), 'ForgotPasswordView');
const VerifyEmailView = safeLazy(() => import('./views/auth/VerifyEmailView'), 'VerifyEmailView');
const TwoFactorSetup = safeLazy(() => import('./views/auth/TwoFactorSetup'), 'TwoFactorSetup');
const TwoFactorVerify = safeLazy(() => import('./views/auth/TwoFactorVerify'), 'TwoFactorVerify');
const CatalogView = safeLazy(() => import('./views/catalog/CatalogView'), 'CatalogView');
const CourseDetailView = safeLazy(() => import('./views/catalog/CourseDetailView'), 'CourseDetailView');
const LeaderboardView = safeLazy(() => import('./views/LeaderboardView'), 'LeaderboardView');
const LegalView = safeLazy(() => import('./views/LegalView'), 'LegalView');
const InstructorPublicProfile = safeLazy(() => import('./views/InstructorPublicProfile'), 'InstructorPublicProfile');
const InviteRedirectView = safeLazy(() => import('./views/InviteRedirectView'), 'InviteRedirectView');

// User
const Account = safeLazy(() => import('./views/Account'), 'Account');
const Notifications = safeLazy(() => import('./views/Notifications'), 'Notifications');
const Messages = safeLazy(() => import('./views/Messages'), 'Messages');
const OfflineDownloads = safeLazy(() => import('./views/OfflineDownloads'), 'OfflineDownloads');
const ProfileRedirect = safeLazy(() => import('./views/ProfileRedirect'), 'ProfileRedirect');

// Layouts
const AdminLayout = safeLazy(() => import('./views/admin/AdminLayout'), 'AdminLayout');
const InstructorLayout = safeLazy(() => import('./views/instructor/InstructorLayout'), 'InstructorLayout');
const AmbassadorLayout = safeLazy(() => import('./views/ambassador/AmbassadorLayout'), 'AmbassadorLayout');

// Admin
const AdminMonitoring = safeLazy(() => import('./views/admin/AdminMonitoring'), 'AdminMonitoring');
const AdminMembers = safeLazy(() => import('./views/admin/AdminMembers'), 'AdminMembers');
const AdminModeration = safeLazy(() => import('./views/admin/AdminModeration'), 'AdminModeration');
const AdminCatalogView = safeLazy(() => import('./views/admin/catalogue/AdminCatalogView'), 'AdminCatalogView');
const AdminMarketControl = safeLazy(() => import('./views/admin/AdminMarketControl'), 'AdminMarketControl');
const AdminMarketing = safeLazy(() => import('./views/admin/AdminMarketing'), 'AdminMarketing');
const AdminSecurity = safeLazy(() => import('./views/admin/AdminSecurity'), 'AdminSecurity');
const AdminSupport = safeLazy(() => import('./views/admin/AdminSupport'), 'AdminSupport');
const AdminSquads = safeLazy(() => import('./views/admin/AdminSquads'), 'AdminSquads');
const AdminSettings = safeLazy(() => import('./views/admin/AdminSettings'), 'AdminSettings');
const AdminMemberProfileView = safeLazy(() => import('./views/admin/AdminMemberProfileView'), 'AdminMemberProfileView');
const AdminTransactions = safeLazy(() => import('./views/admin/AdminTransactions'), 'AdminTransactions');
const AdminWithdrawals = safeLazy(() => import('./views/admin/AdminWithdrawals'), 'AdminWithdrawals');
const AdminMarketingAssets = safeLazy(() => import('./views/admin/AdminMarketingAssets'), 'AdminMarketingAssets');
const CategoriesManager = safeLazy(() => import('./views/admin/catalogue/CategoriesManager'), 'CategoriesManager');
const CourseBuilder = safeLazy(() => import('./views/admin/catalogue/CourseBuilder'), 'CourseBuilder');
const CourseReviewView = safeLazy(() => import('./views/admin/catalogue/CourseReviewView'), 'CourseReviewView');
const CoursesManager = safeLazy(() => import('./views/admin/catalogue/CoursesManager'), 'CoursesManager');
const EbooksManager = safeLazy(() => import('./views/admin/catalogue/EbooksManager'), 'EbooksManager');

// Instructor
const InstructorDashboard = safeLazy(() => import('./views/instructor/InstructorDashboard'), 'InstructorDashboard');
const InstructorCourses = safeLazy(() => import('./views/instructor/InstructorCourses'), 'InstructorCourses');
const InstructorLiveSessions = safeLazy(() => import('./views/instructor/InstructorLiveSessions'), 'InstructorLiveSessions');
const InstructorQna = safeLazy(() => import('./views/instructor/InstructorQna'), 'InstructorQna');
const InstructorDevoirs = safeLazy(() => import('./views/instructor/InstructorDevoirs'), 'InstructorDevoirs');
const InstructorCertificates = safeLazy(() => import('./views/instructor/InstructorCertificates'), 'InstructorCertificates');
const InstructorSettings = safeLazy(() => import('./views/instructor/InstructorSettings'), 'InstructorSettings');
const InstructorCourseCreate = safeLazy(() => import('./views/instructor/InstructorCourseCreate'), 'InstructorCourseCreate');
const InstructorCourseEdit = safeLazy(() => import('./views/instructor/InstructorCourseEdit'), 'InstructorCourseEdit');
const InstructorCourseProgram = safeLazy(() => import('./views/instructor/InstructorCourseProgram'), 'InstructorCourseProgram');
const InstructorCourseMedias = safeLazy(() => import('./views/instructor/InstructorCourseMedias'), 'InstructorCourseMedias');
const InstructorCoursePreview = safeLazy(() => import('./views/instructor/InstructorCoursePreview'), 'InstructorCoursePreview');
const InstructorCourseFinalisation = safeLazy(() => import('./views/instructor/InstructorCourseFinalisation'), 'InstructorCourseFinalisation');
const InstructorAnnouncements = safeLazy(() => import('./views/instructor/InstructorAnnouncements'), 'InstructorAnnouncements');
const InstructorAvis = safeLazy(() => import('./views/instructor/InstructorAvis'), 'InstructorAvis');
const InstructorCoupons = safeLazy(() => import('./views/instructor/InstructorCoupons'), 'InstructorCoupons');
const InstructorProfile = safeLazy(() => import('./views/instructor/InstructorProfile'), 'InstructorProfile');
const InstructorQuiz = safeLazy(() => import('./views/instructor/InstructorQuiz'), 'InstructorQuiz');
const InstructorResources = safeLazy(() => import('./views/instructor/InstructorResources'), 'InstructorResources');

const MainLayout = safeLazy(() => import('./layouts/MainLayout').then(m => ({ default: m.MainLayout })), 'MainLayout');
// Ambassador
const AmbassadorDashboard = safeLazy(() => import('./views/ambassador/AmbassadorDashboard'), 'AmbassadorDashboard');
const AmbassadorMarketing = safeLazy(() => import('./views/ambassador/AmbassadorMarketing'), 'AmbassadorMarketing');
const AmbassadorLeaderboard = safeLazy(() => import('./views/ambassador/AmbassadorLeaderboard'), 'AmbassadorLeaderboard');
const AmbassadorKyc = safeLazy(() => import('./views/ambassador/AmbassadorKyc'), 'AmbassadorKyc');
const AmbassadorCommissions = safeLazy(() => import('./views/ambassador/AmbassadorCommissions'), 'AmbassadorCommissions');
const AmbassadorReferrals = safeLazy(() => import('./views/ambassador/AmbassadorReferrals'), 'AmbassadorReferrals');
const AmbassadorRewards = safeLazy(() => import('./views/ambassador/AmbassadorRewards'), 'AmbassadorRewards');
const AmbassadorWallet = safeLazy(() => import('./views/ambassador/AmbassadorWallet'), 'AmbassadorWallet');

const LoadingFallback = () => (
  <div className="flex items-center justify-center min-h-[50vh]">
    <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
  </div>
);

function App() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/instructor/profile/:id" element={<InstructorPublicProfile />} />
        <Route path="/invite" element={<InviteRedirectView />} />
        
        {/* Public & Student Global Layout */}
        <Route element={<MainLayout />}>
          <Route path="/catalog" element={<CatalogView />} />
          <Route path="/course/:id" element={<CourseDetailView />} />
          <Route path="/leaderboard" element={<LeaderboardView />} />
          <Route path="/legal" element={<LegalView />} />
          <Route path="/account" element={<AuthGuard><Account /></AuthGuard>} />
          <Route path="/notifications" element={<AuthGuard><Notifications /></AuthGuard>} />
          <Route path="/messages" element={<AuthGuard><Messages /></AuthGuard>} />
          <Route path="/offline-downloads" element={<AuthGuard><OfflineDownloads /></AuthGuard>} />
          <Route path="/wallet" element={<AuthGuard><div className="p-8 text-center"><h2 className="text-2xl font-bold">Wallet Ndara/OmPay (Bientôt disponible)</h2></div></AuthGuard>} />
        </Route>

        <Route path="/login" element={<GuestGuard><AuthView /></GuestGuard>} />
        <Route path="/register" element={<GuestGuard><RegisterView /></GuestGuard>} />
        <Route path="/forgot-password" element={<GuestGuard><ForgotPasswordView /></GuestGuard>} />
        <Route path="/verify-email" element={<VerifyEmailView />} />
        
        <Route path="/2fa-setup" element={<AuthGuard><TwoFactorSetup /></AuthGuard>} />
        <Route path="/2fa-verify" element={<AuthGuard><TwoFactorVerify /></AuthGuard>} />
        
        <Route path="/profile" element={<AuthGuard><ProfileRedirect /></AuthGuard>} />
        <Route path="/dashboard" element={<AuthGuard><ProfileRedirect /></AuthGuard>} />

        <Route path="/admin" element={<AuthGuard><RoleGuard allowedRoles={['admin']}><AdminLayout /></RoleGuard></AuthGuard>}>

          <Route index element={<AdminMonitoring />} />
          <Route path="members" element={<AdminMembers />} />
          <Route path="members/:id" element={<AdminMemberProfileView />} />
          <Route path="moderation" element={<AdminModeration />} />
          <Route path="catalog" element={<AdminCatalogView />} />
          <Route path="catalog/courses" element={<CoursesManager />} />
          <Route path="catalog/courses/build" element={<CourseBuilder />} />
          <Route path="catalog/courses/review" element={<CourseReviewView />} />
          <Route path="catalog/ebooks" element={<EbooksManager />} />
          <Route path="catalog/categories" element={<CategoriesManager />} />
          <Route path="market" element={<AdminMarketControl />} />
          <Route path="marketing" element={<AdminMarketing />} />
          <Route path="marketing-assets" element={<AdminMarketingAssets />} />
          <Route path="security" element={<AdminSecurity />} />
          <Route path="support" element={<AdminSupport />} />
          <Route path="squads" element={<AdminSquads />} />
          <Route path="settings" element={<AdminSettings />} />
          <Route path="transactions" element={<AdminTransactions />} />
          <Route path="withdrawals" element={<AdminWithdrawals />} />
        </Route>

        <Route path="/instructor" element={<AuthGuard><RoleGuard allowedRoles={['instructor', 'admin']}><InstructorLayout /></RoleGuard></AuthGuard>}>
          <Route index element={<InstructorDashboard />} />
          <Route path="courses" element={<InstructorCourses />} />
          <Route path="course-create" element={<InstructorCourseCreate />} />
          <Route path="course-edit/:id" element={<InstructorCourseEdit />} />
          <Route path="course-program/:id" element={<InstructorCourseProgram />} />
          <Route path="course-medias/:id" element={<InstructorCourseMedias />} />
          <Route path="course-preview/:id" element={<InstructorCoursePreview />} />
          <Route path="course-finalisation/:id" element={<InstructorCourseFinalisation />} />
          <Route path="live" element={<InstructorLiveSessions />} />
          <Route path="qna" element={<InstructorQna />} />
          <Route path="devoirs" element={<InstructorDevoirs />} />
          <Route path="certificates" element={<InstructorCertificates />} />
          <Route path="settings" element={<InstructorSettings />} />
          <Route path="profile" element={<InstructorProfile />} />
          <Route path="announcements" element={<InstructorAnnouncements />} />
          <Route path="avis" element={<InstructorAvis />} />
          <Route path="coupons" element={<InstructorCoupons />} />
          <Route path="quiz" element={<InstructorQuiz />} />
          <Route path="resources" element={<InstructorResources />} />
        </Route>

        <Route path="/ambassador" element={<AuthGuard><RoleGuard allowedRoles={['agent', 'admin']}><AmbassadorLayout /></RoleGuard></AuthGuard>}>
          <Route index element={<AmbassadorDashboard />} />
          <Route path="marketing" element={<AmbassadorMarketing />} />
          <Route path="leaderboard" element={<AmbassadorLeaderboard />} />
          <Route path="kyc" element={<AmbassadorKyc />} />
          <Route path="commissions" element={<AmbassadorCommissions />} />
          <Route path="referrals" element={<AmbassadorReferrals />} />
          <Route path="rewards" element={<AmbassadorRewards />} />
          <Route path="wallet" element={<AmbassadorWallet />} />
        </Route>

        <Route path="*" element={
          <div className="min-h-screen flex items-center justify-center flex-col p-4 text-center">
            <h1 className="text-4xl font-bold mb-4 text-slate-800">404</h1>
            <p className="text-gray-600 mb-6">Page introuvable ou vous n'avez pas les permissions requises.</p>
            <a href="/" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
              Retour à l'accueil
            </a>
          </div>
        } />
      </Routes>
    </Suspense>
  );
}

export default App;
