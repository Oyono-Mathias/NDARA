import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '../components/ui/card';
import { ArrowDownLeft, ArrowUpRight, Clock, CheckCircle2, XCircle } from 'lucide-react';

export const Payments: React.FC = () => {
  const [loading, setLoading] = useState(true);

  // Mock data representing history
  const history = [
    { id: '1', type: 'debit', amount: 15000, status: 'success', date: '2026-08-25', description: 'Achat formation' },
    { id: '2', type: 'credit', amount: 50000, status: 'pending', date: '2026-08-28', description: 'Recharge Wallet' },
  ];

  useEffect(() => {
    setTimeout(() => setLoading(false), 800);
  }, []);

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold text-gray-900">Historique des transactions</h1>
        <p className="text-gray-500 mt-2">Suivez vos paiements et recharges.</p>
      </div>

      {loading ? (
        <div className="space-y-4 animate-pulse">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-24 bg-gray-100 rounded-2xl" />
          ))}
        </div>
      ) : history.length === 0 ? (
        <div className="text-center py-16 bg-gray-50 rounded-2xl border border-gray-100">
          <p className="text-gray-500">Aucune transaction trouvée.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {history.map((tx) => (
            <Card key={tx.id} className="border-none shadow-sm ring-1 ring-gray-100">
              <CardContent className="p-4 sm:p-6 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 ${
                    tx.type === 'credit' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'
                  }`}>
                    {tx.type === 'credit' ? <ArrowDownLeft className="w-6 h-6" /> : <ArrowUpRight className="w-6 h-6" />}
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900">{tx.description}</h3>
                    <p className="text-sm text-gray-500">{new Date(tx.date).toLocaleDateString('fr-FR')}</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className={`font-extrabold text-lg ${tx.type === 'credit' ? 'text-green-600' : 'text-gray-900'}`}>
                    {tx.type === 'credit' ? '+' : '-'}{tx.amount} FCFA
                  </div>
                  <div className="flex items-center justify-end text-xs font-medium mt-1">
                    {tx.status === 'success' && <><CheckCircle2 className="w-3 h-3 text-green-500 mr-1" /><span className="text-green-600">Complété</span></>}
                    {tx.status === 'pending' && <><Clock className="w-3 h-3 text-orange-500 mr-1" /><span className="text-orange-600">En cours</span></>}
                    {tx.status === 'failed' && <><XCircle className="w-3 h-3 text-red-500 mr-1" /><span className="text-red-600">Échoué</span></>}
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
