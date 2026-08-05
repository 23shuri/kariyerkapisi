import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Search, MapPin, Briefcase, Clock, Users, SlidersHorizontal,
  X, ChevronRight, Sparkles, Building2, Wifi, LayoutGrid, List
} from 'lucide-react';
import { Job, User } from '../types';
import { INITIAL_JOBS } from '../data';

interface JobListPageProps {
  currentUser: User | null;
  onViewDetail: (job: Job) => void;
  onOpenAuth: (role: 'candidate' | 'employer') => void;
}

const TYPE_OPTIONS = ['Tümü', 'Uzaktan', 'Hibrit', 'Ofisten'];
const EXPERIENCE_OPTIONS = ['Tümü', '0-1 Yıl', '1-2 Yıl', '2-3 Yıl', '3-5 Yıl', '5+ Yıl'];

const TYPE_COLORS: Record<string, string> = {
  'Uzaktan': 'bg-blue-50 text-blue-700 border-blue-200',
  'Hibrit': 'bg-amber-50 text-amber-700 border-amber-200',
  'Ofisten': 'bg-emerald-50 text-emerald-700 border-emerald-200',
};

function getMatchColor(score: number) {
  if (score >= 75) return { bar: 'bg-emerald-500', text: 'text-emerald-700', bg: 'bg-emerald-50', border: 'border-emerald-200' };
  if (score >= 50) return { bar: 'bg-amber-400', text: 'text-amber-700', bg: 'bg-amber-50', border: 'border-amber-200' };
  return { bar: 'bg-rose-400', text: 'text-rose-700', bg: 'bg-rose-50', border: 'border-rose-200' };
}

export const JobListPage: React.FC<JobListPageProps> = ({ currentUser, onViewDetail, onOpenAuth }) => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [locationQuery, setLocationQuery] = useState('');
  const [selectedType, setSelectedType] = useState('Tümü');
  const [selectedExperience, setSelectedExperience] = useState('Tümü');
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  
  // Job posting form states
  const [showPostJob, setShowPostJob] = useState(false);
  const [isPosting, setIsPosting] = useState(false);
  const [jobTitle, setJobTitle] = useState('');
  const [jobLocation, setJobLocation] = useState('');
  const [jobType, setJobType] = useState<'Uzaktan' | 'Hibrit' | 'Ofisten'>('Hibrit');
  const [jobSkills, setJobSkills] = useState('');
  const [jobExperience, setJobExperience] = useState('2-3 Yıl');
  const [jobDescription, setJobDescription] = useState('');
  const [jobSalary, setJobSalary] = useState('Rekabetçi');
  
  const hasMatchScores = currentUser?.role === 'candidate' && jobs.some(j => j.previewMatchScore !== undefined);

  useEffect(() => {
    fetchJobs();
  }, [currentUser]);

  // Eşleşme puanı hesapla (sadece candidate'lar için)
  const calculateMatchScore = (job: Job, user: User | null): number => {
    if (!user || user.role !== 'candidate' || !user.skills || user.skills.length === 0) {
      return Math.floor(Math.random() * 40) + 50; // 50-90 arası random
    }

    // İş gereken skilllerle kullanıcı skilllerinin kesişimi
    const matchedSkills = job.skills.filter(skill => 
      user.skills.some(userSkill => 
        userSkill.toLowerCase().includes(skill.toLowerCase()) ||
        skill.toLowerCase().includes(userSkill.toLowerCase())
      )
    ).length;

    // Eşleşme yüzdesi = (eşleşen skill sayısı / toplam skill sayısı) * 100
    const skillMatch = (matchedSkills / Math.max(job.skills.length, 1)) * 100;

    // Deneyim seviyesi kontrol et
    let experienceMatch = 50;
    if (user.experienceYears) {
      if (job.experienceLevel?.includes('0-1')) experienceMatch = user.experienceYears >= 1 ? 100 : 50;
      else if (job.experienceLevel?.includes('1-2')) experienceMatch = user.experienceYears >= 1 ? 100 : 60;
      else if (job.experienceLevel?.includes('2-3')) experienceMatch = user.experienceYears >= 2 ? 100 : 60;
      else if (job.experienceLevel?.includes('3-5')) experienceMatch = user.experienceYears >= 3 ? 100 : 70;
      else if (job.experienceLevel?.includes('5+')) experienceMatch = user.experienceYears >= 5 ? 100 : 80;
    }

    // Final score = 70% skill match + 30% experience match
    const finalScore = Math.round((skillMatch * 0.7) + (experienceMatch * 0.3));
    return Math.min(100, Math.max(40, finalScore));
  };

  const fetchJobs = async () => {
    setLoading(true);
    try {
      // Mock ilanları kullan
      let allJobs = [...INITIAL_JOBS];
      
      // localStorage'dan yayınlanan ilanları ekle
      const postedJobs = JSON.parse(localStorage.getItem('kariyer_kapisi_posted_jobs') || '[]');
      allJobs = [...allJobs, ...postedJobs];
      
      // İşveren ise sadece kendi ilanlarını göster
      if (currentUser?.role === 'employer') {
        allJobs = allJobs.filter(job => job.employerId === currentUser.id);
      }
      
      // Eşleşme puanını hesapla
      const jobsWithScores = allJobs.map(job => ({
        ...job,
        previewMatchScore: calculateMatchScore(job, currentUser)
      }));
      setJobs(jobsWithScores);
    } catch (err) {
      console.error('Jobs fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const filtered = jobs.filter((job) => {
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      !q ||
      job.title.toLowerCase().includes(q) ||
      job.company.toLowerCase().includes(q) ||
      job.skills.some((s) => s.toLowerCase().includes(q));
    const matchesLocation =
      !locationQuery ||
      job.location.toLowerCase().includes(locationQuery.toLowerCase());
    const matchesType = selectedType === 'Tümü' || job.type === selectedType;
    const matchesExp =
      selectedExperience === 'Tümü' || job.experienceLevel === selectedExperience;
    return matchesSearch && matchesLocation && matchesType && matchesExp;
  });

  const clearFilters = () => {
    setSearchQuery('');
    setLocationQuery('');
    setSelectedType('Tümü');
    setSelectedExperience('Tümü');
  };

  const handlePostJob = (e: React.FormEvent) => {
    e.preventDefault();
    setIsPosting(true);

    const skillsArray = jobSkills.split(',').map(s => s.trim()).filter(s => s.length > 0);
    
    const jobData = {
      id: `job_${Date.now()}`,
      title: jobTitle,
      company: (currentUser as any).companyName || currentUser?.fullName.replace(' İK', '').trim() || 'Şirket',
      employerId: currentUser?.id || 'unknown',
      location: jobLocation,
      type: jobType,
      skills: skillsArray,
      experienceLevel: jobExperience,
      description: jobDescription,
      salaryRange: jobSalary,
      postedAt: new Date().toLocaleString('tr-TR'),
      applicationCount: 0,
      candidateMatchesCount: 0,
      companySector: (currentUser as any)?.companySector || '',
      companySize: (currentUser as any)?.companySize || '',
      companyCity: (currentUser as any)?.companyCity || '',
      companyWebsite: (currentUser as any)?.companyWebsite || '',
      companyDescription: (currentUser as any)?.companyDescription || '',
      companyAvatarUrl: currentUser?.avatarUrl || '',
    };

    const postedJobs = JSON.parse(localStorage.getItem('kariyer_kapisi_posted_jobs') || '[]');
    postedJobs.push(jobData);
    localStorage.setItem('kariyer_kapisi_posted_jobs', JSON.stringify(postedJobs));

    setShowPostJob(false);
    setJobTitle('');
    setJobLocation('');
    setJobSkills('');
    setJobDescription('');
    setIsPosting(false);
    fetchJobs();
    alert('✅ İlan başarıyla yayınlandı!');
  };

  const hasActiveFilters =
    searchQuery || locationQuery || selectedType !== 'Tümü' || selectedExperience !== 'Tümü';

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Hero Search Bar */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-900 py-12 px-4">
        <div className="mx-auto max-w-4xl text-center">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/20 border border-emerald-500/30 px-3 py-1 text-xs font-medium text-emerald-300 mb-4">
            <Sparkles className="h-3 w-3" />
            {jobs.length} aktif ilan mevcut
            {hasMatchScores && (
              <span className="ml-1 text-emerald-400">· profilinize göre sıralandı</span>
            )}
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">
            Hayalindeki İşi Bul
          </h1>
          <p className="text-slate-400 text-sm mb-8">
            AI destekli eşleştirme ile sana en uygun ilanları keşfet
          </p>

          {/* Search Inputs */}
          <div className="flex flex-col sm:flex-row gap-3 bg-white rounded-2xl p-2 shadow-xl shadow-black/20">
            <div className="flex-1 flex items-center gap-2 px-3">
              <Search className="h-4 w-4 text-slate-400 shrink-0" />
              <input
                type="text"
                placeholder="Pozisyon, şirket veya beceri ara..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full text-sm text-slate-800 placeholder-slate-400 outline-none py-2 bg-transparent"
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery('')}>
                  <X className="h-4 w-4 text-slate-400 hover:text-slate-600" />
                </button>
              )}
            </div>
            <div className="h-px sm:h-auto sm:w-px bg-slate-200" />
            <div className="flex-1 flex items-center gap-2 px-3">
              <MapPin className="h-4 w-4 text-slate-400 shrink-0" />
              <input
                type="text"
                placeholder="Şehir veya uzaktan..."
                value={locationQuery}
                onChange={(e) => setLocationQuery(e.target.value)}
                className="w-full text-sm text-slate-800 placeholder-slate-400 outline-none py-2 bg-transparent"
              />
            </div>
            <button
              onClick={fetchJobs}
              className="flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium px-6 py-2.5 rounded-xl transition-colors shrink-0"
            >
              <Search className="h-4 w-4" />
              Ara
            </button>
          </div>
        </div>
      </div>

      {/* İlan Ekleme Formu - Sadece işverenler için */}
      {currentUser?.role === 'employer' && (
        <div className="bg-white border-b border-slate-200">
          <div className="mx-auto max-w-7xl px-4 py-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Briefcase className="h-5 w-5 text-emerald-600" />
                Yeni İş İlanı Yayınla
              </h2>
              {showPostJob && (
                <button
                  onClick={() => setShowPostJob(false)}
                  className="text-sm text-slate-500 hover:text-slate-700 font-medium"
                >
                  Kapat
                </button>
              )}
            </div>

            {showPostJob ? (
              <form onSubmit={handlePostJob} className="space-y-4 bg-slate-50 rounded-xl p-5 border border-slate-200">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">Pozisyon Başlığı *</label>
                    <input 
                      type="text"
                      required
                      value={jobTitle}
                      onChange={(e) => setJobTitle(e.target.value)}
                      placeholder="Örn: Senior Frontend Developer"
                      className="block w-full rounded-lg border border-slate-200 bg-white py-2 px-3 text-sm outline-none focus:border-emerald-500 transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">Konum</label>
                    <input 
                      type="text"
                      required
                      value={jobLocation}
                      onChange={(e) => setJobLocation(e.target.value)}
                      placeholder="İstanbul (Hibrit)"
                      className="block w-full rounded-lg border border-slate-200 bg-white py-2 px-3 text-sm outline-none focus:border-emerald-500 transition-all"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">Çalışma Şekli</label>
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
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">Tecrübe Seviyesi</label>
                    <input 
                      type="text"
                      value={jobExperience}
                      onChange={(e) => setJobExperience(e.target.value)}
                      placeholder="3-5 Yıl"
                      className="block w-full rounded-lg border border-slate-200 bg-white py-2 px-3 text-sm outline-none focus:border-emerald-500 transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">Ücret Aralığı</label>
                    <input 
                      type="text"
                      value={jobSalary}
                      onChange={(e) => setJobSalary(e.target.value)}
                      placeholder="Rekabetçi"
                      className="block w-full rounded-lg border border-slate-200 bg-white py-2 px-3 text-sm outline-none focus:border-emerald-500 transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Aranan Yetenekler (Virgülle Ayırın)</label>
                  <input 
                    type="text"
                    value={jobSkills}
                    onChange={(e) => setJobSkills(e.target.value)}
                    placeholder="React, TypeScript, CSS"
                    className="block w-full rounded-lg border border-slate-200 bg-white py-2 px-3 text-sm outline-none focus:border-emerald-500 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">İş Açıklaması *</label>
                  <textarea 
                    rows={3}
                    required
                    value={jobDescription}
                    onChange={(e) => setJobDescription(e.target.value)}
                    placeholder="Görev tanımları ve aranan teknik kriterleri buraya yazın..."
                    className="block w-full rounded-lg border border-slate-200 bg-white py-2 px-3 text-xs outline-none focus:border-emerald-500 transition-all resize-none"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
                  <button
                    type="button"
                    onClick={() => setShowPostJob(false)}
                    className="bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-semibold text-xs py-2 px-4 rounded-lg transition"
                  >
                    İptal
                  </button>
                  <button
                    type="submit"
                    disabled={isPosting}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs py-2 px-5 rounded-lg transition disabled:opacity-50"
                  >
                    {isPosting ? 'Yayınlanıyor...' : 'İlanı Yayınla'}
                  </button>
                </div>
              </form>
            ) : (
              <button
                onClick={() => setShowPostJob(true)}
                className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-medium px-5 py-2.5 rounded-xl transition shadow-sm"
              >
                <Briefcase className="h-5 w-5" />
                İlan Ekle
              </button>
            )}
          </div>
        </div>
      )}

      {/* Filter Bar */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-10 shadow-sm">
        <div className="mx-auto max-w-7xl px-4 py-3 flex flex-wrap items-center gap-3">
          {/* Type Filters */}
          <div className="flex items-center gap-2 flex-wrap">
            {TYPE_OPTIONS.map((type) => (
              <button
                key={type}
                onClick={() => setSelectedType(type)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                  selectedType === type
                    ? 'bg-emerald-600 text-white border-emerald-600'
                    : 'bg-white text-slate-600 border-slate-200 hover:border-emerald-300'
                }`}
              >
                {type}
              </button>
            ))}
          </div>

          <div className="h-5 w-px bg-slate-200 hidden sm:block" />

          {/* Advanced Filters Toggle */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
              showFilters
                ? 'bg-slate-900 text-white border-slate-900'
                : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
            }`}
          >
            <SlidersHorizontal className="h-3.5 w-3.5" />
            Filtrele
          </button>

          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="flex items-center gap-1 text-xs text-rose-600 hover:text-rose-700 font-medium"
            >
              <X className="h-3.5 w-3.5" />
              Temizle
            </button>
          )}

          {/* Result Count + View Mode */}
          <div className="ml-auto flex items-center gap-3">
            <span className="text-xs text-slate-500">
              <span className="font-semibold text-slate-800">{filtered.length}</span> ilan bulundu
            </span>
            <div className="flex items-center gap-1 border border-slate-200 rounded-lg p-0.5">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded-md transition-colors ${viewMode === 'grid' ? 'bg-slate-900 text-white' : 'text-slate-400 hover:text-slate-600'}`}
              >
                <LayoutGrid className="h-3.5 w-3.5" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-1.5 rounded-md transition-colors ${viewMode === 'list' ? 'bg-slate-900 text-white' : 'text-slate-400 hover:text-slate-600'}`}
              >
                <List className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Expanded Filters */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden border-t border-slate-100"
            >
              <div className="mx-auto max-w-7xl px-4 py-3 flex flex-wrap gap-4">
                <div>
                  <p className="text-xs font-semibold text-slate-500 mb-2">Deneyim Seviyesi</p>
                  <div className="flex flex-wrap gap-2">
                    {EXPERIENCE_OPTIONS.map((exp) => (
                      <button
                        key={exp}
                        onClick={() => setSelectedExperience(exp)}
                        className={`px-3 py-1 rounded-lg text-xs font-medium border transition-all ${
                          selectedExperience === exp
                            ? 'bg-slate-900 text-white border-slate-900'
                            : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        {exp}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Job Cards */}
      <div className="mx-auto max-w-7xl px-4 py-8">
        {loading ? (
          <div className={`grid gap-4 ${viewMode === 'grid' ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'}`}>
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white rounded-2xl border border-slate-100 p-5 animate-pulse">
                <div className="flex items-start gap-3 mb-4">
                  <div className="h-10 w-10 rounded-xl bg-slate-100" />
                  <div className="flex-1">
                    <div className="h-4 bg-slate-100 rounded w-3/4 mb-2" />
                    <div className="h-3 bg-slate-100 rounded w-1/2" />
                  </div>
                </div>
                <div className="h-3 bg-slate-100 rounded w-full mb-2" />
                <div className="h-3 bg-slate-100 rounded w-5/6" />
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20">
            <div className="h-16 w-16 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-4">
              <Briefcase className="h-8 w-8 text-slate-300" />
            </div>
            <p className="text-slate-600 font-semibold mb-1">İlan bulunamadı</p>
            <p className="text-slate-400 text-sm">Arama kriterlerinizi değiştirip tekrar deneyin.</p>
            <button
              onClick={clearFilters}
              className="mt-4 px-4 py-2 bg-emerald-600 text-white text-sm rounded-xl hover:bg-emerald-700 transition-colors"
            >
              Filtreleri Temizle
            </button>
          </div>
        ) : (
          <div className={`grid gap-4 ${viewMode === 'grid' ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'}`}>
            {filtered.map((job, index) => (
              <JobCard
                key={job.id}
                job={job}
                index={index}
                viewMode={viewMode}
                currentUser={currentUser}
                onViewDetail={onViewDetail}
                onOpenAuth={onOpenAuth}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

/* ─── Job Card ─── */
interface JobCardProps {
  job: Job;
  index: number;
  viewMode: 'grid' | 'list';
  currentUser: User | null;
  onViewDetail: (job: Job) => void;
  onOpenAuth: (role: 'candidate' | 'employer') => void;
}

const JobCard: React.FC<JobCardProps> = ({ job, index, viewMode, currentUser, onViewDetail, onOpenAuth }) => {
  const initials = job.company.slice(0, 2).toUpperCase();
  const typeClass = TYPE_COLORS[job.type] || 'bg-slate-50 text-slate-600 border-slate-200';
  const hasScore = job.previewMatchScore !== undefined;
  const scoreColors = hasScore ? getMatchColor(job.previewMatchScore!) : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04, duration: 0.3 }}
      className={`group bg-white rounded-2xl border border-slate-100 hover:border-emerald-200 hover:shadow-lg hover:shadow-emerald-50 transition-all duration-200 flex flex-col cursor-pointer ${
        viewMode === 'list' ? 'sm:flex-row sm:items-center p-4 gap-4' : 'p-5'
      }`}
      onClick={() => onViewDetail(job)}
    >
      {/* Company Avatar */}
      {job.companyAvatarUrl ? (
        <img
          src={job.companyAvatarUrl}
          alt={job.company}
          className={`shrink-0 rounded-xl object-cover border border-slate-100 ${
            viewMode === 'list' ? 'h-11 w-11' : 'h-12 w-12 mb-4'
          }`}
        />
      ) : (
        <div className={`shrink-0 flex items-center justify-center rounded-xl font-bold text-sm text-white bg-gradient-to-br from-emerald-500 to-teal-600 shadow-sm ${
          viewMode === 'list' ? 'h-11 w-11' : 'h-12 w-12 mb-4'
        }`}>
          {initials}
        </div>
      )}

      {/* Content */}
      <div className="flex-1">
        <div className="flex items-start justify-between gap-2">
          <div>
            <h3 className="font-semibold text-slate-900 text-sm group-hover:text-emerald-700 transition-colors leading-tight">
              {job.title}
            </h3>
            <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-1">
              <Building2 className="h-3 w-3" />
              {job.company}
              {job.companySector && (
                <span className="text-slate-300 mx-0.5">·</span>
              )}
              {job.companySector && (
                <span className="text-slate-400">{job.companySector}</span>
              )}
            </p>
          </div>
          {/* Sağ üst: tip badge + match skoru */}
          <div className="flex flex-col items-end gap-1 shrink-0">
            <span className={`text-xs font-medium px-2 py-0.5 rounded-full border ${typeClass}`}>
              {job.type === 'Uzaktan' && <Wifi className="h-3 w-3 inline mr-1" />}
              {job.type}
            </span>
            {hasScore && scoreColors && (
              <span className={`text-xs font-bold px-2 py-0.5 rounded-full border ${scoreColors.bg} ${scoreColors.text} ${scoreColors.border} flex items-center gap-1`}>
                <Sparkles className="h-3 w-3" />
                %{job.previewMatchScore} eşleşme
              </span>
            )}
          </div>
        </div>

        {/* Match progress bar */}
        {hasScore && scoreColors && viewMode === 'grid' && (
          <div className="mt-2">
            <div className="h-1 bg-slate-100 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${job.previewMatchScore}%` }}
                transition={{ duration: 0.6, ease: 'easeOut', delay: index * 0.04 }}
                className={`h-full rounded-full ${scoreColors.bar}`}
              />
            </div>
          </div>
        )}

        {viewMode === 'grid' && (
          <p className="text-xs text-slate-500 mt-2 line-clamp-2 leading-relaxed">
            {job.description}
          </p>
        )}

        {/* Meta */}
        <div className="flex flex-wrap items-center gap-3 mt-3">
          <span className="flex items-center gap-1 text-xs text-slate-500">
            <MapPin className="h-3 w-3" />
            {job.location}
          </span>
          <span className="flex items-center gap-1 text-xs text-slate-500">
            <Clock className="h-3 w-3" />
            {job.postedAt}
          </span>
          {job.companySize && (
            <span className="flex items-center gap-1 text-xs text-slate-500">
              <Users className="h-3 w-3" />
              {job.companySize}
            </span>
          )}
          {job.applicationCount > 0 && (
            <span className="flex items-center gap-1 text-xs text-slate-400">
              {job.applicationCount} başvuru
            </span>
          )}
        </div>

        {/* Skills */}
        {viewMode === 'grid' && (
          <div className="flex flex-wrap gap-1.5 mt-3">
            {job.skills.slice(0, 3).map((skill) => (
              <span key={skill} className="px-2 py-0.5 bg-slate-50 border border-slate-200 rounded-md text-xs text-slate-600 font-medium">
                {skill}
              </span>
            ))}
            {job.skills.length > 3 && (
              <span className="px-2 py-0.5 bg-slate-50 border border-slate-200 rounded-md text-xs text-slate-500">
                +{job.skills.length - 3}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Action */}
      <div className={`${viewMode === 'list' ? 'shrink-0' : 'mt-4 pt-4 border-t border-slate-50 flex items-center justify-between'}`}>
        {viewMode === 'grid' && (
          <span className="text-xs font-semibold text-slate-700">{job.salaryRange}</span>
        )}
        <button
          onClick={(e) => {
            e.stopPropagation();
            if (currentUser) {
              onViewDetail(job);
            } else {
              onOpenAuth('candidate');
            }
          }}
          className="flex items-center gap-1 text-xs font-semibold text-emerald-700 hover:text-emerald-800 transition-colors group/btn"
        >
          {currentUser ? 'Detayları Gör' : 'Giriş Yap & Başvur'}
          <ChevronRight className="h-3.5 w-3.5 group-hover/btn:translate-x-0.5 transition-transform" />
        </button>
      </div>
    </motion.div>
  );
};
