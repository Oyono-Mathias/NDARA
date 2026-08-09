const fs = require('fs');
let code = fs.readFileSync('src/components/AdminNavigation.tsx', 'utf8');

// The file seems to have multiple "title: 'AMBASSADEURS'" parts, let's just replace everything that matches
const newAmbassadorSection = `
  {
    title: "AMBASSADEURS",
    routes: [
      { label: "Vue générale", icon: LayoutDashboard, path: "/admin/ambassador/dashboard" },
      { label: "Tous les ambassadeurs", icon: Users, path: "/admin/ambassador/list" },
      { label: "Commissions", icon: Wallet, path: "/admin/ambassador/commissions" },
      { label: "Retraits", icon: ArrowDownRight, path: "/admin/ambassador/withdrawals" },
      { label: "Récompenses", icon: Gift, path: "/admin/ambassador/rewards" },
      { label: "Niveaux & Badges", icon: Award, path: "/admin/ambassador/badges" },
      { label: "Leaderboard", icon: Trophy, path: "/admin/ambassador/leaderboard" },
      { label: "Historique", icon: History, path: "/admin/ambassador/history" },
      { label: "Configuration", icon: Settings, path: "/admin/ambassador/settings" },
    ],
  },
`;

code = code.replace(/\{\s*title:\s*"AMBASSADEURS",\s*routes:\s*\[[\s\S]*?\]\s*\},/g, ''); // remove all previous 
code = code.replace(/\{\s*title:\s*"FINANCES",/, newAmbassadorSection + '\n  { title: "FINANCES",'); 

fs.writeFileSync('src/components/AdminNavigation.tsx', code);
