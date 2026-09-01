import React, { useState } from 'react';
import { Card, CardContent } from '../../ui/card';
import { Search, UserCircle, Activity, BookOpen, AlertCircle } from 'lucide-react';

interface StudentInfo {
  id: string;
  pseudo: string;
  progress: number;
  status: 'active' | 'inactive';
  lastActive: string;
  courses: number;
}

export const StudentsClient: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  // Mock data intentionally keeping private data out (no email, phone, etc.)
  const [students] = useState<StudentInfo[]>([
    { id: 'stu_1', pseudo: 'Apprenant_401', progress: 75, status: 'active', lastActive: 'Il y a 2h', courses: 2 },
    { id: 'stu_2', pseudo: 'Apprenant_892', progress: 100, status: 'active', lastActive: 'Aujourd\'hui', courses: 1 },
    { id: 'stu_3', pseudo: 'Apprenant_110', progress: 15, status: 'inactive', lastActive: 'Il y a 10 jours', courses: 3 },
  ]);

  const filteredStudents = students.filter(s => 
    s.pseudo.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="max-w-5xl mx-auto p-4 space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-gray-900">Mes Étudiants</h1>
        <p className="text-sm text-gray-500">Suivez la progression des apprenants inscrits à vos cours.</p>
      </div>

      <div className="bg-blue-50 p-4 rounded-xl flex items-start gap-3 border border-blue-100 text-sm text-blue-800">
        <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
        <p>
          Pour des raisons de confidentialité (RGPD / Privacy by Design), les données personnelles (emails, numéros) sont masquées. Seules les métriques de progression sont exposées.
        </p>
      </div>

      <div className="relative">
        <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
        <input 
          type="text" 
          placeholder="Rechercher par pseudonyme..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {filteredStudents.length === 0 ? (
        <Card className="border-none shadow-sm ring-1 ring-gray-200 bg-gray-50/50">
          <CardContent className="p-12 text-center text-gray-500">
            <UserCircle className="w-12 h-12 mx-auto text-gray-300 mb-4" />
            <p>Aucun étudiant ne correspond à votre recherche.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredStudents.map((student) => (
            <Card key={student.id} className="border-none shadow-sm ring-1 ring-gray-200 overflow-hidden">
              <CardContent className="p-0">
                <div className="p-4 border-b border-gray-100 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${student.status === 'active' ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'}`}>
                      <UserCircle className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900">{student.pseudo}</h3>
                      <div className="flex items-center gap-1 text-xs text-gray-500">
                        <Activity className="w-3 h-3" />
                        {student.lastActive}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="p-4 bg-gray-50 flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2 text-gray-600">
                    <BookOpen className="w-4 h-4" /> {student.courses} cours
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div 
                        className={`h-full ${student.progress === 100 ? 'bg-green-500' : 'bg-blue-500'}`} 
                        style={{ width: `${student.progress}%` }} 
                      />
                    </div>
                    <span className="font-bold text-gray-900">{student.progress}%</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
