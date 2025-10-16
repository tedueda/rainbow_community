import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

interface Msg {
  id: number;
  chat_id: number;
  sender_id: number;
  body: string;
  created_at: string;
}

const MatchingChatDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const chatId = useMemo(() => Number(id), [id]);
  const { token, user } = useAuth();
  const API_URL = (import.meta as any).env.VITE_API_URL || 'http://localhost:8000';
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState<Msg[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [body, setBody] = useState('');
  const bottomRef = useRef<HTMLDivElement | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const [wsReady, setWsReady] = useState(false);

  const fetchMessages = async () => {
    if (!token || !chatId) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_URL}/api/matching/chats/${chatId}/messages`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();
      setItems(data.items || []);
    } catch (e: any) {
      setError(e?.message || '取得に失敗しました');
    } finally {
      setLoading(false);
      setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 0);
    }
  };

  const sendMessage = async () => {
    if (!token || !chatId) return;
    const text = body.trim();
    if (!text) return;
    // WebSocketが繋がっていればWS送信、無理ならREST送信
    if (wsRef.current && wsReady) {
      try {
        wsRef.current.send(JSON.stringify({ body: text }));
        setBody('');
        return;
      } catch (_) {}
    }
    try {
      const res = await fetch(`${API_URL}/api/matching/chats/${chatId}/messages`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ body: text }),
      });
      if (!res.ok) throw new Error(await res.text());
      const m = await res.json();
      setItems((prev) => [...prev, m]);
      setBody('');
      setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 0);
    } catch (e: any) {
      alert(`送信に失敗しました: ${e?.message || ''}`);
    }
  };

  useEffect(() => {
    fetchMessages();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, chatId]);

  // WebSocket接続
  useEffect(() => {
    if (!token || !chatId) return;
    const proto = API_URL.startsWith('https') ? 'wss' : 'ws';
    const wsUrl = `${proto}://${new URL(API_URL).host}/api/matching/ws/matching/chat?chat_id=${chatId}&token=${encodeURIComponent(token)}`;
    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;
    ws.onopen = () => setWsReady(true);
    ws.onclose = () => setWsReady(false);
    ws.onerror = () => setWsReady(false);
    ws.onmessage = (ev) => {
      try {
        const m = JSON.parse(ev.data);
        setItems((prev) => [...prev, m]);
        setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 0);
      } catch (_) {}
    };
    return () => {
      try { ws.close(); } catch (_) {}
      wsRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, chatId]);

  return (
    <div>
      <h2 className="text-lg font-semibold mb-3">チャット詳細</h2>
      <div className="p-4 border rounded-lg bg-white h-[60vh] flex flex-col">
        <div className="flex-1 overflow-y-auto space-y-2">
          {loading && <div>読み込み中...</div>}
          {error && <div className="text-red-600 text-sm">{error}</div>}
          {items.map((m) => (
            <div key={m.id} className={`max-w-[70%] px-3 py-2 rounded ${m.sender_id === user?.id ? 'ml-auto bg-pink-100' : 'mr-auto bg-gray-100'}`}>
              <div className="text-sm whitespace-pre-wrap">{m.body}</div>
              <div className="text-[10px] text-gray-500 mt-1">{new Date(m.created_at).toLocaleString()}</div>
            </div>
          ))}
          <div ref={bottomRef} />
        </div>
        <div className="mt-3 flex gap-2">
          <input
            value={body}
            onChange={(e) => setBody(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
            className="flex-1 border rounded px-3 py-2 text-sm"
            placeholder="メッセージを入力"
          />
          <button onClick={sendMessage} className="px-3 py-2 bg-pink-600 text-white rounded text-sm hover:bg-pink-700">送信</button>
        </div>
      </div>
    </div>
  );
};

export default MatchingChatDetailPage;
