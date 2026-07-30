import React, { useState, useRef, useEffect } from 'react';
import { User, Bookmark, Bell, LogOut, Settings, ChevronDown } from 'lucide-react';
import { User as UserType } from '../types';

interface ProfileMenuProps {
  currentUser: UserType;
  onLogout: () => void;
  onNavigateToSavedJobs: () => void;
  onNavigateToNotifications: () => void;
  unreadCount?: number;
}

export const ProfileMenu: React.FC<ProfileMenuProps> = ({
  currentUser,
  onLogout,
  onNavigateToSavedJobs,
  onNavigateToNotifications,
  unreadCount = 0
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={menuRef}>
      {/* Profile Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-slate-50 transition-all duration-150"
      >
        {/* Avatar */}
        {currentUser.avatarUrl ? (
          <img
            src={currentUser.avatarUrl}
            alt={currentUser.fullName}
            className="h-9 w-9 rounded-lg object-cover ring-2 ring-slate-200"
            referrerPolicy="no-referrer"
          />
        ) : (
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-100 text-emerald-600 font-bold text-sm ring-2 ring-emerald-200">
            {currentUser.fullName.charAt(0).toUpperCase()}
          </div>
        )}

        {/* Name & Role */}
        <div className="hidden md:flex flex-col items-start">
          <span className="text-sm font-semibold text-slate-900">{currentUser.fullName}</span>
          <span className="text-xs text-slate-500">
            {currentUser.role === 'candidate' ? 'Aday' : currentUser.role === 'employer' ? 'İş Veren' : 'Admin'}
          </span>
        </div>

        {/* Chevron */}
        <ChevronDown className={`h-4 w-4 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-lg border border-slate-200 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
          {/* Profile Info Header */}
          <div className="px-4 py-3 border-b border-slate-100">
            <p className="text-sm font-semibold text-slate-900">{currentUser.fullName}</p>
            <p className="text-xs text-slate-500">{currentUser.email}</p>
          </div>

          {/* Menu Items */}
          <div className="py-2">
            <button
              onClick={() => {
                onNavigateToSavedJobs();
                setIsOpen(false);
              }}
              className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-slate-50 transition-colors text-left"
            >
              <Bookmark className="h-4 w-4 text-slate-600" />
              <span className="text-sm font-medium text-slate-700">Kaydedilen İlanlar</span>
            </button>

            <button
              onClick={() => {
                onNavigateToNotifications();
                setIsOpen(false);
              }}
              className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-slate-50 transition-colors text-left relative"
            >
              <Bell className="h-4 w-4 text-slate-600" />
              <span className="text-sm font-medium text-slate-700">Bildirimler</span>
              {unreadCount > 0 && (
                <span className="ml-auto px-2 py-0.5 bg-red-500 text-white text-xs font-bold rounded-full">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>
          </div>

          {/* Logout */}
          <div className="border-t border-slate-100 pt-2">
            <button
              onClick={() => {
                onLogout();
                setIsOpen(false);
              }}
              className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-red-50 transition-colors text-left"
            >
              <LogOut className="h-4 w-4 text-red-600" />
              <span className="text-sm font-medium text-red-600">Çıkış Yap</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
