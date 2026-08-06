import React, { useState, useEffect, useRef } from 'react';
import {
  ArrowLeft, Loader2, MapPin, Briefcase, GraduationCap, Mail, Globe, 
  Github, Linkedin, Calendar, Building2, Award, Code2, Languages, Phone, 
  Edit3, Share2, Download, Eye, Users, FolderGit2, CheckCircle2, TrendingUp,
  DollarSign, Clock, Target, Camera, X, Upload
} from 'lucide-react';
import { User, EducationEntry, ExperienceEntry } from '../types';
import { ProfileWizard } from './ProfileWizard';

interface PublicProfilePageProps {
  userId: string;
  currentUser: User | null;
  onBack: () => void;
  onProfileUpdated?: (updatedUser: User) => void;
  onNavigateToProfile?: (userId: string) => void;
}

export const PublicProfilePage: React.FC<PublicProfilePageProps> = ({
  userId,
  currentUser,
  onBack,
  onProfileUpdated,
  onNavigateToProfile
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewCount, setViewCount] = useState(0);
  const [activeTab, setActiveTab] = useState<'overview' | 'experience' | 'education' | 'projects' | 'certificates' | 'languages' | 'friends' | 'connections'>('overview');
  const [showEditModal, setShowEditModal] = useState(false);
  const [showPhotoUpload, setShowPhotoUpload] = useState(false);
  const [photoUploadError, setPhotoUploadError] = useState<string | null>(null);
  const photoInputRef = useRef<HTMLInputElement>(null);

  // Friends & Connections state
  const [friends, setFriends] = useState<User[]>([]);
  const [friendsLoading, setFriendsLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<{
    highProbability: User[];
    sameSector: User[];
    discover: User[];
  }>({ highProbability: [], sameSector: [], discover: [] });
  const [suggestionsLoading, setSuggestionsLoading] = useState(false);

  // Scroll to top when userId changes (profile navigation)
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [userId]);
  useEffect(() => {
    fetchUserProfile();
    incrementViewCount();
    if (activeTab === 'friends') {
      fetchFriends();
    } else if (activeTab === 'connections' && currentUser) {
      fetchSuggestions();
    }
  }, [userId, activeTab]);

  const fetchUserProfile = async () => {
    setIsLoading(true);
    setError(null);
    try {
      // Eğer kendi profiliniz ise, direkt currentUser'ı kullan
      if (currentUser?.id === userId) {
        setUser(currentUser);
        setViewCount((currentUser as any).profileViews || 0);
        setIsLoading(false);
        return;
      }

      // API'den dene
      const res = await fetch(`/api/user/${userId}`);
      if (!res.ok) {
        // 404 - localStorage'dan dene
        setError(res.status === 404 ? 'Kullanıcı bulunamadı' : 'Profil yüklenirken hata oluştu');
        return;
      }
      const data = await res.json();
      setUser(data.user);
      setViewCount(data.user.profileViews || 0);
    } catch (err) {
      console.error('Profile fetch error:', err);
      // Network hatasında currentUser varsa onu kullan
      if (currentUser?.id === userId) {
        setUser(currentUser);
        setViewCount(0);
      } else {
        setError('Bağlantı hatası');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const incrementViewCount = async () => {
    if (currentUser?.id === userId) return; // Kendi profilini sayma
    try {
      await fetch(`/api/user/${userId}/view`, { method: 'POST' });
    } catch (err) {
      console.error('View count error:', err);
    }
  };

  const fetchFriends = async () => {
    setFriendsLoading(true);
    try {
      const res = await fetch(`/api/connections/friends/${userId}`);
      const data = await res.json();
      if (res.ok) {
        setFriends(data.friends || []);
      }
    } catch (err) {
      console.error('Friends fetch error:', err);
    } finally {
      setFriendsLoading(false);
    }
  };

  const fetchSuggestions = async () => {
    if (!currentUser) return;
    setSuggestionsLoading(true);
    try {
      const res = await fetch(`/api/connections/suggestions/${currentUser.id}`);
      const data = await res.json();
      if (res.ok) {
        setSuggestions({
          highProbability: data.highProbability || [],
          sameSector: data.sameSector || [],
          discover: data.discover || []
        });
      }
    } catch (err) {
      console.error('Suggestions fetch error:', err);
    } finally {
      setSuggestionsLoading(false);
    }
  };

  const handleSendConnectionRequest = async (targetUserId: string) => {
    if (!currentUser) return;
    try {
      const res = await fetch('/api/network/connections/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fromUserId: currentUser.id,
          toUserId: targetUserId,
          message: 'Bağlantı kurmak istiyorum.'
        })
      });
      if (res.ok) {
        alert('Bağlantı isteği gönderildi!');
      }
    } catch (err) {
      console.error('Connection request error:', err);
    }
  };

  const handlePhotoUpload = (file: File) => {
    if (!file) return;
    setPhotoUploadError(null);
    
    // Dosyayı base64'e dönüştür (preview için)
    const reader = new FileReader();
    reader.onloadend = () => {
      const photoBase64 = reader.result as string;
      
      // Local state güncelle (preview için)
      setUser(prev => prev ? { ...prev, avatarUrl: photoBase64 } : prev);
      
      // localStorage'a kaydet — ama base64 yerine flagı tut
      if (onProfileUpdated && currentUser && currentUser.id === userId) {
        const updatedUser = { ...currentUser, avatarUrl: photoBase64 };
        onProfileUpdated(updatedUser);
        // sessionStorage kullan — geçici, localStorage'a az yer
        sessionStorage.setItem(`avatar_${currentUser.id}`, photoBase64);
      }
      
      setShowPhotoUpload(false);
    };
    reader.readAsDataURL(file);
  };

  const handleShareProfile = () => {
    const url = `${window.location.origin}/profile/${userId}`;
    if (navigator.share) {
      navigator.share({ title: `${user?.fullName} - Profil`, url });
    } else {
      navigator.clipboard.writeText(url);
      alert('Profil linki kopyalandı!');
    }
  };

  const handleDownloadCV = async () => {
    try {
      const res = await fetch(`/api/user/${userId}/cv`);
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${user?.fullName}_CV.pdf`;
      a.click();
    } catch (err) {
      console.error('CV download error:', err);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-slate-600 font-semibold">Profil yükleniyor...</p>
        </div>
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-lg p-8 text-center">
          <div className="h-16 w-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">❌</span>
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Profil Bulunamadı</h2>
          <p className="text-slate-600 mb-6">{error || 'Bu kullanıcı bulunamadı.'}</p>
          <button
            onClick={onBack}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition flex items-center gap-2 mx-auto"
          >
            <ArrowLeft className="h-5 w-5" />
            Geri Dön
          </button>
        </div>
      </div>
    );
  }

  const isOwnProfile = currentUser?.id === userId;
  const projectsCount = user.projects?.length || 0;
  const certificatesCount = user.certificates?.length || 0;
  const connectionsCount = user.connections?.length || 0;

  return (
    <>
    <div className="min-h-screen bg-slate-100">
      {/* Top Navigation */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-slate-600 hover:text-slate-900 font-medium transition"
          >
            <ArrowLeft className="h-5 w-5" />
            Geri
          </button>
          <button
            onClick={handleShareProfile}
            className="flex items-center gap-2 px-4 py-2 border border-blue-600 text-blue-600 hover:bg-blue-50 rounded-xl transition text-sm font-medium"
          >
            <Share2 className="h-4 w-4" />
            Profili Paylaş
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left & Center Column - Main Content */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Profile Header Card */}
            <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
              {/* Cover Photo */}
              <div className="h-48 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 relative">
                {user.coverPhotoUrl && (
                  <img src={user.coverPhotoUrl} alt="kapak" className="w-full h-full object-cover" />
                )}
              </div>

              {/* Profile Info */}
              <div className="px-6 pb-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between -mt-16 mb-4 gap-4">
                  {/* Avatar */}
                  <div className="relative group">
                    {user.avatarUrl ? (
                      <img
                        src={user.avatarUrl.startsWith('data:') || user.avatarUrl.startsWith('http') ? user.avatarUrl : `http://127.0.0.1:5001${user.avatarUrl}`}
                        alt={user.fullName}
                        className="h-32 w-32 rounded-2xl border-4 border-white object-cover shadow-lg"
                      />
                    ) : (
                      <div className="h-32 w-32 rounded-2xl border-4 border-white bg-gradient-to-br from-blue-500 to-indigo-600 text-white flex items-center justify-center font-bold text-4xl shadow-lg">
                        {(user.fullName || '?').charAt(0)}
                      </div>
                    )}
                    {isOwnProfile && (
                      <button 
                        onClick={() => setShowPhotoUpload(true)}
                        className="absolute inset-0 h-32 w-32 rounded-2xl bg-black/50 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition cursor-pointer"
                      >
                        <div className="text-center">
                          <Edit3 className="h-6 w-6 mx-auto mb-1" />
                          <p className="text-xs font-medium">Değiştir</p>
                        </div>
                      </button>
                    )}
                  </div>

                  {/* Edit Button */}
                  {isOwnProfile && (
                    <button
                      onClick={() => setShowEditModal(true)}
                      className="flex items-center gap-2 px-5 py-2.5 border-2 border-blue-600 text-blue-600 rounded-xl hover:bg-blue-50 transition font-semibold"
                    >
                      <Edit3 className="h-4 w-4" />
                      Profili Düzenle
                    </button>
                  )}
                </div>

                {/* Name & Title */}
                <h1 className="text-3xl font-bold text-slate-900 mb-1">{user.fullName}</h1>
                {user.title && <p className="text-lg text-slate-600 mb-3">{user.title}</p>}

                {/* Location & Contact */}
                <div className="flex flex-wrap items-center gap-4 text-sm text-slate-600 mb-4">
                  {user.location && (
                    <span className="flex items-center gap-1.5">
                      <MapPin className="h-4 w-4 text-slate-400" />
                      {user.location}
                    </span>
                  )}
                  {user.email && (
                    <a href={`mailto:${user.email}`} className="flex items-center gap-1.5 hover:text-blue-600 transition">
                      <Mail className="h-4 w-4 text-slate-400" />
                      {user.email}
                    </a>
                  )}
                  {user.phone && (
                    <span className="flex items-center gap-1.5">
                      <Phone className="h-4 w-4 text-slate-400" />
                      {user.phone}
                    </span>
                  )}
                </div>

                {/* Social Links */}
                {(user.linkedinUrl || user.githubUrl || user.portfolioUrl) && (
                  <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
                    {user.linkedinUrl && (
                      <a href={user.linkedinUrl} target="_blank" rel="noreferrer"
                        className="flex items-center gap-2 px-3 py-2 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-lg transition text-sm font-medium">
                        <Linkedin className="h-4 w-4" /> LinkedIn
                      </a>
                    )}
                    {user.githubUrl && (
                      <a href={user.githubUrl} target="_blank" rel="noreferrer"
                        className="flex items-center gap-2 px-3 py-2 bg-slate-100 text-slate-700 hover:bg-slate-200 rounded-lg transition text-sm font-medium">
                        <Github className="h-4 w-4" /> GitHub
                      </a>
                    )}
                    {user.portfolioUrl && (
                      <a href={user.portfolioUrl} target="_blank" rel="noreferrer"
                        className="flex items-center gap-2 px-3 py-2 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-lg transition text-sm font-medium">
                        <Globe className="h-4 w-4" /> Portfolio
                      </a>
                    )}
                  </div>
                )}

                {/* Profile Stats - Yan Yana */}
                <div className="grid grid-cols-3 gap-3 pt-4">
                  <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-3 text-center border border-blue-200">
                    <div className="flex items-center justify-center gap-1.5 mb-1">
                      <Eye className="h-4 w-4 text-blue-600" />
                    </div>
                    <p className="text-2xl font-bold text-blue-700">{viewCount}</p>
                    <p className="text-xs text-blue-600 font-medium mt-0.5">Görüntülenme</p>
                  </div>
                  <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-xl p-3 text-center border border-emerald-200">
                    <div className="flex items-center justify-center gap-1.5 mb-1">
                      <Users className="h-4 w-4 text-emerald-600" />
                    </div>
                    <p className="text-2xl font-bold text-emerald-700">{connectionsCount}</p>
                    <p className="text-xs text-emerald-600 font-medium mt-0.5">Bağlantı</p>
                  </div>
                  <div className="bg-gradient-to-br from-violet-50 to-violet-100 rounded-xl p-3 text-center border border-violet-200">
                    <div className="flex items-center justify-center gap-1.5 mb-1">
                      <FolderGit2 className="h-4 w-4 text-violet-600" />
                    </div>
                    <p className="text-2xl font-bold text-violet-700">{projectsCount}</p>
                    <p className="text-xs text-violet-600 font-medium mt-0.5">Proje</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Tabs */}
            <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
              <div className="flex items-center border-b border-slate-200 overflow-x-auto">
                <button
                  onClick={() => setActiveTab('overview')}
                  className={`px-6 py-4 text-sm font-semibold whitespace-nowrap border-b-2 transition ${
                    activeTab === 'overview'
                      ? 'border-blue-600 text-blue-600'
                      : 'border-transparent text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Genel Bakış
                </button>
                <button
                  onClick={() => setActiveTab('experience')}
                  className={`px-6 py-4 text-sm font-semibold whitespace-nowrap border-b-2 transition ${
                    activeTab === 'experience'
                      ? 'border-blue-600 text-blue-600'
                      : 'border-transparent text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Deneyim
                </button>
                <button
                  onClick={() => setActiveTab('education')}
                  className={`px-6 py-4 text-sm font-semibold whitespace-nowrap border-b-2 transition ${
                    activeTab === 'education'
                      ? 'border-blue-600 text-blue-600'
                      : 'border-transparent text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Eğitim
                </button>
                <button
                  onClick={() => setActiveTab('projects')}
                  className={`px-6 py-4 text-sm font-semibold whitespace-nowrap border-b-2 transition ${
                    activeTab === 'projects'
                      ? 'border-blue-600 text-blue-600'
                      : 'border-transparent text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Projeler
                </button>
                <button
                  onClick={() => setActiveTab('certificates')}
                  className={`px-6 py-4 text-sm font-semibold whitespace-nowrap border-b-2 transition ${
                    activeTab === 'certificates'
                      ? 'border-blue-600 text-blue-600'
                      : 'border-transparent text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Sertifikalar
                </button>
                <button
                  onClick={() => setActiveTab('languages')}
                  className={`px-6 py-4 text-sm font-semibold whitespace-nowrap border-b-2 transition ${
                    activeTab === 'languages'
                      ? 'border-blue-600 text-blue-600'
                      : 'border-transparent text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Diller
                </button>
                <button
                  onClick={() => setActiveTab('friends')}
                  className={`px-6 py-4 text-sm font-semibold whitespace-nowrap border-b-2 transition ${
                    activeTab === 'friends'
                      ? 'border-blue-600 text-blue-600'
                      : 'border-transparent text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Arkadaşlar
                </button>
                {currentUser && (
                  <button
                    onClick={() => setActiveTab('connections')}
                    className={`px-6 py-4 text-sm font-semibold whitespace-nowrap border-b-2 transition ${
                      activeTab === 'connections'
                        ? 'border-blue-600 text-blue-600'
                        : 'border-transparent text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Bağlantılar
                  </button>
                )}
              </div>
            </div>

            {/* Tab Content */}
            {activeTab === 'overview' && (
              <div className="space-y-6">
                {user.bio && (
              <div className="bg-white rounded-2xl shadow-sm p-6">
                <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                  <div className="h-1 w-8 bg-blue-600 rounded" />
                  Hakkımda
                </h2>
                <p className="text-slate-700 leading-relaxed whitespace-pre-wrap">{user.bio}</p>
              </div>
            )}

            {/* İş Deneyimi */}
            {user.experience && user.experience.length > 0 && (
              <div className="bg-white rounded-2xl shadow-sm p-6">
                <h2 className="text-lg font-bold text-slate-900 mb-5 flex items-center gap-2">
                  <Briefcase className="h-5 w-5 text-blue-600" />
                  İş Deneyimi (Özet)
                </h2>
                <div className="space-y-4">
                  {user.experience.slice(0, 2).map((exp: ExperienceEntry) => (
                    <div key={exp.id} className="relative pl-6 border-l-2 border-blue-200 hover:border-blue-400 transition">
                      <div className="absolute w-3 h-3 bg-blue-600 rounded-full -left-[7px] top-2 border-2 border-white shadow" />
                      <div className="bg-slate-50 p-4 rounded-xl hover:bg-slate-100 transition">
                        <h3 className="font-bold text-slate-900 text-base">{exp.position}</h3>
                        <p className="text-sm text-slate-700 font-medium flex items-center gap-1.5 mt-1">
                          <Building2 className="h-3.5 w-3.5" />
                          {exp.company}
                        </p>
                        <p className="text-xs text-slate-500 mt-2 flex items-center gap-1.5">
                          <Calendar className="h-3.5 w-3.5" />
                          {exp.startDate} – {exp.current ? 'Devam Ediyor' : exp.endDate}
                        </p>
                        {exp.description && (
                          <p className="text-sm text-slate-600 mt-3 leading-relaxed">{exp.description}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
                {user.experience.length > 2 && (
                  <button
                    onClick={() => setActiveTab('experience')}
                    className="mt-4 text-sm text-blue-600 hover:text-blue-700 font-semibold"
                  >
                    Tümünü Gör ({user.experience.length})
                  </button>
                )}
              </div>
            )}

            {/* Eğitim */}
            {user.education && user.education.length > 0 && (
              <div className="bg-white rounded-2xl shadow-sm p-6">
                <h2 className="text-lg font-bold text-slate-900 mb-5 flex items-center gap-2">
                  <GraduationCap className="h-5 w-5 text-emerald-600" />
                  Eğitim (Özet)
                </h2>
                <div className="space-y-4">
                  {user.education.slice(0, 2).map((edu: EducationEntry) => (
                    <div key={edu.id} className="relative pl-6 border-l-2 border-emerald-200 hover:border-emerald-400 transition">
                      <div className="absolute w-3 h-3 bg-emerald-600 rounded-full -left-[7px] top-2 border-2 border-white shadow" />
                      <div className="bg-emerald-50 p-4 rounded-xl hover:bg-emerald-100 transition">
                        <h3 className="font-bold text-slate-900 text-base">{edu.school}</h3>
                        <p className="text-sm text-slate-700 font-medium mt-1">
                          {edu.degree}{edu.field ? ` – ${edu.field}` : ''}
                        </p>
                        <p className="text-xs text-slate-500 mt-2 flex items-center gap-1.5">
                          <Calendar className="h-3.5 w-3.5" />
                          {edu.startDate} – {edu.current ? 'Devam Ediyor' : edu.endDate}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
                {user.education.length > 2 && (
                  <button
                    onClick={() => setActiveTab('education')}
                    className="mt-4 text-sm text-blue-600 hover:text-blue-700 font-semibold"
                  >
                    Tümünü Gör ({user.education.length})
                  </button>
                )}
              </div>
            )}

            {/* Yetenekler */}
            {user.skills && user.skills.length > 0 && (
              <div className="bg-white rounded-2xl shadow-sm p-6">
                <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                  <Code2 className="h-5 w-5 text-violet-600" />
                  Yetenekler (Özet)
                </h2>
                <div className="flex flex-wrap gap-2">
                  {user.skills.slice(0, 10).map((skill, i) => (
                    <span key={i} className="px-4 py-2 bg-violet-50 text-violet-700 border border-violet-200 rounded-lg text-sm font-semibold hover:bg-violet-100 transition">
                      {skill}
                    </span>
                  ))}
                  {user.skills.length > 10 && (
                    <span className="px-4 py-2 bg-slate-100 text-slate-600 rounded-lg text-sm font-semibold">
                      +{user.skills.length - 10} daha
                    </span>
                  )}
                </div>
              </div>
            )}
              </div>
            )}

            {/* Experience Tab */}
            {activeTab === 'experience' && (
              <div className="bg-white rounded-2xl shadow-sm p-6">
                <h2 className="text-lg font-bold text-slate-900 mb-5 flex items-center gap-2">
                  <Briefcase className="h-5 w-5 text-blue-600" />
                  Tüm İş Deneyimleri
                </h2>
                {user.experience && user.experience.length > 0 ? (
                  <div className="space-y-6">
                    {user.experience.map((exp: ExperienceEntry) => (
                      <div key={exp.id} className="relative pl-6 border-l-2 border-blue-200 hover:border-blue-400 transition">
                        <div className="absolute w-3 h-3 bg-blue-600 rounded-full -left-[7px] top-2 border-2 border-white shadow" />
                        <div className="bg-slate-50 p-4 rounded-xl hover:bg-slate-100 transition">
                          <h3 className="font-bold text-slate-900 text-base">{exp.position}</h3>
                          <p className="text-sm text-slate-700 font-medium flex items-center gap-1.5 mt-1">
                            <Building2 className="h-3.5 w-3.5" />
                            {exp.company}
                          </p>
                          <p className="text-xs text-slate-500 mt-2 flex items-center gap-1.5">
                            <Calendar className="h-3.5 w-3.5" />
                            {exp.startDate} – {exp.current ? 'Devam Ediyor' : exp.endDate}
                          </p>
                          {exp.description && (
                            <p className="text-sm text-slate-600 mt-3 leading-relaxed">{exp.description}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-slate-500 text-center py-8">Henüz deneyim eklenmemiş.</p>
                )}
              </div>
            )}

            {/* Education Tab */}
            {activeTab === 'education' && (
              <div className="bg-white rounded-2xl shadow-sm p-6">
                <h2 className="text-lg font-bold text-slate-900 mb-5 flex items-center gap-2">
                  <GraduationCap className="h-5 w-5 text-emerald-600" />
                  Tüm Eğitimler
                </h2>
                {user.education && user.education.length > 0 ? (
                  <div className="space-y-6">
                    {user.education.map((edu: EducationEntry) => (
                      <div key={edu.id} className="relative pl-6 border-l-2 border-emerald-200 hover:border-emerald-400 transition">
                        <div className="absolute w-3 h-3 bg-emerald-600 rounded-full -left-[7px] top-2 border-2 border-white shadow" />
                        <div className="bg-emerald-50 p-4 rounded-xl hover:bg-emerald-100 transition">
                          <h3 className="font-bold text-slate-900 text-base">{edu.school}</h3>
                          <p className="text-sm text-slate-700 font-medium mt-1">
                            {edu.degree}{edu.field ? ` – ${edu.field}` : ''}
                          </p>
                          <p className="text-xs text-slate-500 mt-2 flex items-center gap-1.5">
                            <Calendar className="h-3.5 w-3.5" />
                            {edu.startDate} – {edu.current ? 'Devam Ediyor' : edu.endDate}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-slate-500 text-center py-8">Henüz eğitim eklenmemiş.</p>
                )}
              </div>
            )}

            {/* Projects Tab */}
            {activeTab === 'projects' && (
              <div className="bg-white rounded-2xl shadow-sm p-6">
                <h2 className="text-lg font-bold text-slate-900 mb-5 flex items-center gap-2">
                  <FolderGit2 className="h-5 w-5 text-indigo-600" />
                  Tüm Projeler
                </h2>
                {user.projects && user.projects.length > 0 ? (
                  <div className="grid grid-cols-1 gap-4">
                    {user.projects.map((project: any, i: number) => (
                      <div key={i} className="p-5 bg-gradient-to-br from-slate-50 to-slate-100 border border-slate-200 rounded-xl hover:shadow-md transition">
                        <div className="flex items-start justify-between mb-3">
                          <h3 className="font-bold text-slate-900 text-base">{project.name}</h3>
                          <FolderGit2 className="h-5 w-5 text-indigo-600 flex-shrink-0" />
                        </div>
                        {project.description && (
                          <p className="text-sm text-slate-600 leading-relaxed mb-3">{project.description}</p>
                        )}
                        {project.technologies && project.technologies.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 mb-3">
                            {project.technologies.map((tech: string, ti: number) => (
                              <span key={ti} className="px-2 py-1 bg-white text-slate-700 border border-slate-300 rounded text-xs font-medium">
                                {tech}
                              </span>
                            ))}
                          </div>
                        )}
                        <div className="flex items-center gap-3 text-xs">
                          {project.githubUrl && (
                            <a href={project.githubUrl} target="_blank" rel="noreferrer"
                              className="flex items-center gap-1.5 text-slate-600 hover:text-slate-900 font-medium">
                              <Github className="h-3.5 w-3.5" /> GitHub
                            </a>
                          )}
                          {project.liveUrl && (
                            <a href={project.liveUrl} target="_blank" rel="noreferrer"
                              className="flex items-center gap-1.5 text-blue-600 hover:text-blue-700 font-medium">
                              <Globe className="h-3.5 w-3.5" /> Demo
                            </a>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-slate-500 text-center py-8">Henüz proje eklenmemiş.</p>
                )}
              </div>
            )}

            {/* Certificates Tab */}
            {activeTab === 'certificates' && (
              <div className="bg-white rounded-2xl shadow-sm p-6">
                <h2 className="text-lg font-bold text-slate-900 mb-5 flex items-center gap-2">
                  <Award className="h-5 w-5 text-amber-600" />
                  Tüm Sertifikalar
                </h2>
                {user.certificates && user.certificates.length > 0 ? (
                  <div className="space-y-3">
                    {user.certificates.map((cert: any, i: number) => (
                      <div key={i} className="flex items-start gap-4 p-4 bg-amber-50 border border-amber-200 rounded-xl hover:bg-amber-100 transition">
                        <Award className="h-6 w-6 text-amber-600 flex-shrink-0 mt-0.5" />
                        <div className="flex-1">
                          <h3 className="font-bold text-slate-900 text-sm">{cert.name}</h3>
                          {cert.issuer && <p className="text-xs text-slate-700 mt-1 font-medium">{cert.issuer}</p>}
                          <div className="flex items-center gap-3 mt-2 text-xs text-slate-500">
                            {cert.date && (
                              <span className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" /> {cert.date}
                              </span>
                            )}
                            {cert.verificationUrl && (
                              <a href={cert.verificationUrl} target="_blank" rel="noreferrer"
                                className="flex items-center gap-1 text-blue-600 hover:text-blue-700 font-medium">
                                <CheckCircle2 className="h-3 w-3" /> Doğrula
                              </a>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-slate-500 text-center py-8">Henüz sertifika eklenmemiş.</p>
                )}
              </div>
            )}

            {/* Languages Tab */}
            {activeTab === 'languages' && (
              <div className="bg-white rounded-2xl shadow-sm p-6">
                <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                  <Languages className="h-5 w-5 text-cyan-600" />
                  Bildiğim Diller
                </h2>
                {user.languages && user.languages.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {user.languages.map((lang: any, i: number) => (
                      <span key={i} className="px-4 py-2 bg-cyan-50 text-cyan-700 border border-cyan-200 rounded-lg text-sm font-semibold">
                        {typeof lang === 'string' ? lang : `${lang.name}${lang.level ? ` – ${lang.level}` : ''}`}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-slate-500 text-center py-8">Henüz dil eklenmemiş.</p>
                )}
              </div>
            )}

            {/* Projeler */}
            {user.projects && user.projects.length > 0 && (
              <div className="bg-white rounded-2xl shadow-sm p-6">
                <h2 className="text-lg font-bold text-slate-900 mb-5 flex items-center gap-2">
                  <FolderGit2 className="h-5 w-5 text-indigo-600" />
                  Projeler
                </h2>
                <div className="grid grid-cols-1 gap-4">
                  {user.projects.map((project: any, i: number) => (
                    <div key={i} className="p-5 bg-gradient-to-br from-slate-50 to-slate-100 border border-slate-200 rounded-xl hover:shadow-md transition">
                      <div className="flex items-start justify-between mb-3">
                        <h3 className="font-bold text-slate-900 text-base">{project.name}</h3>
                        <FolderGit2 className="h-5 w-5 text-indigo-600 flex-shrink-0" />
                      </div>
                      {project.description && (
                        <p className="text-sm text-slate-600 leading-relaxed mb-3">{project.description}</p>
                      )}
                      {project.technologies && project.technologies.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mb-3">
                          {project.technologies.map((tech: string, ti: number) => (
                            <span key={ti} className="px-2 py-1 bg-white text-slate-700 border border-slate-300 rounded text-xs font-medium">
                              {tech}
                            </span>
                          ))}
                        </div>
                      )}
                      <div className="flex items-center gap-3 text-xs">
                        {project.githubUrl && (
                          <a href={project.githubUrl} target="_blank" rel="noreferrer"
                            className="flex items-center gap-1.5 text-slate-600 hover:text-slate-900 font-medium">
                            <Github className="h-3.5 w-3.5" /> GitHub
                          </a>
                        )}
                        {project.liveUrl && (
                          <a href={project.liveUrl} target="_blank" rel="noreferrer"
                            className="flex items-center gap-1.5 text-blue-600 hover:text-blue-700 font-medium">
                            <Globe className="h-3.5 w-3.5" /> Demo
                          </a>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Sertifikalar */}
            {user.certificates && user.certificates.length > 0 && (
              <div className="bg-white rounded-2xl shadow-sm p-6">
                <h2 className="text-lg font-bold text-slate-900 mb-5 flex items-center gap-2">
                  <Award className="h-5 w-5 text-amber-600" />
                  Sertifikalar
                </h2>
                <div className="space-y-3">
                  {user.certificates.map((cert: any, i: number) => (
                    <div key={i} className="flex items-start gap-4 p-4 bg-amber-50 border border-amber-200 rounded-xl hover:bg-amber-100 transition">
                      <Award className="h-6 w-6 text-amber-600 flex-shrink-0 mt-0.5" />
                      <div className="flex-1">
                        <h3 className="font-bold text-slate-900 text-sm">{cert.name}</h3>
                        {cert.issuer && <p className="text-xs text-slate-700 mt-1 font-medium">{cert.issuer}</p>}
                        <div className="flex items-center gap-3 mt-2 text-xs text-slate-500">
                          {cert.date && (
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" /> {cert.date}
                            </span>
                          )}
                          {cert.verificationUrl && (
                            <a href={cert.verificationUrl} target="_blank" rel="noreferrer"
                              className="flex items-center gap-1 text-blue-600 hover:text-blue-700 font-medium">
                              <CheckCircle2 className="h-3 w-3" /> Doğrula
                            </a>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Languages Tab */}
            {activeTab === 'languages' && (
              <div className="bg-white rounded-2xl shadow-sm p-6">
                <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                  <Languages className="h-5 w-5 text-cyan-600" />
                  Diller
                </h2>
                {user.languages && user.languages.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {user.languages.map((lang: any, i: number) => (
                      <span key={i} className="px-4 py-2 bg-cyan-50 text-cyan-700 border border-cyan-200 rounded-lg text-sm font-semibold">
                        {typeof lang === 'string' ? lang : `${lang.name}${lang.level ? ` – ${lang.level}` : ''}`}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-slate-500 text-center py-8">Henüz dil bilgisi eklenmemiş.</p>
                )}
              </div>
            )}

            {/* Friends Tab */}
            {activeTab === 'friends' && (
              <div className="bg-white rounded-2xl shadow-sm p-6">
                <h2 className="text-lg font-bold text-slate-900 mb-5 flex items-center gap-2">
                  <Users className="h-5 w-5 text-emerald-600" />
                  Arkadaşlar ({friends.length})
                </h2>
                {friendsLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="h-8 w-8 text-blue-600 animate-spin" />
                  </div>
                ) : friends.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {friends.map((friend) => (
                      <div key={friend.id} className="p-4 border border-slate-200 rounded-xl hover:shadow-md transition">
                        <div className="flex items-center gap-3 mb-3">
                          {friend.avatarUrl ? (
                            <img
                              src={friend.avatarUrl.startsWith('http') ? friend.avatarUrl : `http://127.0.0.1:5001${friend.avatarUrl}`}
                              alt={friend.fullName}
                              className="h-12 w-12 rounded-lg object-cover"
                            />
                          ) : (
                            <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 text-white flex items-center justify-center font-bold text-lg">
                              {(friend.fullName || '?').charAt(0)}
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <h3 className="font-bold text-slate-900 text-sm truncate">{friend.fullName}</h3>
                            {friend.title && <p className="text-xs text-slate-600 truncate">{friend.title}</p>}
                          </div>
                        </div>
                        <button
                          onClick={() => onNavigateToProfile && onNavigateToProfile(friend.id)}
                          className="w-full px-3 py-2 text-xs font-semibold text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50 transition"
                        >
                          Profili Gör
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Users className="h-12 w-12 text-slate-300 mx-auto mb-3" />
                    <p className="text-slate-500 font-medium">Henüz arkadaş yok</p>
                  </div>
                )}
              </div>
            )}

            {/* Connections Tab */}
            {activeTab === 'connections' && currentUser && (
              <div className="bg-white rounded-2xl shadow-sm p-6">
                <h2 className="text-lg font-bold text-slate-900 mb-5 flex items-center gap-2">
                  <Users className="h-5 w-5 text-blue-600" />
                  Bağlantı Önerileri
                </h2>
                
                {suggestionsLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="h-8 w-8 text-blue-600 animate-spin" />
                  </div>
                ) : (
                  <div className="space-y-6">
                    
                    {/* High Probability */}
                    {suggestions.highProbability.length > 0 && (
                      <div>
                        <h3 className="text-sm font-bold text-emerald-700 mb-3 flex items-center gap-2">
                          <div className="h-2 w-2 bg-emerald-500 rounded-full" />
                          Yüksek Eşleşme ({suggestions.highProbability.length})
                        </h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          {suggestions.highProbability.map((person) => (
                            <UserConnectionCard key={person.id} person={person} onNavigateToProfile={onNavigateToProfile} onSendRequest={handleSendConnectionRequest} />
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Same Sector */}
                    {suggestions.sameSector.length > 0 && (
                      <div>
                        <h3 className="text-sm font-bold text-amber-700 mb-3 flex items-center gap-2">
                          <div className="h-2 w-2 bg-amber-500 rounded-full" />
                          Aynı Sektör ({suggestions.sameSector.length})
                        </h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          {suggestions.sameSector.map((person) => (
                            <UserConnectionCard key={person.id} person={person} onNavigateToProfile={onNavigateToProfile} onSendRequest={handleSendConnectionRequest} />
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Discover */}
                    {suggestions.discover.length > 0 && (
                      <div>
                        <h3 className="text-sm font-bold text-slate-700 mb-3 flex items-center gap-2">
                          <div className="h-2 w-2 bg-slate-500 rounded-full" />
                          Keşfet ({suggestions.discover.length})
                        </h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          {suggestions.discover.map((person) => (
                            <UserConnectionCard key={person.id} person={person} onNavigateToProfile={onNavigateToProfile} onSendRequest={handleSendConnectionRequest} />
                          ))}
                        </div>
                      </div>
                    )}

                    {suggestions.highProbability.length === 0 && suggestions.sameSector.length === 0 && suggestions.discover.length === 0 && (
                      <div className="text-center py-12">
                        <Users className="h-12 w-12 text-slate-300 mx-auto mb-3" />
                        <p className="text-slate-500 font-medium">Şu anda öneri yok</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

          </div>

          {/* Right Sidebar - Info Panel */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 space-y-6">
              
              {/* Özet Bilgiler */}
              <div className="bg-white rounded-2xl shadow-sm p-6">
                <h3 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-blue-600" />
                  Profil Özeti
                </h3>
                <div className="space-y-4">
                  {user.experienceYears !== undefined && (
                    <div className="flex items-center justify-between py-2 border-b border-slate-100">
                      <span className="text-sm text-slate-600 flex items-center gap-2">
                        <Briefcase className="h-4 w-4 text-slate-400" />
                        Deneyim
                      </span>
                      <span className="text-sm font-bold text-slate-900">{user.experienceYears} yıl</span>
                    </div>
                  )}
                  {user.location && (
                    <div className="flex items-center justify-between py-2 border-b border-slate-100">
                      <span className="text-sm text-slate-600 flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-slate-400" />
                        Konum
                      </span>
                      <span className="text-sm font-semibold text-slate-900">{user.location}</span>
                    </div>
                  )}
                  {user.workPreference && (
                    <div className="flex items-center justify-between py-2 border-b border-slate-100">
                      <span className="text-sm text-slate-600 flex items-center gap-2">
                        <Clock className="h-4 w-4 text-slate-400" />
                        Çalışma Tercihi
                      </span>
                      <span className="text-sm font-semibold text-slate-900">{user.workPreference}</span>
                    </div>
                  )}
                  {user.expectedSalary && (
                    <div className="flex items-center justify-between py-2 border-b border-slate-100">
                      <span className="text-sm text-slate-600 flex items-center gap-2">
                        <DollarSign className="h-4 w-4 text-slate-400" />
                        Maaş Beklentisi
                      </span>
                      <span className="text-sm font-semibold text-slate-900">{user.expectedSalary}</span>
                    </div>
                  )}
                  <div className="flex items-center justify-between py-2 border-b border-slate-100">
                    <span className="text-sm text-slate-600 flex items-center gap-2">
                      <Eye className="h-4 w-4 text-slate-400" />
                      Görüntülenme
                    </span>
                    <span className="text-sm font-bold text-blue-600">{viewCount}</span>
                  </div>
                  <div className="flex items-center justify-between py-2 border-b border-slate-100">
                    <span className="text-sm text-slate-600 flex items-center gap-2">
                      <FolderGit2 className="h-4 w-4 text-slate-400" />
                      Proje
                    </span>
                    <span className="text-sm font-bold text-slate-900">{projectsCount}</span>
                  </div>
                  <div className="flex items-center justify-between py-2 border-b border-slate-100">
                    <span className="text-sm text-slate-600 flex items-center gap-2">
                      <Award className="h-4 w-4 text-slate-400" />
                      Sertifika
                    </span>
                    <span className="text-sm font-bold text-slate-900">{certificatesCount}</span>
                  </div>
                  <div className="flex items-center justify-between py-2">
                    <span className="text-sm text-slate-600 flex items-center gap-2">
                      <Users className="h-4 w-4 text-slate-400" />
                      Bağlantı
                    </span>
                    <span className="text-sm font-bold text-slate-900">{connectionsCount}</span>
                  </div>
                </div>
              </div>

              {/* CV İndirme */}
              {user.resumeText && (
                <div className="bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl shadow-lg p-6 text-white">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="h-12 w-12 bg-white/20 backdrop-blur rounded-xl flex items-center justify-center">
                      <Target className="h-6 w-6" />
                    </div>
                    <div>
                      <h3 className="font-bold text-base">Özgeçmiş</h3>
                      <p className="text-xs text-blue-100">PDF formatında</p>
                    </div>
                  </div>
                  <button
                    onClick={handleDownloadCV}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-white text-blue-600 hover:bg-blue-50 rounded-xl transition font-semibold text-sm shadow-md"
                  >
                    <Download className="h-4 w-4" />
                    CV İndir
                  </button>
                </div>
              )}

              {/* Profil Gücü */}
              {user.profileStrength !== undefined && (
                <div className="bg-white rounded-2xl shadow-sm p-6">
                  <h3 className="text-sm font-bold text-slate-900 mb-3">Profil Gücü</h3>
                  <div className="relative h-2 bg-slate-200 rounded-full overflow-hidden mb-2">
                    <div
                      className="absolute h-full bg-gradient-to-r from-emerald-500 to-green-500 rounded-full transition-all"
                      style={{ width: `${user.profileStrength}%` }}
                    />
                  </div>
                  <p className="text-xs text-slate-600 text-center font-semibold">
                    {user.profileStrength}% Tamamlandı
                  </p>
                </div>
              )}

            </div>
          </div>

        </div>
      </div>
    </div>

    {/* Profil Fotoğrafı Yükleme Modalı */}
    {showPhotoUpload && isOwnProfile && (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
        <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <Camera className="h-5 w-5 text-blue-600" />
              Profil Fotoğrafı Değiştir
            </h2>
            <button
              onClick={() => { setShowPhotoUpload(false); setPhotoUploadError(null); }}
              className="h-8 w-8 flex items-center justify-center rounded-full hover:bg-slate-100 transition"
            >
              <X className="h-5 w-5 text-slate-500" />
            </button>
          </div>

          {/* Mevcut Fotoğraf */}
          <div className="flex justify-center mb-6">
            {user?.avatarUrl ? (
              <img
                src={user.avatarUrl.startsWith('data:') || user.avatarUrl.startsWith('http') ? user.avatarUrl : `http://127.0.0.1:5001${user.avatarUrl}`}
                alt="Mevcut fotoğraf"
                className="h-28 w-28 rounded-2xl object-cover border-4 border-slate-200 shadow"
              />
            ) : (
              <div className="h-28 w-28 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white flex items-center justify-center font-bold text-4xl border-4 border-slate-200 shadow">
                {(user?.fullName || '?').charAt(0)}
              </div>
            )}
          </div>

          {/* Upload Alanı */}
          <div
            onClick={() => photoInputRef.current?.click()}
            className="border-2 border-dashed border-blue-300 rounded-xl p-8 text-center cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition group"
          >
            <Upload className="h-10 w-10 text-blue-400 group-hover:text-blue-600 mx-auto mb-3 transition" />
            <p className="text-sm font-semibold text-slate-700">Fotoğraf seçmek için tıklayın</p>
            <p className="text-xs text-slate-500 mt-1">JPG, PNG veya GIF – Maks 5 MB</p>
          </div>

          <input
            ref={photoInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handlePhotoUpload(file);
            }}
          />

          {photoUploadError && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
              {photoUploadError}
            </div>
          )}

          <button
            onClick={() => { setShowPhotoUpload(false); setPhotoUploadError(null); }}
            className="mt-5 w-full py-2.5 border border-slate-300 text-slate-600 hover:bg-slate-50 rounded-xl transition font-medium text-sm"
          >
            İptal
          </button>
        </div>
      </div>
    )}

    {/* Profil Düzenleme Modalı (ProfileWizard) */}
    {showEditModal && isOwnProfile && currentUser && (
      <ProfileWizard
        currentUser={currentUser}
        onComplete={(updatedUser) => {
          setUser(updatedUser);
          if (onProfileUpdated) onProfileUpdated(updatedUser);
          setShowEditModal(false);
        }}
        onClose={() => setShowEditModal(false)}
      />
    )}
    </>
  );
};

// UserConnectionCard bileşeni
interface UserConnectionCardProps {
  person: User & { connectionReasons?: string[] };
  onNavigateToProfile?: (userId: string) => void;
  onSendRequest: (userId: string) => void;
}

const UserConnectionCard: React.FC<UserConnectionCardProps> = ({ person, onNavigateToProfile, onSendRequest }) => {
  const handleViewProfile = () => {
    if (onNavigateToProfile) {
      onNavigateToProfile(person.id);
    }
  };

  return (
    <div className="p-4 border border-slate-200 rounded-xl hover:shadow-md transition bg-white">
      {/* Üst: Avatar ve İsim */}
      <div className="flex items-center gap-3 mb-3">
        {person.avatarUrl ? (
          <img
            src={person.avatarUrl.startsWith('http') ? person.avatarUrl : `http://127.0.0.1:5001${person.avatarUrl}`}
            alt={person.fullName}
            className="h-12 w-12 rounded-lg object-cover"
          />
        ) : (
          <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 text-white flex items-center justify-center font-bold text-lg">
            {(person.fullName || '?').charAt(0)}
          </div>
        )}
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-slate-900 text-sm truncate">{person.fullName}</h3>
          {person.title && <p className="text-xs text-slate-600 truncate">{person.title}</p>}
          {person.company && <p className="text-xs text-slate-500 truncate">{person.company}</p>}
        </div>
      </div>

      {/* Orta: Neden Önerildi */}
      {person.connectionReasons && person.connectionReasons.length > 0 && (
        <div className="mb-3 px-3 py-2 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-xs font-semibold text-blue-700 mb-1">Neden Önerildi:</p>
          <div className="space-y-1">
            {person.connectionReasons.map((reason, i) => (
              <p key={i} className="text-xs text-blue-600">• {reason}</p>
            ))}
          </div>
        </div>
      )}

      {/* Alt: Butonlar */}
      <div className="flex gap-2">
        <button
          onClick={handleViewProfile}
          className="flex-1 px-3 py-2 text-xs font-semibold text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50 transition"
        >
          Profili Gör
        </button>
        <button
          onClick={() => onSendRequest(person.id)}
          className="flex-1 px-3 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition"
        >
          Bağlan
        </button>
      </div>
    </div>
  );
};
