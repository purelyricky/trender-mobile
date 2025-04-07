import React, { createContext, useContext, ReactNode, useState } from "react";
import { Models } from "node-appwrite";
import { getCurrentUser } from "./appwrite";
import { useAppwrite } from "./useAppwrite";

interface GlobalContextType {
  isLogged: boolean;
  user: Models.User<Models.Preferences> | null;
  loading: boolean;
  refetch: () => Promise<void>;
  dataVersion: number;
  incrementDataVersion: () => void;
}

// Remove duplicate and use undefined type for proper strict null checks
const GlobalContext = createContext<GlobalContextType | undefined>(undefined);

interface GlobalProviderProps {
  children: ReactNode;
}

export const GlobalProvider = ({ children }: GlobalProviderProps) => {
  const {
    data: user,
    loading,
    refetch,
  } = useAppwrite({
    fn: getCurrentUser,
  });

  // Add dataVersion state
  const [dataVersion, setDataVersion] = useState(0);

  const incrementDataVersion = () => {
    setDataVersion(prev => prev + 1);
  };

  const isLogged = !!user;

  return (
    <GlobalContext.Provider
      value={{
        isLogged,
        user,
        loading,
        refetch,
        dataVersion,
        incrementDataVersion,
      }}
    >
      {children}
    </GlobalContext.Provider>
  );
};

export const useGlobalContext = (): GlobalContextType => {
  const context = useContext(GlobalContext);
  if (!context)
    throw new Error("useGlobalContext must be used within a GlobalProvider");

  return context;
};

export default GlobalProvider;