import React, { useState } from 'react';
import { Briefcase, LogOut, User as UserIcon, Bell, Users, Home, FileText, Bookmark } from 'lucide-react';
import { User } from '../types';

interface HeaderProps {
  currentUser: User | null;
  onLogout: () => void;
  onOpenAuth: (role: 'candidate' | 'employer') => void;
  onOpenNotifications?: () => void;
  onNavigateToSavedJobs?: () => void;
  onNavigateToProfile?: () => void;
  onViewJobs?: () => void;
  activeView?: string;
  unreadCount?: number;
  activeMainView?: 'home' | 'applications' | 'network' | 'profile';
  onMainViewChange?: (view: 'home' | 'applications' | 'network' | 'profile') => void;
}

export const Header: React.FC<HeaderProps> = ({ 
  currentUser, 
  onLogout, 
  onOpenAuth, 
  onOpenNotifications, 
  onNavigateToSavedJobs,
  onNavigateToProfile,
  onViewJobs,
  activeView = 'main',
  unreadCount = 0,
  activeMainView = 'home',
  onMainViewChange
}) => {
  const [showUserMenu, setShowUserMenu] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-200 bg-white/95 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <div className="flex items-center space-x-6">
          <div className="flex items-center space-x-2.5 cursor-pointer" onClick={() => onMainViewChange && onMainViewChange('home')}>
            <div className="relative flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-600 text-white shadow-sm">
              <Briefcase className="h-5 w-5" />
              <div className="absolute -top-1 -right-1 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-emerald-400 text-[8px] font-bold text-white animate-pulse">
                AI
              </div>
            </div>
            <div>
              <h1 className="font-display text-lg font-bold tracking-tight text-slate-900 flex items-center">
                Kariyer<span className="text-emerald-600 ml-1">Kapısı</span>
              </h1>
              <p className="text-[9px] font-medium tracking-wider text-slate-400 uppercase">YAPAY ZEKA DESTEKLİ KARİYER</p>
            </div>
          </div>

          {/* Main Navigation Tabs */}
          {currentUser && onMainViewChange && (
            <nav className="hidden md:flex items-center space-x-1">
              {/* İş İlanları — hem aday hem işveren için */}
              <button
                onClick={onViewJobs}
                className={`px-4 py-2 text-sm font-semibold rounded-lg transition flex items-center gap-2 ${
                  activeView === 'jobList' || activeView === 'jobDetail'
                    ? 'bg-emerald-50 text-emerald-700'
                    : 'text-slate-600 hover:text-emerald-600 hover:bg-slate-50'
                }`}
              >
                <Briefcase className="h-4 w-4" />
                İş İlanları
              </button>

              <button
                onClick={() => onMainViewChange('home')}
                className={`px-4 py-2 text-sm font-semibold rounded-lg transition flex items-center gap-2 ${
                  activeView === 'main' && activeMainView === 'home'
                    ? 'bg-emerald-50 text-emerald-700'
                    : 'text-slate-600 hover:text-emerald-600 hover:bg-slate-50'
                }`}
              >
                <Home className="h-4 w-4" />
                Anasayfa
              </button>
              
              {currentUser.role === 'candidate' && (
                <button
                  onClick={() => onMainViewChange('applications')}
                  className={`px-4 py-2 text-sm font-semibold rounded-lg transition flex items-center gap-2 ${
                    activeView === 'main' && activeMainView === 'applications'
                      ? 'bg-emerald-50 text-emerald-700'
                      : 'text-slate-600 hover:text-emerald-600 hover:bg-slate-50'
                  }`}
                >
                  <FileText className="h-4 w-4" />
                  Başvurularım
                </button>
              )}

              <button
                onClick={() => onMainViewChange('network')}
                className={`px-4 py-2 text-sm font-semibold rounded-lg transition flex items-center gap-2 ${
                  activeView === 'main' && activeMainView === 'network'
                    ? 'bg-blue-50 text-blue-700'
                    : 'text-slate-600 hover:text-blue-600 hover:bg-slate-50'
                }`}
              >
                <Users className="h-4 w-4" />
                Network
              </button>

              <button
                onClick={() => onNavigateToProfile && onNavigateToProfile()}
                className={`px-4 py-2 text-sm font-semibold rounded-lg transition flex items-center gap-2 ${
                  activeView === 'profile'
                    ? 'bg-purple-50 text-purple-700'
                    : 'text-slate-600 hover:text-purple-600 hover:bg-slate-50'
                }`}
              >
                <UserIcon className="h-4 w-4" />
                Profilim
              </button>
            </nav>
          )}
        </div>

        {/* Right Side Actions */}
        <div className="flex items-center space-x-3">
          {currentUser ? (
            <>
              {/* Kaydedilen İlanlar */}
              {currentUser.role === 'candidate' && onNavigateToSavedJobs && (
                <button
                  onClick={onNavigateToSavedJobs}
                  className="relative p-2 text-slate-600 hover:text-emerald-600 hover:bg-slate-50 rounded-lg transition"
                  title="Kaydedilen İlanlar"
                >
                  <Bookmark className="h-5 w-5" />
                </button>
              )}

              {/* Bildirimler */}
              {onOpenNotifications && (
                <button
                  onClick={onOpenNotifications}
                  className="relative p-2 text-slate-600 hover:text-blue-600 hover:bg-slate-50 rounded-lg transition"
                  title="Bildirimler"
                >
                  <Bell className="h-5 w-5" />
                  {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </button>
              )}

              {/* User Avatar & Menu */}
              <div className="relative">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center gap-2 p-1.5 hover:bg-slate-50 rounded-lg transition"
                >
                  {currentUser.avatarUrl ? (
                    <img 
                      src={currentUser.avatarUrl.startsWith('http') ? currentUser.avatarUrl : `http://127.0.0.1:5001${currentUser.avatarUrl}`}
                      alt={currentUser.fullName} 
                      className="h-8 w-8 rounded-lg object-cover"
                    />
                  ) : (
                    <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-emerald-400 to-blue-500 flex items-center justify-center text-white font-bold text-sm">
                      {currentUser.fullName.charAt(0)}
                    </div>
                  )}
                </button>

                {/* Dropdown Menu */}
                {showUserMenu && (
                  <>
                    <div 
                      className="fixed inset-0 z-40" 
                      onClick={() => setShowUserMenu(false)}
                    />
                    <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-lg border border-slate-200 py-2 z-50">
                      <div className="px-4 py-3 border-b border-slate-100">
                        <p className="font-semibold text-slate-900">{currentUser.fullName}</p>
                        <p className="text-xs text-slate-500">{currentUser.email}</p>
                      </div>
                      
                      <button
                        onClick={() => {
                          setShowUserMenu(false);
                          onLogout();
                        }}
                        className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 transition flex items-center gap-2"
                      >
                        <LogOut className="h-4 w-4" />
                        Çıkış Yap
                      </button>
                    </div>
                  </>
                )}
              </div>
            </>
          ) : (
            <div className="flex items-center space-x-2">
              <button
                onClick={() => onOpenAuth('candidate')}
                className="text-sm font-medium text-slate-600 hover:text-emerald-600 px-3 py-1.5 rounded-lg hover:bg-slate-50 transition"
              >
                Giriş Yap
              </button>
              <button
                onClick={() => onOpenAuth('employer')}
                className="bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium px-4 py-1.5 rounded-lg shadow-sm transition"
              >
                İlan Yayınla
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
