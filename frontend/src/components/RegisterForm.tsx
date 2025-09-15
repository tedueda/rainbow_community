import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Heart } from 'lucide-react';

const RegisterForm: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    if (password !== confirmPassword) {
      setError('パスワードが一致しません');
      setIsLoading(false);
      return;
    }

    if (password.length < 8) {
      setError('パスワードは8文字以上である必要があります');
      setIsLoading(false);
      return;
    }

    const success = await register(email, password, displayName);
    
    if (success) {
      navigate('/feed');
    } else {
      setError('このメールアドレスは既に使用されている可能性があります');
    }
    
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-50 via-green-50 to-orange-50 px-4">
      <Card className="w-full max-w-md shadow-lg border-green-200">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <Heart className="h-12 w-12 text-green-500" />
          </div>
          <CardTitle className="text-xl sm:text-2xl text-green-800">プレミアム会員登録</CardTitle>
          <CardDescription className="text-gray-600">
            プレミアム会員になって投稿・リアクション・コメント機能をご利用ください
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="displayName" className="text-gray-700">表示名</Label>
              <Input
                id="displayName"
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                required
                className="border-green-200 focus:border-green-400 focus:ring-green-400"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email" className="text-gray-700">メールアドレス</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="border-green-200 focus:border-green-400 focus:ring-green-400"
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
                minLength={8}
                className="border-green-200 focus:border-green-400 focus:ring-green-400"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-gray-700">パスワード確認</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className="border-green-200 focus:border-green-400 focus:ring-green-400"
              />
            </div>
            {error && (
              <div className="text-red-600 text-sm bg-red-50 p-2 rounded">{error}</div>
            )}
            <Button 
              type="submit" 
              className="w-full bg-gradient-to-r from-green-500 to-pink-400 hover:from-green-600 hover:to-pink-500 text-white"
              disabled={isLoading}
            >
              {isLoading ? 'プレミアム会員登録中...' : 'プレミアム会員登録'}
            </Button>
          </form>
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              既にプレミアム会員の方は{' '}
              <Link to="/login" className="text-green-600 hover:text-green-500 font-medium">
                こちらからログイン
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default RegisterForm;
