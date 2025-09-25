import React, { useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader } from './ui/card';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { X, Upload, Youtube, Tag, AlertCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { Post } from '../types/Post';

interface NewPostFormProps {
  categoryKey: string;
  onPostCreated: (post: Post) => void;
  onCancel: () => void;
}

const categories = {
  board: { title: "掲示板", emoji: "💬", desc: "悩み相談や雑談、生活の話題" },
  art: { title: "アート", emoji: "🎨", desc: "イラスト・写真・映像作品の発表" },
  music: { title: "音楽", emoji: "🎵", desc: "お気に入りや自作・AI曲の共有" },
  shops: { title: "お店", emoji: "🏬", desc: "LGBTQフレンドリーなお店紹介" },
  tours: { title: "ツアー", emoji: "📍", desc: "会員ガイドの交流型ツアー" },
  comics: { title: "コミック・映画", emoji: "🎬", desc: "LGBTQ+テーマの作品レビューと感想" },
};

const NewPostForm: React.FC<NewPostFormProps> = ({
  categoryKey,
  onPostCreated,
  onCancel,
}) => {
  const { token } = useAuth();
  const [formData, setFormData] = useState({
    title: '',
    body: '',
    tags: '',
    images: [] as File[],
    youtubeUrl: '',
  });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStartTime, setSubmitStartTime] = useState<number | null>(null);

  const API_URL = (import.meta as any).env.VITE_API_URL || 'http://localhost:8000';
  const category = categories[categoryKey as keyof typeof categories];

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setFormData({ ...formData, images: [...formData.images, ...files] });
  };

  const removeImage = (index: number) => {
    const newImages = formData.images.filter((_, i) => i !== index);
    setFormData({ ...formData, images: newImages });
  };

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.body.trim()) {
      newErrors.body = '投稿内容は必須です';
    } else if (formData.body.length > 2000) {
      newErrors.body = '投稿内容は2000文字以内で入力してください';
    }

    if (formData.title && formData.title.length > 80) {
      newErrors.title = 'タイトルは80文字以内で入力してください';
    }

    if (categoryKey === 'music' && formData.youtubeUrl) {
      const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com\/watch\?v=|youtu\.be\/)[\w-]+/;
      if (!youtubeRegex.test(formData.youtubeUrl)) {
        newErrors.youtubeUrl = '有効なYouTube URLを入力してください';
      }
    }

    if ((categoryKey === 'art' || categoryKey === 'shops' || categoryKey === 'comics') && formData.images.length > 0) {
      if (formData.images.length > 5) {
        newErrors.images = '画像は5枚まで選択できます';
      } else {
        for (const image of formData.images) {
          if (image.size > 10 * 1024 * 1024) {
            newErrors.images = '画像ファイルは10MB以下にしてください';
            break;
          }
          if (!image.type.startsWith('image/')) {
            newErrors.images = '画像ファイルのみアップロード可能です';
            break;
          }
        }
      }
    }

    if (submitStartTime && Date.now() - submitStartTime < 3000) {
      newErrors.spam = '投稿が早すぎます。少し待ってから再度お試しください。';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!submitStartTime) {
      setSubmitStartTime(Date.now());
    }
    
    if (!validateForm()) return;

    setIsSubmitting(true);
    
    try {
      console.debug('[NewPostForm] submit start', { categoryKey, API_URL, hasToken: !!token });
      let mediaId: number | null = null;
      let uploadResult: any = null;
      
      if (formData.images.length > 0) {
        const imageFormData = new FormData();
        imageFormData.append('file', formData.images[0]);
        
        const uploadResponse = await fetch(`${API_URL}/api/media/upload`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
          body: imageFormData,
        });
        
        if (uploadResponse.ok) {
          uploadResult = await uploadResponse.json();
          mediaId = uploadResult.id;
        } else {
          const errText = await uploadResponse.text().catch(() => '');
          console.error('[NewPostForm] Image upload failed', uploadResponse.status, errText);
          setErrors({ submit: `画像アップロードに失敗しました (status ${uploadResponse.status})` });
          return;
        }
      }

      const postData = {
        title: formData.title || null,
        body: `${formData.body} #${categoryKey}`,
        visibility: 'public',
        youtube_url: formData.youtubeUrl || null,
        media_id: mediaId,
      };

      const response = await fetch(`${API_URL}/api/posts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(postData),
      });

      if (response.ok) {
        const newPost = await response.json();
        const enhancedPost: Post = {
          ...newPost,
          media_url: uploadResult?.url || undefined,
          youtube_url: formData.youtubeUrl || undefined,
          like_count: 0,
          comment_count: 0,
          points: 10,
          is_liked: false,
          tags: formData.tags ? formData.tags.split(',').map(tag => tag.trim()) : [],
        };
        
        onPostCreated(enhancedPost);
        
        setFormData({
          title: '',
          body: '',
          tags: '',
          images: [],
          youtubeUrl: '',
        });
        setSubmitStartTime(null);
      } else {
        let errorDetail = '';
        try {
          const errorData = await response.json();
          errorDetail = errorData?.detail || '';
        } catch (_e) {
          errorDetail = await response.text().catch(() => '');
        }
        console.error('[NewPostForm] Create post failed', response.status, errorDetail);
        setErrors({ submit: errorDetail || `投稿の作成に失敗しました (status ${response.status})` });
      }
    } catch (error) {
      console.error('Error creating post:', error);
      setErrors({ submit: '投稿の作成に失敗しました' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="border-pink-200 shadow-lg">
      <CardHeader className="bg-gradient-to-r from-pink-50 to-orange-50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="text-2xl">{category?.emoji}</div>
            <div>
              <h3 className="text-lg font-semibold text-pink-800">
                {category?.title}に投稿
              </h3>
              <p className="text-sm text-gray-600">{category?.desc}</p>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={onCancel} aria-label="閉じる">
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              タイトル（任意）
            </label>
            <Input
              placeholder="投稿のタイトルを入力..."
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="border-pink-200 focus:border-pink-400"
              maxLength={80}
            />
            <div className="flex justify-between items-center mt-1">
              {errors.title && (
                <p className="text-sm text-red-600 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {errors.title}
                </p>
              )}
              <p className="text-xs text-gray-500 ml-auto">
                {formData.title.length}/80文字
              </p>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              投稿内容 <span className="text-red-500">*</span>
            </label>
            <Textarea
              placeholder="投稿内容を入力してください..."
              value={formData.body}
              onChange={(e) => setFormData({ ...formData, body: e.target.value })}
              className="border-pink-200 focus:border-pink-400 min-h-[120px]"
              required
              maxLength={2000}
            />
            <div className="flex justify-between items-center mt-1">
              {errors.body && (
                <p className="text-sm text-red-600 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {errors.body}
                </p>
              )}
              <p className="text-xs text-gray-500 ml-auto">
                {formData.body.length}/2000文字
              </p>
            </div>
          </div>

          {(categoryKey === 'art' || categoryKey === 'shops' || categoryKey === 'comics') && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                画像をアップロード（最大5枚）
              </label>
              <div className="border-2 border-dashed border-pink-200 rounded-lg p-6 hover:border-pink-300 transition-colors">
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                  id="image-upload"
                />
                <label
                  htmlFor="image-upload"
                  className="cursor-pointer flex flex-col items-center justify-center"
                >
                  <Upload className="h-10 w-10 text-pink-400 mb-3" />
                  <span className="text-sm font-medium text-gray-700 mb-1">
                    クリックして画像を選択
                  </span>
                  <span className="text-xs text-gray-500">
                    PNG, JPG, GIF (最大10MB、5枚まで)
                  </span>
                </label>
              </div>
              {formData.images.length > 0 && (
                <div className="grid grid-cols-3 gap-3 mt-4">
                  {formData.images.map((file, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={URL.createObjectURL(file)}
                        alt={`アップロード画像 ${index + 1}`}
                        className="w-full h-24 object-cover rounded-lg"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => removeImage(index)}
                        aria-label={`画像${index + 1}を削除`}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                      {index === 0 && (
                        <div className="absolute bottom-1 left-1 bg-black/70 text-white text-xs px-1 rounded">
                          メイン
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
              {errors.images && (
                <p className="text-sm text-red-600 mt-2 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {errors.images}
                </p>
              )}
            </div>
          )}

          {categoryKey === 'music' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                YouTube URL（任意）
              </label>
              <div className="relative">
                <Youtube className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-red-500" />
                <Input
                  placeholder="https://www.youtube.com/watch?v=..."
                  value={formData.youtubeUrl}
                  onChange={(e) => setFormData({ ...formData, youtubeUrl: e.target.value })}
                  className="pl-10 border-pink-200 focus:border-pink-400"
                />
              </div>
              {errors.youtubeUrl && (
                <p className="text-sm text-red-600 mt-1 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {errors.youtubeUrl}
                </p>
              )}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              タグ（任意）
            </label>
            <div className="relative">
              <Tag className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="タグをカンマ区切りで入力（例：悩み相談, 初心者向け）"
                value={formData.tags}
                onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                className="pl-10 border-pink-200 focus:border-pink-400"
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">
              タグを付けることで、同じ興味を持つ人に見つけてもらいやすくなります
            </p>
          </div>

          {(errors.submit || errors.spam) && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-red-500" />
                <p className="text-sm text-red-600">
                  {errors.submit || errors.spam}
                </p>
              </div>
            </div>
          )}

          <div className="flex gap-3 pt-4 border-t border-gray-100">
            <Button
              type="submit"
              className="bg-gradient-to-r from-pink-600 to-orange-500 hover:from-pink-700 hover:to-orange-600 text-white flex-1"
              disabled={isSubmitting || !formData.body.trim()}
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  投稿中...
                </>
              ) : (
                '投稿する'
              )}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              className="border-pink-300 text-pink-700 hover:bg-pink-50"
              disabled={isSubmitting}
            >
              キャンセル
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default NewPostForm;
