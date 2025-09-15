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
      setError('Post content is required');
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
        setError(errorData.detail || 'Failed to create post');
      }
    } catch (error) {
      console.error('Error creating post:', error);
      setError('Failed to create post. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center text-2xl text-purple-800">
            <PlusCircle className="h-6 w-6 mr-2" />
            Create New Post
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="title">Title (Optional)</Label>
              <Input
                id="title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Give your post a title..."
                className="border-purple-200 focus:border-purple-500"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="body">Content *</Label>
              <Textarea
                id="body"
                value={body}
                onChange={(e) => setBody(e.target.value)}
                placeholder="Share your thoughts, experiences, or ask a question..."
                required
                rows={6}
                className="border-purple-200 focus:border-purple-500 resize-none"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="visibility">Who can see this post?</Label>
              <Select value={visibility} onValueChange={setVisibility}>
                <SelectTrigger className="border-purple-200 focus:border-purple-500">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="public">🌍 Public - Everyone can see</SelectItem>
                  <SelectItem value="members">👥 Members Only - Registered users</SelectItem>
                  <SelectItem value="followers">👤 Followers - People who follow you</SelectItem>
                  <SelectItem value="private">🔒 Private - Only you</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {error && (
              <div className="text-red-600 text-sm bg-red-50 p-3 rounded-md">
                {error}
              </div>
            )}

            <div className="flex items-center space-x-4">
              <Button 
                type="submit" 
                className="bg-purple-600 hover:bg-purple-700"
                disabled={isLoading}
              >
                {isLoading ? 'Publishing...' : 'Publish Post'}
              </Button>
              <Button 
                type="button" 
                variant="outline"
                onClick={() => navigate('/feed')}
                className="border-purple-300 text-purple-700 hover:bg-purple-50"
              >
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default CreatePost;
