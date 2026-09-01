import React from 'react';
import { Certificate } from '../../services/certificateService';

interface CertificateTemplateProps {
  certificate: Certificate;
}

export const CertificateTemplate: React.FC<CertificateTemplateProps> = ({ certificate }) => {
  const formattedIssueDate = new Date(certificate.issueDate).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  return (
    <div className="relative bg-white text-gray-900 w-full max-w-4xl mx-auto rounded-lg overflow-hidden shadow-2xl print:shadow-none aspect-[1.414/1] sm:aspect-auto sm:min-h-[600px] flex flex-col p-4 sm:p-8 md:p-12 border border-gray-200">
      {/* Decorative Borders */}
      <div className="absolute inset-2 border-2 border-primary/20 pointer-events-none rounded-md" />
      <div className="absolute inset-4 border border-primary/10 pointer-events-none rounded-sm" />

      {/* Main Content Container */}
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center text-center px-4 py-8 h-full bg-white/95">
        
        {/* Header / Logo */}
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-primary uppercase">
            Ndara
          </h1>
          <p className="text-xs sm:text-sm font-semibold tracking-widest text-gray-400 uppercase mt-2">
            Plateforme d'excellence
          </p>
        </div>

        <h2 className="text-xl sm:text-3xl md:text-4xl font-serif italic text-gray-800 mb-6 sm:mb-10">
          Certificat de Réussite
        </h2>

        <p className="text-sm sm:text-base text-gray-600 mb-2">
          Ceci certifie que
        </p>

        <h3 className="text-2xl sm:text-4xl font-bold text-gray-900 mb-2 sm:mb-4 border-b border-gray-200 pb-2 px-8 min-w-[60%]">
          {certificate.studentName}
        </h3>

        <p className="text-sm sm:text-base text-gray-600 mb-6 sm:mb-8 max-w-2xl mx-auto">
          a suivi avec succès et complété les exigences du programme de formation intitulé :
        </p>

        <h4 className="text-xl sm:text-2xl font-bold text-primary mb-8 sm:mb-12">
          "{certificate.courseTitle}"
        </h4>

        {/* Footer info (Signatures & Dates) */}
        <div className="w-full mt-auto flex flex-col sm:flex-row justify-between items-center gap-6 sm:gap-12 px-4 sm:px-12">
          
          <div className="flex flex-col items-center">
            <div className="w-32 sm:w-40 border-b border-gray-400 mb-2 pb-2">
              <span className="font-serif italic text-gray-800">{certificate.instructorName}</span>
            </div>
            <span className="text-xs sm:text-sm text-gray-500 uppercase tracking-wider">Instructeur</span>
          </div>

          <div className="flex flex-col items-center">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full border-2 border-amber-500 flex items-center justify-center mb-2 bg-amber-50 relative">
              <div className="absolute inset-1 border border-amber-500/50 rounded-full" />
              <span className="text-amber-600 text-[10px] sm:text-xs font-bold uppercase tracking-tighter text-center leading-none">
                Ndara<br/>Officiel
              </span>
            </div>
          </div>

          <div className="flex flex-col items-center">
            <div className="w-32 sm:w-40 border-b border-gray-400 mb-2 pb-2 text-gray-800">
              {formattedIssueDate}
            </div>
            <span className="text-xs sm:text-sm text-gray-500 uppercase tracking-wider">Date d'émission</span>
          </div>
          
        </div>

      </div>

      {/* Verification Footer */}
      <div className="absolute bottom-2 left-0 w-full text-center text-[10px] sm:text-xs text-gray-400">
        <p>ID Certificat: {certificate.certificateNumber} • Code de vérification: {certificate.verificationCode}</p>
      </div>

    </div>
  );
};
