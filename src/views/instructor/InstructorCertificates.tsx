import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '../../components/ui/card';
import { Award, Loader2, Search, ShieldCheck } from 'lucide-react';

export const InstructorCertificates: React.FC = () => {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setTimeout(() => setLoading(false), 800);
  }, []);

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-gray-900">Certificats délivrés</h1>
        <p className="text-sm text-gray-500">Registre des attestations de réussite de vos étudiants.</p>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input 
          type="text" 
          placeholder="Rechercher un étudiant ou un ID de certificat..."
          className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div className="bg-blue-50 p-4 rounded-xl flex items-start gap-3 border border-blue-100 text-blue-800 text-sm">
        <ShieldCheck className="w-5 h-5 shrink-0 mt-0.5" />
        <p>Les certificats sont générés et signés cryptographiquement par le backend. L'instructeur dispose d'un accès en lecture seule pour vérification.</p>
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 text-blue-500 animate-spin" /></div>
      ) : (
        <div className="space-y-4">
          {[1, 2].map((cert) => (
            <Card key={cert} className="border-none shadow-sm ring-1 ring-gray-100">
              <CardContent className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-yellow-50 text-yellow-600 rounded-xl flex items-center justify-center shrink-0">
                    <Award className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900">Lucas M.</h3>
                    <p className="text-xs text-gray-500 font-medium">React Avancé</p>
                    <p className="text-xs text-gray-400 mt-1">ID: CERT-2026-08-{cert}9X</p>
                  </div>
                </div>
                <div className="text-left sm:text-right">
                  <span className="inline-block px-3 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-full">Validé</span>
                  <p className="text-xs text-gray-400 mt-2">Délivré le {new Date().toLocaleDateString('fr-FR')}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
