const fs = require('fs');
const path = require('path');
const file = path.join(__dirname, 'src', 'views', 'instructor', 'InstructorCourseCreate.tsx');

let code = fs.readFileSync(file, 'utf8');

code = code.replace(
`<p className="text-sm text-gray-400">
                  Touchez pour ajouter des vidéos
                </p>
                <p className="text-[10px] text-gray-500 mt-1">
                  MP4, MOV • Max 500MB par fichier
                </p>`,
`<p className="text-sm text-gray-400">
                  Touchez pour ajouter des vidéos
                </p>
                <p className="text-[10px] text-gray-500 mt-1">
                  MP4, MOV • Max 500MB par fichier
                </p>
                <div className="flex justify-center mt-2" onClick={(e) => e.stopPropagation()}>
                  <GoogleDriveFilePicker
                    folder="course-videos"
                    allowedTypes="VIDEO"
                    label="Importer depuis Drive"
                    onFilePicked={handleDriveVideoPicked}
                    className="flex items-center gap-2 px-3 py-1.5 bg-[#1E293B] hover:bg-[#334155] text-white border border-[#334155] rounded-lg transition-all font-bold text-[10px] uppercase tracking-widest"
                  />
                </div>`
);

code = code.replace(
`<p className="text-sm text-gray-400">
                  Touchez pour ajouter des documents
                </p>
                <p className="text-[10px] text-gray-500 mt-1">
                  PDF, DOCX, PPTX • Max 50MB
                </p>`,
`<p className="text-sm text-gray-400">
                  Touchez pour ajouter des documents
                </p>
                <p className="text-[10px] text-gray-500 mt-1">
                  PDF, DOCX, PPTX • Max 50MB
                </p>
                <div className="flex justify-center mt-2" onClick={(e) => e.stopPropagation()}>
                  <GoogleDriveFilePicker
                    folder="course-docs"
                    allowedTypes="ALL"
                    label="Importer depuis Drive"
                    onFileImported={(url, fileName) => {
                      setDocs(prev => [...prev, {
                        name: fileName, url, status: "Prêt", uploadedAt: new Date().toISOString()
                      }]);
                    }}
                    className="flex items-center gap-2 px-3 py-1.5 bg-[#1E293B] hover:bg-[#334155] text-white border border-[#334155] rounded-lg transition-all font-bold text-[10px] uppercase tracking-widest"
                  />
                </div>`
);

fs.writeFileSync(file, code);
console.log("Patched InstructorCourseCreate.tsx");
