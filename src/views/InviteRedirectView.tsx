import React from 'react';
import { Loader2, MailPlus } from 'lucide-react';

export const InviteRedirectView: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
      <div className="p-4 bg-blue-100 text-blue-600 rounded-full mb-6">
        <MailPlus className="w-8 h-8" />
      </div>
      <h2 className="text-2xl font-extrabold text-gray-900 text-center">Traitement de l'invitation</h2>
      <p className="text-sm text-gray-500 mt-2 mb-6 text-center max-w-sm">
        Le code d'invitation est en cours de validation par le serveur. L'attribution réelle des récompenses sera traitée en backend.
      </p>
      <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
    </div>
  );
};
