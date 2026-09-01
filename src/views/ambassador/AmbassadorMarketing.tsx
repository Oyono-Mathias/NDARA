import React, { useState } from 'react';
import { Card, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Copy, Link as LinkIcon, BarChart2, CheckCircle2, AlertCircle } from 'lucide-react';

export const AmbassadorMarketing: React.FC = () => {
  const [copied, setCopied] = useState(false);
  const referralLink = "https://ndara.app/ref/DEMO-AMBASSADOR";

  const handleCopy = () => {
    navigator.clipboard.writeText(referralLink).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }).catch(() => {
      alert("Échec de la copie du lien. Veuillez le sélectionner manuellement.");
    });
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-gray-900">Outils Marketing</h1>
        <p className="text-sm text-gray-500">Ressources pour promouvoir la plateforme.</p>
      </div>

      <div className="bg-blue-50 p-4 rounded-xl flex items-start gap-3 border border-blue-100 text-sm text-blue-800">
        <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
        <p>Les statistiques ci-dessous sont fournies par le serveur. L'ambassadeur ne peut en aucun cas modifier localement ses performances ou ses conversions.</p>
      </div>

      <Card className="border-none shadow-sm ring-1 ring-gray-200">
        <CardContent className="p-6">
          <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
            <LinkIcon className="w-5 h-5" /> Votre lien de parrainage
          </h3>
          <div className="flex flex-col sm:flex-row gap-3">
            <input 
              type="text" 
              readOnly 
              value={referralLink}
              className="flex-1 px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none text-gray-600 text-sm"
            />
            <Button 
              variant="outline" 
              onClick={handleCopy}
              className="py-3 px-6 sm:w-auto w-full"
            >
              {copied ? <CheckCircle2 className="w-5 h-5 mr-2 text-green-500" /> : <Copy className="w-5 h-5 mr-2" />}
              {copied ? 'Copié !' : 'Copier'}
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Card className="border-none shadow-sm ring-1 ring-gray-100">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 text-blue-600 mb-2">
              <BarChart2 className="w-5 h-5" />
              <span className="text-sm font-medium">Clics totaux</span>
            </div>
            <p className="text-3xl font-black text-gray-900">342</p>
            <p className="text-xs text-gray-500 mt-1">Données des 30 derniers jours</p>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm ring-1 ring-gray-100">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 text-green-600 mb-2">
              <CheckCircle2 className="w-5 h-5" />
              <span className="text-sm font-medium">Taux de conversion</span>
            </div>
            <p className="text-3xl font-black text-gray-900">3.5%</p>
            <p className="text-xs text-gray-500 mt-1">Données des 30 derniers jours</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
