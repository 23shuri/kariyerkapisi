import React, { useState, useEffect } from 'react';
import {
  Search, MapPin, Briefcase, Clock, Users, Sparkles,
  User as UserIcon, SlidersHorizontal, X, ChevronRight, Wifi
} from 'lucide-react';
import { CandidateCV, Job } from '../types';

interface CandidateCVPageProps {
  employerJobs: Job[];
  onViewDetail: (cv: CandidateCV) => void;
}

const WORK_PREF_COLORS: Record<string, string> = {
  'Uzaktan': 'bg-blue-50 text-blue-700 border-blue-200',
  'Hibrit': 'bg-amber-50 text-amber-700 border-amber-200',
  'Ofisten': 'bg-emerald-50 text-emerald-700 border-emerald-200',
  'Fark etmez': 'bg-slate-50 text-slate-600 border-slate-200',
};

function calcMatchScore(cv: CandidateCV, jobs: Job[]): number {
  if (!jobs.length) return 0;

  // Tüm ilanların skill listesini birleştir
  const allJobSkills = jobs.flatMap(j => j.skills.map(s => s.toLowerCase()));
  const uniqueJobSkills = [...new Set(allJobSkills)];

  if (!uniqueJobSkills.length) return 50;

  const matched = cv.skills.filter(s =>
    uniqueJobSkills.some(js => js.includes(s.toLowerCase()) || s.toLowerCase().includes(js))
  ).length;

  const skillScore = (matched / uniqueJobSkills.length) * 100;
  return Math.min(98, Math.max(40, Math.round(skillScore)));
}

function getScoreColor(score: number) {
  if (score >= 75) return { text: 'text-emerald-700', bg: 'bg-emerald-50', border: 'border-emerald-200', bar: 'bg-emerald-500' };
  if (score >= 50) return { text: 'text-amber-700', bg: 'bg-amber-50', border: 'border-amber-200', bar: 'bg-amber-400' };
  return { text: 'text-rose-700', bg: 'bg-rose-50', border: 'border-rose-200', bar: 'bg-rose-400' };
}

export const CandidateCVPage: React.FC<CandidateCVPageProps> = ({ employerJobs, onViewDetail }) => {
  const [cvList, setCvList] = useState<CandidateCV[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPref, setSelectedPref] = useState('Tümü');

  useEffect(() => {
    // localStorage'dan tüm yayınlanan CV'leri yükle
    const saved = JSON.parse(localStorage.getItem('kariyer_kapisi_cvs') || '[]');
    setCvList(saved.filter((cv: CandidateCV) => cv.isActive));
  }, []);

  const filtered = cvList.filter(cv => {
    const q = searchQuery.toLowerCase();
    const matchesSearch = !q ||
      cv.title.toLowerCase().includes(q) ||
      cv.candidateName.toLowerCase().includes(q) ||
      cv.skills.some(s => s.toLowerCase().includes(q)) ||
      cv.summary.toLowerCase().includes(q);
    const matchesPref = selectedPref === 'Tümü' || cv.workPreference === selectedPref;
    return matchesSearch && matchesPref;
  });

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Hero */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-blue-900 py-12 px-4">
        <div className="mx-auto max-w-4xl text-center">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-blue-500/20 border border-blue-500/30 px-3 py-1 text-xs font-medium text-blue-300 mb-4">
            <Sparkles className="h-3 w-3" />
            {cvList.length} aday profili mevcut
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">
            Aday Profillerini Keşfet
          </h1>
          <p className="text-slate-400 text-sm mb-8">
            İlanlarınıza en uygun adayları AI eşleştirme ile bulun
          </p>

          {/* Arama */}
          <div className="flex flex-col sm:flex-row gap-3 bg-white rounded-2xl p-2 shadow-xl shadow-black/20">
            <div className="flex-1 flex items-center gap-2 px-3">
              <Search className="h-4 w-4 text-slate-400 shrink-0" />
              <input
                type="text"
                placeholder="Pozisyon, yetenek veya aday adı ara..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full text-sm text-slate-800 placeholder-slate-400 outline-none py-2 bg-transparent"
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery('')}>
                  <X className="h-4 w-4 text-slate-400 hover:text-slate-600" />
                </button>
              )}
            </div>
            <button
              onClick={() => {}}
              className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-6 py-2.5 rounded-xl transition-colors shrink-0"
            >
              <Search className="h-4 w-4" />
              Ara
            </button>
          </div>
        </div>
      </div>

      {/* Filtreler */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-10 shadow-sm">
        <div className="mx-auto max-w-7xl px-4 py-3 flex flex-wrap items-center gap-3">
          {['Tümü', 'Uzaktan', 'Hibrit', 'Ofisten', 'Fark etmez'].map(pref => (
            <button
              key={pref}
              onClick={() => setSelectedPref(pref)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                selectedPref === pref
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-white text-slate-600 border-slate-200 hover:border-blue-300'
              }`}
            >
              {pref}
            </button>
          ))}
          <div className="ml-auto text-xs text-slate-500">
            <span className="font-semibold text-slate-800">{filtered.length}</span> aday bulundu
          </div>
        </div>
      </div>

      {/* CV Listesi */}
      <div className="mx-auto max-w-7xl px-4 py-8">
        {filtered.length === 0 ? (
          <div className="text-center py-20">
            <div className="h-16 w-16 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-4">
              <UserIcon className="h-8 w-8 text-slate-300" />
            </div>
            <p className="text-slate-600 font-semibold mb-1">Aday profili bulunamadı</p>
            <p className="text-slate-400 text-sm">Henüz CV yayınlayan aday yok veya filtreyi değiştirin.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filtered.map(cv => {
              const score = calcMatchScore(cv, employerJobs);
              const colors = getScoreColor(score);
              const matchedSkills = cv.skills.filter(s =>
                employerJobs.flatMap(j => j.skills).some(js =>
                  js.toLowerCase().includes(s.toLowerCase()) || s.toLowerCase().includes(js.toLowerCase())
                )
              );

              return (
                <div
                  key={cv.id}
                  className="bg-white rounded-xl border border-slate-200 p-6 hover:shadow-md hover:border-blue-200 transition-all flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
                >
                  {/* Sol: Profil bilgileri */}
                  <div className="flex items-start gap-4 flex-1">
                    {/* Avatar */}
                    {cv.candidateAvatarUrl ? (
                      <img src={cv.candidateAvatarUrl} alt={cv.candidateName}
                        className="h-12 w-12 rounded-xl object-cover border border-slate-200 shrink-0" />
                    ) : (
                      <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-lg shrink-0">
                        {(cv?.candidateName || '?').charAt(0)}
                      </div>
                    )}

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="text-base font-semibold text-slate-900">{cv.title}</h3>
                        <span className={`text-xs font-medium px-2 py-0.5 rounded-full border ${WORK_PREF_COLORS[cv.workPreference]}`}>
                          {cv.workPreference === 'Uzaktan' && <Wifi className="h-3 w-3 inline mr-1" />}
                          {cv.workPreference}
                        </span>
                      </div>
                      <p className="text-sm text-slate-500 mt-0.5">{cv.candidateName}</p>

                      <div className="flex flex-wrap gap-3 mt-2 text-xs text-slate-500">
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3.5 w-3.5" />{cv.location}
                        </span>
                        <span className="flex items-center gap-1">
                          <Briefcase className="h-3.5 w-3.5" />{cv.experienceLevel}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3.5 w-3.5" />{cv.publishedAt}
                        </span>
                        {cv.salaryExpectation && (
                          <span className="flex items-center gap-1">
                            💰 {cv.salaryExpectation}
                          </span>
                        )}
                      </div>

                      {/* Yetenekler */}
                      <div className="flex flex-wrap gap-1.5 mt-3">
                        {cv.skills.slice(0, 5).map(skill => {
                          const isMatch = matchedSkills.includes(skill);
                          return (
                            <span key={skill}
                              className={`px-2 py-0.5 text-xs rounded-md border font-medium ${
                                isMatch
                                  ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                                  : 'bg-slate-50 border-slate-200 text-slate-600'
                              }`}
                            >
                              {isMatch ? '✓ ' : ''}{skill}
                            </span>
                          );
                        })}
                        {cv.skills.length > 5 && (
                          <span className="px-2 py-0.5 text-xs rounded-md border bg-slate-50 border-slate-200 text-slate-500">
                            +{cv.skills.length - 5}
                          </span>
                        )}
                      </div>

                      {/* Özet */}
                      {cv.summary && (
                        <p className="text-xs text-slate-500 mt-2 line-clamp-2">{cv.summary}</p>
                      )}
                    </div>
                  </div>

                  {/* Sağ: Eşleşme skoru + buton */}
                  <div className="flex flex-col items-end gap-3 shrink-0">
                    {/* Eşleşme skoru */}
                    <div className={`flex flex-col items-center px-4 py-3 rounded-xl border ${colors.bg} ${colors.border}`}>
                      <div className="flex items-center gap-1">
                        <Sparkles className={`h-4 w-4 ${colors.text}`} />
                        <span className={`text-xl font-bold ${colors.text}`}>%{score}</span>
                      </div>
                      <span className={`text-xs font-medium ${colors.text}`}>İlan Eşleşmesi</span>
                      {/* Mini progress bar */}
                      <div className="mt-1.5 h-1 w-20 bg-slate-200 rounded-full overflow-hidden">
                        <div className={`h-full rounded-full ${colors.bar}`} style={{ width: `${score}%` }} />
                      </div>
                    </div>

                    <button
                      onClick={() => onViewDetail(cv)}
                      className="flex items-center gap-1 text-sm font-semibold text-blue-600 hover:text-blue-700 transition-colors"
                    >
                      Profili İncele
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
