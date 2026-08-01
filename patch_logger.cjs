const fs = require('fs');

// Patch AuthContext
let auth = fs.readFileSync('src/contexts/AuthContext.tsx', 'utf8');
auth = auth.replace(/logger\.error\("Erreur lors de la récupération du profil utilisateur", error\);/g, 'console.warn("Fallback auth user used due to error", error);');
fs.writeFileSync('src/contexts/AuthContext.tsx', auth);

// Patch Dashboard
let dash = fs.readFileSync('src/views/Dashboard.tsx', 'utf8');
dash = dash.replace(/logger\.error\("Dashboard FinOps Error:(.*?)"(.*?)\);/g, 'console.warn("Dashboard DB fallback used", $2);');
fs.writeFileSync('src/views/Dashboard.tsx', dash);

console.log("Patched loggers");
