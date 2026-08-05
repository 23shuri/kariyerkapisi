import { useState, useEffect } from 'react';
import { Briefcase, MapPin, DollarSign, Clock, Search, Sparkles, Plus, X, FileText, Upload } from 'lucide-react';
import { User as UserType, Job, CandidateCV, CVAnalysisResult } from '../types';
import { INITIAL_JOBS } from '../data';
import { CVAnalysisModal } from './CVAnalysisModal';

interface CandidateDashboardProps {
  currentUser: UserType;
  onProfileUpdated: (user: UserType) => void;
  activeTab: 'home' | 'applications';
}

export const CandidateDashboard: React.FC<CandidateDashboardProps> = ({ 
  currentUser, 
  onProfileUpdated, 
  activeTab 
}) => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [applications, setApplications] = useState<any[]>([]);

  // CV Analiz Modal state
  const [showCVAnalysisModal, setShowCVAnalysisModal] = useState(false);

  // CV Yayınlama state
  const [showCVForm, setShowCVForm] = useState(false);
  const [myCV, setMyCV] = useState<CandidateCV | null>(null);
  const [cvTitle, setCvTitle] = useState(currentUser.title || '');
  const [cvLocation, setCvLocation] = useState(currentUser.location || '');
  const [cvWorkPref, setCvWorkPref] = useState<'Uzaktan' | 'Hibrit' | 'Ofisten' | 'Fark etmez'>('Hibrit');
  const [cvSkills, setCvSkills] = useState((currentUser.skills || []).join(', '));
  const [cvExpYears, setCvExpYears] = useState(String(currentUser.experienceYears || 0));
  const [cvExpLevel, setCvExpLevel] = useState('1-2 Yıl');
  const [cvSalary, setCvSalary] = useState(currentUser.salaryExpectation || '');
  const [cvSummary, setCvSummary] = useState(currentUser.bio || '');
  const [isPublishingCV, setIsPublishingCV] = useState(false);

  useEffect(() => {
    // Mock ilanları + localStorage'dan yayınlanan ilanları yükle
    let allJobs = [...INITIAL_JOBS];
    const postedJobs = JSON.parse(localStorage.getItem('kariyer_kapisi_posted_jobs') || '[]');
    allJobs = [...allJobs, ...postedJobs];
    setJobs(allJobs);

    // localStorage'dan başvuruları yükle
    const savedApplications = JSON.parse(localStorage.getItem('kariyer_kapisi_applications') || '[]');
    const userApplications = savedApplications.filter((app: any) => app.candidateId === currentUser.id);
    setApplications(userApplications);

    // Kendi CV'mi yükle
    const savedCVs = JSON.parse(localStorage.getItem('kariyer_kapisi_cvs') || '[]');
    const myExistingCV = savedCVs.find((cv: CandidateCV) => cv.candidateId === currentUser.id && cv.isActive);
    if (myExistingCV) setMyCV(myExistingCV);
  }, [currentUser.id]);

  const handlePublishCV = () => {
    if (!cvTitle.trim()) { alert('Pozisyon başlığı zorunludur.'); return; }
    setIsPublishingCV(true);
    const skillsArray = cvSkills.split(',').map(s => s.trim()).filter(Boolean);
    const newCV: CandidateCV = {
      id: myCV?.id || `cv_${currentUser.id}`,
      candidateId: currentUser.id,
      candidateName: currentUser.fullName,
      candidateAvatarUrl: currentUser.avatarUrl,
      title: cvTitle,
      location: cvLocation,
      workPreference: cvWorkPref,
      skills: skillsArray,
      experienceYears: Number(cvExpYears) || 0,
      experienceLevel: cvExpLevel,
      salaryExpectation: cvSalary,
      summary: cvSummary,
      publishedAt: new Date().toLocaleDateString('tr-TR'),
      isActive: true,
    };
    const savedCVs = JSON.parse(localStorage.getItem('kariyer_kapisi_cvs') || '[]');
    const filtered = savedCVs.filter((cv: CandidateCV) => cv.candidateId !== currentUser.id);
    filtered.push(newCV);
    localStorage.setItem('kariyer_kapisi_cvs', JSON.stringify(filtered));
    setMyCV(newCV);
    setShowCVForm(false);
    setIsPublishingCV(false);
    alert('✅ CV profiliniz başarıyla yayınlandı!');
  };

  const handleUnpublishCV = () => {
    const savedCVs = JSON.parse(localStorage.getItem('kariyer_kapisi_cvs') || '[]');
    const updated = savedCVs.map((cv: CandidateCV) =>
      cv.candidateId === currentUser.id ? { ...cv, isActive: false } : cv
    );
    localStorage.setItem('kariyer_kapisi_cvs', JSON.stringify(updated));
    setMyCV(null);
    alert('CV profiliniz kaldırıldı.');
  };

  const handleCVAnalysisComplete = (result: CVAnalysisResult) => {
    if (!result.success || !result.data) return;

    // Çıkarılan bilgileri profile yükle
    const updatedUser: UserType = {
      ...currentUser,
      skills: result.data.skills || currentUser.skills,
      education: result.data.education?.map((edu, idx) => ({
        id: `edu_${idx}`,
        school: edu.school,
        degree: edu.level,
        field: edu.field,
        startDate: edu.year || '',
        endDate: undefined,
        current: false,
        description: undefined,
      })) || currentUser.education,
      experience: result.data.experience?.map((exp, idx) => ({
        id: `exp_${idx}`,
        company: exp.company,
        position: exp.position,
        location: undefined,
        startDate: exp.duration?.split('-')[0] || '',
        endDate: exp.duration?.split('-')[1] || '',
        current: false,
        description: exp.description,
      })) || currentUser.experience,
      languages: result.data.languages?.map((lang, idx) => ({
        id: `lang_${idx}`,
        language: lang.name,
        level: (lang.level?.toLowerCase() as any) || 'intermediate',
      })) || currentUser.languages,
      bio: result.data.summary || currentUser.bio,
    };

    // localStorage'a kaydet
    localStorage.setItem('kariyer_kapisi_user', JSON.stringify(updatedUser));
    
    // Parent component'e bildir
    onProfileUpdated(updatedUser);
    
    alert('✅ CV başarıyla analiz edildi ve profiliniz güncellenmiştir!');
  };

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Hero Header */}
        <div className="mb-12">
          <div className="inline-flex items-center gap-2 rounded-full bg-emerald-50 border border-emerald-200 px-4 py-2 mb-4">
            <Sparkles className="h-4 w-4 text-emerald-600" />
            <span className="text-sm font-medium text-emerald-700">
              {jobs.length} aktif ilan mevcut
            </span>
          </div>
          
          <h1 className="text-4xl sm:text-5xl font-bold text-slate-900 mb-3">
            Hayalindeki İşi Bul
          </h1>
          
          <p className="text-lg text-slate-600 max-w-2xl">
            Yeteneklerinize uygun pozisyonları keşfet ve AI destekli eşleştirme ile sana en yakın ilanları bul
          </p>

          {/* Search Bar */}
          <div className="mt-8 flex flex-col sm:flex-row gap-3 bg-white rounded-xl shadow-sm border border-slate-200 p-3">
            <div className="flex-1 flex items-center gap-3 px-3">
              <Search className="h-5 w-5 text-slate-400" />
              <input
                type="text"
                placeholder="Pozisyon, şirket ya da beceri ara..."
                className="w-full text-slate-800 placeholder-slate-400 outline-none bg-transparent"
              />
            </div>
            <div className="h-px sm:h-auto sm:w-px bg-slate-200" />
            <div className="flex-1 flex items-center gap-3 px-3">
              <MapPin className="h-5 w-5 text-slate-400" />
              <input
                type="text"
                placeholder="Konum (örn: İstanbul, Uzaktan)"
                className="w-full text-slate-800 placeholder-slate-400 outline-none bg-transparent"
              />
            </div>
            <button className="bg-emerald-600 hover:bg-emerald-700 text-white font-medium px-6 rounded-lg transition whitespace-nowrap">
              Ara
            </button>
          </div>
        </div>

        {activeTab === 'home' ? (
          <div>
            {/* CV Yayınlama Paneli */}
            <div className="mb-8 bg-white rounded-xl border border-slate-200 p-5">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-base font-semibold text-slate-900 flex items-center gap-2">
                    <FileText className="h-5 w-5 text-blue-600" />
                    CV Profilim
                  </h2>
                  <p className="text-sm text-slate-500 mt-0.5">
                    {myCV ? 'CV profiliniz yayında — işverenler görebiliyor.' : 'CV profilinizi yayınlayın, işverenler sizi bulsun.'}
                  </p>
                </div>
                <div className="flex gap-2">
                  {myCV && (
                    <button
                      onClick={handleUnpublishCV}
                      className="text-sm text-red-600 hover:text-red-700 font-medium px-3 py-1.5 hover:bg-red-50 rounded-lg transition"
                    >
                      Kaldır
                    </button>
                  )}
                  <button
                    onClick={() => setShowCVForm(!showCVForm)}
                    className="flex items-center gap-1.5 text-sm font-medium bg-blue-600 hover:bg-blue-700 text-white px-4 py-1.5 rounded-lg transition"
                  >
                    <Plus className="h-4 w-4" />
                    {myCV ? 'Güncelle' : 'CV Yayınla'}
                  </button>
                </div>
              </div>

              {/* Mevcut CV özeti */}
              {myCV && !showCVForm && (
                <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-100 flex flex-wrap gap-3 text-sm">
                  <span className="font-semibold text-blue-800">{myCV.title}</span>
                  <span className="text-slate-600">📍 {myCV.location}</span>
                  <span className="text-slate-600">💼 {myCV.workPreference}</span>
                  <span className="text-slate-600">⏱ {myCV.experienceLevel}</span>
                  <div className="w-full flex flex-wrap gap-1.5 mt-1">
                    {myCV.skills.slice(0, 6).map(s => (
                      <span key={s} className="bg-white text-blue-700 border border-blue-200 text-xs px-2 py-0.5 rounded-full">{s}</span>
                    ))}
                  </div>
                </div>
              )}

              {/* CV Formu */}
              {showCVForm && (
                <div className="mt-4 border-t border-slate-100 pt-4 space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 mb-1">Aradığınız Pozisyon *</label>
                      <input type="text" value={cvTitle} onChange={e => setCvTitle(e.target.value)}
                        placeholder="Örn: Frontend Developer"
                        className="w-full rounded-lg border border-slate-200 py-2 px-3 text-sm outline-none focus:border-blue-500 transition" />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 mb-1">Konum Tercihi</label>
                      <input type="text" value={cvLocation} onChange={e => setCvLocation(e.target.value)}
                        placeholder="Örn: İstanbul"
                        className="w-full rounded-lg border border-slate-200 py-2 px-3 text-sm outline-none focus:border-blue-500 transition" />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 mb-1">Çalışma Şekli</label>
                      <select value={cvWorkPref} onChange={e => setCvWorkPref(e.target.value as any)}
                        className="w-full rounded-lg border border-slate-200 py-2 px-3 text-sm outline-none focus:border-blue-500 transition bg-white">
                        <option>Uzaktan</option>
                        <option>Hibrit</option>
                        <option>Ofisten</option>
                        <option>Fark etmez</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 mb-1">Deneyim Seviyesi</label>
                      <select value={cvExpLevel} onChange={e => setCvExpLevel(e.target.value)}
                        className="w-full rounded-lg border border-slate-200 py-2 px-3 text-sm outline-none focus:border-blue-500 transition bg-white">
                        {['0-1 Yıl','1-2 Yıl','2-3 Yıl','3-5 Yıl','5+ Yıl'].map(l => <option key={l}>{l}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 mb-1">Maaş Beklentisi</label>
                      <input type="text" value={cvSalary} onChange={e => setCvSalary(e.target.value)}
                        placeholder="Örn: 40.000 - 60.000 ₺"
                        className="w-full rounded-lg border border-slate-200 py-2 px-3 text-sm outline-none focus:border-blue-500 transition" />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 mb-1">Yetenekler (virgülle ayırın)</label>
                      <input type="text" value={cvSkills} onChange={e => setCvSkills(e.target.value)}
                        placeholder="React, TypeScript, Node.js"
                        className="w-full rounded-lg border border-slate-200 py-2 px-3 text-sm outline-none focus:border-blue-500 transition" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">Hakkımda / Özet</label>
                    <textarea rows={3} value={cvSummary} onChange={e => setCvSummary(e.target.value)}
                      placeholder="Kendinizi kısaca tanıtın, ne tür projelerde çalışmak istediğinizi yazın..."
                      className="w-full rounded-lg border border-slate-200 py-2 px-3 text-sm outline-none focus:border-blue-500 transition resize-none" />
                  </div>
                  <div className="flex justify-end gap-2">
                    <button onClick={() => setShowCVForm(false)}
                      className="text-sm text-slate-600 hover:text-slate-900 px-4 py-2 border border-slate-200 rounded-lg transition">
                      İptal
                    </button>
                    <button onClick={handlePublishCV} disabled={isPublishingCV}
                      className="text-sm font-semibold bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition disabled:opacity-50">
                      {isPublishingCV ? 'Yayınlanıyor...' : 'Yayınla'}
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* CV Analiz Paneli */}
            <div className="mb-8 bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl border border-purple-200 p-5">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-base font-semibold text-slate-900 flex items-center gap-2">
                    <Upload className="h-5 w-5 text-purple-600" />
                    CV'yi Otomatik Analiz Et
                  </h2>
                  <p className="text-sm text-slate-600 mt-0.5">
                    PDF CV'nizi yükleyin, yapay zeka profilinizi otomatik olarak doldursun
                  </p>
                </div>
                <button
                  onClick={() => setShowCVAnalysisModal(true)}
                  className="flex items-center gap-1.5 text-sm font-medium bg-purple-600 hover:bg-purple-700 text-white px-4 py-1.5 rounded-lg transition whitespace-nowrap"
                >
                  <Upload className="h-4 w-4" />
                  CV Yükle
                </button>
              </div>
            </div>

            <div className="mb-4">
              <h2 className="text-2xl font-bold text-slate-900">Sizin İçin Seçilen İlanlar</h2>
              <p className="text-sm text-slate-600 mt-1">{jobs.length} ilan bulundu</p>
            </div>

            <div className="space-y-4">
              {jobs.map((job) => (
                <div 
                  key={job.id}
                  className="bg-white rounded-lg shadow-sm border border-slate-200 p-6 hover:shadow-md transition flex flex-col sm:flex-row sm:items-start sm:justify-between"
                >
                  <div className="flex-1 mb-4 sm:mb-0">
                    <div className="mb-3">
                      <h3 className="text-lg font-semibold text-slate-900">{job.title}</h3>
                      <p className="text-sm text-slate-600">{job.company}</p>
                    </div>

                    <div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-3 mb-3 text-sm text-slate-600">
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-emerald-600 flex-shrink-0" />
                        {job.location}
                      </div>
                      <div className="flex items-center gap-2">
                        <Briefcase className="h-4 w-4 text-emerald-600 flex-shrink-0" />
                        {job.type}
                      </div>
                      <div className="flex items-center gap-2">
                        <DollarSign className="h-4 w-4 text-emerald-600 flex-shrink-0" />
                        {job.salaryRange}
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-emerald-600 flex-shrink-0" />
                        {job.postedAt}
                      </div>
                    </div>

                    <p className="text-sm text-slate-600 mb-3 line-clamp-2">
                      {job.description}
                    </p>

                    <div className="flex flex-wrap gap-2">
                      {job.skills.slice(0, 4).map((skill) => (
                        <span 
                          key={skill}
                          className="inline-block bg-emerald-50 text-emerald-700 text-xs px-2.5 py-1 rounded-full"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="sm:ml-6 sm:flex-shrink-0">
                    <button 
                      onClick={() => {
                        const applications = JSON.parse(localStorage.getItem('kariyer_kapisi_applications') || '[]');
                        const existingApp = applications.find((app: any) => app.jobId === job.id && app.candidateId === currentUser.id);
                        
                        if (!existingApp) {
                          const matchedSkills = job.skills.filter(skill => 
                            currentUser.skills?.some(userSkill => 
                              userSkill.toLowerCase().includes(skill.toLowerCase()) ||
                              skill.toLowerCase().includes(userSkill.toLowerCase())
                            )
                          ).length || 0;
                          
                          const skillMatch = (matchedSkills / Math.max(job.skills.length, 1)) * 100;
                          let experienceMatch = 50;
                          if (currentUser.experienceYears) {
                            if (job.experienceLevel?.includes('0-1')) experienceMatch = currentUser.experienceYears >= 1 ? 100 : 50;
                            else if (job.experienceLevel?.includes('1-2')) experienceMatch = currentUser.experienceYears >= 1 ? 100 : 60;
                            else if (job.experienceLevel?.includes('2-3')) experienceMatch = currentUser.experienceYears >= 2 ? 100 : 60;
                            else if (job.experienceLevel?.includes('3-5')) experienceMatch = currentUser.experienceYears >= 3 ? 100 : 70;
                            else if (job.experienceLevel?.includes('5+')) experienceMatch = currentUser.experienceYears >= 5 ? 100 : 80;
                          }
                          
                          const matchScore = Math.round((skillMatch * 0.7) + (experienceMatch * 0.3));
                          
                          const newApplication = {
                            id: `app_${Date.now()}`,
                            jobId: job.id,
                            jobTitle: job.title,
                            company: job.company,
                            candidateId: currentUser.id,
                            appliedAt: new Date().toLocaleString('tr-TR'),
                            status: 'pending',
                            matchScore: Math.min(100, Math.max(40, matchScore)),
                          };
                          applications.push(newApplication);
                          localStorage.setItem('kariyer_kapisi_applications', JSON.stringify(applications));
                          setApplications([...applications.filter((app: any) => app.candidateId === currentUser.id)]);
                          
                          alert(`${job.title} pozisyonuna başarıyla başvurdunuz!\nEşleşme oranı: %${newApplication.matchScore}`);
                        } else {
                          alert('Bu ilana zaten başvurmuşsunuz.');
                        }
                      }}
                      className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-2 px-6 rounded-lg transition whitespace-nowrap"
                    >
                      Başvur & Eşleştir
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div>
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-slate-900">Başvurularım</h2>
                <p className="text-sm text-slate-600 mt-1">{applications.length} başvuru yapıldı</p>
              </div>
            </div>

            {applications.length === 0 ? (
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-12 text-center">
                <Briefcase className="h-16 w-16 text-slate-300 mx-auto mb-4" />
                <p className="text-slate-600 text-lg font-semibold">Henüz başvuru yapmadınız</p>
                <p className="text-slate-500 mt-2">İlanları keşfet sekmesinden başvurularınıza başlayın</p>
              </div>
            ) : (
              <div className="space-y-4">
                {applications.map((app) => (
                  <div 
                    key={app.id}
                    className="bg-white rounded-lg shadow-sm border border-slate-200 p-6 hover:shadow-md transition flex flex-col sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-slate-900">{app.jobTitle}</h3>
                      <p className="text-sm text-slate-600">{app.company}</p>
                      <p className="text-xs text-slate-500 mt-2">Başvuru tarihi: {app.appliedAt}</p>
                    </div>

                    <div className="mt-4 sm:mt-0 sm:ml-6 flex items-center gap-4">
                      <div className="flex flex-col items-end">
                        <span className="inline-block bg-emerald-50 text-emerald-700 text-sm px-3 py-1 rounded-full font-semibold">
                          %{app.matchScore} eşleşme
                        </span>
                        <span className="text-xs text-slate-500 mt-2">
                          Durum: <span className="font-semibold text-emerald-700">İnceleniyor</span>
                        </span>
                      </div>
                      
                      <button
                        onClick={() => {
                          if (confirm('Bu başvuruyu geri çekmek istediğinize emin misiniz?')) {
                            const savedApplications = JSON.parse(localStorage.getItem('kariyer_kapisi_applications') || '[]');
                            const filtered = savedApplications.filter((a: any) => a.id !== app.id);
                            localStorage.setItem('kariyer_kapisi_applications', JSON.stringify(filtered));
                            setApplications(filtered.filter((a: any) => a.candidateId === currentUser.id));
                            alert('Başvurunuz geri çekildi.');
                          }
                        }}
                        className="text-sm text-red-600 hover:text-red-700 font-medium px-3 py-1.5 hover:bg-red-50 rounded-lg transition whitespace-nowrap"
                      >
                        Geri Çek
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* CVAnalysisModal */}
      <CVAnalysisModal
        isOpen={showCVAnalysisModal}
        onClose={() => setShowCVAnalysisModal(false)}
        onAnalysisComplete={handleCVAnalysisComplete}
        candidateId={currentUser.id}
      />
    </div>
  );
};
