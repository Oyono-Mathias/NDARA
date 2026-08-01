const fs = require('fs');
let content = fs.readFileSync('src/views/admin/AdminMemberProfileView.tsx', 'utf-8');

// Fix Unsubscribe
content = content.replace('let unsubExtra: Record<string, unknown> = null;', 'let unsubExtra: (() => void) | null = null;');
content = content.replace('let unsubExtra: Record<string, unknown> | null = null;', 'let unsubExtra: (() => void) | null = null;');

// Fix Icon
content = content.replace('icon: Record<string, unknown> }[]', 'icon: React.ElementType }[]');
content = content.replace('icon: Record<string, unknown>,', 'icon: React.ElementType,');

fs.writeFileSync('src/views/admin/AdminMemberProfileView.tsx', content);
