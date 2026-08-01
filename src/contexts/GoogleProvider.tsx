import React from 'react';
import { GoogleOAuthProvider } from '@react-oauth/google';
import firebaseConfig from '../../firebase-applet-config.json';

export function GoogleProvider({ children }: { children: React.ReactNode }) {
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || firebaseConfig.oAuthClientId || '1234567890-mockclientid.apps.googleusercontent.com';
  
  return (
    <GoogleOAuthProvider clientId={clientId}>
      {children}
    </GoogleOAuthProvider>
  );
}
