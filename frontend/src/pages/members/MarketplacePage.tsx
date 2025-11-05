import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../../components/Header';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowLeft, Search, ShoppingBag, Package, Tag, TrendingUp } from 'lucide-react';

interface MarketItem {
  id: number;
  title: string;
  description: string;
  price: number;
  category: string;
  seller: string;
  image?: string;
  condition: string;
}

const MarketplacePage: React.FC = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const categories = [
    { id: 'all', name: 'すべて', icon: '🛍️' },
    { id: 'fashion', name: 'ファッション', icon: '👔' },
    { id: 'books', name: '本・雑誌', icon: '📚' },
    { id: 'electronics', name: '電子機器', icon: '💻' },
    { id: 'home', name: '生活用品', icon: '🏠' },
    { id: 'handmade', name: 'ハンドメイド', icon: '✨' },
  ];

  const sampleItems: MarketItem[] = [
    {
      id: 1,
      title: 'レインボーフラッグ Tシャツ',
      description: 'プライドパレードで着用したTシャツです。サイズM、ほぼ未使用。',
      price: 1500,
      category: 'fashion',
      seller: 'ユーザーA',
      condition: '未使用に近い',
    },
    {
      id: 2,
      title: 'LGBTQ+関連書籍セット',
      description: 'セクシュアリティやジェンダーに関する書籍5冊セット。',
      price: 3000,
      category: 'books',
      seller: 'ユーザーB',
      condition: '良好',
    },
    {
      id: 3,
      title: 'ハンドメイド レインボーアクセサリー',
      description: '手作りのレインボーカラーブレスレット。プライドの象徴として。',
      price: 800,
      category: 'handmade',
      seller: 'ユーザーC',
      condition: '新品',
    },
  ];

  const filteredItems = sampleItems.filter(item => {
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         item.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

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
            <span className="text-4xl">🛍️</span>
            <div>
              <h1 className="text-4xl font-bold text-gray-900">マーケット</h1>
              <p className="text-gray-600 mt-2">会員同士で安心・安全な売買取引</p>
            </div>
          </div>
        </div>

        {/* Search and Filter */}
        <div className="mb-8 space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="商品を検索..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
            />
          </div>

          <div className="flex gap-2 overflow-x-auto pb-2">
            {categories.map((category) => (
              <Button
                key={category.id}
                variant={selectedCategory === category.id ? 'default' : 'outline'}
                onClick={() => setSelectedCategory(category.id)}
                className={`whitespace-nowrap ${
                  selectedCategory === category.id
                    ? 'bg-gradient-to-r from-pink-500 to-orange-400 hover:from-pink-600 hover:to-orange-500 text-white'
                    : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
              >
                <span className="mr-2">{category.icon}</span>
                {category.name}
              </Button>
            ))}
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card className="border-pink-200">
            <CardContent className="p-6 text-center">
              <ShoppingBag className="h-8 w-8 text-pink-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-pink-600">245</p>
              <p className="text-sm text-gray-600">出品中</p>
            </CardContent>
          </Card>
          <Card className="border-pink-200">
            <CardContent className="p-6 text-center">
              <Package className="h-8 w-8 text-blue-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-blue-600">1,234</p>
              <p className="text-sm text-gray-600">取引完了</p>
            </CardContent>
          </Card>
          <Card className="border-pink-200">
            <CardContent className="p-6 text-center">
              <Tag className="h-8 w-8 text-green-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-green-600">89</p>
              <p className="text-sm text-gray-600">新着（24h）</p>
            </CardContent>
          </Card>
          <Card className="border-pink-200">
            <CardContent className="p-6 text-center">
              <TrendingUp className="h-8 w-8 text-purple-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-purple-600">98%</p>
              <p className="text-sm text-gray-600">満足度</p>
            </CardContent>
          </Card>
        </div>

        {/* Items Grid */}
        {filteredItems.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow">
            <p className="text-gray-600 mb-4">該当する商品が見つかりませんでした</p>
            <Button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('all');
              }}
              className="bg-gradient-to-r from-pink-500 to-orange-400 hover:from-pink-600 hover:to-orange-500"
            >
              フィルターをリセット
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredItems.map((item) => (
              <Card
                key={item.id}
                className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
              >
                <div className="h-48 bg-gradient-to-br from-pink-100 to-purple-100 flex items-center justify-center">
                  <ShoppingBag className="h-16 w-16 text-pink-400" />
                </div>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs bg-pink-100 text-pink-700 px-2 py-1 rounded-full">
                      {item.condition}
                    </span>
                    <span className="text-2xl font-bold text-pink-600">
                      ¥{item.price.toLocaleString()}
                    </span>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    {item.title}
                  </h3>
                  <p className="text-gray-600 text-sm line-clamp-2 mb-4">
                    {item.description}
                  </p>
                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <span>出品者: {item.seller}</span>
                  </div>
                  <Button
                    className="w-full mt-4 bg-gradient-to-r from-pink-500 to-orange-400 hover:from-pink-600 hover:to-orange-500 text-white"
                    disabled
                  >
                    詳細を見る（準備中）
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* CTA Section */}
        <Card className="mt-8 border-pink-200 bg-gradient-to-r from-pink-50 to-orange-50">
          <CardContent className="p-8 text-center">
            <h2 className="text-2xl font-bold text-pink-800 mb-4">商品を出品する</h2>
            <p className="text-gray-600 mb-6">
              不要になったものを出品して、コミュニティ内で循環させましょう。<br />
              安心・安全な取引環境を提供しています。
            </p>
            <Button
              className="bg-gradient-to-r from-pink-500 to-orange-400 hover:from-pink-600 hover:to-orange-500 text-white px-8 py-3"
              disabled
            >
              出品する（準備中）
            </Button>
            <p className="text-sm text-gray-500 mt-4">
              ※ マーケット機能は現在準備中です。近日中に開始予定です。
            </p>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default MarketplacePage;
