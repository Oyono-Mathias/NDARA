import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useCourse } from '../../hooks/catalog/useCatalogClient';
import { TouchArea } from '../../components/ui/TouchArea';
import { Loader2, ArrowLeft, Heart, Share2, PlayCircle, Star, BookOpen, Clock, CheckCircle2, Award, Play } from 'lucide-react';
import { ChaptersService, LessonsService } from '../../services/db';
import { Chapter, Lesson } from '../../types/models';
import { where, orderBy } from 'firebase/firestore';

export function CourseDetailView() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { course, loading, isEnrolled, isFavorite, toggleFavorite, enroll } = useCourse(slug || '');

  const [chapters, setChapters] = React.useState<Chapter[]>([]);
  const [lessons, setLessons] = React.useState<Lesson[]>([]);

  React.useEffect(() => {
    if (!course) return;
    const unsubC = ChaptersService.subscribe([where('courseId', '==', course.id), orderBy('order', 'asc')], (data) => setChapters(data));
    const unsubL = LessonsService.subscribe([where('courseId', '==', course.id), orderBy('order', 'asc')], (data) => setLessons(data));
    return () => { unsubC(); unsubL(); };
  }, [course]);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-emerald-500" /></div>;
  }

  if (!course) {
    return <div className="min-h-screen flex items-center justify-center text-slate-500">Formation introuvable.</div>;
  }

  const handleEnrollOrContinue = async () => {
    if (isEnrolled) {
      navigate(`/student/courses/${course.slug}`);
    } else {
      if (course.isFree) {
        await enroll();
        navigate(`/student/courses/${course.slug}`);
      } else {
        navigate(`/student/checkout/${course.slug}`);
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#0B0F19] text-white pb-24">
      {/* Banner / Video Preview */}
      <div className="relative aspect-video max-h-[50vh] w-full bg-slate-900 overflow-hidden">
        {course.banner || course.thumbnail ? (
          <img src={course.banner || course.thumbnail} alt={course.title} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center"><BookOpen className="w-24 h-24 text-slate-700" /></div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0B0F19] via-[#0B0F19]/60 to-transparent"></div>
        
        {/* Top bar over banner */}
        <div className="absolute top-0 left-0 right-0 p-4 flex justify-between items-center z-10">
          <TouchArea as="button" onClick={() => navigate(-1)} className="w-10 h-10 bg-black/50 backdrop-blur-md rounded-full flex items-center justify-center text-white border border-white/10">
            <ArrowLeft className="w-5 h-5" />
          </TouchArea>
          <div className="flex gap-2">
            <TouchArea as="button" className="w-10 h-10 bg-black/50 backdrop-blur-md rounded-full flex items-center justify-center text-white border border-white/10">
              <Share2 className="w-5 h-5" />
            </TouchArea>
            <TouchArea as="button" onClick={toggleFavorite} className="w-10 h-10 bg-black/50 backdrop-blur-md rounded-full flex items-center justify-center text-white border border-white/10">
              <Heart className={`w-5 h-5 ${isFavorite ? 'fill-rose-500 text-rose-500' : ''}`} />
            </TouchArea>
          </div>
        </div>

        {/* Floating Play Button for Trailer */}
        {course.videoUrl && (
          <button className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 bg-emerald-500 rounded-full flex items-center justify-center text-slate-950 shadow-[0_0_30px_rgba(16,185,129,0.5)] hover:scale-110 transition-transform">
            <Play className="w-8 h-8 ml-1" />
          </button>
        )}
      </div>

      <div className="max-w-4xl mx-auto px-4 -mt-16 relative z-10 space-y-8">
        {/* Main Info Card */}
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-6 md:p-8 rounded-3xl shadow-2xl">
          <div className="flex gap-2 mb-4">
            <span className="px-3 py-1 bg-emerald-500/10 text-emerald-500 text-[10px] font-black uppercase tracking-widest rounded-lg border border-emerald-500/20">
              {course.level}
            </span>
            <span className="px-3 py-1 bg-blue-500/10 text-blue-500 text-[10px] font-black uppercase tracking-widest rounded-lg border border-blue-500/20">
              {Math.round(course.totalDuration / 3600)} Heures
            </span>
          </div>

          <h1 className="text-2xl md:text-4xl font-bold text-white mb-4 leading-tight">{course.title}</h1>
          <p className="text-slate-400 text-sm md:text-base mb-8 leading-relaxed">{course.fullDescription || course.shortDescription}</p>

          <div className="flex flex-wrap items-center gap-6 py-6 border-t border-b border-white/5 mb-8">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-amber-500/10 rounded-full flex items-center justify-center">
                <Star className="w-5 h-5 text-amber-500 fill-amber-500" />
              </div>
              <div>
                <p className="text-sm font-bold text-white">{course.rating}</p>
                <p className="text-[10px] text-slate-400 uppercase tracking-widest">{course.reviewCount} Avis</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-emerald-500/10 rounded-full flex items-center justify-center">
                <PlayCircle className="w-5 h-5 text-emerald-500" />
              </div>
              <div>
                <p className="text-sm font-bold text-white">{course.totalLessons}</p>
                <p className="text-[10px] text-slate-400 uppercase tracking-widest">Leçons</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-500/10 rounded-full flex items-center justify-center">
                <Award className="w-5 h-5 text-blue-500" />
              </div>
              <div>
                <p className="text-sm font-bold text-white">Certificat</p>
                <p className="text-[10px] text-slate-400 uppercase tracking-widest">Inclus</p>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="text-2xl font-black text-white tracking-wider">
              {course.isFree ? 'GRATUIT' : `${course.price} FCFA`}
            </div>
            <TouchArea as="button" onClick={handleEnrollOrContinue} className="px-8 py-4 bg-emerald-500 text-slate-950 font-black uppercase tracking-widest text-sm rounded-xl hover:bg-emerald-400 transition-colors shadow-[0_0_20px_rgba(16,185,129,0.3)]">
              {isEnrolled ? 'Continuer' : (course.isFree ? 'S\'inscrire' : 'Acheter')}
            </TouchArea>
          </div>
        </div>

        {/* Curriculum Preview */}
        <div className="space-y-4">
          <h2 className="text-lg font-black uppercase tracking-widest text-white mb-6">Programme de la formation</h2>
          
          <div className="bg-white/5 border border-white/10 rounded-3xl overflow-hidden divide-y divide-white/5">
            {chapters.map((chapter, index) => {
              const chapterLessons = lessons.filter(l => l.chapterId === chapter.id);
              return (
                <div key={chapter.id} className="p-6 hover:bg-white/5 transition-colors">
                  <div className="flex items-start gap-4 mb-4">
                    <div className="w-8 h-8 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center font-bold shrink-0">
                      {index + 1}
                    </div>
                    <div>
                      <h3 className="font-bold text-white text-lg">{chapter.title}</h3>
                      {chapter.description && <p className="text-slate-400 text-sm mt-1">{chapter.description}</p>}
                    </div>
                  </div>
                  
                  <div className="pl-12 space-y-3">
                    {chapterLessons.map(lesson => (
                      <div key={lesson.id} className="flex items-center justify-between bg-slate-900/50 p-3 rounded-xl border border-white/5">
                        <div className="flex items-center gap-3">
                          <PlayCircle className="w-4 h-4 text-slate-500" />
                          <span className="text-sm font-medium text-slate-300">{lesson.title}</span>
                        </div>
                        {lesson.isFreePreview && (
                          <span className="px-2 py-1 bg-emerald-500/10 text-emerald-500 text-[10px] font-bold uppercase tracking-wider rounded">Aperçu</span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
            
            {chapters.length === 0 && (
              <div className="p-8 text-center text-slate-500">Programme en cours de création.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
