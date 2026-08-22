const fs = require('fs');
let code = fs.readFileSync('src/components/instructor/CourseForm.tsx', 'utf8');

// Add states
code = code.replace(/const \[thumbnailStr, setThumbnailStr\] = useState\(""\);/, `const [thumbnailStr, setThumbnailStr] = useState("");
  const [totalModules, setTotalModules] = useState<number | "">("");
  const [totalVideos, setTotalVideos] = useState<number | "">("");`);

// Add initialization
code = code.replace(/setThumbnailStr\(thumb\);/, `setThumbnailStr(thumb);
      setTotalModules(initialData.totalModules || "");
      setTotalVideos(initialData.totalVideos || "");`);

// Add to onSubmit
code = code.replace(/thumbnail: thumbnailStr,/, `thumbnail: thumbnailStr,
      totalModules: totalModules ? Number(totalModules) : 0,
      totalVideos: totalVideos ? Number(totalVideos) : 0,`);

// Add to UI
const uiFields = `        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-widest text-slate-400 mb-2">
              Nombre de modules
            </label>
            <input
              type="number"
              min="1"
              required
              value={totalModules}
              onChange={(e) => setTotalModules(e.target.value === "" ? "" : Number(e.target.value))}
              className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-primary outline-none transition-colors"
              placeholder="Ex: 5"
            />
          </div>
          <div>
            <label className="block text-xs font-bold uppercase tracking-widest text-slate-400 mb-2">
              Nombre total de vidéos
            </label>
            <input
              type="number"
              min="1"
              required
              value={totalVideos}
              onChange={(e) => setTotalVideos(e.target.value === "" ? "" : Number(e.target.value))}
              className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-primary outline-none transition-colors"
              placeholder="Ex: 20"
            />
          </div>
        </div>`;

code = code.replace(/<div className="grid grid-cols-1 md:grid-cols-2 gap-4">[\s\S]*?<\/div>\s*<\/div>/, `$&
${uiFields}`);

fs.writeFileSync('src/components/instructor/CourseForm.tsx', code);
