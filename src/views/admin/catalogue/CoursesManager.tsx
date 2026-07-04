import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCoursesAdmin } from '../../../hooks/catalog/useCatalogAdmin';
import { TouchArea } from '../../../components/ui/TouchArea';
import { Loader2, Plus, Edit2, Trash2, BookOpen, Star, MoreVertical } from 'lucide-react';
import { Course } from '../../../types/models';

export function CoursesManager() {
  const navigate = useNavigate();
  const { courses, loading, deleteCourse } = useCoursesAdmin();
  const [search, setSearch] = useState('');

  if (loading) {
    return <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-emerald-500" /></div>;
  }

  const activeCourses = courses.filter(c => c.status !== 'archived');
  
  const filteredCourses = activeCourses.filter(c => 
    c.title.toLowerCase().includes(search.toLowerCase()) || 
    c.slug.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex-1 max-w-md">
          <input 
            type="text" 
            placeholder="Rechercher une formation..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white focus:border-emerald-500 outline-none"
          />
        </div>
        <TouchArea as="button" onClick={() => navigate('/admin/catalog/courses/new/builder')} className="ml-4 px-4 py-2 bg-emerald-500 text-slate-950 font-bold uppercase tracking-widest text-xs rounded-xl flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Nouvelle Formation
        </TouchArea>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCourses.map(course => (
          <div key={course.id} className="bg-white/[0.02] border border-white/5 rounded-3xl overflow-hidden flex flex-col group hover:border-white/10 transition-colors">
            <div className="aspect-video bg-slate-900 relative">
              {course.thumbnail ? (
                <img src={course.thumbnail} alt={course.title} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-slate-700">
                  <BookOpen className="w-12 h-12" />
                </div>
              )}
              <div className="absolute top-2 right-2 flex gap-2">
                <span className={`px-2 py-1 text-[10px] font-black uppercase tracking-wider rounded-full shadow-lg ${
                  course.status === 'published' ? 'bg-emerald-500 text-slate-950' : 'bg-amber-500 text-slate-950'
                }`}>
                  {course.status === 'published' ? 'Publié' : 'Brouillon'}
                </span>
                <span className={`px-2 py-1 text-[10px] font-black uppercase tracking-wider rounded-full shadow-lg bg-white/90 text-slate-900`}>
                  {course.isFree ? 'Gratuit' : `${course.price} FCFA`}
                </span>
              </div>
            </div>
            
            <div className="p-5 flex-1 flex flex-col">
              <h3 className="font-bold text-white text-lg mb-2 line-clamp-2">{course.title}</h3>
              <p className="text-xs text-slate-400 mb-4 line-clamp-2 flex-1">{course.shortDescription || 'Aucune description'}</p>
              
              <div className="flex items-center justify-between pt-4 border-t border-white/5">
                <div className="flex gap-4 text-xs font-bold text-slate-500">
                  <span>{course.totalLessons} leçons</span>
                  <span>{Math.round(course.totalDuration / 3600)}h</span>
                </div>
                
                <div className="flex gap-2">
                  <button onClick={() => navigate(`/admin/catalog/courses/${course.id}/builder`)} className="p-2 bg-white/5 rounded-lg text-slate-300 hover:text-white hover:bg-emerald-500/20 hover:text-emerald-500 transition-colors">
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button onClick={() => deleteCourse(course.id)} className="p-2 bg-white/5 rounded-lg text-slate-300 hover:text-white hover:bg-rose-500/20 hover:text-rose-500 transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
        
        {filteredCourses.length === 0 && (
          <div className="col-span-full py-12 text-center text-slate-500">
            Aucune formation trouvée.
          </div>
        )}
      </div>
    </div>
  );
}
