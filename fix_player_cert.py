import re

with open('src/views/CoursePlayer.tsx', 'r') as f:
    content = f.read()

# Add Certificate import
content = content.replace("import { Chapter, Lesson, Progress } from '../types/models';", "import { Chapter, Lesson, Progress, Certificate } from '../types/models';")
content = content.replace("import { ChaptersService, LessonsService, ProgressService } from '../services/db';", "import { ChaptersService, LessonsService, ProgressService, CertificatesService } from '../services/db';")
content = content.replace("import { Loader2, ArrowLeft, Menu, X, PlayCircle, FileText, CheckCircle2, ChevronRight, HelpCircle, Dumbbell, FileAudio, Settings } from 'lucide-react';", "import { Loader2, ArrowLeft, Menu, X, PlayCircle, FileText, CheckCircle2, ChevronRight, HelpCircle, Dumbbell, FileAudio, Settings, Award } from 'lucide-react';")

# Add certificate state
state_code = """
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [progressData, setProgressData] = useState<Progress[]>([]);
  const [loadingContent, setLoadingContent] = useState(true);
  const [certificate, setCertificate] = useState<Certificate | null>(null);
"""
content = re.sub(r'const \[chapters, setChapters\] = useState<Chapter\[\]>\(\[\]\);\s*const \[lessons, setLessons\] = useState<Lesson\[\]>\(\[\]\);\s*const \[progressData, setProgressData\] = useState<Progress\[\]>\(\[\]\);\s*const \[loadingContent, setLoadingContent\] = useState\(true\);', state_code, content)

# Add certificate fetch
cert_fetch_code = """
    const unsubP = ProgressService.subscribe([where('courseId', '==', course.id), where('studentId', '==', firebaseUser?.uid)], (data) => setProgressData(data));
    const unsubCert = CertificatesService.subscribe([where('courseId', '==', course.id), where('studentId', '==', firebaseUser?.uid)], (data) => {
      if (data.length > 0) setCertificate(data[0]);
    });

    return () => { unsubC(); unsubL(); unsubP(); unsubCert(); };
"""
content = re.sub(r"const unsubP = ProgressService\.subscribe\(\[where\('courseId', '==', course\.id\), where\('studentId', '==', firebaseUser\?\.uid\)\], \(data\) => setProgressData\(data\)\);\s*return \(\) => \{ unsubC\(\); unsubL\(\); unsubP\(\); \};", cert_fetch_code, content)

# Calculate overall completion
completion_calc = """
  const completedLessonsCount = lessons.filter(l => progressData.some(p => p.lessonId === l.id && p.completed)).length;
  const isCourseCompleted = lessons.length > 0 && completedLessonsCount === lessons.length;

  const claimCertificate = async () => {
    if (!firebaseUser || !course || certificate || !isCourseCompleted) return;
    const certNumber = 'CERT-' + Math.random().toString(36).substr(2, 9).toUpperCase();
    await CertificatesService.create({
      studentId: firebaseUser.uid,
      courseId: course.id,
      issuedAt: Date.now(),
      certificateNumber: certNumber
    } as any);
  };
"""
content = content.replace("const activeProgress = activeLesson ? progressData.find(p => p.lessonId === activeLesson.id) : null;", "const activeProgress = activeLesson ? progressData.find(p => p.lessonId === activeLesson.id) : null;" + completion_calc)

# Add Congratulations / Certificate view
congrats_view = """
        <main className="flex-1 overflow-y-auto mt-16 bg-[#090E17]">
          {isCourseCompleted && !activeLesson && (
            <div className="flex flex-col items-center justify-center p-8 mt-12 text-center max-w-2xl mx-auto">
              <div className="w-24 h-24 bg-emerald-500/20 text-emerald-500 rounded-full flex items-center justify-center mb-6">
                <Award className="w-12 h-12" />
              </div>
              <h1 className="text-3xl font-black text-white mb-4">Félicitations !</h1>
              <p className="text-slate-400 mb-8 leading-relaxed">
                Vous avez terminé la formation "{course.title}" avec succès.
              </p>
              {certificate ? (
                <Link to="/student/certificates" className="px-8 py-4 bg-emerald-500 text-slate-950 font-bold uppercase tracking-widest rounded-xl hover:bg-emerald-400 transition-colors shadow-[0_0_30px_rgba(16,185,129,0.3)]">
                  Voir mon certificat
                </Link>
              ) : (
                <button onClick={claimCertificate} className="px-8 py-4 bg-emerald-500 text-slate-950 font-bold uppercase tracking-widest rounded-xl hover:bg-emerald-400 transition-colors shadow-[0_0_30px_rgba(16,185,129,0.3)]">
                  Obtenir mon certificat
                </button>
              )}
            </div>
          )}

          {!isCourseCompleted && activeLesson && (
"""

content = content.replace("<main className=\"flex-1 overflow-y-auto mt-16 bg-[#090E17]\">\n          {activeLesson && (", congrats_view)

end_congrats_view = """              )}
              
            </div>
          )}
        </main>"""

content = content.replace("""              )}
              
            </div>
          )}
        </main>""", """              )}
              
            </div>
          )}
        </main>""")

with open('src/views/CoursePlayer.tsx', 'w') as f:
    f.write(content)
