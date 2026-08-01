// @ts-nocheck
import { logger } from '../../../lib/logger';
import { toast } from '../../../hooks/use-toast';
import { useState, useEffect, useRef } from "react";
import { db, auth } from "../../../firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import {
  Plus,
  Video,
  Trash2,
  GripVertical,
  Loader2,
  Upload,
} from "lucide-react";
import { uploadToR2 } from "../../../lib/r2Upload";
import { useGoogleLogin } from '@react-oauth/google';

export function ContentManager({ courseId }: { courseId: string }) {
  const [content, setContent] = useState<any[]>([]);

  const [isPickerLoading, setIsPickerLoading] = useState(false);
  const [activeUploadTarget, setActiveUploadTarget] = useState<{modIdx: number, lesIdx: number, lesId: string} | null>(null);

  const loadPickerScript = () => {
    return new Promise((resolve, reject) => {
      if ((window as any).google && (window as any).google.picker) {
        resolve(true);
        return;
      }
      const script = document.createElement('script');
      script.src = 'https://apis.google.com/js/api.js';
      script.onload = () => {
        (window as any).gapi.load('picker', { callback: () => resolve(true) });
      };
      script.onerror = reject;
      document.body.appendChild(script);
    });
  };

  const handleDriveVideoPicked = async (accessToken: string, fileId: string, fileName: string, modIdx: number, lesIdx: number, lesId: string) => {
     try {
       setUploadingLessons((prev) => ({ ...prev, [lesId]: 0 }));
       
       const idToken = await auth.currentUser?.getIdToken();
      const res = await fetch('/api/admin/video/drive-to-bunny', {
         method: 'POST',
         headers: { 
           'Content-Type': 'application/json',
           'Authorization': `Bearer ${idToken}`
         },
         body: JSON.stringify({ fileId, driveToken: accessToken, fileName, courseId: courseId || "new", lesId })
       });
       
       if(!res.ok) throw new Error("Erreur de transfert");
       const data = await res.json();
       
       const newModules = [...content];
       newModules[modIdx].lessons[lesIdx].videoUrl = data.videoUrl;
       newModules[modIdx].lessons[lesIdx].videoId = data.videoId;
       newModules[modIdx].lessons[lesIdx].provider = 'bunny';
       setContent(newModules);
       updateDoc(doc(db, 'courses', courseId), { content: newModules });
       
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

        if (activeUploadTarget) {
            const { modIdx, lesIdx, lesId } = activeUploadTarget;
            
            const picker = new (window as any).google.picker.PickerBuilder().setAppId('gen-lang-client-0381307586')
              .addView((window as any).google.picker.ViewId.DOCS_VIDEOS)
              .setOAuthToken(tokenResponse.access_token)
              .setCallback((data: any) => {
                if (data.action === (window as any).google.picker.Action.PICKED) {
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

  const openDrivePicker = (modIdx: number, lesIdx: number, lesId: string) => {
    setActiveUploadTarget({ modIdx, lesIdx, lesId });
    setIsPickerLoading(true);
    loginGoogleDrive();
  };
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingLessons, setUploadingLessons] = useState<{
    [key: string]: number;
  }>({});
  const [activeVideoProvider, setActiveVideoProvider] = useState<
    "bunny" | "cloudflare"
  >("bunny");
  const fileInputRefs = useRef<{ [key: string]: HTMLInputElement | null }>({});

  useEffect(() => {
    // Obtenir la configuration globale
    getDoc(doc(db, "settings", "global_config")).then((snap) => {
      if (snap.exists() && snap.data().active_video_provider) {
        setActiveVideoProvider(snap.data().active_video_provider);
      }
    });
    // Aussi vérifier la nouvelle conf de l'admin (ai_config)
    getDoc(doc(db, "settings", "ai_config")).then((snap) => {
      if (snap.exists() && snap.data().defaultVideoPlayer) {
        setActiveVideoProvider(snap.data().defaultVideoPlayer);
      }
    });

    getDoc(doc(db, "courses", courseId)).then((snap) => {
      if (snap.exists()) {
        setContent(snap.data().content || []);
      }
      setLoading(false);
    });
  }, [courseId]);

  const handleVideoUpload = async (
    file: File,
    modIdx: number,
    lesIdx: number,
  ) => {
    if (!file) return;
    const lesId = content[modIdx].lessons[lesIdx].id;

    try {
      setUploadingLessons((prev) => ({ ...prev, [lesId]: 0 }));

      let result;
      try {
        if (activeVideoProvider === "cloudflare") {
          const { uploadVideoToCloudflare } = await import("../../../lib/cloudflareUpload");
          result = await uploadVideoToCloudflare(file, (p) => {
            setUploadingLessons((prev) => ({ ...prev, [lesId]: p }));
          });
        } else {
          const { uploadVideoToBunny } = await import("../../../lib/bunnyUpload");
          result = await uploadVideoToBunny(file, (p) => {
            setUploadingLessons((prev) => ({ ...prev, [lesId]: p }));
          });
        }
      } catch (providerError: any) {
        console.warn("External video provider failed, falling back to basic storage:", providerError);
        toast({ 
          variant: 'destructive', 
          title: 'Lecteur par défaut ignoré', 
          description: "Échec du téléversement vers " + activeVideoProvider + " (" + (providerError.message || 'Erreur API') + "). Bascule sur le stockage local Firebase." 
        });
        const { uploadToR2 } = await import("../../../lib/r2Upload");
        const publicUrl = await uploadToR2(file, "course-videos", (p) => {
          setUploadingLessons((prev) => ({ ...prev, [lesId]: p }));
        });
        result = { iframeUrl: publicUrl, videoId: publicUrl };
      }

      updateLesson(modIdx, lesIdx, "videoUrl", result.iframeUrl);
      updateLesson(modIdx, lesIdx, "videoId", result.videoId);
      updateLesson(modIdx, lesIdx, "provider", activeVideoProvider);
    } catch (err: any) {
      logger.error(err);
      toast({ variant: 'destructive', title: 'Erreur', description: String(`Erreur lors du téléversement de la vidéo: ${err.message || "Vérifiez la configuration/connexion."}`,) });
    } finally {
      setUploadingLessons((prev) => {
        const newUp = { ...prev };
        delete newUp[lesId];
        return newUp;
      });
    }
  };

  const handleAddModule = () => {
    setContent([
      ...content,
      {
        id: "mod_" + Date.now(),
        title: "Nouveau Module",
        lessons: [],
      },
    ]);
  };

  const handleAddLesson = (moduleIndex: number) => {
    const newContent = [...content];
    newContent[moduleIndex].lessons.push({
      id: "les_" + Date.now(),
      title: "Nouvelle Vidéo",
      videoUrl: "",
      duration: "00:00",
    });
    setContent(newContent);
  };

  const updateModuleTitle = (moduleIndex: number, title: string) => {
    const newContent = [...content];
    newContent[moduleIndex].title = title;
    setContent(newContent);
  };

  const updateLesson = (
    moduleIndex: number,
    lessonIndex: number,
    field: string,
    value: string,
  ) => {
    setContent((prevContent) => {
      const newContent = [...prevContent];
      newContent[moduleIndex] = { ...newContent[moduleIndex] };
      newContent[moduleIndex].lessons = [...newContent[moduleIndex].lessons];
      newContent[moduleIndex].lessons[lessonIndex] = {
        ...newContent[moduleIndex].lessons[lessonIndex],
        [field]: value,
      };
      return newContent;
    });
  };

  const removeModule = (moduleIndex: number) => {
    const newContent = [...content];
    newContent.splice(moduleIndex, 1);
    setContent(newContent);
  };

  const removeLesson = (moduleIndex: number, lessonIndex: number) => {
    const newContent = [...content];
    newContent[moduleIndex].lessons.splice(lessonIndex, 1);
    setContent(newContent);
  };

  const saveContent = async () => {
    if (!courseId) {
      logger.error("Erreur: L'ID de la formation est invalide.");
      return;
    }

    setSaving(true);
    try {
      await updateDoc(doc(db, "courses", courseId), { content });
      toast({ title: 'Information', description: "Programme sauvegardé avec succès !" });
    } catch (e: any) {
      logger.error("Erreur lors de la sauvegarde du programme:", e);
      toast({ variant: 'destructive', title: 'Erreur', description: "Erreur lors de la sauvegarde: " +
          (e.message || "Permissions insuffisantes.") });
    } finally {
      setSaving(false);
    }
  };

  if (loading)
    return (
      <div className="p-10 flex justify-center">
        <Loader2 className="animate-spin text-primary w-8 h-8" />
      </div>
    );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="font-bold text-lg text-white">
            Programme de formation
          </h2>
          <p className="text-sm text-slate-400">
            Gérez les modules et les leçons de ce cours.
          </p>
        </div>
        <div className="flex flex-col items-end">
          {Object.keys(uploadingLessons).length > 0 && (
            <span className="text-[10px] text-amber-500 font-bold uppercase tracking-widest mb-1 animate-pulse">
              Téléversement en cours ({Object.keys(uploadingLessons).length})...
            </span>
          )}
          <button
            onClick={saveContent}
            disabled={saving || Object.keys(uploadingLessons).length > 0}
            className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-black px-6 py-2.5 rounded-xl font-bold uppercase text-[10px] tracking-widest transition-colors disabled:opacity-50"
          >
            {saving ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              "Sauvegarder"
            )}
          </button>
        </div>
      </div>

      <div className="space-y-4">
        {content.map((mod, modIdx) => (
          <div
            key={mod.id}
            className="bg-[#1e293b] border border-white/5 rounded-2xl p-4"
          >
            <div className="flex items-center gap-3 mb-4">
              <GripVertical className="text-slate-500 w-5 h-5 cursor-grab" />
              <input
                type="text"
                value={mod.title}
                onChange={(e) => updateModuleTitle(modIdx, e.target.value)}
                className="bg-black/50 border border-white/10 rounded-lg px-4 py-2 text-white font-bold flex-1 focus:border-primary outline-none"
                placeholder="Titre du module"
              />
              <button
                onClick={() => removeModule(modIdx)}
                className="p-2 text-slate-500 hover:text-red-500 transition-colors"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>

            <div className="pl-8 space-y-3">
              {mod.lessons.map((les: any, lesIdx: number) => (
                <div
                  key={les.id}
                  className="flex items-start gap-3 bg-black/30 rounded-xl p-3 border border-white/5"
                >
                  <Video className="w-5 h-5 text-slate-400 mt-2" />
                  <div className="flex-1 space-y-3">
                    <input
                      type="text"
                      value={les.title}
                      onChange={(e) =>
                        updateLesson(modIdx, lesIdx, "title", e.target.value)
                      }
                      className="bg-black/50 border border-white/10 rounded-lg px-3 py-1.5 text-sm text-white w-full focus:border-primary outline-none"
                      placeholder="Titre de la leçon"
                    />
                    <div className="flex gap-3">
                      <div className="flex-1 flex gap-2 relative">
                        <input
                          type="text"
                          value={les.videoUrl}
                          onChange={(e) =>
                            updateLesson(
                              modIdx,
                              lesIdx,
                              "videoUrl",
                              e.target.value,
                            )
                          }
                          className="bg-black/50 border border-white/10 rounded-lg px-3 py-1.5 text-sm text-slate-300 w-full focus:border-primary outline-none"
                          placeholder="Lien vidéo (ex: URL VdoCipher ou MP4)"
                        />
                        <input
                          type="file"
                          accept="video/*"
                          className="hidden"
                          ref={(el) => (fileInputRefs.current[les.id] = el)}
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) handleVideoUpload(file, modIdx, lesIdx);
                          }}
                        />
                        <button
                          onClick={() => fileInputRefs.current[les.id]?.click()}
                          disabled={
                            typeof uploadingLessons[les.id] === "number"
                          }
                          className="p-1.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-slate-300 transition shrink-0 relative"
                          title="Téléverser une vidéo"
                        >
                          {typeof uploadingLessons[les.id] === "number" ? (
                            <div className="flex items-center gap-2 px-2 text-xs font-bold text-primary">
                              <Loader2 className="w-4 h-4 animate-spin" />
                              {uploadingLessons[les.id]}%
                            </div>
                          ) : (
                            <Upload className="w-4 h-4" />
                          )}
                        </button>
                        <button
                          onClick={() => openDrivePicker(modIdx, lesIdx, les.id)}
                          disabled={typeof uploadingLessons[les.id] === "number" || isPickerLoading}
                          className="p-1.5 bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/20 rounded-lg text-blue-400 transition shrink-0 relative flex items-center justify-center"
                          title="Importer depuis Google Drive"
                        >
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><path d="M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z"/><path d="m15 5 4 4"/></svg>
                        </button>
                      </div>
                      <input
                        type="text"
                        value={les.duration}
                        onChange={(e) =>
                          updateLesson(
                            modIdx,
                            lesIdx,
                            "duration",
                            e.target.value,
                          )
                        }
                        className="bg-black/50 border border-white/10 rounded-lg px-3 py-1.5 text-sm text-slate-300 w-24 focus:border-primary outline-none shrink-0"
                        placeholder="Durée (12:45)"
                      />
                    </div>
                  </div>
                  <button
                    onClick={() => removeLesson(modIdx, lesIdx)}
                    className="p-2 text-slate-500 hover:text-red-500 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}

              <button
                onClick={() => handleAddLesson(modIdx)}
                className="flex items-center gap-2 text-primary hover:bg-primary/10 px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-widest transition-colors w-full border border-dashed border-primary/30"
              >
                <Plus className="w-4 h-4" /> Ajouter une leçon
              </button>
            </div>
          </div>
        ))}
      </div>

      <button
        onClick={handleAddModule}
        className="w-full flex items-center justify-center gap-2 bg-transparent border-2 border-dashed border-white/20 hover:border-white/40 text-slate-400 hover:text-white px-6 py-8 rounded-2xl font-bold uppercase text-[10px] tracking-widest transition-colors"
      >
        <Plus className="w-5 h-5" /> Ajouter un Module
      </button>
    </div>
  );
}
