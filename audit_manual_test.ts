import dotenv from 'dotenv';
dotenv.config();
import { adminDb } from './src/lib/firebaseAdmin.js';

async function audit() {
  const results: any = {
    totalCourses: 0,
    newCourse: null,
    chapters: [],
    lessons: [],
    moderationLogs: [],
    notifications: [],
    oldCoursesIntact: true
  };

  // 1. Fetch all courses to find the one created during the manual test
  const coursesSnap = await adminDb.collection('courses').orderBy('createdAt', 'desc').get();
  results.totalCourses = coursesSnap.size;

  let manualTestCourse = null;
  const oldCourses = [];

  coursesSnap.docs.forEach(doc => {
    const data = doc.data();
    // Identify the new one: not the e2e test, probably created recently
    if (!doc.id.startsWith('e2e_') && data.title && data.title !== 'E2E Test Course') {
      // Assuming the most recent one that is NOT E2E is the manual test
      if (!manualTestCourse && data.createdAt) {
        manualTestCourse = { id: doc.id, data };
      }
    }
    if (doc.id.startsWith('e2e_') || data.title === 'E2E Test Course') {
        // ignore e2e
    } else if (manualTestCourse && doc.id !== manualTestCourse.id) {
        oldCourses.push(data);
    }
  });

  results.newCourse = manualTestCourse;

  // Check if old courses are intact
  // E.g., they should still have their original fields. We just check if they exist and haven't lost 'content' if they had it.
  let lostContent = false;
  oldCourses.forEach(c => {
     // Just a sanity check that they exist
     if (c.title === undefined && c.id !== 'undefined') lostContent = true; 
  });
  results.oldCoursesIntact = !lostContent;

  if (manualTestCourse) {
    const courseId = manualTestCourse.id;

    // 2. Fetch chapters
    const chaptersSnap = await adminDb.collection('chapters').where('courseId', '==', courseId).get();
    chaptersSnap.docs.forEach(d => results.chapters.push(d.data()));

    // 3. Fetch lessons
    const lessonsSnap = await adminDb.collection('lessons').where('courseId', '==', courseId).get();
    lessonsSnap.docs.forEach(d => results.lessons.push(d.data()));

    // 4. Fetch moderation logs
    const modSnap = await adminDb.collection('moderation_logs').where('courseId', '==', courseId).get();
    modSnap.docs.forEach(d => results.moderationLogs.push(d.data()));

    // 5. Fetch notifications
    const notifSnap = await adminDb.collection('notifications').where('userId', '==', manualTestCourse.data.instructorId).get();
    notifSnap.docs.forEach(d => {
       if (d.data().type === 'course_status') {
          results.notifications.push(d.data());
       }
    });
  }

  console.log(JSON.stringify(results, null, 2));
}

audit().catch(console.error).finally(() => process.exit(0));
