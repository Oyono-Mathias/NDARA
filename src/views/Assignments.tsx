import { useState, useMemo, useEffect } from 'react';
import { 
  getFirestore, 
  collection, 
  query, 
  where, 
  onSnapshot, 
  collectionGroup, 
  orderBy 
} from 'firebase/firestore';
import { db, auth } from '../firebase';
import { ClipboardCheck, BookOpen, Search, Clock, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export function AssignmentsView() {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [assignments, setAssignments] = useState<any[]>([]);
  const [submissions, setSubmissions] = useState<Record<string, any>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'todo' | 'completed'>('todo');

  useEffect(() => {
    const unsubAuth = auth.onAuthStateChanged((user) => {
        if (user) {
            setCurrentUser(user);
            
            // 1. Écouter les inscriptions pour savoir quels cours l'étudiant suit
            const enrollQuery = query(collection(db, 'enrollments'), where('studentId', '==', user.uid));
            
            const unsubEnroll = onSnapshot(enrollQuery, (enrollSnap) => {
                const enrolledCourseIds = enrollSnap.docs.map(d => d.data().courseId);

                if (enrolledCourseIds.length === 0) {
                    setAssignments([]);
                    setIsLoading(false);
                    return;
                }

                // 2. Écouter tous les devoirs et filtrer ceux des cours inscrits
                const assignmentsQuery = query(collectionGroup(db, 'assignments'), orderBy('createdAt', 'desc'));
                const unsubAssignments = onSnapshot(assignmentsQuery, (assignSnap) => {
                    const filtered = assignSnap.docs
                        .map(doc => ({ id: doc.id, ...doc.data() }))
                        .filter((a: any) => enrolledCourseIds.includes(a.courseId));
                    
                    setAssignments(filtered);
                });

                // 3. Écouter les soumissions existantes de l'étudiant
                const submissionsQuery = query(collection(db, 'devoirs'), where('studentId', '==', user.uid));
                const unsubSubmissions = onSnapshot(submissionsQuery, (subSnap) => {
                    const subMap: Record<string, any> = {};
                    subSnap.forEach(doc => {
                        const data = doc.data();
                        subMap[data.assignmentId] = data;
                    });
                    setSubmissions(subMap);
                    setIsLoading(false);
                });

                return () => {
                    unsubAssignments();
                    unsubSubmissions();
                };
            });

            return () => unsubEnroll();
        } else {
            setCurrentUser(null);
            setAssignments([
               { id: '1', title: 'Architecture Blockchain Privée', courseTitle: 'FinTech Fondations', courseId: 'trading', dueDate: new Date(Date.now() + 86400000) },
               { id: '2', title: 'Analyse de risques', courseTitle: 'Gestion FinTech', courseId: 'trading', dueDate: new Date(Date.now() + 86400000 * 3) }
            ]);
            setIsLoading(false);
        }
    });

    return () => unsubAuth();
  }, []);

  const filteredAssignments = useMemo(() => {
    return assignments.filter(a => 
      a.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (a.courseTitle && a.courseTitle.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  }, [assignments, searchTerm]);

  const { toDo, completed } = useMemo(() => {
    return {
      toDo: filteredAssignments.filter(a => !submissions[a.id]),
      completed: filteredAssignments.filter(a => !!submissions[a.id])
    };
  }, [filteredAssignments, submissions]);

  return (
    <div className="flex flex-col gap-8 pb-24 bg-slate-950 min-h-screen">
      <header className="pt-8 space-y-6">
        <div className="space-y-1">
            <div className="flex items-center gap-2 text-primary mb-2">
                <ClipboardCheck className="h-5 w-5" />
                <span className="text-[10px] font-black uppercase tracking-[0.2em]">Pédagogie & Exercices</span>
            </div>
            <h1 className="text-3xl font-black text-white uppercase tracking-tight">Mes Devoirs</h1>
        </div>
        
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-600" />
          <input 
            placeholder="Chercher un devoir ou une formation..." 
            className="w-full h-14 pl-12 pr-4 bg-slate-900 border-slate-800 rounded-2xl text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-primary/30"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </header>

      <div className="w-full">
        <div className="flex w-full bg-transparent border-b border-slate-800 h-12 gap-8 mb-8 overflow-x-auto">
          <button 
            onClick={() => setActiveTab('todo')}
            className={`border-b-2 font-black text-[10px] uppercase tracking-widest px-0 pb-3 whitespace-nowrap
              ${activeTab === 'todo' ? 'border-primary text-primary' : 'border-transparent text-slate-500 hover:text-slate-300'}`}
          >
            À FAIRE ({toDo.length})
          </button>
          <button 
            onClick={() => setActiveTab('completed')}
            className={`border-b-2 font-black text-[10px] uppercase tracking-widest px-0 pb-3 whitespace-nowrap
              ${activeTab === 'completed' ? 'border-primary text-primary' : 'border-transparent text-slate-500 hover:text-slate-300'}`}
          >
            RENDUS ({completed.length})
          </button>
        </div>

        <div>
          {activeTab === 'todo' && (
             <div className="block space-y-4">
              {isLoading ? (
                <div className="space-y-4">
                  {[...Array(2)].map((_, i) => <div key={i} className="h-48 w-full rounded-[2.5rem] bg-slate-900 border border-slate-800 animate-pulse" />)}
                </div>
              ) : toDo.length > 0 ? (
                toDo.map(a => <div key={a.id}><AssignmentCard assignment={a} /></div>)
              ) : (
                <div className="flex flex-col items-center justify-center py-20 px-8 text-center bg-slate-900/20 rounded-[3rem] border-2 border-dashed border-slate-800/50 animate-in zoom-in duration-500">
                  <div className="p-6 bg-slate-800/50 rounded-full mb-6">
                      <ClipboardCheck className="h-16 w-16 text-slate-700" />
                  </div>
                  <h3 className="text-xl font-black text-white uppercase tracking-tight">Tout est à jour !</h3>
                  <p className="text-slate-500 text-sm mt-3 leading-relaxed max-w-[220px] mx-auto font-medium">
                      Vous n'avez aucun devoir en attente pour le moment.
                  </p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'completed' && (
             <div className="block space-y-4">
              {isLoading ? (
                <div className="space-y-4">
                  {[...Array(2)].map((_, i) => <div key={i} className="h-48 w-full rounded-[2.5rem] bg-slate-900 border border-slate-800 animate-pulse" />)}
                </div>
              ) : completed.length > 0 ? (
                completed.map(a => <div key={a.id}><AssignmentCard assignment={a} submission={submissions[a.id]} /></div>)
              ) : (
                <div className="text-center py-24 text-slate-600 font-bold uppercase text-[10px] tracking-widest opacity-30">
                  Aucun devoir rendu pour l'instant.
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function AssignmentCard({ assignment, submission }: { assignment: any, submission?: any }) {
  const dueDate = assignment.dueDate?.toDate?.() || assignment.dueDate || null;
  const isOverdue = dueDate ? new Date() > new Date(dueDate) && !submission : false;
  const isGraded = submission?.status === 'graded';
  const formatter = new Intl.DateTimeFormat('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' });
  
  return (
    <div className="bg-slate-900 border border-slate-800 shadow-2xl rounded-[2.5rem] overflow-hidden group active:scale-[0.98] transition-all duration-300">
      <div className="p-6">
        <div className="flex justify-between items-start gap-4 mb-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-[10px] font-black text-primary uppercase tracking-widest">
              <BookOpen className="h-3.5 w-3.5" />
              <span className="truncate max-w-[180px]">{assignment.courseTitle || 'Formation Ndara'}</span>
            </div>
            <h3 className="text-lg font-bold text-white leading-tight group-hover:text-primary transition-colors uppercase tracking-tight">
              {assignment.title}
            </h3>
          </div>
          
          {submission ? (
            <span className={`text-[9px] font-black uppercase px-3 py-1 rounded-full ${isGraded ? "bg-green-500 text-white" : "bg-primary text-white"}`}>
                {isGraded ? "Noté" : "En attente"}
            </span>
          ) : isOverdue ? (
            <span className="bg-red-500 text-white text-[9px] font-black uppercase px-3 py-1 rounded-full shadow-lg shadow-red-500/20">Retard</span>
          ) : (
            <span className="bg-slate-800 text-slate-400 text-[9px] font-black uppercase px-3 py-1 rounded-full">À faire</span>
          )}
        </div>

        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2 text-[10px] text-slate-500 font-bold uppercase tracking-widest">
            <Clock className="h-4 w-4 text-slate-700" />
            <span>Limite : {dueDate ? formatter.format(new Date(dueDate)) : 'Aucune'}</span>
          </div>
        </div>
      </div>
      
      <div className="px-6 pb-6 pt-0">
        <Link 
          to={`/student/assignments/${assignment.id}`}
          className={`flex items-center justify-center w-full h-14 rounded-2xl font-black uppercase text-xs tracking-widest transition-all
            ${submission ? "bg-slate-800 text-slate-400 hover:bg-slate-700" : "bg-primary text-white shadow-xl shadow-primary/20"}`}
        >
          {isGraded ? "Consulter ma note" : submission ? "Voir ma soumission" : "Ouvrir l'exercice"}
          <ChevronRight className="ml-2 h-4 w-4" />
        </Link>
      </div>
    </div>
  );
}

