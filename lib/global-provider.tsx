import React, { createContext, useContext, ReactNode, useState, useEffect } from "react";
import { Models } from "node-appwrite";
import { getCurrentUser } from "./appwrite";

interface GlobalContextType {
  isLogged: boolean;
  user: Models.User<Models.Preferences> | null;
  loading: boolean;
  refetch: () => Promise<void>;
  dataVersion: number;
  incrementDataVersion: () => void;
}

// Create context with default values
const GlobalContext = createContext<GlobalContextType>({
  isLogged: false,
  user: null,
  loading: true,
  refetch: async () => {},
  dataVersion: 0,
  incrementDataVersion: () => {},
});

interface GlobalProviderProps {
  children: ReactNode;
}

export const GlobalProvider = ({ children }: GlobalProviderProps) => {
  const [user, setUser] = useState<Models.User<Models.Preferences> | null>(null);
  const [loading, setLoading] = useState(true);
  const [dataVersion, setDataVersion] = useState(0);

  const refetch = async () => {
    try {
      setLoading(true);
      const userData = await getCurrentUser();
      setUser(userData);
    } catch (error) {
      console.error("Failed to fetch user:", error);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  // Initial fetch on mount
  useEffect(() => {
    refetch();
  }, []);

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
  return context;
};

export default GlobalProvider;