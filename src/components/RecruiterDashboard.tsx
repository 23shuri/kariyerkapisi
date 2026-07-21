import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  TrendingUp, Briefcase, Users, Brain, Search, Bell, Plus, MapPin, 
  Clock, Zap, Check, Sparkles, X, ChevronRight, HelpCircle 
} from 'lucide-react';
import { Job, Candidate, Application } from '../types';

interface RecruiterDashboardProps {
  jobs: Job[];
  candidates: Candidate[];
  onAddJob: (newJob: Job) => void;
  onSelectCandidate: (candidateId: string, jobId: string) => void;
  onSelectJob: (jobId: string) => void;
}

export default function RecruiterDashboard({ 
  jobs, 
  candidates, 
  onAddJob, 
  onSelectCandidate,
  onSelectJob
}: RecruiterDashboardProps) {
  const [isNewJobModalOpen, setIsNewJobModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  // New job form state
  const [title, setTitle] = useState('');
  const [company, setCompany] = useState('');
  const [location, setLocation] = useState('');
  const [workModel, setWorkModel] = useState('Hibrit');
  const [type, setType] = useState('Tam Zamanlı');
  const [salaryText, setSalaryText] = useState('Rekabetçi');
  const [description, setDescription] = useState('');
  const [skills, setSkills] = useState('');

  const handleCreateJob = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !company) return;

    const newJob: Job = {
      id: `job_${Date.now()}`,
      title,
      company,
      location: location || 'İstanbul',
      workModel,
      type,
      salaryText,
      description: description || 'Yapay zeka destekli akıllı eşleşme özellikli pozisyon.',
      skills: skills ? skills.split(',').map(s => s.trim()) : ['React', 'TypeScript'],
      tags: skills ? skills.split(',').map(s => s.trim()).slice(0, 3) : ['React', 'TypeScript'],
      postedAt: 'Yeni eklendi',
      applicationsCount: 0,
      aiMatchCount: 0,
      logoLetter: company.charAt(0).toUpperCase()
    };

    onAddJob(newJob);
    setIsNewJobModalOpen(false);

    // Reset fields
    setTitle('');
    setCompany('');
    setLocation('');
    setDescription('');
    setSkills('');
  };

  // Filter jobs based on search query
  const filteredJobs = jobs.filter(job => 
    job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    job.company.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 15 }}
      className="space-y-8"
      id="recruiter-dashboard"
    >
      {/* Search and Recruiter Profile Area */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="font-display text-3xl font-bold text-primary">Dashboard Genel Bakış</h2>
          <p className="text-slate-400 font-sans text-sm mt-0.5">
            İşe alım süreçlerinizi yapay zeka destekli analizlerle yönetin.
          </p>
        </div>
        <div className="flex items-center gap-3 self-end">
          {/* Mock Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
            <input 
              type="text" 
              placeholder="Aday veya ilan ara..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full md:w-64 pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-secondary focus:ring-1 focus:ring-secondary text-sm"
            />
          </div>
          {/* Notifications */}
          <button className="w-10 h-10 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-500 hover:bg-slate-50 transition-colors relative">
            <Bell className="w-4 h-4" />
            <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-rose-500 rounded-full" />
          </button>
          {/* Avatar */}
          <img 
            src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200" 
            alt="HR Manager" 
            className="w-10 h-10 rounded-full object-cover border-2 border-slate-100 shadow-sm"
          />
        </div>
      </div>

      {/* Stats Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Stat Card 1 */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-[0_4px_20px_rgba(30,41,59,0.02)] flex items-start justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Aktif İlanlar</p>
            <h3 className="font-display text-4xl font-extrabold text-primary">{jobs.length}</h3>
            <p className="text-xs text-secondary mt-2.5 flex items-center gap-1 font-semibold">
              <TrendingUp className="w-4 h-4" /> Geçen haftaya göre +2
            </p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-primary">
            <Briefcase className="w-5 h-5 text-slate-600" />
          </div>
        </div>

        {/* Stat Card 2 */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-[0_4px_20px_rgba(30,41,59,0.02)] flex items-start justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Toplam Başvuru</p>
            <h3 className="font-display text-4xl font-extrabold text-primary">845</h3>
            <p className="text-xs text-secondary mt-2.5 flex items-center gap-1 font-semibold">
              <TrendingUp className="w-4 h-4" /> Geçen haftaya göre +15%
            </p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-primary">
            <Users className="w-5 h-5 text-slate-600" />
          </div>
        </div>

        {/* Stat Card 3 (AI Focus Aura Glow) */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-[0_4px_20px_rgba(30,41,59,0.02)] flex items-start justify-between relative overflow-hidden">
          {/* Subtle Back Glow */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-secondary/10 to-tertiary-container/10 rounded-bl-full pointer-events-none" />
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1">
              <Brain className="w-4 h-4 text-tertiary-container animate-pulse" /> Yüksek Uyumlu Aday (AI)
            </p>
            <h3 className="font-display text-4xl font-extrabold text-primary">47</h3>
            <p className="text-xs text-slate-400 mt-2.5">
              %85 üzeri eşleşme oranı
            </p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-tertiary-fixed border border-tertiary-container/15 flex items-center justify-center text-on-tertiary-fixed">
            <Brain className="w-5 h-5" />
          </div>
        </div>

      </div>

      {/* Main Grid: Active Jobs List on Left, Top Talent Recommendations on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Side: Active Jobs */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="font-display text-xl font-bold text-primary">Aktif İş İlanları</h3>
            <button 
              onClick={() => setIsNewJobModalOpen(true)}
              className="bg-primary text-white px-4 py-2.5 rounded-xl font-semibold text-xs hover:bg-primary-container transition-colors inline-flex items-center gap-1.5 shadow-sm cursor-pointer"
            >
              <Plus className="w-4 h-4" /> Yeni İlan Ver
            </button>
          </div>

          <div className="space-y-4">
            {filteredJobs.slice(0, 3).map((job) => (
              <div 
                key={job.id}
                onClick={() => onSelectJob(job.id)}
                className="bg-white rounded-2xl p-6 border border-slate-200/60 shadow-[0_4px_20px_rgba(30,41,59,0.02)] hover:border-primary/30 hover:shadow-md transition-all cursor-pointer relative"
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h4 className="font-display font-bold text-base text-primary mb-1">{job.title}</h4>
                    <div className="flex items-center gap-3 text-xs font-sans text-slate-400">
                      <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" /> {job.location} ({job.workModel})</span>
                      <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {job.type}</span>
                    </div>
                  </div>
                  <div className="flex flex-col items-end">
                    <span className="px-2.5 py-1 bg-slate-50 border border-slate-100 rounded-full text-xs font-semibold text-slate-600 flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-secondary" /> Yayında
                    </span>
                    <span className="text-[10px] text-slate-400 mt-2">{job.postedAt}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-100">
                  <div className="flex gap-4">
                    <div className="text-center">
                      <p className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Başvuru</p>
                      <p className="font-bold text-sm text-slate-800">{job.applicationsCount || Math.floor(Math.random() * 80) + 10}</p>
                    </div>
                    <div className="w-px h-8 bg-slate-100" />
                    <div className="text-center">
                      <p className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold flex items-center gap-0.5">
                        AI Uyumlu <Sparkles className="w-3 h-3 text-tertiary-container" />
                      </p>
                      <p className="font-bold text-sm text-tertiary-container">{job.aiMatchCount || Math.floor(Math.random() * 10) + 2}</p>
                    </div>
                  </div>
                  <div className="flex gap-1.5">
                    {job.skills.slice(0, 2).map((skill) => (
                      <span 
                        key={skill}
                        className="px-2 py-1 bg-slate-50 border border-slate-100 rounded text-xs font-medium text-slate-500"
                      >
                        {skill}
                      </span>
                    ))}
                    {job.skills.length > 2 && (
                      <span className="px-2 py-1 bg-slate-50 border border-slate-100 rounded text-xs font-medium text-slate-500">
                        +{job.skills.length - 2}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Side: AI Recruiter Recommendations Sidebar */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-[0_4px_20px_rgba(30,41,59,0.02)] h-full relative overflow-hidden flex flex-col justify-between">
            {/* Soft AI Glow Back */}
            <div className="absolute inset-x-0 top-0 h-48 bg-gradient-to-b from-secondary/5 to-transparent pointer-events-none" />

            <div className="relative z-10">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-display font-bold text-lg text-primary flex items-center gap-2">
                  <Brain className="text-secondary w-5 h-5" /> Öne Çıkan Adaylar
                </h3>
              </div>

              <div className="space-y-4">
                {candidates.map((cand) => {
                  const jobLink = cand.id === 'cand_ayse' ? 'job_frontend_techcorp' : 'job_dataminds';
                  return (
                    <div 
                      key={cand.id}
                      onClick={() => onSelectCandidate(cand.id, jobLink)}
                      className="flex items-start gap-3 p-3 rounded-xl border border-transparent hover:border-slate-100 hover:bg-slate-50/50 transition-all cursor-pointer group"
                    >
                      <img 
                        src={cand.avatarUrl} 
                        alt={cand.name} 
                        className="w-11 h-11 rounded-full object-cover border border-slate-100 shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start gap-1">
                          <div>
                            <h4 className="font-display font-bold text-sm text-slate-800 leading-snug group-hover:text-secondary transition-colors truncate">
                              {cand.name}
                            </h4>
                            <p className="text-[11px] font-sans text-slate-400 truncate">{cand.role}</p>
                          </div>
                          <div className="flex items-center justify-center w-8 h-8 rounded-full border border-secondary/30 bg-secondary/5 shrink-0">
                            <span className="font-display text-[11px] font-extrabold text-secondary">
                              %{cand.id === 'cand_ayse' ? 94 : cand.id === 'cand_can' ? 88 : 76}
                            </span>
                          </div>
                        </div>
                        <div className="mt-2 flex flex-wrap gap-1">
                          {cand.skills.slice(0, 2).map((skill) => (
                            <span 
                              key={skill}
                              className="px-1.5 py-0.5 bg-slate-100 rounded text-[9px] font-semibold text-slate-500"
                            >
                              {skill}
                            </span>
                          ))}
                        </div>
                        <p className="text-[10px] text-slate-400 mt-2 italic">
                          {cand.id === 'cand_ayse' ? 'Senior Frontend Developer' : cand.id === 'cand_can' ? 'Data Scientist' : 'Genel Havuz'} ilanı için öneriliyor.
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <button 
              onClick={() => onSelectJob(jobs[0].id)}
              className="w-full mt-6 py-2.5 border border-slate-200 hover:border-slate-300 rounded-xl text-primary font-semibold text-xs hover:bg-slate-50 transition-colors cursor-pointer relative z-10"
            >
              Tüm Önerileri Gör
            </button>
          </div>
        </div>

      </div>

      {/* New Job Creation Modal */}
      <AnimatePresence>
        {isNewJobModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsNewJobModalOpen(false)}
              className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 15 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 15 }}
              className="bg-white rounded-2xl w-full max-w-xl p-6 shadow-2xl border border-slate-100 relative z-10 overflow-y-auto max-h-[90vh]"
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="font-display font-bold text-xl text-primary">Yeni İş İlanı Yayınla</h3>
                <button 
                  onClick={() => setIsNewJobModalOpen(false)}
                  className="text-slate-400 hover:text-slate-600 transition-colors rounded-full p-1.5 hover:bg-slate-50"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleCreateJob} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Pozisyon Başlığı *</label>
                    <input 
                      type="text" 
                      required
                      placeholder="Örn: Senior React Developer"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-secondary"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Şirket Adı *</label>
                    <input 
                      type="text" 
                      required
                      placeholder="Örn: Tech Solutions"
                      value={company}
                      onChange={(e) => setCompany(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-secondary"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Konum</label>
                    <input 
                      type="text" 
                      placeholder="Örn: İstanbul"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-secondary"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Çalışma Modeli</label>
                    <select 
                      value={workModel}
                      onChange={(e) => setWorkModel(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm bg-white focus:outline-none focus:border-secondary"
                    >
                      <option value="Hibrit">Hibrit</option>
                      <option value="Uzaktan">Uzaktan</option>
                      <option value="Ofisten">Ofisten</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Çalışma Türü</label>
                    <select 
                      value={type}
                      onChange={(e) => setType(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm bg-white focus:outline-none focus:border-secondary"
                    >
                      <option value="Tam Zamanlı">Tam Zamanlı</option>
                      <option value="Yarı Zamanlı">Yarı Zamanlı</option>
                      <option value="Proje Bazlı">Proje Bazlı</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Aranan Teknolojiler & Yetenekler (Virgülle ayırın)</label>
                  <input 
                    type="text" 
                    placeholder="Örn: React, TypeScript, Redux, Node.js"
                    value={skills}
                    onChange={(e) => setSkills(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-secondary"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">İş Tanımı</label>
                  <textarea 
                    placeholder="Aranan nitelikleri ve iş sorumluluklarını yazın..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-secondary resize-none"
                  />
                </div>

                <div className="pt-4 border-t border-slate-100 flex gap-3 justify-end">
                  <button 
                    type="button"
                    onClick={() => setIsNewJobModalOpen(false)}
                    className="px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-600 hover:bg-slate-100"
                  >
                    Vazgeç
                  </button>
                  <button 
                    type="submit"
                    className="px-5 py-2 bg-gradient-to-r from-secondary to-tertiary-container text-white rounded-xl text-sm font-semibold hover:opacity-95"
                  >
                    Yayınla
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
