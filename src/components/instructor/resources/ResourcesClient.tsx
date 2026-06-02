import { useState, useEffect } from 'react';
import { collection, query, where, getDocs, addDoc, serverTimestamp, onSnapshot } from 'firebase/firestore';
import { db } from '../../../firebase';
import { useRole } from '../../../context/RoleContext';
import { Paperclip, Plus, Trash2, File as FileIcon, ExternalLink, Link as LinkIcon, Upload } from 'lucide-react';

export function ResourcesClient() {
    const { currentUser } = useRole();
    const [courses, setCourses] = useState<any[]>([]);
    const [resources, setResources] = useState<any[]>([]);
    
    // Upload state
    const [isUploading, setIsUploading] = useState(false);
    const [selectedCourse, setSelectedCourse] = useState('');
    const [resourceTitle, setResourceTitle] = useState('');
    const [resourceLink, setResourceLink] = useState('');

    useEffect(() => {
        if (!currentUser?.uid) return;

        // Fetch courses for dropdown
        const fetchCourses = async () => {
            const q = query(collection(db, 'courses'), where('instructorId', '==', currentUser.uid));
            const snap = await getDocs(q);
            setCourses(snap.docs.map(d => ({ id: d.id, ...d.data() })));
        };
        fetchCourses();

        // Listen to resources
        const qRes = query(collection(db, 'course_resources'), where('instructorId', '==', currentUser.uid));
        const unsub = onSnapshot(qRes, snap => {
            setResources(snap.docs.map(d => ({ id: d.id, ...d.data() })));
        });

        return () => unsub();
    }, [currentUser?.uid]);

    const handleAddResource = async () => {
        if (!selectedCourse || !resourceTitle || !resourceLink || !currentUser?.uid) return;
        setIsUploading(true);
        try {
            const courseObj = courses.find(c => c.id === selectedCourse);
            await addDoc(collection(db, 'course_resources'), {
                instructorId: currentUser.uid,
                courseId: selectedCourse,
                courseTitle: courseObj?.title || 'Formation',
                title: resourceTitle,
                url: resourceLink,
                type: 'link', // mock file type as link for MVP
                createdAt: serverTimestamp()
            });
            setResourceTitle('');
            setResourceLink('');
            setSelectedCourse('');
        } catch (error) {
            console.error(error);
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <div className="space-y-6 mt-6">
            <div className="bg-[#1e293b] border border-white/5 rounded-[2.5rem] p-8 shadow-2xl relative overflow-hidden">
                <div className="absolute -top-24 -right-24 w-48 h-48 bg-primary/10 rounded-full blur-3xl pointer-events-none"></div>
                
                <h2 className="font-black uppercase tracking-tight text-xl mb-2 text-white">Ajouter une ressource</h2>
                <p className="text-sm font-medium text-slate-400 mb-8 italic">Partagez des liens, documents ou outils avec vos apprenants.</p>
                
                <div className="grid md:grid-cols-2 gap-4 mb-4">
                    <div className="space-y-2">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 ml-2">Associer à la formation</label>
                        <select 
                            className="w-full bg-[#0f172a] border border-white/10 rounded-2xl p-4 text-sm text-white focus:ring-1 focus:ring-primary/50"
                            value={selectedCourse}
                            onChange={e => setSelectedCourse(e.target.value)}
                        >
                            <option value="">Sélectionner une formation</option>
                            {courses.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
                        </select>
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 ml-2">Titre de la ressource</label>
                        <input 
                            className="w-full bg-[#0f172a] border border-white/10 rounded-2xl p-4 text-sm text-white focus:ring-1 focus:ring-primary/50 placeholder:text-slate-600"
                            placeholder="Ex: Template Notion Organisation"
                            value={resourceTitle}
                            onChange={e => setResourceTitle(e.target.value)}
                        />
                    </div>
                </div>
                
                <div className="space-y-2 mb-6">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 ml-2">Lien ou URL du fichier (Google Drive, Dropbox, etc.)</label>
                    <div className="flex gap-2">
                        <div className="relative flex-1">
                            <LinkIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                            <input 
                                className="w-full bg-[#0f172a] border border-white/10 rounded-2xl py-4 pl-10 pr-4 text-sm text-white focus:ring-1 focus:ring-primary/50 placeholder:text-slate-600"
                                placeholder="https://..."
                                value={resourceLink}
                                onChange={e => setResourceLink(e.target.value)}
                            />
                        </div>
                        <button 
                            onClick={handleAddResource}
                            disabled={!selectedCourse || !resourceTitle || !resourceLink || isUploading}
                            className="bg-primary text-[#0f172a] px-6 rounded-2xl font-black uppercase tracking-widest text-xs flex items-center justify-center gap-2 hover:bg-emerald-400 disabled:opacity-50 transition"
                        >
                            {isUploading ? "..." : <><Plus size={16} /> Ajouter</>}
                        </button>
                    </div>
                </div>
            </div>

            <div className="bg-[#0f172a] rounded-[2.5rem] p-8 border border-white/5">
                <h3 className="font-bold text-white text-lg mb-6 flex items-center gap-2">
                    <FileIcon className="text-primary w-5 h-5" /> 
                    Fichiers importés ({resources.length})
                </h3>
                
                {resources.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 text-center opacity-50 border border-dashed border-white/10 rounded-3xl">
                       <Paperclip className="h-10 w-10 text-slate-500 mb-4" />
                       <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Aucune ressource partagée</p>
                    </div>
                ) : (
                    <div className="grid md:grid-cols-2 gap-4">
                        {resources.map(res => (
                            <div key={res.id} className="p-4 bg-[#1e293b] border border-white/5 rounded-2xl flex items-start justify-between group hover:border-white/10 transition">
                                <div className="flex gap-4 items-start">
                                    <div className="w-10 h-10 bg-slate-800 rounded-xl flex items-center justify-center shrink-0">
                                        <LinkIcon className="w-4 h-4 text-slate-400" />
                                    </div>
                                    <div>
                                        <p className="font-bold text-sm text-white mb-1">{res.title}</p>
                                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-2">{res.courseTitle}</p>
                                        <a href={res.url} target="_blank" rel="noreferrer" className="text-xs text-primary hover:underline flex items-center gap-1">
                                            Ouvrir le lien <ExternalLink size={10} />
                                        </a>
                                    </div>
                                </div>
                                <button className="text-slate-600 hover:text-red-500 transition p-2 opacity-0 group-hover:opacity-100">
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
