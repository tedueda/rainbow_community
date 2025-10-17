import React, { useEffect, useRef, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import {
  PREFECTURES,
  AGE_BANDS,
  OCCUPATIONS,
  INCOME_RANGES,
  MEET_PREFS,
  IDENTITIES,
  HOBBIES,
} from '@/constants/matchingOptions';

type Profile = {
  user_id: number;
  display_flag: boolean;
  prefecture: string;
  age_band?: string;
  occupation?: string;
  income_range?: string;
  meeting_style?: string;
  bio?: string;
  identity?: string;
  avatar_url?: string;
  hobbies?: string[];
};

const MatchingProfilePage: React.FC = () => {
  const { token } = useAuth();
  const API_URL = (import.meta as any).env.VITE_API_URL || 'http://localhost:8000';
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const fetchProfile = async () => {
    if (!token) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_URL}/api/matching/profiles/me`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (res.status === 404) {
        // プロフィールが存在しない場合は空のフォームを表示
        setProfile({
          user_id: 0,
          display_flag: false,
          prefecture: '',
          age_band: '',
          occupation: '',
          income_range: '',
          meeting_style: '',
          bio: '',
          identity: '',
          avatar_url: '',
          hobbies: [],
        });
        setLoading(false);
        return;
      }
      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();
      setProfile({
        user_id: data.user_id,
        display_flag: !!data.display_flag,
        prefecture: data.prefecture || '',
        age_band: data.age_band || '',
        occupation: data.occupation || '',
        income_range: data.income_range || '',
        meeting_style: data.meeting_style || data.meet_pref || '',
        bio: data.bio || '',
        identity: data.identity || '',
        avatar_url: data.avatar_url || '',
        hobbies: Array.isArray(data.hobbies) ? data.hobbies : [],
      });
    } catch (e: any) {
      setError(e?.message || '取得に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  const saveProfile = async () => {
    if (!token || !profile) return;
    setSaving(true);
    setError(null);
    try {
      const payload = {
        prefecture: profile.prefecture,
        age_band: profile.age_band,
        occupation: profile.occupation,
        income_range: profile.income_range,
        meeting_style: profile.meeting_style,
        bio: profile.bio,
        identity: profile.identity,
        avatar_url: profile.avatar_url,
        hobbies: profile.hobbies || [],
      };
      const res = await fetch(`${API_URL}/api/matching/profiles/me`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error(await res.text());
      await fetchProfile();
      alert('保存しました');
    } catch (e: any) {
      setError(e?.message || '保存に失敗しました');
    } finally {
      setSaving(false);
    }
  };

  const toggleVisibility = async () => {
    if (!token || !profile) return;
    try {
      const res = await fetch(`${API_URL}/api/matching/profiles/me/visibility?display_flag=${!profile.display_flag}`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (!res.ok) throw new Error(await res.text());
      setProfile({ ...profile, display_flag: !profile.display_flag });
    } catch (e: any) {
      alert('表示切り替えに失敗しました');
    }
  };

  const uploadAvatar = async (file: File) => {
    if (!token || !file) return;
    const form = new FormData();
    form.append('file', file);
    try {
      const res = await fetch(`${API_URL}/api/media/upload`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: form,
      });
      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();
      setProfile((p) => (p ? { ...p, avatar_url: data.url } : p));
    } catch (e: any) {
      alert('画像アップロードに失敗しました');
    }
  };

  useEffect(() => {
    fetchProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  return (
    <div>
      <h2 className="text-lg font-semibold mb-3">プロフィール編集（マッチング）</h2>
      <div className="p-4 border rounded-lg bg-white">
        {loading && <div>読み込み中...</div>}
        {error && <div className="text-red-600 text-sm mb-2">{error}</div>}
        {profile && (
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-16 h-16 rounded-full bg-gray-200 overflow-hidden">
                {profile.avatar_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={profile.avatar_url} alt="avatar" className="w-full h-full object-cover" />
                ) : null}
              </div>
              <div className="flex gap-2">
                <button onClick={() => fileInputRef.current?.click()} className="px-3 py-1 text-sm bg-gray-100 rounded hover:bg-gray-200">画像を選択</button>
                <button onClick={saveProfile} disabled={saving} className="px-3 py-1 text-sm bg-pink-600 text-white rounded hover:bg-pink-700 disabled:opacity-60">保存</button>
              </div>
              <input ref={fileInputRef} type="file" accept="image/*" className="hidden" aria-label="プロフィール画像を選択" onChange={(e) => e.target.files && e.target.files[0] && uploadAvatar(e.target.files[0])} />
            </div>

            <div className="flex items-center gap-2">
              <label className="text-sm">検索対象</label>
              <button onClick={toggleVisibility} className={`px-3 py-1 text-sm rounded ${profile.display_flag ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>{profile.display_flag ? '表示' : '非表示'}</button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label htmlFor="prefecture" className="block text-xs text-gray-600 mb-1">都道府県</label>
                <select
                  id="prefecture"
                  value={profile.prefecture}
                  onChange={(e) => setProfile({ ...profile, prefecture: e.target.value })}
                  className="w-full border rounded px-3 py-2 text-sm"
                >
                  <option value="">選択してください</option>
                  {PREFECTURES.map((p) => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="age_band" className="block text-xs text-gray-600 mb-1">年代</label>
                <select
                  id="age_band"
                  value={profile.age_band}
                  onChange={(e) => setProfile({ ...profile, age_band: e.target.value })}
                  className="w-full border rounded px-3 py-2 text-sm"
                >
                  <option value="">選択してください</option>
                  {AGE_BANDS.map((a) => (
                    <option key={a.value} value={a.value}>{a.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="occupation" className="block text-xs text-gray-600 mb-1">職種</label>
                <select
                  id="occupation"
                  value={profile.occupation}
                  onChange={(e) => setProfile({ ...profile, occupation: e.target.value })}
                  className="w-full border rounded px-3 py-2 text-sm"
                >
                  <option value="">選択してください</option>
                  {OCCUPATIONS.map((o) => (
                    <option key={o} value={o}>{o}</option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="income_range" className="block text-xs text-gray-600 mb-1">年収</label>
                <select
                  id="income_range"
                  value={profile.income_range}
                  onChange={(e) => setProfile({ ...profile, income_range: e.target.value })}
                  className="w-full border rounded px-3 py-2 text-sm"
                >
                  <option value="">選択してください</option>
                  {INCOME_RANGES.map((i) => (
                    <option key={i} value={i}>{i}</option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="meeting_style" className="block text-xs text-gray-600 mb-1">出会い方</label>
                <select
                  id="meeting_style"
                  value={profile.meeting_style}
                  onChange={(e) => setProfile({ ...profile, meeting_style: e.target.value })}
                  className="w-full border rounded px-3 py-2 text-sm"
                >
                  <option value="">選択してください</option>
                  {MEET_PREFS.map((m) => (
                    <option key={m.value} value={m.value}>{m.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="identity" className="block text-xs text-gray-600 mb-1">アイデンティティ</label>
                <select
                  id="identity"
                  value={profile.identity}
                  onChange={(e) => setProfile({ ...profile, identity: e.target.value })}
                  className="w-full border rounded px-3 py-2 text-sm"
                >
                  <option value="">選択してください</option>
                  {IDENTITIES.map((i) => (
                    <option key={i.value} value={i.value}>{i.label}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label htmlFor="hobbies" className="block text-xs text-gray-600 mb-1">趣味（最大20個まで選択可）</label>
              <div className="border rounded px-3 py-2 min-h-[60px] flex flex-wrap gap-2">
                {(profile.hobbies || []).map((h) => (
                  <span
                    key={h}
                    className="inline-flex items-center gap-1 px-2 py-1 bg-pink-100 text-pink-700 rounded text-xs cursor-pointer hover:bg-pink-200"
                    onClick={() => setProfile({ ...profile, hobbies: (profile.hobbies || []).filter((x) => x !== h) })}
                  >
                    {h} <span className="text-pink-500">×</span>
                  </span>
                ))}
              </div>
              <select
                id="hobbies"
                value=""
                onChange={(e) => {
                  const val = e.target.value;
                  if (val && !(profile.hobbies || []).includes(val) && (profile.hobbies || []).length < 20) {
                    setProfile({ ...profile, hobbies: [...(profile.hobbies || []), val] });
                  }
                }}
                className="w-full border rounded px-3 py-2 text-sm mt-2"
              >
                <option value="">趣味を追加...</option>
                {HOBBIES.filter((h) => !(profile.hobbies || []).includes(h)).map((h) => (
                  <option key={h} value={h}>{h}</option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="bio" className="block text-xs text-gray-600 mb-1">自己紹介（連絡先記載は禁止）</label>
              <textarea id="bio" value={profile.bio} onChange={(e) => setProfile({ ...profile, bio: e.target.value })} className="w-full border rounded px-3 py-2 text-sm h-28" />
            </div>

            <div className="flex gap-2">
              <button onClick={saveProfile} disabled={saving} className="px-4 py-2 bg-pink-600 text-white rounded text-sm hover:bg-pink-700 disabled:opacity-60">保存</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MatchingProfilePage;
