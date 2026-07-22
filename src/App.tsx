import { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { Testimonials } from './components/Testimonials';
import { AuthModal } from './components/AuthModal';
import { CandidateDashboard } from './components/CandidateDashboard';
import { EmployerDashboard } from './components/EmployerDashboard';
import { User, Role } from './types';

export default function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authRole, setAuthRole] = useState<Role>('candidate');

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
            />
          )
        ) : (
          <div className="space-y-0">
            {/* Landing Hero */}
            <Hero onOpenAuth={handleOpenAuth} />
            
            {/* Dynamic Testimonials */}
            <Testimonials />

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
    </div>
  );
}
