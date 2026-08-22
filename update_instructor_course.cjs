const fs = require('fs');
let file = fs.readFileSync('src/views/instructor/InstructorCourseEdit.tsx', 'utf8');

const rejectionUI = `
      {course.status === 'rejected' && course.rejectionReason && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-4 flex gap-4 items-start mb-6">
          <div className="p-2 bg-red-500/20 text-red-500 rounded-xl">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-red-500 font-bold mb-1">Formation rejetée</h3>
            <p className="text-sm text-red-400">{course.rejectionReason}</p>
          </div>
        </div>
      )}
`;

file = file.replace(/<\/header>/, "</header>\n" + rejectionUI);

fs.writeFileSync('src/views/instructor/InstructorCourseEdit.tsx', file);
