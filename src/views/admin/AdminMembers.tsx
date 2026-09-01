import React, { useState } from 'react';
import { Card, CardContent } from '../../components/ui/card';
import { Search, Filter, MoreVertical } from 'lucide-react';
import { Link } from 'react-router-dom';

interface MemberInfo {
  id: string;
  name: string;
  email: string;
  role: string;
  status: 'active' | 'suspended';
}

export const AdminMembers: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  
  // Données de démonstration
  const members: MemberInfo[] = [
    { id: '1', name: 'Jean Dupont', email: 'jean@example.com', role: 'student', status: 'active' },
    { id: '2', name: 'Marie Curie', email: 'marie@example.com', role: 'instructor', status: 'active' },
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900">Membres</h1>
          <p className="text-sm text-gray-500">Gestion des utilisateurs de la plateforme (Simulation).</p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input 
            type="text" 
            placeholder="Rechercher un membre..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <button className="flex items-center justify-center gap-2 px-6 py-3 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 font-medium">
          <Filter className="w-5 h-5" /> Filtres
        </button>
      </div>

      <div className="space-y-4">
        {members.map(member => (
          <Card key={member.id} className="border-none shadow-sm ring-1 ring-gray-100">
            <CardContent className="p-4 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold">
                  {member.name.charAt(0)}
                </div>
                <div>
                  <h3 className="font-bold text-gray-900">{member.name}</h3>
                  <p className="text-sm text-gray-500">{member.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end">
                <div className="flex gap-2">
                  <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium">
                    {member.role}
                  </span>
                  <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                    {member.status}
                  </span>
                </div>
                <Link to={`/admin/members/${member.id}`} className="p-2 hover:bg-gray-100 rounded-lg text-gray-400">
                  <MoreVertical className="w-5 h-5" />
                </Link>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
