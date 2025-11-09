import React from 'react';
import { NavLink, Outlet } from 'react-router-dom';

const MatchingLayout: React.FC = () => {
  return (
    <div className="container mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold text-black mb-4">マッチング</h1>
      <div className="flex gap-3 mb-6 border-b border-gray-200">
        <NavLink to="/matching" end className={({ isActive }) => `px-4 py-3 text-sm font-medium transition-colors ${isActive ? 'text-black border-b-2 border-black' : 'text-gray-500 hover:text-gray-700'}`}>検索</NavLink>
        <NavLink to="/matching/likes" className={({ isActive }) => `px-4 py-3 text-sm font-medium transition-colors ${isActive ? 'text-black border-b-2 border-black' : 'text-gray-500 hover:text-gray-700'}`}>タイプ</NavLink>
        <NavLink to="/matching/chats" className={({ isActive }) => `px-4 py-3 text-sm font-medium transition-colors ${isActive ? 'text-black border-b-2 border-black' : 'text-gray-500 hover:text-gray-700'}`}>チャット</NavLink>
        <NavLink to="/matching/profile" className={({ isActive }) => `px-4 py-3 text-sm font-medium transition-colors ${isActive ? 'text-black border-b-2 border-black' : 'text-gray-500 hover:text-gray-700'}`}>プロフィール編集</NavLink>
      </div>
      <Outlet />
    </div>
  );
};

export default MatchingLayout;
