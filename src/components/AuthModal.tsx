import React, { useState } from 'react';
import { X, Sparkles, LogIn, UserPlus, Mail, Lock, User as UserIcon, Building } from 'lucide-react';
import { Role, User } from '../types';

interface AuthModalProps {
  initialRole: Role;
  onClose: () => void;
  onSuccess: (user: User) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ initialRole, onClose, onSuccess }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [role, setRole] = useState<Role>(initialRole);
  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const fillDemoCreds = (demoType: 'cand' | 'empl') => {
    if (demoType === 'cand') {
      setEmail('ayse@yilmaz.com');
      setPassword('123456');
      setRole('candidate');
    } else {
      setEmail('hr@techcorp.com');
      setPassword('123456');
      setRole('employer');
    }
    setIsLogin(true);
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    const endpoint = isLogin ? '/api/auth/login' : '/api/auth/register';
    const payload = isLogin 
      ? { email, password } 
      : { email, fullName, role, password };

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error || 'İşlem gerçekleştirilemedi.');
      }

      onSuccess(result.user);
    } catch (err: any) {
      setError(err.message || 'Sunucu hatası oluştu.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={onClose} />

      {/* Modal Card */}
      <div className="relative w-full max-w-md overflow-hidden rounded-3xl bg-white shadow-xl border border-slate-100 ring-1 ring-slate-900/5 transition-all">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 rounded-full p-1.5 hover:bg-slate-50 transition"
        >
          <X className="h-4.5 w-4.5" />
        </button>

        <div className="p-8">
          {/* Header */}
          <div className="text-center mb-6">
            <div className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 mb-3">
              {role === 'candidate' ? <UserIcon className="h-5 w-5" /> : <Building className="h-5 w-5" />}
            </div>
            <h3 className="font-display text-xl font-bold text-slate-900">
              {isLogin ? 'Kariyer Kapısı Giriş' : 'Yeni Hesap Oluştur'}
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              {role === 'candidate' ? 'İş Arayan & Aday Girişi' : 'İş Veren & Şirket Girişi'}
            </p>
          </div>

          {/* Quick Demo Accout buttons */}
          <div className="mb-6 rounded-2xl bg-slate-50 p-4 border border-slate-100">
            <p className="text-xs font-semibold text-slate-700 mb-2 flex items-center gap-1">
              <Sparkles className="h-3.5 w-3.5 text-emerald-500" />
              Demo Hesaplarla Hızlı Başla:
            </p>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => fillDemoCreds('cand')}
                className="flex items-center justify-center gap-1 bg-white hover:bg-slate-50 border border-slate-150 text-xs font-medium py-2 px-3 rounded-lg text-slate-700 transition"
              >
                <UserIcon className="h-3.5 w-3.5 text-emerald-500" />
                Aday Girişi
              </button>
              <button
                type="button"
                onClick={() => fillDemoCreds('empl')}
                className="flex items-center justify-center gap-1 bg-white hover:bg-slate-50 border border-slate-150 text-xs font-medium py-2 px-3 rounded-lg text-slate-700 transition"
              >
                <Building className="h-3.5 w-3.5 text-emerald-500" />
                Şirket Girişi
              </button>
            </div>
          </div>

          {/* Role selector tab (Only on register) */}
          {!isLogin && (
            <div className="flex rounded-xl bg-slate-100 p-1 mb-5">
              <button
                type="button"
                onClick={() => setRole('candidate')}
                className={`flex-1 flex items-center justify-center gap-1 py-1.5 text-xs font-medium rounded-lg transition ${role === 'candidate' ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
              >
                <UserIcon className="h-3.5 w-3.5" />
                İş Arayan
              </button>
              <button
                type="button"
                onClick={() => setRole('employer')}
                className={`flex-1 flex items-center justify-center gap-1 py-1.5 text-xs font-medium rounded-lg transition ${role === 'employer' ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
              >
                <Building className="h-3.5 w-3.5" />
                İş Veren
              </button>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="mb-4 rounded-xl bg-red-50 p-3 border border-red-100 text-xs font-medium text-red-600">
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Ad Soyad</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                    <UserIcon className="h-4 w-4" />
                  </span>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Ayşe Yılmaz"
                    className="block w-full rounded-lg border border-slate-200 bg-white py-2.5 pl-9 pr-4 text-sm text-slate-900 focus:border-emerald-500 outline-none transition"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">E-Posta Adresi</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                  <Mail className="h-4 w-4" />
                </span>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="isim@sirket.com"
                  className="block w-full rounded-lg border border-slate-200 bg-white py-2.5 pl-9 pr-4 text-sm text-slate-900 focus:border-emerald-500 outline-none transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Şifre</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                  <Lock className="h-4 w-4" />
                </span>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="block w-full rounded-lg border border-slate-200 bg-white py-2.5 pl-9 pr-4 text-sm text-slate-900 focus:border-emerald-500 outline-none transition"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-2.5 px-4 shadow-sm transition disabled:opacity-50 cursor-pointer"
            >
              {isLoading ? (
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
              ) : isLogin ? (
                <>
                  <LogIn className="h-4 w-4" />
                  Giriş Yap
                </>
              ) : (
                <>
                  <UserPlus className="h-4 w-4" />
                  Kaydol
                </>
              )}
            </button>
          </form>

          {/* Toggle */}
          <div className="mt-5 text-center text-xs">
            <span className="text-slate-500">
              {isLogin ? 'Henüz hesabınız yok mu? ' : 'Zaten üye misiniz? '}
            </span>
            <button
              onClick={() => {
                setIsLogin(!isLogin);
                setError('');
              }}
              className="font-semibold text-emerald-600 hover:text-emerald-800"
            >
              {isLogin ? 'Yeni hesap açın' : 'Giriş yapın'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
