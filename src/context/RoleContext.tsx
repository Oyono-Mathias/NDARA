import React, { createContext, useContext } from "react";
import { useAuth } from "../contexts/AuthContext";

interface RoleContextType {
  currentUser: any | null;
  role: string | null;
  loading: boolean;
  isUserLoading: boolean;
}

const RoleContext = createContext<RoleContextType>({
  currentUser: null,
  role: null,
  loading: true,
  isUserLoading: true,
});

export function RoleProvider({ children }: { children: React.ReactNode }) {
  const { firebaseUser, appUser, loading } = useAuth();
  
  const currentUser = firebaseUser && appUser ? { ...firebaseUser, ...appUser, uid: firebaseUser.uid } : null;
  const role = appUser?.role || null;

  return (
    <RoleContext.Provider
      value={{ currentUser, role, loading, isUserLoading: loading }}
    >
      {children}
    </RoleContext.Provider>
  );
}

export function useRole() {
  return useContext(RoleContext);
}
