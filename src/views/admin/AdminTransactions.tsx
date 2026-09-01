import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '../../components/ui/card';
import { Search, ArrowDownLeft, ArrowUpRight, Loader2, Filter } from 'lucide-react';

interface Transaction {
  id: string;
  type: 'credit' | 'debit' | 'payment' | 'withdrawal';
  amount: number;
  currency: string;
  status: 'pending' | 'completed' | 'failed' | 'cancelled';
  date: string;
  user: string;
}

export const AdminTransactions: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState<'all' | 'pending' | 'completed'>('all');

  // Données de démonstration - Ne pas considérer comme autorité financière
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  useEffect(() => {
    // Mock fetch
    setTimeout(() => {
      setTransactions([
        { id: 'tx_101', type: 'payment', amount: 15000, currency: 'XAF', status: 'completed', date: '2026-08-28T10:00:00Z', user: 'Jean Dupont' },
        { id: 'tx_102', type: 'withdrawal', amount: 50000, currency: 'XAF', status: 'pending', date: '2026-08-28T09:30:00Z', user: 'Marie Curie' },
        { id: 'tx_103', type: 'credit', amount: 5000, currency: 'XAF', status: 'completed', date: '2026-08-27T14:15:00Z', user: 'Paul Martin' },
      ]);
      setLoading(false);
    }, 800);
  }, []);

  const filtered = transactions.filter(tx => {
    const matchSearch = tx.user.toLowerCase().includes(searchTerm.toLowerCase()) || tx.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchFilter = filter === 'all' || tx.status === filter;
    return matchSearch && matchFilter;
  });

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
      <div className="flex flex-col space-y-2">
        <h1 className="text-2xl font-extrabold text-gray-900">Transactions (Admin)</h1>
        <p className="text-sm text-gray-500">Vue en lecture seule des flux financiers. Données informatives.</p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Card className="border-none shadow-sm ring-1 ring-gray-100 bg-blue-50">
          <CardContent className="p-4">
            <p className="text-sm text-blue-600 font-medium">Volume (7j)</p>
            <p className="text-2xl font-black text-gray-900 mt-1">~70 000 XAF</p>
          </CardContent>
        </Card>
        <Card className="border-none shadow-sm ring-1 ring-gray-100 bg-orange-50">
          <CardContent className="p-4">
            <p className="text-sm text-orange-600 font-medium">En attente</p>
            <p className="text-2xl font-black text-gray-900 mt-1">1</p>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input 
            type="text" 
            placeholder="Rechercher par ID ou utilisateur..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="flex gap-2">
          <button onClick={() => setFilter('all')} className={`px-4 py-3 rounded-xl text-sm font-medium transition-colors ${filter === 'all' ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-600'}`}>Tous</button>
          <button onClick={() => setFilter('pending')} className={`px-4 py-3 rounded-xl text-sm font-medium transition-colors ${filter === 'pending' ? 'bg-orange-100 text-orange-700' : 'bg-gray-100 text-gray-600'}`}>En attente</button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 text-blue-500 animate-spin" /></div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-2xl border border-gray-100">
          <Filter className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">Aucune transaction trouvée.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map(tx => (
            <Card key={tx.id} className="border-none shadow-sm ring-1 ring-gray-100">
              <CardContent className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 ${['credit', 'payment'].includes(tx.type) ? 'bg-green-50 text-green-600' : 'bg-orange-50 text-orange-600'}`}>
                    {['credit', 'payment'].includes(tx.type) ? <ArrowDownLeft className="w-6 h-6" /> : <ArrowUpRight className="w-6 h-6" />}
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 line-clamp-1">{tx.user}</h3>
                    <p className="text-xs text-gray-500">{tx.id} • {new Date(tx.date).toLocaleDateString('fr-FR')}</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-extrabold text-gray-900">{tx.amount} {tx.currency}</div>
                  <div className={`text-xs font-bold mt-1 ${tx.status === 'completed' ? 'text-green-600' : tx.status === 'pending' ? 'text-orange-600' : 'text-red-600'}`}>
                    {tx.status.toUpperCase()}
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
