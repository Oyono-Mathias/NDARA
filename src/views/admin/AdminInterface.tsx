import React, { useState } from 'react';
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
  GripVertical
} from 'lucide-react';
import clsx from 'clsx';

// Simulated local interface data for UI demonstration
interface CarouselSlide {
  id: string;
  imageUrl: string;
  link?: string;
  order: number;
  isActive: boolean;
}

export function AdminInterface() {
  const [activeTab, setActiveTab] = useState('carousel');
  const [isAdding, setIsAdding] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [newSlide, setNewSlide] = useState({ imageUrl: '', link: '', order: 0 });

  const [slides, setSlides] = useState<CarouselSlide[]>([
    { id: '1', imageUrl: 'https://images.unsplash.com/photo-1616469829581-73993eb86b02?q=80&w=1200&auto=format&fit=crop', link: '/promo', order: 1, isActive: true },
    { id: '2', imageUrl: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?q=80&w=1200&auto=format&fit=crop', link: '/catalogue', order: 2, isActive: false },
  ]);

  const handleAddSlide = () => {
    setIsSaving(true);
    setTimeout(() => {
      setSlides([...slides, { ...newSlide, id: Date.now().toString(), isActive: true }]);
      setNewSlide({ imageUrl: '', link: '', order: slides.length + 1 });
      setIsAdding(false);
      setIsSaving(false);
    }, 800);
  };

  const toggleSlideStatus = (id: string) => {
    setSlides(slides.map(s => s.id === id ? { ...s, isActive: !s.isActive } : s));
  };

  const deleteSlide = (id: string) => {
    setSlides(slides.filter(s => s.id !== id));
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700 pb-24 relative font-sans">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[400px] bg-pink-500/5 blur-[100px] pointer-events-none" />

      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-5 relative z-10">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-pink-500 mb-1">
            <LayoutTemplate className="h-4 w-4" />
            <span className="text-[10px] font-black uppercase tracking-[0.3em]">Visuel & SEO</span>
          </div>
          <h1 className="text-3xl font-black text-white uppercase tracking-tight">Interface globale</h1>
          <p className="text-slate-400 text-sm font-medium">Gérez le carrousel d'accueil publicitaire et le référencement.</p>
        </div>
      </header>

      {/* Tabs */}
      <div className="w-full relative z-10 flex flex-col gap-6">
        <div className="flex overflow-x-auto hide-scrollbar bg-slate-900/50 border border-slate-800 p-1.5 rounded-2xl w-full lg:w-fit shadow-2xl">
            <button 
              onClick={() => setActiveTab('carousel')}
              className={clsx(
                "flex items-center justify-center gap-2 px-6 py-3 font-bold uppercase text-[10px] tracking-widest rounded-xl transition-all whitespace-nowrap",
                activeTab === 'carousel' ? "bg-slate-800 text-white shadow-sm" : "text-slate-500 hover:text-slate-300"
              )}
            >
                <ImageIcon className="h-4 w-4" /> Carrousel Accueil
            </button>
            <button 
              onClick={() => setActiveTab('seo')}
              className={clsx(
                "flex items-center justify-center gap-2 px-6 py-3 font-bold uppercase text-[10px] tracking-widest rounded-xl transition-all whitespace-nowrap",
                activeTab === 'seo' ? "bg-slate-800 text-pink-400 shadow-sm" : "text-pink-500/50 hover:text-pink-400/80"
              )}
            >
                <Search className="h-4 w-4" /> Référencement (SEO)
            </button>
        </div>

        {/* Content Panels */}
        <div>
          {activeTab === 'carousel' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center bg-slate-800/20 p-4 rounded-3xl border border-slate-700/50">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-2">Visuels en ligne : {slides.length}</span>
                <button 
                  onClick={() => setIsAdding(!isAdding)} 
                  className={clsx(
                    "flex items-center justify-center gap-2 h-10 px-5 rounded-xl font-bold uppercase text-[9px] tracking-widest transition-all shadow-xl",
                    isAdding ? "bg-slate-700 text-white" : "bg-pink-500 hover:bg-pink-400 text-slate-950"
                  )}
                >
                  {isAdding ? "Annuler" : <><Plus className="h-4 w-4" /> Nouveau</>}
                </button>
              </div>

              {isAdding && (
                <div className="bg-slate-800/40 border border-pink-500/20 rounded-3xl p-6 animate-in slide-in-from-top-4 duration-500">
                  <h3 className="text-sm font-black text-white uppercase tracking-widest mb-4 flex items-center gap-2">
                    <Plus className="w-4 h-4 text-pink-500" /> Ajouter un Slide
                  </h3>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">URL de l'image (1200x400 conseillé)</label>
                      <input 
                        type="text"
                        placeholder="https://..." 
                        value={newSlide.imageUrl} 
                        onChange={e => setNewSlide({...newSlide, imageUrl: e.target.value})}
                        className="w-full bg-slate-900 border border-slate-700/50 rounded-xl py-3 px-4 text-white text-sm focus:outline-none focus:border-pink-500/50 transition-colors"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Lien de redirection (Optionnel)</label>
                      <input 
                        type="text"
                        placeholder="/formations ou https://..." 
                        value={newSlide.link} 
                        onChange={e => setNewSlide({...newSlide, link: e.target.value})}
                        className="w-full bg-slate-900 border border-slate-700/50 rounded-xl py-3 px-4 text-white text-sm focus:outline-none focus:border-pink-500/50 transition-colors"
                      />
                    </div>
                    <button 
                      onClick={handleAddSlide} 
                      disabled={isSaving || !newSlide.imageUrl}
                      className="w-full flex items-center justify-center gap-2 h-12 rounded-xl bg-pink-500 disabled:bg-slate-700 disabled:text-slate-500 text-slate-950 font-black uppercase text-[10px] tracking-widest transition-all mt-4"
                    >
                      {isSaving ? <Loader2 className="animate-spin h-4 w-4"/> : <Save className="h-4 w-4"/>}
                      Enregistrer le slide
                    </button>
                  </div>
                </div>
              )}

              {/* Vertical Card List (Android-First) */}
              <div className="space-y-4">
                {slides.length > 0 ? (
                  slides.map((slide) => (
                    <div key={slide.id} className={clsx(
                      "bg-slate-800/40 border rounded-3xl p-4 flex flex-col md:flex-row gap-4 relative overflow-hidden transition-all group",
                      slide.isActive ? "border-slate-700/50" : "border-dashed border-slate-700/50 opacity-60"
                    )}>
                      {/* Drag Handle & Image */}
                      <div className="flex gap-3">
                        <div className="flex items-center justify-center text-slate-600 cursor-grab active:cursor-grabbing">
                          <GripVertical className="w-5 h-5" />
                        </div>
                        <div className="relative w-full md:w-64 aspect-video bg-slate-900 rounded-2xl overflow-hidden border border-slate-800 shrink-0">
                          {slide.imageUrl ? (
                            <img src={slide.imageUrl} alt="Slide preview" className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center"><ImageIcon className="w-8 h-8 text-slate-700" /></div>
                          )}
                          {!slide.isActive && (
                            <div className="absolute inset-0 bg-black/60 flex items-center justify-center backdrop-blur-sm text-[10px] font-black text-white uppercase tracking-widest">
                              Masqué
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Content & Actions */}
                      <div className="flex-1 flex flex-col justify-between py-1">
                        <div className="space-y-3">
                          <div className="flex items-center gap-2 bg-slate-900/50 w-fit px-3 py-1.5 rounded-lg border border-slate-800">
                            <ImageIcon className="h-3 w-3 text-slate-500" />
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Ordre: {slide.order}</span>
                          </div>
                          {slide.link && (
                            <div className="flex flex-wrap items-center gap-2 text-xs font-bold text-pink-400 break-all">
                              <LinkIcon className="h-3.5 w-3.5 shrink-0" /> {slide.link}
                            </div>
                          )}
                        </div>

                        {/* Finger-friendly toggle buttons */}
                        <div className="flex items-center gap-2 mt-4 md:mt-0 pt-4 md:pt-0 border-t border-slate-700/50 md:border-0 md:justify-end">
                           <button 
                              onClick={() => toggleSlideStatus(slide.id)}
                              className={clsx(
                                "flex-1 md:flex-none flex items-center justify-center gap-2 h-10 px-4 rounded-xl border font-bold uppercase text-[9px] tracking-widest transition-colors",
                                slide.isActive 
                                  ? "bg-slate-800 border-slate-700 text-slate-400 hover:text-white" 
                                  : "bg-emerald-500/10 border-emerald-500/20 text-emerald-500 hover:bg-emerald-500 hover:text-slate-950"
                              )}
                           >
                             {slide.isActive ? <><EyeOff className="w-3.5 h-3.5" /> Masquer</> : <><Eye className="w-3.5 h-3.5" /> Activer</>}
                           </button>
                           <button 
                              onClick={() => deleteSlide(slide.id)}
                              className="md:flex-none flex items-center justify-center h-10 w-10 md:w-auto md:px-4 rounded-xl bg-red-500/10 text-red-500 border border-red-500/20 hover:bg-red-500 hover:text-white transition-colors"
                           >
                             <Trash2 className="w-4 h-4" />
                             <span className="hidden md:inline text-[9px] font-bold uppercase tracking-widest ml-2">Supprimer</span>
                           </button>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="bg-slate-800/20 border-2 border-dashed border-slate-800 rounded-3xl p-12 text-center flex flex-col items-center">
                    <ImageIcon className="h-12 w-12 text-slate-600 mb-4" />
                    <p className="text-xs font-black uppercase tracking-widest text-slate-500">Aucun slide configuré</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'seo' && (
             <div className="bg-slate-800/30 border border-dashed border-slate-700/50 rounded-3xl p-10 flex flex-col items-center justify-center text-center mt-2 h-64">
                 <div className="w-16 h-16 rounded-2xl bg-pink-500/10 border border-pink-500/20 flex items-center justify-center mb-4">
                   <Search className="w-8 h-8 text-pink-400" />
                 </div>
                 <h3 className="text-white font-black mb-2 uppercase tracking-widest text-lg">Métadonnées SEO</h3>
                 <p className="text-sm text-slate-400 max-w-md font-medium">Les paramètres SEO globaux sont configurés au niveau du serveur. Ajustements granulaires bientôt disponibles.</p>
              </div>
          )}
        </div>
      </div>
    </div>
  );
}
