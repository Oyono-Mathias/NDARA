import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Card, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Award, Download, Eye } from 'lucide-react';

export const Certificates: React.FC = () => {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12 text-center">
        <h1 className="text-2xl font-bold mb-4">Mes Certificats</h1>
        <p className="text-gray-500">Veuillez vous connecter pour voir vos certificats.</p>
      </div>
    );
  }

  // Mock data for UI representation
  const certificates = [
    { id: 'c1', title: 'Développement Web Frontend', date: '2025-11-15', issuer: 'Ndara Afrique' },
    { id: 'c2', title: 'Bases du Marketing Digital', date: '2026-02-10', issuer: 'Ndara Afrique' },
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold text-gray-900">Mes Certificats</h1>
        <p className="text-gray-500 mt-2">Retrouvez toutes vos certifications obtenues avec succès.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {certificates.map((cert) => (
          <Card key={cert.id} className="border-none shadow-sm ring-1 ring-gray-100 flex flex-col md:flex-row overflow-hidden group">
            <div className="bg-blue-50 w-full md:w-32 h-32 md:h-auto flex items-center justify-center shrink-0">
              <Award className="w-12 h-12 text-blue-300" />
            </div>
            <CardContent className="p-5 flex-1 flex flex-col justify-center">
              <h3 className="font-bold text-gray-900 mb-1">{cert.title}</h3>
              <p className="text-sm text-gray-500">Délivré le {new Date(cert.date).toLocaleDateString('fr-FR')}</p>
              
              <div className="mt-4 flex items-center gap-3">
                <Button variant="outline" className="text-xs py-1.5 h-auto">
                  <Eye className="w-3.5 h-3.5 mr-1.5" /> Voir
                </Button>
                <Button variant="outline" className="text-xs py-1.5 h-auto">
                  <Download className="w-3.5 h-3.5 mr-1.5" /> PDF
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
