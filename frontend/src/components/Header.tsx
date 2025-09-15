import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Heart, User, PlusCircle, LogOut } from 'lucide-react';

const Header: React.FC = () => {
  const { user, isAnonymous, logout, setAnonymousMode } = useAuth();
  const navigate = useNavigate();

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
            <span className="text-xl sm:text-2xl font-bold text-pink-800">Rainbow Community</span>
          </Link>

          {user ? (
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
              <Link to="/profile">
                <Button variant="ghost" className="text-orange-700 hover:text-orange-900 hover:bg-orange-50 text-sm sm:text-base">
                  <User className="h-4 w-4 mr-1 sm:mr-2" />
                  プロフィール
                </Button>
              </Link>
              <Button 
                variant="outline" 
                onClick={handleLogout}
                className="text-pink-700 border-pink-300 hover:bg-pink-50 text-sm sm:text-base"
              >
                <LogOut className="h-4 w-4 mr-1 sm:mr-2" />
                ログアウト
              </Button>
            </div>
          ) : isAnonymous ? (
            <div className="flex items-center space-x-2 sm:space-x-4">
              <Link to="/feed">
                <Button variant="ghost" className="text-pink-700 hover:text-pink-900 hover:bg-pink-50 text-sm sm:text-base">
                  フィード
                </Button>
              </Link>
              <Link to="/login">
                <Button className="bg-gradient-to-r from-pink-500 to-orange-400 hover:from-pink-600 hover:to-orange-500 text-white text-sm sm:text-base">
                  プレミアム登録
                </Button>
              </Link>
            </div>
          ) : (
            <div className="flex items-center space-x-2 sm:space-x-4">
              <Button 
                onClick={setAnonymousMode}
                variant="ghost" 
                className="text-green-700 hover:text-green-900 hover:bg-green-50 text-sm sm:text-base"
              >
                無料で閲覧
              </Button>
              <Link to="/login">
                <Button variant="ghost" className="text-pink-700 hover:text-pink-900 hover:bg-pink-50 text-sm sm:text-base">
                  ログイン
                </Button>
              </Link>
              <Link to="/register">
                <Button className="bg-gradient-to-r from-pink-500 to-orange-400 hover:from-pink-600 hover:to-orange-500 text-white text-sm sm:text-base">
                  プレミアム登録
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
