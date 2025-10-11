import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PlusCircle, Music, Palette, MessageSquare, Store, MapPin, Film, Upload, X } from 'lucide-react';

const CreatePost: React.FC = () => {
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [visibility, setVisibility] = useState('public');
  const [category, setCategory] = useState('board');
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [images, setImages] = useState<File[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  const { token } = useAuth();
  const navigate = useNavigate();
  const { categoryKey } = useParams();

  const API_URL = (import.meta as any).env.VITE_API_URL || 'http://localhost:8000';

  const categories = [
    { key: 'board', name: '掲示板', icon: MessageSquare, description: '質問、相談、雑談など' },
    { key: 'art', name: 'アート', icon: Palette, description: '作品、創作活動の共有' },
    { key: 'music', name: '音楽', icon: Music, description: 'YouTube動画、音楽の共有' },
    { key: 'shops', name: 'お店', icon: Store, description: 'おすすめのお店情報' },
    { key: 'tours', name: 'ツアー', icon: MapPin, description: '旅行、観光スポット' },
    { key: 'comics', name: 'コミック・映画', icon: Film, description: 'エンタメ作品のレビュー' }
  ];

  useEffect(() => {
    if (categoryKey) {
      const validCategory = categories.find(cat => cat.key === categoryKey);
      if (validCategory) {
        setCategory(categoryKey);
      }
    }
  }, [categoryKey]);

  const extractYouTubeVideoId = (url: string): string | null => {
    const patterns = [
      /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
      /youtube\.com\/watch\?.*v=([^&\n?#]+)/
    ];
    
    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match) return match[1];
    }
    return null;
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const newImages = [...images, ...files].slice(0, 5);
    setImages(newImages);
  };

  const removeImage = (index: number) => {
    const newImages = images.filter((_, i) => i !== index);
    setImages(newImages);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    if (!body.trim()) {
      setError('投稿内容は必須です');
      setIsLoading(false);
      return;
    }

    if (category === 'music' && youtubeUrl && !extractYouTubeVideoId(youtubeUrl)) {
      setError('有効なYouTube URLを入力してください');
      setIsLoading(false);
      return;
    }

    if (images.length > 5) {
      setError('画像は5枚まで選択できます');
      setIsLoading(false);
      return;
    }

    for (const image of images) {
      if (image.size > 10 * 1024 * 1024) {
        setError('画像ファイルは10MB以下にしてください');
        setIsLoading(false);
        return;
      }
      if (!image.type.startsWith('image/')) {
        setError('画像ファイルのみアップロード可能です');
        setIsLoading(false);
        return;
      }
    }

    try {
      const mediaIds: number[] = [];
      
      for (const image of images) {
        const imageFormData = new FormData();
        imageFormData.append('file', image);
        
        const uploadResponse = await fetch(`${API_URL}/api/media/upload`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
          body: imageFormData,
        });
        
        if (uploadResponse.ok) {
          const uploadResult = await uploadResponse.json();
          mediaIds.push(uploadResult.id);
        } else {
          const errText = await uploadResponse.text().catch(() => '');
          console.error('Image upload failed', uploadResponse.status, errText);
          setError(`画像アップロードに失敗しました (status ${uploadResponse.status})`);
          setIsLoading(false);
          return;
        }
      }

      const response = await fetch(`${API_URL}/api/posts`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: title.trim() || null,
          body: `${body.trim()}${category === 'music' && youtubeUrl ? `\n\nYouTube: ${youtubeUrl}` : ''} #${category}`,
          visibility,
          youtube_url: youtubeUrl || null,
          media_ids: mediaIds.length > 0 ? mediaIds : null,
        }),
      });

      if (response.ok) {
        navigate('/feed');
      } else {
        const errorData = await response.json();
        setError(errorData.detail || '投稿の作成に失敗しました');
      }
    } catch (error) {
      console.error('Error creating post:', error);
      setError('投稿の作成に失敗しました。もう一度お試しください。');
    } finally {
      setIsLoading(false);
    }
  };

  const selectedCategory = categories.find(cat => cat.key === category);
  const CategoryIcon = selectedCategory?.icon || PlusCircle;

  return (
    <div className="max-w-2xl mx-auto p-4 sm:p-6">
      <Card className="border-orange-200 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center text-xl sm:text-2xl text-orange-800">
            <CategoryIcon className="h-5 w-5 sm:h-6 sm:w-6 mr-2" />
            {selectedCategory ? `${selectedCategory.name}に投稿` : '新しい投稿を作成'}
          </CardTitle>
          {selectedCategory && (
            <p className="text-sm text-gray-600 mt-1">{selectedCategory.description}</p>
          )}
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {!categoryKey && (
              <div className="space-y-2">
                <Label htmlFor="category" className="text-gray-700">カテゴリー</Label>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger className="border-orange-200 focus:border-orange-400 focus:ring-orange-400">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => {
                      const Icon = cat.icon;
                      return (
                        <SelectItem key={cat.key} value={cat.key}>
                          <div className="flex items-center">
                            <Icon className="h-4 w-4 mr-2" />
                            {cat.name} - {cat.description}
                          </div>
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="title" className="text-gray-700">タイトル（任意）</Label>
              <Input
                id="title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="投稿にタイトルをつけてください..."
                className="border-orange-200 focus:border-orange-400 focus:ring-orange-400"
              />
            </div>

            {(category === 'board' || category === 'tours' || category === 'shops' || category === 'comics') && (
              <div className="space-y-2">
                <Label className="text-gray-700">画像をアップロード（最大5枚、任意）</Label>
                <div className="border-2 border-dashed border-orange-200 rounded-lg p-6 hover:border-orange-300 transition-colors">
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
                    <Upload className="h-10 w-10 text-orange-400 mb-3" />
                    <span className="text-sm font-medium text-gray-700 mb-1">
                      クリックして画像を選択
                    </span>
                    <span className="text-xs text-gray-500">
                      PNG, JPG, GIF (最大10MB、5枚まで)
                    </span>
                  </label>
                </div>
                {images.length > 0 && (
                  <div className="grid grid-cols-3 gap-3 mt-4">
                    {images.map((file, index) => (
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
              </div>
            )}

            {category === 'music' && (
              <div className="space-y-2">
                <Label htmlFor="youtube" className="text-gray-700">YouTube URL（任意）</Label>
                <Input
                  id="youtube"
                  type="url"
                  value={youtubeUrl}
                  onChange={(e) => setYoutubeUrl(e.target.value)}
                  placeholder="https://www.youtube.com/watch?v=..."
                  className="border-orange-200 focus:border-orange-400 focus:ring-orange-400"
                />
                {youtubeUrl && extractYouTubeVideoId(youtubeUrl) && (
                  <div className="mt-2">
                    <p className="text-sm text-gray-600 mb-2">プレビュー:</p>
                    <div className="aspect-video">
                      <iframe
                        src={`https://www.youtube.com/embed/${extractYouTubeVideoId(youtubeUrl)}`}
                        title="YouTube video preview"
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        className="w-full h-full rounded"
                      ></iframe>
                    </div>
                  </div>
                )}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="body" className="text-gray-700">内容 *</Label>
              <Textarea
                id="body"
                value={body}
                onChange={(e) => setBody(e.target.value)}
                placeholder={
                  category === 'board' ? 'あなたの質問、相談、想いを共有してください...' :
                  category === 'art' ? 'あなたの作品や創作活動について教えてください...' :
                  category === 'music' ? '音楽について、おすすめの楽曲やアーティストを教えてください...' :
                  category === 'shops' ? 'おすすめのお店やサービスを教えてください...' :
                  category === 'tours' ? '旅行先や観光スポットの情報を共有してください...' :
                  category === 'comics' ? '本、映画、ドラマ、コミックのレビューを書いてください...' :
                  'あなたの想い、体験、質問などを共有してください...'
                }
                required
                rows={6}
                className="border-orange-200 focus:border-orange-400 focus:ring-orange-400 resize-none"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="visibility" className="text-gray-700">この投稿を見ることができる人</Label>
              <Select value={visibility} onValueChange={setVisibility}>
                <SelectTrigger className="border-orange-200 focus:border-orange-400 focus:ring-orange-400">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="public">🌍 公開 - 誰でも見ることができます</SelectItem>
                  <SelectItem value="members">👥 メンバーのみ - 登録ユーザーのみ</SelectItem>
                  <SelectItem value="followers">👤 フォロワー - あなたをフォローしている人</SelectItem>
                  <SelectItem value="private">🔒 非公開 - あなたのみ</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {error && (
              <div className="text-red-600 text-sm bg-red-50 p-3 rounded-md">
                {error}
              </div>
            )}

            <div className="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-4">
              <Button 
                type="submit" 
                className="w-full sm:w-auto bg-gradient-to-r from-orange-500 to-pink-400 hover:from-orange-600 hover:to-pink-500 text-white"
                disabled={isLoading}
              >
                {isLoading ? '公開中...' : '投稿を公開'}
              </Button>
              <Button 
                type="button" 
                variant="outline"
                onClick={() => navigate('/feed')}
                className="w-full sm:w-auto border-orange-300 text-orange-700 hover:bg-orange-50"
              >
                キャンセル
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default CreatePost;
