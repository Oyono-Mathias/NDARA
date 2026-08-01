const fs = require('fs');
let code = fs.readFileSync('src/views/instructor/InstructorCourses.tsx', 'utf8');

code = code.replace(/toast\(\{ variant: 'destructive', title: 'Erreur', description: String\("Erreur lors de la suppression : " \+\n\s*\(error\.message \|\| "Permissions insuffisantes\."\) \}\),\n\s*\);/g, `toast({ variant: 'destructive', title: 'Erreur', description: "Erreur lors de la suppression : " + (error.message || "Permissions insuffisantes.") });`);

fs.writeFileSync('src/views/instructor/InstructorCourses.tsx', code);
