const fs = require('fs');
let code = fs.readFileSync('src/views/instructor/InstructorCourseEdit.tsx', 'utf8');

const oldSubmit = `      await updateDoc(doc(db, "courses", course.id), {
        status: "pending_review",
      });
      setCourse({ ...course, status: "pending_review" });`;

const newSubmit = `      await updateDoc(doc(db, "courses", course.id), {
        status: "pending_review",
        totalModules: activeChapters.length,
        totalVideos: activeLessons.filter(l => l.type === 'video').length,
        autoCertificate: activeChapters.length > 0 && activeLessons.filter(l => l.type === 'video').length > 0
      });
      setCourse({ ...course, status: "pending_review", totalModules: activeChapters.length, totalVideos: activeLessons.filter(l => l.type === 'video').length });`;

code = code.replace(oldSubmit, newSubmit);
fs.writeFileSync('src/views/instructor/InstructorCourseEdit.tsx', code);
