import React, { createContext, useContext, useState } from 'react';
import { User, UserRole } from '../data/mockData';

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => boolean;
  logout: () => void;
  register: (userData: Omit<User, 'id' | 'role'>) => boolean;
  isAuthenticated: boolean;
  hasRole: (role: UserRole) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  const login = (email: string, password: string): boolean => {
    // Mock login - in real app, this would call an API
    const mockUser: User = {
      id: '1',
      firstName: 'John',
      lastName: 'Doe',
      email: email,
      phone: '+1234567890',
      role: email.includes('admin') ? 'admin' : email.includes('owner') ? 'owner' : 'user',
    };
    setUser(mockUser);
    return true;
  };

  const logout = () => {
    setUser(null);
  };

  const register = (userData: Omit<User, 'id' | 'role'>): boolean => {
    // Mock registration
    const newUser: User = {
      ...userData,
      id: Math.random().toString(36).substr(2, 9),
      role: 'user',
    };
    setUser(newUser);
    return true;
  };

  const hasRole = (role: UserRole): boolean => {
    if (role === 'guest') return !user;
    if (!user) return false;
    
    // Admin has all permissions
    if (user.role === 'admin') return true;
    
    // Owner can access owner and user features
    if (role === 'user' && user.role === 'owner') return true;
    
    return user.role === role;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        logout,
        register,
        isAuthenticated: !!user,
        hasRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
