import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Heart } from 'lucide-react';

const LoginForm: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    const success = await login(email, password);
    
    if (success) {
      navigate('/feed');
    } else {
      setError('メールアドレスまたはパスワードが正しくありません');
    }
    
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-50 via-green-50 to-orange-50 px-4">
      <Card className="w-full max-w-md shadow-lg border-pink-200">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <Heart className="h-12 w-12 text-pink-500" />
          </div>
          <CardTitle className="text-xl sm:text-2xl text-pink-800">おかえりなさい</CardTitle>
          <CardDescription className="text-gray-600">
            LGBTQ+ コミュニティアカウントにログイン
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-gray-700">メールアドレス</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="border-pink-200 focus:border-pink-400 focus:ring-pink-400"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-gray-700">パスワード</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="border-pink-200 focus:border-pink-400 focus:ring-pink-400"
              />
            </div>
            {error && (
              <div className="text-red-600 text-sm bg-red-50 p-2 rounded">{error}</div>
            )}
            <Button 
              type="submit" 
              className="w-full bg-gradient-to-r from-pink-500 to-orange-400 hover:from-pink-600 hover:to-orange-500 text-white"
              disabled={isLoading}
            >
              {isLoading ? 'ログイン中...' : 'ログイン'}
            </Button>
          </form>
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              アカウントをお持ちでない方は{' '}
              <Link to="/register" className="text-pink-600 hover:text-pink-500 font-medium">
                こちらから登録
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default LoginForm;
