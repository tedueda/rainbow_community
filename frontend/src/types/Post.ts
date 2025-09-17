export interface User {
  id: number;
  display_name: string;
  email: string;
}

export interface Post {
  id: number;
  title?: string;
  body: string;
  user_id: number;
  visibility: string;
  created_at: string;
  category?: string;
  media_urls?: string[];
  youtube_url?: string;
  like_count?: number;
  comment_count?: number;
  points?: number;
  tags?: string[];
  is_liked?: boolean;
}

export interface Comment {
  id: number;
  body: string;
  created_at: string;
  user: {
    id: number;
    display_name: string;
  };
}
