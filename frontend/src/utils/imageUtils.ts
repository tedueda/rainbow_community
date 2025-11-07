/**
 * 画像URLを解決するユーティリティ関数
 * バックエンドから返されるURLを適切な形式に変換します
 */

const API_URL = (import.meta as any).env.VITE_API_URL || 'http://localhost:8000';

/**
 * 画像URLを解決する
 * @param url - 元のURL（相対パスまたは絶対パス）
 * @returns 解決されたURL
 */
export const resolveImageUrl = (url: string | undefined | null): string => {
  if (!url) return '';
  
  // 既に完全なURLの場合はそのまま返す
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }
  
  // /images/ で始まる場合は静的ファイル（そのまま）
  if (url.startsWith('/images/')) {
    return url;
  }
  
  // /media/ や /matching-media/ で始まる場合はAPI_URLを付加
  if (url.startsWith('/media/') || url.startsWith('/matching-media/')) {
    return `${API_URL}${url}`;
  }
  
  // それ以外の場合もAPI_URLを付加
  return `${API_URL}${url.startsWith('/') ? url : '/' + url}`;
};

/**
 * 複数の画像URLを解決する
 * @param urls - URLの配列
 * @returns 解決されたURLの配列
 */
export const resolveImageUrls = (urls: (string | undefined | null)[]): string[] => {
  return urls.map(resolveImageUrl).filter(url => url !== '');
};
