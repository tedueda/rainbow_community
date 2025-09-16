import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader } from './ui/card';
import { Progress } from './ui/progress';
import { ArrowLeft, Heart, Users, Target, TrendingUp, Calendar, DollarSign } from 'lucide-react';

const DonationPage: React.FC = () => {
  const navigate = useNavigate();
  const [selectedAmount, setSelectedAmount] = useState<number | null>(null);

  const campaigns = [
    {
      id: 1,
      title: "LGBTQ+ユース支援プログラム",
      description: "若いLGBTQ+の方々への相談支援とメンタルヘルスケアを提供します。",
      target: 1000000,
      current: 650000,
      supporters: 234,
      daysLeft: 15,
      category: "教育・支援",
    },
    {
      id: 2,
      title: "パートナーシップ制度普及活動",
      description: "全国の自治体でのパートナーシップ制度導入を推進する活動資金です。",
      target: 500000,
      current: 320000,
      supporters: 156,
      daysLeft: 22,
      category: "政策・制度",
    },
    {
      id: 3,
      title: "LGBTQ+フレンドリー企業認定制度",
      description: "職場環境の改善を目指す企業向けの認定制度を運営します。",
      target: 800000,
      current: 480000,
      supporters: 189,
      daysLeft: 8,
      category: "職場環境",
    },
  ];

  const donationAmounts = [1000, 3000, 5000, 10000, 30000, 50000];

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
          <div className="text-3xl">🤝</div>
          <div>
            <h1 className="text-2xl font-bold text-pink-800">募金</h1>
            <p className="text-slate-600">LGBTQ+コミュニティを支援する寄付プラットフォーム</p>
          </div>
        </div>
      </div>

      {/* 統計情報 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-pink-200">
          <CardContent className="p-6 text-center">
            <DollarSign className="h-8 w-8 text-green-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-green-600">¥2,450,000</p>
            <p className="text-sm text-slate-600">総募金額</p>
          </CardContent>
        </Card>
        <Card className="border-pink-200">
          <CardContent className="p-6 text-center">
            <Users className="h-8 w-8 text-blue-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-blue-600">579</p>
            <p className="text-sm text-slate-600">支援者数</p>
          </CardContent>
        </Card>
        <Card className="border-pink-200">
          <CardContent className="p-6 text-center">
            <Target className="h-8 w-8 text-purple-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-purple-600">12</p>
            <p className="text-sm text-slate-600">進行中プロジェクト</p>
          </CardContent>
        </Card>
        <Card className="border-pink-200">
          <CardContent className="p-6 text-center">
            <TrendingUp className="h-8 w-8 text-orange-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-orange-600">8</p>
            <p className="text-sm text-slate-600">達成済みプロジェクト</p>
          </CardContent>
        </Card>
      </div>

      {/* 募金キャンペーン一覧 */}
      <div>
        <h2 className="text-xl font-semibold text-pink-800 mb-6">現在募集中のプロジェクト</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {campaigns.map((campaign) => (
            <Card key={campaign.id} className="border-pink-200 hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <span className="text-xs bg-pink-100 text-pink-700 px-2 py-1 rounded-full">
                    {campaign.category}
                  </span>
                  <div className="flex items-center gap-1 text-sm text-slate-500">
                    <Calendar className="h-4 w-4" />
                    残り{campaign.daysLeft}日
                  </div>
                </div>
                <h3 className="text-lg font-semibold text-pink-800">{campaign.title}</h3>
                <p className="text-sm text-slate-600">{campaign.description}</p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-slate-600">進捗状況</span>
                    <span className="font-semibold">
                      {Math.round((campaign.current / campaign.target) * 100)}%
                    </span>
                  </div>
                  <Progress 
                    value={(campaign.current / campaign.target) * 100} 
                    className="h-2"
                  />
                  <div className="flex justify-between text-sm mt-2">
                    <span className="text-slate-600">
                      ¥{campaign.current.toLocaleString()} / ¥{campaign.target.toLocaleString()}
                    </span>
                    <span className="text-slate-600">
                      {campaign.supporters}人が支援
                    </span>
                  </div>
                </div>
                <Button 
                  className="w-full bg-gradient-to-r from-pink-500 to-orange-400 hover:from-pink-600 hover:to-orange-500 text-white"
                  disabled
                >
                  このプロジェクトを支援（準備中）
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* 寄付フォーム */}
      <Card className="border-pink-200">
        <CardHeader>
          <h2 className="text-xl font-semibold text-pink-800">一般寄付</h2>
          <p className="text-slate-600">特定のプロジェクトに限定せず、コミュニティ全体を支援する寄付</p>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h3 className="font-semibold text-pink-800 mb-3">寄付金額を選択</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {donationAmounts.map((amount) => (
                <Button
                  key={amount}
                  variant={selectedAmount === amount ? "default" : "outline"}
                  className={`p-4 ${
                    selectedAmount === amount 
                      ? "bg-pink-600 hover:bg-pink-700 text-white" 
                      : "border-pink-300 text-pink-700 hover:bg-pink-50"
                  }`}
                  onClick={() => setSelectedAmount(amount)}
                  disabled
                >
                  ¥{amount.toLocaleString()}
                </Button>
              ))}
            </div>
          </div>

          <div className="p-6 bg-pink-50 rounded-lg">
            <h3 className="font-semibold text-pink-800 mb-3">寄付金の使い道</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="flex items-start gap-2">
                <Heart className="h-4 w-4 text-pink-600 mt-0.5" />
                <div>
                  <p className="font-semibold">相談支援事業（40%）</p>
                  <p className="text-slate-600">専門カウンセラーによる相談窓口の運営</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <Users className="h-4 w-4 text-blue-600 mt-0.5" />
                <div>
                  <p className="font-semibold">コミュニティ活動（30%）</p>
                  <p className="text-slate-600">交流イベントや勉強会の開催</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <Target className="h-4 w-4 text-green-600 mt-0.5" />
                <div>
                  <p className="font-semibold">啓発活動（20%）</p>
                  <p className="text-slate-600">理解促進のための情報発信</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <TrendingUp className="h-4 w-4 text-purple-600 mt-0.5" />
                <div>
                  <p className="font-semibold">運営費（10%）</p>
                  <p className="text-slate-600">サイト運営とシステム維持</p>
                </div>
              </div>
            </div>
          </div>

          <div className="text-center">
            <Button 
              className="bg-gradient-to-r from-pink-500 to-orange-400 hover:from-pink-600 hover:to-orange-500 text-white px-8 py-3"
              disabled={!selectedAmount}
            >
              {selectedAmount ? `¥${selectedAmount.toLocaleString()}を寄付（準備中）` : '金額を選択してください'}
            </Button>
            <p className="text-sm text-slate-500 mt-4">
              ※ 寄付機能は現在準備中です。近日中に開始予定です。
            </p>
          </div>
        </CardContent>
      </Card>

      {/* 税制優遇について */}
      <Card className="border-pink-200">
        <CardHeader>
          <h2 className="text-xl font-semibold text-pink-800">税制優遇について</h2>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold text-pink-800 mb-2">寄付金控除</h3>
              <p className="text-sm text-slate-600 mb-3">
                当団体への寄付は、所得税・住民税の寄付金控除の対象となります。
              </p>
              <ul className="text-sm text-slate-600 space-y-1">
                <li>• 年間寄付額から2,000円を差し引いた金額が控除対象</li>
                <li>• 所得税率に応じて還付金が発生</li>
                <li>• 確定申告時に寄付金受領証明書が必要</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-pink-800 mb-2">企業寄付</h3>
              <p className="text-sm text-slate-600 mb-3">
                法人からの寄付も受け付けており、損金算入が可能です。
              </p>
              <ul className="text-sm text-slate-600 space-y-1">
                <li>• CSR活動としての社会貢献</li>
                <li>• 従業員向けダイバーシティ研修の提供</li>
                <li>• 企業名での支援者として紹介可能</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DonationPage;
