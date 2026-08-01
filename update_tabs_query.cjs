const fs = require('fs');
let content = fs.readFileSync('src/views/admin/AdminMemberProfileView.tsx', 'utf-8');

const targetStr = `    } else if (activeTab === 'wallet') {
      q = query(collection(db, 'transactions'), where('userId', '==', member.id), orderBy('createdAt', 'desc'));
      unsubExtra = onSnapshot(query(collection(db, 'refund_requests'), where('userId', '==', member.id), orderBy('createdAt', 'desc')), (snap) => {
        const rData: Record<string, unknown>[] = [];
        snap.forEach(d => rData.push({ id: d.id, ...d.data() }));
        setExtraData(rData);
      });
    } else if (activeTab === 'activity') {`;

const newStr = `    } else if (activeTab === 'wallet') {
      q = query(collection(db, 'transactions'), where('userId', '==', member.id), orderBy('createdAt', 'desc'));
      unsubExtra = onSnapshot(query(collection(db, 'refund_requests'), where('userId', '==', member.id), orderBy('createdAt', 'desc')), (snap) => {
        const rData: Record<string, unknown>[] = [];
        snap.forEach(d => rData.push({ id: d.id, ...d.data() }));
        setExtraData(rData);
      });
    } else if (activeTab === 'license') {
      q = query(collection(db, 'licenses'), where('userId', '==', member.id), orderBy('createdAt', 'desc'));
    } else if (activeTab === 'market') {
      q = query(collection(db, 'market_licenses'), where('sellerId', '==', member.id), orderBy('createdAt', 'desc'));
    } else if (activeTab === 'p2p') {
      q = query(collection(db, 'p2p_ads'), where('sellerId', '==', member.id), orderBy('createdAt', 'desc'));
    } else if (activeTab === 'activity') {`;

content = content.replace(targetStr, newStr);
fs.writeFileSync('src/views/admin/AdminMemberProfileView.tsx', content);
