const fs = require('fs');
const path = require('path');
const file = path.join(__dirname, 'src', 'views', 'CoursePlayer.tsx');
let code = fs.readFileSync(file, 'utf8');

// 1. Add Video icon import
if (!code.includes('Video,')) {
    code = code.replace('Calendar,', 'Calendar, Video,');
}

// 2. Add state
const stateHook = `  const [liveSessions, setLiveSessions] = useState<any[]>([]);`;
if (!code.includes('setLiveSessions')) {
    code = code.replace(
        'const [showAvisModal, setShowAvisModal] = useState(false);',
        'const [showAvisModal, setShowAvisModal] = useState(false);\n' + stateHook
    );
}

// 3. Add fetch effect
const fetchEffect = `
  useEffect(() => {
    if (!course) return;
    const q = query(
      collection(db, 'live_sessions'),
      where('courseId', '==', course.id)
    );
    const unsub = onSnapshot(q, snap => {
      const sessions = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      setLiveSessions(sessions.filter((s:any) => new Date(s.scheduledAt).getTime() > Date.now() - 3600000)); // Show if upcoming or started recently
    });
    return () => unsub();
  }, [course]);
`;
if (!code.includes('setLiveSessions(sessions.filter')) {
    code = code.replace(
        '  // Fetch QnA for current lesson',
        fetchEffect + '\n  // Fetch QnA for current lesson'
    );
}

// 4. Add UI banner
const bannerUI = `
          {liveSessions.length > 0 && (
            <div className="mx-4 md:mx-8 mt-6">
              {liveSessions.map(session => (
                <div key={session.id} className="bg-emerald-900/40 border border-emerald-500/30 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4 mb-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-emerald-500/20 text-emerald-500 rounded-full flex items-center justify-center shrink-0">
                      <Video className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-white font-bold text-lg">{session.title}</h3>
                      <p className="text-emerald-400 text-sm">Prévu le {new Date(session.scheduledAt).toLocaleString('fr-FR', { dateStyle: 'long', timeStyle: 'short' })}</p>
                    </div>
                  </div>
                  <a href={session.meetingUri} target="_blank" rel="noreferrer" className="px-6 py-2 bg-emerald-500 text-slate-950 font-bold uppercase tracking-widest text-sm rounded-xl hover:bg-emerald-400 transition-colors shrink-0">
                    Rejoindre le Live
                  </a>
                </div>
              ))}
            </div>
          )}
`;
if (!code.includes('bg-emerald-900/40 border border-emerald-500/30')) {
    code = code.replace(
        '<main className="flex-1 overflow-y-auto mt-16 bg-[#090E17]">',
        '<main className="flex-1 overflow-y-auto mt-16 bg-[#090E17]">' + bannerUI
    );
}

fs.writeFileSync(file, code);
console.log("CoursePlayer updated");
