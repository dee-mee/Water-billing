
import React from 'react';
import useAuth from '../../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { UserRole } from '../../types';

const WaterDropIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-8 w-8 text-white">
        <path d="M12 22a7 7 0 0 0 7-7c0-2-1-3.9-3-5.5s-3.5-4-4-6.5c-.5 2.5-2 4.9-4 6.5C6 11.1 5 13 5 15a7 7 0 0 0 7 7z"></path>
    </svg>
);

const Header: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getDashboardPath = () => {
    if (!user) return "/";
    return user.role === UserRole.ADMIN ? "/admin" : "/dashboard";
  }

  return (
    <header className="bg-primary shadow-md">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <div onClick={() => navigate(getDashboardPath())} className="flex items-center gap-3 cursor-pointer">
          <WaterDropIcon />
          <h1 className="text-2xl font-bold text-white tracking-tight">AquaTrack</h1>
        </div>
        <div className="flex items-center gap-4">
            {user && <span className="text-white hidden sm:block">Welcome, {user.name}</span>}
            {user && (
            <button
                onClick={handleLogout}
                className="bg-white text-primary hover:bg-secondary font-semibold py-2 px-4 rounded-lg shadow transition-colors duration-300"
            >
                Logout
            </button>
            )}
        </div>
      </div>
    </header>
  );
};

export default Header;