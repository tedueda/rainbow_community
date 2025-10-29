// マッチングプロフィールの選択肢定数

export const PREFECTURES = [
  '北海道', '青森県', '岩手県', '宮城県', '秋田県', '山形県', '福島県',
  '茨城県', '栃木県', '群馬県', '埼玉県', '千葉県', '東京都', '神奈川県',
  '新潟県', '富山県', '石川県', '福井県', '山梨県', '長野県',
  '岐阜県', '静岡県', '愛知県', '三重県',
  '滋賀県', '京都府', '大阪府', '兵庫県', '奈良県', '和歌山県',
  '鳥取県', '島根県', '岡山県', '広島県', '山口県',
  '徳島県', '香川県', '愛媛県', '高知県',
  '福岡県', '佐賀県', '長崎県', '熊本県', '大分県', '宮崎県', '鹿児島県', '沖縄県'
] as const;

export const AGE_BANDS = [
  { label: '10代後半', value: '10s_late' },
  { label: '20代前半', value: '20s_early' },
  { label: '20代後半', value: '20s_late' },
  { label: '30代前半', value: '30s_early' },
  { label: '30代後半', value: '30s_late' },
  { label: '40代前半', value: '40s_early' },
  { label: '40代後半', value: '40s_late' },
  { label: '50代前半', value: '50s_early' },
  { label: '50代後半', value: '50s_late' },
  { label: '60代前半', value: '60s_early' },
  { label: '60代後半', value: '60s_late' },
  { label: '70代以上', value: '70plus' }
] as const;

export const OCCUPATIONS = [
  '学生',
  '会社員（一般）',
  '管理職',
  '役員・経営者',
  '公務員',
  '自営業・フリーランス',
  'IT・エンジニア',
  'デザイナー',
  'クリエイター・メディア',
  '企画・マーケティング',
  '営業',
  '事務・バックオフィス',
  '医療・介護',
  '福祉・教育',
  '研究・アカデミア',
  '接客・販売',
  '飲食・サービス',
  '物流・運輸',
  '建築・不動産',
  '製造・工場',
  '金融・保険',
  'パート・アルバイト',
  '無職・求職中',
  'その他'
] as const;

export const INCOME_RANGES = [
  '100万以下',
  '100–300万',
  '300–500万',
  '500–800万',
  '800–1000万',
  '1000万以上'
] as const;

export const MEET_PREFS = [
  { label: 'まずはメッセージから', value: 'msg_first' },
  { label: '通話してから（音声通話）', value: 'voice_after' },
  { label: 'ビデオ通話してから', value: 'video_after' },
  { label: 'お茶・食事から', value: 'cafe_meal' },
  { label: '共通の趣味から会いたい', value: 'via_hobby' },
  { label: '条件が合えば会いたい', value: 'meet_if_conditions' },
  { label: 'すぐに会いたい（相互同意の場合のみ）', value: 'meet_first' },
  { label: '会う予定は未定（オンライン交流希望）', value: 'online_only' }
] as const;

export const IDENTITIES = [
  { label: 'ゲイ', value: 'gay' },
  { label: 'レズ', value: 'lesbian' },
  { label: 'バイセクシャル', value: 'bisexual' },
  { label: 'トランスジェンダー', value: 'transgender' },
  { label: 'クエスチョニング', value: 'questioning' },
  { label: 'その他', value: 'other' }
] as const;

export const HOBBIES = [
  '料理', 'グルメ', 'カフェ巡り', 'お酒・バー', 'お菓子作り',
  '旅行', '温泉', 'ドライブ', 'バイク', 'キャンプ', '登山', '釣り', '海・ビーチ',
  'スポーツ観戦', 'ランニング', '筋トレ', 'ヨガ', 'ダンス', 'サイクリング',
  '音楽鑑賞', '楽器', 'カラオケ', 'DJ',
  '映画', '海外ドラマ', 'アニメ', 'マンガ', 'コスプレ', 'ゲーム', 'ボードゲーム',
  'アート', '写真', 'デザイン', 'ファッション', '手芸・DIY',
  '読書', '語学', 'プログラミング', 'テクノロジー',
  'ペット', 'ガーデニング', 'ボランティア',
  'その他'
] as const;

// 型定義
export type Prefecture = typeof PREFECTURES[number];
export type AgeBandValue = typeof AGE_BANDS[number]['value'];
export type Occupation = typeof OCCUPATIONS[number];
export type IncomeRange = typeof INCOME_RANGES[number];
export type MeetPrefValue = typeof MEET_PREFS[number]['value'];
export type IdentityValue = typeof IDENTITIES[number]['value'];
export type Hobby = typeof HOBBIES[number];
