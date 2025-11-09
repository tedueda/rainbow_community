export const API_URL = import.meta.env.VITE_API_URL || (import.meta.env.DEV ? 'http://localhost:8000' : 'https://ddxdewgmen.ap-northeast-1.awsapprunner.com');

if (!import.meta.env.VITE_API_URL && !import.meta.env.DEV) {
  console.warn('VITE_API_URL is not set, using fallback backend URL');
}
