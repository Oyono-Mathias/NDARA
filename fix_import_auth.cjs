const fs = require('fs');
let content = fs.readFileSync('src/views/admin/AdminMemberProfileView.tsx', 'utf-8');

if (!content.includes('import { authService }')) {
  content = content.replace(
    /import \{ useAuth \} from '\.\.\/\.\.\/contexts\/AuthContext';/,
    "import { useAuth } from '../../contexts/AuthContext';\nimport { authService } from '../../services/authService';"
  );
  fs.writeFileSync('src/views/admin/AdminMemberProfileView.tsx', content);
}
