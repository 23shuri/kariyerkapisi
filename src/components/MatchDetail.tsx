import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Brain, Sparkles, MapPin, Briefcase, Zap, CheckCircle2, AlertCircle, Info, Send, Download, ArrowLeft, Building2, Laptop, Wallet } from 'lucide-react';
import { Candidate, Job, MatchDetail as MatchDetailType } from '../types';

interface MatchDetailProps {
  candidate: Candidate;
  job: Job;
  onBack: () => void;
  onContact?: () => void;
}

export default function MatchDetail({ candidate, job, onBack, onContact }: MatchDetailProps) {
  const [copied, setCopied] = useState(false);

  // If matchDetails exists for this specific job, load it, otherwise construct dummy dynamic analysis
  const details: MatchDetailType = (candidate.matchDetails && candidate.matchDetails[job.id]) || {
    matchPercentage: 84,
    technicalSkillsMatch: 85,
    experienceMatch: 80,
    culturalMatch: 88,
    strengths: [
      `Adayın ${candidate.skills.slice(0, 3).join(', ')} konusundaki derin yetkinlikleri şirketin teknik ekosistemiyle son derece iyi eşleşiyor.`,
      `Önceki ${candidate.experienceYears} yıllık profesyonel geçmişi, pozisyondaki sorumlulukları üstlenmesi için sağlam bir temel oluşturuyor.`
    ],
    improvements: [
      `Pozisyon için aranan bazı yan yetkinlikler (${job.skills.filter(s => !candidate.skills.includes(s)).slice(0, 2).join(', ') || 'İleri bulut sistemleri'}) geliştirilmeye açık durumda.`,
      'Şirket içi mimariye adaptasyon için kısa bir oryantasyon desteği faydalı olacaktır.'
    ],
    experienceExplanation: `Adayın ${candidate.experienceYears} yıllık tecrübesi, iş tanımındaki beklentileri büyük oranda karşılıyor.`,
    culturalExplanation: 'Yenilikçi çalışma metotlarına, takım çalışmasına ve teknolojik gelişmeleri takip etmeye yüksek düzeyde uyumluluk gösteriyor.'
  };

  const handleDownload = () => {
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 15 }}
      className="space-y-8"
      id="match-detail-view"
    >
      {/* Back navigation */}
      <button 
        onClick={onBack}
        className="text-slate-500 hover:text-slate-800 transition-colors inline-flex items-center gap-2 font-semibold text-sm cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4" />
        Geri Dön
      </button>

      {/* Main Header / Match Score Section */}
      <section className="bg-white rounded-2xl border border-slate-200 p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-8 relative overflow-hidden shadow-sm">
        {/* AI Gradient Background Aura */}
        <div className="absolute -top-24 -right-24 w-64 h-64 bg-tertiary-fixed-dim/20 rounded-full blur-[80px] opacity-30 pointer-events-none" />

        {/* Applicant Section */}
        <div className="flex flex-col items-center md:items-start flex-1 text-center md:text-left">
          <div className="w-20 h-20 rounded-full overflow-hidden mb-4 border-2 border-slate-100 shadow-inner">
            <img 
              alt={candidate.name} 
              className="w-full h-full object-cover" 
              src={candidate.avatarUrl} 
            />
          </div>
          <h1 className="font-display font-bold text-2xl text-primary mb-1">{candidate.name}</h1>
          <p className="text-sm font-medium text-slate-500">{candidate.role}</p>
          <div className="flex gap-2 mt-3 flex-wrap justify-center md:justify-start">
            <span className="px-3 py-1 bg-slate-50 text-slate-500 rounded-full font-semibold text-xs flex items-center gap-1 border border-slate-100">
              <MapPin className="w-3.5 h-3.5 text-slate-400" /> {candidate.location}
            </span>
            <span className="px-3 py-1 bg-slate-50 text-slate-500 rounded-full font-semibold text-xs flex items-center gap-1 border border-slate-100">
              <Briefcase className="w-3.5 h-3.5 text-slate-400" /> {candidate.experienceYears} Yıl Deneyim
            </span>
          </div>
        </div>

        {/* Dynamic Match Score circular gauge */}
        <div className="flex flex-col items-center justify-center shrink-0 relative z-10">
          <div className="relative flex items-center justify-center w-28 h-28">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="44" fill="none" stroke="#e2e8f0" strokeWidth="6" />
              <motion.circle 
                cx="50" 
                cy="50" 
                r="44" 
                fill="none" 
                stroke="url(#aiMatchGradient)" 
                strokeWidth="6" 
                strokeLinecap="round"
                strokeDasharray="276"
                initial={{ strokeDashoffset: 276 }}
                animate={{ strokeDashoffset: 276 - (276 * details.matchPercentage) / 100 }}
                transition={{ duration: 1.5, ease: "easeOut" }}
              />
              <defs>
                <linearGradient id="aiMatchGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#0d9488" />
                  <stop offset="100%" stopColor="#7c3aud" />
                </linearGradient>
              </defs>
            </svg>
            <div className="absolute flex flex-col items-center">
              <span className="font-display text-2xl font-extrabold bg-gradient-to-r from-secondary to-tertiary-container bg-clip-text text-transparent">
                %{details.matchPercentage}
              </span>
              <span className="text-[10px] font-bold text-slate-400 tracking-wider uppercase mt-0.5">Uyum</span>
            </div>
          </div>
        </div>

        {/* Company Section */}
        <div className="flex flex-col items-center md:items-end flex-1 text-center md:text-right">
          <div className="w-20 h-20 rounded-xl bg-slate-900 flex items-center justify-center mb-4 border border-slate-800">
            <Building2 className="text-white w-10 h-10" />
          </div>
          <h2 className="font-display font-bold text-2xl text-primary mb-1">{job.company}</h2>
          <p className="text-sm font-medium text-slate-500">{job.title}</p>
          <div className="flex gap-2 mt-3 flex-wrap justify-center md:justify-end">
            <span className="px-3 py-1 bg-slate-50 text-slate-500 rounded-full font-semibold text-xs flex items-center gap-1 border border-slate-100">
              <Laptop className="w-3.5 h-3.5 text-slate-400" /> {job.workModel}
            </span>
            <span className="px-3 py-1 bg-slate-50 text-slate-500 rounded-full font-semibold text-xs flex items-center gap-1 border border-slate-100">
              <Wallet className="w-3.5 h-3.5 text-slate-400" /> {job.salaryText}
            </span>
          </div>
        </div>
      </section>

      {/* Bento Grid Layout for alignment and AI insights */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Left/Middle Panels: Detailed Alignment */}
        <section className="col-span-1 md:col-span-2 bg-white rounded-2xl border border-slate-200 p-6 md:p-8 flex flex-col gap-8 shadow-sm">
          <h3 className="font-display font-bold text-xl text-primary flex items-center gap-2">
            <Brain className="text-secondary w-5 h-5" />
            Yetenek Uyumu Detayları
          </h3>

          <div className="space-y-6">
            {/* Technical Skills Alignment */}
            <div>
              <div className="flex justify-between items-end mb-2">
                <span className="font-semibold text-sm text-slate-800">Teknik Yetkinlikler</span>
                <span className="font-bold text-xs text-secondary">%{details.technicalSkillsMatch} Eşleşme</span>
              </div>
              <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${details.technicalSkillsMatch}%` }}
                  transition={{ duration: 1, ease: "easeOut" }}
                  className="h-full bg-secondary rounded-full" 
                />
              </div>
              <div className="flex flex-wrap gap-1.5 mt-3">
                {candidate.skills.map((skill) => (
                  <span 
                    key={skill}
                    className="px-3 py-1 bg-slate-50 text-slate-700 border border-slate-100 rounded-lg text-xs font-semibold flex items-center gap-1"
                  >
                    {skill} <span className="w-1.5 h-1.5 rounded-full bg-secondary" />
                  </span>
                ))}
                {job.skills.filter(s => !candidate.skills.includes(s)).map((skill) => (
                  <span 
                    key={skill}
                    className="px-3 py-1 border border-slate-200 text-slate-400 rounded-lg text-xs font-semibold flex items-center gap-1"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>

            {/* Experience Alignment */}
            <div>
              <div className="flex justify-between items-end mb-2">
                <span className="font-semibold text-sm text-slate-800">Deneyim Seviyesi</span>
                <span className="font-bold text-xs text-secondary">%{details.experienceMatch} Eşleşme</span>
              </div>
              <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${details.experienceMatch}%` }}
                  transition={{ duration: 1, ease: "easeOut", delay: 0.2 }}
                  className="h-full bg-secondary rounded-full" 
                />
              </div>
              <p className="text-xs text-slate-500 mt-2.5 leading-relaxed font-sans">
                {details.experienceExplanation}
              </p>
            </div>

            {/* Culture Alignment */}
            <div>
              <div className="flex justify-between items-end mb-2">
                <span className="font-semibold text-sm text-slate-800">Kurum Kültürü Uyumu</span>
                <span className="font-bold text-xs text-secondary">%{details.culturalMatch} Eşleşme</span>
              </div>
              <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${details.culturalMatch}%` }}
                  transition={{ duration: 1, ease: "easeOut", delay: 0.4 }}
                  className="h-full bg-secondary rounded-full" 
                />
              </div>
              <div className="mt-3 bg-slate-50 p-3 rounded-lg border border-slate-100">
                <p className="text-xs text-slate-600 leading-relaxed font-sans">
                  {details.culturalExplanation}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Right Panel: AI Insights & Smart Actions */}
        <section className="col-span-1 bg-white rounded-2xl border border-slate-200 p-6 flex flex-col gap-6 relative overflow-hidden shadow-sm">
          {/* Subtle AI background hover indicator */}
          <div className="absolute inset-0 bg-gradient-to-br from-secondary/5 to-tertiary-container/5 opacity-50 pointer-events-none" />

          <h3 className="font-display font-bold text-xl text-primary flex items-center gap-2 relative z-10">
            <Sparkles className="text-secondary w-5 h-5 animate-pulse" />
            Akıllı Analiz
          </h3>

          <div className="space-y-4 relative z-10">
            {/* Strengths */}
            <div className="p-4 bg-slate-50 border border-slate-100 rounded-xl flex flex-col gap-1.5">
              <h4 className="font-semibold text-xs text-secondary flex items-center gap-1">
                <CheckCircle2 className="w-4 h-4" /> Güçlü Yönler
              </h4>
              <ul className="space-y-2">
                {details.strengths.map((str, index) => (
                  <li key={index} className="text-xs text-slate-600 leading-relaxed font-sans list-none">
                    {str}
                  </li>
                ))}
              </ul>
            </div>

            {/* Area of Improvements */}
            <div className="p-4 bg-slate-50 border border-slate-100 rounded-xl flex flex-col gap-1.5">
              <h4 className="font-semibold text-xs text-slate-500 flex items-center gap-1">
                <Info className="w-4 h-4 text-slate-400" /> Gelişim Alanları
              </h4>
              <ul className="space-y-2">
                {details.improvements.map((imp, index) => (
                  <li key={index} className="text-xs text-slate-600 leading-relaxed font-sans list-none">
                    {imp}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Action buttons */}
          <div className="mt-auto pt-6 border-t border-slate-100 relative z-10 space-y-3">
            <button 
              onClick={onContact}
              className="w-full font-semibold text-sm py-3 px-4 rounded-xl text-white bg-gradient-to-r from-secondary to-tertiary-container hover:opacity-95 cursor-pointer transition-all flex justify-center items-center gap-2 shadow-sm"
            >
              Adayla İletişime Geç
              <Send className="w-4 h-4" />
            </button>
            <button 
              onClick={handleDownload}
              className="w-full font-semibold text-sm py-3 px-4 rounded-xl text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 cursor-pointer transition-all flex justify-center items-center gap-2"
            >
              {copied ? 'Dosya İndiriliyor...' : 'Profili İndir'}
              <Download className="w-4 h-4" />
            </button>
          </div>
        </section>

      </div>
    </motion.div>
  );
}
