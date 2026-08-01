import React, { useState, useEffect } from 'react';
import { useGoogleLogin } from '@react-oauth/google';
import { db, auth } from '../../firebase';
import { collection, query, where, getDocs, addDoc, serverTimestamp, orderBy } from 'firebase/firestore';
import { useToast } from '../../hooks/use-toast';
import { Video, Plus, Loader2, Users, Calendar, Link as LinkIcon, Trash2 } from 'lucide-react';
import { deleteDoc, doc } from 'firebase/firestore';

export function InstructorLiveSessions() {
  const [sessions, setSessions] = useState<any[]>([]);
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const { toast } = useToast();

  const [newSession, setNewSession] = useState({
    title: '',
    courseId: '',
    scheduledAt: '',
    description: ''
  });

  useEffect(() => {
    fetchData();
  }, [auth.currentUser]);

  const fetchData = async () => {
    if (!auth.currentUser) return;
    try {
      setLoading(true);
      // Fetch instructor's courses
      const qCourses = query(collection(db, 'courses'), where('instructorId', '==', auth.currentUser.uid));
      const coursesSnap = await getDocs(qCourses);
      const coursesData = coursesSnap.docs.map(d => ({ id: d.id, ...d.data() }));
      setCourses(coursesData);

      // Fetch live sessions
      const qSessions = query(collection(db, 'live_sessions'), where('instructorId', '==', auth.currentUser.uid), orderBy('scheduledAt', 'desc'));
      const sessionsSnap = await getDocs(qSessions);
      setSessions(sessionsSnap.docs.map(d => ({ id: d.id, ...d.data() })));
    } catch (err: any) {
      toast({ title: "Erreur", description: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const loginGoogleMeet = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      try {
        setIsCreating(true);
        // Call backend to create Meet Space
        const idToken = await auth.currentUser?.getIdToken();
        const res = await fetch('/api/admin/meet/create', {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${idToken}`
          },
          body: JSON.stringify({ googleToken: tokenResponse.access_token })
        });
        
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Erreur de création de la réunion Google Meet");

        const meetingUri = data.meetingUri;


        // Save to Firestore (already here)
        await addDoc(collection(db, 'live_sessions'), {
          instructorId: auth.currentUser?.uid,
          courseId: newSession.courseId,
          title: newSession.title,
          description: newSession.description,
          scheduledAt: newSession.scheduledAt,
          meetingUri: meetingUri,
          createdAt: serverTimestamp()
        });

        // NOTIFY STUDENTS VIA GMAIL API
        try {
          const qStudents = query(collection(db, 'enrollments'), where('courseId', '==', newSession.courseId));
          const snapEnrols = await getDocs(qStudents);
          
          if (!snapEnrols.empty) {
            const courseTitle = courses.find(c => c.id === newSession.courseId)?.title || "Formation";
            const dateStr = new Date(newSession.scheduledAt).toLocaleString('fr-FR', { dateStyle: 'long', timeStyle: 'short' });
            
            for (const enrol of snapEnrols.docs) {
              const studentId = enrol.data().studentId;
              const userSnap = await getDocs(query(collection(db, 'users'), where('uid', '==', studentId)));
              if (!userSnap.empty) {
                const userEmail = userSnap.docs[0].data().email;
                if (userEmail) {
                  const subject = `[NDARA] Nouvelle Session Live : ${newSession.title}`;
                  const body = `
                    <h2>Nouvelle session live pour votre formation "${courseTitle}"</h2>
                    <p>Bonjour,</p>
                    <p>Votre formateur a programmé une nouvelle session live :</p>
                    <ul>
                      <li><strong>Titre :</strong> ${newSession.title}</li>
                      <li><strong>Date :</strong> ${dateStr}</li>
                      <li><strong>Lien Google Meet :</strong> <a href="${meetingUri}">${meetingUri}</a></li>
                    </ul>
                    <p>${newSession.description}</p>
                    <p>À très bientôt sur NDARA !</p>
                  `;
                  
                  const emailRaw = [
                    `To: ${userEmail}`,
                    'Content-Type: text/html; charset=utf-8',
                    'MIME-Version: 1.0',
                    `Subject: ${subject}`,
                    '',
                    body,
                  ].join('\n');
                  
                  const encodedEmail = btoa(unescape(encodeURIComponent(emailRaw))).replace(/\+/g, '-').replace(/\//g, '_');
                  
                  await fetch('https://gmail.googleapis.com/upload/gmail/v1/users/me/messages/send', {
                    method: 'POST',
                    headers: {
                      'Authorization': `Bearer ${tokenResponse.access_token}`,
                      'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ raw: encodedEmail })
                  });
                }
              }
            }
          }
        } catch(e) {
          console.error("Failed to send emails", e);
        }


        toast({ title: "Session Live créée avec succès!" });
        setNewSession({ title: '', courseId: '', scheduledAt: '', description: '' });
        fetchData();
      } catch (err: any) {
        toast({ title: "Erreur", description: err.message, variant: "destructive" });
      } finally {
        setIsCreating(false);
      }
    },
    onError: () => {
      setIsCreating(false);
      toast({ title: "Erreur de connexion à Google", variant: "destructive" });
    },
    scope: 'https://www.googleapis.com/auth/meetings.space.created https://www.googleapis.com/auth/gmail.send',
  });

  const handleDelete = async (id: string) => {
    if (!confirm("Voulez-vous supprimer cette session live ?")) return;
    try {
      await deleteDoc(doc(db, 'live_sessions', id));
      toast({ title: "Session supprimée." });
      fetchData();
    } catch(err: any) {
      toast({ title: "Erreur", description: err.message, variant: "destructive" });
    }
  };

  const handleCreate = () => {
    if (!newSession.title || !newSession.courseId || !newSession.scheduledAt) {
      return toast({ title: "Veuillez remplir les champs requis (Titre, Cours, Date)", variant: "destructive" });
    }
    setIsCreating(true);
    loginGoogleMeet();
  };

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-8 pb-32">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-black text-white uppercase tracking-tight flex items-center gap-3">
          <Video className="text-[#10B981] w-8 h-8" />
          Sessions Live Google Meet
        </h1>
        <p className="text-slate-400">Gérez vos sessions en direct interactives avec vos étudiants via Google Workspace.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-[#111827] border border-[#1E293B] p-6 rounded-2xl">
            <h2 className="text-xl font-bold text-white mb-6">Programmer un Live</h2>
            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-400 uppercase">Titre de la session</label>
                <input 
                  type="text" 
                  value={newSession.title}
                  onChange={e => setNewSession({...newSession, title: e.target.value})}
                  className="w-full bg-[#1E293B] border border-[#334155] rounded-xl px-4 py-3 text-white mt-1 focus:border-[#10B981] outline-none transition-colors"
                  placeholder="Ex: Masterclass sur le Marketing"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-400 uppercase">Formation associée</label>
                <select 
                  value={newSession.courseId}
                  onChange={e => setNewSession({...newSession, courseId: e.target.value})}
                  className="w-full bg-[#1E293B] border border-[#334155] rounded-xl px-4 py-3 text-white mt-1 focus:border-[#10B981] outline-none transition-colors"
                >
                  <option value="">Sélectionner une formation...</option>
                  {courses.map(c => (
                    <option key={c.id} value={c.id}>{c.title}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs font-bold text-slate-400 uppercase">Date et Heure</label>
                <input 
                  type="datetime-local" 
                  value={newSession.scheduledAt}
                  onChange={e => setNewSession({...newSession, scheduledAt: e.target.value})}
                  className="w-full bg-[#1E293B] border border-[#334155] rounded-xl px-4 py-3 text-white mt-1 focus:border-[#10B981] outline-none transition-colors"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-400 uppercase">Description (Optionnel)</label>
                <textarea 
                  value={newSession.description}
                  onChange={e => setNewSession({...newSession, description: e.target.value})}
                  className="w-full bg-[#1E293B] border border-[#334155] rounded-xl px-4 py-3 text-white mt-1 focus:border-[#10B981] outline-none transition-colors min-h-[100px]"
                  placeholder="Objectifs de cette session..."
                />
              </div>
              
              <button 
                onClick={handleCreate}
                disabled={isCreating}
                className="w-full bg-[#10B981] hover:bg-[#059669] text-black font-bold uppercase tracking-widest py-4 rounded-xl transition-colors flex items-center justify-center gap-2 mt-4"
              >
                {isCreating ? <Loader2 className="w-5 h-5 animate-spin" /> : <Plus className="w-5 h-5" />}
                {isCreating ? 'Création...' : 'Générer lien Google Meet'}
              </button>
            </div>
          </div>
        </div>

        <div className="lg:col-span-2">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <Loader2 className="w-8 h-8 animate-spin text-[#10B981]" />
            </div>
          ) : sessions.length === 0 ? (
            <div className="bg-[#111827] border border-[#1E293B] rounded-2xl p-12 text-center flex flex-col items-center">
              <div className="w-16 h-16 bg-[#1E293B] rounded-full flex items-center justify-center mb-4">
                <Video className="w-8 h-8 text-slate-400" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Aucune session live</h3>
              <p className="text-slate-400 max-w-sm">Programmez votre première session live Google Meet pour interagir avec vos étudiants en direct.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {sessions.map(session => (
                <div key={session.id} className="bg-[#111827] border border-[#1E293B] rounded-2xl p-6 flex flex-col md:flex-row gap-6 items-start md:items-center justify-between group hover:border-[#10B981]/50 transition-colors">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="bg-[#10B981]/20 text-[#10B981] px-2 py-1 rounded text-xs font-bold uppercase">
                        {courses.find(c => c.id === session.courseId)?.title || "Formation Inconnue"}
                      </span>
                    </div>
                    <h3 className="text-xl font-bold text-white">{session.title}</h3>
                    <div className="flex items-center gap-4 text-slate-400 text-sm">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-4 h-4" />
                        {new Date(session.scheduledAt).toLocaleString('fr-FR', { dateStyle: 'long', timeStyle: 'short' })}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3 w-full md:w-auto">
                    <a 
                      href={session.meetingUri}
                      target="_blank"
                      rel="noreferrer"
                      className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-3 bg-[#1E293B] hover:bg-[#334155] text-white font-bold rounded-xl transition-colors"
                    >
                      <LinkIcon className="w-4 h-4" />
                      Rejoindre
                    </a>
                    <button 
                      onClick={() => handleDelete(session.id)}
                      className="p-3 bg-red-500/10 text-red-500 hover:bg-red-500/20 rounded-xl transition-colors"
                      title="Supprimer la session"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
