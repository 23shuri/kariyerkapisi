import React, { useState, useEffect } from 'react';
import { 
  Building, Briefcase, Users, Star, Sparkles, Plus, Trash2, CheckCircle2, 
  MapPin, Clock, Search, RefreshCw, BadgeCheck, BadgeAlert, FileText, ChevronDown, Check, X
} from 'lucide-react';
import { Job, Application, MatchDetail } from '../types';

interface EmployerDashboardProps {
  currentUser: { id: string; fullName: string };
}

export const EmployerDashboard: React.FC<EmployerDashboardProps> = ({ currentUser }) => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  
  // Dashboard overall statistics
  const [stats, setStats] = useState({
    totalJobs: 0,
    totalApplications: 0,
    highMatches: 0,
    inInterview: 0
  });

  // Create Job States
  const [showPostJob, setShowPostJob] = useState(false);
  const [isPosting, setIsPosting] = useState(false);
  const [jobTitle, setJobTitle] = useState('');
  const [jobLocation, setJobLocation] = useState('');
  const [jobType, setJobType] = useState<'Uzaktan' | 'Hibrit' | 'Ofisten'>('Hibrit');
  const [jobSkills, setJobSkills] = useState('');
  const [jobExperience, setJobExperience] = useState('2-3 Yıl');
  const [jobDescription, setJobDescription] = useState('');
  const [jobSalary, setJobSalary] = useState('Rekabetçi');

  // Selected applicant match states
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);
  const [activeMatch, setActiveMatch] = useState<MatchDetail | null>(null);
  const [showMatchModal, setShowMatchModal] = useState(false);
  const [isLoadingMatch, setIsLoadingMatch] = useState(false);
  const [cvDetailText, setCvDetailText] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      // Get jobs
      const jobsRes = await fetch('/api/jobs');
      const jobsData = await jobsRes.json();
      setJobs(jobsData.jobs || []);

      // Get applications
      const appsRes = await fetch(`/api/applications?userId=${currentUser.id}&role=employer`);
      const appsData = await appsRes.json();
      setApplications(appsData.applications || []);

      // Get stats
      const statsRes = await fetch('/api/stats/employer');
      const statsData = await statsRes.json();
      setStats(statsData);
    } catch (err) {
      console.error('Employer data fetch failed:', err);
    }
  };

  useEffect(() => {
    fetchData();
  }, [currentUser.id]);

  // Handle post new job
  const handlePostJob = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsPosting(true);

    const skillsArray = jobSkills.split(',').map(s => s.trim()).filter(s => s.length > 0);

    try {
      const response = await fetch('/api/jobs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: jobTitle,
          company: currentUser.fullName.replace(' İK', ''),
          location: jobLocation,
          type: jobType,
          skills: skillsArray,
          experienceLevel: jobExperience,
          description: jobDescription,
          salaryRange: jobSalary
        })
      });

      if (response.ok) {
        setShowPostJob(false);
        // Reset form
        setJobTitle('');
        setJobLocation('');
        setJobSkills('');
        setJobDescription('');
        
        await fetchData();
      }
    } catch (err) {
      console.error('Post job failed:', err);
    } finally {
      setIsPosting(false);
    }
  };

  // Handle delete job
  const handleDeleteJob = async (jobId: string) => {
    if (!window.confirm('Bu ilanı silmek istediğinize emin misiniz?')) return;
    
    try {
      const res = await fetch(`/api/jobs/${jobId}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        await fetchData();
      }
    } catch (err) {
      console.error('Delete job failed:', err);
    }
  };

  // Handle Application status change
  const handleStatusChange = async (appId: string, newStatus: string) => {
    try {
      const res = await fetch(`/api/applications/${appId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });

      if (res.ok) {
        await fetchData();
      }
    } catch (err) {
      console.error('Update status failed:', err);
    }
  };

  // View Match Report Modal
  const handleViewMatch = async (app: Application) => {
    setSelectedApp(app);
    setShowMatchModal(true);
    setIsLoadingMatch(true);
    setActiveMatch(null);
    setCvDetailText(null);

    try {
      const matchRes = await fetch(`/api/matches/${app.jobId}/${app.candidateId}`);
      const matchData = await matchRes.json();
      setActiveMatch(matchData.match || null);
    } catch (err) {
      console.error('Failed to get match detail:', err);
    } finally {
      setIsLoadingMatch(false);
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 text-slate-800">
      
      {/* 1. Statistics Row */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-4 mb-8">
        
        {/* Stat 1 */}
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Aktif İlanlar</span>
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700">
              <Briefcase className="h-4.5 w-4.5" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-bold text-slate-900 tracking-tight">{stats.totalJobs}</span>
            <span className="text-xs text-slate-400 font-medium">aktif ilan</span>
          </div>
        </div>

        {/* Stat 2 */}
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Toplam Başvuru</span>
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700">
              <Users className="h-4.5 w-4.5" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-bold text-slate-900 tracking-tight">{stats.totalApplications}</span>
            <span className="text-xs text-slate-400 font-medium">toplam aday</span>
          </div>
        </div>

        {/* Stat 3 */}
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm bg-gradient-to-tr from-slate-50/20 to-transparent">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Yüksek AI Eşleşmeli</span>
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700">
              <Sparkles className="h-4.5 w-4.5" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-bold text-slate-900 tracking-tight">%{stats.highMatches > 0 ? Math.round((stats.highMatches / (stats.totalApplications || 1)) * 100) : 0}</span>
            <span className="text-xs text-emerald-700 font-medium">{stats.highMatches} aday &ge; %80</span>
          </div>
        </div>

        {/* Stat 4 */}
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Mülakat Aşaması</span>
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700">
              <CheckCircle2 className="h-4.5 w-4.5" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-bold text-slate-900 tracking-tight">{stats.inInterview}</span>
            <span className="text-xs text-slate-400 font-medium">aktif mülakat</span>
          </div>
        </div>

      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
        
        {/* LEFT COLUMN: Manage Jobs */}
        <div className="lg:col-span-5 space-y-6">
          <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-display text-base font-bold text-slate-900">İlan Yönetimi</h3>
              <button
                onClick={() => setShowPostJob(!showPostJob)}
                className="inline-flex items-center gap-1 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium py-1.5 px-3 rounded-lg shadow-sm transition cursor-pointer"
              >
                <Plus className="h-3.5 w-3.5" />
                İlan Ekle
              </button>
            </div>

            {/* Post Job Panel */}
            {showPostJob && (
              <form onSubmit={handlePostJob} className="mb-6 p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-4">
                <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Yeni İş İlanı Formu</h4>
                
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">Pozisyon Başlığı</label>
                  <input 
                    type="text"
                    required
                    value={jobTitle}
                    onChange={(e) => setJobTitle(e.target.value)}
                    placeholder="Örn: Senior Frontend Developer"
                    className="block w-full rounded-lg border border-slate-200 bg-white py-2 px-3 text-sm outline-none focus:border-emerald-500 transition-all"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">Konum</label>
                    <input 
                      type="text"
                      required
                      value={jobLocation}
                      onChange={(e) => setJobLocation(e.target.value)}
                      placeholder="İstanbul (Hibrit)"
                      className="block w-full rounded-lg border border-slate-200 bg-white py-2 px-3 text-sm outline-none focus:border-emerald-500 transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">Çalışma Şekli</label>
                    <select
                      value={jobType}
                      onChange={(e) => setJobType(e.target.value as any)}
                      className="block w-full rounded-lg border border-slate-200 bg-white py-2 px-3 text-sm outline-none focus:border-emerald-500 transition-all"
                    >
                      <option value="Uzaktan">Uzaktan</option>
                      <option value="Hibrit">Hibrit</option>
                      <option value="Ofisten">Ofisten</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">Tecrübe Seviyesi</label>
                    <input 
                      type="text"
                      value={jobExperience}
                      onChange={(e) => setJobExperience(e.target.value)}
                      placeholder="Örn: 3-5 Yıl"
                      className="block w-full rounded-lg border border-slate-200 bg-white py-2 px-3 text-sm outline-none focus:border-emerald-500 transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">Ücret Aralığı</label>
                    <input 
                      type="text"
                      value={jobSalary}
                      onChange={(e) => setJobSalary(e.target.value)}
                      placeholder="Örn: Rekabetçi"
                      className="block w-full rounded-lg border border-slate-200 bg-white py-2 px-3 text-sm outline-none focus:border-emerald-500 transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">Aranan Yetenekler (Virgülle Ayırın)</label>
                  <input 
                    type="text"
                    value={jobSkills}
                    onChange={(e) => setJobSkills(e.target.value)}
                    placeholder="React, TypeScript, CSS"
                    className="block w-full rounded-lg border border-slate-200 bg-white py-2 px-3 text-sm outline-none focus:border-emerald-500 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">İş Açıklaması</label>
                  <textarea 
                    rows={4}
                    required
                    value={jobDescription}
                    onChange={(e) => setJobDescription(e.target.value)}
                    placeholder="Görev tanımları ve aranan teknik kriterleri buraya yazın..."
                    className="block w-full rounded-lg border border-slate-200 bg-white py-2 px-3 text-xs outline-none focus:border-emerald-500 transition-all"
                  />
                </div>

                <div className="flex justify-end space-x-2">
                  <button
                    type="button"
                    onClick={() => setShowPostJob(false)}
                    className="bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-medium py-1.5 px-3.5 rounded-lg transition cursor-pointer"
                  >
                    İptal
                  </button>
                  <button
                    type="submit"
                    disabled={isPosting}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium py-1.5 px-4 rounded-lg shadow-sm transition disabled:opacity-50 cursor-pointer"
                  >
                    {isPosting ? 'Yayınlanıyor...' : 'İlanı Yayınla'}
                  </button>
                </div>
              </form>
            )}

            {/* List of Posted Jobs */}
            <div className="space-y-3">
              {jobs.map((job) => (
                <div key={job.id} className="p-4 rounded-2xl border border-slate-100 hover:border-slate-200 bg-white flex justify-between items-start transition-all duration-150">
                  <div>
                    <h4 className="text-sm font-semibold text-slate-900">{job.title}</h4>
                    <p className="text-[11px] text-slate-400 mt-0.5">{job.location} &bull; {job.type}</p>
                    <div className="flex items-center gap-2 mt-2.5">
                       <span className="inline-flex items-center rounded-md bg-slate-50 border border-slate-200/70 px-1.5 py-0.5 text-[10px] font-medium text-slate-600">
                        {job.applicationCount} başvuru
                      </span>
                      {job.candidateMatchesCount > 0 && (
                        <span className="inline-flex items-center rounded-md bg-emerald-50 border border-emerald-100/50 px-1.5 py-0.5 text-[10px] font-medium text-emerald-700">
                          {job.candidateMatchesCount} yüksek eşleşme
                        </span>
                      )}
                    </div>
                  </div>

                  <button
                    onClick={() => handleDeleteJob(job.id)}
                    className="text-slate-400 hover:text-red-500 p-1 rounded-lg hover:bg-red-50 transition cursor-pointer"
                    title="İlanı Sil"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
              {/* RIGHT COLUMN: Applicants & Applications Feed */}
        <div className="lg:col-span-7 space-y-6">
          <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm">
            <h3 className="font-display text-base font-bold text-slate-900 mb-5">Gelen Başvurular</h3>

            <div className="space-y-4">
              {applications.length === 0 ? (
                <div className="text-center py-12 border border-dashed border-slate-200 rounded-2xl bg-slate-50/30">
                  <Users className="h-10 w-10 text-slate-300 mx-auto mb-3" />
                  <p className="text-sm font-semibold text-slate-900">Henüz Başvuru Alınmadı</p>
                  <p className="text-xs text-slate-400 mt-1">İlanlarınız yayınlandıkça başvurular buraya düşecektir.</p>
                </div>
              ) : (
                applications.map((app) => {
                  const appliedJob = jobs.find(j => j.id === app.jobId);
                  return (
                    <div 
                      key={app.id} 
                      className="group border border-slate-100 rounded-2xl p-5 hover:border-emerald-100 hover:shadow-sm transition duration-150 bg-white"
                    >
                      <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
                        
                        {/* Profile left header info */}
                        <div className="flex items-center space-x-4">
                          {app.candidateAvatarUrl ? (
                            <img 
                              src={app.candidateAvatarUrl} 
                              alt={app.candidateName} 
                              className="h-11 w-11 rounded-lg object-cover ring-2 ring-slate-100"
                              referrerPolicy="no-referrer"
                            />
                          ) : (
                            <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700 font-semibold text-sm">
                              {app.candidateName.charAt(0).toUpperCase()}
                            </div>
                          )}
                          <div>
                            <h4 className="text-sm font-semibold text-slate-900">{app.candidateName}</h4>
                            <p className="text-xs text-slate-500 font-medium">{app.candidateTitle}</p>
                            <p className="text-[10px] font-semibold text-emerald-600 mt-1 uppercase tracking-wider">
                              Pozisyon: {appliedJob?.title || 'Pozisyon'}
                            </p>
                          </div>
                        </div>

                        {/* Right Match score badge */}
                        <div className="flex items-center gap-2 self-start sm:self-center">
                          <button
                            onClick={() => handleViewMatch(app)}
                            className="flex items-center gap-1 border border-emerald-100 bg-emerald-50/50 hover:bg-emerald-100 text-emerald-750 text-xs font-medium py-1.5 px-3 rounded-lg transition cursor-pointer"
                          >
                            <Sparkles className="h-3.5 w-3.5 text-emerald-600" />
                            AI Uyum: %{app.matchScore}
                          </button>
                        </div>

                      </div>

                      {/* Lower actions status bar */}
                      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-slate-100 mt-4 pt-3.5">
                        <span className="text-xs font-medium text-slate-400">
                          Başvuru Tarihi: {app.appliedAt}
                        </span>

                        {/* Status selector */}
                        <div className="flex items-center space-x-1.5">
                          <span className="text-[11px] font-semibold text-slate-500 mr-1.5">Aşama:</span>
                          {['Yeni', 'Mülakat', 'Reddedildi', 'Kabul Edildi'].map((status) => (
                            <button
                              key={status}
                              onClick={() => handleStatusChange(app.id, status)}
                              className={`py-1 px-2.5 text-[10px] font-medium rounded-lg transition border cursor-pointer ${
                                app.status === status 
                                  ? 'bg-emerald-600 text-white border-emerald-600' 
                                  : 'bg-white hover:bg-slate-50 text-slate-600 border-slate-200'
                              }`}
                            >
                              {status}
                            </button>
                          ))}
                        </div>
                      </div>

                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

      </div>

      {/* MATCH REPORT DIALOG MODAL */}
      {showMatchModal && selectedApp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setShowMatchModal(false)} />
          
          <div className="relative w-full max-w-2xl overflow-hidden rounded-3xl bg-white shadow-xl border border-slate-100 transition-all max-h-[90vh] flex flex-col animate-in fade-in duration-200">
            
            {/* Modal Header */}
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-emerald-50/30 via-white to-white">
              <div>
                <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md uppercase">
                  Aday Analizi
                </span>
                <h3 className="font-display text-base font-bold text-slate-900 mt-1">
                  {selectedApp.candidateName} - Eşleşme Raporu
                </h3>
              </div>
              <button 
                onClick={() => setShowMatchModal(false)}
                className="text-slate-400 hover:text-slate-600 bg-slate-50 rounded-full p-1.5 transition cursor-pointer"
              >
                Kapat
              </button>
            </div>

            {/* Modal Scroll Content */}
            <div className="p-6 overflow-y-auto space-y-6 flex-1">
              {isLoadingMatch ? (
                <div className="flex flex-col items-center py-12">
                  <RefreshCw className="h-8 w-8 text-emerald-600 animate-spin mb-4" />
                  <p className="text-sm font-semibold text-slate-900">Yapay Zeka Analiz Ediyor...</p>
                  <p className="text-xs text-slate-400 mt-1">Gemini kriterleri iş ilanına göre tartıyor</p>
                </div>
              ) : activeMatch ? (
                <>
                  {/* Score circle layout */}
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center bg-slate-50/50 p-6 rounded-2xl border border-slate-100">
                    <div className="md:col-span-4 flex flex-col items-center">
                      <div className="relative flex items-center justify-center h-24 w-24 rounded-full bg-white shadow-sm border-4 border-emerald-500">
                        <span className="font-mono text-2xl font-bold text-slate-950">%{activeMatch.matchScore}</span>
                        <div className="absolute -bottom-2 bg-emerald-600 text-white text-[9px] font-semibold px-2 py-0.5 rounded-full uppercase tracking-wider">
                          Yapay Zeka
                        </div>
                      </div>
                    </div>
                    
                    <div className="md:col-span-8 space-y-2">
                      <p className="text-xs font-semibold text-emerald-950 uppercase tracking-wider">MÜLAKAT ÖNCESİ DEĞERLENDİRME</p>
                      <p className="text-sm text-slate-600 leading-relaxed font-medium">
                        {activeMatch.description}
                      </p>
                    </div>
                  </div>

                  {/* Attribute alignment scores */}
                  <div className="space-y-3">
                    <h4 className="text-xs font-semibold text-slate-900 uppercase tracking-wider">Analiz Metrikleri</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      
                      {/* Skill Alignment */}
                      <div className="bg-white border border-slate-100 rounded-xl p-3.5 shadow-sm">
                        <span className="text-xs text-slate-500 font-medium block">Yetenek Uyuşması</span>
                        <div className="flex items-center justify-between mt-2">
                          <span className="text-lg font-bold text-slate-900">%{activeMatch.skillAlignment}</span>
                          <div className="h-1.5 w-16 bg-slate-100 rounded-full overflow-hidden">
                            <div className="h-full bg-emerald-500" style={{ width: `${activeMatch.skillAlignment}%` }} />
                          </div>
                        </div>
                      </div>

                      {/* Experience Alignment */}
                      <div className="bg-white border border-slate-100 rounded-xl p-3.5 shadow-sm">
                        <span className="text-xs text-slate-500 font-medium block">Deneyim Seviyesi</span>
                        <div className="flex items-center justify-between mt-2">
                          <span className="text-lg font-bold text-slate-900">%{activeMatch.experienceAlignment}</span>
                          <div className="h-1.5 w-16 bg-slate-100 rounded-full overflow-hidden">
                            <div className="h-full bg-teal-500" style={{ width: `${activeMatch.experienceAlignment}%` }} />
                          </div>
                        </div>
                      </div>

                      {/* Cultural Alignment */}
                      <div className="bg-white border border-slate-100 rounded-xl p-3.5 shadow-sm">
                        <span className="text-xs text-slate-500 font-medium block">Kültürel Uyum</span>
                        <div className="flex items-center justify-between mt-2">
                          <span className="text-lg font-bold text-slate-900">%{activeMatch.culturalAlignment}</span>
                          <div className="h-1.5 w-16 bg-slate-100 rounded-full overflow-hidden">
                            <div className="h-full bg-green-500" style={{ width: `${activeMatch.culturalAlignment}%` }} />
                          </div>
                        </div>
                      </div>

                    </div>
                  </div>

                  {/* Bullet Highlights */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    
                    {/* Strong points */}
                    <div className="space-y-2.5">
                      <h4 className="text-xs font-semibold text-emerald-800 uppercase tracking-wider flex items-center gap-1.5">
                        <BadgeCheck className="h-4.5 w-4.5 text-emerald-600" />
                        Adayın Öne Çıkan Yönleri
                      </h4>
                      <ul className="space-y-2">
                        {activeMatch.strongPoints.map((point, idx) => (
                          <li key={idx} className="text-xs text-slate-600 bg-emerald-50/40 p-2.5 rounded-xl border border-emerald-100/40 leading-relaxed">
                            {point}
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Development areas */}
                    <div className="space-y-2.5">
                      <h4 className="text-xs font-semibold text-amber-800 uppercase tracking-wider flex items-center gap-1.5">
                        <BadgeAlert className="h-4 w-4 text-amber-600" />
                        Gelişim/Soru İşareti Alanları
                      </h4>
                      <ul className="space-y-2">
                        {activeMatch.developmentAreas.map((point, idx) => (
                          <li key={idx} className="text-xs text-slate-600 bg-amber-50/40 p-2.5 rounded-xl border border-amber-100/40 leading-relaxed">
                            {point}
                          </li>
                        ))}
                      </ul>
                    </div>

                  </div>
                </>
              ) : (
                <div className="text-center py-6 text-gray-500 text-sm">
                  Değerlendirme yüklenemedi. Lütfen tekrar deneyin.
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-slate-100 bg-slate-50/50 flex justify-between items-center">
              <span className="text-[11px] text-slate-400 font-mono">E-posta: {selectedApp.candidateName.toLowerCase().replace(' ', '')}@gmail.com</span>
              <button 
                onClick={() => setShowMatchModal(false)}
                className="bg-slate-900 hover:bg-slate-800 text-white font-medium text-xs py-1.5 px-4 rounded-lg transition cursor-pointer"
              >
                Kapat
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
