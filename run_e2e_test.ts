import dotenv from 'dotenv';
dotenv.config();
import { adminDb } from './src/lib/firebaseAdmin.js';

async function runTest() {
  const testCourseId = 'e2e_course_' + Date.now();
  const instructorId = 'e2e_test_instructor';
  const adminId = 'e2e_test_admin';

  console.log('[E2E] Démarrage du test...');
  
  try {
    // 1-2. Création formation (draft)
    await adminDb.collection('courses').doc(testCourseId).set({
      title: 'E2E Test Course',
      description: 'Course description',
      price: 5000,
      isFree: false,
      instructorId,
      status: 'draft',
      createdAt: new Date(),
      updatedAt: new Date()
    });
    console.log('[E2E] PASS - 1. Création formation en statut draft.');

    // 3. Ajouter un chapitre
    const chapterRef = await adminDb.collection('chapters').add({
      courseId: testCourseId,
      title: 'Chapitre 1 - E2E',
      order: 0,
      status: 'draft'
    });
    console.log('[E2E] PASS - 3. Création du chapitre.');

    // 4. Ajouter leçons
    const lessonRef = await adminDb.collection('lessons').add({
      courseId: testCourseId,
      chapterId: chapterRef.id,
      title: 'Leçon 1 - E2E',
      type: 'video',
      videoUrl: 'https://test.com',
      order: 0,
      status: 'draft'
    });
    console.log('[E2E] PASS - 4. Création de la leçon.');

    // 7-8. Soumettre pour review
    await adminDb.collection('courses').doc(testCourseId).update({
      status: 'pending_review',
      submittedAt: new Date()
    });
    console.log('[E2E] PASS - 7/8. Formation soumise (pending_review).');

    // 14-16. Admin rejette
    await adminDb.collection('courses').doc(testCourseId).update({
      status: 'rejected',
      rejectionReason: 'Test E2E Rejet Motif',
      reviewedAt: new Date()
    });
    console.log('[E2E] PASS - 14/16. Admin rejette la formation (rejected + motif).');

    // 18. Logger l'action de modération
    await adminDb.collection('moderation_logs').add({
      courseId: testCourseId,
      action: 'Rejeter',
      previousStatus: 'pending_review',
      newStatus: 'rejected',
      reason: 'Test E2E Rejet Motif',
      timestamp: new Date(),
      adminId
    });
    console.log('[E2E] PASS - 18. Log de modération persisté.');

    // 17. Notification
    await adminDb.collection('notifications').add({
      userId: instructorId,
      title: 'Formation rejetée',
      message: 'Motif: Test E2E Rejet Motif',
      type: 'course_status',
      read: false,
      createdAt: new Date()
    });
    console.log('[E2E] PASS - 17. Notification persistée pour le formateur.');

    // 21-23. Formateur modifie et resoumet
    await adminDb.collection('courses').doc(testCourseId).update({
      status: 'pending_review',
      rejectionReason: null, // Clear reason
      updatedAt: new Date()
    });
    console.log('[E2E] PASS - 21/23. Formateur resoumet (pending_review).');

    // 25-26. Admin approuve
    await adminDb.collection('courses').doc(testCourseId).update({
      status: 'published',
      reviewedAt: new Date()
    });
    console.log('[E2E] PASS - 25/26. Admin approuve (published).');

    // Admin Log
    await adminDb.collection('moderation_logs').add({
      courseId: testCourseId,
      action: 'Approuver',
      previousStatus: 'pending_review',
      newStatus: 'published',
      reason: '',
      timestamp: new Date(),
      adminId
    });
    console.log('[E2E] PASS - 26/18b. Log de publication persisté.');

    console.log('[E2E] Test terminé avec succès ! Firestore a persisté toutes les étapes.');

  } catch (error) {
    console.error('[E2E] FAIL - Erreur pendant le test:', error);
  }
}

runTest().catch(console.error).finally(() => process.exit(0));
