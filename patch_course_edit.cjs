const fs = require('fs');
let code = fs.readFileSync('src/views/instructor/InstructorCourseEdit.tsx', 'utf8');

// Replace the validation block
const oldValidation = `    if (!course.totalModules || course.totalModules < 1) missing.push("Nombre de modules");
    if (!course.totalVideos || course.totalVideos < 1) missing.push("Nombre total de vidéos");
    if (chapters.filter(c => c.status !== 'archived').length === 0) missing.push("Au moins 1 chapitre");
    if (lessons.filter(l => l.status !== 'archived').length === 0) missing.push("Au moins 1 leçon");`;

const newValidation = `    const activeChapters = chapters.filter(c => c.status !== 'archived');
    const activeLessons = lessons.filter(l => l.status !== 'archived');
    
    if (activeChapters.length === 0) missing.push("Au moins 1 chapitre");
    if (activeLessons.length === 0) missing.push("Au moins 1 leçon");

    // Check if every chapter has at least 1 lesson
    const emptyChapters = activeChapters.filter(c => !activeLessons.some(l => l.chapterId === c.id));
    if (emptyChapters.length > 0) missing.push("Chaque chapitre doit contenir au moins une leçon");

    // Check if lessons have necessary content
    const incompleteLessons = activeLessons.filter(l => {
      if (!l.title) return true;
      if (l.type === 'video' && !l.videoUrl) return true;
      if (l.type === 'document' && !l.documentUrl) return true;
      if (l.type === 'text' && !l.content) return true;
      // quiz validation basic for now
      return false;
    });
    if (incompleteLessons.length > 0) missing.push("Chaque leçon doit avoir un titre et un contenu/URL valide");`;

code = code.replace(oldValidation, newValidation);

// Also add rejection reason display
const oldRejectedStatus = `{course.status === 'rejected' ? "Rejeté" : "Brouillon"}`;
const newRejectedStatus = `course.status === 'rejected' ? "Formation rejetée" : "Brouillon"`;
code = code.replace(oldRejectedStatus, newRejectedStatus);

const rejectionReasonUI = `
        {course.status === 'rejected' && course.rejectionReason && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl text-sm mb-6">
            <strong className="block mb-1 text-red-500">Motif du rejet :</strong>
            {course.rejectionReason}
          </div>
        )}
        <div className="flex flex-col lg:flex-row gap-8">
`;

code = code.replace(/<div className="flex flex-col lg:flex-row gap-8">/, rejectionReasonUI);

fs.writeFileSync('src/views/instructor/InstructorCourseEdit.tsx', code);
