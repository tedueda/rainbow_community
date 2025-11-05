
export type Option = {
  label: string;
  value: string;
};

export const PREFECTURES: string[] = [
  '北海道', '青森県', '岩手県', '宮城県', '秋田県', '山形県', '福島県',
  '茨城県', '栃木県', '群馬県', '埼玉県', '千葉県', '東京都', '神奈川県',
  '新潟県', '富山県', '石川県', '福井県', '山梨県', '長野県',
  '岐阜県', '静岡県', '愛知県', '三重県',
  '滋賀県', '京都府', '大阪府', '兵庫県', '奈良県', '和歌山県',
  '鳥取県', '島根県', '岡山県', '広島県', '山口県',
  '徳島県', '香川県', '愛媛県', '高知県',
  '福岡県', '佐賀県', '長崎県', '熊本県', '大分県', '宮崎県', '鹿児島県', '沖縄県'
];

export const AGE_BANDS: Option[] = [
  { label: '10代', value: '10代' },
  { label: '20代前半', value: '20代前半' },
  { label: '20代後半', value: '20代後半' },
  { label: '30代前半', value: '30代前半' },
  { label: '30代後半', value: '30代後半' },
  { label: '40代前半', value: '40代前半' },
  { label: '40代後半', value: '40代後半' },
  { label: '50代以上', value: '50代以上' }
];

export const OCCUPATIONS: string[] = [
  '会社員', '公務員', '自営業', '経営者', '学生', '医療従事者',
  'IT関連', 'クリエイティブ', '教育関係', 'サービス業',
  '専門職', 'フリーランス', 'その他', '非表示'
];

export const INCOME_RANGES: string[] = [
  '200万円未満', '200-400万円', '400-600万円', '600-800万円',
  '800-1000万円', '1000-1500万円', '1500万円以上', '非表示'
];

export const MEET_PREFS: Option[] = [
  { label: '友達から', value: '友達から' },
  { label: '恋人探し', value: '恋人探し' },
  { label: '結婚前提', value: '結婚前提' },
  { label: 'まずは会ってみたい', value: 'まずは会ってみたい' },
  { label: '非表示', value: '非表示' }
];

export const IDENTITIES: Option[] = [
  { label: 'ゲイ', value: 'gay' },
  { label: 'レズビアン', value: 'lesbian' },
  { label: 'バイセクシュアル', value: 'bisexual' },
  { label: 'トランスジェンダー', value: 'transgender' },
  { label: 'クィア', value: 'queer' },
  { label: 'ノンバイナリー', value: 'nonbinary' },
  { label: 'パンセクシュアル', value: 'pansexual' },
  { label: 'アセクシュアル', value: 'asexual' },
  { label: 'その他', value: 'other' }
];

export const HOBBIES: string[] = [
  '映画鑑賞', '音楽', '読書', 'スポーツ', 'ゲーム', '旅行',
  '料理', 'カフェ巡り', 'アート', 'ファッション', 'ダンス',
  'ヨガ', 'ジム', 'アウトドア', '写真', 'ペット', 'ドライブ',
  'カラオケ', 'お酒', 'グルメ', 'ショッピング', 'アニメ・漫画',
  '語学学習', '資格取得', 'ボランティア', 'その他'
];
