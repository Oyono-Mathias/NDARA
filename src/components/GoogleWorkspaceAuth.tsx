import React, { useState } from 'react';
import { useGoogleLogin } from '@react-oauth/google';
import { MessageSquare, Loader2, Server } from 'lucide-react';
import { useToast } from '../hooks/use-toast';

interface GoogleWorkspaceAuthProps {
  onSuccess: (token: string) => void;
  label?: string;
}

export function GoogleWorkspaceAuth({ onSuccess, label = "Connecter Google Workspace" }: GoogleWorkspaceAuthProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const login = useGoogleLogin({
    onSuccess: (tokenResponse) => {
      setIsLoading(false);
      onSuccess(tokenResponse.access_token);
      toast({ title: "Google Workspace connecté" });
    },
    onError: (error) => {
      setIsLoading(false);
      console.error('Login Failed:', error);
      toast({ title: "Erreur de connexion", variant: "destructive" });
    },
    scope: 'https://www.googleapis.com/auth/chat.spaces https://www.googleapis.com/auth/chat.messages https://www.googleapis.com/auth/chat.memberships https://www.googleapis.com/auth/drive.readonly',
    flow: 'implicit'
  });

  return (
    <button
      onClick={() => {
        setIsLoading(true);
        login();
      }}
      disabled={isLoading}
      className="flex items-center gap-2 px-4 py-2 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 border border-blue-500/20 rounded-xl transition-all font-bold text-xs uppercase tracking-widest"
    >
      {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Server className="w-4 h-4" />}
      {label}
    </button>
  );
}
