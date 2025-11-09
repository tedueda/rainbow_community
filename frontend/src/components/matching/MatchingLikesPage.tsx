import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { API_URL } from '@/config';
import { useNavigate } from 'react-router-dom';

type LikeItem = {
  like_id: number;
  user_id: number;
  display_name: string;
  identity?: string | null;
  prefecture?: string | null;
  age_band?: string | null;
  avatar_url?: string | null;
};

type ViewMode = 'list' | 'grid';

const MatchingLikesPage: React.FC = () => {
  const { token } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState<LikeItem[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>(() => {
    const saved = localStorage.getItem('likesViewMode');
    return (saved === 'grid' || saved === 'list') ? saved : 'list';
  });

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

  const handleViewModeChange = (mode: ViewMode) => {
    setViewMode(mode);
    localStorage.setItem('likesViewMode', mode);
  };

  const handleSendEmail = async (userId: number) => {
    if (!token) return;
    try {
      const res = await fetch(`${API_URL}/api/matching/chat_requests/${userId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ initial_message: '' }),
      });
      
      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(errorText);
      }
      
      const data = await res.json();
      alert('✉️ メールリクエストを送信しました！\n\n相手が承諾するとメールができます。');
      navigate(`/matching/requests/${data.request_id}`);
    } catch (e: any) {
      alert(`エラー: ${e?.message || 'メール送信に失敗しました'}`);
    }
  };

  return (
    <div>
      <h2 className="text-lg font-semibold mb-3">タイプ一覧</h2>
      <div className="p-4 border rounded-lg bg-white">
        <div className="mb-3 flex gap-2 items-center justify-between">
          <button onClick={fetchLikes} className="px-3 py-1 text-sm bg-gray-100 rounded hover:bg-gray-200">再取得</button>
          <div className="flex gap-1 border border-gray-300 rounded">
            <button
              onClick={() => handleViewModeChange('list')}
              className={`px-3 py-1 text-sm transition-colors ${viewMode === 'list' ? 'bg-black text-white' : 'bg-white text-gray-700 hover:bg-gray-50'}`}
            >
              リスト
            </button>
            <button
              onClick={() => handleViewModeChange('grid')}
              className={`px-3 py-1 text-sm transition-colors ${viewMode === 'grid' ? 'bg-black text-white' : 'bg-white text-gray-700 hover:bg-gray-50'}`}
            >
              タイル
            </button>
          </div>
        </div>
        {loading && <div>読み込み中...</div>}
        {error && <div className="text-red-600 text-sm">{error}</div>}
        
        {viewMode === 'list' ? (
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
                <button
                  onClick={() => handleSendEmail(like.user_id)}
                  className="px-3 py-1 text-sm bg-black text-white rounded hover:bg-gray-800 transition-colors"
                >
                  メールをする
                </button>
              </li>
            ))}
            {!loading && !error && items.length === 0 && (
              <li className="text-sm text-gray-500">タイプはまだありません。</li>
            )}
          </ul>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {items.map((like) => (
              <div key={like.like_id} className="border rounded-lg overflow-hidden bg-white shadow-sm hover:shadow-md transition-shadow">
                {like.avatar_url && like.avatar_url !== '' ? (
                  <img 
                    src={like.avatar_url.startsWith('http') ? like.avatar_url : `${API_URL}${like.avatar_url}`}
                    alt={like.display_name}
                    className="w-full h-48 object-cover"
                    onError={(e) => {
                      const target = e.currentTarget as HTMLImageElement;
                      target.src = '';
                      target.style.display = 'none';
                    }}
                  />
                ) : (
                  <div className="w-full h-48 bg-gray-200 flex items-center justify-center">
                    <span className="text-gray-400 text-5xl">👤</span>
                  </div>
                )}
                <div className="p-3">
                  <div className="font-medium mb-1">{like.display_name}</div>
                  <div className="text-xs text-gray-600 mb-3">
                    {[like.age_band, like.prefecture].filter(Boolean).join(' ・ ')}
                  </div>
                  <button
                    onClick={() => handleSendEmail(like.user_id)}
                    className="w-full px-3 py-2 text-sm bg-black text-white rounded hover:bg-gray-800 transition-colors"
                  >
                    メールをする
                  </button>
                </div>
              </div>
            ))}
            {!loading && !error && items.length === 0 && (
              <div className="col-span-full text-sm text-gray-500 text-center py-8">タイプはまだありません。</div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default MatchingLikesPage;
