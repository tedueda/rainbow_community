import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useSearchParams } from 'react-router-dom';
import { TopTabs } from './TopTabs';
import { MatchCard } from './MatchCard';

type MatchItem = {
  user_id: number;
  display_name?: string;
  identity?: string | null;
  prefecture?: string | null;
  age_band?: string | null;
  avatar_url?: string | null;
};

// クライアント側フィルタリングは不要（バックエンドでromance_targetsでフィルタリング済み）

const MatchingSearchPage: React.FC = () => {
  const { token } = useAuth();
  const [searchParams] = useSearchParams();
  const segment = searchParams.get("segment") || "gay";
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
  const USE_MOCK_API = false; // 実APIを使用
  
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState<MatchItem[]>([]);
  const [error, setError] = useState<string | null>(null);

  const fetchSearch = async () => {
    if (!token) return;
    setLoading(true);
    setError(null);
    
    try {
      if (USE_MOCK_API) {
        // モックマッチングデータ
        console.log('🎯 Using Mock Matching Data');
        const mockMatches: MatchItem[] = [
          {
            user_id: 1,
            display_name: 'ユーザー1',
            identity: 'gay',
            prefecture: '東京都',
            age_band: '20代後半',
            avatar_url: 'https://api.dicebear.com/7.x/fun-emoji/png?seed=1&size=256&scale=80'
          },
          {
            user_id: 2,
            display_name: 'ユーザー2',
            identity: 'gay',
            prefecture: '神奈川県',
            age_band: '30代前半',
            avatar_url: 'https://api.dicebear.com/7.x/fun-emoji/png?seed=2&size=256&scale=80'
          },
          {
            user_id: 3,
            display_name: 'ユーザー3',
            identity: 'lesbian',
            prefecture: '大阪府',
            age_band: '20代前半',
            avatar_url: 'https://api.dicebear.com/7.x/fun-emoji/png?seed=3&size=256&scale=80'
          }
        ];
        
        // モックデータをそのまま使用（フィルタリングはバックエンドで実施）
        setItems(mockMatches);
        setLoading(false);
        return;
      }
      
      const params = new URLSearchParams({ page: "1", size: "20" });
      // セグメントに応じてidentityパラメータを追加（日本語の値を使用）
      // if (segment === "gay") params.append("identity", "ゲイ");
      // else if (segment === "lesbian") params.append("identity", "レズ");
      // else if (segment === "other") params.append("identity", "other");
      
      const url = `${API_URL}/api/matching/search?${params.toString()}&_t=${Date.now()}`;
      const res = await fetch(url, {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Cache-Control': 'no-cache'
        },
      });
      
      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || `HTTP ${res.status}`);
      }
      
      const data = await res.json();
      let fetchedItems: MatchItem[] = data.items || [];
      // 画像URLを常に有効に整形（相対→API_URL付与、ダミー画像は削除）
      fetchedItems = fetchedItems.map((it) => {
        let avatar = it.avatar_url || '';
        if (avatar && !avatar.startsWith('http')) {
          avatar = `${API_URL}${avatar}`;
        }
        // ダミー画像は使用しない（空文字にする）
        if (!avatar || avatar.includes('dicebear')) {
          avatar = '';
        }
        return { ...it, avatar_url: avatar };
      });
      // バックエンドでromance_targetsによるフィルタリング済み
      setItems(fetchedItems);
    } catch (e: any) {
      setError(e?.message || '検索に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSearch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, segment]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-pink-50/30">
      <div className="mx-auto max-w-6xl px-4 py-6">
        <h1 className="mb-6 text-2xl font-bold text-gray-900">
          マッチング一覧
        </h1>
        
        <TopTabs />
        
        {loading && (
          <div className="flex items-center justify-center py-12">
            <div className="text-gray-600">読み込み中...</div>
          </div>
        )}
        
        {error && (
          <div className="rounded-lg bg-red-50 border border-red-200 p-4 text-red-600">
            {error}
          </div>
        )}
        
        {!loading && !error && items.length > 0 && (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4">
            {items.map((item) => (
              <MatchCard key={item.user_id} item={item} />
            ))}
          </div>
        )}
        
        {!loading && !error && items.length === 0 && (
          <div className="flex min-h-[400px] items-center justify-center rounded-2xl border-2 border-dashed border-gray-300 bg-white">
            <div className="text-center">
              <p className="text-lg font-medium text-gray-600">該当するユーザーがいません</p>
              <p className="mt-2 text-sm text-gray-500">別のタブを試してみてください</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MatchingSearchPage;
