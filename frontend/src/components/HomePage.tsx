import React, { useEffect, useState, useRef } from "react";
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from './ui/carousel';
import { Tabs, TabsList, TabsTrigger } from './ui/tabs';
import { Input } from './ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Heart, ThumbsUp, Search, MessageCircle, Calendar, ArrowRight } from 'lucide-react';
import UnderConstructionModal from './UnderConstructionModal';

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
  { key: "shops", label: "お店" },
  { key: "tours", label: "ツアー" },
  { key: "comics", label: "コミック・映画" },
];

const memberBenefits = [
  {
    id: "matching",
    title: "マッチング",
    description: "理想のパートナーと出会える安心のマッチングサービス",
    icon: "💕",
    link: "/matching",
  },
  {
    id: "virtual-wedding",
    title: "ウェディング動画・配信",
    description: "オンラインで叶える特別な結婚式体験",
    icon: "💒",
    link: "/virtual-wedding",
  },
  {
    id: "donation",
    title: "募金",
    description: "LGBTQ+コミュニティを支援する寄付プラットフォーム",
    icon: "🤝",
    link: "/donation",
  },
];

const categories = [
  { key: "board", title: "掲示板", desc: "悩み相談や雑談、生活の話題。", posts: 15230, emoji: "💬" },
  { key: "art", title: "アート", desc: "イラスト・写真・映像作品の発表。", posts: 8932, emoji: "🎨" },
  { key: "music", title: "音楽", desc: "お気に入りや自作・AI曲の共有。", posts: 6240, emoji: "🎵" },
  { key: "shops", title: "お店", desc: "LGBTQフレンドリーなお店紹介。", posts: 1450, emoji: "🏬" },
  { key: "tours", title: "ツアー", desc: "会員ガイドの交流型ツアー。", posts: 312, emoji: "📍" },
  { key: "comics", title: "コミック・映画", desc: "LGBTQ+テーマの作品レビューと感想。", posts: 2840, emoji: "🎬" },
];

const newsArticles = [
  {
    id: "n1",
    title: "同性パートナーシップ制度、全国で拡大中",
    excerpt: "2024年度に新たに15自治体が制度を導入。現在の導入状況と今後の展望について解説します。",
    tags: ["制度", "パートナーシップ", "自治体"],
    date: "2024-09-15",
  },
  {
    id: "n2", 
    title: "職場でのLGBTQ+理解促進セミナー開催報告",
    excerpt: "企業向けダイバーシティ研修の効果と参加者の声をまとめました。",
    tags: ["職場", "研修", "ダイバーシティ"],
    date: "2024-09-12",
  },
  {
    id: "n3",
    title: "Rainbow Festa 2024 開催決定！",
    excerpt: "今年のテーマは「つながり」。10月開催予定のイベント詳細をお知らせします。",
    tags: ["イベント", "フェスタ", "コミュニティ"],
    date: "2024-09-10",
  },
];

const dummyPosts: Post[] = [
  {
    id: 1,
    title: "初めての投稿です！",
    body: "こんにちは！Rainbow Communityに参加しました。温かいコミュニティで素敵な出会いがありそうです。よろしくお願いします。",
    user_id: 1,
    visibility: "public",
    created_at: "2024-09-15T10:30:00Z",
    category: "board"
  },
  {
    id: 2,
    title: "虹色のイラストを描きました",
    body: "プライド月間に向けて、虹をテーマにしたデジタルアートを制作しました。色彩豊かな作品になったと思います。",
    user_id: 2,
    visibility: "public",
    created_at: "2024-09-14T15:45:00Z",
    category: "art"
  },
  {
    id: 3,
    title: "おすすめのLGBTQ+楽曲",
    body: "最近聴いているアーティストの楽曲がとても心に響きます。同じような音楽が好きな方と語り合いたいです。",
    user_id: 3,
    visibility: "public",
    created_at: "2024-09-13T20:15:00Z",
    category: "music"
  },
  {
    id: 4,
    title: "新宿のLGBTQフレンドリーカフェ",
    body: "新宿二丁目にある素敵なカフェを見つけました。スタッフの方々がとても親切で、居心地の良い空間でした。",
    user_id: 4,
    visibility: "public",
    created_at: "2024-09-12T12:00:00Z",
    category: "shops"
  },
  {
    id: 5,
    title: "東京レインボープライドツアー企画",
    body: "来年のプライドイベントに向けて、みんなで一緒に参加するツアーを企画しています。興味のある方はぜひご参加ください。",
    user_id: 5,
    visibility: "public",
    created_at: "2024-09-11T18:30:00Z",
    category: "tours"
  },
  {
    id: 6,
    title: "「君の名は。」のLGBTQ+解釈について",
    body: "新海誠監督の作品にはジェンダーアイデンティティのテーマが含まれていると思います。皆さんはどう思われますか？",
    user_id: 6,
    visibility: "public",
    created_at: "2024-09-10T14:20:00Z",
    category: "comics"
  }
];

const dummyUsers: { [key: number]: User } = {
  1: { id: 1, display_name: "さくら", email: "sakura@example.com" },
  2: { id: 2, display_name: "アート太郎", email: "art@example.com" },
  3: { id: 3, display_name: "音楽好き", email: "music@example.com" },
  4: { id: 4, display_name: "カフェ探検家", email: "cafe@example.com" },
  5: { id: 5, display_name: "ツアーガイド", email: "tour@example.com" },
  6: { id: 6, display_name: "映画評論家", email: "movie@example.com" }
};

const HomePage: React.FC = () => {
  const [posts, setPosts] = useState<Post[]>(dummyPosts);
  const [users, setUsers] = useState<{ [key: number]: User }>(dummyUsers);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isCarouselHovered, setIsCarouselHovered] = useState(false);
  const [showConstructionModal, setShowConstructionModal] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  const carouselApiRef = useRef<any>(null);
  const { token, user, isAnonymous, setAnonymousMode } = useAuth();
  const navigate = useNavigate();

  const API_URL = (import.meta as any).env.VITE_API_URL || 'http://localhost:8000';

  const fetchPosts = async () => {
    try {
      const headers: any = {};
      if (token && !isAnonymous) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      
      const response = await fetch(`${API_URL}/api/posts?limit=20`, {
        headers,
      });

      if (response.ok) {
        const postsData = await response.json();
        
        const enhancedPosts = postsData.map((post: any) => ({
          ...post,
          like_count: Math.floor(Math.random() * 50) + 1,
          comment_count: Math.floor(Math.random() * 20),
          points: Math.floor(Math.random() * 100) + 10,
          is_liked: false,
          media_urls: post.body.includes('#art') || post.body.includes('#shops') 
            ? [`https://picsum.photos/400/300?random=${post.id}`] 
            : undefined,
          youtube_url: post.body.includes('#music') 
            ? `https://www.youtube.com/watch?v=dQw4w9WgXcQ` 
            : undefined,
        }));
        
        setPosts(enhancedPosts);
        
        const userIds = [...new Set(enhancedPosts.map((post: any) => post.user_id))];
        const usersData: { [key: number]: any } = {};
        
        for (const userId of userIds) {
          try {
            const userHeaders: any = {};
            if (token && !isAnonymous) {
              userHeaders['Authorization'] = `Bearer ${token}`;
            }
            
            const userResponse = await fetch(`${API_URL}/api/users/${userId}`, {
              headers: userHeaders,
            });
            if (userResponse.ok) {
              const userData = await userResponse.json();
              usersData[userId as number] = userData;
            }
          } catch (error) {
            console.error(`Error fetching user ${userId}:`, error);
            usersData[userId as number] = {
              id: userId,
              display_name: `ユーザー${userId}`,
              email: `user${userId}@example.com`
            };
          }
        }
        
        setUsers(usersData);
      } else {
        console.error('Failed to fetch posts from API, using fallback data');
        setPosts(dummyPosts);
        setUsers(dummyUsers);
      }
    } catch (error) {
      console.error('Error fetching posts:', error);
      setPosts(dummyPosts);
      setUsers(dummyUsers);
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
      const response = await fetch(`${API_URL}/api/reactions`, {
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


  useEffect(() => {
    if (!user && !isAnonymous) {
      setAnonymousMode();
    }
    fetchPosts();
  }, [user, isAnonymous, setAnonymousMode]);

  useEffect(() => {
    if (!isCarouselHovered && posts.length > 0 && carouselApiRef.current) {
      const interval = setInterval(() => {
        if (carouselApiRef.current && !isCarouselHovered) {
          const api = carouselApiRef.current;
          if (api.canScrollNext()) {
            api.scrollNext();
          } else {
            api.scrollTo(0);
          }
        }
      }, 4000);

      return () => clearInterval(interval);
    }
  }, [isCarouselHovered, posts.length]);

  useEffect(() => {
    if (carouselApiRef.current && posts.length > 0) {
      const timer = setTimeout(() => {
        if (!isCarouselHovered && carouselApiRef.current) {
          setIsCarouselHovered(false);
        }
      }, 100);
      
      return () => clearTimeout(timer);
    }
  }, [carouselApiRef.current, posts.length]);

  useEffect(() => {
    const slideInterval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % 5);
    }, 5000);

    return () => clearInterval(slideInterval);
  }, []);

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
                自分を表現して、<br />新しい仲間と出会おう！
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
            <div className="relative h-44 md:h-56 lg:h-64 rounded-3xl overflow-hidden shadow-inner">
              <div 
                className={`absolute inset-0 transition-opacity duration-1000 ${currentSlide === 0 ? 'opacity-100' : 'opacity-0'}`}
              >
                <img 
                  src="/images/hero-slide-1.jpg" 
                  alt="LGBTQ+ Community Illustration 1"
                  className="w-full h-full object-cover"
                />
              </div>
              <div 
                className={`absolute inset-0 transition-opacity duration-1000 ${currentSlide === 1 ? 'opacity-100' : 'opacity-0'}`}
              >
                <img 
                  src="/images/hero-slide-2.jpg" 
                  alt="LGBTQ+ Community Illustration 2"
                  className="w-full h-full object-cover"
                />
              </div>
              <div 
                className={`absolute inset-0 transition-opacity duration-1000 ${currentSlide === 2 ? 'opacity-100' : 'opacity-0'}`}
              >
                <img 
                  src="/images/hero-slide-3.jpg" 
                  alt="LGBTQ+ Community Illustration 3"
                  className="w-full h-full object-cover"
                />
              </div>
              <div 
                className={`absolute inset-0 transition-opacity duration-1000 ${currentSlide === 3 ? 'opacity-100' : 'opacity-0'}`}
              >
                <img 
                  src="/images/hero-slide-4.jpg" 
                  alt="LGBTQ+ Community Illustration 4"
                  className="w-full h-full object-cover"
                />
              </div>
              <div 
                className={`absolute inset-0 transition-opacity duration-1000 ${currentSlide === 4 ? 'opacity-100' : 'opacity-0'}`}
              >
                <img 
                  src="/images/hero-slide-5.jpg" 
                  alt="LGBTQ+ Community Illustration 5"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
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

        {/* 最新投稿カルーセル */}
        <section className="py-8">
          <div className="flex items-baseline justify-between mb-3">
            <h3 className="text-lg font-semibold text-pink-800">最新投稿</h3>
            <Button 
              variant="ghost" 
              className="text-pink-700 hover:text-pink-900 hover:bg-pink-50"
              onClick={() => navigate('/posts')}
            >
              すべての投稿を見る
              <ArrowRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
          <div 
            onMouseEnter={() => setIsCarouselHovered(true)}
            onMouseLeave={() => setIsCarouselHovered(false)}
          >
            <Carousel 
              className="w-full"
              setApi={(api) => { 
                carouselApiRef.current = api; 
              }}
              opts={{
                align: "start",
                loop: true,
                breakpoints: {
                  '(max-width: 767px)': { slidesToScroll: 1 },
                  '(min-width: 768px) and (max-width: 1023px)': { slidesToScroll: 2 },
                  '(min-width: 1024px)': { slidesToScroll: 3 }
                }
              }}
            >
            <CarouselContent className="-ml-2 md:-ml-4">
              {posts.slice(0, 9).map((post) => (
                <CarouselItem key={post.id} className="pl-2 md:pl-4 basis-full md:basis-1/2 lg:basis-1/3">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Card className="border-pink-200 shadow-lg hover:shadow-xl transition-all duration-200 cursor-pointer group">
                        <div className="h-40 bg-gradient-to-br from-pink-200 via-green-200 to-orange-200 rounded-t-lg" />
                        <CardContent className="p-4">
                          <div className="flex items-center gap-2 text-xs mb-2">
                            <span className="rounded-full bg-pink-100 text-pink-700 px-2 py-0.5">
                              {categories.find(c => c.key === post.category)?.title || '掲示板'}
                            </span>
                            <span className="text-slate-500">
                              {new Date(post.created_at).toLocaleDateString('ja-JP', { month: 'short', day: 'numeric' })}
                            </span>
                          </div>
                          {post.title && (
                            <h4 className="font-semibold leading-snug text-pink-800 mb-1 group-hover:text-pink-900 line-clamp-2">
                              {post.title}
                            </h4>
                          )}
                          <p className="text-sm text-slate-600 line-clamp-2 mb-3">{post.body}</p>
                          <div className="flex items-center justify-between text-sm">
                            <div className="flex items-center gap-3 text-slate-500">
                              <span className="flex items-center gap-1">
                                <Heart className="h-3 w-3" />
                                {Math.floor(Math.random() * 20) + 1}
                              </span>
                              <span className="flex items-center gap-1">
                                <MessageCircle className="h-3 w-3" />
                                {Math.floor(Math.random() * 10)}
                              </span>
                            </div>
                            <span className="text-xs text-slate-400">
                              {users[post.user_id]?.display_name || '不明なユーザー'}
                            </span>
                          </div>
                        </CardContent>
                      </Card>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle className="text-pink-800">
                          {post.title || '投稿詳細'}
                        </DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div className="h-64 bg-gradient-to-br from-pink-200 via-green-200 to-orange-200 rounded-lg" />
                        <div className="flex items-center gap-2 text-sm">
                          <span className="rounded-full bg-pink-100 text-pink-700 px-2 py-1">
                            {categories.find(c => c.key === post.category)?.title || '掲示板'}
                          </span>
                          <span className="text-slate-500">
                            {new Date(post.created_at).toLocaleDateString('ja-JP')}
                          </span>
                        </div>
                        <p className="text-slate-700 whitespace-pre-wrap">{post.body}</p>
                        <div className="flex items-center gap-4 pt-4 border-t">
                          {user && !isAnonymous ? (
                            <>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleReaction(post.id, 'like')}
                                className="text-gray-600 hover:text-pink-600 hover:bg-pink-50"
                              >
                                <ThumbsUp className="h-4 w-4 mr-1" />
                                いいね
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleReaction(post.id, 'love')}
                                className="text-gray-600 hover:text-pink-600 hover:bg-pink-50"
                              >
                                <Heart className="h-4 w-4 mr-1" />
                                愛
                              </Button>
                            </>
                          ) : (
                            <Button 
                              onClick={() => navigate('/login')}
                              size="sm"
                              className="bg-gradient-to-r from-pink-500 to-orange-400 hover:from-pink-600 hover:to-orange-500 text-white"
                            >
                              プレミアム登録してリアクション
                            </Button>
                          )}
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious className="border-pink-300 text-pink-700 hover:bg-pink-50" />
            <CarouselNext className="border-pink-300 text-pink-700 hover:bg-pink-50" />
          </Carousel>
          </div>
        </section>

        {/* イベント特集バナー */}
        <section className="py-6">
          <Card className="bg-gradient-to-r from-pink-500 via-purple-500 to-orange-500 text-white border-0 shadow-xl">
            <CardContent className="p-6 md:p-8 text-center">
              <div className="flex items-center justify-center gap-2 mb-3">
                <Calendar className="h-6 w-6" />
                <span className="text-sm font-medium bg-white/20 px-3 py-1 rounded-full">特別イベント</span>
              </div>
              <h3 className="text-2xl md:text-3xl font-bold mb-2">Rainbow Festa 2024</h3>
              <p className="text-lg mb-4 opacity-90">つながりをテーマに、10月開催決定！</p>
              <Button 
                onClick={() => navigate('/news')}
                className="bg-white text-pink-600 hover:bg-gray-100 font-semibold px-6 py-2"
              >
                詳細を見る
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </CardContent>
          </Card>
        </section>

        {/* カテゴリーセクション */}
        <section className="py-6">
          <div className="flex items-baseline justify-between mb-3">
            <h3 className="text-lg font-semibold text-pink-800">カテゴリーから探す</h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {categories.map((cat) => (
              <Card 
                key={cat.key} 
                className="group border-pink-100 hover:shadow-lg transition-all duration-200 cursor-pointer hover:scale-[1.02]" 
                onClick={() => navigate(`/category/${cat.key}`)}
              >
                <div className="h-32 sm:h-40 bg-gradient-to-br from-pink-200 via-green-200 to-orange-200 flex items-center justify-center rounded-t-lg">
                  <div className="h-16 w-16 sm:h-20 sm:w-20 rounded-2xl bg-white/90 border border-pink-200 shadow-lg flex items-center justify-center text-3xl sm:text-4xl group-hover:scale-110 transition-transform">
                    <span>{cat.emoji}</span>
                  </div>
                </div>
                <CardContent className="p-4 sm:p-5">
                  <div className="text-xs text-slate-500">カテゴリー</div>
                  <h4 className="mt-1 font-semibold leading-snug group-hover:text-pink-700 text-base sm:text-lg">{cat.title}</h4>
                  <p className="mt-2 text-sm text-slate-600 line-clamp-2">{cat.desc}</p>
                  <div className="mt-3 sm:mt-4 flex items-center justify-between text-sm text-slate-600">
                    <span className="flex items-center gap-1">
                      📄 {cat.posts.toLocaleString()}件
                    </span>
                    <Button variant="outline" size="sm" className="border-pink-300 text-pink-700 hover:bg-pink-50 group-hover:border-pink-400">
                      投稿を見る
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>


        {/* 会員特典メニュー */}
        <section className="py-6">
          <div className="flex items-baseline justify-between mb-3">
            <h3 className="text-lg font-semibold text-pink-800">会員特典メニュー</h3>
            <span className="text-sm text-slate-500">プレミアム会員限定</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {memberBenefits.map((benefit) => (
              <Card 
                key={benefit.id} 
                className="group border-pink-100 hover:shadow-lg transition-all duration-200 cursor-pointer hover:scale-[1.03]"
                onClick={() => setShowConstructionModal(true)}
              >
                <CardContent className="p-5 text-center">
                  <div className="text-4xl mb-3 group-hover:scale-110 transition-transform">
                    {benefit.icon}
                  </div>
                  <h4 className="font-semibold text-pink-800 mb-2 group-hover:text-pink-900">
                    {benefit.title}
                  </h4>
                  <p className="text-sm text-slate-600 mb-4 line-clamp-2">
                    {benefit.description}
                  </p>
                  <Button 
                    className="w-full bg-gradient-to-r from-pink-500 to-orange-400 hover:from-pink-600 hover:to-orange-500 text-white group-hover:shadow-md transition-all"
                    size="sm"
                  >
                    利用する
                    <ArrowRight className="h-3 w-3 ml-1" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* ニュースセクション */}
        <section className="py-6">
          <div className="flex items-baseline justify-between mb-3">
            <h3 className="text-lg font-semibold text-pink-800">最新ニュース</h3>
            <Button 
              variant="ghost" 
              className="text-pink-700 hover:text-pink-900 hover:bg-pink-50"
              onClick={() => navigate('/news')}
            >
              すべてのニュースを見る
              <ArrowRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {newsArticles.map((article) => (
              <Card key={article.id} className="border-pink-100 hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex flex-wrap gap-1 mb-2">
                    {article.tags.map((tag) => (
                      <span key={tag} className="text-xs bg-pink-100 text-pink-700 px-2 py-0.5 rounded-full">
                        {tag}
                      </span>
                    ))}
                  </div>
                  <h4 className="font-semibold text-pink-800 mb-2 line-clamp-2">
                    {article.title}
                  </h4>
                  <p className="text-sm text-slate-600 mb-3 line-clamp-3">
                    {article.excerpt}
                  </p>
                  <div className="flex items-center justify-between text-xs text-slate-500">
                    <span>{new Date(article.date).toLocaleDateString('ja-JP')}</span>
                    <Button variant="ghost" size="sm" className="text-pink-700 hover:text-pink-900 hover:bg-pink-50 p-0">
                      続きを読む
                    </Button>
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
      
      <UnderConstructionModal 
        isOpen={showConstructionModal}
        onClose={() => setShowConstructionModal(false)}
      />
    </div>
  );
};

export default HomePage;
