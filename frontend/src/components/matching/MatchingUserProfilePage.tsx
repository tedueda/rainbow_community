import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { API_URL } from '@/config';

type UserProfile = {
  user_id: number;
  display_name: string;
  avatar_url?: string;
  age_band?: string;
  prefecture?: string;
  identity?: string;
  self_intro?: string;
  interests?: string;
};

const MatchingUserProfilePage: React.FC = () => {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const { token } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!token || !userId) return;
      setLoading(true);
      try {
        const res = await fetch(`${API_URL}/api/matching/profiles/${userId}`, {
          headers: { 'Authorization': `Bearer ${token}` },
        });
        if (!res.ok) throw new Error('プロフィールの取得に失敗しました');
        const data = await res.json();
        setProfile(data);
      } catch (e: any) {
        setError(e?.message || 'エラーが発生しました');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [token, userId]);

  const handleSendMessage = () => {
    navigate(`/matching/compose/${userId}`);
  };

  const handleLike = async () => {
    if (!token || !userId) return;
    try {
      const res = await fetch(`${API_URL}/api/matching/likes/${userId}`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('いいねに失敗しました');
      alert('❤️ いいね！を送信しました');
      navigate('/matching/matches');
    } catch (e: any) {
      alert(`エラー: ${e?.message || 'いいねに失敗しました'}`);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-gray-500">読み込み中...</div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-red-600">{error || 'プロフィールが見つかりません'}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white pb-24">
      {/* Header */}
      <div className="sticky top-0 bg-white border-b border-gray-200 px-4 py-3 flex items-center gap-3 z-10">
        <button
          onClick={() => navigate(-1)}
          className="text-gray-600 hover:text-black"
        >
          ← 戻る
        </button>
        <h1 className="text-lg font-semibold text-black">{profile.display_name}</h1>
      </div>

      {/* Profile Content */}
      <div className="max-w-2xl mx-auto">
        {/* Avatar */}
        <div className="w-full aspect-square bg-gray-100">
          {profile.avatar_url ? (
            <img
              src={profile.avatar_url.startsWith('http') ? profile.avatar_url : `${API_URL}${profile.avatar_url}`}
              alt={profile.display_name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400">
              <span className="text-6xl">😊</span>
            </div>
          )}
        </div>

        {/* Profile Info */}
        <div className="p-6">
          <div className="mb-4">
            <div className="text-sm text-gray-500 mb-1">18いいかも！</div>
            <h2 className="text-2xl font-bold text-black mb-2">{profile.display_name}</h2>
            <div className="text-gray-600">
              {profile.age_band || '年齢未設定'} {profile.prefecture || '地域未設定'}
            </div>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-gray-200 mb-6">
            <button className="flex-1 py-3 text-center border-b-2 border-pink-500 text-pink-500 font-medium">
              プロフィール
            </button>
            <button className="flex-1 py-3 text-center text-gray-500">
              クラス特典
            </button>
          </div>

          {/* Self Introduction */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-black mb-3">自己紹介</h3>
            <div className="text-gray-700 whitespace-pre-wrap">
              {profile.self_intro || '自己紹介が設定されていません'}
            </div>
          </div>

          {/* Additional Info */}
          {profile.interests && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-black mb-3">趣味・興味</h3>
              <div className="text-gray-700">{profile.interests}</div>
            </div>
          )}

          {profile.identity && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-black mb-3">アイデンティティ</h3>
              <div className="text-gray-700">{profile.identity}</div>
            </div>
          )}
        </div>
      </div>

      {/* Sticky Bottom Action Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4">
        <div className="max-w-2xl mx-auto grid grid-cols-2 gap-3">
          <button
            onClick={handleSendMessage}
            className="w-full bg-teal-500 text-white py-3 rounded-lg font-medium hover:bg-teal-600 transition-colors flex items-center justify-center gap-2"
          >
            <span>✉️</span>
            <span>メールする</span>
          </button>
          <button
            onClick={handleLike}
            className="w-full bg-pink-500 text-white py-3 rounded-lg font-medium hover:bg-pink-600 transition-colors flex items-center justify-center"
          >
            <span>❤️ いいね！</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default MatchingUserProfilePage;
