import { adminDb } from './src/lib/firebaseAdmin.js';
async function run() {
  const snapshot = await adminDb.collection('courses').get();
  snapshot.forEach(doc => {
    const data = doc.data();
    if (data.title) console.log("Course:", data.title);
    if (data.files && data.files.videos) {
       console.log("  Global Videos:", data.files.videos.map(v => v.url));
    }
    if (data.content) {
      data.content.forEach(mod => {
        if (mod.lessons) {
          mod.lessons.forEach(les => {
             if (les.videoUrl) console.log("  Lesson Video:", les.videoUrl);
          });
        }
      });
    }
  });
}
run();
