import React, { useState } from 'react';
import { useGoogleLogin } from '@react-oauth/google';
import { useToast } from '../hooks/use-toast';
import { Loader2, UploadCloud, FileText, Image as ImageIcon } from 'lucide-react';
import { auth } from '../firebase';

interface GoogleDriveFilePickerProps {
  onFileImported?: (url: string, fileName: string) => void;
  onFilePicked?: (accessToken: string, fileId: string, fileName: string, mimeType: string) => void;
  allowedTypes: 'PDF' | 'IMAGE' | 'VIDEO' | 'ALL';
  folder: string;
  label?: string;
  className?: string;
}

export function GoogleDriveFilePicker({ onFileImported, onFilePicked, allowedTypes, folder, label = "Importer depuis Google Drive", className }: GoogleDriveFilePickerProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const loadPickerScript = () => {
    return new Promise((resolve, reject) => {
      if ((window as any).google && (window as any).google.picker) {
        resolve(true);
        return;
      }
      const script = document.createElement('script');
      script.src = 'https://apis.google.com/js/api.js';
      script.onload = () => {
        (window as any).gapi.load('picker', { callback: () => resolve(true) });
      };
      script.onerror = reject;
      document.body.appendChild(script);
    });
  };

  const handleDriveFilePicked = async (accessToken: string, fileId: string, fileName: string, mimeType: string) => {
    if (onFilePicked) {
      onFilePicked(accessToken, fileId, fileName, mimeType);
      setIsLoading(false);
      return;
    }
    try {
      setIsLoading(true);
      const idToken = await auth.currentUser?.getIdToken();
      const res = await fetch('/api/admin/file/drive-to-storage', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${idToken}`
        },
        body: JSON.stringify({ fileId, driveToken: accessToken, fileName, folder, mimeType })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erreur de transfert");
      
      toast({ title: "Fichier importé avec succès !", description: fileName });
      if (onFileImported) onFileImported(data.publicUrl, fileName);
    } catch(err: any) {
      console.error(err instanceof Error ? err.message : String(err));
      toast({ title: "Erreur lors de l'import", description: err.message, variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const loginGoogleDrive = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      try {
        setIsLoading(true);
        await loadPickerScript();
        
        const pickerOrigin = window.location.protocol + '//' + window.location.host;
          
        let viewId = (window as any).google.picker.ViewId.DOCS;
        if (allowedTypes === 'PDF') viewId = (window as any).google.picker.ViewId.PDFS;
        else if (allowedTypes === 'VIDEO') viewId = (window as any).google.picker.ViewId.DOCS_VIDEOS;
        else if (allowedTypes === 'IMAGE') viewId = (window as any).google.picker.ViewId.DOCS_IMAGES;
        
        const picker = new (window as any).google.picker.PickerBuilder().setAppId('gen-lang-client-0381307586')
          .addView(viewId)
          .setOAuthToken(tokenResponse.access_token)
          .setCallback((data: any) => {
            if (data.action === (window as any).google.picker.Action.PICKED) {
              const file = data.docs[0];
              handleDriveFilePicked(tokenResponse.access_token, file.id, file.name, file.mimeType);
            } else if (data.action === (window as any).google.picker.Action.CANCEL) {
              setIsLoading(false);
            }
          })
          .setOrigin(pickerOrigin)
          .build();
          
        picker.setVisible(true);
      } catch (err) {
        setIsLoading(false);
        toast({ title: "Erreur de chargement du Picker", variant: "destructive" });
      }
    },
    onError: () => {
      setIsLoading(false);
      toast({ title: "Erreur de connexion à Google", variant: "destructive" });
    },
    scope: 'https://www.googleapis.com/auth/drive.readonly',
  });

  const Icon = allowedTypes === 'IMAGE' ? ImageIcon : allowedTypes === 'PDF' ? FileText : UploadCloud;

  return (
    <button
      type="button"
      onClick={() => {
        setIsLoading(true);
        loginGoogleDrive();
      }}
      disabled={isLoading}
      className={className || "flex items-center gap-2 px-4 py-2 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 border border-blue-500/20 rounded-xl transition-all font-bold text-xs uppercase tracking-widest disabled:opacity-50"}
    >
      {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Icon className="w-4 h-4" />}
      {isLoading ? 'Importation...' : label}
    </button>
  );
}
