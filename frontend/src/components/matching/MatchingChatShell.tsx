import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Outlet } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { API_URL } from '@/config';

type ChatItem = {
  chat_id: number;
  with_user_id: number;
  with_display_name: string;
  with_avatar_url?: string | null;
  last_message?: string;
};

type ChatRequest = {
  request_id: number;
  from_user_id: number;
  to_user_id?: number;
  from_display_name: string;
  to_display_name?: string;
  from_avatar_url?: string;
  to_avatar_url?: string;
  identity?: string;
  prefecture?: string;
  age_band?: string;
  initial_message?: string;
  created_at?: string;
};

const MatchingChatShell: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { token } = useAuth();
  const [loading, setLoading] = useState(false);
  const [chats, setChats] = useState<ChatItem[]>([]);
  const [incomingRequests, setIncomingRequests] = useState<ChatRequest[]>([]);
  const [outgoingRequests, setOutgoingRequests] = useState<ChatRequest[]>([]);
  const [error, setError] = useState<string | null>(null);

  const fetchChats = async () => {
    if (!token) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_URL}/api/matching/chats`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();
      setChats(data.items || []);
    } catch (e: any) {
      setError(e?.message || '取得に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  const fetchIncomingRequests = async () => {
    if (!token) return;
    try {
      const res = await fetch(`${API_URL}/api/matching/chat_requests/incoming`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();
      setIncomingRequests(data.items || []);
    } catch (e: any) {
      console.error('Failed to fetch incoming requests:', e);
    }
  };

  const fetchOutgoingRequests = async () => {
    if (!token) return;
    try {
      const res = await fetch(`${API_URL}/api/matching/chat_requests/outgoing`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();
      setOutgoingRequests(data.items || []);
    } catch (e: any) {
      console.error('Failed to fetch outgoing requests:', e);
    }
  };

  useEffect(() => {
    fetchChats();
    fetchIncomingRequests();
    fetchOutgoingRequests();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  useEffect(() => {
    if (!id && !loading) {
      if (chats.length > 0) {
        navigate(`/matching/chats/${chats[0].chat_id}`, { replace: true });
      } else if (incomingRequests.length > 0) {
        navigate(`/matching/chats/requests/${incomingRequests[0].request_id}`, { replace: true });
      } else if (outgoingRequests.length > 0) {
        navigate(`/matching/chats/requests/${outgoingRequests[0].request_id}`, { replace: true });
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chats, incomingRequests, outgoingRequests, loading, id]);

  const selectedChatId = id ? Number(id) : null;

  return (
    <div className="flex h-[calc(100vh-200px)] gap-4">
      {/* Left sidebar - Chat list */}
      <div className="w-80 flex-shrink-0 border-r border-gray-200 overflow-y-auto bg-white">
        <div className="p-4">
          <h2 className="text-lg font-semibold text-black mb-3">チャット</h2>
          
          {/* Incoming requests (received) */}
          {incomingRequests.length > 0 && (
            <div className="mb-4">
              <h3 className="text-sm font-medium text-gray-500 mb-2">受信リクエスト</h3>
              <div className="space-y-2">
                {incomingRequests.map((req) => (
                  <button
                    key={req.request_id}
                    onClick={() => navigate(`requests/${req.request_id}`)}
                    className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 text-left border border-gray-100 transition-colors"
                  >
                    <div className="flex-shrink-0">
                      {req.from_avatar_url ? (
                        <img
                          src={req.from_avatar_url.startsWith('http') ? req.from_avatar_url : `${API_URL}${req.from_avatar_url}`}
                          alt={req.from_display_name}
                          className="w-12 h-12 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                          <span className="text-2xl">😊</span>
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium truncate">{req.from_display_name}</div>
                      <div className="text-xs text-gray-500 truncate">
                        {req.initial_message || 'メールリクエスト'}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Outgoing requests (sent, pending approval) */}
          {outgoingRequests.length > 0 && (
            <div className="mb-4">
              <h3 className="text-sm font-medium text-gray-500 mb-2">送信済みリクエスト（承諾待ち）</h3>
              <div className="space-y-2">
                {outgoingRequests.map((req) => (
                  <button
                    key={req.request_id}
                    onClick={() => navigate(`requests/${req.request_id}`)}
                    className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 text-left border border-yellow-200 bg-yellow-50 transition-colors"
                  >
                    <div className="flex-shrink-0">
                      {req.to_avatar_url ? (
                        <img
                          src={req.to_avatar_url.startsWith('http') ? req.to_avatar_url : `${API_URL}${req.to_avatar_url}`}
                          alt={req.to_display_name || 'ユーザー'}
                          className="w-12 h-12 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                          <span className="text-2xl">😊</span>
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium truncate">{req.to_display_name || 'ユーザー'}</div>
                      <div className="text-xs text-yellow-700 truncate">
                        ⏳ 承諾待ち
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Active chats */}
          <div>
            <h3 className="text-sm font-medium text-gray-500 mb-2">チャット</h3>
            {loading && <div className="text-sm text-gray-500">読み込み中...</div>}
            {error && <div className="text-sm text-red-600">{error}</div>}
            <div className="space-y-2">
              {chats.map((chat) => (
                <button
                  key={chat.chat_id}
                  onClick={() => navigate(`/matching/chats/${chat.chat_id}`)}
                  className={`w-full flex items-center gap-3 p-3 rounded-lg text-left transition-colors ${
                    selectedChatId === chat.chat_id ? 'bg-gray-100 border-l-4 border-black' : 'hover:bg-gray-50 border border-gray-100'
                  }`}
                >
                  <div className="flex-shrink-0">
                    {chat.with_avatar_url ? (
                      <img
                        src={chat.with_avatar_url.startsWith('http') ? chat.with_avatar_url : `${API_URL}${chat.with_avatar_url}`}
                        alt={chat.with_display_name}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                        <span className="text-2xl">😊</span>
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium truncate">{chat.with_display_name}</div>
                    <div className="text-xs text-gray-500 truncate">
                      {chat.last_message || 'メッセージはまだありません'}
                    </div>
                  </div>
                </button>
              ))}
              {!loading && !error && chats.length === 0 && incomingRequests.length === 0 && outgoingRequests.length === 0 && (
                <div className="text-sm text-gray-500 text-center py-4">
                  チャットはまだありません
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Right side - Chat detail */}
      <div className="flex-1 overflow-hidden">
        <Outlet />
      </div>
    </div>
  );
};

export default MatchingChatShell;
