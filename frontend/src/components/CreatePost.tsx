import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PlusCircle } from 'lucide-react';

const CreatePost: React.FC = () => {
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [visibility, setVisibility] = useState('public');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  const { token } = useAuth();
  const navigate = useNavigate();

  const API_URL = (import.meta as any).env.VITE_API_URL || 'http://localhost:8000';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    if (!body.trim()) {
      setError('投稿内容は必須です');
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch(`${API_URL}/posts`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: title.trim() || null,
          body: body.trim(),
          visibility,
        }),
      });

      if (response.ok) {
        navigate('/feed');
      } else {
        const errorData = await response.json();
        setError(errorData.detail || '投稿の作成に失敗しました');
      }
    } catch (error) {
      console.error('Error creating post:', error);
      setError('投稿の作成に失敗しました。もう一度お試しください。');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-4 sm:p-6">
      <Card className="border-orange-200 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center text-xl sm:text-2xl text-orange-800">
            <PlusCircle className="h-5 w-5 sm:h-6 sm:w-6 mr-2" />
            新しい投稿を作成
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="title" className="text-gray-700">タイトル（任意）</Label>
              <Input
                id="title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="投稿にタイトルをつけてください..."
                className="border-orange-200 focus:border-orange-400 focus:ring-orange-400"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="body" className="text-gray-700">内容 *</Label>
              <Textarea
                id="body"
                value={body}
                onChange={(e) => setBody(e.target.value)}
                placeholder="あなたの想い、体験、質問などを共有してください..."
                required
                rows={6}
                className="border-orange-200 focus:border-orange-400 focus:ring-orange-400 resize-none"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="visibility" className="text-gray-700">この投稿を見ることができる人</Label>
              <Select value={visibility} onValueChange={setVisibility}>
                <SelectTrigger className="border-orange-200 focus:border-orange-400 focus:ring-orange-400">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="public">🌍 公開 - 誰でも見ることができます</SelectItem>
                  <SelectItem value="members">👥 メンバーのみ - 登録ユーザーのみ</SelectItem>
                  <SelectItem value="followers">👤 フォロワー - あなたをフォローしている人</SelectItem>
                  <SelectItem value="private">🔒 非公開 - あなたのみ</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {error && (
              <div className="text-red-600 text-sm bg-red-50 p-3 rounded-md">
                {error}
              </div>
            )}

            <div className="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-4">
              <Button 
                type="submit" 
                className="w-full sm:w-auto bg-gradient-to-r from-orange-500 to-pink-400 hover:from-orange-600 hover:to-pink-500 text-white"
                disabled={isLoading}
              >
                {isLoading ? '公開中...' : '投稿を公開'}
              </Button>
              <Button 
                type="button" 
                variant="outline"
                onClick={() => navigate('/feed')}
                className="w-full sm:w-auto border-orange-300 text-orange-700 hover:bg-orange-50"
              >
                キャンセル
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default CreatePost;
