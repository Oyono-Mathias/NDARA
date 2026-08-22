import dotenv from 'dotenv';
dotenv.config();
import { adminDb } from './src/lib/firebaseAdmin.js';

async function audit() {
  const results: any = {
    latestCourse: null,
    chapters: [],
    lessons: [],
    moderationLogs: [],
    notifications: [],
    oldCoursesCount: 0,
    oldCoursesIntact: true
  };

  const coursesSnap = await adminDb.collection('courses').orderBy('createdAt', 'desc').limit(5).get();
  
  let targetCourse = null;
  coursesSnap.docs.forEach(doc => {
    const data = doc.data();
    // Find the latest course that is NOT the E2E test script course
    if (!doc.id.startsWith('e2e_') && data.title !== 'E2E Test Course') {
      if (!targetCourse) {
        targetCourse = { id: doc.id, data };
      }
    }
  });

  results.latestCourse = targetCourse;

  if (targetCourse) {
    const courseId = targetCourse.id;

    const chaptersSnap = await adminDb.collection('chapters').where('courseId', '==', courseId).get();
    chaptersSnap.docs.forEach(d => results.chapters.push({ id: d.id, ...d.data() }));

    const lessonsSnap = await adminDb.collection('lessons').where('courseId', '==', courseId).get();
    lessonsSnap.docs.forEach(d => results.lessons.push({ id: d.id, ...d.data() }));

    const modSnap = await adminDb.collection('moderation_logs').where('courseId', '==', courseId).get();
    modSnap.docs.forEach(d => results.moderationLogs.push({ id: d.id, ...d.data() }));

    const notifSnap = await adminDb.collection('notifications').where('userId', '==', targetCourse.data.instructorId).get();
    notifSnap.docs.forEach(d => {
       if (d.data().type === 'course_status') {
          results.notifications.push({ id: d.id, ...d.data() });
       }
    });
  }

  // Check a sample of old courses to ensure they haven't been wiped
  const oldSnap = await adminDb.collection('courses').limit(5).get();
  results.oldCoursesCount = oldSnap.size;
  oldSnap.docs.forEach(doc => {
      if (!doc.data().title && doc.id !== 'undefined') results.oldCoursesIntact = false;
  });

  console.log(JSON.stringify(results, null, 2));
}

audit().catch(console.error).finally(() => process.exit(0));
