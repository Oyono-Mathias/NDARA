import React, { useState, useEffect } from 'react';
import { formatImageUrl } from '../../lib/utils';
import { collection, query, where, orderBy, onSnapshot, doc, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore';
import { db } from '../../firebase';
import { Link } from 'react-router-dom';
import { BookOpen, ShoppingCart, LayoutGrid, TrendingUp, Plus, FileText, CheckCircle, Clock, XCircle, Loader2, Users, Settings2, X } from 'lucide-react';
import clsx from 'clsx';
import { NdaraSkeleton, EmptyState } from './AdminSupport';

export function AdminCourses() {
  const [pendingCount, setPendingCount] = useState(0);
  const [activeTab, setActiveTab] = useState('all');
  const [courses, setCourses] = useState<any[]>([]);
  const [squads, setSquads] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [selectedCourse, setSelectedCourse] = useState<any | null>(null);

  useEffect(() => {
    let unsubPending = () => {};
    try {
      const qPending = query(collection(db, 'courses'), where('status', '==', 'Pending Review'));
      unsubPending = onSnapshot(qPending, (snap) => setPendingCount(snap.size));
    } catch (e) {
      console.error(e);
    }

    let unsubCourses = () => {};
    try {
      const qCourses = query(collection(db, 'courses'), orderBy('createdAt', 'desc'));
      unsubCourses = onSnapshot(qCourses, (snap) => {
        const courseData: any[] = [];
        snap.forEach(doc => courseData.push({ id: doc.id, ...doc.data() }));
        setCourses(courseData);
        setIsLoading(false);
      }, (err) => {
        console.error("Erreur récupération cours:", err);
        setIsLoading(false);
      });
    } catch (e) {
      console.error(e);
      setIsLoading(false);
    }
    
    let unsubSquads = () => {};
    try {
      const qSquads = query(collection(db, 'squads'), orderBy('createdAt', 'desc'));
      unsubSquads = onSnapshot(qSquads, (snap) => {
        const squadData: any[] = [];
        snap.forEach(doc => squadData.push({ id: doc.id, ...doc.data() }));
        setSquads(squadData);
      }, (err) => {
        console.error("Erreur squads:", err);
      });
    } catch(e) {
      console.error(e);
    }

    return () => {
      unsubPending();
      unsubCourses();
      unsubSquads();
    };
  }, []);

  const handleUpdateStatus = async (courseId: string, newStatus: string) => {
    try {
      await updateDoc(doc(db, 'courses', courseId), { status: newStatus });
    } catch (error) {
      console.error("Error updating course status:", error);
    }
  };

  const handleAssignSquad = async (courseId: string, squadId: string, isAssigned: boolean) => {
    try {
      const courseRef = doc(db, 'courses', courseId);
      if (isAssigned) {
        await updateDoc(courseRef, {
          assignedSquads: arrayRemove(squadId)
        });
      } else {
        await updateDoc(courseRef, {
          assignedSquads: arrayUnion(squadId)
        });
      }
    } catch (error) {
      console.error("Error updating course squads:", error);
    }
  };

  const getFilteredCourses = () => {
    let filtered = courses;
    if (activeTab === 'resale') {
      filtered = courses.filter(c => c.isResaleActive === true);
    }
    if (activeTab === 'buyouts') {
      filtered = courses.filter(c => c.buybackRequested === true);
    }
    return filtered;
  };

  const filteredCourses = getFilteredCourses();

  if (isLoading) {
    return (
      <div className="space-y-8 animate-in fade-in duration-700 pb-20 relative font-sans">
        <div className="space-y-2 relative z-10">
          <div className="h-8 w-64 bg-slate-800 rounded-lg animate-pulse"></div>
          <div className="h-4 w-96 bg-slate-800/80 rounded animate-pulse"></div>
        </div>
        <div className="flex gap-4 mb-6 relative z-10">
           <div className="h-12 w-32 bg-slate-800/50 rounded-2xl animate-pulse"></div>
           <div className="h-12 w-48 bg-slate-800/50 rounded-2xl animate-pulse"></div>
        </div>
        <div className="relative z-10">
           <NdaraSkeleton type="table" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-700 pb-20 relative font-sans">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[400px] bg-emerald-500/5 blur-[100px] pointer-events-none" />

      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-5 relative z-10">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-emerald-500 mb-1">
            <BookOpen className="h-4 w-4" />
            <span className="text-[10px] font-black uppercase tracking-[0.3em]">Gestion du Savoir</span>
          </div>
          <h1 className="text-3xl font-black text-white uppercase tracking-tight">Catalogue & Modération</h1>
          <p className="text-slate-400 text-sm font-medium">Supervisez l'offre pédagogique et assignez les groupes.</p>
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
            {pendingCount > 0 && (
                <div className="bg-amber-500/20 text-amber-500 text-[10px] font-black px-4 py-2 rounded-xl border border-amber-500/30 flex items-center gap-2 animate-pulse shadow-lg shadow-amber-500/10 shrink-0">
                    <div className="w-2 h-2 rounded-full bg-amber-500 shadow-[0_0_8px_#f59e0b]" />
                    {pendingCount} À MODÉRER
                </div>
            )}
            <Link 
              to="/instructor/courses/create"
              className="flex items-center justify-center gap-2 h-12 px-6 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold uppercase text-[10px] tracking-widest transition-all shadow-xl shadow-emerald-500/10"
            >
                <Plus className="h-4 w-4" /> Nouveau Cours
            </Link>
        </div>
      </header>

      {/* Tabs */}
      <div className="w-full relative z-10 flex flex-col gap-6">
        <div className="flex overflow-x-auto hide-scrollbar bg-slate-900/50 border border-slate-800 p-1.5 rounded-2xl w-full lg:w-fit shadow-2xl">
            <button 
              onClick={() => setActiveTab('all')}
              className={clsx(
                "flex items-center justify-center gap-2 px-6 py-3 font-bold uppercase text-[10px] tracking-widest rounded-xl transition-all whitespace-nowrap",
                activeTab === 'all' ? "bg-slate-800 text-white shadow-sm border border-slate-700/50" : "text-slate-500 hover:text-slate-300 hover:bg-slate-800/30"
              )}
            >
                <LayoutGrid className="h-4 w-4" /> Catalogue
            </button>
            <button 
              onClick={() => setActiveTab('resale')}
              className={clsx(
                "flex items-center justify-center gap-2 px-6 py-3 font-bold uppercase text-[10px] tracking-widest rounded-xl transition-all whitespace-nowrap",
                activeTab === 'resale' ? "bg-slate-800 text-blue-400 shadow-sm border border-slate-700/50" : "text-blue-500/50 hover:text-blue-400/80 hover:bg-slate-800/30"
              )}
            >
                <TrendingUp className="h-4 w-4" /> Marché Secondaire
            </button>
            <button 
              onClick={() => setActiveTab('buyouts')}
              className={clsx(
                "flex items-center justify-center gap-2 px-6 py-3 font-bold uppercase text-[10px] tracking-widest rounded-xl transition-all whitespace-nowrap",
                activeTab === 'buyouts' ? "bg-slate-800 text-emerald-400 shadow-sm border border-slate-700/50" : "text-emerald-500/50 hover:text-emerald-400/80 hover:bg-slate-800/30"
              )}
            >
                <ShoppingCart className="h-4 w-4" /> Rachats Ndara
            </button>
        </div>

        {/* Content Panels */}
        <div>
           {filteredCourses.length > 0 ? (
              <div className="bg-slate-800/30 border border-slate-700/50 rounded-3xl overflow-hidden shadow-2xl mt-2 relative">
                <div className="overflow-x-auto hide-scrollbar">
                  <table className="w-full text-left border-collapse min-w-[900px]">
                    <thead>
                      <tr className="border-b border-slate-800 bg-slate-900/50">
                        <th className="p-4 pl-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Formation</th>
                        <th className="p-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Instructeur</th>
                        <th className="p-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Groupes Assignés</th>
                        <th className="p-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Prix</th>
                        <th className="p-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Statut</th>
                        <th className="p-4 pr-6 text-right text-[10px] font-black text-slate-400 uppercase tracking-widest">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="text-sm divide-y divide-slate-800">
                      {filteredCourses.map((course) => {
                         const assignedSquads = course.assignedSquads || [];
                         return (
                        <tr key={course.id} className="hover:bg-slate-800/20 transition-colors group">
                          <td className="p-4 pl-6">
                             <div className="flex items-center gap-4">
                                {course.thumbnailUrl || course.thumbnail ? (
                                   <img src={formatImageUrl(course.thumbnailUrl || course.thumbnail)} alt="Cover" className="w-12 h-12 rounded-xl object-cover border border-slate-700" />
                                ) : (
                                  <div className="w-12 h-12 rounded-xl bg-slate-800/50 flex items-center justify-center shrink-0 border border-slate-700 group-hover:border-emerald-500/30 transition-colors">
                                    <FileText className="w-5 h-5 text-emerald-500" />
                                  </div>
                                )}
                                <div className="max-w-[200px] md:max-w-none">
                                  <p className="font-bold text-white line-clamp-1">{course.title || 'Cours sans titre'}</p>
                                  <div className="flex items-center gap-2 mt-1">
                                      <span className="text-[9px] font-bold text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20 uppercase tracking-widest whitespace-nowrap">
                                        {course.category || 'Général'}
                                      </span>
                                  </div>
                                </div>
                              </div>
                          </td>
                          <td className="p-4 text-slate-300 text-xs font-bold uppercase tracking-wider">{course.instructorName || 'Anonyme'}</td>
                          <td className="p-4 text-center">
                            <button 
                              onClick={() => setSelectedCourse(course)}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 transition-colors text-xs font-bold text-slate-300"
                            >
                               <Users className="w-3.5 h-3.5 text-blue-400" />
                               {assignedSquads.length} Groupes
                            </button>
                          </td>
                          <td className="p-4 text-white font-black whitespace-nowrap">{course.price ? `${course.price} XAF` : 'Gratuit'}</td>
                          <td className="p-4">
                             <span className={clsx(
                               "inline-flex items-center px-2 py-1 gap-1.5 rounded text-[9px] font-black uppercase tracking-widest border",
                               course.status === 'Published' ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" :
                               course.status === 'Pending Review' ? "bg-amber-500/10 text-amber-500 border-amber-500/20 animate-pulse" : 
                               course.status === 'Rejected' ? "bg-red-500/10 text-red-500 border-red-500/20" : "bg-slate-800 text-slate-400 border-slate-700"
                             )}>
                               {course.status === 'Published' && <CheckCircle className="w-3 h-3" />}
                               {course.status === 'Pending Review' && <Clock className="w-3 h-3" />}
                               {course.status === 'Rejected' && <XCircle className="w-3 h-3" />}
                               {course.status || 'Brouillon'}
                             </span>
                          </td>
                          <td className="p-4 pr-6 text-right">
                            <div className="flex justify-end gap-2 items-center">
                              {course.status === 'Pending Review' ? (
                                <>
                                  <button onClick={() => handleUpdateStatus(course.id, 'Published')} className="text-[9px] font-black uppercase tracking-widest bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500 hover:text-slate-950 px-3 py-1.5 rounded-lg border border-emerald-500/20 transition-all">
                                    Approuver
                                  </button>
                                  <button onClick={() => handleUpdateStatus(course.id, 'Rejected')} className="text-[9px] font-black uppercase tracking-widest bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white px-3 py-1.5 rounded-lg border border-red-500/20 transition-all">
                                    Rejeter
                                  </button>
                                </>
                              ) : (
                                <button 
                                  onClick={() => handleUpdateStatus(course.id, course.status === 'Published' ? 'Draft' : 'Published')} 
                                  className="text-[10px] font-bold uppercase tracking-widest text-slate-500 hover:text-emerald-400 transition-colors"
                                >
                                  {course.status === 'Published' ? 'Suspendre' : 'Publier'}
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      )})}
                    </tbody>
                  </table>
                </div>
              </div>
           ) : (
             <EmptyState 
                title="Catalogue vide" 
                message="Aucun cours n'est actuellement disponible ou assigné dans cette catégorie." 
                icon={BookOpen} 
             />
           )}
        </div>
      </div>

      {/* Squad Assignment Modal */}
      {selectedCourse && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-[#111827] border border-slate-800 rounded-3xl w-full max-w-2xl p-6 shadow-2xl relative animate-in zoom-in-95 duration-200 flex flex-col max-h-[85vh]">
            <div className="flex justify-between items-start mb-6 border-b border-slate-800 pb-4">
              <div>
                <h3 className="text-xl font-black text-white uppercase tracking-tight flex items-center gap-2">
                   <Settings2 className="w-6 h-6 text-emerald-500" />
                   Assignation de Groupes
                </h3>
                <p className="text-sm font-medium text-slate-400 mt-1 line-clamp-1">Gestion des accès pour : <span className="text-white font-bold">{selectedCourse.title}</span></p>
              </div>
              <button 
                onClick={() => setSelectedCourse(null)}
                className="text-slate-500 hover:text-white transition-colors p-2 bg-slate-800 rounded-xl hover:bg-slate-700 border border-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto pr-2 space-y-3 hide-scrollbar">
              {squads.length === 0 ? (
                <EmptyState title="Aucune promotion" message="Créez d'abord des Squads dans le menu Communautés pour les assigner aux cours." />
              ) : (
                squads.map(squad => {
                  const assignedSquads = selectedCourse.assignedSquads || [];
                  const isAssigned = assignedSquads.includes(squad.id);
                  
                  return (
                    <div key={squad.id} className={`flex items-center justify-between p-4 rounded-xl border transition-colors ${isAssigned ? 'bg-emerald-500/5 border-emerald-500/20' : 'bg-slate-800/30 border-slate-700/50 hover:bg-slate-800'}`}>
                       <div>
                         <div className="font-bold text-white text-sm">{squad.name}</div>
                         <div className="text-[10px] text-slate-500 font-mono mt-0.5">ID: {squad.id}</div>
                       </div>
                       
                       <button
                         onClick={() => handleAssignSquad(selectedCourse.id, squad.id, isAssigned)}
                         className={`px-4 py-2 rounded-lg font-black uppercase text-[10px] tracking-widest transition-all ${
                           isAssigned 
                             ? 'bg-rose-500/10 text-rose-500 hover:bg-rose-500 hover:text-white border border-rose-500/20' 
                             : 'bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500 hover:text-slate-950 border border-emerald-500/20'
                         }`}
                       >
                         {isAssigned ? 'Retirer l\'accès' : 'Assigner le cours'}
                       </button>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

