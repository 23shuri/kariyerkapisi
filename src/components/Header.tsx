import React, { useState, useEffect } from 'react';
import { Briefcase, LogOut, User as UserIcon, Building, Sparkles, Bell } from 'lucide-react';
import { User } from '../types';

interface HeaderProps {
  currentUser: User | null;
  onLogout: () => void;
  onOpenAuth: (role: 'candidate' | 'employer') => void;
  onOpenNotifications?: () => void;
  unreadCount?: number;
  activeTab?: 'home' | 'applications';
  onTabChange?: (tab: 'home' | 'applications') => void;
  activeMainView?: 'dashboard' | 'network';
  onMainViewChange?: (view: 'dashboard' | 'network') => void;
}

export const Header: React.FC<HeaderProps> = ({ 
  currentUser, 
  onLogout, 
  onOpenAuth, 
  onOpenNotifications, 
  unreadCount = 0,
  activeTab = 'home',
  onTabChange,
  activeMainView = 'dashboard',
  onMainViewChange
}) => {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-200 bg-white/95 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <div className="flex items-center space-x-6">
          <div className="flex items-center space-x-2.5 cursor-pointer">
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

          {/* Navigation Tabs - Only for logged in candidates */}
          {currentUser && currentUser.role === 'candidate' && onTabChange && onMainViewChange && (
            <nav className="hidden md:flex items-center space-x-1">
              <button
                onClick={() => {
                  onMainViewChange('dashboard');
                  onTabChange('home');
                }}
                className={`px-4 py-2 text-sm font-medium rounded-lg transition-all duration-150 ${
                  activeMainView === 'dashboard'
                    ? 'bg-emerald-50 text-emerald-700'
                    : 'text-slate-600 hover:text-emerald-600 hover:bg-slate-50'
                }`}
              >
                Ana Ekran
              </button>
              <button
                onClick={() => {
                  onMainViewChange('dashboard');
                  onTabChange('applications');
                }}
                className={`px-4 py-2 text-sm font-medium rounded-lg transition-all duration-150 ${
                  activeMainView === 'dashboard' && activeTab === 'applications'
                    ? 'bg-emerald-50 text-emerald-700'
                    : 'text-slate-600 hover:text-emerald-600 hover:bg-slate-50'
                }`}
              >
                Mevcut Başvurular
              </button>
              <button
                onClick={() => onMainViewChange('network')}
                className={`px-4 py-2 text-sm font-medium rounded-lg transition-all duration-150 ${
                  activeMainView === 'network'
                    ? 'bg-blue-50 text-blue-700'
                    : 'text-slate-600 hover:text-blue-600 hover:bg-slate-50'
                }`}
              >
                <Users className="h-4 w-4 inline mr-1" />
                Network
              </button>
            </nav>
          )}
        </div>

        {/* Navigation Actions */}
        <div className="flex items-center space-x-3">
          {currentUser ? (
            <div className="flex items-center space-x-4">
              <div className="hidden sm:flex flex-col items-end">
                <span className="text-sm font-semibold text-slate-800">{currentUser.fullName}</span>
                <span className="text-xs text-slate-500 flex items-center gap-1">
                  {currentUser.role === 'employer' ? (
                    <>
                      <Building className="h-3 w-3 text-emerald-500" />
                      İş Veren Paneli
                    </>
                  ) : (
                    <>
                      <UserIcon className="h-3 w-3 text-emerald-500" />
                      Aday Paneli
                    </>
                  )}
                </span>
              </div>
              
              {currentUser.avatarUrl ? (
                <img 
                  src={currentUser.avatarUrl} 
                  alt={currentUser.fullName} 
                  className="h-9 w-9 rounded-lg object-cover ring-2 ring-slate-100"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 font-bold text-sm">
                  {currentUser.fullName.charAt(0).toUpperCase()}
                </div>
              )}

              {/* Notification Bell */}
              <button
                onClick={onOpenNotifications}
                className="relative inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 hover:text-emerald-600 transition-all duration-150"
                title="Bildirimler"
              >
                <Bell className="h-4 w-4" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>

              <button
                onClick={onLogout}
                className="inline-flex items-center gap-2 h-9 px-3 rounded-lg border border-slate-200 text-slate-500 hover:bg-red-50 hover:text-red-600 transition-all duration-150"
                title="Çıkış Yap"
              >
                <LogOut className="h-4 w-4" />
                <span className="hidden sm:inline text-xs font-medium">Çıkış</span>
              </button>
            </div>
          ) : (
            <div className="flex items-center space-x-2">
              <button
                onClick={() => onOpenAuth('candidate')}
                className="text-sm font-medium text-slate-600 hover:text-emerald-600 px-3 py-1.5 rounded-lg hover:bg-slate-50 transition-all duration-150"
              >
                İş Ara (Aday)
              </button>
              <button
                onClick={() => onOpenAuth('employer')}
                className="bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium px-4 py-1.5 rounded-lg shadow-sm transition-all duration-150"
              >
                İlan Yayınla (İş Veren)
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
