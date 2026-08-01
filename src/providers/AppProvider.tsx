import { ReactNode } from 'react';
import { AuthProvider } from '../contexts/AuthContext';
import { GoogleProvider } from '../contexts/GoogleProvider';
import { RoleProvider } from '../context/RoleContext';

interface AppProviderProps {
  children: ReactNode;
}

export function AppProvider({ children }: AppProviderProps) {
  return (
    <GoogleProvider>
    <AuthProvider>
      <RoleProvider>
        {children}
      </RoleProvider>
    </AuthProvider>
    </GoogleProvider>
  );
}
