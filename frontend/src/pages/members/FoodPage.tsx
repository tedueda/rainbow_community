import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

interface Post {
  id: number;
  title: string;
  body: string;
  category: string;
  media_url?: string;
  created_at: string;
  user: {
    display_name: string;
  };
}

const FoodPage: React.FC = () => {
  const navigate = useNavigate();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFoodPosts = async () => {
      try {
        const apiUrl = import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';
        const response = await fetch(`${apiUrl}/api/posts?category=food&limit=50`);
        if (response.ok) {
          const data = await response.json();
          setPosts(Array.isArray(data) ? data : []);
        }
      } catch (error) {
        console.error('Failed to fetch food posts:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchFoodPosts();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50">
      <main className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={() => navigate('/feed')}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            ホームに戻る
          </Button>
          
          <div className="flex items-center gap-4 mb-4">
            <span className="text-4xl">🍽</span>
            <div>
              <h1 className="text-4xl font-bold text-gray-900">食レポ</h1>
              <p className="text-gray-600 mt-2">単品メニュー・市販品の"秘密の推し"を共有</p>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <p className="text-gray-600">読み込み中...</p>
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow">
            <p className="text-gray-600">まだ食レポの投稿がありません</p>
            <Button
              onClick={() => navigate('/create')}
              className="mt-4 bg-gradient-to-r from-pink-500 to-orange-400 hover:from-pink-600 hover:to-orange-500"
            >
              最初の投稿を作成
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {posts.map((post) => (
              <article
                key={post.id}
                className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => navigate(`/posts/${post.id}`)}
              >
                {post.media_url && (
                  <img
                    src={post.media_url.startsWith('http') ? post.media_url : `${import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'}${post.media_url}`}
                    alt={post.title}
                    className="w-full h-48 object-cover"
                  />
                )}
                <div className="p-4">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    {post.title}
                  </h3>
                  <p className="text-gray-600 line-clamp-3 mb-4">
                    {post.body.replace(/#\w+/g, '').trim()}
                  </p>
                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <span>{post.user?.display_name || 'Unknown'}</span>
                    <span>{new Date(post.created_at).toLocaleDateString('ja-JP')}</span>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default FoodPage;
