import dotenv from 'dotenv';
dotenv.config();
import { adminDb } from './src/lib/firebaseAdmin.js';

async function auditCourses() {
  const coursesSnap = await adminDb.collection('courses').get();
  let totalCourses = coursesSnap.size;
  let usingContentArray = 0;
  let totalChapters = 0;
  let totalLessons = 0;

  for (const doc of coursesSnap.docs) {
    const data = doc.data();
    if (data.content && Array.isArray(data.content) && data.content.length > 0) {
      usingContentArray++;
    }
    // Also check for 'sections' which was mentioned in CoursePlayer
    if (data.sections && Array.isArray(data.sections) && data.sections.length > 0) {
      usingContentArray++;
    }
  }

  const chaptersSnap = await adminDb.collection('chapters').get();
  totalChapters = chaptersSnap.size;

  const lessonsSnap = await adminDb.collection('lessons').get();
  totalLessons = lessonsSnap.size;

  console.log(JSON.stringify({
    totalCourses,
    usingContentArray,
    totalChapters,
    totalLessons
  }, null, 2));
}
auditCourses().catch(console.error).finally(() => process.exit(0));
