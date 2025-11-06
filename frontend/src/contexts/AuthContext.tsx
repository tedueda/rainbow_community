import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

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

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
  const USE_MOCK_API = false;

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
    console.log('Login attempt with:', { email, rememberMe, API_URL, USE_MOCK_API });
    
    // モックAPIを使用する場合
    if (USE_MOCK_API) {
      console.log('🎯 Using Mock API for login');
      
      const testAccounts = [
        { email: 'test@example.com', password: 'test123' },
        { email: 'premium@test.com', password: 'premium123' },
      ];
      
      const validAccount = testAccounts.find(
        account => account.email === email && account.password === password
      );
      
      if (validAccount) {
        console.log('✅ Mock login successful');
        const mockUser: User = {
          id: 28,
          email: email,
          display_name: email.split('@')[0],
          nickname: email.split('@')[0],
          membership_type: 'premium',
          is_active: true,
          created_at: new Date().toISOString()
        };
        
        const mockToken = 'mock-jwt-token-' + Date.now();
        
        setUser(mockUser);
        setToken(mockToken);
        setIsAnonymous(false);
        
        if (rememberMe) {
          localStorage.setItem('token', mockToken);
          localStorage.setItem('rememberMe', 'true');
        }
        localStorage.removeItem('anonymous');
        
        return true;
      } else {
        console.log('❌ Mock login failed - invalid credentials');
        setError('ログインに失敗しました');
        return false;
      }
    }
    
    // 実際のAPIログイン
    try {
      const formData = new URLSearchParams();
      formData.append('username', email);
      formData.append('password', password);
      
      const response = await fetch(`${API_URL}/api/auth/token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: formData.toString(),
      });
      
      console.log('Login response status:', response.status);
      
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
        console.error('Login failed:', response.status);
        setError('ログインに失敗しました');
        return false;
      }
    } catch (error: any) {
      console.error('Login error:', error);
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
