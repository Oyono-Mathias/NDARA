import { initializeApp } from 'firebase/app';
import { getFirestore, doc, getDoc } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSy_fake_just_for_admin_doesn_matter",
  projectId: "ai-studio-c73c95ce-68aa-4b01-b061-8f1054e2e008",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function run() {
  const ref = doc(db, 'settings', 'global_config');
  const snapshot = await getDoc(ref);
  console.log(snapshot.data());
}
run();
