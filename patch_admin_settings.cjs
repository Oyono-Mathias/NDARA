const fs = require('fs');
let content = fs.readFileSync('src/views/admin/AdminSettings.tsx', 'utf8');

// Add import if not present
if (!content.includes('GoogleWorkspaceAuth')) {
    content = content.replace(/import \{ db, auth \} from '\.\.\/\.\.\/firebase';/, "import { db, auth } from '../../firebase';\nimport { GoogleWorkspaceAuth } from '../../components/GoogleWorkspaceAuth';");
}

// Add the button
const target = `<TextInput label="Google OAuth Client ID" type="text" placeholder="123456789-xxxx.apps.googleusercontent.com" value={config.google_client_id} onChange={(v: string) => updateObj('google_client_id', v)} />`;
const replacement = target + `\n                <div className="mt-4"><GoogleWorkspaceAuth onSuccess={(t) => updateObj('google_workspace_token', t)} /></div>`;

content = content.replace(target, replacement);
fs.writeFileSync('src/views/admin/AdminSettings.tsx', content);
