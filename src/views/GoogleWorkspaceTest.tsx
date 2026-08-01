import React, { useState } from 'react';
import { useGoogleLogin } from '@react-oauth/google';
import { toast } from 'sonner';
import { Mail, Video, LayoutDashboard, BookOpen, FileText } from 'lucide-react';

export function GoogleWorkspaceTest() {
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<any[]>([]);
  const [meetLink, setMeetLink] = useState('');
  const [courses, setCourses] = useState<any[]>([]);
  const [forms, setForms] = useState<any[]>([]);

  const login = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      try {
        setLoading(true);
        const res = await fetch('/api/google/auth/google', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ code: tokenResponse.code }),
        });
        const data = await res.json();
        if (data.success) {
          toast.success("Connecté à Google avec succès!");
        } else {
          toast.error("Erreur de connexion: " + data.error);
        }
      } catch (err: any) {
        toast.error(err.message);
      } finally {
        setLoading(false);
      }
    },
    flow: 'auth-code',
    scope: 'https://www.googleapis.com/auth/gmail.readonly https://www.googleapis.com/auth/meetings.space.created https://www.googleapis.com/auth/classroom.courses.readonly https://www.googleapis.com/auth/drive.readonly', // Drive readonly needed to list forms
  });

  const fetchGmail = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/google/gmail/messages');
      const data = await res.json();
      if (data.messages) {
        setMessages(data.messages);
        toast.success("Messages récupérés !");
      } else {
        toast.error("Pas de messages ou erreur: " + JSON.stringify(data));
      }
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const createMeet = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/google/meet/create', { method: 'POST' });
      const data = await res.json();
      if (data.meetingUri) {
        setMeetLink(data.meetingUri);
        toast.success("Réunion Meet créée !");
      } else {
        toast.error("Erreur: " + JSON.stringify(data));
      }
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };


  const fetchClassroom = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/google/classroom/courses');
      const data = await res.json();
      if (data.courses) {
        setCourses(data.courses);
        toast.success("Cours récupérés !");
      } else {
        toast.error("Pas de cours ou erreur: " + JSON.stringify(data));
      }
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchForms = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/google/forms/list');
      const data = await res.json();
      if (data.files) {
        setForms(data.files);
        toast.success("Formulaires récupérés !");
      } else {
        toast.error("Pas de formulaires ou erreur: " + JSON.stringify(data));
      }
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <LayoutDashboard className="w-8 h-8" />
          Test Intégration Google Workspace
        </h1>
        <button 
          onClick={() => login()}
          disabled={loading}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
        >
          {loading ? 'Chargement...' : 'Connecter Google Workspace'}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <Mail className="w-5 h-5 text-red-500" />
            Gmail API
          </h2>
          <button 
            onClick={fetchGmail}
            className="w-full bg-gray-100 hover:bg-gray-200 text-gray-800 px-4 py-2 rounded-lg font-medium mb-4 transition-colors"
          >
            Lire les 5 derniers emails
          </button>
          {messages.length > 0 && (
            <div className="bg-gray-50 p-4 rounded-lg text-sm font-mono overflow-auto max-h-40">
              {JSON.stringify(messages, null, 2)}
            </div>
          )}
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <Video className="w-5 h-5 text-green-500" />
            Google Meet API
          </h2>
          <button 
            onClick={createMeet}
            className="w-full bg-gray-100 hover:bg-gray-200 text-gray-800 px-4 py-2 rounded-lg font-medium mb-4 transition-colors"
          >
            Créer une nouvelle réunion
          </button>
          {meetLink && (
            <div className="bg-green-50 text-green-800 p-4 rounded-lg font-medium">
              Lien: <a href={meetLink} target="_blank" rel="noreferrer" className="underline">{meetLink}</a>
            </div>
          )}
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-yellow-500" />
            Google Classroom API
          </h2>
          <button 
            onClick={fetchClassroom}
            className="w-full bg-gray-100 hover:bg-gray-200 text-gray-800 px-4 py-2 rounded-lg font-medium mb-4 transition-colors"
          >
            Lister mes cours
          </button>
          {courses.length > 0 && (
            <div className="bg-gray-50 p-4 rounded-lg text-sm font-mono overflow-auto max-h-40">
              {JSON.stringify(courses, null, 2)}
            </div>
          )}
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <FileText className="w-5 h-5 text-purple-500" />
            Google Forms API
          </h2>
          <button 
            onClick={fetchForms}
            className="w-full bg-gray-100 hover:bg-gray-200 text-gray-800 px-4 py-2 rounded-lg font-medium mb-4 transition-colors"
          >
            Lister mes formulaires
          </button>
          {forms.length > 0 && (
            <div className="bg-gray-50 p-4 rounded-lg text-sm font-mono overflow-auto max-h-40">
              {JSON.stringify(forms, null, 2)}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
