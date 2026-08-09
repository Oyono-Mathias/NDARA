const fs = require('fs');
let code = fs.readFileSync('src/views/ambassador/AmbassadorMarketing.tsx', 'utf8');

const additionalLinks = `
          {ebooks.length > 0 && <h2 className="text-xl font-bold text-white mt-8 mb-4">Liens par Ebook</h2>}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {ebooks.map(e => {
              const link = \`\${baseUrl}/market/ebook/\${e.id}?ref=\${ambassadorCode}\`;
              return (
                <div key={e.id} className="bg-[#111827] border border-[#1E293B] rounded-2xl p-6 flex flex-col">
                  <h3 className="font-bold text-white mb-4 line-clamp-1">{e.title}</h3>
                  <div className="flex justify-center mb-6 bg-white p-4 rounded-xl">
                     <QRCodeCanvas id={\`qr-\${e.id}\`} value={link} size={150} level="H" />
                  </div>
                  <div className="flex gap-2 mb-4">
                    <button onClick={() => handleDownloadQR('png', e.id)} className="flex-1 py-2 bg-slate-800 hover:bg-slate-700 text-xs font-bold text-white rounded-lg transition">PNG</button>
                    <button onClick={() => handleDownloadQR('pdf', e.id)} className="flex-1 py-2 bg-slate-800 hover:bg-slate-700 text-xs font-bold text-white rounded-lg transition">PDF</button>
                  </div>
                  <div className="mt-auto border-t border-slate-800 pt-4">
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Partager</p>
                    <div className="flex gap-2 justify-between">
                       <button onClick={() => handleCopy(link)} className="p-2 bg-slate-800 rounded-lg text-slate-300 hover:text-white" title="Copier"><Copy className="w-4 h-4" /></button>
                       <button onClick={() => shareLink('whatsapp', link, e.title)} className="p-2 bg-slate-800 rounded-lg text-green-400 hover:text-green-300" title="WhatsApp"><Share2 className="w-4 h-4" /></button>
                       <button onClick={() => shareLink('facebook', link, e.title)} className="p-2 bg-slate-800 rounded-lg text-blue-500 hover:text-blue-400" title="Facebook"><Share2 className="w-4 h-4" /></button>
                       <button onClick={() => shareLink('twitter', link, e.title)} className="p-2 bg-slate-800 rounded-lg text-sky-400 hover:text-sky-300" title="Twitter/X"><Share2 className="w-4 h-4" /></button>
                       <button onClick={() => shareLink('linkedin', link, e.title)} className="p-2 bg-slate-800 rounded-lg text-blue-600 hover:text-blue-500" title="LinkedIn"><Share2 className="w-4 h-4" /></button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {certifications.length > 0 && <h2 className="text-xl font-bold text-white mt-8 mb-4">Liens par Certification</h2>}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {certifications.map(c => {
              const link = \`\${baseUrl}/certifications/\${c.id}?ref=\${ambassadorCode}\`;
              return (
                <div key={c.id} className="bg-[#111827] border border-[#1E293B] rounded-2xl p-6 flex flex-col">
                  <h3 className="font-bold text-white mb-4 line-clamp-1">{c.title}</h3>
                  <div className="flex justify-center mb-6 bg-white p-4 rounded-xl">
                     <QRCodeCanvas id={\`qr-\${c.id}\`} value={link} size={150} level="H" />
                  </div>
                  <div className="flex gap-2 mb-4">
                    <button onClick={() => handleDownloadQR('png', c.id)} className="flex-1 py-2 bg-slate-800 hover:bg-slate-700 text-xs font-bold text-white rounded-lg transition">PNG</button>
                    <button onClick={() => handleDownloadQR('pdf', c.id)} className="flex-1 py-2 bg-slate-800 hover:bg-slate-700 text-xs font-bold text-white rounded-lg transition">PDF</button>
                  </div>
                  <div className="mt-auto border-t border-slate-800 pt-4">
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Partager</p>
                    <div className="flex gap-2 justify-between">
                       <button onClick={() => handleCopy(link)} className="p-2 bg-slate-800 rounded-lg text-slate-300 hover:text-white" title="Copier"><Copy className="w-4 h-4" /></button>
                       <button onClick={() => shareLink('whatsapp', link, c.title)} className="p-2 bg-slate-800 rounded-lg text-green-400 hover:text-green-300" title="WhatsApp"><Share2 className="w-4 h-4" /></button>
                       <button onClick={() => shareLink('facebook', link, c.title)} className="p-2 bg-slate-800 rounded-lg text-blue-500 hover:text-blue-400" title="Facebook"><Share2 className="w-4 h-4" /></button>
                       <button onClick={() => shareLink('twitter', link, c.title)} className="p-2 bg-slate-800 rounded-lg text-sky-400 hover:text-sky-300" title="Twitter/X"><Share2 className="w-4 h-4" /></button>
                       <button onClick={() => shareLink('linkedin', link, c.title)} className="p-2 bg-slate-800 rounded-lg text-blue-600 hover:text-blue-500" title="LinkedIn"><Share2 className="w-4 h-4" /></button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
`;

code = code.replace(/<\/div>\s*\{\/\* GENERATOR \*\/\}/, additionalLinks + "\n        </div>\n      }\n      {/* GENERATOR */}");

fs.writeFileSync('src/views/ambassador/AmbassadorMarketing.tsx', code);
