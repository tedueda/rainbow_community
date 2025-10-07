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
  login: (email: string, password: string, rememberMe?: boolean) => Promise<boolean>;
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
  const [isAnonymous, setIsAnonymous] = useState<boolean>(true);
  const [isLoading, setIsLoading] = useState(true);

  const API_URL = (import.meta as any).env.VITE_API_URL || 'http://localhost:8000';

  useEffect(() => {
    const initializeAuth = async () => {
      const storedToken = localStorage.getItem('token');
      const isAnonymousMode = localStorage.getItem('anonymous') === 'true';
      
      if (storedToken && !isAnonymousMode) {
        try {
          const response = await fetch(`${API_URL}/api/auth/me`, {
            headers: {
              'Authorization': `Bearer ${storedToken}`,
            },
          });
          
          if (response.ok) {
            const userData = await response.json();
            setUser(userData);
            setToken(storedToken);
            setIsAnonymous(false);
          } else {
            localStorage.removeItem('token');
            localStorage.removeItem('rememberMe');
            setToken(null);
            setUser(null);
            setIsAnonymous(true);
          }
        } catch (error) {
          console.error('Error validating token:', error);
          localStorage.removeItem('token');
          localStorage.removeItem('rememberMe');
          setToken(null);
          setUser(null);
          setIsAnonymous(true);
        }
      } else {
        setIsAnonymous(true);
      }
      
      setIsLoading(false);
    };

    initializeAuth();
  }, [API_URL]);


  const login = async (email: string, password: string, rememberMe: boolean = true): Promise<boolean> => {
    try {
      console.log('Login attempt with:', { email, rememberMe, API_URL });
      const formData = new URLSearchParams();
      formData.append('username', email);
      formData.append('password', password);

      const response = await fetch(`${API_URL}/api/auth/token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: formData,
      });

      console.log('Login response status:', response.status);
      if (response.ok) {
        const data = await response.json();
        console.log('Login response data:', data);
        const newToken = data.access_token;
        console.log('Storing token:', newToken ? 'Token received' : 'No token received');
        
        try {
          const userResponse = await fetch(`${API_URL}/api/auth/me`, {
            headers: {
              'Authorization': `Bearer ${newToken}`,
            },
          });
          
          if (userResponse.ok) {
            const userData = await userResponse.json();
            setUser(userData);
            localStorage.setItem('token', newToken);
            localStorage.setItem('rememberMe', rememberMe.toString());
            setToken(newToken);
            setIsAnonymous(false);
            localStorage.removeItem('anonymous');
            console.log('User data loaded:', userData);
            console.log('Token stored in localStorage:', localStorage.getItem('token'));
            return true;
          } else {
            console.error('Failed to fetch user data after login');
            return false;
          }
        } catch (error) {
          console.error('Error fetching user data:', error);
          return false;
        }
      } else {
        const errorData = await response.text();
        console.error('Login failed:', response.status, errorData);
      }
      return false;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  };

  const register = async (email: string, password: string, displayName: string): Promise<boolean> => {
    try {
      const response = await fetch(`${API_URL}/api/auth/register`, {
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
    localStorage.removeItem('rememberMe');
    setToken(null);
    setUser(null);
    setIsAnonymous(true);
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
