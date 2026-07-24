import { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { AuthModal } from './components/AuthModal';
import { CandidateDashboard } from './components/CandidateDashboard';
import { EmployerDashboard } from './components/EmployerDashboard';
import { NotificationPanel } from './components/NotificationPanel';
import { User, Role, Notification } from './types';

export default function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authRole, setAuthRole] = useState<Role>('candidate');
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  // Load user session on startup
  useEffect(() => {
    const saved = localStorage.getItem('kariyer_kapisi_session');
    if (saved) {
      try {
        const user = JSON.parse(saved);
        setCurrentUser(user);
      } catch (err) {
        console.error('Session load error:', err);
      }
    }
  }, []);

  // Fetch notifications when user changes
  useEffect(() => {
    if (currentUser) {
      fetchNotifications();
      // Poll every 30 seconds
      const interval = setInterval(fetchNotifications, 30000);
      return () => clearInterval(interval);
    }
  }, [currentUser]);

  const fetchNotifications = async () => {
    if (!currentUser) return;
    try {
      const res = await fetch(`/api/notifications?userId=${currentUser.id}`);
      const data = await res.json();
      if (res.ok) {
        setNotifications(data.notifications || []);
        setUnreadCount(data.unreadCount || 0);
      }
    } catch (err) {
      console.error('Notification fetch error:', err);
    }
  };

  const handleMarkAsRead = async (notificationId: string) => {
    try {
      const res = await fetch(`/api/notifications/${notificationId}/read`, {
        method: 'PATCH'
      });
      if (res.ok) {
        fetchNotifications();
      }
    } catch (err) {
      console.error('Mark as read error:', err);
    }
  };

  const handleMarkAllAsRead = async () => {
    if (!currentUser) return;
    try {
      const res = await fetch('/api/notifications/read-all', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: currentUser.id })
      });
      if (res.ok) {
        fetchNotifications();
      }
    } catch (err) {
      console.error('Mark all as read error:', err);
    }
  };

  const handleLoginSuccess = (user: User) => {
    setCurrentUser(user);
    localStorage.setItem('kariyer_kapisi_session', JSON.stringify(user));
    setShowAuthModal(false);
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('kariyer_kapisi_session');
  };

  const handleOpenAuth = (role: Role) => {
    setAuthRole(role);
    setShowAuthModal(true);
  };

  const handleProfileUpdated = (updatedUser: User) => {
    setCurrentUser(updatedUser);
    localStorage.setItem('kariyer_kapisi_session', JSON.stringify(updatedUser));
  };

  return (
    <div className="min-h-screen bg-[#F9FAFB] flex flex-col font-sans text-slate-800">
      {/* Header Navigation */}
      <Header 
        currentUser={currentUser} 
        onLogout={handleLogout} 
        onOpenAuth={handleOpenAuth}
        onOpenNotifications={() => setShowNotifications(!showNotifications)}
        unreadCount={unreadCount}
      />

      {/* Main Content Area */}
      <main className="flex-1">
        {currentUser ? (
          currentUser.role === 'candidate' ? (
            <CandidateDashboard 
              currentUser={currentUser} 
              onProfileUpdated={handleProfileUpdated} 
            />
          ) : (
            <EmployerDashboard 
              currentUser={currentUser}
              onNotificationChange={fetchNotifications}
            />
          )
        ) : (
          <div className="space-y-0">
            {/* Landing Hero */}
            <Hero onOpenAuth={handleOpenAuth} />

            {/* Platform Stats / Future Proof Info Box */}
            <section className="bg-white py-16 sm:py-20 border-t border-slate-200">
              <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="mx-auto max-w-3xl text-center">
                  <h3 className="font-display text-2xl font-bold text-slate-900 sm:text-3xl">
                    Geleceğin Teknolojisiyle Hazırlandı
                  </h3>
                  <p className="mt-4 text-sm text-slate-500 leading-relaxed">
                    Kariyer Kapısı, modüler mimarisi sayesinde tamamen parametrik olarak tasarlanmıştır. 
                    Mevcut backend API'leri, dosya depolama sağlayıcısı (Yerel Disk veya AWS S3) ve yapay zeka entegrasyonu (Gemini LLM) 
                    ortam değişkenleriyle dinamik olarak yönetilir. Bu sayede sistemi gelecekte dilediğiniz gibi PHP veya Flask/MySQL tabanlı 
                    yapılara sorunsuz bir şekilde dönüştürebilirsiniz.
                  </p>
                  
                  <div className="mt-8 flex flex-wrap justify-center gap-6">
                    <span className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-600 bg-slate-50 border border-slate-200/80 px-3 py-1.5 rounded-full">
                      <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                      Gemini 3.5 Flash Entegrasyonu
                    </span>
                    <span className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-600 bg-slate-50 border border-slate-200/80 px-3 py-1.5 rounded-full">
                      <span className="h-2 w-2 rounded-full bg-teal-500" />
                      AWS S3 Hazır Depolama Katmanı
                    </span>
                    <span className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-600 bg-slate-50 border border-slate-200/80 px-3 py-1.5 rounded-full">
                      <span className="h-2 w-2 rounded-full bg-green-500" />
                      Parametrik MySQL/SQLAlchemy Uyumu
                    </span>
                  </div>
                </div>
              </div>
            </section>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-8">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center text-xs text-slate-400">
          <p>&copy; {new Date().getFullYear()} Kariyer Kapısı - Yapay Zeka Tabanlı Akıllı Eşleştirme Sistemi. Tüm hakları saklıdır.</p>
        </div>
      </footer>

      {/* Auth Modal Popup */}
      {showAuthModal && (
        <AuthModal 
          initialRole={authRole} 
          onClose={() => setShowAuthModal(false)} 
          onSuccess={handleLoginSuccess} 
        />
      )}

      {/* Notification Panel */}
      <NotificationPanel
        isOpen={showNotifications}
        onClose={() => setShowNotifications(false)}
        notifications={notifications}
        onMarkAsRead={handleMarkAsRead}
        onMarkAllAsRead={handleMarkAllAsRead}
      />
    </div>
  );
}
