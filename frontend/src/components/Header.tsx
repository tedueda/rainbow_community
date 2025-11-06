import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Heart, LogIn, LogOut, ChevronDown } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const Header: React.FC = () => {
  const navigate = useNavigate();
  const { user, isAnonymous, logout } = useAuth();
  const [showMemberMenu, setShowMemberMenu] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const memberBenefits = [
    { title: "マッチング", link: "/matching", icon: "💕" },
    { title: "ライブ・ウエディング", link: "/live-wedding", icon: "💒" },
    { title: "募金", link: "/funding", icon: "🤝" },
    { title: "マーケット", link: "/marketplace", icon: "🛍️" },
    { title: "食レポ", link: "/members/food", icon: "🍽" },
    { title: "ビューティ", link: "/members/beauty", icon: "💄" },
  ];

  return (
    <header className="bg-white shadow-sm border-b border-pink-100">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link to="/feed" className="flex items-center space-x-2">
            <img src="/images/logo02.png" alt="Carat Logo" className="h-12 w-auto" />
          </Link>

          <div className="flex items-center space-x-2 sm:space-x-4">
            <Link to="/feed">
              <Button variant="ghost" className="text-gray-700 hover:text-gray-900 hover:bg-gray-50 text-sm sm:text-base">
                <Heart className="h-4 w-4 mr-1 sm:mr-2" />
                ホーム
              </Button>
            </Link>
            
            {/* Member Benefits Dropdown */}
            <div className="relative">
              <Button 
                variant="ghost" 
                className="text-gray-700 hover:text-gray-900 hover:bg-gray-50 text-sm sm:text-base"
                onClick={() => setShowMemberMenu(!showMemberMenu)}
              >
                会員特別メニュー
                <ChevronDown className="h-4 w-4 ml-1" />
              </Button>
              
              {showMemberMenu && (
                <div className="absolute top-full right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                  <div className="p-2">
                    {memberBenefits.map((benefit) => (
                      <Link
                        key={benefit.link}
                        to={benefit.link}
                        onClick={() => setShowMemberMenu(false)}
                        className="flex items-center gap-3 px-4 py-3 hover:bg-pink-50 rounded-md transition-colors"
                      >
                        <span className="text-2xl">{benefit.icon}</span>
                        <span className="text-sm text-gray-700">{benefit.title}</span>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <Link to="/blog">
              <Button variant="ghost" className="text-gray-700 hover:text-gray-900 hover:bg-gray-50 text-sm sm:text-base">
                ブログ
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
