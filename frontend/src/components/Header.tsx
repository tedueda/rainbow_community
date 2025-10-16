import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Heart, User, PlusCircle, LogIn, LogOut, Lock } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const Header: React.FC = () => {
  const navigate = useNavigate();
  const { user, isAnonymous, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="bg-white shadow-sm border-b border-pink-100">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link to="/feed" className="flex items-center space-x-2">
            <Heart className="h-8 w-8 text-pink-500" />
            <span className="text-xl sm:text-2xl font-bold text-pink-800">Carat</span>
          </Link>

          <div className="flex items-center space-x-2 sm:space-x-4">
            <Link to="/feed">
              <Button variant="ghost" className="text-pink-700 hover:text-pink-900 hover:bg-pink-50 text-sm sm:text-base">
                フィード
              </Button>
            </Link>
            <Link to="/create">
              <Button variant="ghost" className="text-green-700 hover:text-green-900 hover:bg-green-50 text-sm sm:text-base">
                <PlusCircle className="h-4 w-4 mr-1 sm:mr-2" />
                投稿
              </Button>
            </Link>
            <Link to="/blog">
              <Button variant="ghost" className="text-purple-700 hover:text-purple-900 hover:bg-purple-50 text-sm sm:text-base">
                ブログ
              </Button>
            </Link>
            <Link to="/matching">
              <Button variant="ghost" className="text-gray-700 hover:text-gray-900 hover:bg-gray-50 text-sm sm:text-base">
                <Lock className="h-4 w-4 mr-1 sm:mr-2" />
                マッチング <span className="ml-1 text-[10px] sm:text-xs text-pink-600 font-semibold">Premium</span>
              </Button>
            </Link>
            <Link to="/profile">
              <Button variant="ghost" className="text-orange-700 hover:text-orange-900 hover:bg-orange-50 text-sm sm:text-base">
                <User className="h-4 w-4 mr-1 sm:mr-2" />
                プロフィール
              </Button>
            </Link>

            {/* Auth controls */}
            {isAnonymous || !user ? (
              <Link to="/login">
                <Button className="bg-gradient-to-r from-pink-500 to-orange-400 hover:from-pink-600 hover:to-orange-500 text-white text-sm sm:text-base">
                  <LogIn className="h-4 w-4 mr-1 sm:mr-2" />
                  ログイン
                </Button>
              </Link>
            ) : (
              <div className="flex items-center gap-2">
                <span className="hidden sm:inline text-sm text-gray-600">{user.display_name}</span>
                <Button variant="outline" onClick={handleLogout} className="border-pink-300 text-pink-700 hover:bg-pink-50 text-sm sm:text-base">
                  <LogOut className="h-4 w-4 mr-1 sm:mr-2" />
                  ログアウト
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
