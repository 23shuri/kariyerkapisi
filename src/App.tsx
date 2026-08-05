import { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { AuthModal } from './components/AuthModal';
import { CandidateDashboard } from './components/CandidateDashboard';
import { EmployerDashboard } from './components/EmployerDashboard';
import { AdminDashboard } from './components/AdminDashboard';
import { NetworkDashboard } from './components/NetworkDashboard';
import { SavedJobsPage } from './components/SavedJobsPage';
import { NotificationPanel } from './components/NotificationPanel';
import { JobListPage } from './components/JobListPage';
import { JobDetailPage } from './components/JobDetailPage';
import { PublicProfilePage } from './components/PublicProfilePage';
import { CompanyProfilePublic } from './components/CompanyProfilePublic';
import { CompanyProfilePage, CompanyProfile } from './components/CompanyProfilePage';
import { CandidateCVPage } from './components/CandidateCVPage';
import { User, Role, Notification, Job } from './types';
import { CandidateCV } from './types';
import { Bell } from 'lucide-react';
import { LanguageProvider } from './contexts/LanguageContext';
import { ErrorBoundary } from './components/ErrorBoundary';

function AppContent() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authRole, setAuthRole] = useState<Role>('candidate');
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [activeTab, setActiveTab] = useState<'home' | 'applications'>('home');
  const [activeMainView, setActiveMainView] = useState<'dashboard' | 'network'>('dashboard');
  const [activeView, setActiveView] = useState<'main' | 'savedJobs' | 'notifications' | 'jobList' | 'jobDetail' | 'companyProfile' | 'profile' | 'candidateCVs'>('main');
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [selectedCV, setSelectedCV] = useState<CandidateCV | null>(null);
  const [selectedCompany, setSelectedCompany] = useState<CompanyProfile | null>(null);
  const [companyJobs, setCompanyJobs] = useState<Job[]>([]);
  const [viewingProfileUserId, setViewingProfileUserId] = useState<string | null>(null);

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
      if (!res.ok) return; // Backend kapalı - sessiz geç
      const data = await res.json();
      if (data) {
        setNotifications(data.notifications || []);
        setUnreadCount(data.unreadCount || 0);
      }
    } catch (err) {
      // API kapalı, hata yok - sessiz geç
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
    if (activeView !== 'jobList' && activeView !== 'jobDetail') {
      setActiveView('main');
      setActiveMainView('home');
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('kariyer_kapisi_session');
    setActiveView('main');
    setActiveMainView('home');
  };

  const handleOpenAuth = (role: Role) => {
    setAuthRole(role);
    setShowAuthModal(true);
  };

  const handleProfileUpdated = (updatedUser: User) => {
    setCurrentUser(updatedUser);
    localStorage.setItem('kariyer_kapisi_session', JSON.stringify(updatedUser));
  };

  const handleNavigateToSavedJobs = () => {
    setActiveView('savedJobs');
    setShowNotifications(false);
  };

  const handleNavigateToNotifications = () => {
    setActiveView('notifications');
    setShowNotifications(false);
  };

  const handleNavigateToProfile = () => {
    if (currentUser) {
      setViewingProfileUserId(currentUser.id);
      setActiveView('profile');
      setActiveMainView('profile');
    }
  };

  const handleViewProfile = (userId: string) => {
    setViewingProfileUserId(userId);
    setActiveView('profile');
    setActiveMainView('profile');
  };

  // Herhangi bir dashboard sekmesine geçilince activeView'i 'main'e sıfırla
  const handleMainViewChange = (view: 'home' | 'applications' | 'network' | 'profile') => {
    setActiveView('main');
    setActiveMainView(view);
    
    if (view === 'profile') {
      handleNavigateToProfile();
    }
  };

  const handleViewJobList = () => {
    if (!currentUser) {
      setAuthRole('candidate');
      setShowAuthModal(true);
      return;
    }
    setSelectedJob(null);
    setActiveView('jobList');
  };

  const handleTabChange = (tab: 'home' | 'applications') => {
    setActiveView('main');
    setActiveMainView(tab);
  };

  const handleViewJobDetail = (job: Job) => {
    setSelectedJob(job);
    setActiveView('jobDetail');
  };

  const handleViewCompany = async (companyName: string, employerId?: string) => {
    try {
      let res;
      if (employerId) {
        res = await fetch(`/api/company/${employerId}`);
      } else {
        res = await fetch(`/api/company/search/${encodeURIComponent(companyName)}`);
      }
      if (res.ok) {
        const data = await res.json();
        setSelectedCompany(data.profile);
        setCompanyJobs(data.profile.jobs || []);
        setActiveView('companyProfile');
      }
    } catch (err) {
      console.error('Company fetch error:', err);
    }
  };

  return (
    <div className="min-h-screen bg-[#F9FAFB] flex flex-col font-sans text-slate-800">
      {/* Header Navigation */}
      <Header 
        currentUser={currentUser} 
        onLogout={handleLogout} 
        onOpenAuth={handleOpenAuth}
        onOpenNotifications={handleNavigateToNotifications}
        onNavigateToSavedJobs={handleNavigateToSavedJobs}
        onNavigateToProfile={handleNavigateToProfile}
        onViewJobs={handleViewJobList}
        activeView={activeView}
        unreadCount={unreadCount}
        activeMainView={activeMainView}
        onMainViewChange={handleMainViewChange}
      />

      {/* Main Content Area */}
      <main className="flex-1">
        {activeView === 'profile' && viewingProfileUserId ? (
          currentUser?.role === 'employer' ? (
            <CompanyProfilePublic 
              userId={viewingProfileUserId}
              currentUser={currentUser}
              onBack={() => {
                setActiveView('main');
                setActiveMainView('home');
                setViewingProfileUserId(null);
              }}
            />
          ) : (
            <PublicProfilePage 
              userId={viewingProfileUserId}
              currentUser={currentUser}
              onProfileUpdated={handleProfileUpdated}
              onBack={() => {
                setActiveView('main');
                setActiveMainView('home');
                setViewingProfileUserId(null);
              }}
            />
          )
        ) : activeView === 'notifications' && currentUser ? (
          <div className="min-h-screen bg-slate-50 py-8">
            <div className="max-w-4xl mx-auto px-4">
              <button 
                onClick={() => setActiveView('main')}
                className="mb-4 text-sm text-slate-600 hover:text-slate-900 flex items-center gap-2"
              >
                ← Back
              </button>
              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-slate-900">Bildirimler</h2>
                  {unreadCount > 0 && (
                    <button
                      onClick={handleMarkAllAsRead}
                      className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                    >
                      Tümünü Okundu İşaretle
                    </button>
                  )}
                </div>
                {notifications.length === 0 ? (
                  <div className="text-center py-12">
                    <Bell className="h-16 w-16 text-slate-300 mx-auto mb-4" />
                    <p className="text-slate-600 font-semibold">Henüz bildirim yok</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {notifications.map((notif) => (
                      <div
                        key={notif.id}
                        className={`p-4 rounded-xl border transition ${
                          notif.isRead
                            ? 'bg-slate-50 border-slate-200'
                            : 'bg-blue-50 border-blue-200'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1">
                            <h3 className="font-semibold text-slate-900">{notif.title}</h3>
                            <p className="text-sm text-slate-600 mt-1">{notif.message}</p>
                            <p className="text-xs text-slate-500 mt-2">{notif.createdAt}</p>
                          </div>
                          {!notif.isRead && (
                            <button
                              onClick={() => handleMarkAsRead(notif.id)}
                              className="text-xs text-blue-600 hover:text-blue-700"
                            >
                              Okundu
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : activeView === 'savedJobs' && currentUser ? (
          <SavedJobsPage 
            currentUser={currentUser} 
            onBack={() => setActiveView('main')} 
          />
        ) : activeView === 'jobList' ? (
          currentUser ? (
            <JobListPage
              currentUser={currentUser}
              onViewDetail={handleViewJobDetail}
              onOpenAuth={handleOpenAuth}
            />
          ) : (
            (() => {
              setActiveView('main');
              setShowAuthModal(true);
              return null;
            })()
          )
        ) : activeView === 'jobDetail' && selectedJob ? (
          currentUser ? (
            <JobDetailPage
              job={selectedJob}
              currentUser={currentUser}
              onBack={() => setActiveView('jobList')}
              onOpenAuth={handleOpenAuth}
              onApplied={fetchNotifications}
              onViewCompany={handleViewCompany}
            />
          ) : (
            (() => {
              setActiveView('main');
              setShowAuthModal(true);
              return null;
            })()
          )
        ) : activeView === 'companyProfile' && selectedCompany ? (
          <CompanyProfilePage
            company={selectedCompany}
            jobs={companyJobs}
            onBack={() => setActiveView('jobDetail')}
            onViewJob={(job) => { setSelectedJob(job); setActiveView('jobDetail'); }}
          />
        ) : activeView === 'candidateCVs' && currentUser?.role === 'employer' ? (
          <CandidateCVPage
            employerJobs={JSON.parse(localStorage.getItem('kariyer_kapisi_posted_jobs') || '[]')
              .filter((j: Job) => j.employerId === currentUser.id)}
            onViewDetail={(cv) => { setSelectedCV(cv); }}
          />
        ) : currentUser ? (
          currentUser.role === 'admin' ? (
            <AdminDashboard currentUser={currentUser} />
          ) : activeMainView === 'network' ? (
            <NetworkDashboard currentUser={currentUser} onViewProfile={handleViewProfile} />
          ) : activeMainView === 'applications' && currentUser.role === 'candidate' ? (
            <CandidateDashboard 
              currentUser={currentUser} 
              onProfileUpdated={handleProfileUpdated}
              activeTab="applications"
            />
          ) : currentUser.role === 'candidate' ? (
            <CandidateDashboard 
              currentUser={currentUser} 
              onProfileUpdated={handleProfileUpdated}
              activeTab="home"
            />
          ) : (
            <EmployerDashboard 
              currentUser={currentUser}
              onNotificationChange={fetchNotifications}
              onViewCandidateCVs={() => setActiveView('candidateCVs')}
              onViewJobList={() => setActiveView('jobList')}
            />
          )
        ) : (
          <div className="space-y-0">
            {/* Landing Hero */}
            <Hero onOpenAuth={handleOpenAuth} onViewJobs={handleViewJobList} />

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

export default function App() {
  return (
    <LanguageProvider>
      <ErrorBoundary>
        <AppContent />
      </ErrorBoundary>
    </LanguageProvider>
  );
}
