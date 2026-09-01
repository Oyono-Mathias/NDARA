import React from 'react';
import { Card, CardContent } from '../components/ui/card';
import { Avatar } from '../components/ui/avatar';
import { Button } from '../components/ui/button';
import { Mail, Briefcase, MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';

export const Directory: React.FC = () => {
  // Mock data representing public profiles.
  // CRITICAL SECURITY NOTE: Never include private data like email, pinHash, or full financial info here.
  const users = [
    { id: 'u1', name: 'Dr. Aminata Diallo', role: 'Expert', headline: 'Consultante en stratégie d\'entreprise', location: 'Dakar, Sénégal' },
    { id: 'u2', name: 'Jean Dupont', role: 'Instructeur', headline: 'Développeur Fullstack Senior', location: 'Abidjan, CI' },
    { id: 'u3', name: 'Sarah Connor', role: 'Alumni', headline: 'Designer UX/UI', location: 'Paris, France' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div className="text-center max-w-2xl mx-auto space-y-4 mb-8">
        <h1 className="text-3xl font-extrabold text-gray-900">Annuaire</h1>
        <p className="text-gray-500 text-lg">Connectez-vous avec les experts et la communauté Ndara.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {users.map((user) => (
          <Card key={user.id} className="border-none shadow-sm ring-1 ring-gray-100 hover:shadow-md transition-shadow">
            <CardContent className="p-6 text-center flex flex-col items-center">
              <Avatar src={undefined} fallbackText={user.name.charAt(0)} size="lg" className="mb-4 w-20 h-20 text-2xl" />
              <h3 className="text-xl font-bold text-gray-900">{user.name}</h3>
              <p className="text-sm font-medium text-blue-600 mb-2">{user.role}</p>
              
              <div className="text-gray-500 text-sm space-y-2 mt-4 w-full">
                <div className="flex items-center justify-center gap-2">
                  <Briefcase className="w-4 h-4" />
                  <span className="truncate">{user.headline}</span>
                </div>
                <div className="flex items-center justify-center gap-2">
                  <MapPin className="w-4 h-4" />
                  <span className="truncate">{user.location}</span>
                </div>
              </div>
              
              <div className="mt-6 w-full pt-6 border-t border-gray-100 flex gap-3">
                <Button variant="outline" fullWidth className="text-sm">
                  <Mail className="w-4 h-4 mr-2" /> Message
                </Button>
                <Link to={`/directory/${user.id}`} className="w-full">
                  <Button variant="primary" fullWidth className="text-sm">
                    Profil
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
