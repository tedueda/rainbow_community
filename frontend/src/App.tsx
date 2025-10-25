import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Header from './components/Header';
import CategoryNavigation from './components/CategoryNavigation';
import LoginForm from './components/LoginForm';
import RegisterForm from './components/RegisterForm';
import HomePage from './components/HomePage';
import PostFeed from './components/PostFeed';
import ProfilePage from './components/ProfilePage';
import CreatePost from './components/CreatePost';
import CategoryPage from './components/CategoryPage';
import BlogListPage from './components/BlogListPage';
import BlogDetailPage from './components/BlogDetailPage';
import NewsPage from './components/NewsPage';
import PremiumGate from './components/matching/PremiumGate';
import MatchingLayout from './components/matching/MatchingLayout';
import MatchingSearchPage from './components/matching/MatchingSearchPage';
import MatchingMatchesPage from './components/matching/MatchingMatchesPage';
import MatchingChatsPage from './components/matching/MatchingChatsPage';
import MatchingProfilePage from './components/matching/MatchingProfilePage';
import MatchingChatDetailPage from './components/matching/MatchingChatDetailPage';


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
      <CategoryNavigation />
      <main className="pride-gradient">
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
          {/* 新カテゴリールート（slug ベース） */}
          <Route path="/category/:categorySlug/:subcategorySlug" element={
            <FeedRoute>
              <CategoryPage />
            </FeedRoute>
          } />
          {/* Member benefits routes disabled - under construction
          <Route path="/matching" element={
            <FeedRoute>
              <MatchingPage />
            </FeedRoute>
          } />
          <Route path="/virtual-wedding" element={
            <FeedRoute>
              <VirtualWeddingPage />
            </FeedRoute>
          } />
          <Route path="/donation" element={
            <FeedRoute>
              <DonationPage />
            </FeedRoute>
          } />
          */}
          {/* Matching routes */}
          <Route path="/matching" element={
            <FeedRoute>
              <PremiumGate>
                <MatchingLayout />
              </PremiumGate>
            </FeedRoute>
          }>
            <Route index element={<MatchingSearchPage />} />
            <Route path="matches" element={<MatchingMatchesPage />} />
            <Route path="chats" element={<MatchingChatsPage />} />
            <Route path="chats/:id" element={<MatchingChatDetailPage />} />
            <Route path="profile" element={<MatchingProfilePage />} />
          </Route>
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
      <Router>
        <AppContent />
      </Router>
    </AuthProvider>
  );
}

export default App;
