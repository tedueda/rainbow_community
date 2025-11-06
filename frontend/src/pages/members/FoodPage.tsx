import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Plus, X, Upload } from 'lucide-react';

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
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newPost, setNewPost] = useState({ title: '', body: '', image: null as File | null });
  const [imagePreview, setImagePreview] = useState<string | null>(null);

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

  const handleCardClick = (post: Post) => {
    setSelectedPost(post);
    setShowDetailModal(true);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setNewPost({ ...newPost, image: file });
      // 画像プレビューを生成
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: API実装後に画像アップロード処理を追加
    alert('投稿を作成しました（画像アップロード機能は準備中です）');
    setShowCreateModal(false);
    setNewPost({ title: '', body: '', image: null });
    setImagePreview(null);
  };

  return (
    <div className="min-h-screen bg-white">
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
          
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <span className="text-4xl">🍽</span>
              <div>
                <h1 className="text-4xl font-bold text-gray-900">食レポ</h1>
                <p className="text-gray-600 mt-2">単品メニュー・市販品の"秘密の推し"を共有</p>
              </div>
            </div>
            <Button
              onClick={() => setShowCreateModal(true)}
              className="bg-black hover:bg-gray-800 text-white"
            >
              <Plus className="h-4 w-4 mr-2" />
              新規投稿
            </Button>
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
                onClick={() => handleCardClick(post)}
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

        {/* 詳細モーダル */}
        {showDetailModal && selectedPost && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowDetailModal(false)}>
            <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
              <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
                <h2 className="text-2xl font-bold">{selectedPost.title}</h2>
                <button onClick={() => setShowDetailModal(false)} className="p-2 hover:bg-gray-100 rounded-full">
                  <X className="h-5 w-5" />
                </button>
              </div>
              {selectedPost.media_url && (
                <img
                  src={selectedPost.media_url.startsWith('http') ? selectedPost.media_url : `${import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'}${selectedPost.media_url}`}
                  alt={selectedPost.title}
                  className="w-full max-h-[500px] object-contain bg-gray-100"
                />
              )}
              <div className="p-6">
                <p className="text-gray-700 whitespace-pre-wrap mb-4">{selectedPost.body}</p>
                <div className="flex items-center justify-between text-sm text-gray-500 pt-4 border-t">
                  <span>{selectedPost.user?.display_name || 'Unknown'}</span>
                  <span>{new Date(selectedPost.created_at).toLocaleDateString('ja-JP')}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 新規投稿モーダル */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowCreateModal(false)}>
            <div className="bg-white rounded-lg max-w-2xl w-full" onClick={(e) => e.stopPropagation()}>
              <div className="border-b px-6 py-4 flex items-center justify-between">
                <h2 className="text-2xl font-bold">新規投稿</h2>
                <button onClick={() => setShowCreateModal(false)} className="p-2 hover:bg-gray-100 rounded-full">
                  <X className="h-5 w-5" />
                </button>
              </div>
              <form onSubmit={handleCreateSubmit} className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">タイトル *</label>
                  <input
                    type="text"
                    required
                    value={newPost.title}
                    onChange={(e) => setNewPost({ ...newPost, title: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-black"
                    placeholder="例: 絶品！コンビニの新作スイーツ"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">内容 *</label>
                  <textarea
                    required
                    value={newPost.body}
                    onChange={(e) => setNewPost({ ...newPost, body: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-black h-32"
                    placeholder="食レポの内容を入力してください"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">画像</label>
                  <div className="border-2 border-dashed rounded-lg p-6 text-center">
                    {imagePreview ? (
                      <div className="space-y-2">
                        <img src={imagePreview} alt="Preview" className="max-h-48 mx-auto rounded" />
                        <p className="text-sm text-gray-600">{newPost.image?.name}</p>
                        <button
                          type="button"
                          onClick={() => {
                            setNewPost({ ...newPost, image: null });
                            setImagePreview(null);
                          }}
                          className="text-red-600 hover:text-red-700 text-sm"
                        >
                          画像を削除
                        </button>
                      </div>
                    ) : (
                      <>
                        <Upload className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageChange}
                          className="hidden"
                          id="create-image"
                        />
                        <label htmlFor="create-image" className="cursor-pointer text-blue-600 hover:text-blue-700">
                          画像を選択
                        </label>
                      </>
                    )}
                  </div>
                </div>
                <div className="flex gap-2 pt-4">
                  <Button type="button" variant="outline" onClick={() => setShowCreateModal(false)} className="flex-1">
                    キャンセル
                  </Button>
                  <Button type="submit" className="flex-1 bg-black hover:bg-gray-800 text-white">
                    投稿する
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}

      </main>
    </div>
  );
};

export default FoodPage;
