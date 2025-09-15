import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface User {
  id: number;
  email: string;
  display_name: string;
  membership_type: string;
  is_active: boolean;
  created_at: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAnonymous: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  register: (email: string, password: string, displayName: string) => Promise<boolean>;
  logout: () => void;
  setAnonymousMode: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [isAnonymous, setIsAnonymous] = useState<boolean>(localStorage.getItem('anonymous') === 'true');
  const [isLoading, setIsLoading] = useState(true);

  const API_URL = (import.meta as any).env.VITE_API_URL || 'http://localhost:8000';

  useEffect(() => {
    if (token && !isAnonymous) {
      fetchUser();
    } else {
      setIsLoading(false);
    }
  }, [token, isAnonymous]);

  const fetchUser = async () => {
    try {
      const response = await fetch(`${API_URL}/users/me`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      if (response.ok) {
        const userData = await response.json();
        setUser(userData);
      } else {
        localStorage.removeItem('token');
        setToken(null);
      }
    } catch (error) {
      console.error('Error fetching user:', error);
      localStorage.removeItem('token');
      setToken(null);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const formData = new FormData();
      formData.append('username', email);
      formData.append('password', password);

      const response = await fetch(`${API_URL}/auth/token`, {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        const newToken = data.access_token;
        localStorage.setItem('token', newToken);
        setToken(newToken);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  };

  const register = async (email: string, password: string, displayName: string): Promise<boolean> => {
    try {
      const response = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          password,
          display_name: displayName,
        }),
      });

      if (response.ok) {
        return await login(email, password);
      }
      return false;
    } catch (error) {
      console.error('Registration error:', error);
      return false;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('anonymous');
    setToken(null);
    setUser(null);
    setIsAnonymous(false);
  };

  const setAnonymousMode = () => {
    localStorage.setItem('anonymous', 'true');
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
    setIsAnonymous(true);
  };

  const value = {
    user,
    token,
    isAnonymous,
    login,
    register,
    logout,
    setAnonymousMode,
    isLoading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
