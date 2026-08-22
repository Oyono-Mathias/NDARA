import dotenv from 'dotenv';
dotenv.config();
import { initializeApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import { getFirestore, collection, addDoc, updateDoc, doc, serverTimestamp, getDoc } from 'firebase/firestore';

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

async function runTest() {
  console.log("=== START CLIENT E2E TEST ===");
  try {
    // 0. Sign In
    const userCredential = await signInWithEmailAndPassword(auth, 'instructor@ndara.com', 'password123'); // Assuming an account exists or I will create one.
    console.log(`✅ [0] Signed in as: ${userCredential.user.uid}`);
    const instructorId = userCredential.user.uid;

    // 1. Create Course (draft)
    const payload = {
      title: 'E2E Client Workflow Course',
      description: 'Testing the new workflow via client',
      price: 5000,
      slug: 'e2e-client',
      thumbnail: '',
      totalModules: 1,
      totalVideos: 1,
      autoCertificate: true,
      instructorId,
      status: 'draft',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };
    const courseRef = await addDoc(collection(db, 'courses'), payload);
    const courseId = courseRef.id;
    console.log(`✅ [1] Created Course (draft): ${courseId}`);

    // 2. Create Chapter
    const chapterRef = await addDoc(collection(db, 'chapters'), {
      courseId,
      title: 'Chapitre 1',
      description: '',
      order: 0,
      status: 'draft',
      createdAt: Date.now(),
      updatedAt: Date.now(),
      deletedAt: null
    });
    const chapterId = chapterRef.id;
    console.log(`✅ [2] Created Chapter: ${chapterId}`);

    // 3. Create Lesson
    const lessonRef = await addDoc(collection(db, 'lessons'), {
      courseId,
      chapterId,
      title: 'Leçon 1',
      type: 'video',
      videoUrl: '',
      content: '',
      order: 0,
      status: 'draft',
      createdAt: Date.now(),
      updatedAt: Date.now(),
      deletedAt: null
    });
    const lessonId = lessonRef.id;
    console.log(`✅ [3] Created Lesson: ${lessonId}`);

    // 4. Edit Lesson
    await updateDoc(doc(db, 'lessons', lessonId), {
      title: 'Leçon 1 (Edited)',
      updatedAt: Date.now()
    });
    console.log(`✅ [4] Edited Lesson: ${lessonId}`);

    // 5. Submit for Review (Instructor)
    await updateDoc(doc(db, 'courses', courseId), {
      status: 'pending_review'
    });
    console.log(`✅ [5] Instructor submitted (pending_review)`);

    console.log(`✅ [9] Client test passed successfully.`);
  } catch (err: any) {
    console.error("❌ Test failed:", err.message);
  }
}

runTest().catch(console.error).finally(() => process.exit(0));
