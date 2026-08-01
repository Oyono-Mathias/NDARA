const fs = require('fs');
let code = fs.readFileSync('src/views/GoogleWorkspaceTest.tsx', 'utf8');

// Update scopes
code = code.replace(
  "scope: 'https://www.googleapis.com/auth/gmail.readonly https://www.googleapis.com/auth/meetings.space.created',",
  "scope: 'https://www.googleapis.com/auth/gmail.readonly https://www.googleapis.com/auth/meetings.space.created https://www.googleapis.com/auth/classroom.courses.readonly https://www.googleapis.com/auth/drive.readonly', // Drive readonly needed to list forms"
);

// Add imports for icons
code = code.replace(
  "import { Mail, Video, LayoutDashboard } from 'lucide-react';",
  "import { Mail, Video, LayoutDashboard, BookOpen, FileText } from 'lucide-react';"
);

// Add state for classroom and forms
code = code.replace(
  "const [meetLink, setMeetLink] = useState('');",
  "const [meetLink, setMeetLink] = useState('');\n  const [courses, setCourses] = useState<any[]>([]);\n  const [forms, setForms] = useState<any[]>([]);"
);

// Add fetch functions
const newFunctions = `
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
`;

code = code.replace(
  "  return (",
  newFunctions + "\n  return ("
);

// Add UI sections
const newUI = `
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
`;

code = code.replace(
  "      </div>\n    </div>",
  newUI + "      </div>\n    </div>"
);

fs.writeFileSync('src/views/GoogleWorkspaceTest.tsx', code);
