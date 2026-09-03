const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

// I will just use string replacement to perfectly structure the MainLayout portion.
const fromRoutes = `<Routes>`;
const toRoutes = `
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

        <Route path="/login" element={<GuestGuard><LoginView /></GuestGuard>} />
        <Route path="/register" element={<GuestGuard><RegisterView /></GuestGuard>} />
        <Route path="/forgot-password" element={<GuestGuard><ForgotPasswordView /></GuestGuard>} />
        <Route path="/verify-email" element={<VerifyEmailView />} />
        
        <Route path="/2fa-setup" element={<AuthGuard><TwoFactorSetup /></AuthGuard>} />
        <Route path="/2fa-verify" element={<AuthGuard><TwoFactorVerify /></AuthGuard>} />
        
        <Route path="/profile" element={<AuthGuard><ProfileRedirect /></AuthGuard>} />
        <Route path="/dashboard" element={<AuthGuard><ProfileRedirect /></AuthGuard>} />

        <Route path="/admin" element={<AuthGuard><RoleGuard allowedRoles={['admin']}><AdminLayout /></RoleGuard></AuthGuard>}>
`;

// we need to slice it from <Routes> to <Route path="/admin"
const startIdx = code.indexOf('<Routes>');
const endIdx = code.indexOf('<Route path="/admin"');

if (startIdx !== -1 && endIdx !== -1) {
  code = code.substring(0, startIdx) + toRoutes + code.substring(endIdx + ('<Route path="/admin" element={<AuthGuard><RoleGuard allowedRoles={[\'admin\']}><AdminLayout /></RoleGuard></AuthGuard>}>'.length));
}

fs.writeFileSync('src/App.tsx', code);
