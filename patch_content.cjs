const fs = require('fs');
let content = fs.readFileSync('src/components/instructor/course-content/ContentManager.tsx', 'utf8');

const regex = /\{activeTab === 'upload' && \(/;
const replacement = `{activeTab === 'upload' && (
        <div className="space-y-6">
          <div className="bg-[#1e293b]/40 border border-blue-500/20 rounded-2xl p-6">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 text-blue-400"><path d="M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z"/><path d="m15 5 4 4"/></svg>
                  Importer depuis Google Drive
                </h3>
                <p className="text-sm text-slate-400 mt-1">Sélectionnez une vidéo depuis votre Google Drive. Ndara s'occupera du transfert de façon transparente vers notre serveur de streaming haute performance (Bunny CDN).</p>
              </div>
              <button 
                type="button"
                className="px-4 py-2 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 border border-blue-500/20 rounded-xl transition-all font-bold text-xs uppercase tracking-widest flex items-center gap-2"
                onClick={() => alert("L'API Google Picker s'ouvrira ici pour sélectionner votre vidéo sur Drive.")}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><path d="M12 2v20"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
                Ouvrir Google Drive
              </button>
            </div>
          </div>
          
          <div className="relative">
            <div className="absolute inset-0 flex items-center" aria-hidden="true">
              <div className="w-full border-t border-slate-800"></div>
            </div>
            <div className="relative flex justify-center">
              <span className="px-2 bg-[#090E17] text-xs text-slate-500 font-bold uppercase tracking-widest">OU</span>
            </div>
          </div>
`;

if(content.match(regex)) {
   content = content.replace(regex, replacement);
   fs.writeFileSync('src/components/instructor/course-content/ContentManager.tsx', content);
}
