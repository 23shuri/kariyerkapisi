import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Search, Brain, MapPin, Building2, Zap, ArrowRight, X } from 'lucide-react';
import { Job, Candidate } from '../types';

interface JobsListProps {
  jobs: Job[];
  candidate: Candidate;
  onSelectJob: (jobId: string) => void;
}

export default function JobsList({ jobs, candidate, onSelectJob }: JobsListProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('Uyum');
  const [matchFilter80, setMatchFilter80] = useState(true);
  const [matchFilter60, setMatchFilter60] = useState(false);
  const [remoteFilter, setRemoteFilter] = useState(true);
  const [hybridFilter, setHybridFilter] = useState(true);
  const [officeFilter, setOfficeFilter] = useState(false);
  const [selectedTech, setSelectedTech] = useState<string>('');

  // Let's dynamically calculate match percentage for list view based on skills
  const decoratedJobs = jobs.map(job => {
    let matchPct = 75;
    if (candidate.matchDetails && candidate.matchDetails[job.id]) {
      matchPct = candidate.matchDetails[job.id].matchPercentage;
    } else {
      const sharedSkills = job.skills.filter(s => candidate.skills.includes(s));
      const calcPct = Math.round(60 + (sharedSkills.length / Math.max(job.skills.length, 1)) * 38);
      matchPct = Math.min(Math.max(calcPct, 62), 98);
    }
    return { ...job, matchPercentage: matchPct };
  });

  // Filter jobs
  const filteredJobs = decoratedJobs.filter(job => {
    // Search query
    const matchesSearch = 
      job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.skills.some(s => s.toLowerCase().includes(searchQuery.toLowerCase()));

    // AI Match filters
    let matchesAI = true;
    if (matchFilter80 && !matchFilter60) {
      matchesAI = job.matchPercentage >= 80;
    } else if (matchFilter60 && !matchFilter80) {
      matchesAI = job.matchPercentage >= 60 && job.matchPercentage < 80;
    } else if (matchFilter80 && matchFilter60) {
      matchesAI = job.matchPercentage >= 60;
    }

    // Work Model filters
    let matchesModel = false;
    if (!remoteFilter && !hybridFilter && !officeFilter) {
      matchesModel = true; // No filter selected means show all
    } else {
      if (remoteFilter && job.workModel === 'Uzaktan') matchesModel = true;
      if (hybridFilter && job.workModel === 'Hibrit') matchesModel = true;
      if (officeFilter && job.workModel === 'Ofisten') matchesModel = true;
    }

    // Selected tech stack filter
    let matchesTech = true;
    if (selectedTech) {
      matchesTech = job.skills.includes(selectedTech);
    }

    return matchesSearch && matchesAI && matchesModel && matchesTech;
  });

  // Sorting
  const sortedJobs = [...filteredJobs].sort((a, b) => {
    if (sortBy === 'Uyum') {
      return b.matchPercentage - a.matchPercentage;
    }
    return 0; // standard default
  });

  const clearFilters = () => {
    setSearchQuery('');
    setMatchFilter80(true);
    setMatchFilter60(false);
    setRemoteFilter(true);
    setHybridFilter(true);
    setOfficeFilter(false);
    setSelectedTech('');
  };

  const techStackOptions = ['React', 'Node.js', 'Python', 'AWS', 'SQL', 'PostgreSQL'];

  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 15 }}
      className="flex flex-col md:flex-row gap-8"
      id="jobs-list-view"
    >
      {/* Left Sidebar Filter Column */}
      <aside className="w-full md:w-64 shrink-0">
        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-[0_4px_20px_rgba(30,41,59,0.02)] sticky top-24">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-display font-bold text-lg text-primary">Akıllı Filtreler</h2>
            <Brain className="text-secondary w-5 h-5 animate-pulse" />
          </div>

          {/* AI Match Fit Filter */}
          <div className="mb-6">
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">
              Yapay Zeka Uyumu
            </label>
            <div className="space-y-2.5">
              <label className="flex items-center gap-2.5 cursor-pointer group">
                <input 
                  type="checkbox" 
                  checked={matchFilter80}
                  onChange={(e) => setMatchFilter80(e.target.checked)}
                  className="w-4 h-4 text-secondary rounded border-slate-300 focus:ring-secondary cursor-pointer"
                />
                <span className="text-xs font-medium text-slate-600 group-hover:text-primary transition-colors">
                  &gt; 80% (Mükemmel Eşleşme)
                </span>
              </label>
              <label className="flex items-center gap-2.5 cursor-pointer group">
                <input 
                  type="checkbox" 
                  checked={matchFilter60}
                  onChange={(e) => setMatchFilter60(e.target.checked)}
                  className="w-4 h-4 text-secondary rounded border-slate-300 focus:ring-secondary cursor-pointer"
                />
                <span className="text-xs font-medium text-slate-600 group-hover:text-primary transition-colors">
                  &gt; 60% (İyi Eşleşme)
                </span>
              </label>
            </div>
          </div>

          <hr className="border-slate-100 my-5" />

          {/* Work Model Filter */}
          <div className="mb-6">
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">
              Çalışma Modeli
            </label>
            <div className="space-y-2.5">
              <label className="flex items-center gap-2.5 cursor-pointer group">
                <input 
                  type="checkbox" 
                  checked={remoteFilter}
                  onChange={(e) => setRemoteFilter(e.target.checked)}
                  className="w-4 h-4 text-secondary rounded border-slate-300 focus:ring-secondary cursor-pointer"
                />
                <span className="text-xs font-medium text-slate-600 group-hover:text-primary transition-colors">
                  Uzaktan (Remote)
                </span>
              </label>
              <label className="flex items-center gap-2.5 cursor-pointer group">
                <input 
                  type="checkbox" 
                  checked={hybridFilter}
                  onChange={(e) => setHybridFilter(e.target.checked)}
                  className="w-4 h-4 text-secondary rounded border-slate-300 focus:ring-secondary cursor-pointer"
                />
                <span className="text-xs font-medium text-slate-600 group-hover:text-primary transition-colors">
                  Hibrit
                </span>
              </label>
              <label className="flex items-center gap-2.5 cursor-pointer group">
                <input 
                  type="checkbox" 
                  checked={officeFilter}
                  onChange={(e) => setOfficeFilter(e.target.checked)}
                  className="w-4 h-4 text-secondary rounded border-slate-300 focus:ring-secondary cursor-pointer"
                />
                <span className="text-xs font-medium text-slate-600 group-hover:text-primary transition-colors">
                  Ofisten
                </span>
              </label>
            </div>
          </div>

          <hr className="border-slate-100 my-5" />

          {/* Tech Stack Selection Chips */}
          <div className="mb-6">
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">
              Teknoloji Yığını
            </label>
            <div className="flex flex-wrap gap-1.5">
              {techStackOptions.map((tech) => (
                <button
                  key={tech}
                  onClick={() => setSelectedTech(selectedTech === tech ? '' : tech)}
                  className={`px-2.5 py-1 text-xs font-semibold rounded-lg border transition-all cursor-pointer ${
                    selectedTech === tech
                      ? 'bg-secondary text-white border-secondary shadow-sm'
                      : 'bg-slate-50 text-slate-500 border-slate-100 hover:bg-slate-100'
                  }`}
                >
                  {tech}
                </button>
              ))}
            </div>
          </div>

          <button 
            onClick={clearFilters}
            className="w-full py-2 bg-slate-50 border border-slate-200 hover:border-slate-300 text-slate-600 hover:text-primary rounded-xl font-semibold text-xs hover:bg-slate-100 transition-colors cursor-pointer"
          >
            Filtreleri Temizle
          </button>
        </div>
      </aside>

      {/* Main Jobs Search and Listing Column */}
      <div className="flex-1 space-y-6">
        
        {/* Wide Search Bar */}
        <div className="bg-white rounded-2xl p-2.5 shadow-[0_4px_20px_rgba(30,41,59,0.02)] border border-slate-200 flex items-center gap-2 focus-within:border-secondary transition-colors">
          <Search className="text-slate-400 w-5 h-5 ml-3" />
          <input 
            type="text" 
            placeholder="Pozisyon, Yetenek veya Şirket Ara..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-transparent border-none focus:outline-none text-base text-primary placeholder-slate-400 p-2"
          />
          <button className="bg-primary text-white px-6 py-3 rounded-xl font-semibold text-sm hover:opacity-95 cursor-pointer whitespace-nowrap transition-opacity">
            İş Bul
          </button>
        </div>

        {/* Results Header block */}
        <div className="flex justify-between items-end mt-4">
          <div>
            <h1 className="font-display font-bold text-2xl text-primary">Önerilen İlanlar</h1>
            <p className="text-xs font-sans text-slate-400 mt-1">
              Sizin için yapay zeka ile eşleştirilen {sortedJobs.length} ilan bulundu.
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-xs text-slate-400 font-medium">Sırala:</span>
            <select 
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="text-primary font-semibold text-xs border-none bg-transparent cursor-pointer focus:ring-0 p-0"
            >
              <option value="Uyum">En Yüksek Uyum</option>
            </select>
          </div>
        </div>

        {/* Job Cards Array */}
        <div className="space-y-4">
          {sortedJobs.map((job) => (
            <div
              key={job.id}
              onClick={() => onSelectJob(job.id)}
              className="bg-white rounded-2xl p-6 border border-slate-200 hover:border-secondary shadow-sm hover:shadow-[0_8px_30px_rgba(13,148,136,0.06)] transition-all relative overflow-hidden group cursor-pointer flex flex-col md:flex-row gap-6"
            >
              {/* Corner top right AI decoration */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-secondary-container/20 to-transparent rounded-bl-full pointer-events-none" />

              <div className="w-16 h-16 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-primary font-bold text-2xl shrink-0">
                {job.logoLetter || job.company.charAt(0)}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start gap-4 mb-2">
                  <div>
                    <h3 className="font-display font-bold text-lg text-primary group-hover:text-secondary transition-colors truncate">
                      {job.title}
                    </h3>
                    <p className="text-sm text-slate-400 font-sans mt-0.5">
                      {job.company} • {job.location} ({job.workModel})
                    </p>
                  </div>

                  {/* AI Match Percent Indicator */}
                  <div className="flex flex-col items-center justify-center bg-slate-50 border border-slate-100 p-2.5 rounded-xl min-w-[64px] shrink-0">
                    <span className="font-display text-base font-extrabold text-secondary leading-none">%{job.matchPercentage}</span>
                    <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider mt-1">Uyum</span>
                  </div>
                </div>

                <p className="text-xs text-slate-500 font-sans leading-relaxed line-clamp-2 mt-3 mb-4">
                  {job.description}
                </p>

                <div className="flex flex-wrap items-center gap-1.5">
                  {job.skills.slice(0, 3).map((skill) => (
                    <span
                      key={skill}
                      className="px-2.5 py-1 bg-slate-50 border border-slate-100 rounded-lg text-xs font-semibold text-slate-500"
                    >
                      {skill}
                    </span>
                  ))}
                  {/* Matching special NLP tag */}
                  {job.matchPercentage >= 90 && (
                    <span className="px-2.5 py-1 bg-secondary-container/30 text-on-secondary-container rounded-lg text-xs font-bold flex items-center gap-1">
                      <Brain className="w-3.5 h-3.5" /> NLP Uyuşması
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}

          {sortedJobs.length === 0 && (
            <div className="text-center py-16 bg-white rounded-2xl border border-slate-100">
              <Brain className="w-12 h-12 text-slate-300 mx-auto mb-3 animate-bounce" />
              <p className="text-sm font-semibold text-slate-500">Seçilen filtrelere uygun ilan bulunamadı.</p>
              <button 
                onClick={clearFilters}
                className="mt-3 text-secondary font-bold text-xs hover:underline cursor-pointer"
              >
                Filtreleri Sıfırla
              </button>
            </div>
          )}
        </div>

        {sortedJobs.length > 0 && (
          <div className="flex justify-center mt-6">
            <button className="px-6 py-2.5 border-2 border-slate-200 text-slate-500 rounded-xl font-bold text-xs hover:border-primary hover:text-primary transition-colors cursor-pointer">
              Daha Fazla Göster
            </button>
          </div>
        )}

      </div>
    </motion.div>
  );
}
