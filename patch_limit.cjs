const fs = require('fs');
let code = fs.readFileSync('src/views/instructor/InstructorCourseProgram.tsx', 'utf8');

// For adding lesson
const addCheck = `
    const activeLessons = lessons.filter(l => l.status !== 'archived');
    const freeLessonsCount = activeLessons.filter(l => l.isFreePreview).length;
    
    if (newIsFreePreview) {
      const newTotal = activeLessons.length + 1;
      const maxFree = Math.ceil(newTotal * 0.3);
      if (freeLessonsCount + 1 > maxFree) {
        toast({ variant: "destructive", title: "Limite atteinte", description: \`Vous ne pouvez pas dépasser 30% de leçons gratuites (max \${maxFree} pour \${newTotal} leçons).\` });
        return;
      }
    }
`;
code = code.replace('if (!currentChapterId) return;', 'if (!currentChapterId) return;\n' + addCheck);


// For editing lesson
const editCheck = `
    const activeLessons = lessons.filter(l => l.status !== 'archived');
    const freeLessonsCount = activeLessons.filter(l => l.isFreePreview).length;
    const currentLesson = lessons.find(l => l.id === editingLessonId);
    
    if (editLessonData.isFreePreview && currentLesson && !currentLesson.isFreePreview) {
      const maxFree = Math.ceil(activeLessons.length * 0.3);
      if (freeLessonsCount + 1 > maxFree) {
        toast({ variant: "destructive", title: "Limite atteinte", description: \`Vous ne pouvez pas dépasser 30% de leçons gratuites (max \${maxFree} pour \${activeLessons.length} leçons).\` });
        return;
      }
    }
`;
code = code.replace('if (!editingLessonId) return;', 'if (!editingLessonId) return;\n' + editCheck);

fs.writeFileSync('src/views/instructor/InstructorCourseProgram.tsx', code);
