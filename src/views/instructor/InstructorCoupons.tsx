import React, { useState } from 'react';
import { Card, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Ticket, Plus, AlertCircle, Loader2 } from 'lucide-react';

export const InstructorCoupons: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [code, setCode] = useState('');

  const handleCreate = () => {
    if (!code.trim()) return;
    setLoading(true);
    // Intention de création
    setTimeout(() => {
      setLoading(false);
      setCode('');
    }, 1500);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-gray-900">Coupons & Réductions</h1>
        <p className="text-sm text-gray-500">Créez des codes promo pour attirer plus d'étudiants.</p>
      </div>

      <Card className="border-none shadow-sm ring-1 ring-gray-200">
        <CardContent className="p-6 space-y-4">
          <h3 className="font-bold text-gray-900 flex items-center gap-2">
            <Plus className="w-5 h-5" /> Nouveau coupon
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Code promotionnel</label>
              <input 
                type="text" 
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                placeholder="Ex: RENTREE2026"
                className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none uppercase"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Réduction (%)</label>
              <input 
                type="number" 
                inputMode="numeric"
                placeholder="Ex: 20"
                min="1" max="100"
                className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
          </div>
          
          <div className="bg-orange-50 p-4 rounded-xl flex items-start gap-3 border border-orange-100 text-sm text-orange-800">
            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
            <p>L'application d'un coupon sur une transaction est toujours validée et calculée de manière autoritaire par le serveur de paiement.</p>
          </div>

          <Button variant="primary" onClick={handleCreate} disabled={loading || !code.trim()} className="w-full md:w-auto px-8 py-3">
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Créer le coupon'}
          </Button>
        </CardContent>
      </Card>

      <div className="pt-6">
        <h3 className="font-bold text-gray-900 mb-4">Coupons actifs</h3>
        <div className="space-y-3">
          {[1].map((c) => (
            <Card key={c} className="border-none shadow-sm ring-1 ring-gray-100">
              <CardContent className="p-4 flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-50 text-green-600 rounded-lg flex items-center justify-center shrink-0 border border-green-100 border-dashed">
                    <Ticket className="w-5 h-5 transform -rotate-45" />
                  </div>
                  <div>
                    <h4 className="font-black text-gray-900 tracking-wider">EARLYBIRD50</h4>
                    <p className="text-xs text-gray-500">-50% sur tous les cours</p>
                  </div>
                </div>
                <Button variant="outline" className="text-xs text-red-600 border-red-200 hover:bg-red-50">Désactiver</Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};
