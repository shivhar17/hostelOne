import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Home, Users, Bell, User } from 'lucide-react';

export const BottomNav: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Hide on onboarding, maintenance flow, login, and all staff pages
  const hideNavPaths = ['/onboarding', '/maintenance', '/login'];
  const isStaffPage = location.pathname.startsWith('/staff');
  
  if (hideNavPaths.includes(location.pathname) || isStaffPage) return null;

  const isActive = (path: string) => location.pathname === path || (path !== '/' && location.pathname.startsWith(path));

  const navItems = [
    { icon: Home, label: 'Home', path: '/' },
    { icon: Users, label: 'Community', path: '/community' },
    { icon: Bell, label: 'Updates', path: '/announcements' },
    { icon: User, label: 'Profile', path: '/profile' },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-slate-900 border-t border-gray-100 dark:border-slate-800 pb-safe pt-2 px-6 shadow-[0_-4px_20px_rgba(0,0,0,0.05)] z-50 transition-colors duration-300">
      <div className="flex justify-between items-center max-w-md mx-auto pb-4">
        {navItems.map((item) => (
          <button
            key={item.label}
            onClick={() => navigate(item.path)}
            className={`flex flex-col items-center gap-1 p-2 transition-colors duration-200 ${
              isActive(item.path) ? 'text-teal-500 dark:text-teal-400' : 'text-gray-400 dark:text-slate-500'
            }`}
          >
            <item.icon size={24} strokeWidth={isActive(item.path) ? 2.5 : 2} />
            <span className="text-[10px] font-medium">{item.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
};