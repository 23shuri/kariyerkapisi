import React, { useState, useEffect } from 'react';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { User } from '../types';
import { UserProfileModal } from './UserProfileModal';

interface PublicProfilePageProps {
  userId: string;
  currentUser: User | null;
  onBack: () => void;
}

export const PublicProfilePage: React.FC<PublicProfilePageProps> = ({ 
  userId, 
  currentUser,
  onBack 
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchUserProfile();
  }, [userId]);

  const fetchUserProfile = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const res = await fetch(`/api/users/${userId}`);
      
      if (!res.ok) {
        if (res.status === 404) {
          setError('Kullanıcı bulunamadı');
        } else {
          setError('Profil yüklenirken hata oluştu');
        }
        return;
      }

      const data = await res.json();
      setUser(data.user);
    } catch (err) {
      console.error('Profile fetch error:', err);
      setError('Bağlantı hatası');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-slate-600 font-semibold">Profil yükleniyor...</p>
        </div>
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-lg p-8 text-center">
          <div className="h-16 w-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">❌</span>
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Profil Bulunamadı</h2>
          <p className="text-slate-600 mb-6">{error || 'Bu kullanıcı bulunamadı veya profili silinmiş olabilir.'}</p>
          <button
            onClick={onBack}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition flex items-center gap-2 mx-auto"
          >
            <ArrowLeft className="h-5 w-5" />
            Geri Dön
          </button>
        </div>
      </div>
    );
  }

  const isOwnProfile = currentUser?.id === userId;

  // Modal yerine tam sayfa olarak göster
  return (
    <div className="min-h-screen bg-slate-50">
      <div className="bg-white border-b border-slate-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-slate-600 hover:text-slate-900 font-medium"
          >
            <ArrowLeft className="h-5 w-5" />
            Geri
          </button>
        </div>
      </div>
      
      <UserProfileModal 
        user={user} 
        onClose={onBack}
        isOwnProfile={isOwnProfile}
      />
    </div>
  );
};
