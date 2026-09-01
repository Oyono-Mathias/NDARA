import React, { createContext, useContext, useState } from 'react';
import { AuthService } from '../services/authService';
import { normalizeFirebaseError, AppError } from '../utils/firebaseErrors';

interface GoogleAuthContextType {
  signInWithGoogle: () => Promise<void>;
  loading: boolean;
  error: AppError | null;
}

const GoogleAuthContext = createContext<GoogleAuthContextType | undefined>(undefined);

export const GoogleProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<AppError | null>(null);

  const signIn = async () => {
    try {
      setLoading(true);
      setError(null);
      await AuthService.signInWithGoogle();
      // OnAuthStateChanged dans AuthContext prendra le relais pour l'état global
    } catch (err) {
      const appError = normalizeFirebaseError(err);
      setError(appError);
      // Optionnel: log l'erreur pour un tracking sans exploser l'UI
      console.error('Erreur Google Sign-In:', appError);
    } finally {
      setLoading(false);
    }
  };

  const value: GoogleAuthContextType = {
    signInWithGoogle: signIn,
    loading,
    error
  };

  return (
    <GoogleAuthContext.Provider value={value}>
      {children}
    </GoogleAuthContext.Provider>
  );
};

export const useGoogleAuth = (): GoogleAuthContextType => {
  const context = useContext(GoogleAuthContext);
  if (context === undefined) {
    throw new Error('useGoogleAuth doit être utilisé à l\'intérieur d\'un GoogleProvider');
  }
  return context;
};
