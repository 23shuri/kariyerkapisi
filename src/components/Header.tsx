import React from 'react';
import { Briefcase, LogOut, User as UserIcon, Building, Sparkles } from 'lucide-react';
import { User } from '../types';

interface HeaderProps {
  currentUser: User | null;
  onLogout: () => void;
  onOpenAuth: (role: 'candidate' | 'employer') => void;
}

export const Header: React.FC<HeaderProps> = ({ currentUser, onLogout, onOpenAuth }) => {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-200 bg-white/95 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
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

              <button
                onClick={onLogout}
                className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 hover:text-red-500 transition-all duration-150"
                title="Çıkış Yap"
              >
                <LogOut className="h-4 w-4" />
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
