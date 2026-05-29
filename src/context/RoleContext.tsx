import React, { createContext, useContext, useState, useEffect } from "react";
import { auth } from "../firebase";

interface RoleContextType {
  currentUser: any | null;
  isUserLoading: boolean;
}

const RoleContext = createContext<RoleContextType>({
  currentUser: null,
  isUserLoading: true,
});

export function RoleProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<any | null>(null);
  const [isUserLoading, setIsUserLoading] = useState(true);

  useEffect(() => {
    return auth.onAuthStateChanged((user) => {
      setCurrentUser(user);
      setIsUserLoading(false);
    });
  }, []);

  return (
    <RoleContext.Provider value={{ currentUser, isUserLoading }}>
      {children}
    </RoleContext.Provider>
  );
}

export function useRole() {
  return useContext(RoleContext);
}
