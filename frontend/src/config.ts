export const API_URL = import.meta.env.VITE_API_URL || (import.meta.env.DEV ? 'http://localhost:8000' : '');

if (!API_URL && !import.meta.env.DEV) {
  console.error('VITE_API_URL is not set in production environment');
}
