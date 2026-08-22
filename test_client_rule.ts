import { initializeApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import { getFirestore, collection, query, orderBy, getDocs } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY,
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.VITE_FIREBASE_APP_ID
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

async function run() {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, 'oyonomathias@gmail.com', 'admin123'); // assuming standard test password
    console.log("Logged in as:", userCredential.user.uid);
    
    const q = query(collection(db, 'kyc_requests'), orderBy('submittedAt', 'desc'));
    const snap = await getDocs(q);
    console.log("Fetched docs:", snap.docs.length);
  } catch (e) {
    console.error(e);
  }
}
run();
