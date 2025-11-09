import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { API_URL } from '@/config';

type LikeItem = {
  like_id: number;
  user_id: number;
  display_name: string;
  identity?: string | null;
  prefecture?: string | null;
  age_band?: string | null;
  avatar_url?: string | null;
};

const MatchingLikesPage: React.FC = () => {
  const { token } = useAuth();
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState<LikeItem[]>([]);
  const [error, setError] = useState<string | null>(null);

  const fetchLikes = async () => {
    if (!token) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_URL}/api/matching/likes`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || `HTTP ${res.status}`);
      }
      const data = await res.json();
      setItems(data.items || []);
    } catch (e: any) {
      setError(e?.message || '取得に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLikes();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  return (
    <div>
      <h2 className="text-lg font-semibold mb-3">タイプ一覧</h2>
      <div className="p-4 border rounded-lg bg-white">
        <div className="mb-3 flex gap-2">
          <button onClick={fetchLikes} className="px-3 py-1 text-sm bg-gray-100 rounded hover:bg-gray-200">再取得</button>
        </div>
        {loading && <div>読み込み中...</div>}
        {error && <div className="text-red-600 text-sm">{error}</div>}
        <ul className="space-y-2">
          {items.map((like) => (
            <li key={like.like_id} className="border rounded p-3 flex items-center justify-between">
              <div className="flex items-center gap-3">
                {like.avatar_url && like.avatar_url !== '' ? (
                  <img 
                    src={like.avatar_url.startsWith('http') ? like.avatar_url : `${API_URL}${like.avatar_url}`}
                    alt={like.display_name}
                    className="w-12 h-12 rounded-full object-cover"
                    onError={(e) => {
                      const target = e.currentTarget as HTMLImageElement;
                      target.style.display = 'none';
                    }}
                  />
                ) : (
                  <div className="w-12 h-12 bg-gray-300 rounded-full flex items-center justify-center">
                    <span className="text-gray-500 text-xl">👤</span>
                  </div>
                )}
                <div>
                  <div className="font-medium">{like.display_name}</div>
                  <div className="text-xs text-gray-600">
                    {[like.age_band, like.prefecture].filter(Boolean).join(' ・ ')}
                  </div>
                </div>
              </div>
              <a href={`/matching/search`} className="px-3 py-1 text-sm bg-pink-600 text-white rounded hover:bg-pink-700">検索へ</a>
            </li>
          ))}
          {!loading && !error && items.length === 0 && (
            <li className="text-sm text-gray-500">タイプはまだありません。</li>
          )}
        </ul>
      </div>
    </div>
  );
};

export default MatchingLikesPage;
