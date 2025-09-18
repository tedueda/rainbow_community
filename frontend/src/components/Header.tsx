import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Heart, User, PlusCircle } from 'lucide-react';

const Header: React.FC = () => {

  return (
    <header className="bg-white shadow-sm border-b border-pink-100">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link to="/feed" className="flex items-center space-x-2">
            <Heart className="h-8 w-8 text-pink-500" />
            <span className="text-xl sm:text-2xl font-bold text-pink-800">Rainbow Community</span>
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
            <Link to="/profile">
              <Button variant="ghost" className="text-orange-700 hover:text-orange-900 hover:bg-orange-50 text-sm sm:text-base">
                <User className="h-4 w-4 mr-1 sm:mr-2" />
                プロフィール
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
