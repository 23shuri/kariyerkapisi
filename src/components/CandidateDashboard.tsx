import React from 'react';
import { motion } from 'motion/react';
import { Brain, Sparkles, UploadCloud, CheckCircle, Zap, MapPin, ArrowRight } from 'lucide-react';
import { Candidate, Job } from '../types';

interface CandidateDashboardProps {
  candidate: Candidate;
  jobs: Job[];
  onOpenUpload: () => void;
  onSelectJob: (jobId: string) => void;
}

export default function CandidateDashboard({ candidate, jobs, onOpenUpload, onSelectJob }: CandidateDashboardProps) {
  // Let's filter some jobs and calculate simulated match scores
  const matchingJobs = jobs.map(job => {
    // If we have detailed preset score in candidate's matchDetails, use it
    let matchPct = 75; // Default match
    if (candidate.matchDetails && candidate.matchDetails[job.id]) {
      matchPct = candidate.matchDetails[job.id].matchPercentage;
    } else {
      // Calculate a pseudo-random stable match based on skills intersection
      const sharedSkills = job.skills.filter(s => candidate.skills.includes(s));
      const calcPct = Math.round(60 + (sharedSkills.length / Math.max(job.skills.length, 1)) * 38);
      matchPct = Math.min(Math.max(calcPct, 62), 98);
    }
    return { ...job, matchPercentage: matchPct };
  }).sort((a, b) => b.matchPercentage - a.matchPercentage);

  // We can vary the profile strength depending on active candidate
  const isAyse = candidate.id === 'cand_ayse';
  const profileStrength = isAyse ? 85 : 78;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 15 }}
      className="space-y-8"
      id="candidate-dashboard"
    >
      {/* Hero Banner + Gauge Bento Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Banner CTA Card */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-8 border border-slate-200/80 shadow-[0_4px_20px_rgba(30,41,59,0.02)] flex flex-col justify-between relative overflow-hidden">
          {/* Background Ambient Glow */}
          <div className="absolute -top-24 -right-24 w-64 h-64 bg-secondary-container/10 rounded-full blur-3xl opacity-60 pointer-events-none" />
          <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-tertiary-fixed-dim/5 rounded-full blur-3xl opacity-40 pointer-events-none" />
          
          <div className="relative z-10 max-w-lg">
            <h2 className="font-display text-4xl font-extrabold text-primary leading-tight tracking-tight mb-4">
              Kariyerinize <br />
              <span className="bg-gradient-to-r from-secondary to-tertiary-container bg-clip-text text-transparent">Yapay Zeka</span> ile Yön Verin.
            </h2>
            <p className="text-slate-500 font-sans text-base leading-relaxed mb-8">
              CV'nizi yükleyin, akıllı eşleştirme motorumuz size en uygun ilanları analiz edip öne çıkarsın.
            </p>
            <button
              onClick={onOpenUpload}
              className="bg-gradient-to-r from-secondary to-tertiary-container text-white px-6 py-3 rounded-xl font-semibold text-sm inline-flex items-center gap-2 shadow-md shadow-secondary/10 hover:opacity-95 hover:scale-[1.02] transition-all cursor-pointer"
            >
              <UploadCloud className="w-5 h-5" />
              CV Yükle & Analiz Et
            </button>
          </div>
        </div>

        {/* AI Profile Strength Indicator Card */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-[0_4px_20px_rgba(30,41,59,0.02)] flex flex-col items-center justify-center text-center relative overflow-hidden">
          {/* Subtle AI Glow aura backdrop */}
          <div className="absolute inset-0 bg-gradient-to-br from-secondary/5 to-tertiary-container/5 opacity-50 pointer-events-none" />
          
          <h3 className="font-display font-bold text-lg text-primary self-start text-left mb-1">
            Profil Gücü
          </h3>
          <p className="text-xs font-sans text-slate-400 self-start text-left mb-6">
            AI Eşleştirme Motoru Durumu
          </p>

          {/* Circular Gauge */}
          <div className="relative w-36 h-36 flex items-center justify-center mb-5">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="44" fill="none" stroke="#f1f5f9" strokeWidth="7" />
              <motion.circle 
                cx="50" 
                cy="50" 
                r="44" 
                fill="none" 
                stroke="#0d9488" 
                strokeWidth="7"
                strokeLinecap="round"
                strokeDasharray="276"
                initial={{ strokeDashoffset: 276 }}
                animate={{ strokeDashoffset: 276 - (276 * profileStrength) / 100 }}
                transition={{ duration: 1.2, ease: "easeOut" }}
              />
            </svg>
            <div className="absolute flex flex-col items-center justify-center">
              <span className="font-display text-3xl font-extrabold text-secondary">{profileStrength}%</span>
            </div>
          </div>

          <p className="font-semibold text-sm text-primary mb-3">Güçlü Aday Profili</p>
          
          <div className="flex gap-2 w-full justify-center flex-wrap">
            <span className="px-2.5 py-1 bg-slate-50 text-slate-600 rounded-lg text-xs font-semibold inline-flex items-center gap-1 border border-slate-100">
              <CheckCircle className="w-3.5 h-3.5 text-secondary" /> Yazılım
            </span>
            <span className="px-2.5 py-1 bg-slate-50 text-slate-600 rounded-lg text-xs font-semibold inline-flex items-center gap-1 border border-slate-100">
              <CheckCircle className="w-3.5 h-3.5 text-secondary" /> İngilizce
            </span>
          </div>
        </div>

      </div>

      {/* Smart Matches Header + Grid */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="font-display text-2xl font-bold text-primary flex items-center gap-2">
              Akıllı Eşleşmeler
              <Sparkles className="text-secondary w-5 h-5 animate-pulse" />
            </h2>
            <p className="text-slate-400 font-sans text-sm mt-0.5">
              Profilinize özel yüksek uyumlu pozisyonlar
            </p>
          </div>
        </div>

        {/* Job Matches Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {matchingJobs.slice(0, 3).map((job) => (
            <div
              key={job.id}
              onClick={() => onSelectJob(job.id)}
              className="bg-white rounded-2xl p-6 border border-slate-200/60 shadow-[0_4px_20px_rgba(30,41,59,0.02)] hover:border-secondary hover:shadow-[0_8px_30px_rgba(13,148,136,0.08)] hover:-translate-y-0.5 transition-all cursor-pointer flex flex-col h-full group"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-center text-primary font-bold text-lg">
                    {job.logoLetter || job.company.charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-display font-bold text-base leading-snug text-primary group-hover:text-secondary transition-colors">
                      {job.title}
                    </h3>
                    <p className="text-xs font-sans text-slate-400 mt-0.5">
                      {job.company}
                    </p>
                  </div>
                </div>

                {/* Match Badge */}
                <div className="bg-secondary-container/20 text-on-secondary-container px-2.5 py-1 rounded-full font-bold text-xs flex items-center gap-0.5 shrink-0">
                  <Zap className="w-3.5 h-3.5 fill-current" />
                  {job.matchPercentage}%
                </div>
              </div>

              {/* Skills tags */}
              <div className="flex flex-wrap gap-1.5 mb-6">
                {job.skills.slice(0, 3).map((skill) => (
                  <span
                    key={skill}
                    className="px-2 py-1 bg-slate-50 border border-slate-100 text-slate-500 rounded-lg text-xs font-medium"
                  >
                    {skill}
                  </span>
                ))}
              </div>

              {/* Footer info and button */}
              <div className="mt-auto pt-4 border-t border-slate-100 flex justify-between items-center">
                <span className="text-xs font-sans text-slate-400 inline-flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  {job.location} ({job.workModel})
                </span>
                <button className="text-primary font-semibold text-xs hover:text-secondary transition-colors inline-flex items-center gap-1 group/btn">
                  İncele
                  <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover/btn:translate-x-0.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
