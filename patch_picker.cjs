const fs = require('fs');
let content = fs.readFileSync('src/components/instructor/course-content/ContentManager.tsx', 'utf8');

// Add imports
if(!content.includes('useGoogleLogin')) {
  content = content.replace(
    'import { uploadToR2 } from "../../../lib/r2Upload";',
    `import { uploadToR2 } from "../../../lib/r2Upload";\nimport { useGoogleLogin } from '@react-oauth/google';\nimport { useToast } from '../../ui/use-toast';`
  );
}

// Add state and hooks inside the component
const targetHooks = `const ContentManager = ({ course, updateCourse, saving }: { course: Course; updateCourse: (c: Partial<Course>) => void; saving: boolean }) => {`;
const newHooks = targetHooks + `
  const { toast } = useToast();
  const [isPickerLoading, setIsPickerLoading] = useState(false);

  const loadPickerScript = () => {
    return new Promise((resolve, reject) => {
      if (window.google && window.google.picker) {
        resolve(true);
        return;
      }
      const script = document.createElement('script');
      script.src = 'https://apis.google.com/js/api.js';
      script.onload = () => {
        window.gapi.load('picker', { callback: () => resolve(true) });
      };
      script.onerror = reject;
      document.body.appendChild(script);
    });
  };

  const handleDriveVideoPicked = async (accessToken: string, fileId: string, fileName: string, modIdx: number, lesIdx: number, lesId: string) => {
     try {
       // Get the lesson reference to update progress later
       setUploadingLessons((prev) => ({ ...prev, [lesId]: 0 }));
       
       // Send the fileId and accessToken to our server to handle the download and re-upload to BunnyCDN
       const res = await fetch('/api/admin/video/drive-to-bunny', {
         method: 'POST',
         headers: { 'Content-Type': 'application/json' },
         body: JSON.stringify({ fileId, accessToken, fileName })
       });
       
       if(!res.ok) throw new Error("Erreur de transfert");
       const data = await res.json();
       
       const newModules = [...course.content];
       newModules[modIdx].lessons[lesIdx].videoUrl = data.videoUrl;
       newModules[modIdx].lessons[lesIdx].videoId = data.videoId;
       newModules[modIdx].lessons[lesIdx].provider = 'bunny';
       updateCourse({ content: newModules });
       
       toast({ title: "Vidéo importée depuis Google Drive !" });
     } catch(err) {
       console.error(err);
       toast({ title: "Erreur lors de l'import depuis Drive", variant: "destructive" });
     } finally {
       setUploadingLessons((prev) => {
          const newState = { ...prev };
          delete newState[lesId];
          return newState;
       });
     }
  };

  const loginGoogleDrive = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      try {
        await loadPickerScript();
        const pickerOrigin = window.location.ancestorOrigins && window.location.ancestorOrigins.length > 0 
          ? window.location.ancestorOrigins[window.location.ancestorOrigins.length - 1] 
          : window.location.origin;

        // Note: we need modIdx and lesIdx which aren't available globally here.
        // We'll store them in state before calling loginGoogleDrive.
        if (activeUploadTarget) {
            const { modIdx, lesIdx, lesId } = activeUploadTarget;
            
            const picker = new window.google.picker.PickerBuilder()
              .addView(window.google.picker.ViewId.DOCS_VIDEOS)
              .setOAuthToken(tokenResponse.access_token)
              .setCallback((data: any) => {
                if (data.action === window.google.picker.Action.PICKED) {
                  const file = data.docs[0];
                  handleDriveVideoPicked(tokenResponse.access_token, file.id, file.name, modIdx, lesIdx, lesId);
                }
              })
              .setOrigin(pickerOrigin)
              .build();
            picker.setVisible(true);
        }
      } catch (err) {
        toast({ title: "Erreur de chargement du Picker", variant: "destructive" });
      } finally {
        setIsPickerLoading(false);
      }
    },
    onError: () => {
      setIsPickerLoading(false);
      toast({ title: "Erreur de connexion à Google", variant: "destructive" });
    },
    scope: 'https://www.googleapis.com/auth/drive.readonly',
  });

  const [activeUploadTarget, setActiveUploadTarget] = useState<{modIdx: number, lesIdx: number, lesId: string} | null>(null);

  const openDrivePicker = (modIdx: number, lesIdx: number, lesId: string) => {
    setActiveUploadTarget({ modIdx, lesIdx, lesId });
    setIsPickerLoading(true);
    loginGoogleDrive();
  };
`;

content = content.replace(targetHooks, newHooks);

// Now we need to add the "Ouvrir Google Drive" button inside the UI next to the upload button for each lesson.
// In the render method, around line 301, there's the upload button:
const uploadBtnRegex = /<Upload className="w-4 h-4" \/>\s*<\/button>/;
const uploadBtnReplacement = `<Upload className="w-4 h-4" />
                          )}
                        </button>
                        <button
                          onClick={() => openDrivePicker(modIdx, lesIdx, les.id)}
                          disabled={typeof uploadingLessons[les.id] === "number" || isPickerLoading}
                          className="p-1.5 bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/20 rounded-lg text-blue-400 transition shrink-0 relative"
                          title="Importer depuis Google Drive"
                        >
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><path d="M12 2v20"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
                        </button>`;

if (content.match(uploadBtnRegex)) {
   content = content.replace(uploadBtnRegex, uploadBtnReplacement);
   fs.writeFileSync('src/components/instructor/course-content/ContentManager.tsx', content);
   console.log("Patched ContentManager.tsx");
} else {
   console.log("Could not find upload button to patch.");
}
