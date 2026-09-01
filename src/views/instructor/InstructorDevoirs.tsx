import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { FileText, Loader2, CheckCircle2, Clock } from 'lucide-react';

interface Devoir {
  id: string;
  studentName: string;
  courseName: string;
  submittedAt: string;
  status: 'pending' | 'graded';
  grade?: number;
}

export const InstructorDevoirs: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [devoirs, setDevoirs] = useState<Devoir[]>([]);

  useEffect(() => {
    setTimeout(() => {
      setDevoirs([
        { id: 'dev_1', studentName: 'Alice Dupont', courseName: 'React Avancé', submittedAt: '2026-08-27T14:30:00Z', status: 'pending' },
        { id: 'dev_2', studentName: 'Marc Leroy', courseName: 'Firebase Pro', submittedAt: '2026-08-26T10:15:00Z', status: 'graded', grade: 18 },
      ]);
      setLoading(false);
    }, 600);
  }, []);

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-gray-900">Corrections de devoirs</h1>
        <p className="text-sm text-gray-500">Évaluez les travaux soumis par vos étudiants.</p>
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 text-blue-500 animate-spin" /></div>
      ) : devoirs.length === 0 ? (
        <p className="text-center text-gray-500 py-12 bg-gray-50 rounded-xl border border-gray-100">Aucun devoir à corriger.</p>
      ) : (
        <div className="space-y-4">
          {devoirs.map(dev => (
            <Card key={dev.id} className="border-none shadow-sm ring-1 ring-gray-100">
              <CardContent className="p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 ${dev.status === 'graded' ? 'bg-green-50 text-green-600' : 'bg-orange-50 text-orange-600'}`}>
                    <FileText className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900">{dev.studentName}</h3>
                    <p className="text-xs text-gray-500 line-clamp-1">{dev.courseName} • Soumis le {new Date(dev.submittedAt).toLocaleDateString('fr-FR')}</p>
                    <div className="flex items-center gap-1 mt-1 text-xs font-medium">
                      {dev.status === 'pending' ? (
                        <><Clock className="w-3 h-3 text-orange-500" /><span className="text-orange-600">En attente de correction</span></>
                      ) : (
                        <><CheckCircle2 className="w-3 h-3 text-green-500" /><span className="text-green-600">Noté : {dev.grade}/20</span></>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="w-full sm:w-auto">
                  <Button variant={dev.status === 'pending' ? 'primary' : 'outline'} className="w-full sm:w-auto">
                    {dev.status === 'pending' ? 'Corriger' : 'Voir la note'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
          <p className="text-xs text-center text-gray-400 mt-4">* L'enregistrement des notes requiert une validation côté serveur.</p>
        </div>
      )}
    </div>
  );
};
