import { ReactNode } from 'react';
import { AuthProvider } from '../contexts/AuthContext';
import { RoleProvider } from '../context/RoleContext';

interface AppProviderProps {
  children: ReactNode;
}

export function AppProvider({ children }: AppProviderProps) {
  return (
    <AuthProvider>
      <RoleProvider>
        {children}
      </RoleProvider>
    </AuthProvider>
  );
}
