const fs = require('fs');
const path = require('path');
const file = path.join(__dirname, 'src', 'components', 'GoogleDriveFilePicker.tsx');

let code = fs.readFileSync(file, 'utf8');

if (!code.includes("import { auth }")) {
    code = code.replace(
        "import { Loader2, UploadCloud, FileText, Image as ImageIcon } from 'lucide-react';",
        "import { Loader2, UploadCloud, FileText, Image as ImageIcon } from 'lucide-react';\nimport { auth } from '../firebase';"
    );
}

code = code.replace(
`      const res = await fetch('/api/admin/file/drive-to-storage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fileId, driveToken: accessToken, fileName, folder, mimeType })
      });`,
`      const idToken = await auth.currentUser?.getIdToken();
      const res = await fetch('/api/admin/file/drive-to-storage', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': \`Bearer \${idToken}\`
        },
        body: JSON.stringify({ fileId, driveToken: accessToken, fileName, folder, mimeType })
      });`
);

fs.writeFileSync(file, code);
console.log("Fixed picker auth");
