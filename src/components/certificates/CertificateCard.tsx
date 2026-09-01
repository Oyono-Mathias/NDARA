import React from 'react';
import { Award, Calendar, CheckCircle } from 'lucide-react';
import { Certificate } from '../../services/certificateService';

interface CertificateCardProps {
  certificate: Certificate;
  onClick: (certificateId: string) => void;
}

export const CertificateCard: React.FC<CertificateCardProps> = ({ certificate, onClick }) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  return (
    <div 
      onClick={() => onClick(certificate.id)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick(certificate.id);
        }
      }}
      className="flex flex-col sm:flex-row items-start sm:items-center gap-4 p-4 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 hover:border-primary/50 transition-colors cursor-pointer group shadow-sm min-h-[44px]"
      aria-label={`Certificat pour ${certificate.courseTitle}`}
    >
      <div className="w-12 h-12 rounded-full bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center text-primary shrink-0">
        <Award className="w-6 h-6" />
      </div>

      <div className="flex-1 min-w-0">
        <h3 className="font-bold text-gray-900 dark:text-white text-base group-hover:text-primary transition-colors truncate">
          {certificate.courseTitle}
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Instructeur : {certificate.instructorName}
        </p>
      </div>

      <div className="flex flex-col sm:items-end gap-2 shrink-0 w-full sm:w-auto mt-2 sm:mt-0">
        <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800 px-2.5 py-1 rounded-md">
          <Calendar className="w-3.5 h-3.5" />
          {formatDate(certificate.issueDate)}
        </div>
        
        {certificate.status === 'generated' && (
          <div className="flex items-center gap-1 text-xs font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 px-2.5 py-1 rounded-md uppercase tracking-wider">
            <CheckCircle className="w-3.5 h-3.5" />
            Vérifié
          </div>
        )}
      </div>
    </div>
  );
};
