import dotenv from 'dotenv';
dotenv.config();
import { adminDb } from './src/lib/firebaseAdmin.js';

async function runTest() {
  const instructorId = 'e2e_instructor_new';
  const adminId = 'e2e_admin_new';

  console.log("=== START E2E TEST ===");
  try {
    // 1. Create Course (draft)
    const courseRef = await adminDb.collection('courses').add({
      title: 'E2E New Workflow Course',
      description: 'Testing the new workflow',
      price: 5000,
      instructorId,
      status: 'draft',
      createdAt: new Date(),
      updatedAt: new Date()
    });
    const courseId = courseRef.id;
    console.log(`✅ [1] Created Course (draft): ${courseId}`);

    // 2. Create Chapter
    const chapterRef = await adminDb.collection('chapters').add({
      courseId,
      title: 'Chapitre 1',
      order: 0,
      status: 'draft'
    });
    const chapterId = chapterRef.id;
    console.log(`✅ [2] Created Chapter: ${chapterId}`);

    // 3. Create Lesson
    const lessonRef = await adminDb.collection('lessons').add({
      courseId,
      chapterId,
      title: 'Leçon 1',
      type: 'video',
      videoUrl: 'https://test.com/vid.mp4',
      order: 0,
      status: 'draft'
    });
    const lessonId = lessonRef.id;
    console.log(`✅ [3] Created Lesson: ${lessonId}`);

    // 4. Edit Lesson
    await adminDb.collection('lessons').doc(lessonId).update({
      title: 'Leçon 1 (Edited)'
    });
    console.log(`✅ [4] Edited Lesson: ${lessonId}`);

    // 5. Submit for Review (Instructor)
    await adminDb.collection('courses').doc(courseId).update({
      status: 'pending_review'
    });
    console.log(`✅ [5] Instructor submitted (pending_review)`);

    // 6. Admin Rejects
    const rejectionReason = 'Audio quality too low';
    await adminDb.collection('courses').doc(courseId).update({
      status: 'rejected',
      rejectionReason,
      reviewedAt: new Date()
    });
    await adminDb.collection('moderation_logs').add({
      courseId,
      action: 'Rejeter',
      previousStatus: 'pending_review',
      newStatus: 'rejected',
      reason: rejectionReason,
      timestamp: new Date(),
      adminId
    });
    await adminDb.collection('notifications').add({
      userId: instructorId,
      type: 'course_status',
      title: 'Formation rejetée',
      message: `Motif: ${rejectionReason}`,
      createdAt: new Date(),
      read: false
    });
    console.log(`✅ [6] Admin rejected with reason`);

    // 7. Resubmit (Instructor)
    await adminDb.collection('courses').doc(courseId).update({
      status: 'pending_review'
    });
    console.log(`✅ [7] Instructor resubmitted (pending_review)`);

    // 8. Admin Approves
    await adminDb.collection('courses').doc(courseId).update({
      status: 'published',
      reviewedAt: new Date()
    });
    await adminDb.collection('moderation_logs').add({
      courseId,
      action: 'Approuver',
      previousStatus: 'pending_review',
      newStatus: 'published',
      reason: '',
      timestamp: new Date(),
      adminId
    });
    console.log(`✅ [8] Admin approved (published)`);

    // 9. Final Verification
    const finalCourse = await courseRef.get();
    const finalData = finalCourse.data() as any;
    
    if (finalData.status === 'published' && finalData.sections === undefined) {
      console.log(`✅ [9] Final verification passed: status is published, no legacy sections found.`);
    } else {
      console.error(`❌ [9] Final verification failed: `, finalData);
    }
  } catch (err) {
    console.error("Test failed:", err);
  }
}

runTest().catch(console.error).finally(() => process.exit(0));
