const fs = require('fs');
let content = fs.readFileSync('src/views/admin/AdminSettings.tsx', 'utf8');

const importStatement = `import { GoogleWorkspaceAuth } from '../../components/GoogleWorkspaceAuth';\nimport { MessageSquare } from 'lucide-react';\n`;

content = content.replace("import { Loader2", importStatement + "import { Loader2");

const uiSnippet = `
          {/* GOOGLE WORKSPACE SECTION */}
          <div className="bg-[#0B111A] border border-slate-800/50 rounded-2xl p-6">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
                <MessageSquare className="w-6 h-6 text-blue-500" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white">Intégration Google Workspace</h2>
                <p className="text-sm text-slate-400">Google Chat & Google Drive</p>
              </div>
            </div>
            <div className="p-4 rounded-xl border border-blue-500/20 bg-blue-500/5">
              <p className="text-sm text-slate-300 mb-4 leading-relaxed">
                Connectez votre compte Google Workspace pour permettre à Ndara de <strong>créer automatiquement des espaces Google Chat</strong> pour vos cohortes et de <strong>sélectionner des vidéos via Google Drive (Google Picker)</strong>.
              </p>
              <GoogleWorkspaceAuth onSuccess={async (token) => {
                try {
                  toast({ title: "Configuration réussie !" });
                } catch(e) {
                  console.error(e);
                }
              }} />
            </div>
          </div>
`;

content = content.replace("{/* SYSTEM STATUS */}", uiSnippet + "\n          {/* SYSTEM STATUS */}");

fs.writeFileSync('src/views/admin/AdminSettings.tsx', content);
