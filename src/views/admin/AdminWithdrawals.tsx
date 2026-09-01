import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Shield, Loader2, CheckCircle2, AlertCircle, Clock } from 'lucide-react';

interface WithdrawalRequest {
  id: string;
  userId: string;
  userName: string;
  amount: number;
  currency: string;
  method: string;
  status: 'pending' | 'processing' | 'approved' | 'rejected';
  date: string;
}

export const AdminWithdrawals: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [requests, setRequests] = useState<WithdrawalRequest[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [pin, setPin] = useState('');
  const [actionState, setActionState] = useState<'idle' | 'processing' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    setTimeout(() => {
      setRequests([
        { id: 'wreq_001', userId: 'u1', userName: 'Marie Curie', amount: 50000, currency: 'XAF', method: 'Mobile Money', status: 'pending', date: '2026-08-28T09:30:00Z' },
        { id: 'wreq_002', userId: 'u2', userName: 'Jean Dupont', amount: 15000, currency: 'XAF', method: 'Virement', status: 'pending', date: '2026-08-27T10:15:00Z' }
      ]);
      setLoading(false);
    }, 800);
  }, []);

  const handleApproveIntent = (id: string) => {
    setSelectedId(id);
    setPin('');
    setActionState('idle');
  };

  const submitApproval = async () => {
    if (pin.length !== 4) return;
    setActionState('processing');
    setErrorMessage('');

    // Simulation d'une transmission d'intention au serveur
    setTimeout(() => {
      // NOTE ZERO TRUST: Ceci n'est qu'une intention. Le backend doit valider.
      setActionState('success');
      setRequests(prev => prev.filter(r => r.id !== selectedId));
      setTimeout(() => {
        setSelectedId(null);
        setActionState('idle');
      }, 3000);
    }, 1500);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-gray-900">Demandes de retrait</h1>
        <p className="text-sm text-gray-500">Validation administrative soumise à vérification serveur.</p>
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 text-blue-500 animate-spin" /></div>
      ) : requests.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-2xl border border-gray-100">
          <CheckCircle2 className="w-12 h-12 text-green-300 mx-auto mb-3" />
          <p className="text-gray-500">Aucune demande en attente.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {requests.map(req => (
            <Card key={req.id} className={`border-none shadow-sm ring-1 transition-all ${selectedId === req.id ? 'ring-blue-500 bg-blue-50/30' : 'ring-gray-200'}`}>
              <CardContent className="p-4 sm:p-6">
                <div className="flex flex-col sm:flex-row justify-between gap-4">
                  <div>
                    <h3 className="font-bold text-gray-900">{req.userName}</h3>
                    <p className="text-sm text-gray-500 mt-1">ID: {req.id} • {req.method}</p>
                    <div className="flex items-center gap-1 mt-2 text-xs font-medium text-orange-600 bg-orange-100 w-max px-2 py-1 rounded-md">
                      <Clock className="w-3 h-3" /> En attente
                    </div>
                  </div>
                  <div className="text-left sm:text-right">
                    <div className="text-2xl font-black text-gray-900">{req.amount} {req.currency}</div>
                    <p className="text-xs text-gray-400 mt-1">{new Date(req.date).toLocaleString('fr-FR')}</p>
                  </div>
                </div>

                {selectedId !== req.id ? (
                  <div className="mt-6 flex gap-3">
                    <Button variant="outline" className="flex-1 text-red-600 border-red-200 hover:bg-red-50">Refuser</Button>
                    <Button variant="primary" className="flex-1" onClick={() => handleApproveIntent(req.id)}>Approuver</Button>
                  </div>
                ) : (
                  <div className="mt-6 pt-6 border-t border-blue-100 space-y-4">
                    <div className="bg-white p-4 rounded-xl border border-gray-200">
                      <label className="block text-sm font-medium text-gray-700 text-center mb-4">
                        PIN de validation (4 chiffres)
                      </label>
                      <input
                        type="password"
                        inputMode="numeric"
                        maxLength={4}
                        value={pin}
                        onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
                        className="block w-full max-w-xs mx-auto text-center tracking-[1em] text-2xl py-3 border-2 border-gray-200 rounded-xl focus:ring-0 focus:border-blue-500"
                        placeholder="••••"
                        disabled={actionState === 'processing' || actionState === 'success'}
                      />
                      <p className="text-xs text-gray-400 text-center mt-3 flex items-center justify-center">
                        <Shield className="w-3 h-3 mr-1" /> Autorisation requise
                      </p>
                    </div>

                    {actionState === 'error' && (
                      <div className="p-3 bg-red-50 text-red-700 rounded-lg flex items-center text-sm">
                        <AlertCircle className="w-4 h-4 mr-2 shrink-0" /> {errorMessage}
                      </div>
                    )}

                    {actionState === 'success' ? (
                      <div className="p-4 bg-green-50 text-green-800 rounded-xl text-center text-sm font-medium flex items-center justify-center">
                        <CheckCircle2 className="w-5 h-5 mr-2" /> Intention transmise. En attente de validation serveur.
                      </div>
                    ) : (
                      <div className="flex gap-3">
                        <Button variant="outline" className="flex-1" onClick={() => setSelectedId(null)} disabled={actionState === 'processing'}>
                          Annuler
                        </Button>
                        <Button variant="primary" className="flex-1" onClick={submitApproval} disabled={pin.length !== 4 || actionState === 'processing'}>
                          {actionState === 'processing' ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : 'Confirmer l\'intention'}
                        </Button>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
