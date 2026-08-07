import React from 'react';
import { motion } from 'motion/react';
import {
  ArrowLeft, MapPin, Globe, Users, Factory, Building2,
  Briefcase, Star, CheckCircle2, ExternalLink, Calendar,
  TrendingUp, Award, Mail, Phone
} from 'lucide-react';
import { Job } from '../types';

export interface CompanyProfile {
  employerId: string;
  companyName: string;
  companySector: string;
  companySize: string;
  companyCity: string;
  companyWebsite?: string;
  companyDescription?: string;
  companyAvatarUrl?: string;
  companyFoundedYear?: string;
  companyEmail?: string;
  companyPhone?: string;
  companyBenefits?: string[];
  companyValues?: string[];
  avgRating?: number;
  totalReviews?: number;
}

interface CompanyProfilePageProps {
  company: CompanyProfile;
  jobs: Job[];
  onBack: () => void;
  onViewJob: (job: Job) => void;
}

const TYPE_COLORS: Record<string, string> = {
  'Uzaktan': 'bg-blue-50 text-blue-700 border-blue-200',
  'Hibrit': 'bg-amber-50 text-amber-700 border-amber-200',
  'Ofisten': 'bg-emerald-50 text-emerald-700 border-emerald-200',
};

export const CompanyProfilePage: React.FC<CompanyProfilePageProps> = ({
  company, jobs, onBack, onViewJob
}) => {
  const companyJobs = jobs.filter(j =>
    j.company === company.companyName || j.employerId === company.employerId
  );

  const initials = company.companyName.slice(0, 2).toUpperCase();

  const defaultBenefits = [
    'Özel sağlık sigortası',
    'Esnek çalışma saatleri',
    'Uzaktan çalışma imkânı',
    'Yemek kartı',
    'Eğitim & gelişim bütçesi',
    'Yıllık performans primi',
  ];

  const defaultValues = [
    'İnovasyon',
    'Şeffaflık',
    'Ekip ruhu',
    'Sürekli öğrenme',
  ];

  const benefits = company.companyBenefits?.length ? company.companyBenefits : defaultBenefits;
  const values = company.companyValues?.length ? company.companyValues : defaultValues;

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Top Bar */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="mx-auto max-w-5xl px-4 py-3 flex items-center gap-3">
          <button
            onClick={onBack}
            className="flex items-center gap-1.5 text-sm text-slate-600 hover:text-slate-900 transition-colors font-medium"
          >
            <ArrowLeft className="h-4 w-4" />
            Geri
          </button>
          <span className="text-slate-300">/</span>
          <span className="text-sm text-slate-500 truncate">{company.companyName}</span>
        </div>
      </div>

      {/* Cover + Header */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-900 pb-0">
        <div className="mx-auto max-w-5xl px-4 pt-10 pb-16">
          <div className="flex flex-col sm:flex-row items-start sm:items-end gap-5">
            {/* Logo */}
            {company.companyAvatarUrl ? (
              <img
                src={company.companyAvatarUrl}
                alt={company.companyName}
                className="h-20 w-20 rounded-2xl object-cover border-4 border-white/20 shadow-xl"
              />
            ) : (
              <div className="h-20 w-20 rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center text-white font-black text-2xl shadow-xl border-4 border-white/20">
                {initials}
              </div>
            )}
            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <h1 className="text-2xl font-black text-white">{company.companyName}</h1>
                {company.avgRating && company.avgRating > 0 ? (
                  <span className="flex items-center gap-1 bg-amber-400/20 border border-amber-400/30 text-amber-300 text-xs font-bold px-2 py-0.5 rounded-full">
                    <Star className="h-3 w-3 fill-amber-300" />
                    {company.avgRating.toFixed(1)}
                    {company.totalReviews ? ` (${company.totalReviews})` : ''}
                  </span>
                ) : null}
              </div>
              <div className="flex flex-wrap items-center gap-3 text-slate-400 text-sm">
                {company.companySector && (
                  <span className="flex items-center gap-1">
                    <Factory className="h-3.5 w-3.5" />
                    {company.companySector}
                  </span>
                )}
                {company.companyCity && (
                  <span className="flex items-center gap-1">
                    <MapPin className="h-3.5 w-3.5" />
                    {company.companyCity}
                  </span>
                )}
                {company.companySize && (
                  <span className="flex items-center gap-1">
                    <Users className="h-3.5 w-3.5" />
                    {company.companySize}
                  </span>
                )}
                {company.companyFoundedYear && (
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3.5 w-3.5" />
                    {company.companyFoundedYear} yılında kuruldu
                  </span>
                )}
              </div>
            </div>
            {/* Website & iletişim */}
            <div className="flex gap-2">
              {company.companyWebsite && (
                <a
                  href={company.companyWebsite.startsWith('http') ? company.companyWebsite : `https://${company.companyWebsite}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 bg-white/10 hover:bg-white/20 border border-white/20 text-white text-xs font-semibold px-3 py-2 rounded-xl transition"
                >
                  <Globe className="h-3.5 w-3.5" />
                  Web Sitesi
                  <ExternalLink className="h-3 w-3 opacity-60" />
                </a>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Stats Bar */}
      <div className="bg-white border-b border-slate-100 shadow-sm">
        <div className="mx-auto max-w-5xl px-4">
          <div className="grid grid-cols-3 divide-x divide-slate-100">
            {[
              { icon: Briefcase, label: 'Açık Pozisyon', value: companyJobs.length },
              { icon: Users, label: 'Çalışan', value: company.companySize || '-' },
              { icon: TrendingUp, label: 'Sektör', value: company.companySector || '-' },
            ].map(({ icon: Icon, label, value }) => (
              <div key={label} className="flex flex-col items-center py-4 gap-1">
                <Icon className="h-4 w-4 text-emerald-600" />
                <span className="text-base font-black text-slate-900">{value}</span>
                <span className="text-[10px] text-slate-400 font-medium uppercase tracking-wide">{label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="mx-auto max-w-5xl px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Sol: Hakkında + Değerler + Yan Haklar */}
          <div className="lg:col-span-2 space-y-5">

            {/* Hakkında */}
            {company.companyDescription && (
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-2xl border border-slate-100 p-6"
              >
                <h2 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
                  <Building2 className="h-4 w-4 text-emerald-600" />
                  Şirket Hakkında
                </h2>
                <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-line">
                  {company.companyDescription}
                </p>
              </motion.div>
            )}

            {/* Şirket Değerleri */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 }}
              className="bg-white rounded-2xl border border-slate-100 p-6"
            >
              <h2 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
                <Award className="h-4 w-4 text-emerald-600" />
                Şirket Değerleri
              </h2>
              <div className="flex flex-wrap gap-2">
                {values.map((v, i) => (
                  <span
                    key={i}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs font-semibold text-emerald-700"
                  >
                    <CheckCircle2 className="h-3 w-3" />
                    {v}
                  </span>
                ))}
              </div>
            </motion.div>

            {/* Yan Haklar */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-2xl border border-slate-100 p-6"
            >
              <h2 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
                <Star className="h-4 w-4 text-emerald-600" />
                Yan Haklar & Avantajlar
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {benefits.map((b, i) => (
                  <div key={i} className="flex items-center gap-2 bg-slate-50 rounded-xl px-3 py-2">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                    <span className="text-xs font-medium text-slate-700">{b}</span>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Açık Pozisyonlar */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="bg-white rounded-2xl border border-slate-100 p-6"
            >
              <h2 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
                <Briefcase className="h-4 w-4 text-emerald-600" />
                Açık Pozisyonlar
                <span className="ml-auto bg-emerald-100 text-emerald-700 text-xs font-bold px-2 py-0.5 rounded-full">
                  {companyJobs.length}
                </span>
              </h2>
              {companyJobs.length === 0 ? (
                <div className="text-center py-8 text-slate-400 text-sm">
                  Şu an açık pozisyon bulunmuyor.
                </div>
              ) : (
                <div className="space-y-3">
                  {companyJobs.map((job) => (
                    <div
                      key={job.id}
                      onClick={() => onViewJob(job)}
                      className="group flex items-center justify-between p-4 rounded-xl border border-slate-100 hover:border-emerald-200 hover:bg-emerald-50/30 transition cursor-pointer"
                    >
                      <div>
                        <p className="text-sm font-semibold text-slate-900 group-hover:text-emerald-700 transition">
                          {job.title}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="flex items-center gap-1 text-xs text-slate-500">
                            <MapPin className="h-3 w-3" />
                            {job.location}
                          </span>
                          <span className="text-slate-300">·</span>
                          <span className="text-xs text-slate-500">{job.experienceLevel}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className={`text-xs font-medium px-2 py-0.5 rounded-full border ${TYPE_COLORS[job.type] || 'bg-slate-50 text-slate-600 border-slate-200'}`}>
                          {job.type}
                        </span>
                        <span className="text-xs font-semibold text-emerald-700">{job.salaryRange}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          </div>

          {/* Sağ: Özet Kart */}
          <div className="space-y-5">
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 }}
              className="bg-white rounded-2xl border border-slate-100 p-5 sticky top-20"
            >
              <h3 className="text-sm font-bold text-slate-900 mb-4">Şirket Bilgileri</h3>
              <div className="space-y-3">
                {[
                  { icon: Factory, label: 'Sektör', value: company.companySector },
                  { icon: Users, label: 'Çalışan Sayısı', value: company.companySize },
                  { icon: MapPin, label: 'Merkez', value: company.companyCity },
                  { icon: Calendar, label: 'Kuruluş', value: company.companyFoundedYear },
                  { icon: Globe, label: 'Web Sitesi', value: company.companyWebsite, isLink: true },
                  { icon: Mail, label: 'E-posta', value: company.companyEmail },
                  { icon: Phone, label: 'Telefon', value: company.companyPhone },
                ].filter(item => item.value).map(({ icon: Icon, label, value, isLink }) => (
                  <div key={label} className="flex items-start gap-3">
                    <div className="h-7 w-7 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center shrink-0">
                      <Icon className="h-3.5 w-3.5 text-slate-400" />
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-400 font-medium">{label}</p>
                      {isLink && value ? (
                        <a
                          href={value.startsWith('http') ? value : `https://${value}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 flex items-center gap-0.5"
                        >
                          {value} <ExternalLink className="h-3 w-3" />
                        </a>
                      ) : (
                        <p className="text-xs font-semibold text-slate-700">{value}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};
