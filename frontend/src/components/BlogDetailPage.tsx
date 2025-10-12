import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Heart, MessageCircle, ArrowLeft, Calendar, User } from 'lucide-react';
import { Post } from '../types/Post';

const BlogDetailPage: React.FC = () => {
  const { slug } = useParams();
  const { token } = useAuth();
  const navigate = useNavigate();
  const [blog, setBlog] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);

  const API_URL = (import.meta as any).env.VITE_API_URL || 'http://localhost:8000';

  const fetchBlog = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `${API_URL}/api/posts?slug=${slug}`,
        {
          headers: token ? { 'Authorization': `Bearer ${token}` } : {},
        }
      );
      
      if (!response.ok) throw new Error('Failed to fetch blog');
      const data = await response.json();
      
      if (data.length > 0) {
        setBlog(data[0]);
      } else {
        const idResponse = await fetch(
          `${API_URL}/api/posts/${slug}`,
          {
            headers: token ? { 'Authorization': `Bearer ${token}` } : {},
          }
        );
        if (idResponse.ok) {
          const blogData = await idResponse.json();
          setBlog(blogData);
        }
      }
    } catch (error) {
      console.error('Error fetching blog:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBlog();
  }, [slug, token]);

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ja-JP', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  const handleLike = async () => {
    if (!blog || !token) return;
    
    try {
      const response = await fetch(`${API_URL}/api/posts/${blog.id}/like`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      if (response.ok) {
        setBlog({
          ...blog,
          is_liked: !blog.is_liked,
          like_count: blog.is_liked ? (blog.like_count || 0) - 1 : (blog.like_count || 0) + 1,
        });
      }
    } catch (error) {
      console.error('Error liking blog:', error);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8">
        <div className="text-center text-gray-600">読み込み中...</div>
      </div>
    );
  }

  if (!blog) {
    return (
      <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8">
        <Card className="text-center p-12 border-pink-200">
          <CardContent>
            <h3 className="text-xl font-semibold text-gray-700 mb-3">
              ブログが見つかりません
            </h3>
            <Button onClick={() => navigate('/blog')} className="mt-4">
              ブログ一覧に戻る
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
      <div className="flex items-center gap-4">
        <Button 
          variant="ghost" 
          onClick={() => navigate('/blog')}
          className="text-pink-700 hover:text-pink-900 hover:bg-pink-50"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          ブログ一覧に戻る
        </Button>
      </div>

      <Card className="rounded-2xl border-pink-100">
        <CardContent className="p-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-6">
            {blog.title || 'Untitled'}
          </h1>
          
          <div className="flex items-center gap-6 text-sm text-gray-500 mb-8 pb-6 border-b border-gray-200">
            <div className="flex items-center gap-2">
              <User className="h-5 w-5" />
              <span className="font-medium">{blog.user_display_name || 'Unknown'}</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              <span>{formatDate(blog.created_at)}</span>
            </div>
          </div>
          
          {blog.og_image_url && (
            <img 
              src={blog.og_image_url} 
              alt={blog.title || 'Blog image'}
              className="w-full rounded-lg mb-8"
            />
          )}
          
          <div className="prose prose-lg max-w-none mb-8">
            <div className="whitespace-pre-wrap text-gray-700 leading-relaxed">
              {blog.body}
            </div>
          </div>
          
          <div className="flex items-center gap-6 pt-6 border-t border-gray-200">
            <Button
              variant="ghost"
              onClick={handleLike}
              className={`flex items-center gap-2 ${blog.is_liked ? 'text-pink-500' : 'text-gray-600'}`}
            >
              <Heart className={`h-5 w-5 ${blog.is_liked ? 'fill-pink-500' : ''}`} />
              <span>{blog.like_count || 0}</span>
            </Button>
            <div className="flex items-center gap-2 text-gray-600">
              <MessageCircle className="h-5 w-5" />
              <span>{blog.comment_count || 0}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default BlogDetailPage;
