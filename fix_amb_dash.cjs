const fs = require('fs');
let code = fs.readFileSync('src/views/ambassador/AmbassadorDashboard.tsx', 'utf8');

code = code.replace(/import \{ doc, getDoc, collection, query, where, getDocs, orderBy, limit \} from 'firebase\/firestore';/, "import { doc, getDoc, collection, query, where, getDocs, orderBy, limit, onSnapshot } from 'firebase/firestore';");

const newUseEffect = `
  useEffect(() => {
    if (!firebaseUser) return;
    setLoading(true);

    const unsubAmbassador = onSnapshot(doc(db, 'ambassadors', firebaseUser.uid), (docSnap) => {
      if (docSnap.exists()) setAmbassadorData(docSnap.data());
    });

    const unsubStats = onSnapshot(doc(db, 'affiliate_statistics', firebaseUser.uid), (statSnap) => {
      setStats(statSnap.exists() ? statSnap.data() : {
        level: 'bronze', totalSalesCount: 0, totalSalesVolume: 0, totalReferrals: 0, badges: [], challenges: []
      });
    });

    const unsubLeaderboard = onSnapshot(query(collection(db, 'ambassadors'), orderBy('totalSales', 'desc')), (snap) => {
      const rankIndex = snap.docs.findIndex(d => d.id === firebaseUser.uid);
      setRank(rankIndex !== -1 ? rankIndex + 1 : null);
    });

    const unsubRewards = onSnapshot(query(collection(db, 'affiliate_rewards'), where('userId', '==', firebaseUser.uid), orderBy('date', 'desc'), limit(5)), (snap) => {
      setRecentRewards(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });

    const unsubTx = onSnapshot(query(collection(db, 'affiliate_transactions'), where('ambassadorUid', '==', firebaseUser.uid), orderBy('createdAt', 'asc')), (snap) => {
      const txs = snap.docs.map(d => d.data());
      
      const grouped = txs.reduce((acc: any, tx: any) => {
          if (!tx.createdAt) return acc;
          const d = tx.createdAt.toDate ? tx.createdAt.toDate() : new Date(tx.createdAt);
          const dateStr = format(d, 'dd MMM', { locale: fr });
          if (!acc[dateStr]) acc[dateStr] = 0;
          acc[dateStr] += (tx.commission || 0);
          return acc;
      }, {});

      const chart = Object.keys(grouped).map(date => ({
          date,
          gains: grouped[date]
      }));
      setChartData(chart);
      setLoading(false);
    });

    return () => {
      unsubAmbassador();
      unsubStats();
      unsubLeaderboard();
      unsubRewards();
      unsubTx();
    };
  }, [firebaseUser]);
`;

code = code.replace(/useEffect\(\(\) => \{\n\s*const fetchAmbassadorData = async \(\) => \{[\s\S]*?fetchAmbassadorData\(\);\n\s*\}, \[firebaseUser\]\);/, newUseEffect);

fs.writeFileSync('src/views/ambassador/AmbassadorDashboard.tsx', code);
