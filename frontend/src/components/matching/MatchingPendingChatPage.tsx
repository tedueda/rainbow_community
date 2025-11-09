import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { API_URL } from '@/config';
import MessageBubble from './chat/MessageBubble';

type PendingMessage = {
  id: number;
  from_user_id: number;
  content: string;
  created_at: string;
  migrated: boolean;
};

type ChatRequestInfo = {
  request_id: number;
  from_user_id: number;
  to_user_id: number;
  status: string;
  to_display_name?: string;
  to_avatar_url?: string;
};

const MatchingPendingChatPage: React.FC = () => {
  const { requestId } = useParams<{ requestId: string }>();
  const { token, user } = useAuth();
  const navigate = useNavigate();
  const [messages, setMessages] = useState<PendingMessage[]>([]);
  const [requestInfo, setRequestInfo] = useState<ChatRequestInfo | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const fetchRequestInfo = async () => {
    if (!token || !requestId) return;
    try {
      const res = await fetch(`${API_URL}/api/matching/chat_requests/outgoing`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Failed to fetch request info');
      const data = await res.json();
      const list = Array.isArray(data?.items) ? data.items : Array.isArray(data?.requests) ? data.requests : [];
      const request = list.find((r: any) => r.request_id === parseInt(requestId));
      if (request) {
        setRequestInfo(request);
        
        if (request.status === 'accepted') {
          const chatRes = await fetch(`${API_URL}/api/matching/ensure_chat/${request.to_user_id}`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}` },
          });
          if (chatRes.ok) {
            const chatData = await chatRes.json();
            navigate(`/matching/chats/${chatData.chat_id}`);
          }
        }
      }
    } catch (e: any) {
      console.error('Failed to fetch request info:', e);
    }
  };

  const fetchMessages = async () => {
    if (!token || !requestId) return;
    try {
      const res = await fetch(`${API_URL}/api/matching/chat_requests/${requestId}/messages`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Failed to fetch messages');
      const data = await res.json();
      setMessages(data.messages || []);
    } catch (e: any) {
      setError(e?.message || 'メッセージの取得に失敗しました');
    }
  };

  useEffect(() => {
    fetchRequestInfo();
    fetchMessages();
    
    pollIntervalRef.current = setInterval(() => {
      fetchRequestInfo();
    }, 5000);

    return () => {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, requestId]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !requestId || !newMessage.trim()) return;

    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/matching/chat_requests/${requestId}/messages`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content: newMessage.trim() }),
      });

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(errorText);
      }

      setNewMessage('');
      await fetchMessages();
    } catch (e: any) {
      alert(`エラー: ${e?.message || 'メッセージ送信に失敗しました'}`);
    } finally {
      setLoading(false);
    }
  };

  if (!requestInfo) {
    return <div className="p-4">読み込み中...</div>;
  }

  return (
    <div className="flex flex-col h-[calc(100vh-200px)]">
      <div className="bg-yellow-50 border border-yellow-200 rounded p-3 mb-3">
        <div className="flex items-center gap-2">
          <span className="text-yellow-600">⏳</span>
          <div>
            <div className="font-medium text-sm">承諾待ち</div>
            <div className="text-xs text-gray-600">
              相手が承諾するとメールができます。メッセージは相手に届いています。
            </div>
          </div>
        </div>
      </div>

      <div
        className="flex-1 overflow-y-auto border rounded-lg px-4 bg-gray-50 mb-3"
        data-chat-messages
      >
        {error && <div className="text-red-600 text-sm text-center py-4">{error}</div>}
        {messages.length === 0 ? (
          <div className="text-center text-gray-500 text-sm py-8">
            メッセージを送信してください
          </div>
        ) : (
          <div className="py-4">
            {messages.map((msg) => {
              const isMe = msg.from_user_id === user?.id;
              return (
                <MessageBubble
                  key={msg.id}
                  isMe={isMe}
                  avatarUrl={!isMe ? requestInfo?.to_avatar_url : null}
                  body={msg.content}
                  imageUrl={null}
                  createdAt={msg.created_at}
                />
              );
            })}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      <form onSubmit={handleSendMessage} className="flex gap-2">
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="メッセージを入力..."
          className="flex-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
          disabled={loading}
        />
        <button
          type="submit"
          disabled={loading || !newMessage.trim()}
          className="px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
        >
          送信
        </button>
      </form>
    </div>
  );
};

export default MatchingPendingChatPage;
