import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import {
  LayoutTemplate,
  ImageIcon,
  Plus,
  Trash2,
  Link as LinkIcon,
  Loader2,
  Save,
  Search,
  Eye,
  EyeOff,
  GripVertical,
  MonitorSmartphone,
  ShieldAlert,
  Type
} from "lucide-react";
import clsx from "clsx";
import { doc, onSnapshot, setDoc } from "firebase/firestore";
import { db } from "../../firebase";
import { NdaraSkeleton } from "./AdminSupport";

export interface CarouselSlide {
  id: string;
  imageUrl: string;
  link?: string;
  order: number;
  isActive: boolean;
}

export function AdminInterface() {
  const location = useLocation();
  const initialTab = location.pathname.includes("vitrine")
    ? "vitrine"
    : location.pathname.includes("seo")
      ? "seo"
      : "vitrine";

  const [activeTab, setActiveTab] = useState(initialTab);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  
  const [settings, setSettings] = useState({
    heroTitle: "",
    callToAction: "",
    monthly_price: 15000,
    kill_switch_active: false,
    featured_preview_url: "",
    carousel_slides: [] as CarouselSlide[],
  });

  const [newSlide, setNewSlide] = useState({
    imageUrl: "",
    link: "",
    order: 0,
  });
  const [isAddingSlide, setIsAddingSlide] = useState(false);
  const [draggedIdx, setDraggedIdx] = useState<number | null>(null);

  useEffect(() => {
    setActiveTab(initialTab);
  }, [initialTab]);

  useEffect(() => {
    const docRef = doc(db, "system_settings", "landing_page");
    const unsubscribe = onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        setSettings({
          heroTitle: data.heroTitle || "",
          callToAction: data.callToAction || "",
          monthly_price: data.monthly_price ?? 15000,
          kill_switch_active: data.kill_switch_active || false,
          featured_preview_url: data.featured_preview_url || "",
          carousel_slides: data.carousel_slides 
            ? data.carousel_slides.sort((a: CarouselSlide, b: CarouselSlide) => a.order - b.order) 
            : []
        });
      }
      setIsLoading(false);
    }, (error) => {
      console.error("Erreur de récupération de system_settings/landing_page:", error);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleSaveAll = async () => {
    setIsSaving(true);
    try {
      const docRef = doc(db, "system_settings", "landing_page");
      await setDoc(docRef, settings, { merge: true });
    } catch (error) {
      console.error("Error saving landing_page settings:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddSlide = async () => {
    const updatedSlides = [
      ...settings.carousel_slides,
      { ...newSlide, id: Date.now().toString(), isActive: true, order: settings.carousel_slides.length + 1 },
    ];
    const newSettings = { ...settings, carousel_slides: updatedSlides };
    
    setIsSaving(true);
    try {
      const docRef = doc(db, "system_settings", "landing_page");
      await setDoc(docRef, newSettings, { merge: true });
      setNewSlide({ imageUrl: "", link: "", order: 0 });
      setIsAddingSlide(false);
    } catch (error) {
      console.error("Error saving slide:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const toggleSlideStatus = async (id: string) => {
    const updatedSlides = settings.carousel_slides.map((s) =>
      s.id === id ? { ...s, isActive: !s.isActive } : s,
    );
    const docRef = doc(db, "system_settings", "landing_page");
    await setDoc(docRef, { carousel_slides: updatedSlides }, { merge: true });
  };

  const deleteSlide = async (id: string) => {
    const updatedSlides = settings.carousel_slides.filter((s) => s.id !== id);
    const docRef = doc(db, "system_settings", "landing_page");
    await setDoc(docRef, { carousel_slides: updatedSlides }, { merge: true });
  };

  const handleDragStart = (idx: number) => {
    setDraggedIdx(idx);
  };

  const handleDragOver = (e: React.DragEvent, idx: number) => {
    e.preventDefault();
  };

  const handleDrop = async (e: React.DragEvent, dropIdx: number) => {
    e.preventDefault();
    if (draggedIdx === null || draggedIdx === dropIdx) return;

    const newSlides = [...settings.carousel_slides];
    const item = newSlides.splice(draggedIdx, 1)[0];
    newSlides.splice(dropIdx, 0, item);

    const ordered = newSlides.map((s, i) => ({ ...s, order: i + 1 }));
    setDraggedIdx(null);
    const docRef = doc(db, "system_settings", "landing_page");
    await setDoc(docRef, { carousel_slides: ordered }, { merge: true });
  };

  if (isLoading) {
    return (
      <div className="space-y-8 animate-in fade-in duration-700 pb-20 relative font-sans">
        <div className="space-y-2 relative z-10">
          <div className="h-8 w-64 bg-slate-800 rounded-lg animate-pulse"></div>
          <div className="h-4 w-96 bg-slate-800/80 rounded animate-pulse"></div>
        </div>
        <NdaraSkeleton type="card" />
        <NdaraSkeleton type="card" />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-700 pb-24 relative font-sans">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[400px] bg-emerald-500/5 blur-[100px] pointer-events-none" />

      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-5 relative z-10">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-emerald-500 mb-1">
            <LayoutTemplate className="h-4 w-4" />
            <span className="text-[10px] font-black uppercase tracking-[0.3em]">
              CMS & Vitrine
            </span>
          </div>
          <h1 className="text-3xl font-black text-white uppercase tracking-tight">
            Interface globale
          </h1>
          <p className="text-slate-400 text-sm font-medium">
            Gérez la vitrine, le carrousel publicitaire et le contenu textuel.
          </p>
        </div>
        
        <button
          onClick={handleSaveAll}
          disabled={isSaving}
          className="w-full sm:w-auto flex items-center justify-center gap-2 h-12 px-8 rounded-xl bg-emerald-500 hover:bg-emerald-400 disabled:bg-slate-700 disabled:text-slate-500 text-slate-950 font-black uppercase text-[10px] tracking-widest transition-all shadow-xl shadow-emerald-500/10"
        >
          {isSaving ? (
            <Loader2 className="animate-spin h-4 w-4" />
          ) : (
            <Save className="h-4 w-4" />
          )}
          Enregistrer tout
        </button>
      </header>

      {/* Tabs */}
      <div className="w-full relative z-10 flex flex-col gap-6">
        <div className="flex overflow-x-auto hide-scrollbar bg-slate-900/50 border border-slate-800 p-1.5 rounded-2xl w-full lg:w-fit shadow-2xl">
          <button
            onClick={() => setActiveTab("vitrine")}
            className={clsx(
              "flex items-center justify-center gap-2 px-6 py-3 font-bold uppercase text-[10px] tracking-widest rounded-xl transition-all whitespace-nowrap",
              activeTab === "vitrine"
                ? "bg-slate-800 text-emerald-400 shadow-sm"
                : "text-emerald-500/50 hover:text-emerald-400/80 hover:bg-slate-800/30",
            )}
          >
            <Type className="h-4 w-4" /> Contenu & Vitrine
          </button>
          <button
            onClick={() => setActiveTab("carousel")}
            className={clsx(
              "flex items-center justify-center gap-2 px-6 py-3 font-bold uppercase text-[10px] tracking-widest rounded-xl transition-all whitespace-nowrap",
              activeTab === "carousel"
                ? "bg-slate-800 text-white shadow-sm"
                : "text-slate-500 hover:text-slate-300 hover:bg-slate-800/30",
            )}
          >
            <ImageIcon className="h-4 w-4" /> Carrousel
          </button>
          <button
            onClick={() => setActiveTab("seo")}
            className={clsx(
              "flex items-center justify-center gap-2 px-6 py-3 font-bold uppercase text-[10px] tracking-widest rounded-xl transition-all whitespace-nowrap",
              activeTab === "seo"
                ? "bg-slate-800 text-emerald-400 shadow-sm"
                : "text-emerald-500/50 hover:text-emerald-400/80 hover:bg-slate-800/30",
            )}
          >
            <Search className="h-4 w-4" /> SEO
          </button>
        </div>

        {/* Content Panels */}
        <div className="mt-2">
          {activeTab === "vitrine" && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <div className="bg-slate-800/40 border border-slate-700/50 rounded-3xl p-6 lg:p-10 shadow-2xl">
                <h3 className="text-sm font-black text-white uppercase tracking-widest mb-8 flex items-center gap-2">
                  <MonitorSmartphone className="w-4 h-4 text-emerald-500" /> Textes & Informations Générales
                </h3>
                
                <div className="grid grid-cols-1 gap-8">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                      Titre Héro (Hero Title)
                    </label>
                    <input
                      type="text"
                      value={settings.heroTitle}
                      onChange={(e) => setSettings({ ...settings, heroTitle: e.target.value })}
                      placeholder="Ex: Formez-vous aux métiers du futur"
                      className="w-full bg-slate-900 border border-slate-700/50 rounded-xl py-3 px-4 text-white text-sm focus:outline-none focus:border-emerald-500/50 transition-colors"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                      Texte d'appel à l'action (Call To Action)
                    </label>
                    <input
                      type="text"
                      value={settings.callToAction}
                      onChange={(e) => setSettings({ ...settings, callToAction: e.target.value })}
                      placeholder="Ex: Rejoignez plus de 5000 étudiants..."
                      className="w-full bg-slate-900 border border-slate-700/50 rounded-xl py-3 px-4 text-white text-sm focus:outline-none focus:border-emerald-500/50 transition-colors"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                        Prix Unique Global (XAF)
                      </label>
                      <input
                        type="number"
                        value={settings.monthly_price}
                        onChange={(e) => setSettings({ ...settings, monthly_price: Number(e.target.value) })}
                        className="w-full bg-slate-900 border border-slate-700/50 rounded-xl py-3 px-4 text-white text-sm focus:outline-none focus:border-emerald-500/50 transition-colors"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                        URL de la Preview (Modal)
                      </label>
                      <input
                        type="text"
                        value={settings.featured_preview_url}
                        onChange={(e) => setSettings({ ...settings, featured_preview_url: e.target.value })}
                        placeholder="https://..."
                        className="w-full bg-slate-900 border border-slate-700/50 rounded-xl py-3 px-4 text-white text-sm focus:outline-none focus:border-emerald-500/50 transition-colors"
                      />
                    </div>
                  </div>

                  <div className="pt-6 border-t border-slate-700/50 flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2 text-sm font-bold text-white mb-1">
                        <ShieldAlert className="w-4 h-4 text-red-500" /> Kill Switch / Mode Maintenance
                      </div>
                      <p className="text-[10px] text-slate-400 uppercase tracking-widest">
                        Désactive la landing page publique
                      </p>
                    </div>
                    <button
                      onClick={() => setSettings({ ...settings, kill_switch_active: !settings.kill_switch_active })}
                      className={clsx(
                        "w-14 h-8 rounded-full p-1 transition-colors relative border",
                        settings.kill_switch_active ? "bg-red-500/20 border-red-500" : "bg-slate-800 border-slate-700",
                      )}
                    >
                      <div
                        className={clsx(
                          "w-6 h-6 rounded-full transition-transform shadow-sm flex items-center justify-center",
                          settings.kill_switch_active ? "bg-red-500 translate-x-6" : "bg-slate-400 translate-x-0",
                        )}
                      >
                         {settings.kill_switch_active && <ShieldAlert className="w-3 h-3 text-white" />}
                      </div>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "carousel" && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <div className="flex justify-between items-center bg-slate-800/20 p-4 rounded-3xl border border-slate-700/50">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-2">
                  Visuels configurés : {settings.carousel_slides.length}
                </span>
                <button
                  onClick={() => setIsAddingSlide(!isAddingSlide)}
                  className={clsx(
                    "flex items-center justify-center gap-2 h-10 px-5 rounded-xl font-bold uppercase text-[9px] tracking-widest transition-all shadow-xl",
                    isAddingSlide
                      ? "bg-slate-700 text-white"
                      : "bg-emerald-500 hover:bg-emerald-400 text-slate-950",
                  )}
                >
                  {isAddingSlide ? "Annuler" : <><Plus className="h-4 w-4" /> Nouveau Slide</>}
                </button>
              </div>

              {isAddingSlide && (
                <div className="bg-slate-800/40 border border-emerald-500/20 rounded-3xl p-6 lg:p-8 animate-in slide-in-from-top-4 duration-500">
                  <h3 className="text-sm font-black text-white uppercase tracking-widest mb-6 flex items-center gap-2">
                    <Plus className="w-4 h-4 text-emerald-500" /> Ajouter un Slide
                  </h3>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                        URL de l'image (1200x400 conseillé)
                      </label>
                      <input
                        type="text"
                        placeholder="https://..."
                        value={newSlide.imageUrl}
                        onChange={(e) => setNewSlide({ ...newSlide, imageUrl: e.target.value })}
                        className="w-full bg-slate-900 border border-slate-700/50 rounded-xl py-3 px-4 text-white text-sm focus:outline-none focus:border-emerald-500/50 transition-colors"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                        Lien de redirection (Optionnel)
                      </label>
                      <input
                        type="text"
                        placeholder="/formations ou https://..."
                        value={newSlide.link}
                        onChange={(e) => setNewSlide({ ...newSlide, link: e.target.value })}
                        className="w-full bg-slate-900 border border-slate-700/50 rounded-xl py-3 px-4 text-white text-sm focus:outline-none focus:border-emerald-500/50 transition-colors"
                      />
                    </div>
                  </div>
                  <button
                    onClick={handleAddSlide}
                    disabled={isSaving || !newSlide.imageUrl}
                    className="w-full mt-6 flex items-center justify-center gap-2 h-12 rounded-xl bg-emerald-500 disabled:bg-slate-700 disabled:text-slate-500 text-slate-950 font-black uppercase text-[10px] tracking-widest transition-all"
                  >
                    {isSaving ? <Loader2 className="animate-spin h-4 w-4" /> : <Save className="h-4 w-4" />}
                    Ajouter le visuel
                  </button>
                </div>
              )}

              {/* Vertical Card List (Android-First) */}
              <div className="grid gap-4">
                {settings.carousel_slides.length > 0 ? (
                  settings.carousel_slides.map((slide, idx) => (
                    <div
                      key={slide.id}
                      className={clsx(
                        "bg-slate-800/40 rounded-3xl p-4 flex flex-col md:flex-row gap-4 relative overflow-hidden transition-all group",
                        slide.isActive
                          ? "border border-slate-700/50 shadow-lg"
                          : "border border-dashed border-slate-700/50 opacity-60",
                        draggedIdx === idx ? "opacity-30 border-emerald-500/50" : "",
                      )}
                      draggable
                      onDragStart={() => handleDragStart(idx)}
                      onDragOver={(e) => handleDragOver(e, idx)}
                      onDrop={(e) => handleDrop(e, idx)}
                    >
                      {/* Drag Handle & Image */}
                      <div className="flex gap-4">
                        <div className="flex items-center justify-center text-slate-600 cursor-grab hover:text-slate-400 active:cursor-grabbing px-1">
                          <GripVertical className="w-5 h-5" />
                        </div>
                        <div className="relative w-full md:w-64 aspect-video bg-slate-900 rounded-2xl overflow-hidden border border-slate-800 shrink-0">
                          {slide.imageUrl ? (
                            <img
                              src={slide.imageUrl}
                              alt="Slide preview"
                              className="w-full h-full object-cover pointer-events-none"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <ImageIcon className="w-8 h-8 text-slate-700" />
                            </div>
                          )}
                          {!slide.isActive && (
                            <div className="absolute inset-0 bg-black/60 flex items-center justify-center backdrop-blur-sm text-[10px] font-black text-white uppercase tracking-widest">
                              Masqué
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Content & Actions */}
                      <div className="flex-1 flex flex-col justify-between py-2">
                        <div className="space-y-3">
                          <div className="flex flex-wrap items-center gap-3">
                            <span className="flex items-center gap-1.5 bg-slate-900/50 px-3 py-1.5 rounded-lg border border-slate-800 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                              <ImageIcon className="h-3 w-3 text-slate-500" /> Ordre: {slide.order}
                            </span>
                          </div>
                          {slide.link && (
                            <div className="flex items-center gap-2 text-xs font-bold text-emerald-400 break-all px-1">
                              <LinkIcon className="h-3.5 w-3.5 shrink-0 text-emerald-500/50" />
                              {slide.link}
                            </div>
                          )}
                        </div>

                        {/* Finger-friendly toggle buttons */}
                        <div className="flex items-center gap-3 mt-4 md:mt-0 pt-4 md:pt-0 border-t border-slate-700/50 md:border-0 md:justify-end">
                          <button
                            onClick={() => toggleSlideStatus(slide.id)}
                            className={clsx(
                              "flex-1 md:flex-none flex items-center justify-center gap-2 h-10 px-5 rounded-xl border font-bold uppercase text-[9px] tracking-widest transition-colors",
                              slide.isActive
                                ? "bg-slate-800 border-slate-700 text-slate-400 hover:text-white"
                                : "bg-emerald-500/10 border-emerald-500/20 text-emerald-500 hover:bg-emerald-500 hover:text-slate-950",
                            )}
                          >
                            {slide.isActive ? (
                              <><EyeOff className="w-3.5 h-3.5" /> Masquer</>
                            ) : (
                              <><Eye className="w-3.5 h-3.5" /> Activer</>
                            )}
                          </button>
                          <button
                            onClick={() => deleteSlide(slide.id)}
                            className="md:flex-none flex items-center justify-center h-10 w-10 md:w-auto md:px-5 rounded-xl bg-red-500/10 text-red-500 border border-red-500/20 hover:bg-red-500 hover:text-white transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                            <span className="hidden md:inline text-[9px] font-bold uppercase tracking-widest ml-2">
                              Supprimer
                            </span>
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="bg-slate-800/20 border-2 border-dashed border-slate-800 rounded-3xl p-12 text-center flex flex-col items-center">
                    <ImageIcon className="h-12 w-12 text-slate-600 mb-4" />
                    <p className="text-xs font-black uppercase tracking-widest text-slate-500">
                      Aucun slide configuré
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === "seo" && (
            <div className="bg-slate-800/20 border border-dashed border-slate-700/50 rounded-3xl p-12 flex flex-col items-center justify-center text-center mt-2">
              <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mb-5">
                <Search className="w-8 h-8 text-emerald-400" />
              </div>
              <h3 className="text-white font-black mb-3 uppercase tracking-widest text-lg">
                Métadonnées SEO
              </h3>
              <p className="text-xs leading-relaxed text-slate-400 max-w-lg font-medium uppercase tracking-wider">
                Les configurations avancées d'indexation (Balises meta, Open Graph, Twitter Cards) seront bientôt disponibles dans cette section.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
