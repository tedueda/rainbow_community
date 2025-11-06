import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../../components/Header';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

interface Post {
  id: number;
  title: string;
  body: string;
  category: string;
  image_url?: string;
  created_at: string;
  author: {
    display_name: string;
  };
}

const BeautyPage: React.FC = () => {
  const navigate = useNavigate();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBeautyPosts = async () => {
      try {
        const apiUrl = import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';
        const response = await fetch(`${apiUrl}/api/posts?category=beauty&limit=50`);
        if (response.ok) {
          const data = await response.json();
          setPosts(data.items || []);
        }
      } catch (error) {
        console.error('Failed to fetch beauty posts:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchBeautyPosts();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50">
      <Header />
      
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
            <span className="text-4xl">💄</span>
            <div>
              <h1 className="text-4xl font-bold text-gray-900">ビューティ</h1>
              <p className="text-gray-600 mt-2">コスメ・メイク・ヨガのおすすめと講座</p>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <p className="text-gray-600">読み込み中...</p>
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow">
            <p className="text-gray-600">まだビューティの投稿がありません</p>
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
                {post.image_url && (
                  <img
                    src={post.image_url}
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
                    <span>{post.author.display_name}</span>
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

export default BeautyPage;
