import { initializeApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import { getFirestore, collection, addDoc, updateDoc, doc, getDoc } from 'firebase/firestore';
import fs from 'fs';

const firebaseConfig = JSON.parse(fs.readFileSync('./firebase-applet-config.json', 'utf8'));

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

async function runTests() {
  console.log("=== START INSTRUCTOR E2E TESTS ===");
  try {
    let userCredential;
    try {
        userCredential = await signInWithEmailAndPassword(auth, 'instructor@ndara.com', 'password123');
    } catch (e: any) {
        throw new Error("Cannot sign in: " + e.message);
    }
    const instructorId = userCredential.user.uid;
    console.log(`[AUTH] Signed in as instructor: ${instructorId}`);

    // TEST 1
    console.log("\n--- TEST 1: Création cours ---");
    const coursePayload = {
      title: 'E2E Validation Course',
      description: 'Course to validate workflow',
      price: 5000,
      slug: `e2e-val-${Date.now()}`,
      thumbnail: 'thumb.jpg',
      totalModules: 1,
      totalVideos: 1,
      autoCertificate: true,
      instructorId,
      status: 'draft',
      createdAt: Date.now(),
      updatedAt: Date.now()
    };
    const courseRef = await addDoc(collection(db, 'courses'), coursePayload);
    const courseId = courseRef.id;
    const courseSnap = await getDoc(doc(db, 'courses', courseId));
    const courseData = courseSnap.data() as any;
    console.log(`Course created: ${courseId}`);
    if (courseData.status === 'draft') console.log("✅ status=draft");
    else console.log("❌ status!=draft");
    
    if (!courseData.sections && !courseData.content) console.log("✅ Aucun sections/content legacy");
    else console.log("❌ Présence de sections/content legacy");

    // TEST 2
    console.log("\n--- TEST 2: Création chapitre ---");
    const chapterRef = await addDoc(collection(db, 'chapters'), {
      courseId,
      title: 'Chapitre 1',
      order: 0,
      status: 'draft',
      createdAt: Date.now(),
      updatedAt: Date.now(),
      deletedAt: null
    });
    console.log(`✅ Création chapitre réussie: ${chapterRef.id}`);

    // TEST 3
    console.log("\n--- TEST 3: Création leçon ---");
    const lessonRef = await addDoc(collection(db, 'lessons'), {
      courseId,
      chapterId: chapterRef.id,
      title: 'Leçon 1',
      type: 'video',
      videoUrl: 'https://youtube.com',
      order: 0,
      status: 'draft',
      createdAt: Date.now(),
      updatedAt: Date.now(),
      deletedAt: null
    });
    console.log(`✅ Création leçon réussie: ${lessonRef.id}`);

    // TEST 4
    console.log("\n--- TEST 4: Modification leçon ---");
    await updateDoc(doc(db, 'lessons', lessonRef.id), { title: 'Leçon Modifiée' });
    const lessonSnap = await getDoc(doc(db, 'lessons', lessonRef.id));
    if (lessonSnap.data()?.title === 'Leçon Modifiée') console.log("✅ Modification leçon réussie");
    else console.log("❌ Modification leçon échouée");

    // TEST 5
    console.log("\n--- TEST 5: Suppression leçon ---");
    await updateDoc(doc(db, 'lessons', lessonRef.id), { deletedAt: Date.now() });
    const lessonSnapAfter = await getDoc(doc(db, 'lessons', lessonRef.id));
    if (lessonSnapAfter.data()?.deletedAt !== null) console.log("✅ Suppression (soft delete) réussie");
    else console.log("❌ Suppression échouée");

    // TEST 6
    console.log("\n--- TEST 6: Soumission pending_review ---");
    await updateDoc(doc(db, 'courses', courseId), { status: 'pending_review' });
    const courseSnapAfterSubmit = await getDoc(doc(db, 'courses', courseId));
    if (courseSnapAfterSubmit.data()?.status === 'pending_review') console.log("✅ Soumission pending_review réussie");
    else console.log("❌ Soumission échouée");

    // TEST 7
    console.log("\n--- TEST 7: Blocage publication directe ---");
    try {
        await updateDoc(doc(db, 'courses', courseId), { status: 'published' });
        console.log("❌ Erreur de sécurité: l'instructeur a pu publier directement !");
    } catch (e: any) {
        if (e.code === 'permission-denied') {
            console.log("✅ Blocage publication directe réussi (permission-denied)");
        } else {
            console.log("❌ Erreur inattendue lors du test de blocage:", e.message);
        }
    }

    console.log("\n=== INSTRUCTOR E2E TESTS FINISHED ===");
    process.exit(0);
  } catch (err: any) {
    console.error("❌ Test failed:", err);
    process.exit(1);
  }
}

runTests();
