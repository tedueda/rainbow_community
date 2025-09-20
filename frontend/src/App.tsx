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
// import MatchingPage from './components/MatchingPage';
// import VirtualWeddingPage from './components/VirtualWeddingPage';
// import DonationPage from './components/DonationPage';
import NewsPage from './components/NewsPage';


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
    <div className="min-h-screen bg-gradient-to-b from-rose-50 via-white to-indigo-50">
      <Header />
      <main>
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
          <Route path="/create" element={
            <FeedRoute>
              <CreatePost />
            </FeedRoute>
          } />
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
          <Route path="/news" element={
            <FeedRoute>
              <NewsPage />
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
