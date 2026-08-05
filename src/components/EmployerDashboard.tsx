import React, { useState, useEffect } from 'react';
import { 
  Building, Briefcase, Users, Star, Sparkles, Plus, Trash2, CheckCircle2, 
  MapPin, Clock, Search, RefreshCw, BadgeCheck, BadgeAlert, FileText, ChevronDown, Check, X, Upload
} from 'lucide-react';
import { Job, Application, MatchDetail } from '../types';

interface EmployerDashboardProps {
  currentUser: { id: string; fullName: string; avatarUrl?: string };
  onNotificationChange?: () => void;
  onViewCandidateCVs?: () => void;
}

export const EmployerDashboard: React.FC<EmployerDashboardProps> = ({ currentUser, onNotificationChange, onViewCandidateCVs }) => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [avgRating, setAvgRating] = useState<number>(0);
  const [totalReviews, setTotalReviews] = useState<number>(0);
  
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

  // Profile modal states
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [editingName, setEditingName] = useState(currentUser.fullName);
  const [editingCompanyName, setEditingCompanyName] = useState((currentUser as any).companyName || currentUser.fullName);
  const [editingCompanySector, setEditingCompanySector] = useState((currentUser as any).companySector || '');
  const [editingCompanySize, setEditingCompanySize] = useState((currentUser as any).companySize || '');
  const [editingCompanyCity, setEditingCompanyCity] = useState((currentUser as any).companyCity || '');
  const [editingCompanyWebsite, setEditingCompanyWebsite] = useState((currentUser as any).companyWebsite || '');
  const [editingCompanyDescription, setEditingCompanyDescription] = useState((currentUser as any).companyDescription || '');
  const [editingCompanyEmail, setEditingCompanyEmail] = useState((currentUser as any).companyEmail || '');
  const [editingCompanyPhone, setEditingCompanyPhone] = useState((currentUser as any).companyPhone || '');
  const [editingCompanyFoundedYear, setEditingCompanyFoundedYear] = useState((currentUser as any).companyFoundedYear || '');
  const [editingCompanyBenefits, setEditingCompanyBenefits] = useState<string>((currentUser as any).companyBenefits?.join(', ') || '');
  const [editingCompanyValues, setEditingCompanyValues] = useState<string>((currentUser as any).companyValues?.join(', ') || '');
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  // Selected applicant match states
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);
  const [activeMatch, setActiveMatch] = useState<MatchDetail | null>(null);
  const [showMatchModal, setShowMatchModal] = useState(false);
  const [isLoadingMatch, setIsLoadingMatch] = useState(false);
  const [cvDetailText, setCvDetailText] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      const jobsRes = await fetch('/api/jobs');
      if (jobsRes.ok) {
        const jobsData = await jobsRes.json();
        setJobs(jobsData.jobs || []);
      } else {
        // API kapalı - localStorage'dan mock ilanları yükle
        const postedJobs = JSON.parse(localStorage.getItem('kariyer_kapisi_posted_jobs') || '[]');
        const userJobs = postedJobs.filter((job: any) => job.employerId === currentUser.id);
        setJobs(userJobs);
      }

      const appsRes = await fetch(`/api/applications?userId=${currentUser.id}&role=employer`);
      if (appsRes.ok) {
        const appsData = await appsRes.json();
        setApplications(appsData.applications || []);
      } else {
        // API kapalı - localStorage'dan başvuruları yükle
        const allApplications = JSON.parse(localStorage.getItem('kariyer_kapisi_applications') || '[]');
        setApplications(allApplications);
      }

      const statsRes = await fetch('/api/stats/employer');
      if (statsRes.ok) {
        const statsData = await statsRes.json();
        setStats(statsData);
      }

      // Değerlendirmeleri getir - try-catch içine al
      try {
        const reviewsRes = await fetch(`/api/reviews/${currentUser.id}`);
        if (reviewsRes.ok) {
          const reviewsData = await reviewsRes.json();
          setAvgRating(reviewsData.averageRating || 0);
          setTotalReviews(reviewsData.totalReviews || 0);
        }
      } catch (err) {
        console.error('Reviews fetch failed:', err);
        // Sessiz geç
      }
    } catch (err) {
      console.error('Employer data fetch failed:', err);
      // Sessiz geç - localStorage'dan mock veriler yüklenmiş
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
    
    const jobData = {
      id: `job_${Date.now()}`,
      title: jobTitle,
      company: (currentUser as any).companyName || currentUser.fullName.replace(' İK', '').trim(),
      employerId: currentUser.id,
      location: jobLocation,
      type: jobType,
      skills: skillsArray,
      experienceLevel: jobExperience,
      description: jobDescription,
      salaryRange: jobSalary,
      postedAt: new Date().toLocaleString('tr-TR'),
      applicationCount: 0,
      candidateMatchesCount: 0,
      companySector: (currentUser as any).companySector || '',
      companySize: (currentUser as any).companySize || '',
      companyCity: (currentUser as any).companyCity || '',
      companyWebsite: (currentUser as any).companyWebsite || '',
      companyDescription: (currentUser as any).companyDescription || '',
      companyAvatarUrl: currentUser.avatarUrl || '',
    };
    
    console.log('Posting job data:', jobData);

    try {
      const response = await fetch('/api/jobs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(jobData)
      });
      
      console.log('Response status:', response.status);
      
      if (!response.ok) {
        // Backend kapalı - mock olarak localStorage'a kaydet
        console.warn('API kapalı, mock olarak localStorage\'a kaydediliyor');
        const postedJobs = JSON.parse(localStorage.getItem('kariyer_kapisi_posted_jobs') || '[]');
        postedJobs.push(jobData);
        localStorage.setItem('kariyer_kapisi_posted_jobs', JSON.stringify(postedJobs));
        
        setShowPostJob(false);
        // Reset form
        setJobTitle('');
        setJobLocation('');
        setJobSkills('');
        setJobDescription('');
        
        alert('✅ İlan başarıyla yayınlandı! (Demo Mode)');
        await fetchData();
      } else {
        const responseData = await response.json();
        console.log('Response data:', responseData);

        setShowPostJob(false);
        // Reset form
        setJobTitle('');
        setJobLocation('');
        setJobSkills('');
        setJobDescription('');
        
        alert('✅ İlan başarıyla yayınlandı!');
        await fetchData();
      }
    } catch (err) {
      console.error('Post job failed:', err);
      
      // Bağlantı hatası - mock olarak localStorage'a kaydet
      const postedJobs = JSON.parse(localStorage.getItem('kariyer_kapisi_posted_jobs') || '[]');
      postedJobs.push(jobData);
      localStorage.setItem('kariyer_kapisi_posted_jobs', JSON.stringify(postedJobs));
      
      setShowPostJob(false);
      // Reset form
      setJobTitle('');
      setJobLocation('');
      setJobSkills('');
      setJobDescription('');
      
      alert('✅ İlan başarıyla yayınlandı! (Demo Mode)');
      await fetchData();
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

  // Handle Accept/Reject Decision with Notification
  const handleApplicationDecision = async (appId: string, decision: 'accept' | 'reject') => {
    try {
      const res = await fetch(`/api/applications/${appId}/decision`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ decision })
      });

      if (res.ok) {
        await fetchData();
        // Trigger notification refresh in parent
        onNotificationChange?.();
      }
    } catch (err) {
      console.error('Decision update failed:', err);
    }
  };

  // Handle Save Profile
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingProfile(true);

    try {
      let avatarUrl = currentUser.avatarUrl || null;
      if (avatarFile) {
        avatarUrl = await new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result as string);
          reader.readAsDataURL(avatarFile);
        });
      }

      const updatedUser = {
        ...currentUser,
        fullName: editingName,
        avatarUrl,
        companyName: editingCompanyName,
        companySector: editingCompanySector,
        companySize: editingCompanySize,
        companyCity: editingCompanyCity,
        companyWebsite: editingCompanyWebsite,
        companyDescription: editingCompanyDescription,
        companyEmail: editingCompanyEmail,
        companyPhone: editingCompanyPhone,
        companyFoundedYear: editingCompanyFoundedYear,
        companyBenefits: editingCompanyBenefits.split(',').map(s => s.trim()).filter(Boolean),
        companyValues: editingCompanyValues.split(',').map(s => s.trim()).filter(Boolean),
      };

      // localStorage'a kaydet
      localStorage.setItem('kariyer_kapisi_session', JSON.stringify(updatedUser));
      
      setShowProfileModal(false);
      alert('✅ Şirket profili başarıyla kaydedildi!');
      
      // Sayfayı yenile
      window.location.reload();
    } catch (err) {
      console.error('Profile save error:', err);
      alert('Profil güncellenirken hata oluştu.');
    } finally {
      setIsSavingProfile(false);
    }
  };

  // Handle avatar file selection
  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatarFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // View Match Report Modal with CV details
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
      
      // Get candidate details from users table
      const userRes = await fetch('/api/jobs'); // temp, but we need user endpoint
      // Since we don't have user endpoint, we can simulate
      const candidateText = `${app.candidateName} • ${app.candidateTitle}\n${app.matchScore}% AI Uyum`;
      setCvDetailText(candidateText);
    } catch (err) {
      console.error('Failed to get match detail:', err);
    } finally {
      setIsLoadingMatch(false);
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 text-slate-800">
      
      {/* Employer Profile Card - REMOVED, now using inline panel below */}

      {/* Aday Profilleri Butonu + Profil Form */}
      <div className="mb-6 flex gap-3">
        {onViewCandidateCVs && (
          <button
            onClick={onViewCandidateCVs}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-medium px-5 py-2.5 rounded-xl transition shadow-sm"
          >
            <Users className="h-5 w-5" />
            Aday Profillerini Görüntüle
          </button>
        )}
        <button
          onClick={() => {
            console.log('[Profile Button] Clicked, current state:', showProfileModal);
            setShowProfileModal(!showProfileModal);
          }}
          className="flex items-center gap-2 bg-slate-600 hover:bg-slate-700 text-white font-medium px-5 py-2.5 rounded-xl transition shadow-sm"
        >
          <Building className="h-5 w-5" />
          {showProfileModal ? 'Formu Kapat' : 'Profili Düzenle'}
        </button>
      </div>

      {/* Şirket Profil Form Panel */}
      {showProfileModal && (
        <div className="mb-8 bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900 mb-5 flex items-center gap-2">
            <Building className="h-5 w-5 text-emerald-600" />
            Şirket Profili
          </h2>

          <form onSubmit={handleSaveProfile} className="space-y-5">

            {/* Avatar + Şirket Adı */}
            <div className="flex items-center gap-4 pb-4 border-b border-slate-100">
              <div className="relative shrink-0">
                {avatarPreview || currentUser.avatarUrl ? (
                  <img src={avatarPreview || currentUser.avatarUrl || ''} alt="Logo" className="h-16 w-16 rounded-2xl object-cover ring-2 ring-slate-200" />
                ) : (
                  <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 font-bold text-2xl">
                    {editingCompanyName.charAt(0).toUpperCase()}
                  </div>
                )}
                <label className="absolute -bottom-1 -right-1 bg-emerald-600 text-white p-1.5 rounded-full cursor-pointer hover:bg-emerald-700 transition">
                  <Upload className="h-3 w-3" />
                  <input type="file" accept="image/*" onChange={handleAvatarChange} className="hidden" />
                </label>
              </div>
              <div className="flex-1">
                <label className="block text-xs font-semibold text-slate-600 mb-1">Şirket Adı *</label>
                <input type="text" value={editingCompanyName} onChange={e => setEditingCompanyName(e.target.value)} required
                  className="block w-full rounded-lg border border-slate-200 py-2 px-3 text-sm outline-none focus:border-emerald-500 transition-all" />
              </div>
            </div>

            {/* Grid: Sektör, Çalışan Sayısı, Şehir, Kuruluş Yılı */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Sektör</label>
                <select value={editingCompanySector} onChange={e => setEditingCompanySector(e.target.value)}
                  className="block w-full rounded-lg border border-slate-200 py-2 px-3 text-sm outline-none focus:border-emerald-500 transition-all bg-white">
                  <option value="">Seçin...</option>
                  {['Teknoloji', 'Fintech', 'E-ticaret', 'Sağlık', 'Eğitim', 'Üretim', 'Lojistik', 'Perakende', 'Medya', 'Danışmanlık', 'Yapay Zeka', 'Veri & Analitik', 'Siber Güvenlik', 'Oyun', 'Diğer'].map(s => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Çalışan Sayısı</label>
                <select value={editingCompanySize} onChange={e => setEditingCompanySize(e.target.value)}
                  className="block w-full rounded-lg border border-slate-200 py-2 px-3 text-sm outline-none focus:border-emerald-500 transition-all bg-white">
                  <option value="">Seçin...</option>
                  {['1-10 Çalışan', '10-50 Çalışan', '50-200 Çalışan', '200-500 Çalışan', '500-1000 Çalışan', '1000+ Çalışan'].map(s => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Merkez Şehir</label>
                <select value={editingCompanyCity} onChange={e => setEditingCompanyCity(e.target.value)}
                  className="block w-full rounded-lg border border-slate-200 py-2 px-3 text-sm outline-none focus:border-emerald-500 transition-all bg-white">
                  <option value="">Seçin...</option>
                  {['İstanbul', 'Ankara', 'İzmir', 'Bursa', 'Antalya', 'Adana', 'Konya', 'Gaziantep', 'Kocaeli', 'Mersin', 'Diğer'].map(s => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Kuruluş Yılı</label>
                <input type="number" min="1900" max={new Date().getFullYear()} value={editingCompanyFoundedYear} onChange={e => setEditingCompanyFoundedYear(e.target.value)}
                  placeholder="Örn: 2015"
                  className="block w-full rounded-lg border border-slate-200 py-2 px-3 text-sm outline-none focus:border-emerald-500 transition-all" />
              </div>
            </div>

            {/* Web Sitesi */}
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Web Sitesi</label>
              <input type="text" value={editingCompanyWebsite} onChange={e => setEditingCompanyWebsite(e.target.value)}
                placeholder="www.sirketiniz.com"
                className="block w-full rounded-lg border border-slate-200 py-2 px-3 text-sm outline-none focus:border-emerald-500 transition-all" />
            </div>

            {/* E-posta + Telefon */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">İletişim E-postası</label>
                <input type="email" value={editingCompanyEmail} onChange={e => setEditingCompanyEmail(e.target.value)}
                  placeholder="ik@sirket.com"
                  className="block w-full rounded-lg border border-slate-200 py-2 px-3 text-sm outline-none focus:border-emerald-500 transition-all" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Telefon</label>
                <input type="text" value={editingCompanyPhone} onChange={e => setEditingCompanyPhone(e.target.value)}
                  placeholder="+90 212 000 00 00"
                  className="block w-full rounded-lg border border-slate-200 py-2 px-3 text-sm outline-none focus:border-emerald-500 transition-all" />
              </div>
            </div>

            {/* Şirket Açıklaması */}
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Şirket Hakkında</label>
              <textarea rows={3} value={editingCompanyDescription} onChange={e => setEditingCompanyDescription(e.target.value)}
                placeholder="Şirketinizi kısaca tanıtın, misyon ve vizyonunuz..."
                className="block w-full rounded-lg border border-slate-200 py-2 px-3 text-xs outline-none focus:border-emerald-500 transition-all resize-none" />
            </div>

            {/* Yan Haklar + Değerler */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Yan Haklar <span className="font-normal text-slate-400">(virgülle ayırın)</span></label>
                <input type="text" value={editingCompanyBenefits} onChange={e => setEditingCompanyBenefits(e.target.value)}
                  placeholder="Sağlık sigortası, Yemek kartı, Uzaktan çalışma"
                  className="block w-full rounded-lg border border-slate-200 py-2 px-3 text-sm outline-none focus:border-emerald-500 transition-all" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Şirket Değerleri <span className="font-normal text-slate-400">(virgülle ayırın)</span></label>
                <input type="text" value={editingCompanyValues} onChange={e => setEditingCompanyValues(e.target.value)}
                  placeholder="İnovasyon, Şeffaflık, Ekip ruhu"
                  className="block w-full rounded-lg border border-slate-200 py-2 px-3 text-sm outline-none focus:border-emerald-500 transition-all" />
              </div>
            </div>

            {/* Submit Buttons */}
            <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
              <button type="button" onClick={() => setShowProfileModal(false)}
                className="bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-semibold text-sm py-2 px-5 rounded-lg transition">
                İptal
              </button>
              <button type="submit" disabled={isSavingProfile}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm py-2 px-6 rounded-lg transition disabled:opacity-50">
                {isSavingProfile ? 'Kaydediliyor...' : 'Profili Kaydet'}
              </button>
            </div>

          </form>
        </div>
      )}

      {/* 1. Statistics Row */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-4 mb-8">
        
        {/* Stat 1 */}
        <div className="card-stat rounded-3xl p-6">
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
        <div className="card-stat rounded-3xl p-6">
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
        <div className="card-stat rounded-3xl p-6 bg-gradient-to-tr from-slate-50/20 to-transparent">
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
        <div className="card-stat rounded-3xl p-6">
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
        
        {/* MAIN COLUMN: Başvurularım */}
        <div className="lg:col-span-12 space-y-6">
          <div className="panel rounded-3xl p-6">
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
                      className="group border border-slate-200 rounded-2xl p-5 hover:border-emerald-200 hover:shadow-md transition duration-150 bg-white shadow-sm hover:-translate-y-0.5"
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

                        {/* Accept/Reject buttons OR Status selector */}
                        {app.status === 'Yeni' || app.status === 'Mülakat' ? (
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleApplicationDecision(app.id, 'accept')}
                              className="inline-flex items-center gap-1.5 bg-green-600 hover:bg-green-700 text-white text-xs font-bold py-2 px-4 rounded-lg transition cursor-pointer shadow-sm"
                            >
                              <Check className="h-3.5 w-3.5" />
                              Kabul Et
                            </button>
                            <button
                              onClick={() => handleApplicationDecision(app.id, 'reject')}
                              className="inline-flex items-center gap-1.5 bg-red-600 hover:bg-red-700 text-white text-xs font-bold py-2 px-4 rounded-lg transition cursor-pointer shadow-sm"
                            >
                              <X className="h-3.5 w-3.5" />
                              Reddet
                            </button>
                          </div>
                        ) : (
                          <span className={`inline-flex items-center gap-1 py-1.5 px-3 text-xs font-bold rounded-lg ${
                            app.status === 'Kabul Edildi' 
                              ? 'bg-green-50 text-green-700 border border-green-200' 
                              : 'bg-red-50 text-red-700 border border-red-200'
                          }`}>
                            {app.status === 'Kabul Edildi' ? <CheckCircle2 className="h-3.5 w-3.5" /> : <X className="h-3.5 w-3.5" />}
                            {app.status}
                          </span>
                        )}
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
