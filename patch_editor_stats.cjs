const fs = require('fs');
let code = fs.readFileSync('src/views/instructor/InstructorCourseEdit.tsx', 'utf8');

const statsHeader = `
              {isApprovedBuyout && (
                <span className="px-2 py-1 bg-emerald-500/10 text-emerald-500 text-[9px] border-none font-black uppercase rounded-md">
                  Acquis par Ndara
                </span>
              )}
              <span className="px-2 py-1 bg-blue-500/10 text-blue-500 text-[9px] border-none font-black uppercase rounded-md ml-2">
                {chapters.filter(c => c.status !== 'archived').length} MODULE(S)
              </span>
              <span className="px-2 py-1 bg-blue-500/10 text-blue-500 text-[9px] border-none font-black uppercase rounded-md">
                {lessons.filter(l => l.status !== 'archived' && l.type === 'video').length} VIDÉO(S)
              </span>
`;

code = code.replace(/\{isApprovedBuyout && \([\s\S]*?Acquis par Ndara[\s\S]*?<\/span>[\s\S]*?\}\)/, statsHeader);

fs.writeFileSync('src/views/instructor/InstructorCourseEdit.tsx', code);
