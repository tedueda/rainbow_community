import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { IdentityBadge } from "@/components/ui/IdentityBadge";

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
const USE_MOCK_API = false; // 実APIを使用

type Item = {
  user_id: number;
  display_name?: string;
  identity?: string | null;
  prefecture?: string | null;
  age_band?: string | null;
  avatar_url?: string | null;
};

export function MatchCard({ item }: { item: Item }) {
  const [liked, setLiked] = useState(false);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [detail, setDetail] = useState<any>(null);
  const navigate = useNavigate();

  async function handleLike(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (loading || liked) return;
    
    setLoading(true);
    const token = localStorage.getItem('token');
    
    try {
      if (USE_MOCK_API) {
        // モック「いいね」機能
        console.log('🎯 Using Mock Like Function');
        // 少し待機してリアル感を演出
        await new Promise(resolve => setTimeout(resolve, 500));
        setLiked(true);
        setLoading(false);
        return;
      }
      
      const res = await fetch(`${API_URL}/api/matching/likes/${item.user_id}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (!res.ok) throw new Error('Like failed');
      setLiked(true);
    } catch (err) {
      console.error("Like failed:", err);
      alert('いいねに失敗しました');
    } finally {
      setLoading(false);
    }
  }
  async function handleMessage(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (loading) return;
    setLoading(true);
    const token = localStorage.getItem('token');
    
    try {
      if (USE_MOCK_API) {
        // モック「メールする」機能 - 直接チャットに移動
        console.log('🎯 Using Mock Message Function');
        // 少し待機してリアル感を演出
        await new Promise(resolve => setTimeout(resolve, 500));
        // ユーザーIDに基づいてチャットIDを決定（1または2）
        const chatId = item.user_id <= 2 ? item.user_id : 1;
        navigate(`/matching/chats/${chatId}`);
        setLoading(false);
        return;
      }
      
      const res = await fetch(`${API_URL}/api/matching/ensure_chat/${item.user_id}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();
      navigate(`/matching/chats/${data.chat_id}`);
    } catch (err) {
      console.error('ensure_chat failed', err);
      alert('チャットを開始できませんでした');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    const token = localStorage.getItem('token');
    (async () => {
      try {
        const res = await fetch(`${API_URL}/api/matching/profiles/${item.user_id}`, {
          headers: { 'Authorization': `Bearer ${token}` },
        });
        if (!res.ok) throw new Error(await res.text());
        const data = await res.json();
        console.log('Profile API response:', data);
        if (!cancelled) setDetail(data);
      } catch (e) {
        if (!cancelled) setDetail(null);
      }
    })();
    return () => { cancelled = true; };
  }, [open, item.user_id]);

  return (
    <div>
    <article
      className="group relative overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm transition-all hover:shadow-md cursor-pointer"
      onClick={() => setOpen(true)}
    >
      {/* 画像エリア - 縦長レイアウト */}
      <div className="block relative aspect-[3/4] bg-gradient-to-br from-gray-100 to-gray-200">
        {item.avatar_url && !item.avatar_url.includes('dicebear') ? (
          <img
            src={item.avatar_url.startsWith('http') ? item.avatar_url : `${API_URL}${item.avatar_url}`}
            alt={`${item.display_name || "ユーザー"}のプロフィール画像`}
            className="h-full w-full object-cover"
            loading="lazy"
            key={`${item.user_id}-${item.avatar_url}`}
            onError={(e) => {
              // エラー時は画像を非表示にする
              const target = e.currentTarget as HTMLImageElement;
              target.style.display = 'none';
            }}
          />
        ) : (
          <div className="h-full w-full flex items-center justify-center bg-gray-200">
            <div className="w-16 h-16 bg-gray-400 rounded-full flex items-center justify-center">
              <span className="text-white text-xl">👤</span>
            </div>
          </div>
        )}
        
        {/* 性自認バッジ（右上） */}
        {item.identity && (
          <div className="absolute right-2 top-2">
            <IdentityBadge value={item.identity} />
          </div>
        )}
        
        {/* 下部情報オーバーレイ */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-2 text-white">
          <div className="flex items-center gap-1 mb-1">
            <span className="text-sm font-bold truncate">{item.display_name || `User ${item.user_id}`}</span>
            <span className="text-xs opacity-90">{item.age_band}</span>
          </div>
          <div className="text-xs opacity-75">
            📍 {item.prefecture}
          </div>
        </div>
      </div>

      {/* アクションボタン - コンパクト */}
      <div className="p-2">
        <div className="flex gap-1">
          <button
            onClick={handleLike}
            disabled={loading || liked}
            aria-label={`${item.display_name || "このユーザー"}にタイプを送る`}
            className={`
              flex-1 rounded-md px-2 py-1.5 text-xs font-medium transition-all
              ${liked 
                ? "bg-pink-100 text-pink-700 cursor-not-allowed" 
                : "bg-gradient-to-r from-pink-500 to-rose-500 text-white hover:from-pink-600 hover:to-rose-600 active:scale-95"
              }
              ${loading ? "opacity-50 cursor-wait" : ""}
            `}
          >
            {liked ? "♡ タイプ" : "♡ タイプ"}
          </button>
          <button
            onClick={handleMessage}
            className="flex-1 rounded-md border border-gray-300 px-2 py-1.5 text-center text-xs font-medium text-gray-700 transition-all hover:bg-gray-50 active:scale-95"
            aria-label={`${item.display_name || "このユーザー"}にメールする`}
          >
            メールをする
          </button>
        </div>
      </div>
    </article>

    {/* 詳細モーダル */}
    {open && (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" role="dialog" aria-modal="true" aria-label="プロフィール詳細" onClick={() => setOpen(false)}>
        <div className="w-full max-w-2xl rounded-lg bg-white shadow-xl" onClick={(e) => e.stopPropagation()}>
          <div className="flex items-center justify-between border-b px-4 py-3">
            <div className="font-semibold">プロフィール</div>
            <button className="text-gray-500 hover:text-gray-700" aria-label="閉じる" onClick={() => setOpen(false)}>×</button>
          </div>
          <div className="p-4 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-1">
              <div className="bg-gray-100 rounded overflow-hidden flex items-center justify-center">
                <img 
                  src={
                    detail?.avatar_url && detail.avatar_url !== null
                      ? (detail.avatar_url.startsWith('http') ? detail.avatar_url : `${API_URL}${detail.avatar_url}`)
                      : `https://api.dicebear.com/7.x/fun-emoji/png?seed=${item.user_id}&size=256&scale=80`
                  }
                  alt="プロフィール画像" 
                  className="w-full h-auto object-contain max-h-[500px]"
                  onError={(e) => {
                    const target = e.currentTarget as HTMLImageElement;
                    const fallback = `https://api.dicebear.com/7.x/fun-emoji/png?seed=${item.user_id}&size=256&scale=80`;
                    if (target.src !== fallback) target.src = fallback;
                  }}
                />
              </div>
              {detail?.identity && (
                <div className="mt-2 inline-block"><IdentityBadge value={detail.identity} /></div>
              )}
            </div>
            <div className="md:col-span-2 space-y-2 text-sm">
              <div className="text-lg font-semibold">{detail?.display_name || item.display_name}</div>
              <div className="text-gray-700">{[detail?.age_band, detail?.prefecture].filter(Boolean).join(' ・ ')}</div>
              
              {detail?.occupation && detail.occupation !== '非表示' && <div><span className="font-medium">職業:</span> {detail.occupation}</div>}
              {detail?.income_range && detail.income_range !== '非表示' && <div><span className="font-medium">年収:</span> {detail.income_range}</div>}
              {detail?.meet_pref && detail.meet_pref !== '非表示' && <div><span className="font-medium">マッチングの目的:</span> {detail.meet_pref}</div>}
              
              {Array.isArray(detail?.romance_targets) && detail.romance_targets.length > 0 && (
                <div>
                  <span className="font-medium">恋愛対象:</span>
                  <div className="mt-1 flex flex-wrap gap-1">
                    {detail.romance_targets.map((target: string) => (
                      <span key={target} className="px-2 py-1 text-xs rounded-full bg-pink-50 text-pink-700 border border-pink-300">{target}</span>
                    ))}
                  </div>
                </div>
              )}
              
              {Array.isArray(detail?.hobbies) && detail.hobbies.length > 0 && (
                <div>
                  <span className="font-medium">興味・趣味:</span>
                  <div className="mt-1 flex flex-wrap gap-2">
                    {detail.hobbies.map((h: string) => (
                      <span key={h} className="px-2 py-1 text-xs rounded-full bg-blue-50 text-blue-700 border border-blue-300">{h}</span>
                    ))}
                  </div>
                </div>
              )}
              
              {detail?.bio && (
                <div>
                  <span className="font-medium">自己紹介:</span>
                  <p className="mt-1 whitespace-pre-wrap text-gray-800">{detail.bio}</p>
                </div>
              )}
            </div>
          </div>
          <div className="flex justify-end gap-2 border-t px-4 py-3">
            <button className="px-3 py-2 text-sm border rounded hover:bg-gray-50" onClick={() => setOpen(false)}>閉じる</button>
            <button className="px-3 py-2 text-sm bg-pink-600 text-white rounded hover:bg-pink-700" onClick={handleMessage}>メールをする</button>
          </div>
        </div>
      </div>
    )}
    </div>
  );
}

export default MatchCard;
