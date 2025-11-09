import React from 'react';
import { NavLink, Outlet } from 'react-router-dom';

const MatchingLayout: React.FC = () => {
  return (
    <div className="container mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold text-black mb-4">マッチング</h1>
      <div className="flex gap-3 mb-6 bg-gray-700 rounded-lg px-2 py-1">
        <NavLink to="/matching" end className={({ isActive }) => `px-4 py-3 text-sm font-medium transition-colors rounded-md ${isActive ? 'bg-white text-black' : 'text-gray-300 hover:text-white'}`}>検索</NavLink>
        <NavLink to="/matching/likes" className={({ isActive }) => `px-4 py-3 text-sm font-medium transition-colors rounded-md ${isActive ? 'bg-white text-black' : 'text-gray-300 hover:text-white'}`}>タイプ</NavLink>
        <NavLink to="/matching/chats" className={({ isActive }) => `px-4 py-3 text-sm font-medium transition-colors rounded-md ${isActive ? 'bg-white text-black' : 'text-gray-300 hover:text-white'}`}>チャット</NavLink>
        <NavLink to="/matching/profile" className={({ isActive }) => `px-4 py-3 text-sm font-medium transition-colors rounded-md ml-auto ${isActive ? 'bg-white text-black' : 'text-gray-300 hover:text-white'}`}>プロフィール編集</NavLink>
      </div>
      <Outlet />
    </div>
  );
};

export default MatchingLayout;
