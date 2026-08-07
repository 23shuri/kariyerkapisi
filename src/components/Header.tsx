import React, { useState } from 'react';
import { Briefcase, LogOut, User as UserIcon, Bell, Users, Home, FileText, Bookmark, Globe } from 'lucide-react';
import { User } from '../types';
import { useLanguage } from '../contexts/LanguageContext';

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
  const [showLanguageMenu, setShowLanguageMenu] = useState(false);
  const { t, language, setLanguage } = useLanguage();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-200 bg-white/95 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <div className="flex items-center space-x-6">
          <div className="flex items-center space-x-2.5 cursor-pointer" onClick={() => onMainViewChange && onMainViewChange('home')}>
            <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-md">
              <Briefcase className="h-5 w-5" />
              <div className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-amber-400 text-[8px] font-black text-white shadow animate-bounce">
                AI
              </div>
            </div>
            <div>
              <h1 className="font-display text-xl font-black tracking-tight flex items-center gap-0.5">
                <span className="bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">KARİYER</span>
                <span className="bg-gradient-to-r from-emerald-500 to-teal-500 bg-clip-text text-transparent ml-1.5">ATLASI</span>
                <span className="ml-1 text-[10px] font-black bg-gradient-to-r from-amber-400 to-orange-500 text-white px-1.5 py-0.5 rounded-full tracking-widest shadow-sm">PRO</span>
              </h1>
              <p className="text-[9px] font-semibold tracking-widest text-emerald-500 uppercase">{t('common.tagline')}</p>
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
                {t('header.jobs')}
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
                {t('header.home')}
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
                  {t('header.applications')}
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
                {t('header.network')}
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
                {t('header.profile')}
              </button>
            </nav>
          )}
        </div>

        {/* Right Side Actions */}
        <div className="flex items-center space-x-2">
          {currentUser ? (
            <>
              {/* Kaydedilen İlanlar */}
              {currentUser.role === 'candidate' && onNavigateToSavedJobs && (
                <button
                  onClick={onNavigateToSavedJobs}
                  className="hidden sm:flex relative p-2 text-slate-600 hover:text-emerald-600 hover:bg-slate-50 rounded-lg transition"
                  title={t('header.savedJobs')}
                >
                  <Bookmark className="h-5 w-5" />
                </button>
              )}

              {/* Bildirimler */}
              {onOpenNotifications && (
                <button
                  onClick={onOpenNotifications}
                  className="hidden sm:flex relative p-2 text-slate-600 hover:text-blue-600 hover:bg-slate-50 rounded-lg transition"
                  title={t('header.notifications')}
                >
                  <Bell className="h-5 w-5" />
                  {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </button>
              )}

              {/* Dil Seçici Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setShowLanguageMenu(!showLanguageMenu)}
                  className="flex items-center gap-2 p-2 hover:bg-slate-50 rounded-lg transition text-slate-600 hover:text-emerald-600"
                >
                  <Globe className="h-5 w-5" />
                  <span className="text-sm font-medium">{language.toUpperCase()}</span>
                </button>

                {/* Language Dropdown Menu */}
                {showLanguageMenu && (
                  <>
                    <div 
                      className="fixed inset-0 z-40" 
                      onClick={() => setShowLanguageMenu(false)}
                    />
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-slate-200 py-2 z-50">
                      <button
                        onClick={() => {
                          setLanguage('tr');
                          setShowLanguageMenu(false);
                        }}
                        className={`w-full px-4 py-2 text-left text-sm font-medium transition flex items-center gap-2 ${
                          language === 'tr' 
                            ? 'bg-emerald-50 text-emerald-700' 
                            : 'text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        🇹🇷 Türkçe
                      </button>
                      <button
                        onClick={() => {
                          setLanguage('en');
                          setShowLanguageMenu(false);
                        }}
                        className={`w-full px-4 py-2 text-left text-sm font-medium transition flex items-center gap-2 ${
                          language === 'en' 
                            ? 'bg-emerald-50 text-emerald-700' 
                            : 'text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        🇬🇧 English
                      </button>
                      <button
                        onClick={() => {
                          setLanguage('de');
                          setShowLanguageMenu(false);
                        }}
                        className={`w-full px-4 py-2 text-left text-sm font-medium transition flex items-center gap-2 ${
                          language === 'de' 
                            ? 'bg-emerald-50 text-emerald-700' 
                            : 'text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        🇩🇪 Deutsch
                      </button>
                    </div>
                  </>
                )}
              </div>

              {/* User Avatar & Menu */}
              <div className="relative">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center gap-2 p-1.5 hover:bg-slate-50 rounded-lg transition"
                >
                  {currentUser.avatarUrl ? (
                    <img 
                      src={currentUser.avatarUrl.startsWith('data:') || currentUser.avatarUrl.startsWith('http') ? currentUser.avatarUrl : `http://127.0.0.1:5001${currentUser.avatarUrl}`}
                      alt={currentUser.fullName} 
                      className="h-8 w-8 rounded-lg object-cover"
                    />
                  ) : (
                    <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-emerald-400 to-blue-500 flex items-center justify-center text-white font-bold text-sm">
                      {(currentUser?.fullName || '?').charAt(0)}
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
                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-slate-200 py-2 z-50">
                      <div className="px-4 py-3 border-b border-slate-100">
                        <p className="font-semibold text-slate-900 truncate">{currentUser.fullName}</p>
                        <p className="text-xs text-slate-500 truncate">{currentUser.email}</p>
                      </div>
                      
                      <button
                        onClick={() => {
                          setShowUserMenu(false);
                          onLogout();
                        }}
                        className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 transition flex items-center gap-2"
                      >
                        <LogOut className="h-4 w-4" />
                        {t('header.logout')}
                      </button>
                    </div>
                  </>
                )}
              </div>
            </>
          ) : (
            <div className="flex items-center space-x-2">
              {/* Dil Seçici Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setShowLanguageMenu(!showLanguageMenu)}
                  className="flex items-center gap-2 p-2 hover:bg-slate-50 rounded-lg transition text-slate-600 hover:text-emerald-600"
                >
                  <Globe className="h-5 w-5" />
                  <span className="text-sm font-medium">{language.toUpperCase()}</span>
                </button>

                {/* Language Dropdown Menu */}
                {showLanguageMenu && (
                  <>
                    <div 
                      className="fixed inset-0 z-40" 
                      onClick={() => setShowLanguageMenu(false)}
                    />
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-slate-200 py-2 z-50">
                      <button
                        onClick={() => {
                          setLanguage('tr');
                          setShowLanguageMenu(false);
                        }}
                        className={`w-full px-4 py-2 text-left text-sm font-medium transition flex items-center gap-2 ${
                          language === 'tr' 
                            ? 'bg-emerald-50 text-emerald-700' 
                            : 'text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        🇹🇷 Türkçe
                      </button>
                      <button
                        onClick={() => {
                          setLanguage('en');
                          setShowLanguageMenu(false);
                        }}
                        className={`w-full px-4 py-2 text-left text-sm font-medium transition flex items-center gap-2 ${
                          language === 'en' 
                            ? 'bg-emerald-50 text-emerald-700' 
                            : 'text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        🇬🇧 English
                      </button>
                      <button
                        onClick={() => {
                          setLanguage('de');
                          setShowLanguageMenu(false);
                        }}
                        className={`w-full px-4 py-2 text-left text-sm font-medium transition flex items-center gap-2 ${
                          language === 'de' 
                            ? 'bg-emerald-50 text-emerald-700' 
                            : 'text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        🇩🇪 Deutsch
                      </button>
                    </div>
                  </>
                )}
              </div>
              <button
                onClick={() => onOpenAuth('candidate')}
                className="hidden sm:inline text-sm font-medium text-slate-600 hover:text-emerald-600 px-3 py-1.5 rounded-lg hover:bg-slate-50 transition"
              >
                {t('header.login')}
              </button>
              <button
                onClick={() => onOpenAuth('employer')}
                className="bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium px-3 sm:px-4 py-1.5 rounded-lg shadow-sm transition"
              >
                {t('header.postJob')}
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
