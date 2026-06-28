import React, { useState, useEffect, useRef } from "react";
import {
  collection,
  query,
  where,
  getDocs,
  addDoc,
  serverTimestamp,
  onSnapshot,
  deleteDoc,
  doc,
} from "firebase/firestore";
import { db } from "../../../firebase";
import { useRole } from "../../../context/RoleContext";
import {
  Paperclip,
  Plus,
  Trash2,
  File as FileIcon,
  ExternalLink,
  UploadCloud,
  Loader2,
  CheckCircle2,
} from "lucide-react";

export function ResourcesClient() {
  const { currentUser } = useRole();
  const [courses, setCourses] = useState<any[]>([]);
  const [resources, setResources] = useState<any[]>([]);

  // Upload state
  const [selectedCourse, setSelectedCourse] = useState("");
  const [resourceTitle, setResourceTitle] = useState("");
  const [resourceFile, setResourceFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!currentUser?.uid) return;

    // Fetch courses for dropdown
    const fetchCourses = async () => {
      const q = query(
        collection(db, "courses"),
        where("instructorId", "==", currentUser.uid),
      );
      const snap = await getDocs(q);
      setCourses(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    };
    fetchCourses();

    // Listen to resources
    const qRes = query(
      collection(db, "course_resources"),
      where("instructorId", "==", currentUser.uid),
    );
    const unsub = onSnapshot(qRes, (snap) => {
      setResources(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    });

    return () => unsub();
  }, [currentUser?.uid]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setResourceFile(e.target.files[0]);
      // Auto-fill title if empty
      if (!resourceTitle) {
        setResourceTitle(e.target.files[0].name.split(".")[0]);
      }
    }
  };

  const handleAddResource = async () => {
    if (!selectedCourse || !resourceTitle || !resourceFile || !currentUser?.uid)
      return;

    setIsUploading(true);
    setUploadProgress(0);

    try {
      const { uploadToR2 } = await import("../../../lib/r2Upload");
      const courseObj = courses.find((c) => c.id === selectedCourse);
      const downloadURL = await uploadToR2(resourceFile, `courses/${selectedCourse}/resources`, (progress) => {
        setUploadProgress(progress);
      });

      await addDoc(collection(db, "course_resources"), {
        instructorId: currentUser.uid,
        courseId: selectedCourse,
        courseTitle: courseObj?.title || "Formation",
        title: resourceTitle,
        url: downloadURL,
        fileName: resourceFile.name,
        fileSize: resourceFile.size,
        mimeType: resourceFile.type,
        type: "file",
        createdAt: serverTimestamp(),
      });

      // Reset form
      setResourceTitle("");
      setResourceFile(null);
      setSelectedCourse("");
      if (fileInputRef.current) fileInputRef.current.value = "";

      setIsUploading(false);
      setUploadProgress(0);

      // Show success toast
      setToastMessage("Ressource ajoutée avec succès");
      setTimeout(() => setToastMessage(null), 3000);

    } catch (error: any) {
      console.error("Erreur lors de l'upload:", error);
      setIsUploading(false);
      setUploadProgress(0);
      alert(`Erreur d'upload: ${error.message || "Vérifiez votre connexion"}`);
    }
  };

  const handleDeleteResource = async (resId: string) => {
    if (!resId) return;
    if (confirm("Supprimer cette ressource ?")) {
      try {
        await deleteDoc(doc(db, "course_resources", resId));
      } catch (error: any) {
        console.error("Erreur lors de la suppression de la ressource:", error);
        alert(
          "Erreur lors de la suppression : " +
            (error.message || "Permissions insuffisantes."),
        );
      }
    }
  };

  const formatBytes = (bytes: number, decimals = 2) => {
    if (!+bytes) return "0 Bytes";
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ["Bytes", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
  };

  return (
    <div className="space-y-6 mt-6 relative">
      {/* Toast Message */}
      {toastMessage && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 bg-emerald-500 text-white px-4 py-2 rounded-xl text-xs font-bold tracking-widest flex items-center gap-2 shadow-lg z-50 animate-in slide-in-from-top fade-in whitespace-nowrap">
          <CheckCircle2 className="w-4 h-4" />
          {toastMessage}
        </div>
      )}

      <div className="bg-[#1e293b] border border-white/5 rounded-[2.5rem] p-8 shadow-2xl relative overflow-hidden">
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <h2 className="font-black uppercase tracking-tight text-xl mb-2 text-white">
          Ajouter une ressource
        </h2>
        <p className="text-sm font-medium text-slate-400 mb-8 italic">
          Téléversez des documents (PDF, ZIP, DOCX) pour vos apprenants.
        </p>

        <div className="grid md:grid-cols-2 gap-4 mb-4">
          <div className="space-y-2">
            <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 ml-2">
              Associer à la formation
            </label>
            <select
              className="w-full bg-[#0f172a] border border-white/10 rounded-2xl p-4 text-sm text-white focus:ring-1 focus:ring-emerald-500/50 outline-none"
              value={selectedCourse}
              onChange={(e) => setSelectedCourse(e.target.value)}
              disabled={isUploading}
            >
              <option value="">Sélectionner une formation</option>
              {courses.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.title}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 ml-2">
              Titre de la ressource
            </label>
            <input
              className="w-full bg-[#0f172a] border border-white/10 rounded-2xl p-4 text-sm text-white focus:ring-1 focus:ring-emerald-500/50 outline-none placeholder:text-slate-600"
              placeholder="Ex: Template Notion Organisation"
              value={resourceTitle}
              onChange={(e) => setResourceTitle(e.target.value)}
              disabled={isUploading}
            />
          </div>
        </div>

        <div className="space-y-2 mb-6">
          <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 ml-2">
            Fichier à téléverser
          </label>
          <div className="flex gap-2 items-center">
            <div className="relative flex-1">
              <UploadCloud className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept=".pdf,.doc,.docx,.ppt,.pptx,.zip,.rar"
                disabled={isUploading}
                className="w-full bg-[#0f172a] border border-white/10 rounded-2xl py-3 pl-12 pr-4 text-sm text-slate-300 file:mr-4 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-[10px] file:font-bold file:uppercase file:tracking-widest file:bg-slate-800 file:text-slate-400 hover:file:bg-slate-700 hover:file:text-white cursor-pointer"
              />
            </div>
            <button
              onClick={handleAddResource}
              disabled={
                !selectedCourse ||
                !resourceTitle ||
                !resourceFile ||
                isUploading
              }
              className="bg-emerald-500 text-[#0f172a] h-[52px] px-6 rounded-2xl font-black uppercase tracking-widest text-xs flex items-center justify-center gap-2 hover:bg-emerald-400 disabled:opacity-50 transition min-w-[140px]"
            >
              {isUploading ? (
                <>
                  <Loader2 size={16} className="animate-spin" />{" "}
                  {uploadProgress}%
                </>
              ) : (
                <>
                  <Plus size={16} /> Envoyer
                </>
              )}
            </button>
          </div>
          {isUploading && (
            <div className="mt-2 h-1.5 w-full bg-[#0f172a] rounded-full overflow-hidden">
              <div
                className="h-full bg-emerald-500 transition-all duration-300 ease-out rounded-full"
                style={{ width: `${uploadProgress}%` }}
              ></div>
            </div>
          )}
        </div>
      </div>

      <div className="bg-[#0f172a] rounded-[2.5rem] p-8 border border-white/5">
        <h3 className="font-bold text-white text-lg mb-6 flex items-center gap-2">
          <FileIcon className="text-emerald-500 w-5 h-5" />
          Fichiers importés ({resources.length})
        </h3>

        {resources.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center opacity-50 border border-dashed border-white/10 rounded-3xl">
            <Paperclip className="h-10 w-10 text-slate-500 mb-4" />
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">
              Aucune ressource partagée
            </p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-4">
            {resources.map((res) => (
              <div
                key={res.id}
                className="p-4 bg-[#1e293b] border border-white/5 rounded-2xl flex items-start justify-between group hover:border-white/10 transition"
              >
                <div className="flex gap-4 items-start w-full pr-4">
                  <div className="w-12 h-12 bg-slate-900 border border-white/5 rounded-xl flex items-center justify-center shrink-0 shadow-inner">
                    {res.mimeType?.includes("pdf") ? (
                      <FileIcon className="w-5 h-5 text-red-400" />
                    ) : res.mimeType?.includes("zip") ||
                      res.mimeType?.includes("rar") ? (
                      <Paperclip className="w-5 h-5 text-blue-400" />
                    ) : (
                      <FileIcon className="w-5 h-5 text-slate-400" />
                    )}
                  </div>
                  <div className="overflow-hidden flex-1">
                    <p className="font-bold text-sm text-white mb-0.5 truncate">
                      {res.title}
                    </p>
                    <div className="flex items-center gap-2 mb-2">
                      <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest truncate">
                        {res.courseTitle}
                      </p>
                      {res.fileSize && (
                        <>
                          <span className="w-1 h-1 rounded-full bg-slate-600 shrink-0"></span>
                          <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest shrink-0">
                            {formatBytes(res.fileSize)}
                          </p>
                        </>
                      )}
                    </div>
                    <a
                      href={res.url}
                      target="_blank"
                      rel="noreferrer"
                      className="text-[11px] text-emerald-400 hover:text-emerald-300 hover:underline flex items-center gap-1 font-semibold"
                    >
                      Télécharger le fichier <ExternalLink size={10} />
                    </a>
                  </div>
                </div>
                <button
                  onClick={() => handleDeleteResource(res.id)}
                  className="text-slate-600 hover:text-red-500 transition p-2 opacity-0 group-hover:opacity-100 bg-slate-900 rounded-lg shrink-0"
                  title="Supprimer"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
