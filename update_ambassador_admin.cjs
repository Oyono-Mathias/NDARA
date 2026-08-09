const fs = require('fs');

// 1. Rename AdminAmbassadorProgram.tsx to AdminAmbassadorBadges.tsx
const oldBadgesPath = 'src/views/admin/AdminAmbassadorProgram.tsx';
const newBadgesPath = 'src/views/admin/AdminAmbassadorBadges.tsx';
if (fs.existsSync(oldBadgesPath)) {
    let badgesCode = fs.readFileSync(oldBadgesPath, 'utf8');
    badgesCode = badgesCode.replace(/export function AdminAmbassadorProgram/g, 'export function AdminAmbassadorBadges');
    fs.writeFileSync(newBadgesPath, badgesCode);
    fs.unlinkSync(oldBadgesPath);
}

// 2. Update AdminNavigation.tsx
let navCode = fs.readFileSync('src/components/AdminNavigation.tsx', 'utf8');
const oldAmbassadorNav = /\s*\{\s*title:\s*"AMBASSADEURS",\s*routes:\s*\[[\s\S]*?\]\s*\},/;

const newAmbassadorNav = `
  {
    title: "AMBASSADEURS",
    routes: [
      { label: "Dashboard", icon: LayoutDashboard, path: "/admin/ambassador/dashboard" },
      { label: "Paramètres", icon: Settings, path: "/admin/ambassador/settings" },
      { label: "Commissions", icon: Wallet, path: "/admin/ambassador/commissions" },
      { label: "Retraits", icon: ArrowDownRight, path: "/admin/ambassador/withdrawals" },
      { label: "Badges & Niveaux", icon: Award, path: "/admin/ambassador/badges" },
      { label: "Récompenses", icon: Gift, path: "/admin/ambassador/rewards" },
      { label: "Leaderboard", icon: Trophy, path: "/admin/ambassador/leaderboard" },
      { label: "Marketing", icon: Target, path: "/admin/ambassador/marketing" },
      { label: "Historique", icon: History, path: "/admin/ambassador/history" },
    ],
  },
`;

if (oldAmbassadorNav.test(navCode)) {
    navCode = navCode.replace(oldAmbassadorNav, newAmbassadorNav);
} else {
    // If not found, insert before FINANCES
    navCode = navCode.replace(/\{\s*title:\s*"FINANCES",/, newAmbassadorNav + '\n  {\n    title: "FINANCES",');
}

// Add missing icons
['Award', 'Gift', 'History'].forEach(icon => {
    if (!navCode.includes(icon + ',')) {
        navCode = navCode.replace(/from "lucide-react";/, `  ${icon},\n} from "lucide-react";`);
    }
});
fs.writeFileSync('src/components/AdminNavigation.tsx', navCode);

// 3. Update App.tsx
let appCode = fs.readFileSync('src/App.tsx', 'utf8');

// Imports
appCode = appCode.replace(/const AdminAmbassadorProgram = .*;/g, 
  `const AdminAmbassadorBadges = React.lazy(() => import('./views/admin/AdminAmbassadorBadges').then(m => ({ default: m.AdminAmbassadorBadges })));
const AdminAmbassadorDashboard = React.lazy(() => import('./views/admin/AdminAmbassadorDashboard').then(m => ({ default: m.AdminAmbassadorDashboard })));
const AdminAmbassadorSettings = React.lazy(() => import('./views/admin/AdminAmbassadorSettings').then(m => ({ default: m.AdminAmbassadorSettings })));
const AdminAmbassadorRewards = React.lazy(() => import('./views/admin/AdminAmbassadorRewards').then(m => ({ default: m.AdminAmbassadorRewards })));
const AdminAmbassadorLeaderboard = React.lazy(() => import('./views/admin/AdminAmbassadorLeaderboard').then(m => ({ default: m.AdminAmbassadorLeaderboard })));
const AdminAmbassadorHistory = React.lazy(() => import('./views/admin/AdminAmbassadorHistory').then(m => ({ default: m.AdminAmbassadorHistory })));`
);

// Routes
const newRoutes = `
          <Route path="ambassador/dashboard" element={<AdminAmbassadorDashboard />} />
          <Route path="ambassador/settings" element={<AdminAmbassadorSettings />} />
          <Route path="ambassador/commissions" element={<AdminCommissions />} />
          <Route path="ambassador/withdrawals" element={<AdminWithdrawals />} />
          <Route path="ambassador/badges" element={<AdminAmbassadorBadges />} />
          <Route path="ambassador/rewards" element={<AdminAmbassadorRewards />} />
          <Route path="ambassador/leaderboard" element={<AdminAmbassadorLeaderboard />} />
          <Route path="ambassador/marketing" element={<AdminMarketingAssets />} />
          <Route path="ambassador/history" element={<AdminAmbassadorHistory />} />
`;
appCode = appCode.replace(/<Route path="ambassador-program"[^>]+>/, newRoutes);
// also remove old ones if they are floating
appCode = appCode.replace(/<Route path="commissions"[^>]+>\n/g, '');
appCode = appCode.replace(/<Route path="withdrawals"[^>]+>\n/g, '');
appCode = appCode.replace(/<Route path="marketing-assets"[^>]+>\n/g, '');

fs.writeFileSync('src/App.tsx', appCode);

console.log("Updated navigation and routes");
