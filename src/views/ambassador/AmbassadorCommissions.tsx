import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '../../components/ui/card';
import { Loader2, DollarSign, Clock, CheckCircle2, Filter } from 'lucide-react';

interface Commission {
  id: string;
  source: string;
  referralName: string;
  amount: number;
  currency: string;
  status: 'pending' | 'available' | 'paid';
  date: string;
}

export const AmbassadorCommissions: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'available' | 'pending' | 'paid'>('all');
  const [commissions, setCommissions] = useState<Commission[]>([]);

  useEffect(() => {
    setTimeout(() => {
      setCommissions([
        { id: 'com_1', source: 'Achat Formation', referralName: 'Alice Z.', amount: 5000, currency: 'XAF', status: 'available', date: '2026-08-27T14:00:00Z' },
        { id: 'com_2', source: 'Achat E-book', referralName: 'Marc Y.', amount: 1500, currency: 'XAF', status: 'pending', date: '2026-08-28T10:30:00Z' },
        { id: 'com_3', source: 'Souscription Bourse', referralName: 'Sophie X.', amount: 8000, currency: 'XAF', status: 'paid', date: '2026-08-15T09:00:00Z' },
      ]);
      setLoading(false);
    }, 600);
  }, []);

  const filtered = commissions.filter(c => filter === 'all' || c.status === filter);

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
      <div className="flex flex-col space-y-2">
        <h1 className="text-2xl font-extrabold text-gray-900">Commissions</h1>
        <p className="text-sm text-gray-500">Historique de vos gains de parrainage (Valeurs estimées, soumises au serveur).</p>
      </div>

      <div className="flex overflow-x-auto pb-2 gap-2 snap-x hide-scrollbar">
        {[
          { id: 'all', label: 'Toutes' },
          { id: 'available', label: 'Disponibles' },
          { id: 'pending', label: 'En attente' },
          { id: 'paid', label: 'Payées' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setFilter(tab.id as any)}
            className={`snap-start whitespace-nowrap px-4 py-2.5 rounded-full text-sm font-medium transition-colors ${
              filter === tab.id ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 text-blue-500 animate-spin" /></div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 bg-gray-50 rounded-2xl border border-gray-100">
          <Filter className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">Aucune commission pour ce filtre.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(com => (
            <Card key={com.id} className="border-none shadow-sm ring-1 ring-gray-100">
              <CardContent className="p-4 sm:p-5 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 ${
                    com.status === 'available' ? 'bg-green-50 text-green-600' :
                    com.status === 'pending' ? 'bg-orange-50 text-orange-600' :
                    'bg-gray-100 text-gray-500'
                  }`}>
                    <DollarSign className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900">{com.source}</h3>
                    <p className="text-xs text-gray-500 mt-0.5">Par: {com.referralName} • {new Date(com.date).toLocaleDateString('fr-FR')}</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-extrabold text-gray-900 text-lg">+{com.amount} {com.currency}</div>
                  <div className="flex items-center justify-end gap-1 mt-1">
                    {com.status === 'available' && <><CheckCircle2 className="w-3 h-3 text-green-500" /><span className="text-xs font-bold text-green-600">Disponible</span></>}
                    {com.status === 'pending' && <><Clock className="w-3 h-3 text-orange-500" /><span className="text-xs font-bold text-orange-600">En attente</span></>}
                    {com.status === 'paid' && <span className="text-xs font-bold text-gray-500">Payée</span>}
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
