import { useState, useEffect, FormEvent } from 'react';

export function CourseForm({ mode, initialData, onSubmit }: any) {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [price, setPrice] = useState(0);
    const [slug, setSlug] = useState('');
    const [thumbnailStr, setThumbnailStr] = useState('');

    useEffect(() => {
        if (initialData) {
            setTitle(initialData.title || '');
            setDescription(initialData.description || '');
            setPrice(initialData.price || 0);
            setSlug(initialData.slug || '');
            setThumbnailStr(initialData.thumbnail || '');
        }
    }, [initialData]);

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        
        let finalSlug = slug;
        if (!finalSlug && title) {
            finalSlug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
        }

        onSubmit({
            title,
            description,
            price: Number(price),
            slug: finalSlug,
            thumbnail: thumbnailStr,
            updatedAt: new Date().toISOString()
        });
    };

    return (
        <form onSubmit={handleSubmit} className="p-6 bg-slate-900 border border-white/5 rounded-2xl text-white space-y-6">
            <h2 className="font-bold text-xl font-serif">
                {mode === 'create' ? 'Créer une nouvelle formation' : 'Informations Générales de la formation'}
            </h2>
            
            <div className="space-y-4">
                <div>
                    <label className="block text-xs font-bold uppercase tracking-widest text-slate-400 mb-2">Titre du cours</label>
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
                    <label className="block text-xs font-bold uppercase tracking-widest text-slate-400 mb-2">Description</label>
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
                        <label className="block text-xs font-bold uppercase tracking-widest text-slate-400 mb-2">Prix (XAF)</label>
                        <input 
                            type="number"
                            min="0"
                            value={price}
                            onChange={(e) => setPrice(Number(e.target.value))}
                            className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-primary outline-none transition-colors"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-bold uppercase tracking-widest text-slate-400 mb-2">URL simplifiée (Slug)</label>
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
                    <label className="block text-xs font-bold uppercase tracking-widest text-slate-400 mb-2">URL de l'image de couverture</label>
                    <input 
                        type="url"
                        value={thumbnailStr}
                        onChange={(e) => setThumbnailStr(e.target.value)}
                        className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-primary outline-none transition-colors"
                        placeholder="https://images.unsplash.com/..."
                    />
                </div>
            </div>

            <button type="submit" className="w-full bg-primary hover:bg-primary/90 text-black font-black uppercase tracking-widest text-xs py-4 rounded-xl transition-colors mt-8">
                {mode === 'create' ? 'Créer le brouillon' : 'Enregistrer les modifications'}
            </button>
        </form>
    );
}
