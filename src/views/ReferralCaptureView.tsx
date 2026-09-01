import React, { useState } from 'react';
import { Card, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Users, Loader2 } from 'lucide-react';

export const ReferralCaptureView: React.FC = () => {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = () => {
    if (!code.trim()) return;
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      alert("Intention de parrainage envoyée. La commission finale est gérée par le backend.");
    }, 1000);
  };

  return (
    <div className="max-w-md mx-auto px-4 py-20 space-y-6">
      <div className="text-center">
        <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
          <Users className="w-8 h-8" />
        </div>
        <h1 className="text-2xl font-extrabold text-gray-900">Code Parrain</h1>
        <p className="text-sm text-gray-500 mt-2">Saisissez le code de votre parrain pour continuer.</p>
      </div>

      <Card className="border-none shadow-sm ring-1 ring-gray-200">
        <CardContent className="p-6 space-y-4">
          <div>
            <input 
              type="text" 
              placeholder="Ex: AMB-12345"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              className="w-full px-4 py-3 text-center bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 font-bold uppercase tracking-wider"
            />
          </div>
          <Button variant="primary" onClick={handleSubmit} disabled={loading || !code.trim()} className="w-full py-3">
            {loading ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : 'Valider le code'}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};
