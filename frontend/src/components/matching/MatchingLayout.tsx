import React from 'react';
import { NavLink, Outlet } from 'react-router-dom';

const MatchingLayout: React.FC = () => {
  return (
    <div className="container mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold text-pink-700 mb-4">マッチング</h1>
      <div className="flex gap-3 mb-6">
        <NavLink to="/matching" end className={({ isActive }) => `px-3 py-2 rounded-md text-sm ${isActive ? 'bg-pink-100 text-pink-700' : 'text-gray-600 hover:bg-gray-100'}`}>検索</NavLink>
        <NavLink to="/matching/matches" className={({ isActive }) => `px-3 py-2 rounded-md text-sm ${isActive ? 'bg-pink-100 text-pink-700' : 'text-gray-600 hover:bg-gray-100'}`}>タイプ</NavLink>
        <NavLink to="/matching/chats" className={({ isActive }) => `px-3 py-2 rounded-md text-sm ${isActive ? 'bg-pink-100 text-pink-700' : 'text-gray-600 hover:bg-gray-100'}`}>チャット</NavLink>
        <NavLink to="/matching/profile" className={({ isActive }) => `px-3 py-2 rounded-md text-sm ${isActive ? 'bg-pink-100 text-pink-700' : 'text-gray-600 hover:bg-gray-100'}`}>プロフィール編集</NavLink>
      </div>
      <Outlet />
    </div>
  );
};

export default MatchingLayout;
