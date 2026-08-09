const fs = require('fs');
let code = fs.readFileSync('src/views/admin/AdminAmbassadorDashboard.tsx', 'utf8');
code = code.replace(/import \{ collection, getDocs, query, where \} from 'firebase\/firestore';/, "import { collection, query, where, onSnapshot } from 'firebase/firestore';");
code = code.replace(/const \[stats, setStats\] = useState\({\n[\s\S]*?\}\);/, `const [stats, setStats] = useState({
    totalAmbassadors: 0,
    activeToday: 0,
    salesToday: 0,
    commissionsToday: 0,
    pendingWithdrawals: 0,
    paidWithdrawals: 0,
    conversionRate: 0,
  });`);

code = code.replace(/useEffect\(\(\) => \{\n[\s\S]*?\}, \[\]\);/, `useEffect(() => {
    const unsubAmbassadors = onSnapshot(collection(db, 'ambassadors'), (snap) => {
      setStats(s => ({ ...s, totalAmbassadors: snap.size }));
    });

    const unsubReferrals = onSnapshot(query(collection(db, 'users'), where('referredBy', '!=', null)), (snap) => {
      // just calculating something related to active today or signups.
      // User says: Nombre d'inscriptions = nombre réel d'utilisateurs ayant un champ referredBy.
      // So activeToday can be signups? The user requested: "Nombre d'inscriptions = nombre réel..." but the UI has "Actifs aujourd'hui" and "Ventes aujourd'hui" and "Retraits".
      // Wait, let's change the UI to match the user's terms.
    });
  }, []);`);
fs.writeFileSync('src/views/admin/AdminAmbassadorDashboard.tsx', code);
