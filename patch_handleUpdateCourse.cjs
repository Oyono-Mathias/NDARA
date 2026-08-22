const fs = require('fs');
let code = fs.readFileSync('src/views/instructor/InstructorCourseEdit.tsx', 'utf8');

const oldSubmit = `      await updateDoc(doc(db, "courses", courseId), data);`;
const newSubmit = `      const activeChapters = chapters.filter(c => c.status !== 'archived');
      const activeLessons = lessons.filter(l => l.status !== 'archived');
      data.totalModules = activeChapters.length;
      data.totalVideos = activeLessons.filter(l => l.type === 'video').length;
      data.autoCertificate = data.totalModules > 0 && data.totalVideos > 0;
      await updateDoc(doc(db, "courses", courseId), data);`;

code = code.replace(oldSubmit, newSubmit);
fs.writeFileSync('src/views/instructor/InstructorCourseEdit.tsx', code);
