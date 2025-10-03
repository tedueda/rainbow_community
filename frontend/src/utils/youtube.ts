// Utilities for working with YouTube URLs

// Extracts a YouTube video ID from various URL formats
export function extractYouTubeId(rawUrl: string): string | null {
  if (!rawUrl) return null;
  try {
    const url = new URL(rawUrl);
    // Standard watch URL: https://www.youtube.com/watch?v=VIDEO_ID
    if ((url.hostname.includes('youtube.com') || url.hostname.includes('youtu.be'))) {
      if (url.hostname.includes('youtu.be')) {
        // Short URL: https://youtu.be/VIDEO_ID
        const id = url.pathname.split('/').filter(Boolean)[0];
        return id || null;
      }
      // /watch?v=VIDEO_ID
      if (url.pathname === '/watch') {
        const v = url.searchParams.get('v');
        if (v) return v;
      }
      // /embed/VIDEO_ID
      if (url.pathname.startsWith('/embed/')) {
        const id = url.pathname.replace('/embed/', '').split('/')[0];
        return id || null;
      }
      // /shorts/VIDEO_ID
      if (url.pathname.startsWith('/shorts/')) {
        const id = url.pathname.replace('/shorts/', '').split('/')[0];
        return id || null;
      }
    }
    // If just an ID was passed
    if (/^[a-zA-Z0-9_-]{11}$/.test(rawUrl)) return rawUrl;
  } catch (_) {
    // Not a valid URL; try raw ID pattern
    if (/^[a-zA-Z0-9_-]{11}$/.test(rawUrl)) return rawUrl;
  }
  return null;
}

// Returns a thumbnail URL; tries maxresdefault and falls back to hqdefault
export function getYouTubeThumbnail(rawUrl: string): string | null {
  const id = extractYouTubeId(rawUrl);
  if (!id) return null;
  // Consumers can use maxresdefault; the image host will serve hqdefault if maxres is missing
  return `https://i.ytimg.com/vi/${id}/hqdefault.jpg`;
}

// Extract the first YouTube-like URL from free-form text
export function extractYouTubeUrlFromText(text: string): string | null {
  if (!text) return null;
  const regex = /(https?:\/\/(?:www\.)?(?:youtube\.com|youtu\.be)[^\s)<>"']+)/i;
  const m = text.match(regex);
  return m ? m[1] : null;
}
