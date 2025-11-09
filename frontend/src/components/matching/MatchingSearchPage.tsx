import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useSearchParams } from 'react-router-dom';
import { TopTabs } from './TopTabs';
import { MatchCard } from './MatchCard';
import { API_URL } from '@/config';

type MatchItem = {
  user_id: number;
  display_name?: string;
  identity?: string | null;
  prefecture?: string | null;
  age_band?: string | null;
  avatar_url?: string | null;
  occupation?: string | null;
  meet_pref?: string | null;
};

const MatchingSearchPage: React.FC = () => {
  const { token } = useAuth();
  const [searchParams] = useSearchParams();
  const segment = searchParams.get("segment") || "gay";
  
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState<MatchItem[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [allItems, setAllItems] = useState<MatchItem[]>([]);
  
  const [selectedPrefecture, setSelectedPrefecture] = useState<string>("");
  const [selectedAgeBand, setSelectedAgeBand] = useState<string>("");
  const [selectedOccupation, setSelectedOccupation] = useState<string>("");
  const [selectedMeetPref, setSelectedMeetPref] = useState<string>("");

  const fetchSearch = async () => {
    if (!token) return;
    setLoading(true);
    setError(null);
    
    try {
      const params = new URLSearchParams({ page: "1", size: "50" });
      
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
      let fetchedItems: MatchItem[] = Array.isArray(data) ? data : (data.items || []);
      
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
      
      // クライアント側で性志向カテゴリーによるフィルタリング
      if (segment === 'gay') {
        fetchedItems = fetchedItems.filter(it => it.identity === 'ゲイ');
      } else if (segment === 'lesbian') {
        fetchedItems = fetchedItems.filter(it => it.identity === 'レズ');
      } else if (segment === 'other') {
        fetchedItems = fetchedItems.filter(it => 
          it.identity !== 'ゲイ' && it.identity !== 'レズ'
        );
      }
      
      setAllItems(fetchedItems);
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

  useEffect(() => {
    let filtered = [...allItems];
    
    if (selectedPrefecture) {
      filtered = filtered.filter(it => it.prefecture === selectedPrefecture);
    }
    if (selectedAgeBand) {
      filtered = filtered.filter(it => it.age_band === selectedAgeBand);
    }
    if (selectedOccupation) {
      filtered = filtered.filter(it => it.occupation === selectedOccupation);
    }
    if (selectedMeetPref) {
      filtered = filtered.filter(it => it.meet_pref === selectedMeetPref);
    }
    
    setItems(filtered);
  }, [allItems, selectedPrefecture, selectedAgeBand, selectedOccupation, selectedMeetPref]);

  const uniquePrefectures = Array.from(new Set(allItems.map(it => it.prefecture).filter(Boolean))) as string[];
  const uniqueAgeBands = Array.from(new Set(allItems.map(it => it.age_band).filter(Boolean))) as string[];
  const uniqueOccupations = Array.from(new Set(allItems.map(it => it.occupation).filter(Boolean))) as string[];
  const uniqueMeetPrefs = Array.from(new Set(allItems.map(it => it.meet_pref).filter(Boolean))) as string[];

  const clearFilters = () => {
    setSelectedPrefecture("");
    setSelectedAgeBand("");
    setSelectedOccupation("");
    setSelectedMeetPref("");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-pink-50/30">
      <div className="mx-auto max-w-6xl px-4 py-6">
        <h1 className="mb-6 text-2xl font-bold text-gray-900">
          マッチング一覧
        </h1>
        
        <TopTabs />
        
        {/* Filter Section */}
        <div className="mb-6 bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-gray-700">条件検索</h3>
            {(selectedPrefecture || selectedAgeBand || selectedOccupation || selectedMeetPref) && (
              <button
                onClick={clearFilters}
                className="text-xs text-gray-500 hover:text-gray-700 underline"
              >
                クリア
              </button>
            )}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">居住地</label>
              <select
                value={selectedPrefecture}
                onChange={(e) => setSelectedPrefecture(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
              >
                <option value="">すべて</option>
                {uniquePrefectures.map((pref) => (
                  <option key={pref} value={pref}>{pref}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">年代</label>
              <select
                value={selectedAgeBand}
                onChange={(e) => setSelectedAgeBand(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
              >
                <option value="">すべて</option>
                {uniqueAgeBands.map((age) => (
                  <option key={age} value={age}>{age}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">職種</label>
              <select
                value={selectedOccupation}
                onChange={(e) => setSelectedOccupation(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
              >
                <option value="">すべて</option>
                {uniqueOccupations.map((occ) => (
                  <option key={occ} value={occ}>{occ}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">マッチングの目的</label>
              <select
                value={selectedMeetPref}
                onChange={(e) => setSelectedMeetPref(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
              >
                <option value="">すべて</option>
                {uniqueMeetPrefs.map((pref) => (
                  <option key={pref} value={pref}>{pref}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
        
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
