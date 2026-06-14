import React, { createContext, useState, useContext, ReactNode } from 'react';
import { RegistrationPayload, User } from '../data/user';
import { userService } from '../../services/userService';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<boolean>;
  register: (userData: RegistrationPayload) => Promise<boolean>;
  isAuthenticated: boolean;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await userService.login(email, password);
      if (result.user) {
        setUser(result.user);
        return true;
      }
      return false;
    } catch (err: any) {
      setError(err.message || "An unknown error occurred");
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = (): void => {
    setUser(null);
  };

  const register = async (
    userData: RegistrationPayload
  ): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await userService.register(userData);
      if (result.user) setUser(result.user);
      
      return true;
    } catch (err: any) {
      setError(err.message || "An error occurred during registration.");
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        logout,
        register,
        isAuthenticated: !!user,
        isLoading,
        error 
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
