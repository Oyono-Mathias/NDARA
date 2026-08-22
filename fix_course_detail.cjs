const fs = require('fs');
const file = 'src/views/CourseDetail.tsx';
let code = fs.readFileSync(file, 'utf8');

if (code.includes("where('slug', '==', slug), limit(1)")) {
  code = code.replace(
    /const courseRef = doc\(db, 'courses', slug\);\s*const unsub = onSnapshot\(courseRef, async \(docSnap\) => \{/g,
    `// The route uses the document ID directly (slug is actually the courseId).
        const courseRef = doc(db, 'courses', slug);
        const unsub = onSnapshot(courseRef, async (docSnap) => {`
  );
  // Actually, CourseDetail receives 'slug' but it seems it uses it as the doc ID in the code!
  // Wait, let's see what the original code did.
}
