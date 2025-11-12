import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { API_URL } from '@/config';
import MessageBubble from './chat/MessageBubble';

interface Msg {
  id: number;
  chat_id: number;
  sender_id: number;
  body?: string | null;
  image_url?: string | null;
  created_at: string;
}

interface ChatMeta {
  with_user_id: number;
  with_display_name: string;
  with_avatar_url?: string | null;
}

interface MatchingChatDetailPageProps {
  embedded?: boolean;
}

const MatchingChatDetailPage: React.FC<MatchingChatDetailPageProps> = ({ embedded = false }) => {
  const { id } = useParams<{ id: string }>();
  const chatId = useMemo(() => Number(id), [id]);
  const { token, user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState<Msg[]>([]);
  const [chatMeta, setChatMeta] = useState<ChatMeta | null>(null);
  const [myAvatarUrl, setMyAvatarUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [body, setBody] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const bottomRef = useRef<HTMLDivElement | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchChatMeta = async () => {
    if (!token || !chatId) return;
    try {
      const res = await fetch(`${API_URL}/api/matching/chats`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();
      const chat = (data.items || []).find((c: any) => c.chat_id === chatId);
      if (chat) {
        setChatMeta({
          with_user_id: chat.with_user_id,
          with_display_name: chat.with_display_name,
          with_avatar_url: chat.with_avatar_url,
        });
      }
    } catch (e: any) {
      console.error('Failed to fetch chat meta:', e);
    }
  };

  const fetchMyAvatar = async () => {
    if (!token) return;
    try {
      const res = await fetch(`${API_URL}/api/matching/profiles/me`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (!res.ok) return;
      const data = await res.json();
      if (data.images && data.images.length > 0) {
        setMyAvatarUrl(data.images[0].image_url);
      } else if (data.avatar_url) {
        setMyAvatarUrl(data.avatar_url);
      }
    } catch (e: any) {
      console.error('Failed to fetch my avatar:', e);
    }
  };

  const fetchMessages = async () => {
    if (!token || !chatId) return;
    setLoading(true);
    setError(null);
    try {
      const messagesUrl = `${API_URL}/api/matching/chats/${chatId}/messages`;
      console.log('[DEBUG] Fetching messages from:', messagesUrl);
      const res = await fetch(messagesUrl, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      console.log('[DEBUG] Messages response status:', res.status);
      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();
      setItems(data.items || []);
    } catch (e: any) {
      console.error('[DEBUG] Messages fetch error:', e);
      setError(e?.message || '取得に失敗しました');
    } finally {
      setLoading(false);
      setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 0);
    }
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      alert('画像サイズは10MB以下にしてください');
      return;
    }

    if (!file.type.startsWith('image/')) {
      alert('画像ファイルを選択してください');
      return;
    }

    setImageFile(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const uploadImage = async (): Promise<string | null> => {
    if (!imageFile || !token) return null;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', imageFile);

      const res = await fetch(`${API_URL}/api/media/upload`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData,
      });

      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();
      return data.url || data.path || null;
    } catch (e: any) {
      alert(`画像アップロードに失敗しました: ${e?.message || ''}`);
      return null;
    } finally {
      setUploading(false);
    }
  };

  const sendMessage = async () => {
    if (!token || !chatId) return;
    const text = body.trim();
    
    let imageUrl: string | null = null;
    if (imageFile) {
      imageUrl = await uploadImage();
      if (!imageUrl) return;
    }

    if (!text && !imageUrl) return;

    try {
      const res = await fetch(`${API_URL}/api/matching/chats/${chatId}/messages`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ body: text || null, image_url: imageUrl }),
      });
      if (!res.ok) throw new Error(await res.text());
      const m = await res.json();
      setItems((prev) => [...prev, m]);
      setBody('');
      setImageFile(null);
      setImagePreview(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 0);
    } catch (e: any) {
      alert(`送信に失敗しました: ${e?.message || ''}`);
    }
  };

  useEffect(() => {
    fetchChatMeta();
    fetchMessages();
    fetchMyAvatar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, chatId]);

  // WebSocket接続
  useEffect(() => {
    if (!token || !chatId) return;
    const proto = API_URL.startsWith('https') ? 'wss' : 'ws';
    const wsUrl = `${proto}://${new URL(API_URL).host}/ws/matching/chat?chat_id=${chatId}&token=${encodeURIComponent(token)}`;
    console.log('[DEBUG] WebSocket URL:', wsUrl);
    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;
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
    <div className="flex flex-col h-full">
      {!embedded && (
        <div className="pb-3 border-b mb-3">
          <h2 className="text-lg font-semibold">
            {chatMeta?.with_display_name || 'チャット'}
          </h2>
        </div>
      )}

      <div
        className="flex-1 overflow-y-auto px-4 bg-gray-50 rounded-lg"
        data-chat-messages
      >
        {loading && <div className="text-center py-4">読み込み中...</div>}
        {error && <div className="text-red-600 text-sm text-center py-4">{error}</div>}
        <div className="py-4">
          {items.map((m) => (
            <MessageBubble
              key={m.id}
              isMe={m.sender_id === user?.id}
              avatarUrl={m.sender_id !== user?.id ? chatMeta?.with_avatar_url : null}
              myAvatarUrl={m.sender_id === user?.id ? myAvatarUrl : null}
              body={m.body}
              imageUrl={m.image_url}
              createdAt={m.created_at}
            />
          ))}
          <div ref={bottomRef} />
        </div>
      </div>

      {imagePreview && (
        <div className="mt-2 relative inline-block">
          <img
            src={imagePreview}
            alt="Preview"
            className="max-h-20 rounded border"
          />
          <button
            onClick={() => {
              setImageFile(null);
              setImagePreview(null);
              if (fileInputRef.current) {
                fileInputRef.current.value = '';
              }
            }}
            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600"
          >
            ×
          </button>
        </div>
      )}

      <div className="mt-3 flex gap-2 items-end">
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleImageSelect}
          accept="image/*"
          className="hidden"
        />
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="px-3 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm hover:bg-gray-200 disabled:opacity-50 border border-gray-200 transition-colors"
          title="画像を添付"
        >
          📎
        </button>
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              sendMessage();
            }
          }}
          className="flex-1 border border-gray-500 rounded-lg px-3 py-2 text-sm resize-none focus:outline-none focus:border-black transition-colors"
          placeholder="メッセージを入力"
          rows={2}
        />
        <button
          onClick={sendMessage}
          disabled={uploading || (!body.trim() && !imageFile)}
          className="px-4 py-2 bg-black text-white rounded-lg text-sm hover:bg-gray-800 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
        >
          {uploading ? '送信中...' : '送信'}
        </button>
      </div>
    </div>
  );
};

export default MatchingChatDetailPage;
