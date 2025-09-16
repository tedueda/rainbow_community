import React, { useEffect, useState } from "react";
import { useAuth } from '../contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Heart, ThumbsUp, Search, Users, Plus } from 'lucide-react';

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

const tabs = [
  { key: "all", label: "すべて" },
  { key: "board", label: "掲示板" },
  { key: "art", label: "アート" },
  { key: "music", label: "音楽" },
  { key: "news", label: "ニュース" },
  { key: "shops", label: "お店" },
  { key: "tours", label: "ツアー" },
];

const featured = [
  {
    id: "f1",
    category: "掲示板",
    title: "はじめての相談：家族へのカミングアウト",
    excerpt: "同じ経験を持つ仲間からのアドバイスが集まっています。",
    badge: "注目",
  },
  {
    id: "f2",
    category: "アート",
    title: "色で語る小さな物語",
    excerpt: "温かい色合いのコラージュ作品。コメント歓迎。",
    badge: "新着",
  },
  {
    id: "f3",
    category: "ツアー",
    title: "大阪・中崎町ほっこり街歩き",
    excerpt: "会員ガイドが地元の名店をご案内。交流のきっかけに。",
    badge: "交流",
  },
];

const categories = [
  { key: "board", title: "掲示板", desc: "悩み相談や雑談、生活の話題。", posts: 15230, emoji: "💬" },
  { key: "art", title: "アート", desc: "イラスト・写真・映像作品の発表。", posts: 8932, emoji: "🎨" },
  { key: "music", title: "音楽", desc: "お気に入りや自作・AI曲の共有。", posts: 6240, emoji: "🎵" },
  { key: "news", title: "ニュース", desc: "国内外の話題や法制度の動き。", posts: 2104, emoji: "📰" },
  { key: "shops", title: "お店", desc: "LGBTQフレンドリーなお店紹介。", posts: 1450, emoji: "🏬" },
  { key: "tours", title: "ツアー", desc: "会員ガイドの交流型ツアー。", posts: 312, emoji: "📍" },
];

const communities = [
  {
    id: "g1",
    name: "関西 交流サークル",
    desc: "週末のオフ会や街歩き。はじめて歓迎。",
    members: 324,
    posts: 120,
    badge: "活発",
  },
  {
    id: "g2",
    name: "仕事とキャリア",
    desc: "働き方・職場の悩み、転職・制度情報。",
    members: 512,
    posts: 240,
  },
  {
    id: "g3",
    name: "学生ひろば",
    desc: "学校・進路・友人関係の相談。",
    members: 210,
    posts: 98,
  },
  {
    id: "g4",
    name: "トランスジェンダー",
    desc: "医療・手続き・日常の工夫を共有。",
    members: 180,
    posts: 160,
  },
  {
    id: "g5",
    name: "アート＆音楽部",
    desc: "作品発表とライブ情報、コラボ募集。",
    members: 430,
    posts: 300,
  },
  {
    id: "g6",
    name: "旅行＆ツーリズム",
    desc: "地元ガイドの交流型ツアーを企画。",
    members: 120,
    posts: 45,
  },
];

const HomePage: React.FC = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [users, setUsers] = useState<{ [key: number]: User }>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const { token, user, isAnonymous, setAnonymousMode } = useAuth();

  const API_URL = (import.meta as any).env.VITE_API_URL || 'http://localhost:8000';

  const fetchPosts = async () => {
    try {
      const headers: any = {};
      if (token && !isAnonymous) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      
      const response = await fetch(`${API_URL}/posts/`, {
        headers,
      });

      if (response.ok) {
        const postsData = await response.json();
        const postsWithCategories = postsData.map((post: Post, index: number) => ({
          ...post,
          category: categories[index % categories.length].key
        }));
        setPosts(postsWithCategories);

        const userIds = [...new Set(postsData.map((post: Post) => post.user_id))];
        const usersData: { [key: number]: User } = {};
        
        for (const userId of userIds) {
          try {
            const userHeaders: any = {};
            if (token && !isAnonymous) {
              userHeaders['Authorization'] = `Bearer ${token}`;
            }
            
            const userResponse = await fetch(`${API_URL}/users/${userId}`, {
              headers: userHeaders,
            });
            if (userResponse.ok) {
              const userData = await userResponse.json();
              usersData[userId as number] = userData;
            }
          } catch (error) {
            console.error(`Error fetching user ${userId}:`, error);
          }
        }
        
        setUsers(usersData);
      } else {
        setError('投稿の取得に失敗しました');
      }
    } catch (err) {
      setError('ネットワークエラー');
    } finally {
      setLoading(false);
    }
  };

  const handleReaction = async (postId: number, reactionType: string) => {
    if (!user || isAnonymous) {
      alert('リアクションするにはプレミアム会員登録が必要です');
      return;
    }
    
    try {
      const response = await fetch(`${API_URL}/reactions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          target_type: 'post',
          target_id: postId,
          reaction_type: reactionType,
        }),
      });

      if (response.ok) {
        fetchPosts();
      }
    } catch (error) {
      console.error('Error adding reaction:', error);
    }
  };

  const filteredPosts = posts.filter(post => {
    const matchesTab = activeTab === 'all' || post.category === activeTab;
    const matchesSearch = searchQuery === '' || 
      post.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.body.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTab && matchesSearch;
  });

  useEffect(() => {
    if (!user && !isAnonymous) {
      setAnonymousMode();
    }
    fetchPosts();
  }, [user, isAnonymous, setAnonymousMode]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto p-4 sm:p-6">
        <div className="text-center text-gray-600">コンテンツを読み込み中...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-rose-50 via-white to-indigo-50 text-slate-800">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        {/* ヒーロー */}
        <section className="py-10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold leading-tight text-pink-800">
                温かく寄り添えるオンラインの居場所。
              </h2>
              <p className="mt-3 text-slate-600">
                悩み相談、アート、音楽、地元ツアー。ここから、あなたの物語が始まります。
              </p>
              <div className="mt-5 flex flex-wrap gap-3">
                {user && !isAnonymous ? (
                  <Button 
                    onClick={() => window.location.href = '/create'}
                    className="bg-gradient-to-r from-pink-500 to-orange-400 hover:from-pink-600 hover:to-orange-500 text-white px-5 py-2 font-medium"
                  >
                    投稿を作成
                  </Button>
                ) : (
                  <>
                    <Button 
                      onClick={() => window.location.href = '/login'}
                      className="bg-gradient-to-r from-pink-500 to-orange-400 hover:from-pink-600 hover:to-orange-500 text-white px-5 py-2 font-medium"
                    >
                      プレミアム会員登録（月1,000円）
                    </Button>
                    <Button 
                      variant="outline"
                      className="border-pink-300 text-pink-700 hover:bg-pink-50 px-5 py-2 font-medium"
                    >
                      無料で閲覧（限定コンテンツ）
                    </Button>
                  </>
                )}
              </div>
              {(!user || isAnonymous) && (
                <p className="mt-2 text-xs text-slate-500">
                  * 無料会員は各カテゴリの最新投稿を閲覧できます。
                </p>
              )}
            </div>
            <div className="h-44 md:h-56 lg:h-64 rounded-3xl bg-gradient-to-br from-pink-200 via-green-200 to-orange-200 shadow-inner" />
          </div>
        </section>

        {/* タブ＋検索 */}
        <section className="py-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <TabsList className="bg-white border border-pink-200">
                  {tabs.map((t) => (
                    <TabsTrigger 
                      key={t.key} 
                      value={t.key}
                      className="data-[state=active]:bg-pink-100 data-[state=active]:text-pink-800"
                    >
                      {t.label}
                    </TabsTrigger>
                  ))}
                </TabsList>
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <Input
                    type="text"
                    placeholder="キーワードで探す（例：悩み相談 / カフェ / 中崎町）"
                    value={searchQuery}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
                    className="w-full sm:w-80 border-pink-200 focus:border-pink-400"
                  />
                  <Button className="bg-pink-600 hover:bg-pink-700 text-white">
                    <Search className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </Tabs>
          </div>
        </section>

        {/* 今週のお知らせ（カルーセル） */}
        <section className="py-8">
          <h3 className="text-lg font-semibold mb-3 text-pink-800">今週のお知らせ</h3>
          <Carousel className="w-full">
            <CarouselContent>
              {featured.map((item) => (
                <CarouselItem key={item.id}>
                  <Card className="border-pink-200 shadow-lg">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2 text-xs mb-2">
                        <span className="rounded-full bg-orange-100 text-orange-700 px-2 py-0.5">{item.badge}</span>
                        <span className="text-slate-500">{item.category}</span>
                      </div>
                      <h4 className="font-semibold leading-snug text-pink-800">{item.title}</h4>
                      <p className="mt-1 text-sm text-slate-600">{item.excerpt}</p>
                      <div className="mt-3 flex justify-between items-center">
                        <Button variant="ghost" className="text-pink-700 hover:text-pink-900 hover:bg-pink-50">
                          詳しく見る
                        </Button>
                        <Button variant="outline" size="sm" className="border-pink-300 text-pink-700 hover:bg-pink-50">
                          いいね
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious className="border-pink-300 text-pink-700 hover:bg-pink-50" />
            <CarouselNext className="border-pink-300 text-pink-700 hover:bg-pink-50" />
          </Carousel>
        </section>

        {/* カテゴリーセクション */}
        <section className="py-6">
          <div className="flex items-baseline justify-between mb-3">
            <h3 className="text-lg font-semibold text-pink-800">カテゴリーから探す</h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {categories.map((cat) => (
              <Card key={cat.key} className="group border-pink-100 hover:shadow-md transition-shadow cursor-pointer" onClick={() => setActiveTab(cat.key)}>
                <div className="h-28 sm:h-36 bg-gradient-to-br from-pink-200 via-green-200 to-orange-200 flex items-center justify-center">
                  <div className="h-12 w-12 sm:h-16 sm:w-16 rounded-2xl bg-white/80 border border-pink-200 shadow-sm flex items-center justify-center text-2xl sm:text-3xl">
                    <span>{cat.emoji}</span>
                  </div>
                </div>
                <CardContent className="p-3 sm:p-4">
                  <div className="text-xs text-slate-500">カテゴリー</div>
                  <h4 className="mt-1 font-semibold leading-snug group-hover:text-pink-700 text-[15px] sm:text-base">{cat.title}</h4>
                  <p className="mt-1 text-sm text-slate-600 line-clamp-2">{cat.desc}</p>
                  <div className="mt-2 sm:mt-3 flex items-center justify-between text-sm text-slate-600">
                    <span>📄 {cat.posts.toLocaleString()}</span>
                    <Button variant="outline" size="sm" className="border-pink-300 text-pink-700 hover:bg-pink-50">
                      このカテゴリーを見る
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* 投稿一覧 */}
        <section className="py-6">
          <div className="flex items-baseline justify-between mb-3">
            <h3 className="text-lg font-semibold text-pink-800">
              {activeTab === 'all' ? '新着投稿' : `${tabs.find(t => t.key === activeTab)?.label}の投稿`}
            </h3>
          </div>
          
          {error && (
            <div className="text-red-600 text-center bg-red-50 p-4 rounded-lg mb-6">{error}</div>
          )}

          {filteredPosts.length === 0 ? (
            <Card className="text-center p-6 sm:p-8 border-pink-200 shadow-lg">
              <CardContent>
                <Heart className="h-12 sm:h-16 w-12 sm:w-16 text-pink-300 mx-auto mb-4" />
                <h3 className="text-lg sm:text-xl font-semibold text-gray-700 mb-2">
                  {activeTab === 'all' ? 'まだ投稿がありません。' : `${tabs.find(t => t.key === activeTab)?.label}の投稿がありません。`}
                </h3>
                <p className="text-gray-500 mb-4">コミュニティの投稿をお待ちください。</p>
                {user && !isAnonymous ? (
                  <Button 
                    onClick={() => window.location.href = '/create'}
                    className="bg-gradient-to-r from-pink-500 to-orange-400 hover:from-pink-600 hover:to-orange-500 text-white"
                  >
                    最初の投稿を作成
                  </Button>
                ) : (
                  <Button 
                    onClick={() => window.location.href = '/login'}
                    className="bg-gradient-to-r from-pink-500 to-orange-400 hover:from-pink-600 hover:to-orange-500 text-white"
                  >
                    投稿するにはプレミアム登録
                  </Button>
                )}
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredPosts.map((post) => (
                <Card key={post.id} className="shadow-sm hover:shadow-md transition-shadow border-pink-100">
                  <div className="h-36 bg-gradient-to-br from-pink-200 via-green-200 to-orange-200" />
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 text-xs mb-2">
                      <span className="text-slate-500">{categories.find(c => c.key === post.category)?.title}</span>
                      <span className="text-slate-400">•</span>
                      <span className="text-slate-500">{new Date(post.created_at).toLocaleDateString('ja-JP')}</span>
                    </div>
                    {post.title && (
                      <h4 className="font-semibold leading-snug text-pink-800 mb-1">{post.title}</h4>
                    )}
                    <p className="text-sm text-slate-600 line-clamp-2 mb-3">{post.body}</p>
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center space-x-2">
                        <div className="w-6 h-6 bg-gradient-to-br from-pink-100 to-green-100 rounded-full flex items-center justify-center">
                          <span className="text-pink-600 font-semibold text-xs">
                            {users[post.user_id]?.display_name?.charAt(0) || '?'}
                          </span>
                        </div>
                        <span className="text-slate-600 text-xs">{users[post.user_id]?.display_name || '不明なユーザー'}</span>
                      </div>
                      {user && !isAnonymous ? (
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleReaction(post.id, 'like')}
                            className="text-gray-600 hover:text-pink-600 hover:bg-pink-50 p-1"
                          >
                            <ThumbsUp className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleReaction(post.id, 'love')}
                            className="text-gray-600 hover:text-pink-600 hover:bg-pink-50 p-1"
                          >
                            <Heart className="h-3 w-3" />
                          </Button>
                        </div>
                      ) : (
                        <Button 
                          onClick={() => window.location.href = '/login'}
                          size="sm"
                          variant="outline"
                          className="border-pink-300 text-pink-700 hover:bg-pink-50 text-xs"
                        >
                          プレミアム登録
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </section>

        {/* コミュニティセクション */}
        <section className="py-6">
          <div className="flex items-baseline justify-between mb-3">
            <h3 className="text-lg font-semibold text-pink-800">コミュニティ</h3>
            {user && !isAnonymous ? (
              <Button className="bg-pink-600 hover:bg-pink-700 text-white">
                <Plus className="h-4 w-4 mr-2" />
                コミュニティを作成
              </Button>
            ) : (
              <Button 
                onClick={() => window.location.href = '/login'}
                variant="outline"
                className="border-pink-300 text-pink-700 hover:bg-pink-50"
              >
                <Plus className="h-4 w-4 mr-2" />
                作成にはプレミアム登録
              </Button>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* 新規作成カード */}
            <Card className="bg-gradient-to-br from-pink-100 via-green-100 to-orange-100 border-pink-200 p-5">
              <CardContent className="p-0">
                <div className="text-xs text-slate-600 mb-1">はじめての方へ</div>
                <h4 className="text-base font-semibold text-pink-800">あなたのコミュニティを立ち上げませんか？</h4>
                <p className="mt-1 text-sm text-slate-700">
                  テーマは自由。悩み相談、趣味、地域交流、ツアーの企画など。
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {user && !isAnonymous ? (
                    <Button className="bg-pink-600 hover:bg-pink-700 text-white text-sm">
                      <Plus className="h-3 w-3 mr-1" />
                      作成する
                    </Button>
                  ) : (
                    <Button 
                      onClick={() => window.location.href = '/login'}
                      className="bg-gradient-to-r from-pink-500 to-orange-400 hover:from-pink-600 hover:to-orange-500 text-white text-sm"
                    >
                      <Plus className="h-3 w-3 mr-1" />
                      プレミアム登録
                    </Button>
                  )}
                  <Button variant="outline" size="sm" className="border-pink-300 text-pink-700 hover:bg-pink-50">
                    ガイドを見る
                  </Button>
                </div>
              </CardContent>
            </Card>

            {communities.map((g) => (
              <Card key={g.id} className="border-pink-100 shadow-sm p-5">
                <CardContent className="p-0">
                  <div className="flex items-center gap-2 text-xs mb-2">
                    {g.badge ? (
                      <span className="rounded-full bg-green-100 text-green-700 px-2 py-0.5">{g.badge}</span>
                    ) : (
                      <span className="rounded-full bg-slate-100 text-slate-600 px-2 py-0.5">コミュニティ</span>
                    )}
                    <span className="text-slate-500">
                      <Users className="h-3 w-3 inline mr-1" />
                      {g.members}人
                    </span>
                    <span className="text-slate-500">💬 {g.posts}</span>
                  </div>
                  <h4 className="font-semibold leading-snug text-pink-800">{g.name}</h4>
                  <p className="mt-1 text-sm text-slate-600 line-clamp-2">{g.desc}</p>
                  <div className="mt-3 flex justify-between items-center">
                    <Button variant="ghost" className="text-pink-700 hover:text-pink-900 hover:bg-pink-50 text-sm">
                      中を見る
                    </Button>
                    {user && !isAnonymous ? (
                      <Button variant="outline" size="sm" className="border-pink-300 text-pink-700 hover:bg-pink-50">
                        参加する
                      </Button>
                    ) : (
                      <Button 
                        onClick={() => window.location.href = '/login'}
                        variant="outline" 
                        size="sm" 
                        className="border-pink-300 text-pink-700 hover:bg-pink-50"
                      >
                        プレミアム登録
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* 参加CTA */}
        <section className="py-10">
          <Card className="bg-white/80 border-pink-200 p-6 md:p-8 text-center">
            <CardContent>
              <h3 className="text-xl font-semibold text-pink-800">無料で雰囲気を体験してみませんか？</h3>
              <p className="mt-2 text-slate-600">
                無料会員は各カテゴリの最新投稿を閲覧できます。投稿やコメントは有料会員でご利用いただけます。
              </p>
              <div className="mt-4 flex flex-wrap gap-3 justify-center">
                <Button 
                  onClick={() => window.location.href = '/login'}
                  className="bg-gradient-to-r from-pink-500 to-orange-400 hover:from-pink-600 hover:to-orange-500 text-white px-5 py-2 font-medium"
                >
                  プレミアム会員になる（月1,000円）
                </Button>
                <Button 
                  variant="outline"
                  className="border-pink-300 text-pink-700 hover:bg-pink-50 px-5 py-2 font-medium"
                >
                  無料で試す（限定閲覧）
                </Button>
              </div>
            </CardContent>
          </Card>
        </section>

      </div>
    </div>
  );
};

export default HomePage;
