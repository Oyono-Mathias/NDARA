import React, { useState } from 'react';
import { Button } from './ui/button';
import { Dialog } from './ui/dialog';
import { HardDrive, File, AlertCircle } from 'lucide-react';

export interface DriveFile {
  id: string;
  name: string;
  mimeType: string;
  url: string;
}

export interface GoogleDriveFilePickerProps {
  onFileSelect: (file: DriveFile) => void;
  triggerButtonText?: string;
  className?: string;
}

export const GoogleDriveFilePicker: React.FC<GoogleDriveFilePickerProps> = ({ 
  onFileSelect, 
  triggerButtonText = 'Sélectionner depuis Google Drive',
  className
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [state, setState] = useState<'idle' | 'loading' | 'error' | 'ready'>('idle');

  const handleOpen = () => {
    setIsOpen(true);
    setState('loading');
    
    // Simulation du processus d'authentification et de chargement du picker
    setTimeout(() => {
      // NOTE: L'intégration réelle (gapi.client, google.accounts.oauth2)
      // sera implémentée lors d'une phase ultérieure avec des credentials valides.
      setState('ready');
    }, 1500);
  };

  const handleSimulateSelect = () => {
    const mockFile: DriveFile = {
      id: 'mock-file-12345',
      name: 'Document_Support_Formation.pdf',
      mimeType: 'application/pdf',
      url: 'https://drive.google.com/file/d/mock-file-12345/view'
    };
    onFileSelect(mockFile);
    setIsOpen(false);
  };

  return (
    <>
      <Button 
        type="button" 
        variant="outline" 
        className={className} 
        onClick={handleOpen}
      >
        <HardDrive className="mr-2 h-5 w-5 text-gray-600" />
        {triggerButtonText}
      </Button>

      <Dialog isOpen={isOpen} onClose={() => setIsOpen(false)} title="Google Drive">
        <div className="flex flex-col items-center justify-center py-6 px-4 text-center">
          {state === 'loading' && (
            <>
              <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mb-4" />
              <p className="text-gray-900 font-medium">Connexion à Google Drive en cours...</p>
              <p className="text-sm text-gray-500 mt-2">Veuillez patienter.</p>
            </>
          )}

          {state === 'error' && (
            <>
              <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
              <p className="text-gray-900 font-medium mb-2">Erreur de connexion</p>
              <p className="text-sm text-gray-500 mb-6">Impossible de se connecter à Google Drive. Vérifiez vos paramètres.</p>
              <Button onClick={handleOpen}>Réessayer</Button>
            </>
          )}

          {state === 'ready' && (
            <>
              <HardDrive className="w-12 h-12 text-blue-600 mb-4" />
              <p className="text-gray-900 font-medium mb-2">Drive connecté (Simulation)</p>
              <p className="text-sm text-gray-500 mb-6 max-w-sm mx-auto">
                L'intégration complète de Google Drive nécessite un Client ID et une API Key valides.
                Cette vue permet de simuler la sélection d'un fichier pour tester le workflow.
              </p>
              
              <div className="w-full bg-gray-50 rounded-xl p-4 border border-gray-200 text-left mb-6 max-w-sm mx-auto">
                <div className="flex items-center">
                  <File className="w-8 h-8 text-red-500 mr-3 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">Document_Support_Formation.pdf</p>
                    <p className="text-xs text-gray-500">Modifié aujourd'hui</p>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto max-w-sm mx-auto">
                <Button variant="outline" fullWidth onClick={() => setIsOpen(false)}>Annuler</Button>
                <Button variant="primary" fullWidth onClick={handleSimulateSelect}>Sélectionner ce fichier</Button>
              </div>
            </>
          )}
        </div>
      </Dialog>
    </>
  );
};
