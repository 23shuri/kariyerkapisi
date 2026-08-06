import React, { useState } from 'react';
import { 
  User, MapPin, Briefcase, GraduationCap, Award, Languages,
  Code, Link as LinkIcon, DollarSign, Home, ChevronRight, ChevronLeft,
  CheckCircle, Upload, X, Plus, Trash2, Globe, Calendar
} from 'lucide-react';
import { User as UserType, EducationEntry, ExperienceEntry, LanguageEntry, CertificateEntry } from '../types';
import { CertificateManager } from './CertificateManager';

interface ProfileWizardProps {
  currentUser: UserType;
  onComplete: (updatedUser: UserType) => void;
  onClose: () => void;
}

export const ProfileWizard: React.FC<ProfileWizardProps> = ({ currentUser, onComplete, onClose }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isSaving, setIsSaving] = useState(false);
  const [profileData, setProfileData] = useState<UserType>({
    ...currentUser,
    education: currentUser.education || [],
    experience: currentUser.experience || [],
    languages: currentUser.languages || [],
    certificates: currentUser.certificates || []
  });

  const steps = [
    { id: 'basic', title: 'Temel Bilgiler', icon: User },
    { id: 'work', title: 'İş Durumu', icon: Briefcase },
    { id: 'education', title: 'Eğitim', icon: GraduationCap },
    { id: 'experience', title: 'Deneyim', icon: Award },
    { id: 'skills', title: 'Yetenekler', icon: Code },
    { id: 'certificates', title: 'Sertifikalar', icon: Award },
    { id: 'languages', title: 'Diller', icon: Languages },
    { id: 'social', title: 'Sosyal Medya', icon: Globe }
  ];

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = async () => {
    setIsSaving(true);
    try {
      const response = await fetch(`/api/profile/${currentUser.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profileData)
      });

      const text = await response.text();
      let data: any = null;
      try { data = text ? JSON.parse(text) : null; } catch { /* ignore */ }

      if (response.ok && data?.user) {
        onComplete(data.user);
      } else {
        // Hata olsa bile local state ile devam et
        onComplete(profileData);
      }
    } catch (err) {
      console.error('Profile save error:', err);
      onComplete(profileData);
    } finally {
      setIsSaving(false);
    }
  };

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Dosyayı base64'e dönüştür (preview için)
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64Avatar = reader.result as string;
      setProfileData(prev => ({ ...prev, avatarUrl: base64Avatar }));
      // sessionStorage'a kaydet (geçici, localStorage'a az yer)
      sessionStorage.setItem('avatar_temp', base64Avatar);
    };
    reader.readAsDataURL(file);
  };

  const addEducation = () => {
    const newEdu: EducationEntry = {
      id: `edu_${Date.now()}`,
      school: '',
      degree: '',
      field: '',
      startDate: ''
    };
    setProfileData({
      ...profileData,
      education: [...(profileData.education || []), newEdu]
    });
  };

  const updateEducation = (id: string, field: keyof EducationEntry, value: any) => {
    setProfileData({
      ...profileData,
      education: profileData.education?.map(edu => 
        edu.id === id ? { ...edu, [field]: value } : edu
      )
    });
  };

  const removeEducation = (id: string) => {
    setProfileData({
      ...profileData,
      education: profileData.education?.filter(edu => edu.id !== id)
    });
  };

  const addExperience = () => {
    const newExp: ExperienceEntry = {
      id: `exp_${Date.now()}`,
      company: '',
      position: '',
      startDate: ''
    };
    setProfileData({
      ...profileData,
      experience: [...(profileData.experience || []), newExp]
    });
  };

  const updateExperience = (id: string, field: keyof ExperienceEntry, value: any) => {
    setProfileData({
      ...profileData,
      experience: profileData.experience?.map(exp => 
        exp.id === id ? { ...exp, [field]: value } : exp
      )
    });
  };

  const removeExperience = (id: string) => {
    setProfileData({
      ...profileData,
      experience: profileData.experience?.filter(exp => exp.id !== id)
    });
  };

  const addLanguage = () => {
    const newLang: LanguageEntry = {
      id: `lang_${Date.now()}`,
      language: '',
      level: 'intermediate'
    };
    setProfileData({
      ...profileData,
      languages: [...(profileData.languages || []), newLang]
    });
  };

  const updateLanguage = (id: string, field: keyof LanguageEntry, value: any) => {
    setProfileData({
      ...profileData,
      languages: profileData.languages?.map(lang => 
        lang.id === id ? { ...lang, [field]: value } : lang
      )
    });
  };

  const removeLanguage = (id: string) => {
    setProfileData({
      ...profileData,
      languages: profileData.languages?.filter(lang => lang.id !== id)
    });
  };

  // Render step content
  const renderStepContent = () => {
    switch (steps[currentStep].id) {
      case 'basic':
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-slate-900 mb-4">Temel Bilgileriniz</h3>
            
            {/* Avatar Upload */}
            <div className="flex items-center gap-4 mb-6">
              <div className="relative">
                {profileData.avatarUrl ? (
                  <img
                    src={profileData.avatarUrl.startsWith('data:') ? profileData.avatarUrl : `http://127.0.0.1:5001${profileData.avatarUrl}`}
                    alt="Profil"
                    className="h-20 w-20 rounded-full object-cover ring-2 ring-emerald-200"
                  />
                ) : (
                  <div className="h-20 w-20 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center text-2xl font-bold">
                    {profileData.fullName.charAt(0).toUpperCase()}
                  </div>
                )}
                <label className="absolute -bottom-1 -right-1 bg-emerald-600 text-white p-2 rounded-full cursor-pointer hover:bg-emerald-700 transition">
                  <Upload className="h-3 w-3" />
                  <input type="file" accept="image/*" onChange={handleAvatarUpload} className="hidden" />
                </label>
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-900">Profil Fotoğrafı</p>
                <p className="text-xs text-slate-500">
                  Profesyonel bir fotoğraf yükleyin
                </p>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Ad Soyad *</label>
              <input
                type="text"
                value={profileData.fullName}
                onChange={(e) => setProfileData({ ...profileData, fullName: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Meslek/Unvan *</label>
              <input
                type="text"
                value={profileData.title || ''}
                onChange={(e) => setProfileData({ ...profileData, title: e.target.value })}
                placeholder="Örn: Senior Frontend Developer"
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Konum</label>
                <input
                  type="text"
                  value={profileData.location || ''}
                  onChange={(e) => setProfileData({ ...profileData, location: e.target.value })}
                  placeholder="İstanbul"
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Telefon</label>
                <input
                  type="tel"
                  value={profileData.phone || ''}
                  onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                  placeholder="+90 5XX XXX XX XX"
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Hakkımda</label>
              <textarea
                value={profileData.bio || ''}
                onChange={(e) => setProfileData({ ...profileData, bio: e.target.value })}
                placeholder="Kendinizi kısaca tanıtın..."
                rows={4}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
              />
            </div>
          </div>
        );


      case 'work':
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-slate-900 mb-4">İş Durumu & Tercihler</h3>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Çalışma Durumu</label>
              <select
                value={profileData.workStatus || 'actively_looking'}
                onChange={(e) => setProfileData({ ...profileData, workStatus: e.target.value as any })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
              >
                <option value="actively_looking">Aktif İş Arıyorum</option>
                <option value="employed">Çalışıyorum</option>
                <option value="open_to_offers">Tekliflere Açığım</option>
                <option value="not_looking">İş Aramıyorum</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Çalışma Tercihi</label>
              <select
                value={profileData.workPreference || 'flexible'}
                onChange={(e) => setProfileData({ ...profileData, workPreference: e.target.value as any })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
              >
                <option value="remote">Uzaktan</option>
                <option value="hybrid">Hibrit</option>
                <option value="office">Ofis</option>
                <option value="flexible">Esnek</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Maaş Beklentisi</label>
              <input
                type="text"
                value={profileData.salaryExpectation || ''}
                onChange={(e) => setProfileData({ ...profileData, salaryExpectation: e.target.value })}
                placeholder="Örn: 50.000 - 70.000 TL"
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Toplam Deneyim (Yıl)</label>
              <input
                type="number"
                value={profileData.experienceYears || 0}
                onChange={(e) => setProfileData({ ...profileData, experienceYears: parseInt(e.target.value) })}
                min="0"
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
              />
            </div>
          </div>
        );


      case 'education':
        return (
          <div className="space-y-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-slate-900">Eğitim Bilgileri</h3>
              <button
                onClick={addEducation}
                className="flex items-center gap-1 text-sm font-medium text-emerald-600 hover:text-emerald-700"
              >
                <Plus className="h-4 w-4" />
                Ekle
              </button>
            </div>

            {profileData.education && profileData.education.length > 0 ? (
              <div className="space-y-3">
                {profileData.education.map((edu) => (
                  <div key={edu.id} className="p-4 border border-slate-200 rounded-lg space-y-3">
                    <div className="flex justify-between items-start">
                      <input
                        type="text"
                        value={edu.school}
                        onChange={(e) => updateEducation(edu.id, 'school', e.target.value)}
                        placeholder="Üniversite/Okul"
                        className="flex-1 px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                      />
                      <button
                        onClick={() => removeEducation(edu.id)}
                        className="ml-2 text-red-500 hover:text-red-600"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="text"
                        value={edu.degree}
                        onChange={(e) => updateEducation(edu.id, 'degree', e.target.value)}
                        placeholder="Derece (Lisans, Yüksek Lisans)"
                        className="px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                      />
                      <input
                        type="text"
                        value={edu.field}
                        onChange={(e) => updateEducation(edu.id, 'field', e.target.value)}
                        placeholder="Bölüm"
                        className="px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="month"
                        value={edu.startDate}
                        onChange={(e) => updateEducation(edu.id, 'startDate', e.target.value)}
                        placeholder="Başlangıç"
                        className="px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                      />
                      <input
                        type="month"
                        value={edu.endDate || ''}
                        onChange={(e) => updateEducation(edu.id, 'endDate', e.target.value)}
                        placeholder="Bitiş"
                        disabled={edu.current}
                        className="px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 outline-none disabled:bg-slate-50"
                      />
                    </div>

                    <label className="flex items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        checked={edu.current || false}
                        onChange={(e) => updateEducation(edu.id, 'current', e.target.checked)}
                        className="rounded"
                      />
                      <span className="text-slate-600">Devam Ediyor</span>
                    </label>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 border border-dashed border-slate-200 rounded-lg">
                <GraduationCap className="h-10 w-10 text-slate-300 mx-auto mb-2" />
                <p className="text-sm text-slate-500">Henüz eğitim bilgisi eklenmedi</p>
                <button
                  onClick={addEducation}
                  className="mt-3 text-sm font-medium text-emerald-600 hover:text-emerald-700"
                >
                  İlk Eğitimi Ekle
                </button>
              </div>
            )}
          </div>
        );


      case 'experience':
        return (
          <div className="space-y-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-slate-900">İş Deneyimi</h3>
              <button
                onClick={addExperience}
                className="flex items-center gap-1 text-sm font-medium text-emerald-600 hover:text-emerald-700"
              >
                <Plus className="h-4 w-4" />
                Ekle
              </button>
            </div>

            {profileData.experience && profileData.experience.length > 0 ? (
              <div className="space-y-3">
                {profileData.experience.map((exp) => (
                  <div key={exp.id} className="p-4 border border-slate-200 rounded-lg space-y-3">
                    <div className="flex justify-between items-start gap-2">
                      <input
                        type="text"
                        value={exp.position}
                        onChange={(e) => updateExperience(exp.id, 'position', e.target.value)}
                        placeholder="Pozisyon/Ünvan"
                        className="flex-1 px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                      />
                      <button
                        onClick={() => removeExperience(exp.id)}
                        className="text-red-500 hover:text-red-600"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>

                    <input
                      type="text"
                      value={exp.company}
                      onChange={(e) => updateExperience(exp.id, 'company', e.target.value)}
                      placeholder="Şirket Adı"
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                    />

                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="month"
                        value={exp.startDate}
                        onChange={(e) => updateExperience(exp.id, 'startDate', e.target.value)}
                        className="px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                      />
                      <input
                        type="month"
                        value={exp.endDate || ''}
                        onChange={(e) => updateExperience(exp.id, 'endDate', e.target.value)}
                        disabled={exp.current}
                        className="px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 outline-none disabled:bg-slate-50"
                      />
                    </div>

                    <label className="flex items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        checked={exp.current || false}
                        onChange={(e) => updateExperience(exp.id, 'current', e.target.checked)}
                        className="rounded"
                      />
                      <span className="text-slate-600">Halen Çalışıyorum</span>
                    </label>

                    <textarea
                      value={exp.description || ''}
                      onChange={(e) => updateExperience(exp.id, 'description', e.target.value)}
                      placeholder="Görev ve sorumluluklar..."
                      rows={2}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                    />
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 border border-dashed border-slate-200 rounded-lg">
                <Briefcase className="h-10 w-10 text-slate-300 mx-auto mb-2" />
                <p className="text-sm text-slate-500">Henüz iş deneyimi eklenmedi</p>
                <button
                  onClick={addExperience}
                  className="mt-3 text-sm font-medium text-emerald-600 hover:text-emerald-700"
                >
                  İlk Deneyimi Ekle
                </button>
              </div>
            )}
          </div>
        );


      case 'skills':
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-slate-900 mb-4">Teknik Yetenekler</h3>
            
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Yetenekleriniz</label>
              <input
                type="text"
                value={profileData.skills?.join(', ') || ''}
                onChange={(e) => setProfileData({ 
                  ...profileData, 
                  skills: e.target.value.split(',').map(s => s.trim()).filter(s => s) 
                })}
                placeholder="React, TypeScript, Node.js, Python (virgülle ayırın)"
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
              />
              <p className="text-xs text-slate-500 mt-1">Yeteneklerinizi virgülle ayırarak yazın</p>
            </div>

            {profileData.skills && profileData.skills.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-3">
                {profileData.skills.map((skill, idx) => (
                  <span 
                    key={idx} 
                    className="px-3 py-1 bg-emerald-50 text-emerald-700 rounded-full text-sm font-medium"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            )}
          </div>
        );

      case 'certificates':
        return (
          <div className="space-y-4">
            <CertificateManager
              certificates={profileData.certificates || []}
              onUpdate={(certs) => setProfileData({ ...profileData, certificates: certs })}
              userTitle={profileData.title}
              userSkills={profileData.skills}
            />
          </div>
        );

      case 'languages':
        return (
          <div className="space-y-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-slate-900">Yabancı Diller</h3>
              <button
                onClick={addLanguage}
                className="flex items-center gap-1 text-sm font-medium text-emerald-600 hover:text-emerald-700"
              >
                <Plus className="h-4 w-4" />
                Ekle
              </button>
            </div>

            {profileData.languages && profileData.languages.length > 0 ? (
              <div className="space-y-3">
                {profileData.languages.map((lang) => (
                  <div key={lang.id} className="flex items-center gap-2">
                    <input
                      type="text"
                      value={lang.language}
                      onChange={(e) => updateLanguage(lang.id, 'language', e.target.value)}
                      placeholder="Dil (İngilizce, Almanca...)"
                      className="flex-1 px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                    />
                    <select
                      value={lang.level}
                      onChange={(e) => updateLanguage(lang.id, 'level', e.target.value)}
                      className="px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                    >
                      <option value="beginner">Başlangıç</option>
                      <option value="intermediate">Orta</option>
                      <option value="advanced">İleri</option>
                      <option value="native">Ana Dil</option>
                    </select>
                    <button
                      onClick={() => removeLanguage(lang.id)}
                      className="text-red-500 hover:text-red-600"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 border border-dashed border-slate-200 rounded-lg">
                <Languages className="h-10 w-10 text-slate-300 mx-auto mb-2" />
                <p className="text-sm text-slate-500">Henüz dil bilgisi eklenmedi</p>
              </div>
            )}
          </div>
        );


      case 'social':
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-slate-900 mb-4">Sosyal Medya & Portföy</h3>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1 flex items-center gap-2">
                <LinkIcon className="h-4 w-4 text-blue-600" />
                LinkedIn
              </label>
              <input
                type="url"
                value={profileData.linkedinUrl || ''}
                onChange={(e) => setProfileData({ ...profileData, linkedinUrl: e.target.value })}
                placeholder="https://linkedin.com/in/kullaniciadi"
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1 flex items-center gap-2">
                <Code className="h-4 w-4 text-slate-800" />
                GitHub
              </label>
              <input
                type="url"
                value={profileData.githubUrl || ''}
                onChange={(e) => setProfileData({ ...profileData, githubUrl: e.target.value })}
                placeholder="https://github.com/kullaniciadi"
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1 flex items-center gap-2">
                <Globe className="h-4 w-4 text-emerald-600" />
                Portföy/Website
              </label>
              <input
                type="url"
                value={profileData.portfolioUrl || ''}
                onChange={(e) => setProfileData({ ...profileData, portfolioUrl: e.target.value })}
                placeholder="https://yourportfolio.com"
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
              />
            </div>

            <div className="mt-6 p-4 bg-emerald-50 border border-emerald-100 rounded-lg">
              <div className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-emerald-600 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-emerald-900">Profiliniz Neredeyse Tamam!</p>
                  <p className="text-xs text-emerald-700 mt-1">
                    Tüm bilgileri ekledikten sonra AI eşleştirme sistemi size en uygun iş ilanlarını bulacak.
                  </p>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };


  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <div className="relative w-full max-w-3xl bg-white rounded-3xl shadow-2xl max-h-[90vh] flex flex-col">
        
        {/* Header */}
        <div className="p-6 border-b border-slate-200">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-slate-900">Profil Tamamlama</h2>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-slate-600 transition"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="font-medium text-slate-600">
                Adım {currentStep + 1} / {steps.length}
              </span>
              <span className="font-semibold text-emerald-600">
                {Math.round(((currentStep + 1) / steps.length) * 100)}% Tamamlandı
              </span>
            </div>
            <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-emerald-500 to-emerald-600 transition-all duration-300"
                style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
              />
            </div>
          </div>

          {/* Step Indicators */}
          <div className="flex items-center justify-between mt-4 overflow-x-auto">
            {steps.map((step, idx) => {
              const Icon = step.icon;
              const isActive = idx === currentStep;
              const isCompleted = idx < currentStep;
              
              return (
                <div key={step.id} className="flex items-center">
                  <div
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition-all ${
                      isActive
                        ? 'bg-emerald-100 text-emerald-700'
                        : isCompleted
                        ? 'bg-emerald-50 text-emerald-600'
                        : 'bg-slate-50 text-slate-400'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    <span className="text-xs font-medium hidden sm:inline">{step.title}</span>
                  </div>
                  {idx < steps.length - 1 && (
                    <ChevronRight className="h-4 w-4 text-slate-300 mx-1" />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {renderStepContent()}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-slate-200 bg-slate-50">
          <div className="flex items-center justify-between">
            <button
              onClick={handleBack}
              disabled={currentStep === 0}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-800 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="h-4 w-4" />
              Geri
            </button>

            <button
              onClick={handleNext}
              disabled={isSaving}
              className="flex items-center gap-2 px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg transition disabled:opacity-50"
            >
              {currentStep === steps.length - 1 ? (
                isSaving ? 'Kaydediliyor...' : 'Tamamla'
              ) : (
                <>
                  İleri
                  <ChevronRight className="h-4 w-4" />
                </>
              )}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
