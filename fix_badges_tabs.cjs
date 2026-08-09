const fs = require('fs');
let code = fs.readFileSync('src/views/admin/AdminAmbassadorBadges.tsx', 'utf8');

code = code.replace(
    /const tabs = \[\n\s*\{ id: 'levels', label: 'Niveaux' \},\n\s*\{ id: 'badges', label: 'Badges' \},\n\s*\{ id: 'challenges', label: 'Défis' \},\n\s*\{ id: 'settings', label: 'Paramètres' \}\n\s*\];/,
    "const tabs = [\n    { id: 'levels', label: 'Niveaux' },\n    { id: 'badges', label: 'Badges' },\n    { id: 'challenges', label: 'Défis' }\n  ];"
);

code = code.replace(
    /\{activeTab === 'settings' && \(\s*<CommissionSettings[\s\S]*?\/>\s*\)\}/,
    ""
);

fs.writeFileSync('src/views/admin/AdminAmbassadorBadges.tsx', code);
