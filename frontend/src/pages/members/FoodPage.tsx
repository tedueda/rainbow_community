import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Plus, Edit, Trash2, X, Upload } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

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
  const { user } = useAuth();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [newPost, setNewPost] = useState({ title: '', body: '', image: null as File | null });
  const [editPost, setEditPost] = useState({ title: '', body: '', image: null as File | null });

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

  const handleEdit = (post: Post) => {
    setSelectedPost(post);
    setEditPost({ title: post.title, body: post.body, image: null });
    setShowEditModal(true);
  };

  const handleDelete = async (postId: number) => {
    if (!confirm('この投稿を削除しますか？')) return;
    
    try {
      const apiUrl = import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';
      const response = await fetch(`${apiUrl}/api/posts/${postId}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      
      if (response.ok) {
        setPosts(posts.filter(p => p.id !== postId));
        setShowDetailModal(false);
        alert('投稿を削除しました');
      }
    } catch (error) {
      console.error('Failed to delete post:', error);
      alert('削除に失敗しました');
    }
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: API実装後に画像アップロード処理を追加
    alert('投稿を作成しました（画像アップロード機能は準備中です）');
    setShowCreateModal(false);
    setNewPost({ title: '', body: '', image: null });
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPost) return;
    
    // TODO: API実装後に編集処理を追加
    alert('投稿を更新しました（画像アップロード機能は準備中です）');
    setShowEditModal(false);
    setEditPost({ title: '', body: '', image: null });
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
                <div className="flex items-center gap-2">
                  {user && (
                    <>
                      <Button variant="outline" size="sm" onClick={() => handleEdit(selectedPost)}>
                        <Edit className="h-4 w-4 mr-1" />
                        編集
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => handleDelete(selectedPost.id)} className="text-red-600 hover:text-red-700">
                        <Trash2 className="h-4 w-4 mr-1" />
                        削除
                      </Button>
                    </>
                  )}
                  <button onClick={() => setShowDetailModal(false)} className="p-2 hover:bg-gray-100 rounded-full">
                    <X className="h-5 w-5" />
                  </button>
                </div>
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
                    <Upload className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => setNewPost({ ...newPost, image: e.target.files?.[0] || null })}
                      className="hidden"
                      id="create-image"
                    />
                    <label htmlFor="create-image" className="cursor-pointer text-blue-600 hover:text-blue-700">
                      画像を選択
                    </label>
                    {newPost.image && <p className="mt-2 text-sm text-gray-600">{newPost.image.name}</p>}
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

        {/* 編集モーダル */}
        {showEditModal && selectedPost && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowEditModal(false)}>
            <div className="bg-white rounded-lg max-w-2xl w-full" onClick={(e) => e.stopPropagation()}>
              <div className="border-b px-6 py-4 flex items-center justify-between">
                <h2 className="text-2xl font-bold">投稿を編集</h2>
                <button onClick={() => setShowEditModal(false)} className="p-2 hover:bg-gray-100 rounded-full">
                  <X className="h-5 w-5" />
                </button>
              </div>
              <form onSubmit={handleEditSubmit} className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">タイトル *</label>
                  <input
                    type="text"
                    required
                    value={editPost.title}
                    onChange={(e) => setEditPost({ ...editPost, title: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-black"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">内容 *</label>
                  <textarea
                    required
                    value={editPost.body}
                    onChange={(e) => setEditPost({ ...editPost, body: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-black h-32"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">画像を変更</label>
                  <div className="border-2 border-dashed rounded-lg p-6 text-center">
                    <Upload className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => setEditPost({ ...editPost, image: e.target.files?.[0] || null })}
                      className="hidden"
                      id="edit-image"
                    />
                    <label htmlFor="edit-image" className="cursor-pointer text-blue-600 hover:text-blue-700">
                      新しい画像を選択
                    </label>
                    {editPost.image && <p className="mt-2 text-sm text-gray-600">{editPost.image.name}</p>}
                  </div>
                </div>
                <div className="flex gap-2 pt-4">
                  <Button type="button" variant="outline" onClick={() => setShowEditModal(false)} className="flex-1">
                    キャンセル
                  </Button>
                  <Button type="submit" className="flex-1 bg-black hover:bg-gray-800 text-white">
                    更新する
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
