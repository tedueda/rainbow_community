import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader } from './ui/card';
import { Input } from './ui/input';
import { ArrowLeft, Search, Calendar, Tag, ExternalLink, TrendingUp } from 'lucide-react';

const NewsPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const categories = [
    { key: 'all', label: 'すべて' },
    { key: 'policy', label: '制度・政策' },
    { key: 'community', label: 'コミュニティ' },
    { key: 'business', label: 'ビジネス' },
    { key: 'international', label: '海外' },
    { key: 'event', label: 'イベント' },
  ];

  const featuredNews = [
    {
      id: 1,
      title: "同性パートナーシップ制度、全国で拡大中",
      excerpt: "2024年度に新たに15自治体が制度を導入。現在の導入状況と今後の展望について詳しく解説します。制度の内容や申請方法、利用できるサービスについても紹介。",
      content: `2024年度に入り、同性パートナーシップ制度を導入する自治体が急速に増加しています。

## 新規導入自治体
今年度新たに制度を導入したのは以下の15自治体です：
- 北海道札幌市
- 宮城県仙台市  
- 埼玉県さいたま市
- 千葉県千葉市
- 神奈川県横浜市
- 愛知県名古屋市
- 大阪府大阪市
- 兵庫県神戸市
- 広島県広島市
- 福岡県福岡市
- その他5自治体

## 制度の内容
パートナーシップ制度では、以下のサービスが利用可能になります：
- 公営住宅への入居申請
- 医療機関での面会・同意
- 生命保険の受益者指定
- 携帯電話の家族割引
- 自治体サービスの家族扱い

## 今後の展望
2025年度末までに、全国の政令指定都市すべてでの導入が見込まれています。`,
      category: 'policy',
      tags: ['制度', 'パートナーシップ', '自治体', '政策'],
      date: '2024-09-15',
      author: 'Rainbow Community編集部',
      featured: true,
      views: 1250,
      source: '内閣府調査',
    },
    {
      id: 2,
      title: "職場でのLGBTQ+理解促進セミナー開催報告",
      excerpt: "企業向けダイバーシティ研修の効果と参加者の声をまとめました。実際の研修内容や導入企業の事例も紹介。",
      content: `先月開催された企業向けLGBTQ+理解促進セミナーの報告をお届けします。

## セミナー概要
- 開催日：2024年8月20日-22日
- 参加企業：85社
- 参加者数：320名
- 満足度：94.2%

## 研修内容
1. LGBTQ+基礎知識
2. 職場での配慮事項
3. 相談窓口の設置方法
4. 制度整備のポイント
5. 事例紹介とディスカッション

## 参加者の声
「具体的な対応方法が分かりやすく説明されていて、すぐに職場で活用できる内容でした」（人事担当者）

「当事者の体験談を聞けたことで、より深く理解することができました」（管理職）

## 導入企業事例
セミナー後、実際に制度を導入した企業の取り組みも紹介しています。`,
      category: 'business',
      tags: ['職場', '研修', 'ダイバーシティ', '企業'],
      date: '2024-09-12',
      author: '田中 美咲',
      featured: false,
      views: 890,
      source: 'セミナー主催者調査',
    },
    {
      id: 3,
      title: "Rainbow Festa 2024 開催決定！",
      excerpt: "今年のテーマは「つながり」。10月開催予定のイベント詳細をお知らせします。出演者情報や参加方法も掲載。",
      content: `Rainbow Festa 2024の開催が正式に決定しました！

## イベント概要
- 開催日：2024年10月14日（土）・15日（日）
- 会場：東京・代々木公園イベント広場
- テーマ：「つながり〜Beyond Boundaries〜」
- 入場料：無料

## 出演者・ゲスト
- 音楽ライブ：MISIA、中島らも、その他
- トークショー：各界著名人
- ワークショップ：20以上のプログラム

## 参加方法
事前登録は不要です。当日会場にお越しください。

## 注意事項
- 雨天決行（荒天時は一部プログラム変更の可能性）
- 会場内での撮影について
- アクセス方法と駐車場情報

詳細は公式サイトをご確認ください。`,
      category: 'event',
      tags: ['イベント', 'フェスタ', 'コミュニティ', '東京'],
      date: '2024-09-10',
      author: 'イベント企画チーム',
      featured: true,
      views: 2100,
      source: 'Rainbow Festa実行委員会',
    },
  ];

  const regularNews = [
    {
      id: 4,
      title: "アメリカ・カリフォルニア州で新たなLGBTQ+保護法案が可決",
      excerpt: "教育現場でのLGBTQ+生徒への配慮を義務化する法案が州議会で可決されました。",
      category: 'international',
      tags: ['海外', '法案', '教育', 'アメリカ'],
      date: '2024-09-08',
      views: 456,
    },
    {
      id: 5,
      title: "大手企業3社がLGBTQ+支援基金を設立",
      excerpt: "IT企業を中心とした3社が共同で、LGBTQ+コミュニティ支援のための基金を設立しました。",
      category: 'business',
      tags: ['企業', '支援', '基金', 'IT'],
      date: '2024-09-05',
      views: 678,
    },
    {
      id: 6,
      title: "プライド月間イベント、全国20都市で開催予定",
      excerpt: "来年6月のプライド月間に向けて、全国各地でイベントの企画が進んでいます。",
      category: 'event',
      tags: ['プライド', 'イベント', '全国', '6月'],
      date: '2024-09-03',
      views: 789,
    },
    {
      id: 7,
      title: "LGBTQ+フレンドリー医療機関の認定制度開始",
      excerpt: "医療現場での適切な対応を評価する新しい認定制度がスタートしました。",
      category: 'policy',
      tags: ['医療', '認定', '制度', 'フレンドリー'],
      date: '2024-09-01',
      views: 543,
    },
  ];

  const filteredNews = regularNews.filter(news => {
    const matchesCategory = selectedCategory === 'all' || news.category === selectedCategory;
    const matchesSearch = searchQuery === '' || 
      news.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      news.excerpt.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-6 space-y-6">
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
          <div className="text-3xl">📰</div>
          <div>
            <h1 className="text-2xl font-bold text-pink-800">ニュース</h1>
            <p className="text-slate-600">最新の制度・条例情報と解説記事</p>
          </div>
        </div>
      </div>

      {/* 検索・フィルター */}
      <Card className="border-pink-200">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  placeholder="ニュースを検索..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 border-pink-200 focus:border-pink-400"
                />
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              {categories.map((category) => (
                <Button
                  key={category.key}
                  variant={selectedCategory === category.key ? "default" : "outline"}
                  size="sm"
                  className={`${
                    selectedCategory === category.key 
                      ? "bg-pink-600 hover:bg-pink-700 text-white" 
                      : "border-pink-300 text-pink-700 hover:bg-pink-50"
                  }`}
                  onClick={() => setSelectedCategory(category.key)}
                >
                  {category.label}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 注目ニュース */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="h-5 w-5 text-pink-600" />
          <h2 className="text-xl font-semibold text-pink-800">注目ニュース</h2>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {featuredNews.filter(news => news.featured).map((news) => (
            <Card key={news.id} className="border-pink-200 hover:shadow-lg transition-shadow cursor-pointer">
              <div className="h-48 bg-gradient-to-br from-pink-200 via-purple-200 to-orange-200 rounded-t-lg" />
              <CardContent className="p-6">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-xs bg-pink-100 text-pink-700 px-2 py-1 rounded-full">
                    {categories.find(c => c.key === news.category)?.label}
                  </span>
                  <div className="flex items-center gap-1 text-xs text-slate-500">
                    <Calendar className="h-3 w-3" />
                    {new Date(news.date).toLocaleDateString('ja-JP')}
                  </div>
                  <div className="flex items-center gap-1 text-xs text-slate-500">
                    <TrendingUp className="h-3 w-3" />
                    {news.views}回閲覧
                  </div>
                </div>
                <h3 className="text-lg font-semibold text-pink-800 mb-2 line-clamp-2">
                  {news.title}
                </h3>
                <p className="text-sm text-slate-600 mb-4 line-clamp-3">
                  {news.excerpt}
                </p>
                <div className="flex flex-wrap gap-1 mb-4">
                  {news.tags.map((tag) => (
                    <span key={tag} className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded">
                      #{tag}
                    </span>
                  ))}
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-500">by {news.author}</span>
                  <Button variant="ghost" size="sm" className="text-pink-700 hover:text-pink-900 hover:bg-pink-50">
                    続きを読む
                    <ExternalLink className="h-3 w-3 ml-1" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* 一般ニュース */}
      <div>
        <h2 className="text-xl font-semibold text-pink-800 mb-4">最新ニュース</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredNews.map((news) => (
            <Card key={news.id} className="border-pink-200 hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs bg-pink-100 text-pink-700 px-2 py-1 rounded-full">
                    {categories.find(c => c.key === news.category)?.label}
                  </span>
                  <div className="flex items-center gap-1 text-xs text-slate-500">
                    <Calendar className="h-3 w-3" />
                    {new Date(news.date).toLocaleDateString('ja-JP')}
                  </div>
                </div>
                <h3 className="font-semibold text-pink-800 mb-2 line-clamp-2">
                  {news.title}
                </h3>
                <p className="text-sm text-slate-600 mb-3 line-clamp-3">
                  {news.excerpt}
                </p>
                <div className="flex flex-wrap gap-1 mb-3">
                  {news.tags.slice(0, 3).map((tag) => (
                    <span key={tag} className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded">
                      #{tag}
                    </span>
                  ))}
                </div>
                <div className="flex items-center justify-between text-xs text-slate-500">
                  <span>{news.views}回閲覧</span>
                  <Button variant="ghost" size="sm" className="text-pink-700 hover:text-pink-900 hover:bg-pink-50 p-0">
                    続きを読む
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* サイドバー情報 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="border-pink-200">
          <CardHeader>
            <h3 className="font-semibold text-pink-800">人気のタグ</h3>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {['制度', 'パートナーシップ', '職場', 'イベント', '企業', '支援', '海外', '政策'].map((tag) => (
                <Button
                  key={tag}
                  variant="outline"
                  size="sm"
                  className="border-pink-300 text-pink-700 hover:bg-pink-50 text-xs"
                >
                  <Tag className="h-3 w-3 mr-1" />
                  {tag}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="border-pink-200">
          <CardHeader>
            <h3 className="font-semibold text-pink-800">月間アクセスランキング</h3>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {featuredNews.slice(0, 3).map((news, index) => (
                <div key={news.id} className="flex items-start gap-3">
                  <span className="flex-shrink-0 w-6 h-6 bg-pink-600 text-white text-xs font-bold rounded-full flex items-center justify-center">
                    {index + 1}
                  </span>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-pink-800 line-clamp-2">
                      {news.title}
                    </p>
                    <p className="text-xs text-slate-500">{news.views}回閲覧</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="border-pink-200">
          <CardHeader>
            <h3 className="font-semibold text-pink-800">ニュースレター</h3>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-slate-600 mb-4">
              最新のニュースや制度情報を週1回お届けします。
            </p>
            <div className="space-y-3">
              <Input
                placeholder="メールアドレス"
                className="border-pink-200 focus:border-pink-400"
                disabled
              />
              <Button 
                className="w-full bg-gradient-to-r from-pink-500 to-orange-400 hover:from-pink-600 hover:to-orange-500 text-white"
                disabled
              >
                登録（準備中）
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default NewsPage;
