import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';

type ProfileHit = {
  user_id: number;
  display_name: string;
  prefecture?: string;
  age_band?: string;
  identity?: string;
};

const MatchingSearchPage: React.FC = () => {
  const { token } = useAuth();
  const API_URL = (import.meta as any).env.VITE_API_URL || 'http://localhost:8000';
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState<ProfileHit[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [prefecture, setPrefecture] = useState('');
  const [ageBand, setAgeBand] = useState('');
  const [occupation, setOccupation] = useState('');
  const [incomeRange, setIncomeRange] = useState('');
  const [meetPref, setMeetPref] = useState('');
  const [identity, setIdentity] = useState('');
  const [hobbies, setHobbies] = useState('');

  const fetchSearch = async () => {
    if (!token) return;
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (prefecture) params.set('prefecture', prefecture);
      if (ageBand) params.set('age_band', ageBand);
      if (occupation) params.set('occupation', occupation);
      if (incomeRange) params.set('income_range', incomeRange);
      if (meetPref) params.set('meet_pref', meetPref);
      if (identity) params.set('identity', identity);
      if (hobbies) params.set('hobbies', hobbies);
      const qs = params.toString();
      const url = `${API_URL}/api/matching/search${qs ? `?${qs}` : ''}`;
      const res = await fetch(url, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || `HTTP ${res.status}`);
      }
      const data = await res.json();
      setItems(data.items || []);
    } catch (e: any) {
      setError(e?.message || '検索に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async (toUserId: number) => {
    if (!token) return;
    try {
      const res = await fetch(`${API_URL}/api/matching/likes/${toUserId}`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || `HTTP ${res.status}`);
      }
      // 簡易フィードバック
      alert('いいねしました');
    } catch (e: any) {
      alert(`いいねに失敗しました: ${e?.message || ''}`);
    }
  };

  useEffect(() => {
    fetchSearch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  return (
    <div>
      <h2 className="text-lg font-semibold mb-3">検索</h2>
      <div className="p-4 border rounded-lg bg-white">
        <div className="mb-3 grid grid-cols-1 sm:grid-cols-3 gap-2">
          <input value={prefecture} onChange={(e) => setPrefecture(e.target.value)} className="border rounded px-3 py-2 text-sm" placeholder="都道府県" />
          <input value={ageBand} onChange={(e) => setAgeBand(e.target.value)} className="border rounded px-3 py-2 text-sm" placeholder="年代（例: 20s_early）" />
          <input value={occupation} onChange={(e) => setOccupation(e.target.value)} className="border rounded px-3 py-2 text-sm" placeholder="職種" />
          <input value={incomeRange} onChange={(e) => setIncomeRange(e.target.value)} className="border rounded px-3 py-2 text-sm" placeholder="年収" />
          <input value={meetPref} onChange={(e) => setMeetPref(e.target.value)} className="border rounded px-3 py-2 text-sm" placeholder="出会い方（例: meet_first）" />
          <input value={identity} onChange={(e) => setIdentity(e.target.value)} className="border rounded px-3 py-2 text-sm" placeholder="アイデンティティ" />
          <input value={hobbies} onChange={(e) => setHobbies(e.target.value)} className="border rounded px-3 py-2 text-sm sm:col-span-3" placeholder="趣味（カンマ区切り）" />
        </div>
        <div className="mb-3 flex gap-2">
          <button onClick={fetchSearch} className="px-3 py-1 text-sm bg-gray-100 rounded hover:bg-gray-200">検索</button>
        </div>
        {loading && <div>読み込み中...</div>}
        {error && <div className="text-red-600 text-sm">{error}</div>}
        <ul className="space-y-2">
          {items.map((p) => (
            <li key={p.user_id} className="border rounded p-3 flex items-center justify-between">
              <div>
                <div className="font-medium">{p.display_name}</div>
                <div className="text-xs text-gray-600">{p.prefecture || '-'} / {p.age_band || '-'} / {p.identity || '-'}</div>
              </div>
              <button onClick={() => handleLike(p.user_id)} className="px-3 py-1 text-sm bg-pink-600 text-white rounded hover:bg-pink-700">いいね</button>
            </li>
          ))}
          {!loading && !error && items.length === 0 && (
            <li className="text-sm text-gray-500">該当するユーザーが見つかりませんでした。</li>
          )}
        </ul>
      </div>
    </div>
  );
};

export default MatchingSearchPage;
