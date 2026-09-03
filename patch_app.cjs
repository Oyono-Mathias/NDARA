const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const importLayout = `const MainLayout = safeLazy(() => import('./layouts/MainLayout').then(m => ({ default: m.MainLayout })), 'MainLayout');`;

code = code.replace('// Ambassador', importLayout + '\n// Ambassador');

// Update routing to wrap public/student views in MainLayout
code = code.replace(
  '<Route path="/catalog" element={<CatalogView />} />',
  `
        <Route element={<MainLayout />}>
          <Route path="/catalog" element={<CatalogView />} />
          <Route path="/course/:id" element={<CourseDetailView />} />
          <Route path="/leaderboard" element={<LeaderboardView />} />
          <Route path="/legal" element={<LegalView />} />
          <Route path="/account" element={<AuthGuard><Account /></AuthGuard>} />
          <Route path="/notifications" element={<AuthGuard><Notifications /></AuthGuard>} />
          <Route path="/messages" element={<AuthGuard><Messages /></AuthGuard>} />
          <Route path="/offline-downloads" element={<AuthGuard><OfflineDownloads /></AuthGuard>} />
          <Route path="/wallet" element={<AuthGuard><div className="p-8 text-center"><h2 className="text-2xl font-bold">Wallet Ndara/OmPay (Bientôt disponible pour les étudiants)</h2></div></AuthGuard>} />
        </Route>
`
);

// Remove the standalone routes that are now in MainLayout
code = code.replace('<Route path="/leaderboard" element={<LeaderboardView />} />', '');
code = code.replace('<Route path="/legal" element={<LegalView />} />', '');
code = code.replace('<Route path="/course/:id" element={<CourseDetailView />} />', '');
code = code.replace('<Route path="/account" element={<AuthGuard><Account /></AuthGuard>} />', '');
code = code.replace('<Route path="/notifications" element={<AuthGuard><Notifications /></AuthGuard>} />', '');
code = code.replace('<Route path="/messages" element={<AuthGuard><Messages /></AuthGuard>} />', '');
code = code.replace('<Route path="/offline-downloads" element={<AuthGuard><OfflineDownloads /></AuthGuard>} />', '');

fs.writeFileSync('src/App.tsx', code);
