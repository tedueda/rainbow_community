import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { API_URL } from '@/config';

type UserProfile = {
  user_id: number;
  display_name: string;
  avatar_url?: string;
};

const MatchingSendMessagePage: React.FC = () => {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const { token } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [message, setMessage] = useState('こんにちは、今は何をしていますか');
  const [loading, setLoading] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);

  const templates = [
    'こんにちは、今は何をしていますか',
    'はじめまして！プロフィールを見て興味を持ちました',
    'よろしくお願いします',
    'お話しできたら嬉しいです',
  ];

  useEffect(() => {
    const fetchProfile = async () => {
      if (!token || !userId) return;
      try {
        const res = await fetch(`${API_URL}/api/matching/profiles/${userId}`, {
          headers: { 'Authorization': `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          setProfile(data);
        }
      } catch (e) {
        console.error('Failed to fetch profile:', e);
      }
    };

    fetchProfile();
  }, [token, userId]);

  const handleSend = async () => {
    if (!token || !userId || !message.trim()) return;
    
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/matching/chat_requests/${userId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ initial_message: message.trim() }),
      });

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(errorText);
      }

      const data = await res.json();
      navigate(`/matching/requests/${data.request_id}`, {
        state: { fromProfile: true }
      });
    } catch (e: any) {
      alert(`エラー: ${e?.message || 'メッセージ送信に失敗しました'}`);
    } finally {
      setLoading(false);
    }
  };

  const handleTemplateSelect = (template: string) => {
    setMessage(template);
    setShowTemplates(false);
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Header */}
      <div className="sticky top-0 bg-white border-b border-gray-200 px-4 py-3 flex items-center gap-3 z-10">
        <button
          onClick={() => navigate(-1)}
          className="text-gray-600 hover:text-black"
        >
          ← 戻る
        </button>
        <h1 className="text-lg font-semibold text-black">
          {profile?.display_name || 'ユーザー'}
        </h1>
      </div>

      {/* Message Area */}
      <div className="flex-1 p-4">
        <div className="text-sm text-gray-500 mb-4">
          最初のメッセージを送信してください
        </div>
      </div>

      {/* Template Menu */}
      {showTemplates && (
        <div className="border-t border-gray-200 bg-white">
          <div className="p-4">
            <div className="text-sm font-medium text-gray-700 mb-3">定型文を選択</div>
            <div className="space-y-2">
              {templates.map((template, index) => (
                <button
                  key={index}
                  onClick={() => handleTemplateSelect(template)}
                  className="w-full text-left p-3 rounded-lg border border-gray-200 hover:bg-gray-50 text-sm"
                >
                  {template}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Input Area */}
      <div className="border-t border-gray-200 bg-white p-4">
        <div className="flex items-center gap-2 mb-3">
          <button
            onClick={() => setShowTemplates(!showTemplates)}
            className="text-gray-600 hover:text-black text-sm flex items-center gap-1"
          >
            <span>📝</span>
            <span>定型文を追加</span>
          </button>
        </div>

        <div className="flex items-end gap-2">
          <button className="text-teal-500 p-2 hover:bg-gray-50 rounded-full">
            <span className="text-xl">➕</span>
          </button>
          
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="メールを送信"
            className="flex-1 px-4 py-3 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-teal-500"
            rows={2}
            disabled={loading}
          />

          <button
            onClick={handleSend}
            disabled={loading || !message.trim()}
            className="bg-teal-500 text-white p-3 rounded-full hover:bg-teal-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
          >
            <span className="text-xl">➤</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default MatchingSendMessagePage;
