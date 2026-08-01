const fs = require('fs');
let code = fs.readFileSync('src/views/instructor/InstructorWealth.tsx', 'utf8');

code = code.replace(/toast\(\{ title: 'Information', description: String\("Demande de retrait enregistrée et fonds sécurisés sous séquestre d'audit !",\) \}\);\n\s+setIsWithdrawModalOpen\(false\);/, `toast({ title: 'Information', description: "Demande de retrait enregistrée et fonds sécurisés sous séquestre d'audit !" });
      setIsWithdrawModalOpen(false);`);

code = code.replace(/toast\(\{ variant: 'destructive', title: 'Erreur', description: String\("Erreur de requête: " \+\n\s*\(e\.message \|\| "Permissions insuffisantes ou erreur inconnue\."\) \}\),\n\s*\);\n\s*\}\nfinally/, `toast({ variant: 'destructive', title: 'Erreur', description: "Erreur de requête: " + (e.message || "Permissions insuffisantes ou erreur inconnue.") });
    } finally`);

fs.writeFileSync('src/views/instructor/InstructorWealth.tsx', code);
