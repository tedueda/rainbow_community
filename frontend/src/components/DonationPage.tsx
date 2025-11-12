import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Target, Users, Search, Filter, Clock, Star, Plus, Minus, Upload, Home } from 'lucide-react';

interface Project {
  id: number;
  title: string;
  description: string;
  goal_amount: number;
  current_amount: number;
  deadline: string;
  image_url: string;
  creator_name: string;
  category: string;
  supporters_count: number;
}

const DonationPage: React.FC = () => {
  console.log('=== DonationPage FULL VERSION component loaded successfully ===');
  console.log('Component render time:', new Date().toISOString());
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('new');
  const [showSupportModal, setShowSupportModal] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [showProjectDetail, setShowProjectDetail] = useState(false);
  const [showCreateProject, setShowCreateProject] = useState(false);
  const [newProject, setNewProject] = useState({
    title: '',
    description: '',
    goal_amount: '',
    deadline: '',
    category: 'アート',
    image: null as File | null
  });
  const [rewards, setRewards] = useState([
    { amount: '', description: '' }
  ]);

  // 支援ボタンクリック
  const handleSupport = (project: Project) => {
    console.log('支援ボタンクリック:', project.title);
    setSelectedProject(project);
    setShowSupportModal(true);
  };

  // 詳細ボタンクリック
  const handleDetail = (project: Project) => {
    console.log('詳細ボタンクリック:', project.title);
    setSelectedProject(project);
    setShowProjectDetail(true);
  };

  // プロジェクト作成ボタンクリック
  const handleCreateProject = () => {
    console.log('プロジェクト作成ボタンクリック');
    setShowCreateProject(true);
  };

  // プロジェクト作成フォーム送信
  const handleSubmitProject = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('新規プロジェクト作成:', newProject);
    
    // バリデーション
    if (!newProject.title || !newProject.description || !newProject.goal_amount || !newProject.deadline) {
      alert('すべての項目を入力してください。');
      return;
    }

    // 成功メッセージ
    alert(`プロジェクト「${newProject.title}」を作成しました！`);
    
    // フォームリセット
    setNewProject({
      title: '',
      description: '',
      goal_amount: '',
      deadline: '',
      category: 'アート',
      image: null
    });
    setRewards([{ amount: '', description: '' }]);
    setShowCreateProject(false);
  };

  // フォーム入力変更
  const handleProjectInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setNewProject(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // 画像アップロード
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setNewProject(prev => ({
        ...prev,
        image: file
      }));
    }
  };

  // リワード追加
  const addReward = () => {
    setRewards(prev => [...prev, { amount: '', description: '' }]);
  };

  // リワード削除
  const removeReward = (index: number) => {
    if (rewards.length > 1) {
      setRewards(prev => prev.filter((_, i) => i !== index));
    }
  };

  // リワード変更
  const handleRewardChange = (index: number, field: 'amount' | 'description', value: string) => {
    setRewards(prev => prev.map((reward, i) => 
      i === index ? { ...reward, [field]: value } : reward
    ));
  };

  // モックプロジェクトデータ
  const projects: Project[] = [
    {
      id: 1,
      title: "LGBTQアートギャラリー開設プロジェクト",
      description: "多様性を表現するアート作品を展示するギャラリーを大阪に開設します。",
      goal_amount: 500000,
      current_amount: 320000,
      deadline: "2024-12-31",
      image_url: "/images/hero-slide-1.jpg",
      creator_name: "田中アート",
      category: "アート",
      supporters_count: 45
    },
    {
      id: 2,
      title: "レインボー教育プログラム",
      description: "学校でのLGBTQ理解促進のための教育プログラムを開発します。",
      goal_amount: 300000,
      current_amount: 180000,
      deadline: "2024-11-30",
      image_url: "/images/hero-slide-2.jpg",
      creator_name: "教育サポート",
      category: "教育",
      supporters_count: 32
    },
    {
      id: 3,
      title: "バーチャルプライドパレード",
      description: "オンラインでのプライドパレードイベントを開催します。",
      goal_amount: 200000,
      current_amount: 150000,
      deadline: "2024-10-31",
      image_url: "/images/hero-slide-3.jpg",
      creator_name: "プライド実行委員会",
      category: "イベント",
      supporters_count: 28
    }
  ];

  const categories = [
    { key: 'all', label: 'すべて' },
    { key: 'art', label: 'アート' },
    { key: 'education', label: '教育' },
    { key: 'event', label: 'イベント' },
    { key: 'support', label: '支援' },
    { key: 'wedding', label: 'ウェディング' }
  ];

  const calculateProgress = (current: number, goal: number) => {
    return Math.min((current / goal) * 100, 100);
  };

  const formatAmount = (amount: number) => {
    return amount.toLocaleString('ja-JP');
  };

  const getDaysLeft = (deadline: string) => {
    const today = new Date();
    const endDate = new Date(deadline);
    const diffTime = endDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(diffDays, 0);
  };

  const filteredProjects = projects.filter(project => {
    const matchesSearch = project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         project.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || project.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-carat-gray1">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-carat-white py-20">
        <div className="absolute inset-0 bg-carat-gray1/10"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* ホームに戻るボタン */}
          <div className="mb-6">
            <button
              onClick={() => {
                navigate('/');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="flex items-center gap-2 text-carat-gray6 hover:text-carat-black transition-colors"
            >
              <Home className="h-5 w-5" />
              ホームに戻る
            </button>
          </div>

          <div className="text-center">
            <div className="mb-8">
              <div className="flex justify-center mx-auto mb-6">
                <img 
                  src="/images/logo02.png" 
                  alt="Carat Logo" 
                  className="h-20 w-auto"
                />
              </div>
            </div>
            <h1 className="text-5xl md:text-6xl font-bold text-carat-black mb-6 leading-tight">
              募金
            </h1>
            <p className="text-xl md:text-2xl text-carat-gray5 mb-8 max-w-4xl mx-auto leading-relaxed">
              LGBTQ+コミュニティを支援する寄付プラットフォーム
            </p>
          </div>
          <div className="flex flex-wrap justify-center gap-4 text-lg text-carat-gray5">
            <div className="flex items-center">
              <Target className="w-5 h-5 mr-2 text-carat-black" />
              <span>目標達成率 78%</span>
            </div>
            <div className="flex items-center">
              <Users className="w-5 h-5 mr-2 text-carat-black" />
              <span>105名の支援者</span>
            </div>
            <div className="flex items-center">
              <Star className="w-5 h-5 mr-2 text-carat-black" />
              <span>3つの進行中プロジェクト</span>
            </div>
          </div>
        </div>
      </section>

      {/* Search and Filter Section */}
      <section className="py-8 bg-carat-white border-b border-carat-gray2">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            {/* Search Bar */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-carat-gray4 w-5 h-5" />
              <input
                type="text"
                placeholder="プロジェクトを検索..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-carat-gray3 rounded-lg focus:ring-2 focus:ring-carat-black/20 focus:border-transparent"
              />
            </div>

            {/* Category Tabs */}
            <div className="flex flex-wrap gap-2">
              {categories.map((category) => (
                <button
                  key={category.key}
                  onClick={() => setSelectedCategory(category.key)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                    selectedCategory === category.key
                      ? 'bg-carat-black text-carat-white'
                      : 'bg-carat-gray2 text-carat-gray6 hover:bg-carat-gray3'
                  }`}
                >
                  {category.label}
                </button>
              ))}
            </div>

            {/* Sort Options */}
            <div className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-carat-gray4" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="border border-carat-gray3 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-carat-black/20 focus:border-transparent"
                aria-label="並び替え順序"
              >
                <option value="new">新着順</option>
                <option value="popular">人気順</option>
                <option value="progress">達成率順</option>
                <option value="deadline">締切順</option>
              </select>
            </div>
          </div>
        </div>
      </section>

      {/* Projects Grid */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredProjects.map((project) => {
              const progress = calculateProgress(project.current_amount, project.goal_amount);
              const daysLeft = getDaysLeft(project.deadline);

              return (
                <div key={project.id} className="bg-carat-white rounded-2xl shadow-card hover:shadow-lg transition-shadow duration-300 overflow-hidden border border-carat-gray2">
                  {/* Project Image */}
                  <div className="relative h-48 bg-carat-gray2">
                    <img
                      src={project.image_url}
                      alt={project.title}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                    <div className="absolute top-4 left-4 bg-carat-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-sm font-medium text-carat-gray6">
                      {project.category}
                    </div>
                    <div className="absolute top-4 right-4 bg-carat-black/70 text-carat-white px-3 py-1 rounded-full text-sm font-medium">
                      {progress.toFixed(0)}%
                    </div>
                  </div>

                  {/* Project Info */}
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-carat-black mb-2">
                      {project.title}
                    </h3>
                    <p className="text-carat-gray6 mb-4">
                      {project.description}
                    </p>

                    {/* Progress Bar */}
                    <div className="mb-4">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm text-carat-gray5">進捗状況</span>
                        <span className="text-sm font-medium text-carat-black">
                          {formatAmount(project.current_amount)}円 / {formatAmount(project.goal_amount)}円
                        </span>
                      </div>
                      <div className="w-full bg-carat-gray2 rounded-full h-2">
                        <div
                          className="bg-carat-black h-2 rounded-full transition-all duration-300"
                          style={{ width: `${progress}%` }}
                        ></div>
                      </div>
                    </div>

                    {/* Project Stats */}
                    <div className="flex justify-between items-center mb-4 text-sm text-carat-gray5">
                      <div className="flex items-center">
                        <Users className="w-4 h-4 mr-1" />
                        <span>{project.supporters_count}人の支援者</span>
                      </div>
                      <div className="flex items-center">
                        <Clock className="w-4 h-4 mr-1" />
                        <span>残り{daysLeft}日</span>
                      </div>
                    </div>

                    {/* Creator Info */}
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center">
                        <div className="w-8 h-8 bg-carat-black rounded-full flex items-center justify-center text-carat-white text-sm font-bold">
                          {project.creator_name.charAt(0)}
                        </div>
                        <span className="ml-2 text-sm text-carat-gray5">{project.creator_name}</span>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2">
                      <button 
                        onClick={() => handleSupport(project)}
                        className="flex-1 bg-carat-black text-carat-white py-3 px-4 rounded-lg font-semibold hover:bg-carat-gray6 transition-all duration-300"
                      >
                        支援する
                      </button>
                      <button 
                        onClick={() => handleDetail(project)}
                        className="px-4 py-3 border border-carat-gray3 text-carat-gray6 rounded-lg hover:bg-carat-gray1 transition-colors"
                      >
                        詳細
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {filteredProjects.length === 0 && (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-carat-gray2 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="w-8 h-8 text-carat-gray4" />
              </div>
              <h3 className="text-lg font-semibold text-carat-black mb-2">プロジェクトが見つかりません</h3>
              <p className="text-carat-gray5">検索条件を変更してお試しください。</p>
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-carat-gray1">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-carat-black mb-6">
            あなたもプロジェクトを始めませんか？
          </h2>
          <p className="text-lg text-carat-gray5 mb-8 max-w-2xl mx-auto">
            プレミアム会員なら、LGBTQ+コミュニティのためのプロジェクトを立ち上げることができます。
          </p>
          <button 
            onClick={handleCreateProject}
            className="bg-carat-black text-carat-white px-8 py-4 rounded-full text-lg font-semibold hover:bg-carat-gray6 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
          >
            プロジェクトを作成
          </button>
        </div>
      </section>

      {/* Support Modal */}
      {showSupportModal && selectedProject && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[9999] p-4" onClick={() => setShowSupportModal(false)}>
          <div className="bg-white p-8 rounded-2xl max-w-md w-full shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-2xl font-bold text-carat-black mb-4">プロジェクトを支援</h3>
            <p className="text-carat-gray6 mb-6">{selectedProject.title}</p>
            <div className="flex gap-4">
              <button
                onClick={() => {
                  alert(`${selectedProject.title}への支援ありがとうございます！`);
                  setShowSupportModal(false);
                }}
                className="flex-1 bg-carat-black text-carat-white py-3 px-4 rounded-lg font-semibold hover:bg-carat-gray6 transition-colors"
              >
                支援する
              </button>
              <button
                onClick={() => setShowSupportModal(false)}
                className="px-6 py-3 border border-carat-gray3 text-carat-gray6 rounded-lg hover:bg-carat-gray1 transition-colors"
              >
                キャンセル
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Project Detail Modal */}
      {showProjectDetail && selectedProject && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[9999] p-4" onClick={() => setShowProjectDetail(false)}>
          <div className="bg-white p-8 rounded-2xl max-w-2xl w-full max-h-[80vh] overflow-y-auto shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-2xl font-bold text-carat-black mb-4">{selectedProject.title}</h3>
            <p className="text-carat-gray6 mb-4">{selectedProject.description}</p>
            <div className="mb-4">
              <p className="text-sm text-carat-gray5">目標金額: {formatAmount(selectedProject.goal_amount)}円</p>
              <p className="text-sm text-carat-gray5">現在の支援額: {formatAmount(selectedProject.current_amount)}円</p>
              <p className="text-sm text-carat-gray5">支援者数: {selectedProject.supporters_count}人</p>
            </div>
            <button
              onClick={() => setShowProjectDetail(false)}
              className="w-full bg-carat-gray5 text-carat-white py-3 px-4 rounded-lg font-semibold hover:bg-carat-gray6 transition-colors"
            >
              閉じる
            </button>
          </div>
        </div>
      )}

      {/* Create Project Modal */}
      {showCreateProject && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[9999] p-4" onClick={() => setShowCreateProject(false)}>
          <div className="bg-white p-8 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-2xl font-bold text-gray-900 mb-6">新しいプロジェクトを作成</h3>
            
            <form onSubmit={handleSubmitProject} className="space-y-6">
              {/* メイン画像アップロード */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  メイン画像 *
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-orange-400 transition-colors relative">
                  {newProject.image ? (
                    <div className="space-y-2">
                      <img 
                        src={URL.createObjectURL(newProject.image)} 
                        alt="プレビュー" 
                        className="mx-auto h-32 w-32 object-cover rounded-lg"
                      />
                      <p className="text-sm text-gray-600">{newProject.image.name}</p>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setNewProject(prev => ({ ...prev, image: null }));
                        }}
                        className="text-red-500 text-sm hover:text-red-700 relative z-10"
                      >
                        削除
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <Upload className="mx-auto h-12 w-12 text-gray-400" />
                      <p className="text-gray-600">画像をアップロードしてください</p>
                      <p className="text-xs text-gray-500">JPG, PNG, GIF (最大5MB)</p>
                    </div>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-0"
                    required
                  />
                </div>
              </div>

              {/* プロジェクトタイトル */}
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                  プロジェクトタイトル *
                </label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={newProject.title}
                  onChange={handleProjectInputChange}
                  placeholder="例: LGBTQアートギャラリー開設プロジェクト"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  required
                />
              </div>

              {/* カテゴリー */}
              <div>
                <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
                  カテゴリー
                </label>
                <select
                  id="category"
                  name="category"
                  value={newProject.category}
                  onChange={handleProjectInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                >
                  <option value="アート">アート</option>
                  <option value="教育">教育</option>
                  <option value="イベント">イベント</option>
                  <option value="支援">支援</option>
                  <option value="ウェディング">ウェディング</option>
                </select>
              </div>

              {/* プロジェクト説明 */}
              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                  プロジェクト説明 *
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={newProject.description}
                  onChange={handleProjectInputChange}
                  placeholder="プロジェクトの詳細な説明を入力してください..."
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  required
                />
              </div>

              {/* 目標金額 */}
              <div>
                <label htmlFor="goal_amount" className="block text-sm font-medium text-gray-700 mb-2">
                  目標金額 *
                </label>
                <div className="relative">
                  <input
                    type="number"
                    id="goal_amount"
                    name="goal_amount"
                    value={newProject.goal_amount}
                    onChange={handleProjectInputChange}
                    placeholder="500000"
                    min="1000"
                    className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    required
                  />
                  <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500">円</span>
                </div>
              </div>

              {/* 締切日 */}
              <div>
                <label htmlFor="deadline" className="block text-sm font-medium text-gray-700 mb-2">
                  締切日 *
                </label>
                <input
                  type="date"
                  id="deadline"
                  name="deadline"
                  value={newProject.deadline}
                  onChange={handleProjectInputChange}
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  required
                />
              </div>

              {/* リワード設定 */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <label className="block text-sm font-medium text-gray-700">
                    リターン（見返り）設定 *
                  </label>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      e.preventDefault();
                      addReward();
                    }}
                    className="flex items-center gap-1 text-orange-600 hover:text-orange-700 text-sm font-medium relative z-20"
                  >
                    <Plus className="w-4 h-4" />
                    追加
                  </button>
                </div>
                
                <div className="space-y-4">
                  {rewards.map((reward, index) => (
                    <div key={index} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="text-sm font-medium text-gray-700">リターン {index + 1}</h4>
                        {rewards.length > 1 && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              e.preventDefault();
                              removeReward(index);
                            }}
                            className="text-red-500 hover:text-red-700 relative z-20"
                          >
                            <Minus className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-xs text-gray-600 mb-1">支援金額</label>
                          <div className="relative">
                            <input
                              type="number"
                              value={reward.amount}
                              onChange={(e) => handleRewardChange(index, 'amount', e.target.value)}
                              placeholder="1000"
                              min="100"
                              className="w-full px-3 py-2 pr-8 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm"
                              required
                            />
                            <span className="absolute right-2 top-1/2 transform -translate-y-1/2 text-xs text-gray-500">円</span>
                          </div>
                        </div>
                        
                        <div className="md:col-span-2">
                          <label className="block text-xs text-gray-600 mb-1">リターン内容</label>
                          <textarea
                            value={reward.description}
                            onChange={(e) => handleRewardChange(index, 'description', e.target.value)}
                            placeholder="例: お礼メール + 限定ステッカー"
                            rows={2}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm"
                            required
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* ボタン */}
              <div className="flex gap-4 pt-4">
                <button
                  type="submit"
                  className="flex-1 bg-gradient-to-r from-orange-500 to-pink-600 text-white py-3 px-4 rounded-lg font-semibold hover:from-orange-600 hover:to-pink-700 transition-all duration-300"
                >
                  プロジェクトを作成
                </button>
                <button
                  type="button"
                  onClick={() => setShowCreateProject(false)}
                  className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  キャンセル
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default DonationPage;
