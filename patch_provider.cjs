const fs = require('fs');
let content = fs.readFileSync('src/providers/AppProvider.tsx', 'utf8');

content = content.replace(
  "import { AuthProvider } from '../contexts/AuthContext';",
  "import { AuthProvider } from '../contexts/AuthContext';\nimport { GoogleProvider } from '../contexts/GoogleProvider';"
);

content = content.replace(
  "<AuthProvider>",
  "<GoogleProvider>\n    <AuthProvider>"
);

content = content.replace(
  "</AuthProvider>",
  "</AuthProvider>\n    </GoogleProvider>"
);

fs.writeFileSync('src/providers/AppProvider.tsx', content);
