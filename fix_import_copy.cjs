const fs = require('fs');
let content = fs.readFileSync('src/views/admin/AdminMemberProfileView.tsx', 'utf-8');

if (!content.includes('Copy')) {
  content = content.replace(/X,/g, 'X, Copy,');
  fs.writeFileSync('src/views/admin/AdminMemberProfileView.tsx', content);
} else {
  content = content.replace(/import {([^}]*)} from 'lucide-react';/, (match, inner) => {
    if (!inner.includes('Copy')) {
      return `import { Copy, ${inner} } from 'lucide-react';`;
    }
    return match;
  });
  fs.writeFileSync('src/views/admin/AdminMemberProfileView.tsx', content);
}
