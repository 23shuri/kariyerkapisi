import React, { useState, useEffect } from 'react';
import { User } from '../types';
import { 
  ArrowLeft, Share2, MapPin, Mail, Phone, Globe, Briefcase, Users, Award, 
  TrendingUp, Eye, Building2, Calendar, Edit3, Loader2, DollarSign,
  CheckCircle2, Clock, X
} from 'lucide-react';

interface CompanyProfilePublicProps {
  userId: string;
  currentUser: User | null;
  onBack: () => void;
}

export const CompanyProfilePublic: React.FC<CompanyProfilePublicProps> = ({
  userId,
  currentUser,
  onBack
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'jobs' | 'team' | 'reviews'>('overview');

  useEffect(() => {
    fetchCompanyProfile();
  }, [userId]);

  const fetchCompanyProfile = async () => {
    setIsLoading(true);
    setError(null);
    try {
      // Eğer kendi profiliniz ise, direkt currentUser'ı kullan
      if (currentUser?.id === userId) {
        setUser(currentUser);
        setIsLoading(false);
        return;
      }

      // API'den dene
      const res = await fetch(`/api/user/${userId}`);
      if (!res.ok) {
        setError(res.status === 404 ? 'Şirket bulunamadı' : 'Profil yüklenirken hata oluştu');
        return;
      }
      const data = await res.json();
      setUser(data.user);
    } catch (err) {
      console.error('Company profile fetch error:', err);
      if (currentUser?.id === userId) {
        setUser(currentUser);
      } else {
        setError('Bağlantı hatası');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleShareProfile = () => {
    const url = `${window.location.origin}/company/${userId}`;
    if (navigator.share) {
      navigator.share({ title: `${user?.fullName} - Şirket Profili`, url });
    } else {
      navigator.clipboard.writeText(url);
      alert('Şirket linki kopyalandı!');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 text-emerald-600 animate-spin mx-auto mb-4" />
          <p className="text-slate-600 font-semibold">Şirket profili yükleniyor...</p>
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
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Şirket Bulunamadı</h2>
          <p className="text-slate-600 mb-6">{error || 'Bu şirket bulunamadı.'}</p>
          <button
            onClick={onBack}
            className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl transition flex items-center gap-2 mx-auto"
          >
            <ArrowLeft className="h-5 w-5" />
            Geri Dön
          </button>
        </div>
      </div>
    );
  }

  const isOwnProfile = currentUser?.id === userId;
  const companyName = (user as any)?.companyName || user?.fullName || 'Şirket';
  const companySector = (user as any)?.companySector || '';
  const companySize = (user as any)?.companySize || '';
  const companyCity = (user as any)?.companyCity || '';
  const companyWebsite = (user as any)?.companyWebsite || '';
  const companyDescription = (user as any)?.companyDescription || '';
  const companyEmail = (user as any)?.companyEmail || '';
  const companyPhone = (user as any)?.companyPhone || '';
  const companyFoundedYear = (user as any)?.companyFoundedYear || '';
  const companyBenefits = (user as any)?.companyBenefits || [];
  const companyValues = (user as any)?.companyValues || [];

  return (
    <div className="min-h-screen bg-slate-50">
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
            className="flex items-center gap-2 px-4 py-2 border border-emerald-600 text-emerald-600 hover:bg-emerald-50 rounded-xl transition text-sm font-medium"
          >
            <Share2 className="h-4 w-4" />
            Paylaş
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left & Center Column - Main Content */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Company Header Card */}
            <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
              {/* Cover Photo */}
              <div className="h-32 bg-gradient-to-r from-emerald-600 via-green-600 to-teal-600 relative" />

              {/* Company Info */}
              <div className="px-6 pt-16 pb-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 mb-4">
                  {/* Logo - Positioned Absolutely */}
                  <div className="absolute -mt-20 ml-6">
                    {user.avatarUrl ? (
                      <img
                        src={user.avatarUrl.startsWith('http') ? user.avatarUrl : `http://127.0.0.1:5001${user.avatarUrl}`}
                        alt={companyName}
                        className="h-32 w-32 rounded-2xl border-4 border-white object-cover shadow-lg"
                      />
                    ) : (
                      <div className="h-32 w-32 rounded-2xl border-4 border-white bg-gradient-to-br from-emerald-500 to-teal-600 text-white flex items-center justify-center font-bold text-4xl shadow-lg">
                        {companyName && companyName.charAt(0)}
                      </div>
                    )}
                  </div>
                </div>

                {/* Company Name & Sector */}
                <h1 className="text-3xl font-bold text-slate-900 mb-2">{companyName}</h1>
                {companySector && <p className="text-lg text-emerald-600 font-semibold mb-3">{companySector}</p>}

                {/* Location & Contact */}
                <div className="flex flex-wrap items-center gap-4 text-sm text-slate-600 mb-4">
                  {companyCity && (
                    <span className="flex items-center gap-1.5">
                      <MapPin className="h-4 w-4 text-slate-400" />
                      {companyCity}
                    </span>
                  )}
                  {companyEmail && (
                    <a href={`mailto:${companyEmail}`} className="flex items-center gap-1.5 hover:text-emerald-600 transition">
                      <Mail className="h-4 w-4 text-slate-400" />
                      {companyEmail}
                    </a>
                  )}
                  {companyPhone && (
                    <span className="flex items-center gap-1.5">
                      <Phone className="h-4 w-4 text-slate-400" />
                      {companyPhone}
                    </span>
                  )}
                  {companyWebsite && (
                    <a href={companyWebsite} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 hover:text-emerald-600 transition">
                      <Globe className="h-4 w-4 text-slate-400" />
                      Web Sitesi
                    </a>
                  )}
                </div>

                {/* Company Stats */}
                <div className="grid grid-cols-4 gap-3 pt-4">
                  {companySize && (
                    <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-3 text-center border border-blue-200">
                      <Users className="h-4 w-4 text-blue-600 mx-auto mb-1" />
                      <p className="text-xs text-blue-600 font-medium line-clamp-2">{companySize}</p>
                    </div>
                  )}
                  {companyFoundedYear && (
                    <div className="bg-gradient-to-br from-amber-50 to-amber-100 rounded-xl p-3 text-center border border-amber-200">
                      <Calendar className="h-4 w-4 text-amber-600 mx-auto mb-1" />
                      <p className="text-sm font-bold text-amber-700">{companyFoundedYear}</p>
                    </div>
                  )}
                  <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-xl p-3 text-center border border-emerald-200">
                    <Briefcase className="h-4 w-4 text-emerald-600 mx-auto mb-1" />
                    <p className="text-sm font-bold text-emerald-700">0</p>
                    <p className="text-xs text-emerald-600 font-medium">İlan</p>
                  </div>
                  <div className="bg-gradient-to-br from-violet-50 to-violet-100 rounded-xl p-3 text-center border border-violet-200">
                    <Eye className="h-4 w-4 text-violet-600 mx-auto mb-1" />
                    <p className="text-sm font-bold text-violet-700">0</p>
                    <p className="text-xs text-violet-600 font-medium">Görüş</p>
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
                      ? 'border-emerald-600 text-emerald-600'
                      : 'border-transparent text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Genel Bakış
                </button>
                <button
                  onClick={() => setActiveTab('jobs')}
                  className={`px-6 py-4 text-sm font-semibold whitespace-nowrap border-b-2 transition ${
                    activeTab === 'jobs'
                      ? 'border-emerald-600 text-emerald-600'
                      : 'border-transparent text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Yayınlanan İlanlar
                </button>
                <button
                  onClick={() => setActiveTab('team')}
                  className={`px-6 py-4 text-sm font-semibold whitespace-nowrap border-b-2 transition ${
                    activeTab === 'team'
                      ? 'border-emerald-600 text-emerald-600'
                      : 'border-transparent text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Takım
                </button>
                <button
                  onClick={() => setActiveTab('reviews')}
                  className={`px-6 py-4 text-sm font-semibold whitespace-nowrap border-b-2 transition ${
                    activeTab === 'reviews'
                      ? 'border-emerald-600 text-emerald-600'
                      : 'border-transparent text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Değerlendirmeler
                </button>
              </div>
            </div>

            {/* Tab Content */}
            {activeTab === 'overview' && (
              <div className="space-y-6">
                {/* Şirket Açıklaması */}
                {companyDescription && (
                  <div className="bg-white rounded-2xl shadow-sm p-6">
                    <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                      <div className="h-1 w-8 bg-emerald-600 rounded" />
                      Hakkında
                    </h2>
                    <p className="text-slate-700 leading-relaxed whitespace-pre-wrap">{companyDescription}</p>
                  </div>
                )}

                {/* Yan Haklar */}
                {companyBenefits.length > 0 && (
                  <div className="bg-white rounded-2xl shadow-sm p-6">
                    <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                      <Award className="h-5 w-5 text-amber-600" />
                      Yan Haklar
                    </h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {companyBenefits.map((benefit: string, i: number) => (
                        <div key={i} className="flex items-center gap-3 p-3 bg-amber-50 rounded-lg border border-amber-200">
                          <CheckCircle2 className="h-5 w-5 text-amber-600 flex-shrink-0" />
                          <span className="text-sm text-slate-700 font-medium">{benefit}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Şirket Değerleri */}
                {companyValues.length > 0 && (
                  <div className="bg-white rounded-2xl shadow-sm p-6">
                    <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                      <TrendingUp className="h-5 w-5 text-blue-600" />
                      Şirket Değerleri
                    </h2>
                    <div className="flex flex-wrap gap-2">
                      {companyValues.map((value: string, i: number) => (
                        <span key={i} className="px-4 py-2 bg-blue-50 text-blue-700 border border-blue-200 rounded-lg text-sm font-semibold">
                          {value}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Jobs Tab */}
            {activeTab === 'jobs' && (
              <div className="bg-white rounded-2xl shadow-sm p-6">
                <h2 className="text-lg font-bold text-slate-900 mb-5 flex items-center gap-2">
                  <Briefcase className="h-5 w-5 text-emerald-600" />
                  Yayınlanan İlanlar
                </h2>
                <div className="text-center py-12 border border-dashed border-slate-200 rounded-2xl bg-slate-50/30">
                  <Briefcase className="h-10 w-10 text-slate-300 mx-auto mb-3" />
                  <p className="text-sm font-semibold text-slate-900">Aktif ilan bulunmuyor</p>
                  <p className="text-xs text-slate-400 mt-1">Şirket tarafından henüz iş ilanı yayınlanmamış.</p>
                </div>
              </div>
            )}

            {/* Team Tab */}
            {activeTab === 'team' && (
              <div className="bg-white rounded-2xl shadow-sm p-6">
                <h2 className="text-lg font-bold text-slate-900 mb-5 flex items-center gap-2">
                  <Users className="h-5 w-5 text-blue-600" />
                  Takım Üyeleri
                </h2>
                <div className="text-center py-12 border border-dashed border-slate-200 rounded-2xl bg-slate-50/30">
                  <Users className="h-10 w-10 text-slate-300 mx-auto mb-3" />
                  <p className="text-sm font-semibold text-slate-900">Takım bilgisi mevcut değil</p>
                  <p className="text-xs text-slate-400 mt-1">Şirketin takım üyeleri henüz eklenmemiş.</p>
                </div>
              </div>
            )}

            {/* Reviews Tab */}
            {activeTab === 'reviews' && (
              <div className="bg-white rounded-2xl shadow-sm p-6">
                <h2 className="text-lg font-bold text-slate-900 mb-5 flex items-center gap-2">
                  <Award className="h-5 w-5 text-amber-600" />
                  Değerlendirmeler
                </h2>
                <div className="text-center py-12 border border-dashed border-slate-200 rounded-2xl bg-slate-50/30">
                  <Award className="h-10 w-10 text-slate-300 mx-auto mb-3" />
                  <p className="text-sm font-semibold text-slate-900">Değerlendirme bulunmuyor</p>
                  <p className="text-xs text-slate-400 mt-1">Henüz bu şirkete ait değerlendirme yok.</p>
                </div>
              </div>
            )}

          </div>

          {/* Right Sidebar - Company Info Panel */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 space-y-6">
              
              {/* Şirket Özeti */}
              <div className="bg-white rounded-2xl shadow-sm p-6">
                <h3 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2">
                  <Building2 className="h-5 w-5 text-emerald-600" />
                  Şirket Bilgisi
                </h3>
                <div className="space-y-4">
                  {companySize && (
                    <div className="flex items-center justify-between py-2 border-b border-slate-100">
                      <span className="text-sm text-slate-600 flex items-center gap-2">
                        <Users className="h-4 w-4 text-slate-400" />
                        Çalışan Sayısı
                      </span>
                      <span className="text-sm font-bold text-slate-900">{companySize}</span>
                    </div>
                  )}
                  {companyCity && (
                    <div className="flex items-center justify-between py-2 border-b border-slate-100">
                      <span className="text-sm text-slate-600 flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-slate-400" />
                        Lokasyon
                      </span>
                      <span className="text-sm font-semibold text-slate-900">{companyCity}</span>
                    </div>
                  )}
                  {companySector && (
                    <div className="flex items-center justify-between py-2 border-b border-slate-100">
                      <span className="text-sm text-slate-600 flex items-center gap-2">
                        <Briefcase className="h-4 w-4 text-slate-400" />
                        Sektör
                      </span>
                      <span className="text-sm font-semibold text-slate-900">{companySector}</span>
                    </div>
                  )}
                  {companyFoundedYear && (
                    <div className="flex items-center justify-between py-2">
                      <span className="text-sm text-slate-600 flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-slate-400" />
                        Kuruluş Yılı
                      </span>
                      <span className="text-sm font-bold text-slate-900">{companyFoundedYear}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Hızlı İletişim */}
              <div className="bg-gradient-to-br from-emerald-600 to-teal-600 rounded-2xl shadow-lg p-6 text-white">
                <h3 className="font-bold text-base mb-4">İletişime Geçin</h3>
                <div className="space-y-3">
                  {companyEmail && (
                    <a
                      href={`mailto:${companyEmail}`}
                      className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-white/20 hover:bg-white/30 rounded-xl transition font-medium text-sm backdrop-blur"
                    >
                      <Mail className="h-4 w-4" />
                      E-posta Gönder
                    </a>
                  )}
                  {companyWebsite && (
                    <a
                      href={companyWebsite}
                      target="_blank"
                      rel="noreferrer"
                      className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-white/20 hover:bg-white/30 rounded-xl transition font-medium text-sm backdrop-blur"
                    >
                      <Globe className="h-4 w-4" />
                      Web Sitesini Ziyaret Et
                    </a>
                  )}
                </div>
              </div>

            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
