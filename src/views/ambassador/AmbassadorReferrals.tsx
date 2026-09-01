import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '../../components/ui/card';
import { Users, Search, Loader2, Shield } from 'lucide-react';

interface Referral {
  id: string;
  publicName: string;
  status: 'active' | 'pending';
  joinDate: string;
}

export const AmbassadorReferrals: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [referrals, setReferrals] = useState<Referral[]>([]);

  useEffect(() => {
    // Mock sécurisé - Ne retourne que des identifiants publics
    setTimeout(() => {
      setReferrals([
        { id: 'ref_1', publicName: 'Jean D***', status: 'active', joinDate: '2026-08-10T00:00:00Z' },
        { id: 'ref_2', publicName: 'Marie C***', status: 'pending', joinDate: '2026-08-27T00:00:00Z' },
        { id: 'ref_3', publicName: 'Paul M***', status: 'active', joinDate: '2026-07-20T00:00:00Z' },
      ]);
      setLoading(false);
    }, 600);
  }, []);

  const filtered = referrals.filter(r => r.publicName.toLowerCase().includes(searchTerm.toLowerCase()));
  const activeCount = referrals.filter(r => r.status === 'active').length;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
      <div className="flex flex-col space-y-2">
        <h1 className="text-2xl font-extrabold text-gray-900">Mes Filleuls</h1>
        <p className="text-sm text-gray-500">Suivi anonymisé de votre réseau.</p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Card className="border-none shadow-sm ring-1 ring-gray-100 bg-white">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm text-gray-500 font-medium">Total</p>
              <p className="text-2xl font-black text-gray-900">{referrals.length}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-none shadow-sm ring-1 ring-gray-100 bg-white">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="w-12 h-12 bg-green-50 text-green-600 rounded-full flex items-center justify-center">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm text-gray-500 font-medium">Actifs</p>
              <p className="text-2xl font-black text-gray-900">{activeCount}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input 
          type="text" 
          placeholder="Rechercher un filleul..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 text-blue-500 animate-spin" /></div>
      ) : (
        <div className="space-y-3">
          {filtered.map(ref => (
            <Card key={ref.id} className="border-none shadow-sm ring-1 ring-gray-100">
              <CardContent className="p-4 flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-gray-900">{ref.publicName}</h3>
                  <p className="text-xs text-gray-500 mt-1">Inscrit le {new Date(ref.joinDate).toLocaleDateString('fr-FR')}</p>
                </div>
                <div>
                  <span className={`px-3 py-1 text-xs font-bold rounded-full ${ref.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                    {ref.status === 'active' ? 'Actif' : 'En attente'}
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
          {filtered.length === 0 && (
            <p className="text-center text-gray-500 py-8">Aucun filleul trouvé.</p>
          )}
        </div>
      )}

      <div className="flex items-center justify-center gap-2 mt-8 text-xs text-gray-400">
        <Shield className="w-4 h-4" /> Les données sensibles des filleuls sont protégées.
      </div>
    </div>
  );
};
