import React, { useState, useEffect, useRef } from 'react';
import { X, Heart, MessageCircle, Share2, Flag, Send } from 'lucide-react';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { useAuth } from '../contexts/AuthContext';
import { Post, User, Comment } from '../types/Post';

interface PostDetailModalProps {
  post: Post;
  user: User;
  isOpen: boolean;
  onClose: () => void;
  onLike?: (postId: number) => void;
  onUpdated?: (updated: Post) => void;
  onDeleted?: (postId: number) => void;
}


const PostDetailModal: React.FC<PostDetailModalProps> = ({
  post,
  user,
  isOpen,
  onClose,
  onLike,
  onUpdated,
  onDeleted
}) => {
  const { token, user: currentUser, isAnonymous } = useAuth();
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  // const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isLiked, setIsLiked] = useState(post.is_liked || false);
  const [likeCount, setLikeCount] = useState(post.like_count || 0);
  const [showFullText, setShowFullText] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(post.title || '');
  const [editBody, setEditBody] = useState(post.body || '');
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const API_URL = (import.meta as any).env.VITE_API_URL || 'http://localhost:8000';

  const formatNumber = (num: number): string => {
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  };

  const getRelativeTime = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diffInSeconds < 60) return '今';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}分前`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}時間前`;
    if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)}日前`;
    return date.toLocaleDateString('ja-JP');
  };

  const getYouTubeEmbedUrl = (url: string): string => {
    try {
      const urlObj = new URL(url);
      let videoId = '';
      
      if (urlObj.hostname === 'www.youtube.com' || urlObj.hostname === 'youtube.com') {
        videoId = urlObj.searchParams.get('v') || '';
      } else if (urlObj.hostname === 'youtu.be') {
        videoId = urlObj.pathname.slice(1);
      } else if (urlObj.hostname === 'm.youtube.com') {
        videoId = urlObj.searchParams.get('v') || '';
      }
      
      if (videoId) {
        return `https://www.youtube.com/embed/${videoId}`;
      }
    } catch (error) {
      console.error('Invalid YouTube URL:', error);
    }
    
    return '';
  };

  const extractYouTubeUrl = (text: string): string | null => {
    const youtubeRegex = /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/watch\?v=|youtu\.be\/|m\.youtube\.com\/watch\?v=)([a-zA-Z0-9_-]{11})/;
    const match = text.match(youtubeRegex);
    if (match) {
      return `https://www.youtube.com/watch?v=${match[1]}`;
    }
    return null;
  };

  const fetchComments = async () => {
    if (!post) return;
    
    try {
      const response = await fetch(`${API_URL}/api/posts/${post.id}/comments`, {
        headers: token ? {
          'Authorization': `Bearer ${token}`,
        } : {},
      });
      
      if (response.ok) {
        const commentsData = await response.json();
        setComments(commentsData);
      } else {
        setComments([
          {
            id: 1,
            body: "素晴らしい投稿ですね！とても参考になりました。",
            created_at: new Date(Date.now() - 3600000).toISOString(),
            user: { id: 2, display_name: "田中さん" }
          },
          {
            id: 2,
            body: "私も同じような経験があります。共感できる内容でした。",
            created_at: new Date(Date.now() - 7200000).toISOString(),
            user: { id: 3, display_name: "佐藤さん" }
          }
        ]);
      }
    } catch (error) {
      console.error('Error fetching comments:', error);
      setComments([
        {
          id: 1,
          body: "素晴らしい投稿ですね！とても参考になりました。",
          created_at: new Date(Date.now() - 3600000).toISOString(),
          user: { id: 2, display_name: "田中さん" }
        }
      ]);
    }
  };

  const handleAddComment = async () => {
    if (!newComment.trim() || !token) return;
    
    try {
      const response = await fetch(`${API_URL}/api/posts/${post.id}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          authorName: currentUser?.display_name || 'Anonymous',
          body: newComment,
        }),
      });
      
      if (response.ok) {
        const newCommentData = await response.json();
        setComments(prev => [...prev, {
          ...newCommentData,
          user: { id: currentUser?.id || 0, display_name: currentUser?.display_name || 'あなた' }
        }]);
        setNewComment('');
      }
    } catch (error) {
      console.error('Error adding comment:', error);
      const optimisticComment: Comment = {
        id: Date.now(),
        body: newComment,
        created_at: new Date().toISOString(),
        user: { id: currentUser?.id || 0, display_name: currentUser?.display_name || 'あなた' }
      };
      setComments(prev => [...prev, optimisticComment]);
      setNewComment('');
    }
  };

  const handleLike = () => {
    setIsLiked(!isLiked);
    setLikeCount(prev => isLiked ? prev - 1 : prev + 1);
    onLike?.(post.id);
  };

  // Placeholder for future gallery navigation
  // const nextImage = () => {};
  // const prevImage = () => {};

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      fetchComments();
      setIsLiked(post.is_liked || false);
      setLikeCount(post.like_count || 0);
      setShowFullText(false);
      setIsEditing(false);
      setIsDeleting(false);
      setEditTitle(post.title || '');
      setEditBody(post.body || '');
      console.debug('[PostDetailModal] open', {
        currentUserId: currentUser?.id,
        postUserId: post.user_id,
        isAnonymous
      });
      
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          onClose();
        }
        
        if (e.key === 'Tab') {
          const modal = modalRef.current;
          if (!modal) return;
          
          const focusableElements = modal.querySelectorAll(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
          );
          const firstElement = focusableElements[0] as HTMLElement;
          const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;
          
          if (e.shiftKey) {
            if (document.activeElement === firstElement) {
              e.preventDefault();
              lastElement.focus();
            }
          } else {
            if (document.activeElement === lastElement) {
              e.preventDefault();
              firstElement.focus();
            }
          }
        }
      };
      
      document.addEventListener('keydown', handleKeyDown);
      return () => {
        document.removeEventListener('keydown', handleKeyDown);
        document.body.style.overflow = 'unset';
      };
    }
  }, [isOpen, post, onClose]);

  const canEdit = !!currentUser && !isAnonymous && currentUser.id === post.user_id;

  const handleUpdatePost = async () => {
    if (!token) {
      console.warn('[PostDetailModal] No token, cannot update');
      return;
    }
    try {
      console.debug('[PostDetailModal] Updating post', { id: post.id, editTitle, editBody });
      const response = await fetch(`${API_URL}/api/posts/${post.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: editTitle,
          body: editBody,
        }),
      });
      if (response.ok) {
        const updated = await response.json();
        onUpdated?.(updated);
        setIsEditing(false);
      } else {
        const text = await response.text();
        console.error('[PostDetailModal] Update failed', response.status, text);
      }
    } catch (e) {
      console.error('[PostDetailModal] Update error', e);
    }
  };

  const handleDeletePost = async () => {
    if (!token) {
      console.warn('[PostDetailModal] No token, cannot delete');
      return;
    }
    try {
      setIsDeleting(true);
      setDeleteError(null);
      console.debug('[PostDetailModal] Deleting post', { id: post.id });
      const response = await fetch(`${API_URL}/api/posts/${post.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      if (response.ok || response.status === 204) {
        onDeleted?.(post.id);
        onClose();
      } else {
        let text = '';
        try {
          text = await response.text();
        } catch (_) {}
        console.error('[PostDetailModal] Delete failed', { status: response.status, text });
        setDeleteError(text || `削除に失敗しました (status ${response.status})`);
      }
    } catch (e: any) {
      console.error('[PostDetailModal] Delete error', e?.message || String(e));
      setDeleteError(e?.message || 'ネットワークエラーにより削除に失敗しました');
    } finally {
      setIsDeleting(false);
    }
  };


  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      <div 
        ref={modalRef}
        className="relative w-full max-w-3xl max-h-[90vh] mx-4 bg-white rounded-2xl shadow-2xl overflow-hidden"
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
      >
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-pink-100 to-green-100 rounded-full flex items-center justify-center">
              <span className="text-pink-600 font-semibold">
                {user?.display_name?.charAt(0) || '?'}
              </span>
            </div>
            <div>
              <h3 id="modal-title" className="font-semibold text-gray-900">
                {user?.display_name || '不明なユーザー'}
              </h3>
              <p className="text-sm text-gray-500">
                {getRelativeTime(post.created_at)}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" className="text-gray-500 hover:text-gray-700" aria-label="共有">
              <Share2 className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" className="text-gray-500 hover:text-gray-700" aria-label="通報">
              <Flag className="h-4 w-4" />
            </Button>
            {canEdit && (
              <>
                {isEditing ? (
                  <>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="text-pink-700 border-pink-300 hover:bg-pink-50"
                      onClick={handleUpdatePost}
                      aria-label="保存"
                    >
                      保存
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="text-gray-500 hover:text-gray-700"
                      onClick={() => {
                        setIsEditing(false);
                        setEditTitle(post.title || '');
                        setEditBody(post.body || '');
                      }}
                      aria-label="編集をやめる"
                    >
                      キャンセル
                    </Button>
                  </>
                ) : (
                  <>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="text-pink-700 hover:text-pink-900"
                      onClick={() => setIsEditing(true)}
                      aria-label="編集"
                    >
                      編集
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="text-red-600 hover:text-red-700"
                      onClick={handleDeletePost}
                      disabled={isDeleting}
                      aria-label="削除"
                    >
                      {isDeleting ? '削除中...' : '削除'}
                    </Button>
                  </>
                )}
              </>
            )}
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
              aria-label="閉じる"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Dev-only debug banner to diagnose permission check */}
        {import.meta.env.DEV && (
          <div className="mb-2 text-xs text-gray-600 bg-yellow-50 border border-yellow-200 rounded p-2">
            <div className="font-semibold mb-1">[DEBUG] Permission state</div>
            <div className="flex flex-wrap gap-3">
              <span>currentUserId: {currentUser?.id ?? 'null'}</span>
              <span>postUserId: {post.user_id}</span>
              <span>isAnonymous: {String(isAnonymous)}</span>
              <span>canEdit: {String(!!currentUser && !isAnonymous && currentUser.id === post.user_id)}</span>
            </div>
          </div>
        )}

        <div className="overflow-y-auto max-h-[calc(90vh-120px)]">
          {(post.media_url || (post.media_urls && post.media_urls[0])) && (
            <div className="relative">
              <div className="aspect-[3/2] bg-gray-100">
                <img
                  src={`${(post.media_url || (post.media_urls && post.media_urls[0]) || '').startsWith('http') ? '' : API_URL}${post.media_url || (post.media_urls && post.media_urls[0])}`}
                  alt="投稿画像"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          )}

          {(post.youtube_url || extractYouTubeUrl(post.body)) && (
            <div className="aspect-video w-full">
              <iframe
                src={getYouTubeEmbedUrl(post.youtube_url || extractYouTubeUrl(post.body) || '')}
                title="YouTube video player"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
                className="w-full h-full rounded-lg"
              />
            </div>
          )}

          <div className="p-6">
            {isEditing ? (
              <input
                type="text"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                className="w-full border border-pink-200 rounded-md px-3 py-2 mb-3 focus:outline-none focus:ring-2 focus:ring-pink-300"
                placeholder="タイトル"
                aria-label="タイトル編集"
              />
            ) : (
              post.title && (
                <h2 className="text-xl font-bold text-gray-900 mb-3">{post.title}</h2>
              )
            )}
            
            <div className="text-gray-700 leading-7 mb-4">
              {isEditing ? (
                <Textarea
                  placeholder="本文を入力..."
                  value={editBody}
                  onChange={(e) => setEditBody(e.target.value)}
                  className="border-pink-200 focus:border-pink-400 min-h-[140px]"
                  rows={6}
                  aria-label="本文編集"
                />
              ) : (
                <>
                  {showFullText || post.body.length <= 500 
                    ? post.body 
                    : `${post.body.substring(0, 500)}...`
                  }
                  {post.body.length > 500 && (
                    <Button
                      variant="link"
                      className="p-0 h-auto text-pink-600 hover:text-pink-700 ml-2"
                      onClick={() => setShowFullText(!showFullText)}
                    >
                      {showFullText ? '折りたたむ' : 'もっと見る'}
                    </Button>
                  )}
                </>
              )}
            </div>

            <div className="flex items-center gap-6 py-4 border-t border-gray-100">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLike}
                className={`flex items-center gap-2 ${
                  isLiked 
                    ? 'text-pink-600 hover:text-pink-700' 
                    : 'text-gray-600 hover:text-pink-600'
                }`}
                aria-label={isLiked ? 'いいねを取り消す' : 'いいね'}
                aria-pressed={isLiked}
              >
                <Heart className={`h-5 w-5 ${isLiked ? 'fill-current' : ''}`} />
                <span className="font-medium">{formatNumber(likeCount)}</span>
                {isLiked && (
                  <span className="text-xs animate-bounce">+1</span>
                )}
              </Button>
              <div className="flex items-center gap-2 text-gray-600">
                <MessageCircle className="h-5 w-5" />
                <span className="font-medium">{formatNumber(comments.length)}</span>
              </div>
              {post.points && (
                <div className="text-sm font-medium text-orange-600">
                  {formatNumber(post.points)}pt
                </div>
              )}
            </div>

            <div className="border-t border-gray-100 pt-4">
              <h4 className="font-semibold text-gray-900 mb-4">
                コメント ({formatNumber(comments.length)})
              </h4>

              {currentUser && !isAnonymous ? (
                <div className="mb-6">
                  <div className="flex gap-3">
                    <div className="w-8 h-8 bg-gradient-to-br from-pink-100 to-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-pink-600 font-semibold text-sm">
                        {currentUser.display_name?.charAt(0) || '?'}
                      </span>
                    </div>
                    <div className="flex-1 space-y-2">
                      <Textarea
                        placeholder="コメントを入力..."
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        className="border-pink-200 focus:border-pink-400 min-h-[80px] resize-none"
                        rows={3}
                        aria-label="コメント入力"
                      />
                      <div className="flex justify-between items-center">
                        <p className="text-xs text-gray-500">
                          {newComment.length}/1000文字
                        </p>
                        <Button 
                          onClick={handleAddComment}
                          size="sm"
                          className="bg-pink-600 hover:bg-pink-700 text-white"
                          disabled={!newComment.trim() || newComment.length > 1000}
                        >
                          <Send className="h-4 w-4 mr-1" />
                          送信
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-6 bg-gray-50 rounded-lg mb-6">
                  <p className="text-sm text-gray-500 mb-3">
                    コメントするにはログインが必要です
                  </p>
                  <Button 
                    size="sm"
                    className="bg-gradient-to-r from-pink-500 to-orange-400 hover:from-pink-600 hover:to-orange-500 text-white"
                    onClick={() => window.location.href = '/login'}
                  >
                    ログイン
                  </Button>
                </div>
              )}

              <div className="space-y-4">
                {comments.length === 0 ? (
                  <div className="text-center py-8">
                    <MessageCircle className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500">最初のコメントを書きましょう</p>
                  </div>
                ) : (
                  comments.map((comment) => (
                    <div key={comment.id} className="flex gap-3 p-3 hover:bg-gray-50 rounded-lg transition-colors">
                      <div className="w-8 h-8 bg-gradient-to-br from-pink-100 to-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-pink-600 font-semibold text-sm">
                          {comment.user?.display_name?.charAt(0) || '?'}
                        </span>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-semibold text-sm">
                            {comment.user?.display_name || '不明なユーザー'}
                          </span>
                          <span className="text-xs text-gray-500">
                            {getRelativeTime(comment.created_at)}
                          </span>
                        </div>
                        <p className="text-sm text-gray-700 leading-relaxed">
                          {comment.body}
                        </p>
                        <div className="flex items-center gap-3 mt-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-xs text-gray-500 hover:text-pink-600 p-0 h-auto"
                          >
                            返信
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-xs text-gray-500 hover:text-pink-600 p-0 h-auto"
                          >
                            <Heart className="h-3 w-3 mr-1" />
                            {Math.floor(Math.random() * 5)}
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
                
                {comments.length > 0 && (
                  <div className="text-center py-4">
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-pink-200 text-pink-600 hover:bg-pink-50"
                    >
                      さらに表示
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PostDetailModal;
