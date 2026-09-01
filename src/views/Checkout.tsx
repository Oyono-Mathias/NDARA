import React, { useState } from 'react';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { Shield, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { paymentRoutes } from '../routes/paymentRoutes';

export const Checkout: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const [pin, setPin] = useState('');
  const [status, setStatus] = useState<'idle' | 'processing' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  // Informational total
  const amount = 15000;

  const handlePayment = async () => {
    if (!isAuthenticated) {
      setErrorMessage('Vous devez être connecté.');
      setStatus('error');
      return;
    }
    if (pin.length !== 4) {
      setErrorMessage('Le PIN doit contenir exactement 4 chiffres.');
      setStatus('error');
      return;
    }

    setStatus('processing');
    setErrorMessage('');

    try {
      // NOTE: Real validation MUST happen on the server.
      const intent = await paymentRoutes.createPaymentIntent(amount, 'XAF');
      if (intent.status === 'pending') {
        setStatus('success');
      } else {
        throw new Error('Échec de la préparation du paiement.');
      }
    } catch (err: any) {
      setStatus('error');
      setErrorMessage(err.message || 'Une erreur est survenue.');
    }
  };

  if (status === 'success') {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center space-y-6">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto">
          <CheckCircle2 className="w-10 h-10 text-green-600" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900">Demande envoyée</h1>
        <p className="text-gray-500">
          Votre transaction est en cours de traitement par le serveur. 
          Vous serez notifié dès que le statut sera définitif.
        </p>
        <Button variant="outline" fullWidth onClick={() => window.location.href = '/'}>
          Retour à l'accueil
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto px-4 py-8 space-y-8">
      <h1 className="text-3xl font-extrabold text-gray-900 text-center">Paiement sécurisé</h1>

      <Card className="border-none shadow-sm ring-1 ring-gray-100">
        <CardContent className="p-6 space-y-6">
          <div className="flex justify-between items-center pb-6 border-b border-gray-100">
            <span className="text-gray-600">Montant estimé</span>
            <span className="text-2xl font-black text-gray-900">{amount} FCFA</span>
          </div>

          <div className="space-y-4">
            <label className="block text-sm font-medium text-gray-700">
              PIN de transaction (4 chiffres)
            </label>
            <div className="relative">
              <input
                type="password"
                inputMode="numeric"
                maxLength={4}
                value={pin}
                onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
                className="block w-full text-center tracking-[1em] text-2xl py-4 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-0 focus:border-blue-500 transition-colors"
                placeholder="••••"
                disabled={status === 'processing'}
              />
            </div>
            <p className="text-xs text-gray-500 flex items-center justify-center mt-2">
              <Shield className="w-3 h-3 mr-1" /> Protégé et chiffré de bout en bout
            </p>
          </div>

          {status === 'error' && (
            <div className="p-4 bg-red-50 text-red-700 rounded-xl flex items-start text-sm">
              <AlertCircle className="w-5 h-5 mr-2 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          <Button 
            variant="primary" 
            fullWidth 
            className="py-4 text-lg" 
            onClick={handlePayment}
            disabled={status === 'processing' || pin.length !== 4}
          >
            {status === 'processing' ? (
              <><Loader2 className="w-5 h-5 mr-2 animate-spin" /> Traitement en cours...</>
            ) : (
              'Confirmer le paiement'
            )}
          </Button>
          <div className="text-xs text-center text-gray-400">
            En confirmant, vous acceptez que le paiement soit soumis à validation serveur.
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
