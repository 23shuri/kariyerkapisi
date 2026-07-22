import React, { useState, useEffect } from 'react';
import { 
  FileText, Sparkles, MapPin, Award, User, Upload, Search, Briefcase, 
  ChevronRight, BadgeAlert, BadgeCheck, CheckCircle2, RefreshCw, Star, Info, CirclePercent, ArrowUpRight
} from 'lucide-react';
import { User as UserType, Job, Application, MatchDetail } from '../types';

interface CandidateDashboardProps {
  currentUser: UserType;
  onProfileUpdated: (user: UserType) => void;
}

export const CandidateDashboard: React.FC<CandidateDashboardProps> = ({ currentUser, onProfileUpdated }) => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<string>('All');
  
  // Profile Editor / Parser States
  const [isParsing, setIsParsing] = useState(false);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [skillsText, setSkillsText] = useState(currentUser.skills?.join(', ') || '');
  const [fullName, setFullName] = useState(currentUser.fullName);
  const [title, setTitle] = useState(currentUser.title || '');
  const [experienceYears, setExperienceYears] = useState(currentUser.experienceYears || 1);
  const [location, setLocation] = useState(currentUser.location || '');
  const [resumeText, setResumeText] = useState(currentUser.resumeText || '');
  const [dragActive, setDragActive] = useState(false);
  
  // Selected Match/Job details for modal
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [activeMatch, setActiveMatch] = useState<MatchDetail | null>(null);
  const [isApplying, setIsApplying] = useState(false);
  const [showMatchModal, setShowMatchModal] = useState(false);
  const [isLoadingMatch, setIsLoadingMatch] = useState(false);

  // Fetch Jobs & Applications
  const fetchData = async () => {
    try {
      const jobsRes = await fetch('/api/jobs');
      const jobsData = await jobsRes.json();
      setJobs(jobsData.jobs || []);

      const appsRes = await fetch(`/api/applications?userId=${currentUser.id}&role=candidate`);
      const appsData = await appsRes.json();
      setApplications(appsData.applications || []);
    } catch (err) {
      console.error('Data fetching error:', err);
    }
  };

  useEffect(() => {
    fetchData();
  }, [currentUser.id]);

  // Handle CV Parse Upload
  const handleFileUpload = async (file: File) => {
    setIsParsing(true);
    
    // Read file as text if text/pdf/docx (We simulate PDF parse beautifully with base64/text)
    const reader = new FileReader();
    reader.onload = async (e) => {
      const textContent = e.target?.result as string;
      const base64Content = textContent.split(',')[1] || textContent;

      try {
        const response = await fetch('/api/parse-cv', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            fileName: file.name,
            fileBase64: base64Content,
            customText: `Aday: ${file.name.replace(/\.[^/.]+$/, "")}\nSkills: React, Node.js, TypeScript, GraphQL, CSS, HTML, Tailwind.\nDeneyim: 5 yıl.\nKonum: İstanbul.\nRol: Kıdemli Geliştirici.`
          })
        });

        const resData = await response.json();
        if (response.ok && resData.success) {
          const parsed = resData.data;
          
          // Save updated profile
          const profileRes = await fetch(`/api/profile/${currentUser.id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              fullName: parsed.fullName,
              title: parsed.title,
              experienceYears: parsed.experienceYears,
              skills: parsed.skills,
              location: parsed.location,
              resumeText: parsed.resumeText,
              resumeFileName: parsed.resumeFileName,
              profileStrength: parsed.profileStrength
            })
          });

          const profileData = await profileRes.json();
          if (profileRes.ok) {
            onProfileUpdated(profileData.user);
            setFullName(profileData.user.fullName);
            setTitle(profileData.user.title || '');
            setExperienceYears(profileData.user.experienceYears || 1);
            setLocation(profileData.user.location || '');
            setSkillsText(profileData.user.skills?.join(', ') || '');
            setResumeText(profileData.user.resumeText || '');
          }
        }
      } catch (err) {
        console.error('CV Parsing failed:', err);
      } finally {
        setIsParsing(false);
      }
    };

    reader.readAsDataURL(file);
  };

  // Drag and drop handlers
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  // Save manual updates
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingProfile(true);

    const skillsArray = skillsText.split(',').map(s => s.trim()).filter(s => s.length > 0);

    try {
      const response = await fetch(`/api/profile/${currentUser.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName,
          title,
          experienceYears,
          skills: skillsArray,
          location,
          resumeText,
          profileStrength: 90
        })
      });

      const data = await response.json();
      if (response.ok) {
        onProfileUpdated(data.user);
      }
    } catch (err) {
      console.error('Profile save error:', err);
    } finally {
      setIsSavingProfile(false);
    }
  };

  // Submit job application & perform AI Matching
  const handleApply = async (job: Job) => {
    setIsApplying(true);
    setSelectedJob(job);
    setShowMatchModal(true);
    setIsLoadingMatch(true);

    try {
      const response = await fetch('/api/applications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jobId: job.id,
          candidateId: currentUser.id
        })
      });

      const data = await response.json();
      if (response.ok) {
        setActiveMatch(data.match);
        fetchData(); // reload applications
      } else {
        // If already applied, fetch match detail
        const matchRes = await fetch(`/api/matches/${job.id}/${currentUser.id}`);
        const matchData = await matchRes.json();
        setActiveMatch(matchData.match || null);
      }
    } catch (err) {
      console.error('Application failed:', err);
    } finally {
      setIsLoadingMatch(false);
      setIsApplying(false);
    }
  };

  // View Match Report Modal
  const viewMatchReport = async (job: Job) => {
    setSelectedJob(job);
    setShowMatchModal(true);
    setIsLoadingMatch(true);
    setActiveMatch(null);

    try {
      const matchRes = await fetch(`/api/matches/${job.id}/${currentUser.id}`);
      const matchData = await matchRes.json();
      setActiveMatch(matchData.match || null);
    } catch (err) {
      console.error('Failed to get match detail:', err);
    } finally {
      setIsLoadingMatch(false);
    }
  };

  // Filters
  const filteredJobs = jobs.filter(job => {
    const matchesSearch = job.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          job.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          job.skills.some(s => s.toLowerCase().includes(searchQuery.toLowerCase()));
    
    if (filterType === 'All') return matchesSearch;
    return matchesSearch && job.type === filterType;
  });

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 text-slate-800">
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
        
        {/* LEFT COLUMN: Candidate Profile & CV Parser */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Profile card */}
          <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm">
            <div className="flex items-center space-x-4 mb-5">
              {currentUser.avatarUrl ? (
                <img 
                  src={currentUser.avatarUrl} 
                  alt={currentUser.fullName} 
                  className="h-14 w-14 rounded-2xl object-cover ring-2 ring-emerald-50"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 font-bold text-xl">
                  {currentUser.fullName.charAt(0).toUpperCase()}
                </div>
              )}
              <div>
                <h3 className="font-display text-base font-bold text-slate-900">{currentUser.fullName}</h3>
                <p className="text-xs text-slate-400 font-medium">{currentUser.title || 'Başlık Tanımlanmadı'}</p>
              </div>
            </div>

            {/* Profile Strength */}
            <div className="mb-6 rounded-2xl bg-emerald-50/40 p-4 border border-emerald-100/30">
              <div className="flex items-center justify-between text-xs font-semibold text-emerald-950 mb-1.5">
                <span className="flex items-center gap-1">
                  <Sparkles className="h-3.5 w-3.5 text-emerald-600 animate-spin" />
                  Profil Gücü
                </span>
                <span>%{currentUser.profileStrength || 20}</span>
              </div>
              <div className="h-1.5 w-full bg-emerald-100/50 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-emerald-600 rounded-full transition-all duration-500" 
                  style={{ width: `${currentUser.profileStrength || 20}%` }}
                />
              </div>
              <p className="text-[10px] text-emerald-700/80 font-medium mt-1.5 leading-normal">
                {currentUser.profileStrength && currentUser.profileStrength >= 80 
                  ? 'Harika! Özgeçmişiniz başarıyla analiz edildi, ilanlarla eşleşmeye hazırsınız.' 
                  : 'Yapay zeka eşleştirme oranını yükseltmek için CV yükleyin.'}
              </p>
            </div>

            {/* CV Parser File Drop */}
            <div 
              onDragEnter={handleDrag}
              onDragOver={handleDrag}
              onDragLeave={handleDrag}
              onDrop={handleDrop}
              className={`relative border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all ${dragActive ? 'border-emerald-600 bg-emerald-50/20' : 'border-slate-200 hover:border-slate-300 bg-slate-50/30'}`}
            >
              <input 
                type="file" 
                id="cv-file-input" 
                className="hidden" 
                accept=".pdf,.doc,.docx,.txt"
                onChange={(e) => e.target.files && e.target.files[0] && handleFileUpload(e.target.files[0])}
              />
              <label htmlFor="cv-file-input" className="cursor-pointer">
                {isParsing ? (
                  <div className="flex flex-col items-center py-3">
                    <RefreshCw className="h-7 w-7 text-emerald-600 animate-spin mb-3" />
                    <span className="text-xs font-semibold text-slate-900">Özgeçmiş Analiz Ediliyor...</span>
                    <span className="text-[10px] text-slate-400 mt-1">Gemini LLM yetenekleri çıkartıyor</span>
                  </div>
                ) : (
                  <div className="flex flex-col items-center">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white border border-slate-100 shadow-sm text-slate-500 mb-3">
                      <Upload className="h-4 w-4 text-slate-400" />
                    </div>
                    <span className="text-xs font-bold text-slate-900">Yeni CV Yükle (PDF, Word)</span>
                    <span className="text-[10px] text-slate-400 mt-1">Sürükle bırak veya tıkla</span>
                  </div>
                )}
              </label>
            </div>
          </div>

          {/* Quick Profile Editor */}
          <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm">
            <h4 className="font-display text-sm font-bold text-slate-900 mb-4 flex items-center gap-1.5">
              <Award className="h-4 w-4 text-emerald-500" />
              Profil Bilgileri
            </h4>
            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div>
                <label className="block text-[11px] font-semibold text-slate-500 mb-1">Ad Soyad</label>
                <input 
                  type="text" 
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="block w-full rounded-lg border border-slate-200 bg-white py-2 px-3 text-xs outline-none focus:border-emerald-500 transition-all"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-500 mb-1">Unvan</label>
                <input 
                  type="text" 
                  value={title}
                  placeholder="Örn: Frontend Developer"
                  onChange={(e) => setTitle(e.target.value)}
                  className="block w-full rounded-lg border border-slate-200 bg-white py-2 px-3 text-xs outline-none focus:border-emerald-500 transition-all"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-500 mb-1">Deneyim (Yıl)</label>
                  <input 
                    type="number" 
                    value={experienceYears}
                    onChange={(e) => setExperienceYears(Number(e.target.value))}
                    className="block w-full rounded-lg border border-slate-200 bg-white py-2 px-3 text-xs outline-none focus:border-emerald-500 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-500 mb-1">Konum</label>
                  <input 
                    type="text" 
                    value={location}
                    placeholder="İstanbul"
                    onChange={(e) => setLocation(e.target.value)}
                    className="block w-full rounded-lg border border-slate-200 bg-white py-2 px-3 text-xs outline-none focus:border-emerald-500 transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-500 mb-1">Yetenekler (Virgülle Ayırın)</label>
                <input 
                  type="text" 
                  value={skillsText}
                  placeholder="React, TypeScript, Node.js"
                  onChange={(e) => setSkillsText(e.target.value)}
                  className="block w-full rounded-lg border border-slate-200 bg-white py-2 px-3 text-xs outline-none focus:border-emerald-500 transition-all"
                />
              </div>

              <button
                type="submit"
                disabled={isSavingProfile}
                className="w-full bg-slate-900 hover:bg-slate-800 text-white text-xs font-medium py-2 rounded-lg transition cursor-pointer"
              >
                {isSavingProfile ? 'Kaydediliyor...' : 'Profili Güncelle'}
              </button>
            </form>
          </div>
        </div>

        {/* RIGHT COLUMN: Jobs feed & Application statuses */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Dashboard Application History banner */}
          {applications.length > 0 && (
            <div className="rounded-3xl border border-emerald-100/50 bg-emerald-50/20 p-6">
              <h4 className="font-display text-sm font-bold text-emerald-950 mb-3 flex items-center gap-1.5">
                <CheckCircle2 className="h-4.5 w-4.5 text-emerald-600" />
                Mevcut Başvurularınız ({applications.length})
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {applications.map((app) => {
                  const matchingJob = jobs.find(j => j.id === app.jobId);
                  return (
                    <div key={app.id} className="bg-white rounded-2xl border border-emerald-100/30 p-4 flex items-center justify-between shadow-sm">
                      <div>
                        <p className="text-xs font-bold text-slate-900">{matchingJob?.title || 'Pozisyon'}</p>
                        <p className="text-[10px] text-slate-400 font-medium">{matchingJob?.company || 'Şirket'}</p>
                        <div className="flex items-center gap-1.5 mt-2">
                          <span className={`inline-flex items-center rounded px-1.5 py-0.5 text-[9px] font-bold ring-1 ring-inset ${
                            app.status === 'Yeni' ? 'bg-amber-50 text-amber-700 ring-amber-600/10' :
                            app.status === 'Mülakat' ? 'bg-emerald-50 text-emerald-700 ring-emerald-600/10' :
                            app.status === 'Kabul Edildi' ? 'bg-emerald-50 text-emerald-700 ring-emerald-600/10' :
                            'bg-slate-50 text-slate-600 ring-slate-500/10'
                          }`}>
                            {app.status}
                          </span>
                          <span className="text-[10px] font-medium text-slate-400">
                            {app.appliedAt}
                          </span>
                        </div>
                      </div>
                      
                      <button
                        onClick={() => matchingJob && viewMatchReport(matchingJob)}
                        className="flex flex-col items-center justify-center py-1.5 px-2.5 rounded-xl bg-emerald-50/60 hover:bg-emerald-50 text-emerald-700 transition cursor-pointer"
                      >
                        <span className="text-[8px] font-bold uppercase tracking-wider">Eşleşme</span>
                        <span className="text-sm font-bold font-mono">%{app.matchScore}</span>
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Job Feed header search */}
          <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div>
                <h3 className="font-display text-base font-bold text-slate-900">Açık İlanları Keşfet</h3>
                <p className="text-xs text-slate-400 mt-1">Özgeçmişinize en uygun fırsatlar otomatik olarak ön plana çıkarılır.</p>
              </div>
              
              {/* Type Filter */}
              <div className="flex rounded-lg bg-slate-100/80 p-0.5 self-start sm:self-center">
                {['All', 'Uzaktan', 'Hibrit', 'Ofisten'].map((type) => (
                  <button
                    key={type}
                    onClick={() => setFilterType(type)}
                    className={`py-1 px-2.5 text-[10px] font-semibold rounded-md transition cursor-pointer ${filterType === type ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                  >
                    {type === 'All' ? 'Tümü' : type}
                  </button>
                ))}
              </div>
            </div>

            {/* Search Input */}
            <div className="relative mb-6">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                <Search className="h-4 w-4" />
              </span>
              <input 
                type="text" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Pozisyon, şirket veya yetenek arayın..."
                className="block w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2.5 pl-9 pr-4 text-xs text-slate-900 focus:border-emerald-500 focus:bg-white outline-none transition-all"
              />
            </div>

            {/* Job Cards */}
            <div className="space-y-4">
              {filteredJobs.length === 0 ? (
                <div className="text-center py-12 border border-dashed border-slate-200 rounded-2xl bg-slate-50/30">
                  <Briefcase className="h-8 w-8 text-slate-300 mx-auto mb-3" />
                  <p className="text-xs font-bold text-slate-900">Arama Kriterine Uygun İlan Bulunamadı</p>
                  <p className="text-[10px] text-slate-400 mt-1">Farklı anahtar kelimeler girmeyi deneyin.</p>
                </div>
              ) : (
                filteredJobs.map((job) => {
                  const isApplied = applications.some(a => a.jobId === job.id);
                  return (
                    <div 
                      key={job.id} 
                      className="group border border-slate-100 rounded-2xl p-5 hover:border-emerald-100 hover:shadow-sm hover:shadow-emerald-50/10 transition-all duration-200 bg-white"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                        <div>
                          <div className="flex items-center gap-2 mb-1.5">
                            <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50/50 px-1.5 py-0.5 rounded">
                              {job.company}
                            </span>
                            <span className="text-[10px] font-semibold text-slate-400 flex items-center gap-1">
                              <MapPin className="h-3 w-3" />
                              {job.location}
                            </span>
                          </div>
                          
                          <h4 className="text-sm font-bold text-slate-900 group-hover:text-emerald-600 transition-colors">
                            {job.title}
                          </h4>
                          
                          <p className="text-xs text-slate-500 mt-1.5 line-clamp-2">
                            {job.description}
                          </p>

                          {/* Skill badges */}
                          <div className="flex flex-wrap gap-1 mt-3">
                            {job.skills.map((skill, idx) => (
                              <span key={idx} className="inline-flex items-center rounded bg-slate-50 border border-slate-100 px-1.5 py-0.5 text-[9px] font-medium text-slate-500">
                                {skill}
                              </span>
                            ))}
                          </div>
                        </div>

                        {/* Apply & Match buttons */}
                        <div className="flex sm:flex-col items-center justify-between sm:items-end gap-2 shrink-0 border-t sm:border-t-0 border-slate-50 pt-3 sm:pt-0">
                          <span className="text-[10px] font-medium text-slate-400">
                            {job.postedAt}
                          </span>
                          
                          {isApplied ? (
                            <button
                              onClick={() => viewMatchReport(job)}
                              className="inline-flex items-center gap-1 bg-emerald-50/60 hover:bg-emerald-50 text-emerald-700 text-[10px] font-bold py-1.5 px-3.5 rounded-lg transition cursor-pointer"
                            >
                              <Sparkles className="h-3 w-3" />
                              Uyum Raporu
                            </button>
                          ) : (
                            <button
                              onClick={() => handleApply(job)}
                              disabled={isApplying}
                              className="inline-flex items-center gap-1 bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-bold py-1.5 px-3.5 rounded-lg shadow-sm transition disabled:opacity-50 cursor-pointer"
                            >
                              Başvur & Eşleştir
                              <ArrowUpRight className="h-3 w-3" />
                            </button>
                          )}
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
      {showMatchModal && selectedJob && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm" onClick={() => setShowMatchModal(false)} />
          
          <div className="relative w-full max-w-2xl overflow-hidden rounded-3xl bg-white shadow-2xl ring-1 ring-gray-900/5 transition-all max-h-[90vh] flex flex-col">
            
            {/* Modal Header */}
            <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-emerald-50/50 via-white to-white">
              <div>
                <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md uppercase">
                  {selectedJob.company}
                </span>
                <h3 className="font-display text-lg font-extrabold text-gray-900 mt-1">
                  {selectedJob.title} - Uyum Raporu
                </h3>
              </div>
              <button 
                onClick={() => setShowMatchModal(false)}
                className="text-gray-400 hover:text-gray-600 bg-gray-50 rounded-full p-1.5 transition"
              >
                Kapat
              </button>
            </div>

            {/* Modal Scroll Content */}
            <div className="p-6 overflow-y-auto space-y-6 flex-1">
              {isLoadingMatch ? (
                <div className="flex flex-col items-center py-12">
                  <RefreshCw className="h-10 w-10 text-emerald-600 animate-spin mb-4" />
                  <p className="text-base font-bold text-gray-900">Yapay Zeka Analiz Ediyor...</p>
                  <p className="text-xs text-gray-400 mt-1">Gemini CV ve İş İlanı uyum kriterlerini hesaplıyor</p>
                </div>
              ) : activeMatch ? (
                <>
                  {/* Score circle layout */}
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center bg-emerald-50/20 p-6 rounded-2xl border border-emerald-100/40">
                    <div className="md:col-span-4 flex flex-col items-center">
                      <div className="relative flex items-center justify-center h-28 w-28 rounded-full bg-white shadow-md border-4 border-emerald-500">
                        <span className="font-mono text-3xl font-black text-emerald-950">%{activeMatch.matchScore}</span>
                        <div className="absolute -bottom-2.5 bg-emerald-600 text-white text-[9px] font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider">
                          Yapay Zeka
                        </div>
                      </div>
                    </div>
                    
                    <div className="md:col-span-8 space-y-2">
                      <p className="text-xs font-bold text-emerald-950 uppercase tracking-wider">GENEL DEĞERLENDİRME</p>
                      <p className="text-sm text-gray-700 leading-relaxed font-medium">
                        {activeMatch.description}
                      </p>
                    </div>
                  </div>

                  {/* Attribute alignment scores */}
                  <div className="space-y-3.5">
                    <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wider">Kriter Detayları</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      
                      {/* Skill Alignment */}
                      <div className="bg-white border border-gray-100 rounded-xl p-3.5 shadow-sm">
                        <span className="text-xs text-gray-500 font-medium block">Yetenek Uyuşması</span>
                        <div className="flex items-center justify-between mt-2">
                          <span className="text-lg font-black text-gray-900">%{activeMatch.skillAlignment}</span>
                          <div className="h-1.5 w-16 bg-gray-100 rounded-full overflow-hidden">
                            <div className="h-full bg-emerald-500" style={{ width: `${activeMatch.skillAlignment}%` }} />
                          </div>
                        </div>
                      </div>

                      {/* Experience Alignment */}
                      <div className="bg-white border border-gray-100 rounded-xl p-3.5 shadow-sm">
                        <span className="text-xs text-gray-500 font-medium block">Deneyim Seviyesi</span>
                        <div className="flex items-center justify-between mt-2">
                          <span className="text-lg font-black text-gray-900">%{activeMatch.experienceAlignment}</span>
                          <div className="h-1.5 w-16 bg-gray-100 rounded-full overflow-hidden">
                            <div className="h-full bg-teal-500" style={{ width: `${activeMatch.experienceAlignment}%` }} />
                          </div>
                        </div>
                      </div>

                      {/* Cultural Alignment */}
                      <div className="bg-white border border-gray-100 rounded-xl p-3.5 shadow-sm">
                        <span className="text-xs text-gray-500 font-medium block">Kültürel Uyum</span>
                        <div className="flex items-center justify-between mt-2">
                          <span className="text-lg font-black text-gray-900">%{activeMatch.culturalAlignment}</span>
                          <div className="h-1.5 w-16 bg-gray-100 rounded-full overflow-hidden">
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
                      <h4 className="text-xs font-bold text-emerald-800 uppercase tracking-wider flex items-center gap-1.5">
                        <BadgeCheck className="h-4.5 w-4.5 text-emerald-600" />
                        Güçlü Yönler
                      </h4>
                      <ul className="space-y-2">
                        {activeMatch.strongPoints.map((point, idx) => (
                          <li key={idx} className="text-xs text-gray-600 bg-emerald-50/40 p-2.5 rounded-xl border border-emerald-100/40 leading-relaxed">
                            {point}
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Development areas */}
                    <div className="space-y-2.5">
                      <h4 className="text-xs font-bold text-amber-800 uppercase tracking-wider flex items-center gap-1.5">
                        <BadgeAlert className="h-4.5 w-4.5 text-amber-600" />
                        Gelişim Alanları
                      </h4>
                      <ul className="space-y-2">
                        {activeMatch.developmentAreas.map((point, idx) => (
                          <li key={idx} className="text-xs text-gray-600 bg-amber-50/40 p-2.5 rounded-xl border border-amber-100/40 leading-relaxed">
                            {point}
                          </li>
                        ))}
                      </ul>
                    </div>

                  </div>
                </>
              ) : (
                <div className="text-center py-6 text-gray-500 text-sm">
                  Uyum raporu yüklenemedi. Lütfen tekrar deneyin.
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-gray-100 bg-gray-50/50 flex justify-end">
              <button 
                onClick={() => setShowMatchModal(false)}
                className="bg-gray-900 hover:bg-gray-800 text-white font-bold text-xs py-2 px-5 rounded-xl transition"
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
