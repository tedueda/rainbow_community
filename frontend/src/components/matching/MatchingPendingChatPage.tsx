import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { API_URL } from '@/config';

type ChatRequestInfo = {
  request_id: number;
  from_user_id: number;
  to_user_id: number;
  status: string;
  from_display_name?: string;
  to_display_name?: string;
  from_avatar_url?: string;
  to_avatar_url?: string;
};

interface MatchingPendingChatPageProps {
  embedded?: boolean;
}

const MatchingPendingChatPage: React.FC<MatchingPendingChatPageProps> = ({ embedded = false }) => {
  const { requestId } = useParams<{ requestId: string }>();
  const { token, user } = useAuth();
  const navigate = useNavigate();
  const [requestInfo, setRequestInfo] = useState<ChatRequestInfo | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchRequestInfo = async () => {
    if (!token || !requestId) return;
    try {
      const [outgoingRes, incomingRes] = await Promise.all([
        fetch(`${API_URL}/api/matching/chat_requests/outgoing`, {
          headers: { 'Authorization': `Bearer ${token}` },
        }),
        fetch(`${API_URL}/api/matching/chat_requests/incoming`, {
          headers: { 'Authorization': `Bearer ${token}` },
        }),
      ]);
      
      if (!outgoingRes.ok || !incomingRes.ok) throw new Error('Failed to fetch request info');
      
      const outgoingData = await outgoingRes.json();
      const incomingData = await incomingRes.json();
      
      const outgoingList = Array.isArray(outgoingData?.items) ? outgoingData.items : [];
      const incomingList = Array.isArray(incomingData?.items) ? incomingData.items : [];
      
      let request = outgoingList.find((r: any) => r.request_id === parseInt(requestId));
      if (!request) {
        request = incomingList.find((r: any) => r.request_id === parseInt(requestId));
      }
      
      if (request) {
        setRequestInfo(request);
        
        if (request.status === 'accepted') {
          const targetUserId = request.to_user_id || request.from_user_id;
          const chatRes = await fetch(`${API_URL}/api/matching/ensure_chat/${targetUserId}`, {
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

  useEffect(() => {
    fetchRequestInfo();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, requestId]);

  const handleAccept = async () => {
    if (!token || !requestId) return;
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/matching/chat_requests/${requestId}/accept`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('承諾に失敗しました');
      const data = await res.json();
      if (data.chat_id) {
        navigate(`/matching/chats/${data.chat_id}`, { replace: true });
      }
    } catch (e: any) {
      alert(`エラー: ${e?.message || '承諾に失敗しました'}`);
    } finally {
      setLoading(false);
    }
  };

  const handleDecline = async () => {
    if (!token || !requestId) return;
    if (!confirm('このリクエストを辞退しますか？')) return;
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/matching/chat_requests/${requestId}/decline`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('辞退に失敗しました');
      navigate('/matching/chats', { replace: true });
    } catch (e: any) {
      alert(`エラー: ${e?.message || '辞退に失敗しました'}`);
    } finally {
      setLoading(false);
    }
  };

  if (!requestInfo) {
    return <div className="p-4">読み込み中...</div>;
  }

  const isSender = requestInfo.from_user_id === user?.id;
  const isRecipient = requestInfo.to_user_id === user?.id;
  const isAccepted = requestInfo.status === 'accepted';

  return (
    <div className="flex flex-col h-full">
      {!embedded && (
        <div className="pb-3 border-b mb-3 flex items-center justify-between">
          <button
            onClick={() => navigate(-1)}
            className="text-gray-600 hover:text-black"
          >
            ← 戻る
          </button>
        </div>
      )}

      {isSender && !isAccepted && (
        <div className="flex-1 flex items-center justify-center">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 max-w-md">
            <div className="flex items-center gap-3 mb-3">
              <span className="text-yellow-600 text-2xl">⏳</span>
              <div className="font-medium text-lg">承諾待ち</div>
            </div>
            <div className="text-gray-700">
              相手が承諾するとあなたのメッセージを見ることができます。
            </div>
          </div>
        </div>
      )}

      {isRecipient && !isAccepted && (
        <div className="flex-1 flex flex-col items-center justify-center p-6">
          <div className="bg-white border border-gray-200 rounded-lg p-6 max-w-md w-full">
            <div className="mb-4">
              <div className="font-medium text-lg mb-2">チャットリクエスト</div>
              <div className="text-gray-600 text-sm">
                {requestInfo.from_display_name || 'ユーザー'}さんからチャットリクエストが届いています
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleAccept}
                disabled={loading}
                className="flex-1 bg-black text-white py-3 rounded-lg font-medium hover:bg-gray-800 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
              >
                承諾
              </button>
              <button
                onClick={handleDecline}
                disabled={loading}
                className="flex-1 bg-white text-gray-700 py-3 rounded-lg font-medium border border-gray-300 hover:bg-gray-50 disabled:bg-gray-100 disabled:cursor-not-allowed transition-colors"
              >
                辞退
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MatchingPendingChatPage;
