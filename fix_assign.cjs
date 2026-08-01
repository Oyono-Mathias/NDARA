const fs = require('fs');
let code = fs.readFileSync('src/components/instructor/assignments/AssignmentsClient.tsx', 'utf8');

code = code.replace(/description: "Erreur de correction IA. Assurez-vous que la clé VITE_GEMINI_API_KEY est valide.",\) \}\);/g, `description: "Erreur de correction IA. Assurez-vous que la clé VITE_GEMINI_API_KEY est valide." });`);

code = code.replace(/toast\(\{ variant: 'destructive', title: 'Erreur', description: String\("Erreur lors de la notation : " \+\n\s*\(error\.message \|\|\n\s*"Permissions insuffisantes\. Le timestamp \('gradedAt'\) \}\) ou d'autres champs bloquent peut-être Firestore\."\),\n\s*\);\n\s*\} finally/g, `toast({ variant: 'destructive', title: 'Erreur', description: "Erreur lors de la notation : " + (error.message || "Permissions insuffisantes.") });
    } finally`);

fs.writeFileSync('src/components/instructor/assignments/AssignmentsClient.tsx', code);
