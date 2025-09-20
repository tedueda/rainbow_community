import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader } from './ui/card';
import { ArrowLeft, Camera, Music, Users, Gift, Calendar, Video } from 'lucide-react';

const VirtualWeddingPage: React.FC = () => {
  const navigate = useNavigate();

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
          <div className="text-3xl">💒</div>
          <div>
            <h1 className="text-2xl font-bold text-pink-800">ウェディング動画・配信</h1>
            <p className="text-slate-600">オンラインで叶える特別な結婚式体験</p>
          </div>
        </div>
      </div>

      {/* メインビジュアル */}
      <Card className="border-pink-200 overflow-hidden">
        <div className="h-64 bg-gradient-to-r from-pink-300 via-purple-300 to-orange-300 flex items-center justify-center">
          <div className="text-center text-white">
            <div className="text-6xl mb-4">💒✨</div>
            <h2 className="text-2xl font-bold mb-2">あなただけの特別な結婚式</h2>
            <p className="text-lg opacity-90">距離を超えて、愛する人と大切な瞬間を</p>
          </div>
        </div>
      </Card>

      {/* サービス内容 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="border-pink-200">
          <CardContent className="p-6 text-center">
            <Video className="h-12 w-12 text-pink-600 mx-auto mb-4" />
            <h3 className="font-semibold text-pink-800 mb-2">ライブ配信</h3>
            <p className="text-sm text-slate-600">
              高品質な映像で、リアルタイムに結婚式を配信。遠方の家族や友人も参加できます。
            </p>
          </CardContent>
        </Card>

        <Card className="border-pink-200">
          <CardContent className="p-6 text-center">
            <Music className="h-12 w-12 text-pink-600 mx-auto mb-4" />
            <h3 className="font-semibold text-pink-800 mb-2">音楽演出</h3>
            <p className="text-sm text-slate-600">
              お二人の思い出の曲や、プロの演奏家による生演奏で特別な雰囲気を演出。
            </p>
          </CardContent>
        </Card>

        <Card className="border-pink-200">
          <CardContent className="p-6 text-center">
            <Camera className="h-12 w-12 text-pink-600 mx-auto mb-4" />
            <h3 className="font-semibold text-pink-800 mb-2">記録・撮影</h3>
            <p className="text-sm text-slate-600">
              プロのカメラマンが式の様子を撮影。後日、編集された動画をお渡しします。
            </p>
          </CardContent>
        </Card>

        <Card className="border-pink-200">
          <CardContent className="p-6 text-center">
            <Users className="h-12 w-12 text-pink-600 mx-auto mb-4" />
            <h3 className="font-semibold text-pink-800 mb-2">ゲスト参加</h3>
            <p className="text-sm text-slate-600">
              最大100名まで同時接続可能。チャット機能でお祝いメッセージも受け取れます。
            </p>
          </CardContent>
        </Card>

        <Card className="border-pink-200">
          <CardContent className="p-6 text-center">
            <Gift className="h-12 w-12 text-pink-600 mx-auto mb-4" />
            <h3 className="font-semibold text-pink-800 mb-2">ギフト機能</h3>
            <p className="text-sm text-slate-600">
              オンラインでご祝儀やプレゼントを受け取れる機能付き。感謝の気持ちを伝えやすく。
            </p>
          </CardContent>
        </Card>

        <Card className="border-pink-200">
          <CardContent className="p-6 text-center">
            <Calendar className="h-12 w-12 text-pink-600 mx-auto mb-4" />
            <h3 className="font-semibold text-pink-800 mb-2">事前準備</h3>
            <p className="text-sm text-slate-600">
              専任プランナーがリハーサルから当日まで完全サポート。安心してお任せください。
            </p>
          </CardContent>
        </Card>
      </div>

      {/* 料金プラン */}
      <Card className="border-pink-200">
        <CardHeader>
          <h2 className="text-xl font-semibold text-pink-800">料金プラン</h2>
          <p className="text-slate-600">お二人の希望に合わせて選べる3つのプラン</p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 border border-pink-200 rounded-lg">
              <h3 className="font-semibold text-pink-800 mb-2">シンプルプラン</h3>
              <p className="text-3xl font-bold text-pink-600 mb-4">¥98,000</p>
              <ul className="text-sm text-slate-600 space-y-2">
                <li>• 基本的な配信機能</li>
                <li>• 最大30名参加</li>
                <li>• 録画データ提供</li>
                <li>• 1時間の式進行</li>
              </ul>
            </div>

            <div className="p-6 border-2 border-pink-400 rounded-lg bg-pink-50 relative">
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <span className="bg-pink-600 text-white px-3 py-1 rounded-full text-xs font-semibold">人気</span>
              </div>
              <h3 className="font-semibold text-pink-800 mb-2">スタンダードプラン</h3>
              <p className="text-3xl font-bold text-pink-600 mb-4">¥198,000</p>
              <ul className="text-sm text-slate-600 space-y-2">
                <li>• 高品質配信機能</li>
                <li>• 最大70名参加</li>
                <li>• プロ撮影・編集</li>
                <li>• 2時間の式進行</li>
                <li>• 音楽演出付き</li>
                <li>• ギフト機能</li>
              </ul>
            </div>

            <div className="p-6 border border-pink-200 rounded-lg">
              <h3 className="font-semibold text-pink-800 mb-2">プレミアムプラン</h3>
              <p className="text-3xl font-bold text-pink-600 mb-4">¥398,000</p>
              <ul className="text-sm text-slate-600 space-y-2">
                <li>• 最高品質配信</li>
                <li>• 最大100名参加</li>
                <li>• 専属プランナー</li>
                <li>• 3時間の式進行</li>
                <li>• 生演奏・司会者</li>
                <li>• 全機能利用可能</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* CTA */}
      <Card className="border-pink-200 bg-gradient-to-r from-pink-50 to-orange-50">
        <CardContent className="p-8 text-center">
          <h2 className="text-2xl font-bold text-pink-800 mb-4">特別な日を、特別な形で</h2>
          <p className="text-slate-600 mb-6">
            まずは無料相談で、お二人の理想の結婚式について聞かせてください。<br />
            専任プランナーが丁寧にサポートいたします。
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Button 
              className="bg-gradient-to-r from-pink-500 to-orange-400 hover:from-pink-600 hover:to-orange-500 text-white px-8 py-3"
              disabled
            >
              無料相談を予約（準備中）
            </Button>
            <Button 
              variant="outline"
              className="border-pink-300 text-pink-700 hover:bg-pink-50 px-8 py-3"
              disabled
            >
              資料請求（準備中）
            </Button>
          </div>
          <p className="text-sm text-slate-500 mt-4">
            ※ サービスは現在準備中です。近日中に開始予定です。
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default VirtualWeddingPage;
