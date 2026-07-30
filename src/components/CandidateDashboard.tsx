import React, { useState, useEffect } from 'react';
import { 
  FileText, Sparkles, MapPin, Award, User, Upload, Search, Briefcase, 
  ChevronRight, BadgeAlert, BadgeCheck, CheckCircle2, RefreshCw, Star, Info, CirclePercent, ArrowUpRight,
  Building2, Clock, Layers, DollarSign, Users, SlidersHorizontal, X
} from 'lucide-react';
import { User as UserType, Job, Application, MatchDetail } from '../types';

interface CandidateDashboardProps {
  currentUser: UserType;
  onProfileUpdated: (user: UserType) => void;
  activeTab: 'home' | 'applications';
}

export const CandidateDashboard: React.FC<CandidateDashboardProps> = ({ currentUser, onProfileUpdated, activeTab }) => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<string>('All');
  const [filterLocation, setFilterLocation] = useState<string>('All');
  const [filterExperience, setFilterExperience] = useState<string>('All');
  const [minSalary, setMinSalary] = useState<string>('');
  const [maxSalary, setMaxSalary] = useState<string>('');
  const [showFilters, setShowFilters] = useState(false);
  
  // Profile Editor / Parser States
  const [isParsing, setIsParsing] = useState(false);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [saveProfileMessage, setSaveProfileMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const [skillsText, setSkillsText] = useState(currentUser.skills?.join(', ') || '');
  const [fullName, setFullName] = useState(currentUser.fullName);
  const [title, setTitle] = useState(currentUser.title || '');
  const [experienceYears, setExperienceYears] = useState(currentUser.experienceYears || 1);
  const [location, setLocation] = useState(currentUser.location || '');
  const [resumeText, setResumeText] = useState(currentUser.resumeText || '');
  const [dragActive, setDragActive] = useState(false);
  
  // Profile modal states
  const [showProfileViewModal, setShowProfileViewModal] = useState(false);
  const [showProfileEditModal, setShowProfileEditModal] = useState(false);
  
  // Selected Match/Job details for modal
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [activeMatch, setActiveMatch] = useState<MatchDetail | null>(null);
  const [isApplying, setIsApplying] = useState(false);
  const [showMatchModal, setShowMatchModal] = useState(false);
  const [isLoadingMatch, setIsLoadingMatch] = useState(false);

  // Company detail modal
  const [showCompanyModal, setShowCompanyModal] = useState(false);
  const [companyJob, setCompanyJob] = useState<Job | null>(null);

  // Safe JSON parser — returns null if body is empty or not JSON
  const safeJson = async (res: Response) => {
    const text = await res.text();
    if (!text || text.trim() === '') return null;
    try {
      return JSON.parse(text);
    } catch {
      console.error('JSON parse error, raw response:', text.slice(0, 200));
      return null;
    }
  };

  // Fetch Jobs & Applications
  const fetchData = async () => {
    try {
      const jobsRes = await fetch('/api/jobs');
      const jobsData = await safeJson(jobsRes);
      setJobs(jobsData?.jobs || []);

      const appsRes = await fetch(`/api/applications?userId=${currentUser.id}&role=candidate`);
      const appsData = await safeJson(appsRes);
      setApplications(appsData?.applications || []);
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
    
    const reader = new FileReader();
    reader.onload = async (e) => {
      const textContent = e.target?.result as string;

      // For PDF/DOC files: send base64, for .txt files: send raw text
      let fileBase64: string | undefined;
      let customText: string | undefined;

      if (file.type === 'text/plain') {
        // .txt dosyası: düz metin olarak oku
        customText = textContent;
      } else {
        // PDF / DOC / DOCX: base64 olarak gönder
        fileBase64 = textContent.split(',')[1] || textContent;
      }

      try {
        const response = await fetch('/api/parse-cv', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            fileName: file.name,
            fileBase64,
            customText
          })
        });

        const resData = await safeJson(response);
        if (response.ok && resData?.success) {
          const parsed = resData.data;
          
          // Save updated profile — fullName intentionally excluded,
          // so uploading a CV never overwrites the user's registered name.
          const profileRes = await fetch(`/api/profile/${currentUser.id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              title: parsed.title,
              experienceYears: parsed.experienceYears,
              skills: parsed.skills,
              location: parsed.location,
              resumeText: parsed.resumeText,
              resumeFileName: parsed.resumeFileName,
              profileStrength: parsed.profileStrength
            })
          });

          const profileData = await safeJson(profileRes);
          if (profileRes.ok && profileData) {
            onProfileUpdated(profileData.user);
            // fullName state'ini değiştirme — kullanıcının kendi adı korunur
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

    if (file.type === 'text/plain') {
      reader.readAsText(file, 'UTF-8');
    } else {
      reader.readAsDataURL(file);
    }
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
    setSaveProfileMessage(null);

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

      const data = await safeJson(response);
      if (response.ok && data) {
        onProfileUpdated(data.user);
        setSaveProfileMessage({ type: 'success', text: 'Profil başarıyla güncellendi.' });
      } else {
        setSaveProfileMessage({ type: 'error', text: data?.error || 'Profil güncellenemedi.' });
      }
    } catch (err) {
      console.error('Profile save error:', err);
      setSaveProfileMessage({ type: 'error', text: 'Sunucu hatası oluştu.' });
    } finally {
      setIsSavingProfile(false);
      setTimeout(() => setSaveProfileMessage(null), 3000);
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

      const data = await safeJson(response);
      
      if (response.ok && data?.match) {
        setActiveMatch(data.match);
        fetchData();
      } else if (!response.ok) {
        // Başvuru başarısız - modal'ı kapat ve hata göster
        setShowMatchModal(false);
        console.error('Application failed:', data?.error);
      } else {
        // Alternative: match detail'ı fetch et
        const matchRes = await fetch(`/api/matches/${job.id}/${currentUser.id}`);
        const matchData = await safeJson(matchRes);
        setActiveMatch(matchData?.match || null);
        fetchData();
      }
    } catch (err) {
      console.error('Application failed:', err);
      setShowMatchModal(false);
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
      const matchData = await safeJson(matchRes);
      setActiveMatch(matchData?.match || null);
    } catch (err) {
      console.error('Failed to get match detail:', err);
    } finally {
      setIsLoadingMatch(false);
    }
  };

  // Sabit şehir listesi
  const locationOptions = [
    'All',
    'İstanbul', 'Ankara', 'İzmir', 'Bursa', 'Antalya', 'Adana', 'Konya',
    'Gaziantep', 'Mersin', 'Kayseri', 'Eskişehir', 'Trabzon', 'Samsun',
    'Diyarbakır', 'Denizli', 'Kocaeli', 'Sakarya', 'Balıkesir', 'Malatya', 'Manisa'
  ];
  const experienceOptions = ['All', ...Array.from(new Set(jobs.map(j => j.experienceLevel).filter(Boolean)))];

  const activeFilterCount = [
    filterType !== 'All',
    filterLocation !== 'All',
    filterExperience !== 'All',
    minSalary !== '' || maxSalary !== '',
  ].filter(Boolean).length;

  const resetFilters = () => {
    setFilterType('All');
    setFilterLocation('All');
    setFilterExperience('All');
    setMinSalary('');
    setMaxSalary('');
    setSearchQuery('');
  };

  // Filters
  const filteredJobs = jobs.filter(job => {
    const matchesSearch = !searchQuery || 
      job.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
      job.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.skills.some(s => s.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesType = filterType === 'All' || job.type === filterType;
    const matchesLocation = filterLocation === 'All' || job.location.includes(filterLocation);
    const matchesExperience = filterExperience === 'All' || job.experienceLevel === filterExperience;

    // Maaş filtresi — ilandaki sayısal değerleri çek
    let matchesSalary = true;
    if (minSalary !== '' || maxSalary !== '') {
      const salaryNums = (job.salaryRange || '').replace(/\./g, '').match(/\d+/g);
      if (salaryNums && salaryNums.length > 0) {
        const jobMin = parseInt(salaryNums[0]);
        const jobMax = salaryNums.length > 1 ? parseInt(salaryNums[salaryNums.length - 1]) : jobMin;
        if (minSalary !== '' && jobMax < parseInt(minSalary)) matchesSalary = false;
        if (maxSalary !== '' && jobMin > parseInt(maxSalary)) matchesSalary = false;
      } else {
        // Sayısal maaş yoksa (ör: "Rekabetçi") filtreye dahil et
        matchesSalary = true;
      }
    }

    return matchesSearch && matchesType && matchesLocation && matchesExperience && matchesSalary;
  });

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 text-slate-800">
      {activeTab === 'home' ? (
        /* ANA EKRAN - Jobs Feed */
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

            {/* Profile Action Buttons */}
            <div className="flex gap-2 mb-4">
              <button
                onClick={() => setShowProfileViewModal(true)}
                className="flex-1 inline-flex items-center justify-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold py-2 px-3 rounded-lg transition cursor-pointer"
              >
                <User className="h-3.5 w-3.5" />
                Profili Görüntüle
              </button>
              <button
                onClick={() => setShowProfileEditModal(true)}
                className="flex-1 inline-flex items-center justify-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold py-2 px-3 rounded-lg transition cursor-pointer"
              >
                <Award className="h-3.5 w-3.5" />
                Profili Düzenle
              </button>
            </div>

            {/* Profile Strength */}
            <div className="mb-4 rounded-2xl bg-emerald-50/40 p-4 border border-emerald-100/30">
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
          </div>
        </div>

        {/* RIGHT COLUMN: Jobs feed & Application statuses */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Job Feed header search */}
          <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
              <div>
                <h3 className="font-display text-base font-bold text-slate-900">Açık İlanları Keşfet</h3>
                <p className="text-xs text-slate-400 mt-1">
                  {filteredJobs.length} ilan bulundu
                  {activeFilterCount > 0 && <span className="text-emerald-600 font-semibold"> · {activeFilterCount} filtre aktif</span>}
                </p>
              </div>
              <div className="flex items-center gap-2 self-start sm:self-center">
                {/* Çalışma tipi hızlı filtresi */}
                <div className="flex rounded-lg bg-slate-100/80 p-0.5">
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
                {/* Gelişmiş filtreler butonu */}
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className={`relative inline-flex items-center gap-1.5 py-1.5 px-3 rounded-lg text-xs font-semibold border transition cursor-pointer ${showFilters ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'}`}
                >
                  <SlidersHorizontal className="h-3.5 w-3.5" />
                  Filtrele
                  {activeFilterCount > 0 && (
                    <span className="absolute -top-1.5 -right-1.5 h-4 w-4 flex items-center justify-center rounded-full bg-emerald-500 text-white text-[9px] font-bold">
                      {activeFilterCount}
                    </span>
                  )}
                </button>
              </div>
            </div>

            {/* Gelişmiş filtre paneli */}
            {showFilters && (
              <div className="mb-4 p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold text-slate-700">Gelişmiş Filtreler</span>
                  {activeFilterCount > 0 && (
                    <button onClick={resetFilters} className="text-xs text-red-500 hover:text-red-700 font-semibold flex items-center gap-1 cursor-pointer">
                      <X className="h-3 w-3" /> Filtreleri Temizle
                    </button>
                  )}
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {/* Konum */}
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 mb-1 uppercase tracking-wider">
                      <MapPin className="h-3 w-3 inline mr-1" />Şehir
                    </label>
                    <select
                      value={filterLocation}
                      onChange={(e) => setFilterLocation(e.target.value)}
                      className="w-full rounded-lg border border-slate-200 bg-white py-1.5 px-2.5 text-xs text-slate-700 outline-none focus:border-emerald-500 transition cursor-pointer"
                    >
                      {locationOptions.map(opt => (
                        <option key={opt} value={opt}>{opt === 'All' ? 'Tüm Şehirler' : opt}</option>
                      ))}
                    </select>
                  </div>
                  {/* Deneyim */}
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 mb-1 uppercase tracking-wider">
                      <Clock className="h-3 w-3 inline mr-1" />Deneyim
                    </label>
                    <select
                      value={filterExperience}
                      onChange={(e) => setFilterExperience(e.target.value)}
                      className="w-full rounded-lg border border-slate-200 bg-white py-1.5 px-2.5 text-xs text-slate-700 outline-none focus:border-emerald-500 transition cursor-pointer"
                    >
                      {experienceOptions.map(opt => (
                        <option key={opt} value={opt}>{opt === 'All' ? 'Tüm Seviyeler' : opt}</option>
                      ))}
                    </select>
                  </div>
                  {/* Maaş */}
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 mb-1 uppercase tracking-wider">
                      <DollarSign className="h-3 w-3 inline mr-1" />Maaş Aralığı (₺)
                    </label>
                    <div className="flex items-center gap-1.5">
                      <input
                        type="number"
                        value={minSalary}
                        onChange={(e) => setMinSalary(e.target.value)}
                        placeholder="Min"
                        className="w-full rounded-lg border border-slate-200 bg-white py-1.5 px-2.5 text-xs text-slate-700 outline-none focus:border-emerald-500 transition"
                      />
                      <span className="text-slate-400 text-xs font-bold shrink-0">—</span>
                      <input
                        type="number"
                        value={maxSalary}
                        onChange={(e) => setMaxSalary(e.target.value)}
                        placeholder="Max"
                        className="w-full rounded-lg border border-slate-200 bg-white py-1.5 px-2.5 text-xs text-slate-700 outline-none focus:border-emerald-500 transition"
                      />
                    </div>
                    {(minSalary || maxSalary) && (
                      <button
                        onClick={() => { setMinSalary(''); setMaxSalary(''); }}
                        className="text-[10px] text-red-400 hover:text-red-600 mt-1 cursor-pointer"
                      >
                        Temizle
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Search Input */}
            <div className="relative mb-4">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                <Search className="h-4 w-4" />
              </span>
              <input 
                type="text" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Pozisyon, şirket veya yetenek arayın..."
                className="block w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2.5 pl-9 pr-10 text-xs text-slate-900 focus:border-emerald-500 focus:bg-white outline-none transition-all"
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery('')} className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-slate-600">
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
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
                            <button
                              onClick={() => { setCompanyJob(job); setShowCompanyModal(true); }}
                              className="text-[10px] font-bold text-emerald-600 bg-emerald-50/50 hover:bg-emerald-100 px-1.5 py-0.5 rounded transition cursor-pointer underline-offset-2 hover:underline"
                            >
                              {job.company}
                            </button>
                            <span className="text-[10px] font-semibold text-slate-400 flex items-center gap-1">
                              <MapPin className="h-3 w-3" />
                              {job.location}
                            </span>
                          </div>
                          
                          <h4
                            onClick={() => { setCompanyJob(job); setShowCompanyModal(true); }}
                            className="text-sm font-bold text-slate-900 group-hover:text-emerald-600 transition-colors cursor-pointer hover:underline underline-offset-2"
                          >
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
  ) : (
    /* MEVCUT BAŞVURULAR TAB */
    <div className="max-w-5xl mx-auto">
      <div className="mb-6">
        <h2 className="font-display text-2xl font-bold text-slate-900">Mevcut Başvurularım</h2>
        <p className="text-sm text-slate-500 mt-1">Tüm başvurularınızı ve durumlarını bu sayfada görebilirsiniz.</p>
      </div>

      {applications.length === 0 ? (
        <div className="text-center py-20 border border-dashed border-slate-200 rounded-3xl bg-slate-50/30">
          <Briefcase className="h-12 w-12 text-slate-300 mx-auto mb-4" />
          <p className="text-base font-bold text-slate-900">Henüz başvuru yapmadınız</p>
          <p className="text-sm text-slate-400 mt-2">Ana ekrandan iş ilanlarına göz atın ve başvurmaya başlayın.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {applications.map((app) => {
            const matchingJob = jobs.find(j => j.id === app.jobId);
            return (
              <div key={app.id} className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm hover:shadow-md transition">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-bold text-slate-900">{matchingJob?.title || 'Pozisyon'}</h3>
                      <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-bold ring-1 ring-inset ${
                        app.status === 'Yeni' ? 'bg-amber-50 text-amber-700 ring-amber-600/10' :
                        app.status === 'Mülakat' ? 'bg-blue-50 text-blue-700 ring-blue-600/10' :
                        app.status === 'Kabul Edildi' ? 'bg-emerald-50 text-emerald-700 ring-emerald-600/10' :
                        app.status === 'Reddedildi' ? 'bg-red-50 text-red-700 ring-red-600/10' :
                        'bg-slate-50 text-slate-600 ring-slate-500/10'
                      }`}>
                        {app.status}
                      </span>
                    </div>
                    <p className="text-sm text-slate-600 flex items-center gap-2">
                      <Building2 className="h-4 w-4 text-slate-400" />
                      {matchingJob?.company || 'Şirket'}
                    </p>
                    <p className="text-sm text-slate-500 flex items-center gap-2 mt-1">
                      <MapPin className="h-4 w-4 text-slate-400" />
                      {matchingJob?.location || 'Konum belirtilmemiş'}
                    </p>
                    <p className="text-xs text-slate-400 mt-2">
                      Başvuru tarihi: {app.appliedAt}
                    </p>
                  </div>

                  <div className="flex flex-col items-end gap-3">
                    <div className="flex flex-col items-center justify-center py-3 px-4 rounded-xl bg-emerald-50 border border-emerald-100">
                      <span className="text-xs font-bold uppercase tracking-wider text-emerald-700">Eşleşme</span>
                      <span className="text-2xl font-bold font-mono text-emerald-900">%{app.matchScore}</span>
                    </div>
                    <button
                      onClick={() => matchingJob && viewMatchReport(matchingJob)}
                      className="inline-flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold py-2 px-4 rounded-lg transition"
                    >
                      <Sparkles className="h-4 w-4" />
                      Uyum Raporu
                    </button>
                  </div>
                </div>

                {/* Skills */}
                {matchingJob && matchingJob.skills.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-slate-100">
                    <p className="text-xs font-semibold text-slate-500 mb-2">Aranan Yetenekler:</p>
                    <div className="flex flex-wrap gap-1.5">
                      {matchingJob.skills.map((skill, idx) => (
                        <span key={idx} className="inline-flex items-center rounded bg-slate-50 border border-slate-200 px-2 py-1 text-xs font-medium text-slate-600">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  )}

      {/* COMPANY DETAIL MODAL */}
      {showCompanyModal && companyJob && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setShowCompanyModal(false)} />

          <div className="relative w-full max-w-lg overflow-hidden rounded-3xl bg-white shadow-2xl ring-1 ring-slate-900/5 max-h-[90vh] flex flex-col">

            {/* Header */}
            <div className="p-6 border-b border-slate-100 bg-gradient-to-br from-emerald-50 to-white">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-600 text-white font-black text-xl shadow-md">
                    {companyJob.company.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="font-display text-lg font-extrabold text-slate-900 leading-tight">
                      {companyJob.company}
                    </h3>
                    <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-600 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-full mt-1">
                      <MapPin className="h-3 w-3" />
                      {companyJob.location}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => setShowCompanyModal(false)}
                  className="text-slate-400 hover:text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-full p-1.5 transition shrink-0"
                >
                  Kapat
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="p-6 overflow-y-auto flex-1 space-y-5">

              {/* Aranan Pozisyon */}
              <div className="flex items-start gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                  <Briefcase className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Aranan Pozisyon</p>
                  <p className="text-sm font-bold text-slate-900">{companyJob.title}</p>
                </div>
              </div>

              {/* Çalışma Şekli */}
              <div className="flex items-start gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                  <Building2 className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Çalışma Şekli</p>
                  <p className="text-sm font-semibold text-slate-900">{companyJob.type}</p>
                </div>
              </div>

              {/* Deneyim */}
              <div className="flex items-start gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
                  <Clock className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Aranan Deneyim</p>
                  <p className="text-sm font-semibold text-slate-900">{companyJob.experienceLevel}</p>
                </div>
              </div>

              {/* Maaş */}
              <div className="flex items-start gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-green-50 text-green-600">
                  <DollarSign className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Maaş Aralığı</p>
                  <p className="text-sm font-semibold text-slate-900">{companyJob.salaryRange}</p>
                </div>
              </div>

              {/* Başvuru sayısı */}
              <div className="flex items-start gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-purple-50 text-purple-600">
                  <Users className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Başvuru Sayısı</p>
                  <p className="text-sm font-semibold text-slate-900">{companyJob.applicationCount} başvuru · {companyJob.candidateMatchesCount} yüksek eşleşme</p>
                </div>
              </div>

              {/* İlan Tarihi */}
              <div className="flex items-start gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-slate-50 text-slate-500">
                  <Clock className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">İlan Tarihi</p>
                  <p className="text-sm font-semibold text-slate-900">{companyJob.postedAt}</p>
                </div>
              </div>

              {/* Aranan Beceriler */}
              {companyJob.skills.length > 0 && (
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Aranan Beceriler</p>
                  <div className="flex flex-wrap gap-1.5">
                    {companyJob.skills.map((skill, idx) => (
                      <span key={idx} className="inline-flex items-center rounded-lg bg-emerald-50 border border-emerald-100 px-2.5 py-1 text-xs font-semibold text-emerald-700">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Pozisyon Açıklaması */}
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Pozisyon Hakkında</p>
                <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 rounded-xl p-3.5 border border-slate-100">
                  {companyJob.description}
                </p>
              </div>

            </div>

            {/* Footer */}
            <div className="p-4 border-t border-slate-100 bg-slate-50/50 flex justify-end">
              <button
                onClick={() => setShowCompanyModal(false)}
                className="bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs py-2 px-5 rounded-xl transition"
              >
                Kapat
              </button>
            </div>

          </div>
        </div>
      )}

      {/* PROFILE VIEW MODAL */}
      {showProfileViewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setShowProfileViewModal(false)} />
          
          <div className="relative w-full max-w-lg overflow-hidden rounded-3xl bg-white shadow-2xl max-h-[90vh] flex flex-col">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-emerald-50 to-white">
              <h3 className="font-display text-lg font-bold text-slate-900">Profil Bilgilerim</h3>
              <button onClick={() => setShowProfileViewModal(false)} className="text-slate-400 hover:text-slate-600 rounded-full p-1.5 transition">
                ✕
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto flex-1 space-y-4">
              <div className="flex items-center gap-4 mb-4">
                {currentUser.avatarUrl ? (
                  <img src={currentUser.avatarUrl} alt={currentUser.fullName} className="h-16 w-16 rounded-2xl object-cover ring-2 ring-emerald-100" referrerPolicy="no-referrer" />
                ) : (
                  <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 font-bold text-2xl">
                    {currentUser.fullName.charAt(0).toUpperCase()}
                  </div>
                )}
                <div>
                  <h4 className="text-base font-bold text-slate-900">{currentUser.fullName}</h4>
                  <p className="text-sm text-slate-500">{currentUser.email}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-50 rounded-xl p-3">
                  <p className="text-xs font-semibold text-slate-500 mb-1">Unvan</p>
                  <p className="text-sm font-bold text-slate-900">{currentUser.title || 'Belirtilmemiş'}</p>
                </div>
                <div className="bg-slate-50 rounded-xl p-3">
                  <p className="text-xs font-semibold text-slate-500 mb-1">Deneyim</p>
                  <p className="text-sm font-bold text-slate-900">{currentUser.experienceYears || 0} Yıl</p>
                </div>
                <div className="bg-slate-50 rounded-xl p-3">
                  <p className="text-xs font-semibold text-slate-500 mb-1">Konum</p>
                  <p className="text-sm font-bold text-slate-900">{currentUser.location || 'Belirtilmemiş'}</p>
                </div>
                <div className="bg-slate-50 rounded-xl p-3">
                  <p className="text-xs font-semibold text-slate-500 mb-1">Profil Gücü</p>
                  <p className="text-sm font-bold text-emerald-600">%{currentUser.profileStrength || 20}</p>
                </div>
              </div>
              
              <div className="bg-slate-50 rounded-xl p-3">
                <p className="text-xs font-semibold text-slate-500 mb-2">Yetenekler</p>
                <div className="flex flex-wrap gap-1.5">
                  {(currentUser.skills || []).map((skill, idx) => (
                    <span key={idx} className="inline-flex items-center rounded-lg bg-emerald-50 border border-emerald-100 px-2.5 py-1 text-xs font-semibold text-emerald-700">
                      {skill}
                    </span>
                  ))}
                  {(!currentUser.skills || currentUser.skills.length === 0) && (
                    <span className="text-xs text-slate-400">Henüz yetenek eklenmedi</span>
                  )}
                </div>
              </div>
              
              {currentUser.resumeFileName && (
                <div className="bg-emerald-50 rounded-xl p-3 border border-emerald-100">
                  <p className="text-xs font-semibold text-emerald-700 mb-1">📄 CV Dosyası</p>
                  <p className="text-xs text-emerald-600">{currentUser.resumeFileName}</p>
                </div>
              )}
            </div>
            
            <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-end">
              <button onClick={() => setShowProfileViewModal(false)} className="bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs py-2 px-5 rounded-xl transition">
                Kapat
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PROFILE EDIT MODAL */}
      {showProfileEditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setShowProfileEditModal(false)} />
          
          <div className="relative w-full max-w-2xl overflow-hidden rounded-3xl bg-white shadow-2xl max-h-[90vh] flex flex-col">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-emerald-50 to-white">
              <h3 className="font-display text-lg font-bold text-slate-900">Profil Düzenle</h3>
              <button onClick={() => setShowProfileEditModal(false)} className="text-slate-400 hover:text-slate-600 rounded-full p-1.5 transition">
                ✕
              </button>
            </div>
            
            <form onSubmit={handleSaveProfile} className="p-6 overflow-y-auto flex-1 space-y-5">
              
              {/* Avatar Upload Section */}
              <div className="bg-gradient-to-br from-emerald-50/50 to-white rounded-2xl p-5 border border-emerald-100">
                <label className="block text-xs font-bold text-slate-700 mb-3">Profil Fotoğrafı</label>
                <div className="flex items-center gap-4">
                  {currentUser.avatarUrl ? (
                    <img src={currentUser.avatarUrl} alt={currentUser.fullName} className="h-20 w-20 rounded-2xl object-cover ring-2 ring-emerald-100" referrerPolicy="no-referrer" />
                  ) : (
                    <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 font-bold text-2xl ring-2 ring-emerald-100">
                      {currentUser.fullName.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div className="flex-1">
                    <input 
                      type="file" 
                      id="avatar-upload" 
                      className="hidden" 
                      accept="image/*"
                      onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                          const reader = new FileReader();
                          reader.onload = async (ev) => {
                            const base64 = ev.target?.result as string;
                            try {
                              const res = await fetch(`/api/profile/${currentUser.id}`, {
                                method: 'PATCH',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ avatarUrl: base64 })
                              });
                              const data = await res.json();
                              if (res.ok && data.user) {
                                onProfileUpdated(data.user);
                                setSaveProfileMessage({ type: 'success', text: 'Fotoğraf yüklendi!' });
                                setTimeout(() => setSaveProfileMessage(null), 2000);
                              }
                            } catch (err) {
                              console.error('Avatar upload error:', err);
                            }
                          };
                          reader.readAsDataURL(e.target.files[0]);
                        }
                      }}
                    />
                    <label htmlFor="avatar-upload" className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold py-2 px-4 rounded-lg cursor-pointer transition">
                      <Upload className="h-4 w-4" />
                      Fotoğraf Yükle
                    </label>
                    <p className="text-xs text-slate-500 mt-2">JPG, PNG veya GIF formatında, max 2MB</p>
                  </div>
                </div>
              </div>

              {/* CV Upload Section */}
              <div className="bg-gradient-to-br from-blue-50/50 to-white rounded-2xl p-5 border border-blue-100">
                <label className="block text-xs font-bold text-slate-700 mb-3">Özgeçmiş (CV) Yükle ve Analiz Et</label>
                <div 
                  onDragEnter={handleDrag}
                  onDragOver={handleDrag}
                  onDragLeave={handleDrag}
                  onDrop={handleDrop}
                  className={`relative border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all ${dragActive ? 'border-emerald-600 bg-emerald-50/20' : 'border-slate-200 hover:border-slate-300 bg-white'}`}
                >
                  <input 
                    type="file" 
                    id="cv-file-input-modal" 
                    className="hidden" 
                    accept=".pdf,.doc,.docx,.txt"
                    onChange={(e) => e.target.files && e.target.files[0] && handleFileUpload(e.target.files[0])}
                  />
                  <label htmlFor="cv-file-input-modal" className="cursor-pointer">
                    {isParsing ? (
                      <div className="flex flex-col items-center py-3">
                        <RefreshCw className="h-8 w-8 text-emerald-600 animate-spin mb-3" />
                        <span className="text-sm font-bold text-slate-900">Özgeçmiş Analiz Ediliyor...</span>
                        <span className="text-xs text-slate-500 mt-1">Gemini LLM yetenekleri çıkartıyor</span>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center">
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50 border border-emerald-100 shadow-sm text-emerald-600 mb-3">
                          <FileText className="h-6 w-6" />
                        </div>
                        <span className="text-sm font-bold text-slate-900">CV Yükle (PDF, Word, TXT)</span>
                        <span className="text-xs text-slate-500 mt-1">Sürükle bırak veya tıkla</span>
                        {currentUser.resumeFileName && (
                          <span className="text-xs text-emerald-600 font-semibold mt-2">
                            📄 Mevcut: {currentUser.resumeFileName}
                          </span>
                        )}
                      </div>
                    )}
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Ad Soyad</label>
                <input 
                  type="text" 
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="block w-full rounded-lg border border-slate-200 bg-white py-2 px-3 text-sm outline-none focus:border-emerald-500 transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Unvan</label>
                <input 
                  type="text" 
                  value={title}
                  placeholder="Örn: Frontend Developer"
                  onChange={(e) => setTitle(e.target.value)}
                  className="block w-full rounded-lg border border-slate-200 bg-white py-2 px-3 text-sm outline-none focus:border-emerald-500 transition-all"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Deneyim (Yıl)</label>
                  <input 
                    type="number" 
                    value={experienceYears}
                    onChange={(e) => setExperienceYears(Number(e.target.value))}
                    className="block w-full rounded-lg border border-slate-200 bg-white py-2 px-3 text-sm outline-none focus:border-emerald-500 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Konum</label>
                  <input 
                    type="text" 
                    value={location}
                    placeholder="İstanbul"
                    onChange={(e) => setLocation(e.target.value)}
                    className="block w-full rounded-lg border border-slate-200 bg-white py-2 px-3 text-sm outline-none focus:border-emerald-500 transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Yetenekler (Virgülle Ayırın)</label>
                <input 
                  type="text" 
                  value={skillsText}
                  placeholder="React, TypeScript, Node.js"
                  onChange={(e) => setSkillsText(e.target.value)}
                  className="block w-full rounded-lg border border-slate-200 bg-white py-2 px-3 text-sm outline-none focus:border-emerald-500 transition-all"
                />
              </div>

              {saveProfileMessage && (
                <div className={`text-xs text-center font-medium p-2 rounded-lg ${saveProfileMessage.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-600'}`}>
                  {saveProfileMessage.text}
                </div>
              )}
            </form>
            
            <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-end gap-2">
              <button type="button" onClick={() => setShowProfileEditModal(false)} className="bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-semibold text-xs py-2 px-4 rounded-xl transition">
                İptal
              </button>
              <button 
                onClick={handleSaveProfile}
                disabled={isSavingProfile}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs py-2 px-5 rounded-xl transition disabled:opacity-50">
                {isSavingProfile ? 'Kaydediliyor...' : 'Kaydet'}
              </button>
            </div>
          </div>
        </div>
      )}

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
