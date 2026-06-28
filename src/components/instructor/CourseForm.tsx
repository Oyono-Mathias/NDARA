import { useState, useEffect, FormEvent, useRef } from "react";
import { UploadCloud, CheckCircle2, Loader2 } from "lucide-react";
import { formatImageUrl } from "../../lib/utils";

export function CourseForm({ mode, initialData, onSubmit, isSubmitting }: any) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState(0);
  const [slug, setSlug] = useState("");
  const [thumbnailStr, setThumbnailStr] = useState("");
  const [totalModules, setTotalModules] = useState<number | "">("");
  const [totalVideos, setTotalVideos] = useState<number | "">("");
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Check if course is missing modern certification metadata
  const isMissingMetadata = mode === "edit" && initialData && (!initialData.totalModules || !initialData.totalVideos);

  useEffect(() => {
    if (initialData) {
      setTitle(initialData.title || "");
      setDescription(initialData.description || "");
      setPrice(initialData.price || 0);
      setSlug(initialData.slug || "");
      setTotalModules(initialData.totalModules || "");
      setTotalVideos(initialData.totalVideos || "");

      let thumb = initialData.thumbnail || "";
      if (thumb && thumb.includes("r2.cloudflarestorage.com")) {
        try {
          const url = new URL(thumb);
          const pathParts = url.pathname.split("/").filter(Boolean);
          if (pathParts[0] === "ndara-bucket") pathParts.shift();
          thumb = `/api/storage/file/${pathParts.join("/")}`;
        } catch (e) {}
      }
      setThumbnailStr(thumb);
    }
  }, [initialData]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();

    let finalSlug = slug;
    if (!finalSlug && title) {
      finalSlug = title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)+/g, "");
    }

    onSubmit({
      title,
      description,
      price: Number(price),
      slug: finalSlug,
      thumbnail: thumbnailStr,
      totalModules: Number(totalModules) || 0,
      totalVideos: Number(totalVideos) || 0,
      autoCertificate: Number(totalModules) > 0 && Number(totalVideos) > 0,
      updatedAt: new Date().toISOString(),
    });
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: any) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const { uploadToR2 } = await import("../../lib/r2Upload");
      const url = await uploadToR2(file, "course-covers", (progress) => {
        // Optional: Show discrete progress logic if you want
      });
      setThumbnailStr(url);
    } catch (error: any) {
      console.error("Upload failed", error);
      alert(
        `Erreur lors de l'upload : ${error?.message || "Veuillez réessayer."}`,
      );
    } finally {
      setIsUploading(false);
      if (e.target) e.target.value = "";
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="p-6 bg-slate-900 border border-white/5 rounded-2xl text-white space-y-6"
    >
      <h2 className="font-bold text-xl font-serif">
        {mode === "create"
          ? "Créer une nouvelle formation"
          : "Informations Générales de la formation"}
      </h2>

      {isMissingMetadata && (
        <div className="bg-orange-500/10 border border-orange-500/20 text-orange-400 p-4 rounded-xl text-sm leading-relaxed">
          <strong>Attention :</strong> Ce cours utilise l'ancien système de certification. Veuillez renseigner le nombre de modules et de vidéos pour activer la certification automatique.
        </div>
      )}

      <div className="space-y-4">
        <div>
          <label className="block text-xs font-bold uppercase tracking-widest text-slate-400 mb-2">
            Titre du cours
          </label>
          <input
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-primary outline-none transition-colors"
            placeholder="Ex: Devenir un pro du Trading"
          />
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-widest text-slate-400 mb-2">
            Description
          </label>
          <textarea
            rows={4}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-primary outline-none transition-colors resize-none"
            placeholder="Détaillez le contenu et l'objectif de la formation..."
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-widest text-slate-400 mb-2">
              Prix (XAF)
            </label>
            <input
              type="number"
              min="0"
              value={price}
              onChange={(e) => setPrice(Number(e.target.value))}
              className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-primary outline-none transition-colors"
            />
          </div>
          <div>
            <label className="block text-xs font-bold uppercase tracking-widest text-slate-400 mb-2">
              URL simplifiée (Slug)
            </label>
            <input
              type="text"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-primary outline-none transition-colors"
              placeholder="trading-pro (auto-généré si vide)"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-widest text-slate-400 mb-2">
            Image de couverture
          </label>
          <input
            type="file"
            accept="image/*"
            ref={fileInputRef}
            className="hidden"
            onChange={handleFileChange}
          />
          {thumbnailStr ? (
            <div className="relative rounded-xl overflow-hidden group w-full max-w-sm h-48 border border-white/10">
              <img
                src={formatImageUrl(thumbnailStr)}
                alt="Couverture"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  type="button"
                  onClick={handleUploadClick}
                  className="w-10 h-10 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center backdrop-blur-md"
                >
                  <UploadCloud className="h-5 w-5 text-white" />
                </button>
              </div>
            </div>
          ) : (
            <button
              type="button"
              onClick={handleUploadClick}
              disabled={isUploading}
              className="w-full md:w-auto px-6 py-4 bg-black/50 border border-dashed border-white/20 hover:border-primary/50 hover:bg-black/80 rounded-xl flex items-center justify-center gap-3 transition-colors text-sm text-slate-400 disabled:opacity-50"
            >
              {isUploading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <UploadCloud className="h-5 w-5" />
              )}
              {isUploading
                ? "Téléversement..."
                : "Cliquez pour sélectionner une image de couverture"}
            </button>
          )}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-widest text-slate-400 mb-2">
              Nombre de modules *
            </label>
            <input
              type="number"
              min="1"
              required
              value={totalModules}
              onChange={(e) => setTotalModules(e.target.value ? Number(e.target.value) : "")}
              className={`w-full bg-black/50 border ${totalModules === 0 ? "border-red-500" : "border-white/10"} rounded-xl px-4 py-3 text-white focus:border-primary outline-none transition-colors`}
              placeholder="Ex: 5"
            />
          </div>
          <div>
            <label className="block text-xs font-bold uppercase tracking-widest text-slate-400 mb-2">
              Nombre total de vidéos *
            </label>
            <input
              type="number"
              min="1"
              required
              value={totalVideos}
              onChange={(e) => setTotalVideos(e.target.value ? Number(e.target.value) : "")}
              className={`w-full bg-black/50 border ${totalVideos === 0 ? "border-red-500" : "border-white/10"} rounded-xl px-4 py-3 text-white focus:border-primary outline-none transition-colors`}
              placeholder="Ex: 20"
            />
          </div>
        </div>
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="flex justify-center items-center w-full bg-primary hover:bg-primary/90 text-black font-black uppercase tracking-widest text-xs py-4 rounded-xl transition-colors mt-8 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isSubmitting && <Loader2 className="animate-spin h-4 w-4 mr-2" />}
        {isSubmitting
          ? "Enregistrement..."
          : mode === "create"
            ? "Créer le brouillon"
            : "Enregistrer les modifications"}
      </button>
    </form>
  );
}
