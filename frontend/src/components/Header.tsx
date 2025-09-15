import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Heart, User, PlusCircle, LogOut } from 'lucide-react';

const Header: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="bg-white shadow-sm border-b border-purple-100">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link to="/feed" className="flex items-center space-x-2">
            <Heart className="h-8 w-8 text-purple-600" />
            <span className="text-2xl font-bold text-purple-800">LGBTQ+ Community</span>
          </Link>

          {user ? (
            <div className="flex items-center space-x-4">
              <Link to="/feed">
                <Button variant="ghost" className="text-purple-700 hover:text-purple-900">
                  Feed
                </Button>
              </Link>
              <Link to="/create">
                <Button variant="ghost" className="text-purple-700 hover:text-purple-900">
                  <PlusCircle className="h-4 w-4 mr-2" />
                  Create
                </Button>
              </Link>
              <Link to="/profile">
                <Button variant="ghost" className="text-purple-700 hover:text-purple-900">
                  <User className="h-4 w-4 mr-2" />
                  Profile
                </Button>
              </Link>
              <Button 
                variant="outline" 
                onClick={handleLogout}
                className="text-purple-700 border-purple-300 hover:bg-purple-50"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          ) : (
            <div className="flex items-center space-x-4">
              <Link to="/login">
                <Button variant="ghost" className="text-purple-700 hover:text-purple-900">
                  Login
                </Button>
              </Link>
              <Link to="/register">
                <Button className="bg-purple-600 hover:bg-purple-700">
                  Register
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
