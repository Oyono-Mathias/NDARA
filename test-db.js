import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, query, where, limit } from 'firebase/firestore';

const app = initializeApp({
  projectId: "ai-studio-c73c95ce-68aa-4b01-b061-8f1054e2e008",
});
const db = getFirestore(app);

async function run() {
  const q = query(collection(db, "courses"), where("slug", "==", "alibaba"), limit(1));
  const snap = await getDocs(q);
  if (!snap.empty) {
    const course = snap.docs[0].data();
    console.log(JSON.stringify(course.content, null, 2));
  } else {
    console.log("Course not found");
  }
}
run();
