import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Briefcase, LayoutDashboard, User, Bookmark, HelpCircle, 
  LogOut, Sparkles, Brain, Bell, Settings, Menu, X, Users, 
  TrendingUp, Compass, MessageSquare, ShieldCheck, HeartHandshake, Eye
} from 'lucide-react';

import { INITIAL_CANDIDATES, INITIAL_JOBS } from './data';
import { Candidate, Job } from './types';
import CandidateDashboard from './components/CandidateDashboard';
import RecruiterDashboard from './components/RecruiterDashboard';
import JobsList from './components/JobsList';
import MatchDetail from './components/MatchDetail';
import CVUploadModal from './components/CVUploadModal';

export default function App() {
  const [role, setRole] = useState<'candidate' | 'recruiter'>('candidate');
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [candidates, setCandidates] = useState<Candidate[]>(INITIAL_CANDIDATES);
  const [jobs, setJobs] = useState<Job[]>(INITIAL_JOBS);
  
  // Selected state for detail views
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate>(INITIAL_CANDIDATES[0]);
  const [selectedJob, setSelectedJob] = useState<Job>(INITIAL_JOBS[1]); // Senior Frontend Developer default
  
  // CV Upload modal state
  const [isCVModalOpen, setIsCVModalOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  // Custom toast notification for interactive actions
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (message: string) => {
    setToastMessage(message);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  const handleCVAnalysisComplete = (newCandidate: Candidate) => {
    // Add or update the candidate
    const exists = candidates.find(c => c.id === newCandidate.id);
    if (!exists) {
      setCandidates(prev => [newCandidate, ...prev]);
    }
    setSelectedCandidate(newCandidate);
    // Auto shift to dashboard to see strength update
    setActiveTab('dashboard');
    showToast(`🤖 Yapay Zeka CV Analizi Başarılı! Hoş geldin, ${newCandidate.name}. Profil gücün %85 seviyesine güncellendi.`);
  };

  const handleAddNewJob = (newJob: Job) => {
    setJobs(prev => [newJob, ...prev]);
    showToast(`💼 Yeni iş ilanı "${newJob.title}" başarıyla oluşturuldu ve yapay zeka eşleştirme kuyruğuna alındı!`);
  };

  const handleSelectJobDetail = (jobId: string) => {
    const job = jobs.find(j => j.id === jobId);
    if (job) {
      setSelectedJob(job);
      setActiveTab('match-detail');
    }
  };

  const handleSelectCandidateDetail = (candidateId: string, jobId: string) => {
    const cand = candidates.find(c => c.id === candidateId);
    const job = jobs.find(j => j.id === jobId);
    if (cand && job) {
      setSelectedCandidate(cand);
      setSelectedJob(job);
      setActiveTab('match-detail');
    }
  };

  return (
    <div className="bg-[#f7f9fb] min-h-screen flex flex-col font-sans text-slate-800 antialiased selection:bg-secondary/10 selection:text-secondary">
      
      {/* Top Navbar Header */}
      <header className="bg-white border-b border-slate-200/80 sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 md:px-8 h-16 flex items-center justify-between">
          
          {/* Logo / Branding */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center text-white shadow-md shadow-primary/10">
              <Brain className="w-5 h-5 text-secondary animate-pulse" />
            </div>
            <div>
              <span className="font-display font-extrabold text-xl tracking-tight text-primary">Kariyer Kapısı</span>
              <span className="text-[10px] font-bold text-secondary uppercase tracking-wider block -mt-1 font-mono">Yapay Zeka Portal</span>
            </div>
          </div>

          {/* Center portal switcher & links */}
          <div className="hidden md:flex items-center gap-6">
            
            {/* Quick role toggle slider */}
            <div className="bg-slate-100 p-1 rounded-xl flex items-center gap-1 border border-slate-200/50">
              <button
                onClick={() => {
                  setRole('candidate');
                  setActiveTab('dashboard');
                }}
                className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  role === 'candidate' 
                    ? 'bg-white text-primary shadow-sm' 
                    : 'text-slate-400 hover:text-slate-600'
                }`}
              >
                <User className="w-3.5 h-3.5" /> Aday Portalı
              </button>
              <button
                onClick={() => {
                  setRole('recruiter');
                  setActiveTab('dashboard');
                }}
                className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  role === 'recruiter' 
                    ? 'bg-white text-primary shadow-sm' 
                    : 'text-slate-400 hover:text-slate-600'
                }`}
              >
                <Briefcase className="w-3.5 h-3.5" /> İşveren Portalı
              </button>
            </div>

            {role === 'candidate' && (
              <nav className="flex items-center gap-4">
                <button 
                  onClick={() => setActiveTab('jobs')}
                  className={`text-sm font-semibold transition-colors cursor-pointer ${
                    activeTab === 'jobs' ? 'text-secondary' : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  İş İlanları
                </button>
                <button 
                  onClick={() => {
                    setActiveTab('dashboard');
                    showToast("📋 Henüz aktif bir başvurunuz bulunmamaktadır.");
                  }}
                  className="text-sm font-semibold text-slate-500 hover:text-slate-800 cursor-pointer"
                >
                  Başvurularım
                </button>
              </nav>
            )}
          </div>

          {/* Right quick settings & avatar */}
          <div className="hidden md:flex items-center gap-3">
            <button className="text-slate-400 hover:text-slate-600 p-1.5 hover:bg-slate-50 rounded-full transition-colors">
              <Bell className="w-4 h-4" />
            </button>
            <button className="text-slate-400 hover:text-slate-600 p-1.5 hover:bg-slate-50 rounded-full transition-colors">
              <Settings className="w-4 h-4" />
            </button>
            <div className="w-px h-6 bg-slate-200 mx-1" />
            <div className="flex items-center gap-2">
              <img 
                src={role === 'candidate' ? selectedCandidate.avatarUrl : "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200"} 
                alt="Profile" 
                className="w-8 h-8 rounded-full object-cover border border-slate-200"
              />
              <span className="text-xs font-bold text-slate-700">
                {role === 'candidate' ? selectedCandidate.name : 'Esra Kara (HR)'}
              </span>
            </div>
          </div>

          {/* Mobile hamburger menu */}
          <button 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden text-slate-600 hover:text-slate-900 focus:outline-none"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>

        </div>
      </header>

      {/* Mobile Menu Backdrop & Sheet */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <div className="fixed inset-0 z-30 md:hidden flex justify-end">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileMenuOpen(false)}
              className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              className="bg-white w-72 h-full z-10 p-6 flex flex-col justify-between shadow-2xl relative border-l border-slate-100"
            >
              <div className="space-y-6">
                <div className="flex items-center gap-2 mb-6">
                  <Brain className="text-secondary w-6 h-6 animate-pulse" />
                  <span className="font-display font-extrabold text-lg text-primary">Kariyer Kapısı</span>
                </div>

                {/* Role Switcher in Mobile menu */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Aktif Portal Rolü</label>
                  <div className="grid grid-cols-2 gap-1 bg-slate-50 p-1 rounded-xl">
                    <button
                      onClick={() => {
                        setRole('candidate');
                        setActiveTab('dashboard');
                        setMobileMenuOpen(false);
                      }}
                      className={`py-2 rounded-lg text-xs font-bold transition-all ${
                        role === 'candidate' ? 'bg-white text-primary shadow-sm' : 'text-slate-400'
                      }`}
                    >
                      Aday
                    </button>
                    <button
                      onClick={() => {
                        setRole('recruiter');
                        setActiveTab('dashboard');
                        setMobileMenuOpen(false);
                      }}
                      className={`py-2 rounded-lg text-xs font-bold transition-all ${
                        role === 'recruiter' ? 'bg-white text-primary shadow-sm' : 'text-slate-400'
                      }`}
                    >
                      İşveren
                    </button>
                  </div>
                </div>

                {/* Mobile Navigation links */}
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Menü</label>
                  <button 
                    onClick={() => {
                      setActiveTab('dashboard');
                      setMobileMenuOpen(false);
                    }}
                    className={`w-full text-left py-2.5 px-3 rounded-lg text-sm font-semibold flex items-center gap-2.5 transition-colors ${
                      activeTab === 'dashboard' ? 'bg-secondary-container/20 text-secondary' : 'text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <LayoutDashboard className="w-4 h-4" /> Dashboard
                  </button>
                  
                  {role === 'candidate' && (
                    <button 
                      onClick={() => {
                        setActiveTab('jobs');
                        setMobileMenuOpen(false);
                      }}
                      className={`w-full text-left py-2.5 px-3 rounded-lg text-sm font-semibold flex items-center gap-2.5 transition-colors ${
                        activeTab === 'jobs' ? 'bg-secondary-container/20 text-secondary' : 'text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      <Briefcase className="w-4 h-4" /> İş İlanları
                    </button>
                  )}
                </div>
              </div>

              <div className="pt-6 border-t border-slate-100 flex items-center gap-3">
                <img 
                  src={role === 'candidate' ? selectedCandidate.avatarUrl : "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200"} 
                  alt="Avatar" 
                  className="w-10 h-10 rounded-full object-cover"
                />
                <div>
                  <div className="text-sm font-bold text-slate-800">
                    {role === 'candidate' ? selectedCandidate.name : 'Esra Kara (HR)'}
                  </div>
                  <div className="text-xs text-slate-400">Giriş Yapıldı</div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Portal Container Layout (Sidebar on desktop, content on right) */}
      <div className="max-w-7xl mx-auto w-full px-4 md:px-8 py-8 flex-1 flex flex-col md:flex-row gap-8">
        
        {/* Left Sidebar on Desktop */}
        <aside className="hidden md:flex flex-col w-64 shrink-0 bg-white border border-slate-200/80 rounded-2xl p-4 shadow-[0_4px_20px_rgba(30,41,59,0.02)] h-[calc(100vh-140px)] sticky top-24">
          
          <div className="flex-1 space-y-1">
            <button 
              onClick={() => setActiveTab('dashboard')}
              className={`w-full text-left px-3.5 py-3 rounded-xl font-bold text-sm flex items-center gap-3 transition-all cursor-pointer ${
                activeTab === 'dashboard' 
                  ? 'bg-secondary-container/20 text-on-secondary-container shadow-sm scale-95' 
                  : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50/50'
              }`}
            >
              <LayoutDashboard className="w-4 h-4" /> Dashboard
            </button>

            {role === 'candidate' ? (
              <>
                <button 
                  onClick={() => {
                    setSelectedCandidate(INITIAL_CANDIDATES[0]);
                    setActiveTab('dashboard');
                    showToast("👤 Profil ekranınız başarıyla güncellendi.");
                  }}
                  className="w-full text-left px-3.5 py-3 rounded-xl font-bold text-sm text-slate-500 hover:text-slate-800 hover:bg-slate-50/50 flex items-center gap-3 transition-all cursor-pointer"
                >
                  <User className="w-4 h-4" /> Profil
                </button>
                <button 
                  onClick={() => setActiveTab('jobs')}
                  className={`w-full text-left px-3.5 py-3 rounded-xl font-bold text-sm flex items-center gap-3 transition-all cursor-pointer ${
                    activeTab === 'jobs' 
                      ? 'bg-secondary-container/20 text-on-secondary-container shadow-sm scale-95' 
                      : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50/50'
                  }`}
                >
                  <Briefcase className="w-4 h-4" /> İş İlanları
                </button>
                <button 
                  onClick={() => showToast("🔖 Kaydedilen ilanınız bulunmamaktadır.")}
                  className="w-full text-left px-3.5 py-3 rounded-xl font-bold text-sm text-slate-500 hover:text-slate-800 hover:bg-slate-50/50 flex items-center gap-3 transition-all cursor-pointer"
                >
                  <Bookmark className="w-4 h-4" /> Kaydedilen İlanlar
                </button>
              </>
            ) : (
              <>
                <button 
                  onClick={() => showToast("💼 Aktif ilanlarınız yükleniyor...")}
                  className="w-full text-left px-3.5 py-3 rounded-xl font-bold text-sm text-slate-500 hover:text-slate-800 hover:bg-slate-50/50 flex items-center gap-3 transition-all cursor-pointer"
                >
                  <Briefcase className="w-4 h-4" /> Aktif İlanlar
                </button>
                <button 
                  onClick={() => showToast("👥 Aday havuzu detayları yükleniyor...")}
                  className="w-full text-left px-3.5 py-3 rounded-xl font-bold text-sm text-slate-500 hover:text-slate-800 hover:bg-slate-50/50 flex items-center gap-3 transition-all cursor-pointer"
                >
                  <Users className="w-4 h-4" /> Aday Havuzu
                </button>
                <button 
                  onClick={() => showToast("📊 Analiz paneli yükleniyor...")}
                  className="w-full text-left px-3.5 py-3 rounded-xl font-bold text-sm text-slate-500 hover:text-slate-800 hover:bg-slate-50/50 flex items-center gap-3 transition-all cursor-pointer"
                >
                  <Brain className="w-4 h-4" /> Yapay Zeka Analizleri
                </button>
                <button 
                  onClick={() => showToast("📈 Raporlama modülü yükleniyor...")}
                  className="w-full text-left px-3.5 py-3 rounded-xl font-bold text-sm text-slate-500 hover:text-slate-800 hover:bg-slate-50/50 flex items-center gap-3 transition-all cursor-pointer"
                >
                  <TrendingUp className="w-4 h-4" /> Raporlar
                </button>
              </>
            )}
          </div>

          {/* Quick AI status banner inside sidebar */}
          <div className="bg-gradient-to-br from-secondary/10 to-tertiary-container/10 p-4 rounded-xl border border-secondary/20 my-4 text-center">
            <Brain className="w-5 h-5 text-secondary mx-auto mb-1 animate-pulse" />
            <span className="text-[10px] font-bold text-secondary uppercase tracking-wider block">Yapay Zeka Hizmeti</span>
            <span className="text-[11px] font-semibold text-slate-600 block mt-1 leading-snug">
              {role === 'candidate' ? 'Özel iş eşleştirme motoru devrede.' : 'Akıllı aday tarama asistanı aktif.'}
            </span>
          </div>

          {/* Bottom Sidebar actions */}
          <div className="border-t border-slate-150 pt-4 space-y-1">
            <button 
              onClick={() => showToast("ℹ️ Kariyer Kapısı AI Destek Merkezi 24 saat aktiftir.")}
              className="w-full text-left px-3.5 py-2.5 rounded-xl font-semibold text-sm text-slate-500 hover:text-slate-800 hover:bg-slate-50/50 flex items-center gap-3 transition-all cursor-pointer"
            >
              <HelpCircle className="w-4 h-4" /> Yardım Merkezi
            </button>
            <button 
              onClick={() => showToast("🚪 Çıkış yapıldı.")}
              className="w-full text-left px-3.5 py-2.5 rounded-xl font-semibold text-sm text-slate-500 hover:text-rose-600 hover:bg-rose-50/30 flex items-center gap-3 transition-all cursor-pointer"
            >
              <LogOut className="w-4 h-4" /> Çıkış Yap
            </button>
          </div>
        </aside>

        {/* Main Content Area Container */}
        <main className="flex-1 min-w-0">
          <AnimatePresence mode="wait">
            
            {/* Candidate Dashboard */}
            {role === 'candidate' && activeTab === 'dashboard' && (
              <motion.div key="cand_dash" className="w-full">
                <CandidateDashboard 
                  candidate={selectedCandidate}
                  jobs={jobs}
                  onOpenUpload={() => setIsCVModalOpen(true)}
                  onSelectJob={handleSelectJobDetail}
                />
              </motion.div>
            )}

            {/* Recruiter Dashboard */}
            {role === 'recruiter' && activeTab === 'dashboard' && (
              <motion.div key="rec_dash" className="w-full">
                <RecruiterDashboard 
                  jobs={jobs}
                  candidates={candidates}
                  onAddJob={handleAddNewJob}
                  onSelectCandidate={handleSelectCandidateDetail}
                  onSelectJob={handleSelectJobDetail}
                />
              </motion.div>
            )}

            {/* Candidate Jobs Search view */}
            {role === 'candidate' && activeTab === 'jobs' && (
              <motion.div key="jobs_list" className="w-full">
                <JobsList 
                  jobs={jobs}
                  candidate={selectedCandidate}
                  onSelectJob={handleSelectJobDetail}
                />
              </motion.div>
            )}

            {/* Detailed AI Match view */}
            {activeTab === 'match-detail' && (
              <motion.div key="match_detail" className="w-full">
                <MatchDetail 
                  candidate={selectedCandidate}
                  job={selectedJob}
                  onBack={() => setActiveTab('dashboard')}
                  onContact={() => {
                    showToast(`💬 ${role === 'candidate' ? `${selectedJob.company} İK ekibi ile` : `${selectedCandidate.name} ile`} güvenli sohbet kanalı oluşturuldu!`);
                  }}
                />
              </motion.div>
            )}

          </AnimatePresence>
        </main>

      </div>

      {/* Global Toast Notification */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.95 }}
            className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-5 py-4 rounded-xl shadow-2xl max-w-md border border-slate-800 flex items-start gap-3"
            id="global-toast"
          >
            <div className="text-secondary text-base shrink-0">✨</div>
            <div className="flex-1 text-xs leading-relaxed font-semibold">
              {toastMessage}
            </div>
            <button 
              onClick={() => setToastMessage(null)}
              className="text-slate-500 hover:text-slate-300 transition-colors shrink-0"
            >
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Interactive CV Upload Modal */}
      <CVUploadModal 
        isOpen={isCVModalOpen}
        onClose={() => setIsCVModalOpen(false)}
        onAnalysisComplete={handleCVAnalysisComplete}
      />

      {/* Platform footer */}
      <footer className="bg-white border-t border-slate-200 mt-12 py-8">
        <div className="max-w-7xl mx-auto px-4 md:px-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="font-display font-bold text-primary">Kariyer Kapısı</span>
            <span className="text-[10px] bg-slate-100 text-slate-500 px-2 py-0.5 rounded font-bold font-mono">BETA</span>
          </div>
          <div className="flex flex-wrap justify-center gap-6 text-xs font-semibold text-slate-500">
            <a href="#" className="hover:text-primary transition-colors">Gizlilik Politikası</a>
            <a href="#" className="hover:text-primary transition-colors">Kullanım Koşulları</a>
            <a href="#" className="hover:text-primary transition-colors">Yapay Zeka Etiği</a>
            <a href="#" className="hover:text-primary transition-colors">Destek Al</a>
          </div>
          <div className="text-xs text-slate-400">
            © 2026 Kariyer Kapısı AI. Tüm hakları saklıdır.
          </div>
        </div>
      </footer>

    </div>
  );
}
