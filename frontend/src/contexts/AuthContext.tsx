import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { API_URL } from '@/config';

interface User {
  id: number;
  email: string;
  display_name: string;
  nickname?: string;
  membership_type: string;
  is_active: boolean;
  created_at: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAnonymous: boolean;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string, rememberMe?: boolean) => Promise<boolean>;
  logout: () => void;
  clearError: () => void;
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
  const [token, setToken] = useState<string | null>(null);
  const [isAnonymous, setIsAnonymous] = useState<boolean>(true);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const clearError = () => setError(null);

  useEffect(() => {
    const initializeAuth = async () => {
      console.log('🔄 Initializing auth...');
      setIsLoading(true);
      
      const storedToken = localStorage.getItem('token');
      const storedAnonymous = localStorage.getItem('anonymous') === 'true';
      
      if (storedToken && !storedAnonymous) {
        console.log('🔑 Found stored token, validating...');
        setToken(storedToken);
        
        try {
          const response = await fetch(`${API_URL}/api/auth/me`, {
            headers: {
              'Authorization': `Bearer ${storedToken}`,
            },
          });
          
          if (response.ok) {
            const userData = await response.json();
            console.log('✅ Token valid, user data loaded:', userData);
            setUser(userData);
            setIsAnonymous(false);
          } else {
            console.log('❌ Token invalid, clearing...');
            localStorage.removeItem('token');
            localStorage.removeItem('rememberMe');
            setToken(null);
            setIsAnonymous(true);
          }
        } catch (error) {
          console.error('Error validating token:', error);
          localStorage.removeItem('token');
          localStorage.removeItem('rememberMe');
          setToken(null);
          setIsAnonymous(true);
        }
      } else {
        console.log('🔓 No stored token or anonymous mode, setting anonymous');
        setIsAnonymous(true);
      }
      
      console.log('✅ Auth initialization complete');
      setIsLoading(false);
    };

    initializeAuth();
  }, [API_URL]);

  const login = async (email: string, password: string, rememberMe: boolean = true): Promise<boolean> => {
    console.log('Login attempt with:', { email, rememberMe, API_URL });
    
    try {
      console.log('🔑 Attempting login with API_URL:', API_URL);
      console.log('🔑 Full login URL:', `${API_URL}/api/auth/token`);
      
      const formData = new URLSearchParams();
      formData.append('username', email);
      formData.append('password', password);
      
      console.log('🔑 Request body:', formData.toString());
      
      const response = await fetch(`${API_URL}/api/auth/token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: formData.toString(),
      });
      
      console.log('Login response status:', response.status);
      console.log('Login response headers:', response.headers);
      
      if (response.ok) {
        const data = await response.json();
        const newToken = data.access_token;
        
        // ユーザー情報を取得
        const userResponse = await fetch(`${API_URL}/api/auth/me`, {
          headers: {
            'Authorization': `Bearer ${newToken}`,
          },
        });
        
        if (userResponse.ok) {
          const userData = await userResponse.json();
          console.log('User data loaded:', userData);
          
          setUser(userData);
          setToken(newToken);
          setIsAnonymous(false);
          
          if (rememberMe) {
            localStorage.setItem('token', newToken);
            localStorage.setItem('rememberMe', 'true');
          }
          localStorage.removeItem('anonymous');
          
          return true;
        } else {
          console.error('Failed to fetch user data');
          setError('ユーザー情報の取得に失敗しました');
          return false;
        }
      } else {
        const errorText = await response.text();
        console.error('Login failed:', response.status, errorText);
        setError(`ログインに失敗しました (${response.status})`);
        return false;
      }
    } catch (error: any) {
      console.error('Login error:', error);
      console.error('Error details:', {
        message: error.message,
        stack: error.stack,
        API_URL,
      });
      setError(`ログインエラー: ${error.message}`);
      return false;
    }
  };

  const logout = () => {
    console.log('🚪 Logging out...');
    
    localStorage.removeItem('token');
    localStorage.removeItem('rememberMe');
    localStorage.setItem('anonymous', 'true');
    
    setToken(null);
    setUser(null);
    setIsAnonymous(true);
  };

  const value: AuthContextType = {
    user,
    token,
    isAnonymous,
    login,
    logout,
    isLoading,
    error,
    clearError,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
