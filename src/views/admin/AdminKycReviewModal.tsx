import React, { useState } from 'react';
import { Button } from '../../components/ui/button';
import { ShieldCheck, XCircle, FileText, Loader2 } from 'lucide-react';

interface Props {
  onClose: () => void;
}

export const AdminKycReviewModal: React.FC<Props> = ({ onClose }) => {
  const [loading, setLoading] = useState(false);

  const handleAction = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      alert('Décision KYC envoyée au backend pour validation.');
      onClose();
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-xl" role="dialog" aria-modal="true">
        <div className="p-6 space-y-6">
          <h2 className="text-xl font-bold text-gray-900">Revue KYC (Simulation)</h2>
          
          <div className="space-y-4">
            <div className="p-4 bg-gray-50 rounded-xl flex items-center gap-3 border border-gray-100">
              <FileText className="w-8 h-8 text-gray-400" />
              <div>
                <p className="text-sm font-bold text-gray-900">Document d'identité.pdf</p>
                <p className="text-xs text-gray-500">Non téléchargeable en mode dev</p>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-3 pt-4 border-t border-gray-100">
            <Button variant="primary" onClick={handleAction} disabled={loading} className="w-full bg-green-600 hover:bg-green-700">
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <><ShieldCheck className="w-5 h-5 mr-2" /> Approuver (Intention)</>}
            </Button>
            <Button variant="outline" onClick={handleAction} disabled={loading} className="w-full text-red-600 border-red-200">
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <><XCircle className="w-5 h-5 mr-2" /> Rejeter</>}
            </Button>
            <Button variant="ghost" onClick={onClose} disabled={loading} className="w-full">
              Annuler
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
