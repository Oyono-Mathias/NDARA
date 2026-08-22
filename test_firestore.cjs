const { initializeApp } = require('firebase/app');
const { getAuth, signInWithEmailAndPassword } = require('firebase/auth');
const { getFirestore, collection, query, orderBy, getDocs } = require('firebase/firestore');

const firebaseConfig = require('./firebase-applet-config.json');

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

async function run() {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, 'oyonomathias@gmail.com', 'admin123');
    console.log("Logged in as:", userCredential.user.uid);
    
    const q = query(collection(db, 'kyc_requests'), orderBy('submittedAt', 'desc'));
    const snap = await getDocs(q);
    console.log("Fetched docs:", snap.docs.length);
    process.exit(0);
  } catch (e) {
    console.error("ERROR:", e.code, e.message);
    process.exit(1);
  }
}
run();
