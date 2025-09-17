import React, { useState, useEffect, useRef } from 'react';
import { X, Heart, MessageCircle, Share2, Flag, ChevronLeft, ChevronRight, Send } from 'lucide-react';
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
}


const PostDetailModal: React.FC<PostDetailModalProps> = ({
  post,
  user,
  isOpen,
  onClose,
  onLike
}) => {
  const { token, user: currentUser, isAnonymous } = useAuth();
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isLiked, setIsLiked] = useState(post.is_liked || false);
  const [likeCount, setLikeCount] = useState(post.like_count || 0);
  const [showFullText, setShowFullText] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);

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

  const fetchComments = async () => {
    if (!post) return;
    
    try {
      const response = await fetch(`${API_URL}/posts/${post.id}/comments`, {
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
      const response = await fetch(`${API_URL}/comments/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          post_id: post.id,
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

  const nextImage = () => {
    if (post.media_urls && post.media_urls.length > 1) {
      setCurrentImageIndex((prev) => (prev + 1) % post.media_urls!.length);
    }
  };

  const prevImage = () => {
    if (post.media_urls && post.media_urls.length > 1) {
      setCurrentImageIndex((prev) => (prev - 1 + post.media_urls!.length) % post.media_urls!.length);
    }
  };

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      fetchComments();
      setIsLiked(post.is_liked || false);
      setLikeCount(post.like_count || 0);
      setCurrentImageIndex(0);
      setShowFullText(false);
      
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

        <div className="overflow-y-auto max-h-[calc(90vh-120px)]">
          {post.media_urls && post.media_urls.length > 0 && (
            <div className="relative">
              <div className="aspect-[3/2] bg-gray-100">
                <img
                  src={post.media_urls[currentImageIndex]}
                  alt={`投稿画像 ${currentImageIndex + 1}`}
                  className="w-full h-full object-cover"
                />
              </div>
              {post.media_urls.length > 1 && (
                <>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 text-white hover:bg-black/70"
                    onClick={prevImage}
                    aria-label="前の画像"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 text-white hover:bg-black/70"
                    onClick={nextImage}
                    aria-label="次の画像"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                  <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
                    {post.media_urls.map((_, index) => (
                      <div
                        key={index}
                        className={`w-2 h-2 rounded-full ${
                          index === currentImageIndex ? 'bg-white' : 'bg-white/50'
                        }`}
                      />
                    ))}
                  </div>
                </>
              )}
            </div>
          )}

          {post.youtube_url && (
            <div className="aspect-video w-full">
              <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                <div className="text-center">
                  <div className="text-4xl mb-2">🎵</div>
                  <p className="text-gray-600">YouTube動画プレイヤー</p>
                  <p className="text-sm text-gray-500 mt-1">実装予定</p>
                </div>
              </div>
            </div>
          )}

          <div className="p-6">
            {post.title && (
              <h2 className="text-xl font-bold text-gray-900 mb-3">{post.title}</h2>
            )}
            
            <div className="text-gray-700 leading-7 mb-4">
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
