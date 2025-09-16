import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader } from './ui/card';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { ArrowLeft, Plus, Heart, MessageCircle, Send } from 'lucide-react';

interface User {
  id: number;
  display_name: string;
  email: string;
}

interface Post {
  id: number;
  title?: string;
  body: string;
  user_id: number;
  visibility: string;
  created_at: string;
  category?: string;
}


const categories = {
  board: { title: "掲示板", emoji: "💬", desc: "悩み相談や雑談、生活の話題" },
  art: { title: "アート", emoji: "🎨", desc: "イラスト・写真・映像作品の発表" },
  music: { title: "音楽", emoji: "🎵", desc: "お気に入りや自作・AI曲の共有" },
  shops: { title: "お店", emoji: "🏬", desc: "LGBTQフレンドリーなお店紹介" },
  tours: { title: "ツアー", emoji: "📍", desc: "会員ガイドの交流型ツアー" },
  comics: { title: "コミック・映画", emoji: "🎬", desc: "LGBTQ+テーマの作品レビューと感想" },
};

const CategoryPage: React.FC = () => {
  const { categoryKey } = useParams<{ categoryKey: string }>();
  const navigate = useNavigate();
  const { token, user, isAnonymous } = useAuth();
  const [posts, setPosts] = useState<Post[]>([]);
  const [users, setUsers] = useState<{ [key: number]: User }>({});
  const [loading, setLoading] = useState(true);
  const [showNewPostForm, setShowNewPostForm] = useState(false);
  const [newPost, setNewPost] = useState({ title: '', body: '' });
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [newComment, setNewComment] = useState('');

  const API_URL = (import.meta as any).env.VITE_API_URL || 'http://localhost:8000';
  const category = categoryKey ? categories[categoryKey as keyof typeof categories] : null;

  const fetchPosts = async () => {
    try {
      const headers: any = {};
      if (token && !isAnonymous) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      
      const response = await fetch(`${API_URL}/posts/`, { headers });
      if (response.ok) {
        const postsData = await response.json();
        const filteredPosts = postsData.filter((post: Post) => 
          post.category === categoryKey || (!post.category && categoryKey === 'board')
        );
        setPosts(filteredPosts);

        const userIds = [...new Set(filteredPosts.map((post: Post) => post.user_id))];
        const usersData: { [key: number]: User } = {};
        
        for (const userId of userIds) {
          try {
            const userResponse = await fetch(`${API_URL}/users/${userId}`, { headers });
            if (userResponse.ok) {
              const userData = await userResponse.json();
              usersData[userId as number] = userData;
            }
          } catch (error) {
            console.error(`Error fetching user ${userId}:`, error);
          }
        }
        setUsers(usersData);
      }
    } catch (err) {
      console.error('Error fetching posts:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePost = async () => {
    if (!user || isAnonymous) {
      alert('投稿するにはプレミアム会員登録が必要です');
      return;
    }

    try {
      const response = await fetch(`${API_URL}/posts/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: newPost.title,
          body: newPost.body,
          visibility: 'public',
          category: categoryKey,
        }),
      });

      if (response.ok) {
        setNewPost({ title: '', body: '' });
        setShowNewPostForm(false);
        fetchPosts();
      }
    } catch (error) {
      console.error('Error creating post:', error);
    }
  };

  const handleAddComment = async () => {
    if (!user || isAnonymous || !selectedPost) {
      alert('コメントするにはプレミアム会員登録が必要です');
      return;
    }

    try {
      const response = await fetch(`${API_URL}/comments/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          post_id: selectedPost.id,
          body: newComment,
        }),
      });

      if (response.ok) {
        setNewComment('');
      }
    } catch (error) {
      console.error('Error adding comment:', error);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, [categoryKey]);

  if (!category) {
    return (
      <div className="max-w-4xl mx-auto p-4 sm:p-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600">カテゴリーが見つかりません</h1>
          <Button onClick={() => navigate('/feed')} className="mt-4">
            ホームに戻る
          </Button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-4 sm:p-6">
        <div className="text-center text-gray-600">投稿を読み込み中...</div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 space-y-6">
      {/* ヘッダー */}
      <div className="flex items-center gap-4">
        <Button 
          variant="ghost" 
          onClick={() => navigate('/feed')}
          className="text-pink-700 hover:text-pink-900 hover:bg-pink-50"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          ホームに戻る
        </Button>
        <div className="flex items-center gap-3">
          <div className="text-3xl">{category.emoji}</div>
          <div>
            <h1 className="text-2xl font-bold text-pink-800">{category.title}</h1>
            <p className="text-slate-600">{category.desc}</p>
          </div>
        </div>
      </div>

      {/* 新規投稿ボタン */}
      <div className="flex justify-end">
        {user && !isAnonymous ? (
          <Button 
            onClick={() => setShowNewPostForm(!showNewPostForm)}
            className="bg-gradient-to-r from-pink-500 to-orange-400 hover:from-pink-600 hover:to-orange-500 text-white"
          >
            <Plus className="h-4 w-4 mr-2" />
            新規投稿
          </Button>
        ) : (
          <Button 
            onClick={() => navigate('/login')}
            className="bg-gradient-to-r from-pink-500 to-orange-400 hover:from-pink-600 hover:to-orange-500 text-white"
          >
            投稿するにはプレミアム登録
          </Button>
        )}
      </div>

      {/* 新規投稿フォーム */}
      {showNewPostForm && (
        <Card className="border-pink-200">
          <CardHeader>
            <h3 className="text-lg font-semibold text-pink-800">新規投稿</h3>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              placeholder="タイトル（任意）"
              value={newPost.title}
              onChange={(e) => setNewPost({ ...newPost, title: e.target.value })}
              className="border-pink-200 focus:border-pink-400"
            />
            <Textarea
              placeholder="投稿内容を入力してください..."
              value={newPost.body}
              onChange={(e) => setNewPost({ ...newPost, body: e.target.value })}
              className="border-pink-200 focus:border-pink-400 min-h-[120px]"
            />
            <div className="flex gap-2">
              <Button 
                onClick={handleCreatePost}
                className="bg-pink-600 hover:bg-pink-700 text-white"
                disabled={!newPost.body.trim()}
              >
                投稿する
              </Button>
              <Button 
                variant="outline" 
                onClick={() => setShowNewPostForm(false)}
                className="border-pink-300 text-pink-700 hover:bg-pink-50"
              >
                キャンセル
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* 投稿一覧 */}
      <div className="space-y-4">
        {posts.length === 0 ? (
          <Card className="text-center p-8 border-pink-200">
            <CardContent>
              <div className="text-4xl mb-4">{category.emoji}</div>
              <h3 className="text-lg font-semibold text-gray-700 mb-2">
                まだ投稿がありません
              </h3>
              <p className="text-gray-500 mb-4">
                最初の投稿をして、コミュニティを盛り上げましょう！
              </p>
            </CardContent>
          </Card>
        ) : (
          posts.map((post) => (
            <Card key={post.id} className="border-pink-100 hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-pink-100 to-green-100 rounded-full flex items-center justify-center">
                      <span className="text-pink-600 font-semibold">
                        {users[post.user_id]?.display_name?.charAt(0) || '?'}
                      </span>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">
                        {users[post.user_id]?.display_name || '不明なユーザー'}
                      </h4>
                      <p className="text-sm text-gray-500">
                        {new Date(post.created_at).toLocaleDateString('ja-JP')}
                      </p>
                    </div>
                  </div>
                </div>
                
                {post.title && (
                  <h3 className="text-xl font-bold text-pink-800 mb-3">{post.title}</h3>
                )}
                <p className="text-gray-700 mb-4 whitespace-pre-wrap">{post.body}</p>
                
                <div className="flex items-center gap-4 pt-4 border-t border-gray-100">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-gray-600 hover:text-pink-600 hover:bg-pink-50"
                  >
                    <Heart className="h-4 w-4 mr-1" />
                    {Math.floor(Math.random() * 20) + 1}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedPost(post)}
                    className="text-gray-600 hover:text-pink-600 hover:bg-pink-50"
                  >
                    <MessageCircle className="h-4 w-4 mr-1" />
                    コメント ({Math.floor(Math.random() * 10)})
                  </Button>
                </div>

                {/* コメントセクション */}
                {selectedPost?.id === post.id && (
                  <div className="mt-6 pt-4 border-t border-gray-100">
                    <h4 className="font-semibold text-gray-900 mb-4">コメント</h4>
                    
                    {/* 新規コメントフォーム */}
                    {user && !isAnonymous ? (
                      <div className="flex gap-2 mb-4">
                        <Input
                          placeholder="コメントを入力..."
                          value={newComment}
                          onChange={(e) => setNewComment(e.target.value)}
                          className="border-pink-200 focus:border-pink-400"
                        />
                        <Button 
                          onClick={handleAddComment}
                          size="sm"
                          className="bg-pink-600 hover:bg-pink-700 text-white"
                          disabled={!newComment.trim()}
                        >
                          <Send className="h-4 w-4" />
                        </Button>
                      </div>
                    ) : (
                      <div className="text-center py-4 bg-gray-50 rounded-lg mb-4">
                        <p className="text-sm text-gray-500 mb-2">
                          コメントするにはプレミアム会員登録が必要です
                        </p>
                        <Button 
                          onClick={() => navigate('/login')}
                          size="sm"
                          className="bg-gradient-to-r from-pink-500 to-orange-400 hover:from-pink-600 hover:to-orange-500 text-white"
                        >
                          プレミアム登録
                        </Button>
                      </div>
                    )}

                    {/* コメント一覧 */}
                    <div className="space-y-3">
                      {[1, 2, 3].map((i) => (
                        <div key={i} className="flex gap-3 p-3 bg-gray-50 rounded-lg">
                          <div className="w-8 h-8 bg-gradient-to-br from-pink-100 to-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                            <span className="text-pink-600 font-semibold text-sm">U</span>
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-semibold text-sm">ユーザー{i}</span>
                              <span className="text-xs text-gray-500">
                                {new Date().toLocaleDateString('ja-JP')}
                              </span>
                            </div>
                            <p className="text-sm text-gray-700">
                              サンプルコメント{i}です。実際のコメント機能は今後実装予定です。
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default CategoryPage;
