import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';

type ChatItem = {
  chat_id: number;
  with_user_id: number;
  with_display_name: string;
  last_message?: string;
};

const MatchingChatsPage: React.FC = () => {
  const { token } = useAuth();
  const API_URL = (import.meta as any).env.VITE_API_URL || 'http://localhost:8000';
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState<ChatItem[]>([]);
  const [error, setError] = useState<string | null>(null);

  const fetchChats = async () => {
    if (!token) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_URL}/api/matching/chats`, {
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
    fetchChats();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  return (
    <div>
      <h2 className="text-lg font-semibold mb-3">チャット</h2>
      <div className="p-4 border rounded-lg bg-white">
        <div className="mb-3 flex gap-2">
          <button onClick={fetchChats} className="px-3 py-1 text-sm bg-gray-100 rounded hover:bg-gray-200">再取得</button>
        </div>
        {loading && <div>読み込み中...</div>}
        {error && <div className="text-red-600 text-sm">{error}</div>}
        <ul className="space-y-2">
          {items.map((c) => (
            <li key={c.chat_id} className="border rounded p-3 flex items-center justify-between">
              <div>
                <div className="font-medium">{c.with_display_name}</div>
                <div className="text-xs text-gray-600">{c.last_message || 'メッセージはまだありません'}</div>
              </div>
              <a href={`/matching/chats/${c.chat_id}`} className="px-3 py-1 text-sm bg-pink-600 text-white rounded hover:bg-pink-700">開く</a>
            </li>
          ))}
          {!loading && !error && items.length === 0 && (
            <li className="text-sm text-gray-500">チャットはまだありません。</li>
          )}
        </ul>
      </div>
    </div>
  );
};

export default MatchingChatsPage;
