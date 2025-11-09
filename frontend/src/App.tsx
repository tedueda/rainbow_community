import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Header from './components/Header';
import LoginForm from './components/LoginForm';
import RegisterForm from './components/RegisterForm';
import HomePage from './components/HomePage';
import PostFeed from './components/PostFeed';
import ProfilePage from './components/ProfilePage';
import CreatePost from './components/CreatePost';
import CategoryPage from './components/CategoryPage';
import CategoryPageNew from './components/CategoryPageNew';
import BlogListPage from './components/BlogListPage';
import BlogDetailPage from './components/BlogDetailPage';
import NewsPage from './components/NewsPage';
import PremiumGate from './components/matching/PremiumGate';
import MatchingLayout from './components/matching/MatchingLayout';
import MatchingSearchPage from './components/matching/MatchingSearchPage';
import MatchingLikesPage from './components/matching/MatchingLikesPage';
import MatchingMatchesPage from './components/matching/MatchingMatchesPage';
import MatchingProfilePage from './components/matching/MatchingProfilePage';
import MatchingChatDetailPage from './components/matching/MatchingChatDetailPage';
import MatchingPendingChatPage from './components/matching/MatchingPendingChatPage';
import MatchingChatShell from './components/matching/MatchingChatShell';
import FoodPage from './pages/members/FoodPage';
import BeautyPage from './pages/members/BeautyPage';
import VirtualWeddingPage from './components/VirtualWeddingPage';
import DonationPage from './components/DonationPage';
import MarketplacePage from './pages/members/MarketplacePage';


const FeedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isLoading } = useAuth();
  
  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }
  
  return <>{children}</>;
};

const PublicRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isLoading } = useAuth();
  
  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }
  
  return user ? <Navigate to="/feed" /> : <>{children}</>;
};

function AppContent() {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      <main className="bg-white">
        <Routes>
          <Route path="/login" element={
            <PublicRoute>
              <LoginForm />
            </PublicRoute>
          } />
          <Route path="/register" element={
            <PublicRoute>
              <RegisterForm />
            </PublicRoute>
          } />
          <Route path="/feed" element={
            <FeedRoute>
              <HomePage />
            </FeedRoute>
          } />
          <Route path="/posts" element={
            <FeedRoute>
              <PostFeed />
            </FeedRoute>
          } />
          <Route path="/profile" element={
            <FeedRoute>
              <ProfilePage />
            </FeedRoute>
          } />
          <Route path="/create/:category?" element={
            <FeedRoute>
              <CreatePost />
            </FeedRoute>
          } />
          <Route path="/create/:categoryKey" element={
            <FeedRoute>
              <CreatePost />
            </FeedRoute>
          } />
          {/* 旧カテゴリールート（後方互換性） */}
          <Route path="/category/:categoryKey" element={
            <FeedRoute>
              <CategoryPage />
            </FeedRoute>
          } />
          <Route path="/category/:categoryKey/new" element={
            <FeedRoute>
              <CategoryPage />
            </FeedRoute>
          } />
          {/* 新カテゴリールート（slug ベース） - Phase 1 */}
          <Route path="/category/:categorySlug/:subcategorySlug?" element={
            <FeedRoute>
              <CategoryPageNew />
            </FeedRoute>
          } />
          {/* Matching routes */}
          <Route path="/matching" element={
            <FeedRoute>
              <PremiumGate>
                <MatchingLayout />
              </PremiumGate>
            </FeedRoute>
          }>
            <Route index element={<MatchingSearchPage />} />
            <Route path="likes" element={<MatchingLikesPage />} />
            <Route path="matches" element={<MatchingMatchesPage />} />
            <Route path="chats" element={<MatchingChatShell />}>
              <Route index element={<div className="flex items-center justify-center h-full text-gray-500">左のリストからチャットを選択してください</div>} />
              <Route path=":id" element={<MatchingChatDetailPage />} />
            </Route>
            <Route path="requests/:requestId" element={<MatchingPendingChatPage />} />
            <Route path="profile" element={<MatchingProfilePage />} />
          </Route>
          <Route path="/members/food" element={
            <FeedRoute>
              <FoodPage />
            </FeedRoute>
          } />
          <Route path="/members/beauty" element={
            <FeedRoute>
              <BeautyPage />
            </FeedRoute>
          } />
          <Route path="/live-wedding" element={
            <FeedRoute>
              <VirtualWeddingPage />
            </FeedRoute>
          } />
          <Route path="/funding" element={
            <FeedRoute>
              <DonationPage />
            </FeedRoute>
          } />
          <Route path="/marketplace" element={
            <FeedRoute>
              <MarketplacePage />
            </FeedRoute>
          } />
          <Route path="/news" element={
            <FeedRoute>
              <NewsPage />
            </FeedRoute>
          } />
          <Route path="/blog" element={
            <FeedRoute>
              <BlogListPage />
            </FeedRoute>
          } />
          <Route path="/blog/:slug" element={
            <FeedRoute>
              <BlogDetailPage />
            </FeedRoute>
          } />
          <Route path="/" element={<Navigate to="/feed" />} />
        </Routes>
      </main>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router basename={import.meta.env.BASE_URL}>
        <AppContent />
      </Router>
    </AuthProvider>
  );
}

export default App;
