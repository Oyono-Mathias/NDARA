import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs, doc, getDoc, setDoc, updateDoc, serverTimestamp } from "firebase/firestore";
import fs from 'fs';
import path from 'path';

const configPath = path.resolve(process.cwd(), 'firebase-applet-config.json');
const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
const app = initializeApp(config);
const db = getFirestore(app, config.firestoreDatabaseId);

async function run() {
  const usersSnap = await getDocs(collection(db, 'users'));
  let migratedCount = 0;
  
  for (const userDoc of usersSnap.docs) {
    const userData = userDoc.data();
    const uid = userDoc.id;
    
    const ambRef = doc(db, 'ambassadors', uid);
    const ambSnap = await getDoc(ambRef);
    
    const referralCode = userData.referralCode || (ambSnap.exists() ? ambSnap.data().referralCode : ('AMB-' + Math.random().toString(36).substr(2, 6).toUpperCase()));
    const referralLink = `https://ndara.afrique/register?ref=${referralCode}`;
    
    const now = new Date();
    if (!ambSnap.exists()) {
      await setDoc(ambRef, {
        uid,
        referralCode,
        referralLink,
        name: userData.displayName || 'Utilisateur',
        email: userData.email || '',
        totalClicks: 0,
        totalRegistrations: 0,
        totalSales: 0,
        totalRevenue: 0,
        totalCommission: 0,
        availableBalance: 0,
        pendingBalance: 0,
        withdrawnAmount: 0,
        level: 'bronze',
        status: 'active',
        createdAt: userData.createdAt || now,
        updatedAt: now
      });
      migratedCount++;
    } else {
      const updateData = {};
      if (!ambSnap.data().referralCode) updateData.referralCode = referralCode;
      if (!ambSnap.data().referralLink) updateData.referralLink = referralLink;
      if (ambSnap.data().totalClicks === undefined) updateData.totalClicks = ambSnap.data().clicks || 0;
      if (ambSnap.data().totalRegistrations === undefined) updateData.totalRegistrations = ambSnap.data().signups || 0;
      if (ambSnap.data().totalSales === undefined) updateData.totalSales = ambSnap.data().totalSales || 0;
      if (ambSnap.data().totalRevenue === undefined) updateData.totalRevenue = ambSnap.data().totalRevenue || 0;
      if (ambSnap.data().totalCommission === undefined) updateData.totalCommission = ambSnap.data().totalCommissions || 0;
      if (ambSnap.data().availableBalance === undefined) updateData.availableBalance = 0;
      if (ambSnap.data().pendingBalance === undefined) updateData.pendingBalance = 0;
      if (ambSnap.data().withdrawnAmount === undefined) updateData.withdrawnAmount = 0;
      if (!ambSnap.data().level) updateData.level = 'bronze';
      
      if (Object.keys(updateData).length > 0) {
        updateData.updatedAt = now;
        await updateDoc(ambRef, updateData);
        migratedCount++;
      }
    }
    
    if (!userData.referralCode) {
       await updateDoc(userDoc.ref, { referralCode });
    }
  }
  
  console.log("Migration complete: " + migratedCount);
  process.exit(0);
}

run();
