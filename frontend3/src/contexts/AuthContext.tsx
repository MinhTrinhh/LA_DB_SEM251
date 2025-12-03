import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authApi, saveAuthData, clearAuthData, getAuthData } from '@/api/auth.api';
import {
  AuthContextType,
  RegisterRequest,
  AuthResponse,
} from '@/types/api.types';
import { useToast } from '@/hooks/use-toast';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authData, setAuthData] = useState<AuthResponse | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  // Initialize auth state from localStorage
  useEffect(() => {
    const initAuth = () => {
      const savedAuth = getAuthData();
      if (savedAuth) {
        setToken(savedAuth.token);
        setAuthData(savedAuth);
        setIsAuthenticated(true);
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const response = await authApi.login({ email, password });
      saveAuthData(response);
      setToken(response.token);
      setAuthData(response);
      setIsAuthenticated(true);

      toast({
        title: 'Welcome back!',
        description: `Logged in as ${response.email}`,
      });
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Login Failed',
        description: error.response?.data?.message || 'Invalid email or password',
      });
      throw error;
    }
  };

  const register = async (data: RegisterRequest) => {
    try {
      const response = await authApi.register(data);
      saveAuthData(response);
      setToken(response.token);
      setAuthData(response);
      setIsAuthenticated(true);

      toast({
        title: 'Registration Successful',
        description: `Welcome, ${response.email}!`,
      });
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Registration Failed',
        description: error.response?.data?.message || 'Failed to create account',
      });
      throw error;
    }
  };

  const logout = () => {
    authApi.logout().catch(() => {
      // Ignore errors, clear local data anyway
    });

    clearAuthData();
    setIsAuthenticated(false);
    setAuthData(null);
    setToken(null);

    toast({
      title: 'Logged Out',
      description: 'You have been logged out successfully',
    });
  };

  const updateAuthData = (newAuthData: AuthResponse) => {
    saveAuthData(newAuthData);
    setAuthData(newAuthData);
    setToken(newAuthData.token);
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        authData,
        token,
        loading,
        login,
        register,
        logout,
        updateAuthData,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

