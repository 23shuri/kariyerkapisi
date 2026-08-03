import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
  ArrowLeft, MapPin, Briefcase, Clock, Users, Building2,
  CheckCircle2, Sparkles, Send, BookmarkPlus, BookmarkCheck,
  Wifi, LayoutGrid, Star, ChevronRight, BadgeCheck, AlertCircle
} from 'lucide-react';
import { Job, User } from '../types';

interface JobDetailPageProps {
  job: Job;
  currentUser: User | null;
  onBack: () => void;
  onOpenAuth: (role: 'candidate' | 'employer') => void;
  onApplied?: () => void;
}

const TYPE_COLORS: Record<string, string> = {
  'Uzaktan': 'bg-blue-50 text-blue-700 border-blue-200',
  'Hibrit': 'bg-amber-50 text-amber-700 border-amber-200',
  'Ofisten': 'bg-emerald-50 text-emerald-700 border-emerald-200',
};

export const JobDetailPage: React.FC<JobDetailPageProps> = ({
  job,
  currentUser,
  onBack,
  onOpenAuth,
  onApplied,
}) => {
  const [applying, setApplying] = useState(false);
  const [applied, setApplied] = useState(false);
  const [saved, setSaved] = useState(false);
  const [applyError, setApplyError] = useState('');
  const [matchResult, setMatchResult] = useState<{
    matchScore: number;
    strongPoints: string[];
    developmentAreas: string[];
    skillAlignment: number;
    experienceAlignment: number;
    description: string;
  } | null>(null);

  const initials = job.company.slice(0, 2).toUpperCase();
  const typeClass = TYPE_COLORS[job.type] || 'bg-slate-50 text-slate-600 border-slate-200';
  const isCandidate = currentUser?.role === 'candidate';

  const handleApply = async () => {
    if (!currentUser) {
      onOpenAuth('candidate');
      return;
    }
    if (!isCandidate) return;

    setApplying(true);
    setApplyError('');
    try {
      const res = await fetch('/api/applications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jobId: job.id,
          candidateId: currentUser.id,
          candidateName: currentUser.fullName,
          candidateSkills: currentUser.skills || [],
          candidateResumeText: (currentUser as any).resumeText || '',
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setApplyError(data.error || 'Başvuru sırasında bir hata oluştu.');
      } else {
        setApplied(true);
        if (data.match) setMatchResult(data.match);
        onApplied?.();
      }
    } catch {
      setApplyError('Sunucuya bağlanılamadı. Lütfen tekrar deneyin.');
    } finally {
      setApplying(false);
    }
  };

  const handleSave = async () => {
    if (!currentUser) { onOpenAuth('candidate'); return; }
    setSaved(!saved);
    try {
      if (!saved) {
        await fetch('/api/saved-jobs', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: currentUser.id, jobId: job.id }),
        });
      } else {
        await fetch(`/api/saved-jobs/${job.id}?userId=${currentUser.id}`, { method: 'DELETE' });
      }
    } catch { /* silent */ }
  };

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
          <span className="text-sm text-slate-500 truncate">{job.title}</span>
          <span className="text-slate-300 hidden sm:block">/</span>
          <span className="text-sm text-slate-500 hidden sm:block truncate">{job.company}</span>
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* ── Left / Main Content ── */}
          <div className="lg:col-span-2 space-y-5">

            {/* Header Card */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-2xl border border-slate-100 p-6"
            >
              <div className="flex items-start gap-4">
                <div className="h-14 w-14 rounded-2xl flex items-center justify-center font-bold text-lg text-white bg-gradient-to-br from-emerald-500 to-teal-600 shadow-sm shrink-0">
                  {initials}
                </div>
                <div className="flex-1 min-w-0">
                  <h1 className="text-xl font-bold text-slate-900 leading-tight">{job.title}</h1>
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1">
                    <span className="flex items-center gap-1 text-sm text-slate-600 font-medium">
                      <Building2 className="h-3.5 w-3.5 text-slate-400" />
                      {job.company}
                    </span>
                    <span className="flex items-center gap-1 text-sm text-slate-500">
                      <MapPin className="h-3.5 w-3.5 text-slate-400" />
                      {job.location}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-3">
                    <span className={`text-xs font-medium px-2.5 py-1 rounded-full border ${typeClass}`}>
                      {job.type === 'Uzaktan' && <Wifi className="h-3 w-3 inline mr-1" />}
                      {job.type}
                    </span>
                    <span className="text-xs font-medium px-2.5 py-1 rounded-full border bg-slate-50 text-slate-600 border-slate-200">
                      {job.experienceLevel}
                    </span>
                    <span className="text-xs font-medium px-2.5 py-1 rounded-full border bg-slate-50 text-slate-600 border-slate-200">
                      {job.salaryRange}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4 mt-4 pt-4 border-t border-slate-50 text-xs text-slate-500">
                <span className="flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5" />
                  {job.postedAt}
                </span>
                <span className="flex items-center gap-1">
                  <Users className="h-3.5 w-3.5" />
                  {job.applicationCount} başvuru
                </span>
                {job.candidateMatchesCount > 0 && (
                  <span className="flex items-center gap-1 text-emerald-600">
                    <BadgeCheck className="h-3.5 w-3.5" />
                    {job.candidateMatchesCount} yüksek eşleşme
                  </span>
                )}
              </div>
            </motion.div>

            {/* Description */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-2xl border border-slate-100 p-6"
            >
              <h2 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
                <Briefcase className="h-4 w-4 text-emerald-600" />
                İş Tanımı
              </h2>
              <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-line">
                {job.description}
              </p>
            </motion.div>

            {/* Required Skills */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="bg-white rounded-2xl border border-slate-100 p-6"
            >
              <h2 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
                <Star className="h-4 w-4 text-emerald-600" />
                Aranan Beceriler
              </h2>
              <div className="flex flex-wrap gap-2">
                {job.skills.map((skill) => (
                  <span
                    key={skill}
                    className="px-3 py-1.5 bg-emerald-50 border border-emerald-200 rounded-lg text-xs font-semibold text-emerald-700"
                  >
                    {skill}
                  </span>
                ))}
              </div>

              {/* Skill Match (only for candidates with a CV) */}
              {isCandidate && currentUser.skills && currentUser.skills.length > 0 && (
                <div className="mt-4 pt-4 border-t border-slate-50">
                  <p className="text-xs font-semibold text-slate-500 mb-2">Profilinizdeki eşleşen beceriler</p>
                  <div className="flex flex-wrap gap-2">
                    {job.skills.map((skill) => {
                      const match = currentUser.skills!.some(
                        (s) => s.toLowerCase() === skill.toLowerCase()
                      );
                      return (
                        <span
                          key={skill}
                          className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold border ${
                            match
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : 'bg-slate-50 text-slate-400 border-slate-200 line-through'
                          }`}
                        >
                          {match && <CheckCircle2 className="h-3 w-3" />}
                          {skill}
                        </span>
                      );
                    })}
                  </div>
                </div>
              )}
            </motion.div>

            {/* AI Match Result (after apply) */}
            {matchResult && (
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl border border-emerald-200 p-6"
              >
                <div className="flex items-center gap-2 mb-4">
                  <Sparkles className="h-4 w-4 text-emerald-600" />
                  <h2 className="text-sm font-bold text-emerald-800">AI Eşleşme Raporu</h2>
                  <span className="ml-auto text-2xl font-black text-emerald-700">
                    %{matchResult.matchScore}
                  </span>
                </div>

                {/* Score Bars */}
                <div className="space-y-2.5 mb-4">
                  {[
                    { label: 'Beceri Uyumu', value: matchResult.skillAlignment },
                    { label: 'Deneyim Uyumu', value: matchResult.experienceAlignment },
                    { label: 'Genel Uyum', value: matchResult.matchScore },
                  ].map(({ label, value }) => (
                    <div key={label}>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-slate-600 font-medium">{label}</span>
                        <span className="font-bold text-emerald-700">%{value}</span>
                      </div>
                      <div className="h-1.5 bg-emerald-100 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${value}%` }}
                          transition={{ duration: 0.8, ease: 'easeOut' }}
                          className="h-full bg-emerald-500 rounded-full"
                        />
                      </div>
                    </div>
                  ))}
                </div>

                {matchResult.strongPoints.length > 0 && (
                  <div className="mb-3">
                    <p className="text-xs font-bold text-emerald-800 mb-1.5">Güçlü Yönleriniz</p>
                    {matchResult.strongPoints.map((pt, i) => (
                      <p key={i} className="flex items-start gap-1.5 text-xs text-emerald-700 mb-1">
                        <CheckCircle2 className="h-3.5 w-3.5 shrink-0 mt-0.5" />
                        {pt}
                      </p>
                    ))}
                  </div>
                )}

                <p className="text-xs text-emerald-700 italic">{matchResult.description}</p>
              </motion.div>
            )}
          </div>

          {/* ── Right / Sidebar ── */}
          <div className="space-y-5">

            {/* Apply Card */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 }}
              className="bg-white rounded-2xl border border-slate-100 p-5 sticky top-20"
            >
              <p className="text-xs text-slate-500 mb-1">Maaş Aralığı</p>
              <p className="text-lg font-bold text-slate-900 mb-4">{job.salaryRange}</p>

              {applied ? (
                <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 rounded-xl p-3 mb-3">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                  <p className="text-xs font-semibold text-emerald-700">
                    Başvurunuz alındı! AI analizi tamamlandı.
                  </p>
                </div>
              ) : (
                <>
                  {applyError && (
                    <div className="flex items-start gap-2 bg-rose-50 border border-rose-200 rounded-xl p-3 mb-3">
                      <AlertCircle className="h-4 w-4 text-rose-500 shrink-0 mt-0.5" />
                      <p className="text-xs text-rose-700">{applyError}</p>
                    </div>
                  )}
                  <button
                    onClick={handleApply}
                    disabled={applying || (currentUser?.role === 'employer')}
                    className="w-full flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed text-white text-sm font-semibold py-3 rounded-xl transition-colors mb-2"
                  >
                    {applying ? (
                      <>
                        <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        AI Analiz Yapılıyor...
                      </>
                    ) : !currentUser ? (
                      <>
                        <Send className="h-4 w-4" />
                        Giriş Yap & Başvur
                      </>
                    ) : currentUser.role === 'employer' ? (
                      'İşveren olarak başvuramazsınız'
                    ) : (
                      <>
                        <Send className="h-4 w-4" />
                        Hemen Başvur
                      </>
                    )}
                  </button>
                </>
              )}

              <button
                onClick={handleSave}
                className={`w-full flex items-center justify-center gap-2 border text-sm font-medium py-2.5 rounded-xl transition-colors ${
                  saved
                    ? 'bg-amber-50 border-amber-200 text-amber-700 hover:bg-amber-100'
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                {saved ? (
                  <><BookmarkCheck className="h-4 w-4" /> Kaydedildi</>
                ) : (
                  <><BookmarkPlus className="h-4 w-4" /> Kaydet</>
                )}
              </button>

              {/* Quick Info */}
              <div className="mt-4 pt-4 border-t border-slate-50 space-y-2.5">
                {[
                  { icon: Briefcase, label: 'Çalışma Tipi', value: job.type },
                  { icon: LayoutGrid, label: 'Deneyim', value: job.experienceLevel },
                  { icon: MapPin, label: 'Konum', value: job.location },
                  { icon: Clock, label: 'İlan Tarihi', value: job.postedAt },
                ].map(({ icon: Icon, label, value }) => (
                  <div key={label} className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5 text-xs text-slate-500">
                      <Icon className="h-3.5 w-3.5" />
                      {label}
                    </span>
                    <span className="text-xs font-semibold text-slate-700">{value}</span>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* AI Tip Card */}
            {isCandidate && !applied && (
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl p-5 text-white"
              >
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles className="h-4 w-4 text-emerald-400" />
                  <p className="text-xs font-bold text-emerald-400">AI İpucu</p>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed mb-3">
                  CV'nizi yükleyerek bu ilan için anlık AI eşleşme skoru alabilirsiniz. Başvurunuz yapay zeka ile analiz edilecektir.
                </p>
                <button
                  onClick={handleApply}
                  className="flex items-center gap-1 text-xs font-semibold text-emerald-400 hover:text-emerald-300 transition-colors"
                >
                  Şimdi Başvur <ChevronRight className="h-3.5 w-3.5" />
                </button>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
