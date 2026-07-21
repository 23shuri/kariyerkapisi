import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, UploadCloud, FileText, CheckCircle2, Sparkles, Brain } from 'lucide-react';
import { Candidate } from '../types';

interface CVUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAnalysisComplete: (mockCandidate: Candidate) => void;
}

export default function CVUploadModal({ isOpen, onClose, onAnalysisComplete }: CVUploadModalProps) {
  const [dragActive, setDragActive] = useState(false);
  const [selectedPreset, setSelectedPreset] = useState<string>('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisStep, setAnalysisStep] = useState(0);

  const presets = [
    {
      id: 'frontend_senior',
      name: 'Ayşe Yılmaz - Kıdemli React & Node.js Uzmanı',
      fileSize: '2.4 MB',
      details: 'React, TypeScript, Node.js, GraphQL, UI/UX (5 Yıl Deneyim)'
    },
    {
      id: 'data_science',
      name: 'Can Demir - Makine Öğrenmesi & Veri Bilimci',
      fileSize: '1.8 MB',
      details: 'Python, Machine Learning, SQL, TensorFlow, Tableau (3 Yıl Deneyim)'
    }
  ];

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      // Use the first preset for general simulation if drop occurs
      startAnalysis('frontend_senior');
    }
  };

  const startAnalysis = (presetId: string) => {
    setIsAnalyzing(true);
    setAnalysisStep(1);

    // Simulate AI analysis stages
    setTimeout(() => {
      setAnalysisStep(2); // "Yetenekler Sınıflandırılıyor..."
      setTimeout(() => {
        setAnalysisStep(3); // "Şirket Kültür Uyumları Hesaplanıyor..."
        setTimeout(() => {
          setAnalysisStep(4); // "Analiz Tamamlandı!"
          setTimeout(() => {
            // Callback to update parent candidate state
            const matchedCandidate = presetId === 'frontend_senior' 
              ? {
                  id: 'cand_ayse',
                  name: 'Ayşe Yılmaz',
                  role: 'Kıdemli Yazılım Mühendisi',
                  experienceYears: 5,
                  location: 'İstanbul',
                  avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=400',
                  skills: ['React', 'Node.js', 'TypeScript', 'UI/UX', 'GraphQL', 'Tailwind CSS', 'Redux', 'Jest'],
                  tags: ['Frontend', 'React', 'TypeScript', 'Node.js'],
                  bio: 'Modern web teknolojileri ve kullanıcı dostu arayüzler geliştirme konusunda 5 yıllık deneyime sahip Kıdemli Yazılım Mühendisi. React, TypeScript ve Node.js ekosistemine hakim.',
                }
              : {
                  id: 'cand_can',
                  name: 'Can Demir',
                  role: 'Data Scientist',
                  experienceYears: 3,
                  location: 'Ankara',
                  avatarUrl: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=400',
                  skills: ['Python', 'Machine Learning', 'SQL', 'TensorFlow', 'Pandas', 'Scikit-Learn', 'Tableau'],
                  tags: ['Python', 'Machine Learning', 'SQL'],
                  bio: 'Büyük veri analizi, makine öğrenmesi modelleri geliştirme ve tahminsel analizler konusunda 3 yıl deneyimli Veri Bilimci. Python ve SQL araçlarını etkin kullanır.',
                };

            onAnalysisComplete(matchedCandidate as Candidate);
            setIsAnalyzing(false);
            onClose();
          }, 1000);
        }, 1200);
      }, 1200);
    }, 1200);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 15 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 15 }}
            className="bg-white rounded-2xl w-full max-w-xl p-6 shadow-2xl border border-slate-100 relative overflow-hidden z-10"
            id="cv-upload-modal"
          >
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-2">
                <Brain className="text-secondary w-6 h-6 animate-pulse" />
                <h3 className="font-display font-bold text-xl text-primary">Yapay Zeka Destekli CV Analizi</h3>
              </div>
              <button 
                onClick={onClose}
                className="text-slate-400 hover:text-slate-600 transition-colors rounded-full p-1.5 hover:bg-slate-50"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {!isAnalyzing ? (
              <div className="space-y-6">
                {/* Drag and Drop Zone */}
                <div
                  onDragEnter={handleDrag}
                  onDragOver={handleDrag}
                  onDragLeave={handleDrag}
                  onDrop={handleDrop}
                  className={`border-2 border-dashed rounded-xl p-8 text-center transition-all ${
                    dragActive 
                      ? 'border-secondary bg-secondary-container/10' 
                      : 'border-slate-200 hover:border-secondary/50 bg-slate-50/50'
                  }`}
                >
                  <UploadCloud className="mx-auto w-12 h-12 text-secondary mb-4" />
                  <p className="font-display font-semibold text-slate-700 mb-1">
                    CV dosyanızı sürükleyin ve buraya bırakın
                  </p>
                  <p className="text-sm text-slate-400 mb-4">
                    PDF, DOCX veya TXT formatında (Maks. 10MB)
                  </p>
                  <span className="text-xs bg-white text-slate-500 border border-slate-200 px-3 py-1.5 rounded-lg shadow-sm font-medium">
                    Dosya Seçin
                  </span>
                </div>

                {/* Simulated Presets for demo convenience */}
                <div>
                  <div className="flex items-center gap-1.5 mb-3">
                    <Sparkles className="text-tertiary-container w-4 h-4" />
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Hızlı Deneyim Şablonları</span>
                  </div>
                  <div className="space-y-3">
                    {presets.map((preset) => (
                      <button
                        key={preset.id}
                        onClick={() => setSelectedPreset(preset.id)}
                        className={`w-full text-left p-4 rounded-xl border transition-all flex items-start gap-3 ${
                          selectedPreset === preset.id 
                            ? 'border-secondary bg-secondary-container/5 ring-1 ring-secondary' 
                            : 'border-slate-100 hover:border-slate-200 bg-white'
                        }`}
                      >
                        <FileText className={`w-5 h-5 mt-0.5 shrink-0 ${
                          selectedPreset === preset.id ? 'text-secondary' : 'text-slate-400'
                        }`} />
                        <div>
                          <div className="font-semibold text-slate-800 text-sm">{preset.name}</div>
                          <div className="text-xs text-slate-500 mt-0.5">{preset.details}</div>
                        </div>
                        <span className="ml-auto text-xs font-mono text-slate-400 shrink-0">{preset.fileSize}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Submit button */}
                <button
                  disabled={!selectedPreset}
                  onClick={() => startAnalysis(selectedPreset)}
                  className={`w-full py-3.5 rounded-xl font-semibold text-sm transition-all flex justify-center items-center gap-2 ${
                    selectedPreset 
                      ? 'bg-gradient-to-r from-secondary to-tertiary-container text-white shadow-lg shadow-secondary/15 hover:opacity-95 cursor-pointer' 
                      : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                  }`}
                >
                  <Sparkles className="w-4 h-4" />
                  CV Analiz Et ve Eşleştir
                </button>
              </div>
            ) : (
              <div className="py-12 flex flex-col items-center justify-center">
                {/* AI Processing Animation */}
                <div className="relative w-28 h-28 flex items-center justify-center mb-8">
                  <span className="absolute inset-0 rounded-full border-4 border-slate-100" />
                  <motion.span 
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
                    className="absolute inset-0 rounded-full border-4 border-t-secondary border-r-transparent border-b-tertiary-container border-l-transparent"
                  />
                  <Brain className="w-10 h-10 text-secondary animate-pulse" />
                </div>

                <h4 className="font-display font-bold text-lg text-primary mb-2 text-center">
                  Yapay Zeka CV'nizi İnceliyor
                </h4>
                
                {/* Stepper text */}
                <div className="h-6 overflow-hidden relative w-full flex justify-center">
                  <AnimatePresence mode="wait">
                    {analysisStep === 1 && (
                      <motion.p 
                        key="step1"
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: -20, opacity: 0 }}
                        className="text-sm text-slate-500 text-center font-medium"
                      >
                        Metin ayrıştırılıyor ve biçimlendiriliyor...
                      </motion.p>
                    )}
                    {analysisStep === 2 && (
                      <motion.p 
                        key="step2"
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: -20, opacity: 0 }}
                        className="text-sm text-secondary text-center font-semibold"
                      >
                        Teknik yetkinlikler sınıflandırılıyor...
                      </motion.p>
                    )}
                    {analysisStep === 3 && (
                      <motion.p 
                        key="step3"
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: -20, opacity: 0 }}
                        className="text-sm text-tertiary-container text-center font-semibold animate-pulse"
                      >
                        Aktif iş ilanları ile uyumluluk puanı hesaplanıyor...
                      </motion.p>
                    )}
                    {analysisStep === 4 && (
                      <motion.p 
                        key="step4"
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: -20, opacity: 0 }}
                        className="text-sm text-emerald-600 text-center font-bold flex items-center gap-1.5"
                      >
                        <CheckCircle2 className="w-4 h-4" /> Analiz Tamamlandı!
                      </motion.p>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
