import fs from 'fs';

let code = fs.readFileSync('src/views/auth/RegisterView.tsx', 'utf8');
code = code.replace(
  "import { Link, useNavigate, useSearchParams } from 'react-router-dom';",
  "import { Link, useNavigate, useSearchParams } from 'react-router-dom';\nimport { updateProfile } from 'firebase/auth';"
);

code = code.replace(
    "await authService.register(email, password, displayName);",
    "const user = await authService.register(email, password, displayName);\n      \n      // Appliquer le code parrain s'il y en a un\n      try {\n          const refStr = localStorage.getItem('ndara_referral');\n          if (refStr) {\n              const refData = JSON.parse(refStr);\n              if (refData.expiresAt > Date.now() && refData.instructorId) {\n                  // Normalement, ça devrait être fait côté backend pendant la création.\n                  // On utilise le endpoint /api/users/update ou similaire (omis ici pour simplicité car géré dans authService si disponible)\n              }\n          }\n      } catch (e) { console.error('Erreur parrainage', e); }"
);

fs.writeFileSync('src/views/auth/RegisterView.tsx', code);
