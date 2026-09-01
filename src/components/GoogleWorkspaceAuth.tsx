import React, { useState } from 'react';
import { Button } from './ui/button';
import { Dialog } from './ui/dialog';
import { Briefcase, AlertCircle, CheckCircle2 } from 'lucide-react';

export interface GoogleWorkspaceAuthProps {
  onAuthenticated: () => void;
  className?: string;
  triggerButtonText?: string;
}

export const GoogleWorkspaceAuth: React.FC<GoogleWorkspaceAuthProps> = ({
  onAuthenticated,
  className,
  triggerButtonText = 'Connecter Google Workspace'
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [state, setState] = useState<'idle' | 'loading' | 'error' | 'authenticated'>('idle');

  const handleOpen = () => {
    setIsOpen(true);
    setState('idle');
  };

  const handleSimulateAuth = () => {
    setState('loading');
    
    // Simulation du processus d'autorisation OAuth (sans backend réel ni credential)
    setTimeout(() => {
      // NOTE: L'implémentation réelle utilisera google.accounts.oauth2.initTokenClient
      // dans une phase future disposant du Client ID.
      setState('authenticated');
    }, 1500);
  };

  const handleConfirm = () => {
    setIsOpen(false);
    onAuthenticated();
  };

  return (
    <>
      <Button 
        type="button" 
        variant="outline" 
        className={className} 
        onClick={handleOpen}
      >
        <Briefcase className="mr-2 h-5 w-5 text-blue-600" />
        {triggerButtonText}
      </Button>

      <Dialog isOpen={isOpen} onClose={() => setIsOpen(false)} title="Google Workspace">
        <div className="flex flex-col items-center justify-center py-6 px-4 text-center">
          
          {state === 'idle' && (
            <>
              <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mb-4">
                <Briefcase className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Connecter votre espace de travail</h3>
              <p className="text-sm text-gray-500 mb-6 max-w-sm mx-auto">
                Associez votre compte Google Workspace pour synchroniser vos documents, agenda et emails. 
                (Ceci est une simulation de l'interface OAuth.)
              </p>
              <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto max-w-sm mx-auto">
                <Button variant="ghost" fullWidth onClick={() => setIsOpen(false)}>
                  Plus tard
                </Button>
                <Button variant="primary" fullWidth onClick={handleSimulateAuth}>
                  Autoriser l'accès
                </Button>
              </div>
            </>
          )}

          {state === 'loading' && (
            <div className="py-8">
              <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mb-4 mx-auto" />
              <p className="text-gray-900 font-medium">Authentification en cours...</p>
              <p className="text-sm text-gray-500 mt-2">Veuillez patienter.</p>
            </div>
          )}

          {state === 'error' && (
            <div className="py-4">
              <AlertCircle className="w-12 h-12 text-red-500 mb-4 mx-auto" />
              <p className="text-gray-900 font-medium mb-2">Échec de l'autorisation</p>
              <p className="text-sm text-gray-500 mb-6">La demande d'accès a été refusée ou a expiré.</p>
              <Button onClick={() => setState('idle')}>Réessayer</Button>
            </div>
          )}

          {state === 'authenticated' && (
            <div className="py-4">
              <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mb-4 mx-auto">
                <CheckCircle2 className="w-8 h-8 text-green-600" />
              </div>
              <p className="text-gray-900 font-bold text-lg mb-2">Connexion réussie</p>
              <p className="text-sm text-gray-500 mb-6 max-w-sm mx-auto">
                Votre compte Google Workspace est maintenant associé de manière simulée.
              </p>
              <Button variant="primary" fullWidth onClick={handleConfirm} className="max-w-sm mx-auto">
                Continuer
              </Button>
            </div>
          )}

        </div>
      </Dialog>
    </>
  );
};
