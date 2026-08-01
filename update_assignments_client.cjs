const fs = require('fs');
let code = fs.readFileSync('src/components/instructor/assignments/AssignmentsClient.tsx', 'utf8');

// 1. Add lucide icons and upload function
if (!code.includes('uploadToR2')) {
  code = code.replace("import { TouchArea } from \"../../ui/TouchArea\";", "import { TouchArea } from \"../../ui/TouchArea\";\nimport { uploadToR2 } from \"../../../lib/r2Upload\";\nimport { Paperclip } from \"lucide-react\";");
}

// 2. Add state
code = code.replace(/const \[isCreating, setIsCreating\] = useState\(false\);/, `const [isCreating, setIsCreating] = useState(false);
  const [maxGrade, setMaxGrade] = useState("20");
  const [attachmentUrl, setAttachmentUrl] = useState("");
  const [attachmentName, setAttachmentName] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [status, setStatus] = useState<"draft" | "published">("published");`);

// 3. Update handleCreateAssignment
code = code.replace(/dueDate: dueDate \? new Date\(dueDate\) : null,/, `dueDate: dueDate ? new Date(dueDate) : null,
        maxGrade: Number(maxGrade),
        attachmentUrl,
        attachmentName,
        status,`);

code = code.replace(/setDueDate\(""\);/, `setDueDate("");
      setMaxGrade("20");
      setAttachmentUrl("");
      setAttachmentName("");
      setStatus("published");`);

// 4. Update the render UI
const newFields = `
            <div className="grid grid-cols-2 gap-4">
              <input
                type="date"
                className="w-full bg-[#0f172a] border border-white/10 rounded-2xl p-4 text-sm focus:ring-1 focus:ring-primary/50 text-slate-400"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
              />
              <input
                type="number"
                placeholder="Note maximale (ex: 20)"
                className="w-full bg-[#0f172a] border border-white/10 rounded-2xl p-4 text-sm focus:ring-1 focus:ring-primary/50 text-white"
                value={maxGrade}
                onChange={(e) => setMaxGrade(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <select
                className="w-full bg-[#0f172a] border border-white/10 rounded-2xl p-4 text-sm focus:ring-1 focus:ring-primary/50 text-white"
                value={status}
                onChange={(e) => setStatus(e.target.value as any)}
              >
                <option value="published">Publié (Visible)</option>
                <option value="draft">Brouillon (Caché)</option>
              </select>

              <div className="relative">
                <input
                  type="file"
                  id="assignment-attachment"
                  className="hidden"
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    setIsUploading(true);
                    try {
                      const url = await uploadToR2(file, 'assignments_attachments');
                      setAttachmentUrl(url);
                      setAttachmentName(file.name);
                      toast({ title: 'Information', description: 'Fichier ajouté avec succès' });
                    } catch (err) {
                      logger.error(err);
                      toast({ variant: 'destructive', title: 'Erreur', description: 'Échec de l\\'upload' });
                    } finally {
                      setIsUploading(false);
                    }
                  }}
                />
                <label
                  htmlFor="assignment-attachment"
                  className={\`w-full h-[54px] bg-[#0f172a] border border-white/10 rounded-2xl p-4 text-sm focus:ring-1 focus:ring-primary/50 text-slate-400 flex items-center justify-between cursor-pointer \${isUploading ? "opacity-50" : ""}\`}
                >
                  <span className="truncate">{attachmentName || "Joindre un fichier..."}</span>
                  {isUploading ? <Loader2 className="w-4 h-4 animate-spin text-primary" /> : <Paperclip className="w-4 h-4 text-primary" />}
                </label>
              </div>
            </div>
`;

code = code.replace(/<input\s*type="date"[\s\S]*?onChange=\{\(e\) => setDueDate\(e\.target\.value\)\}\s*\/>/, newFields);

// Fix double export/imports if I messed up.
fs.writeFileSync('src/components/instructor/assignments/AssignmentsClient.tsx', code);
