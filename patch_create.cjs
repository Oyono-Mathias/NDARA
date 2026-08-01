const fs = require('fs');
const path = require('path');
const file = path.join(__dirname, 'src', 'views', 'instructor', 'InstructorCourseCreate.tsx');

let code = fs.readFileSync(file, 'utf8');

// Add import
if (!code.includes("import { GoogleDriveFilePicker }")) {
    code = code.replace(
        "import { uploadVideoToBunny } from \"../../lib/bunnyUpload\";",
        "import { uploadVideoToBunny } from \"../../lib/bunnyUpload\";\nimport { GoogleDriveFilePicker } from \"../../components/GoogleDriveFilePicker\";"
    );
}

// Add Drive Video handler
const driveVideoHandler = `
  const handleDriveVideoPicked = async (accessToken: string, fileId: string, fileName: string) => {
    try {
      showToast("Transfert depuis Google Drive en cours...", "success");
      const newFile = {
        name: fileName,
        size: 0,
        type: "video/mp4",
        url: "",
        videoId: "",
        status: "Transfert en cours...",
        uploadedAt: new Date().toISOString()
      };
      setVideos(prev => [...prev, newFile]);

      const res = await fetch('/api/admin/video/drive-to-bunny', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fileId, accessToken, fileName, courseId: "new" })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erreur de transfert");

      showToast("Vidéo importée depuis Google Drive !", "success");
      
      const updateStatus = (list: any[]) => list.map(item => item.name === fileName ? { ...item, status: "Prêt", videoId: data.videoId, url: data.videoUrl || "" } : item);
      setVideos(updateStatus);
    } catch(err: any) {
      console.error(err);
      showToast("Erreur lors de l'import: " + err.message, "warning");
      const updateStatus = (list: any[]) => list.map(item => item.name === fileName ? { ...item, status: "Échec" } : item);
      setVideos(updateStatus);
    }
  };
`;

if (!code.includes("handleDriveVideoPicked")) {
    code = code.replace(
        "const uploadSingleFile = async (file: File) => {",
        driveVideoHandler + "\n    const uploadSingleFile = async (file: File) => {"
    );
}

// Add UI for images
if (!code.includes("onFileImported={(url, fileName) => {")) {
    code = code.replace(
        `<p className="text-sm text-gray-400">\n                  Touchez pour ajouter des images\n                </p>`,
        `<p className="text-sm text-gray-400">\n                  Touchez pour ajouter des images\n                </p>\n                <div className="flex justify-center mt-2" onClick={(e) => e.stopPropagation()}>\n                  <GoogleDriveFilePicker\n                    folder="course-images"\n                    allowedTypes="IMAGE"\n                    label="Importer depuis Drive"\n                    onFileImported={(url, fileName) => {\n                      setImages(prev => [...prev, {\n                        name: fileName, url, status: "Prêt", uploadedAt: new Date().toISOString()\n                      }]);\n                    }}\n                    className="flex items-center gap-2 px-3 py-1.5 bg-[#1E293B] hover:bg-[#334155] text-white border border-[#334155] rounded-lg transition-all font-bold text-[10px] uppercase tracking-widest"\n                  />\n                </div>`
    );

    code = code.replace(
        `<p className="text-sm text-gray-400">\n                  Touchez pour ajouter des vidéos\n                  <br />\n                  <span className="text-[10px]">\n                    MP4, MOV • Max 500MB par fichier\n                  </span>\n                </p>`,
        `<p className="text-sm text-gray-400">\n                  Touchez pour ajouter des vidéos\n                  <br />\n                  <span className="text-[10px]">\n                    MP4, MOV • Max 500MB par fichier\n                  </span>\n                </p>\n                <div className="flex justify-center mt-2" onClick={(e) => e.stopPropagation()}>\n                  <GoogleDriveFilePicker\n                    folder="course-videos"\n                    allowedTypes="VIDEO"\n                    label="Importer depuis Drive"\n                    onFilePicked={handleDriveVideoPicked}\n                    className="flex items-center gap-2 px-3 py-1.5 bg-[#1E293B] hover:bg-[#334155] text-white border border-[#334155] rounded-lg transition-all font-bold text-[10px] uppercase tracking-widest"\n                  />\n                </div>`
    );

    code = code.replace(
        `<p className="text-sm text-gray-400">\n                  Touchez pour ajouter des documents\n                  <br />\n                  <span className="text-[10px]">\n                    PDF, DOCX, PPTX • Max 50MB\n                  </span>\n                </p>`,
        `<p className="text-sm text-gray-400">\n                  Touchez pour ajouter des documents\n                  <br />\n                  <span className="text-[10px]">\n                    PDF, DOCX, PPTX • Max 50MB\n                  </span>\n                </p>\n                <div className="flex justify-center mt-2" onClick={(e) => e.stopPropagation()}>\n                  <GoogleDriveFilePicker\n                    folder="course-docs"\n                    allowedTypes="ALL"\n                    label="Importer depuis Drive"\n                    onFileImported={(url, fileName) => {\n                      setDocs(prev => [...prev, {\n                        name: fileName, url, status: "Prêt", uploadedAt: new Date().toISOString()\n                      }]);\n                    }}\n                    className="flex items-center gap-2 px-3 py-1.5 bg-[#1E293B] hover:bg-[#334155] text-white border border-[#334155] rounded-lg transition-all font-bold text-[10px] uppercase tracking-widest"\n                  />\n                </div>`
    );
}

fs.writeFileSync(file, code);
console.log("Patched InstructorCourseCreate.tsx");
