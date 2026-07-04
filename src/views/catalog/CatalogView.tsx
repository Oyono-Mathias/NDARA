import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useCatalog } from '../../hooks/catalog/useCatalogClient';
import { Search, Filter, BookOpen, Star, PlayCircle, Loader2 } from 'lucide-react';
import { CatalogSkeleton } from '../../components/catalog/CatalogSkeleton';

export function CatalogView() {
  const { courses, categories, loading } = useCatalog();
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  if (loading) {
    return <CatalogSkeleton />;
  }

  const filteredCourses = courses.filter(course => {
    const matchesSearch = course.title.toLowerCase().includes(search.toLowerCase()) || 
                          course.shortDescription?.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = activeCategory ? course.categoryId === activeCategory : true;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-8 pb-24">
      {/* Header & Search */}
      <div className="bg-gradient-to-b from-emerald-500/10 to-transparent p-6 rounded-3xl space-y-6">
        <div>
          <h1 className="text-2xl font-black uppercase tracking-widest text-white mb-2">Catalogue</h1>
          <p className="text-slate-400 text-sm">Découvrez toutes nos formations</p>
        </div>

        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
          <input 
            type="text" 
            placeholder="Rechercher une formation..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-900 border border-white/10 rounded-2xl pl-12 pr-4 py-4 text-white focus:border-emerald-500 outline-none shadow-xl"
          />
        </div>
      </div>

      {/* Categories Horizontal Scroll */}
      <div className="flex gap-3 overflow-x-auto hide-scrollbar px-2">
        <button 
          onClick={() => setActiveCategory(null)}
          className={`shrink-0 px-6 py-2.5 rounded-full text-xs font-bold uppercase tracking-widest transition-all ${
            activeCategory === null 
              ? 'bg-emerald-500 text-slate-950 shadow-[0_0_15px_rgba(16,185,129,0.3)]' 
              : 'bg-white/5 text-slate-400 hover:text-white hover:bg-white/10'
          }`}
        >
          Tout
        </button>
        {categories.map(cat => (
          <button 
            key={cat.id}
            onClick={() => setActiveCategory(cat.id)}
            className={`shrink-0 px-6 py-2.5 rounded-full text-xs font-bold uppercase tracking-widest transition-all ${
              activeCategory === cat.id 
                ? 'bg-emerald-500 text-slate-950 shadow-[0_0_15px_rgba(16,185,129,0.3)]' 
                : 'bg-white/5 text-slate-400 hover:text-white hover:bg-white/10'
            }`}
          >
            {cat.name}
          </button>
        ))}
      </div>

      {/* Courses Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCourses.map(course => (
          <Link key={course.id} to={`/student/catalog/${course.slug}`} className="group block">
            <div className="bg-white/[0.02] border border-white/5 rounded-3xl overflow-hidden hover:border-emerald-500/30 transition-all duration-300 hover:shadow-[0_0_30px_rgba(16,185,129,0.1)]">
              {/* Thumbnail */}
              <div className="aspect-video bg-slate-900 relative overflow-hidden">
                {course.thumbnail ? (
                  <img src={course.thumbnail} alt={course.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-700">
                    <BookOpen className="w-12 h-12" />
                  </div>
                )}
                
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent opacity-80"></div>
                
                <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between">
                  <div className="flex gap-2">
                    <span className="px-2.5 py-1 bg-black/50 backdrop-blur-md text-white text-[10px] font-bold uppercase tracking-widest rounded-lg border border-white/10">
                      {categories.find(c => c.id === course.categoryId)?.name || 'Général'}
                    </span>
                    <span className="px-2.5 py-1 bg-emerald-500/20 backdrop-blur-md text-emerald-400 text-[10px] font-bold uppercase tracking-widest rounded-lg border border-emerald-500/20">
                      {course.level === 'beginner' ? 'Débutant' : course.level === 'intermediate' ? 'Intermédiaire' : course.level === 'advanced' ? 'Avancé' : 'Tous niveaux'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="p-6">
                <h3 className="font-bold text-white text-lg mb-2 line-clamp-2 group-hover:text-emerald-400 transition-colors">
                  {course.title}
                </h3>
                <p className="text-slate-400 text-sm mb-6 line-clamp-2">
                  {course.shortDescription}
                </p>

                <div className="flex items-center justify-between pt-4 border-t border-white/5">
                  <div className="flex items-center gap-4 text-xs font-bold text-slate-500 uppercase tracking-wider">
                    <span className="flex items-center gap-1.5"><PlayCircle className="w-4 h-4" /> {course.totalLessons} leçons</span>
                    <span className="flex items-center gap-1.5"><Star className="w-4 h-4 text-amber-500" /> {course.rating}</span>
                  </div>
                  <div className="text-emerald-400 font-black tracking-wider">
                    {course.isFree ? 'GRATUIT' : `${course.price} FCFA`}
                  </div>
                </div>
              </div>
            </div>
          </Link>
        ))}

        {filteredCourses.length === 0 && (
          <div className="col-span-full py-12 text-center">
            <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-500">
              <Search className="w-8 h-8" />
            </div>
            <p className="text-slate-400 font-medium">Aucune formation ne correspond à votre recherche.</p>
          </div>
        )}
      </div>
    </div>
  );
}
