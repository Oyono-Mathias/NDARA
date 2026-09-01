import React from 'react';
import { Dialog } from '../ui/dialog';
import { Button } from '../ui/button';
import { Award } from 'lucide-react';

export interface CertificateData {
  id: string;
  title: string;
  recipientName: string;
  dateIssued: string;
  imageUrl?: string;
}

export interface CertificateModalProps {
  isOpen: boolean;
  onClose: () => void;
  certificate: CertificateData | null;
  onDownload?: (cert: CertificateData) => void;
}

export const CertificateModal: React.FC<CertificateModalProps> = ({ 
  isOpen, 
  onClose, 
  certificate,
  onDownload
}) => {
  if (!certificate) return null;

  return (
    <Dialog isOpen={isOpen} onClose={onClose} title="Votre Certificat">
      <div className="flex flex-col items-center text-center py-4">
        <div className="w-20 h-20 bg-yellow-50 rounded-full flex items-center justify-center mb-4">
          <Award className="w-10 h-10 text-yellow-500" />
        </div>
        
        <h3 className="text-xl font-bold text-gray-900 mb-1">{certificate.title}</h3>
        <p className="text-sm text-gray-500 mb-6">
          Délivré le {new Date(certificate.dateIssued).toLocaleDateString('fr-FR')}
        </p>

        {certificate.imageUrl ? (
          <div className="w-full bg-gray-100 rounded-xl overflow-hidden mb-6 border border-gray-200">
            <img 
              src={certificate.imageUrl} 
              alt={`Certificat ${certificate.title} pour ${certificate.recipientName}`}
              className="w-full h-auto object-contain"
            />
          </div>
        ) : (
          <div className="w-full aspect-[4/3] bg-gray-50 rounded-xl mb-6 border-2 border-dashed border-gray-200 flex flex-col items-center justify-center p-6">
            <p className="text-lg font-serif text-gray-800 mb-2">NDARA AFRIQUE</p>
            <p className="text-sm text-gray-500 uppercase tracking-widest mb-4">Certificat de réussite</p>
            <p className="font-medium text-gray-900 text-xl">{certificate.recipientName}</p>
          </div>
        )}

        <div className="w-full flex flex-col gap-3">
          {onDownload && (
            <Button fullWidth onClick={() => onDownload(certificate)}>
              Télécharger le PDF
            </Button>
          )}
          <Button fullWidth variant="secondary" onClick={onClose}>
            Fermer
          </Button>
        </div>
      </div>
    </Dialog>
  );
};
