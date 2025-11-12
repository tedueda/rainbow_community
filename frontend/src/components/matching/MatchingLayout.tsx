import React, { useEffect, useState } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { API_URL } from '@/config';

const MatchingLayout: React.FC = () => {
  const { token } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const fetchUnreadCount = async () => {
      if (!token) return;
      
      try {
        const res = await fetch(`${API_URL}/api/matching/chat_requests/incoming`, {
          headers: { 'Authorization': `Bearer ${token}` },
        });
        
        if (res.ok) {
          const data = await res.json();
          const incomingCount = data.items?.length || 0;
          setUnreadCount(incomingCount);
        }
      } catch (e) {
        console.error('Failed to fetch unread count:', e);
      }
    };

    fetchUnreadCount();
    
    const interval = setInterval(fetchUnreadCount, 30000);
    
    return () => clearInterval(interval);
  }, [token]);

  return (
    <div className="container mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold text-black mb-4">マッチング</h1>
      <div className="flex gap-3 mb-6 bg-gray-700 rounded-lg px-2 py-1">
        <div className="flex gap-3 ml-auto">
          <NavLink to="/matching" end className={({ isActive }) => `px-4 py-3 text-sm font-medium transition-colors rounded-md ${isActive ? 'bg-white text-black' : 'text-gray-300 hover:text-white'}`}>検索</NavLink>
          <NavLink to="/matching/likes" className={({ isActive }) => `px-4 py-3 text-sm font-medium transition-colors rounded-md ${isActive ? 'bg-white text-black' : 'text-gray-300 hover:text-white'}`}>お気に入り</NavLink>
          <NavLink to="/matching/chats" className={({ isActive }) => `px-4 py-3 text-sm font-medium transition-colors rounded-md relative ${isActive ? 'bg-white text-black' : 'text-gray-300 hover:text-white'}`}>
            チャット
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                {unreadCount}
              </span>
            )}
          </NavLink>
        </div>
        <NavLink to="/matching/profile" className={({ isActive }) => `px-4 py-3 text-sm font-medium transition-colors rounded-md ${isActive ? 'bg-white text-black' : 'text-gray-300 hover:text-white'}`}>プロフィール編集</NavLink>
      </div>
      <Outlet />
    </div>
  );
};

export default MatchingLayout;
