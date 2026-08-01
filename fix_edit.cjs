const fs = require('fs');
let code = fs.readFileSync('src/views/instructor/InstructorCourseEdit.tsx', 'utf8');

code = code.replace(/toast\(\{ variant: 'destructive', title: 'Erreur', description: String\("Erreur de sauvegarde: " \+ \(e\.message \|\| "Permissions insuffisantes\."\) \}\),\n\s*\);/g, `toast({ variant: 'destructive', title: 'Erreur', description: "Erreur de sauvegarde: " + (e.message || "Permissions insuffisantes.") });`);

code = code.replace(/toast\(\{ variant: 'destructive', title: 'Erreur', description: String\("Erreur lors de l'envoi pour approbation: " \+ \(e\.message \|\| "Permissions insuffisantes\."\) \}\),\n\s*\);/g, `toast({ variant: 'destructive', title: 'Erreur', description: "Erreur lors de l'envoi pour approbation: " + (e.message || "Permissions insuffisantes.") });`);

fs.writeFileSync('src/views/instructor/InstructorCourseEdit.tsx', code);
