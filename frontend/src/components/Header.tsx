import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Home, ChevronDown } from 'lucide-react';
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
    <header className="bg-transparent backdrop-blur-md shadow-2xl border-b border-gray-300/50">
      <div className="container mx-auto px-6 sm:px-8 md:py-5">
        <div className="grid grid-cols-2 gap-4 items-center">
          {/* Left Column - Logo */}
          <div className="flex justify-start items-start">
            <Link to="/feed">
              <img src="/images/logo02.png" alt="Carat Logo" className="h-28 w-auto" />
            </Link>
          </div>

          {/* Right Column - Navigation (2 rows) */}
          <div className="flex flex-col justify-start items-end space-y-2">
            {/* Top Row - Main Navigation */}
            <nav className="flex items-center gap-8">
              <Link to="/feed">
                <Button variant="ghost" className="text-gray-700 hover:text-black hover:bg-gray-50 text-base font-normal px-2">
                  <Home className="h-5 w-5 mr-2" />
                  ホーム
                </Button>
              </Link>
              
              {/* Member Benefits Dropdown */}
              <div className="relative">
                <Button 
                  variant="ghost" 
                  className="text-gray-700 hover:text-black hover:bg-gray-50 text-base font-normal px-2"
                  onClick={() => setShowMemberMenu(!showMemberMenu)}
                >
                  会員特別メニュー
                  <ChevronDown className="h-5 w-5 ml-1" />
                </Button>
                
                {showMemberMenu && (
                  <div className="absolute top-full right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                    <div className="p-2">
                      {memberBenefits.map((benefit) => (
                        <Link
                          key={benefit.link}
                          to={benefit.link}
                          onClick={() => setShowMemberMenu(false)}
                          className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 rounded-md transition-colors"
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
                <Button variant="ghost" className="text-gray-700 hover:text-black hover:bg-gray-50 text-base font-normal px-2">
                  ブログ
                </Button>
              </Link>
            </nav>

            {/* Bottom Row - User Info & Auth */}
            <div className="flex items-center gap-4">
              {isAnonymous || !user ? (
                <>
                  <span className="text-sm text-gray-600">Test Ueda</span>
                  <Link to="/login">
                    <Button className="bg-black hover:bg-gray-800 text-white text-sm px-6 py-2">
                      ログイン
                    </Button>
                  </Link>
                </>
              ) : (
                <>
                  <span className="text-sm text-gray-600">{user.display_name}</span>
                  <Button variant="outline" onClick={handleLogout} className="border-gray-300 text-gray-700 hover:bg-gray-50 text-sm px-4">
                    ログアウト
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
