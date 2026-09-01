import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Wallet, TrendingUp, Clock, AlertCircle, Loader2, ArrowRight } from 'lucide-react';

interface WalletData {
  available: number;
  pending: number;
  totalEarned: number;
  totalWithdrawn: number;
  currency: string;
}

export const AmbassadorWallet: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [wallet, setWallet] = useState<WalletData | null>(null);

  useEffect(() => {
    // Mock fetch - Données informatives uniquement
    setTimeout(() => {
      setWallet({
        available: 125000,
        pending: 15000,
        totalEarned: 240000,
        totalWithdrawn: 100000,
        currency: 'XAF'
      });
      setLoading(false);
    }, 600);
  }, []);

  if (loading) {
    return <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 text-blue-500 animate-spin" /></div>;
  }

  if (!wallet) return null;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-gray-900">Mon Portefeuille</h1>
        <p className="text-sm text-gray-500">Vue d'ensemble de vos revenus d'ambassadeur.</p>
      </div>

      <Card className="border-none shadow-sm ring-1 ring-blue-100 bg-gradient-to-br from-blue-600 to-blue-800 text-white overflow-hidden relative">
        <div className="absolute top-0 right-0 p-8 opacity-10">
          <Wallet className="w-32 h-32" />
        </div>
        <CardContent className="p-6 relative z-10">
          <p className="text-blue-100 font-medium mb-1">Solde disponible</p>
          <div className="text-4xl font-black mb-6">{wallet.available} {wallet.currency}</div>
          
          <div className="flex flex-col sm:flex-row gap-4">
            <Button className="bg-white text-blue-800 hover:bg-gray-50 flex-1 py-4 font-bold">
              Demander un retrait
            </Button>
          </div>
          <p className="text-xs text-blue-200 mt-4 text-center sm:text-left">
            * Les montants sont soumis à validation serveur.
          </p>
        </CardContent>
      </Card>

      <div className="grid grid-cols-2 gap-4">
        <Card className="border-none shadow-sm ring-1 ring-gray-100 bg-gray-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2 text-gray-600">
              <Clock className="w-4 h-4" />
              <span className="text-sm font-medium">En attente</span>
            </div>
            <p className="text-xl font-bold text-gray-900">{wallet.pending} {wallet.currency}</p>
          </CardContent>
        </Card>
        
        <Card className="border-none shadow-sm ring-1 ring-gray-100 bg-green-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2 text-green-700">
              <TrendingUp className="w-4 h-4" />
              <span className="text-sm font-medium">Total généré</span>
            </div>
            <p className="text-xl font-bold text-gray-900">{wallet.totalEarned} {wallet.currency}</p>
          </CardContent>
        </Card>
      </div>

      <div className="pt-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-gray-900">Activité récente</h2>
          <button className="text-blue-600 text-sm font-medium flex items-center">
            Voir tout <ArrowRight className="w-4 h-4 ml-1" />
          </button>
        </div>
        
        <div className="bg-orange-50 text-orange-800 p-4 rounded-xl text-sm flex items-start gap-3 border border-orange-100">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
          <p>Les transactions récentes sont en cours de synchronisation avec le serveur. Les affichages sont asynchrones.</p>
        </div>
      </div>
    </div>
  );
};
