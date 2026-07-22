import React from 'react';
import { Sparkles, FileText, BadgeCheck, Send, Cpu, Briefcase } from 'lucide-react';
import { motion } from 'motion/react';

interface HeroProps {
  onOpenAuth: (role: 'candidate' | 'employer') => void;
}

export const Hero: React.FC<HeroProps> = ({ onOpenAuth }) => {
  return (
    <div className="relative overflow-hidden bg-gradient-to-b from-slate-50/60 to-white py-16 sm:py-24">
      {/* Decorative background grid */}
      <div className="absolute inset-0 -z-10 bg-[linear-gradient(to_right,#f1f5f9_1px,transparent_1px),linear-gradient(to_bottom,#f1f5f9_1px,transparent_1px)] bg-[size:6rem_4rem] opacity-60" />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          {/* AI Banner Badge */}
          <motion.div 
            initial={{ opacity: 0, y: -15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center space-x-1.5 rounded-full bg-emerald-50/70 border border-emerald-100 px-3 py-1 text-xs font-medium text-emerald-700 mb-6"
          >
            <Sparkles className="h-3.5 w-3.5 text-emerald-600" />
            <span>Kariyer Kapısı Akıllı Eşleştirme Motoru V3.0 Aktif</span>
          </motion.div>

          {/* Heading */}
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="font-display text-4xl font-bold tracking-tight text-slate-900 sm:text-6xl max-w-4xl mx-auto leading-[1.15]"
          >
            CV'nizi Yükleyin,{' '}
            <span className="text-emerald-600">
              Size En Uygun İşi
            </span>{' '}
            Yapay Zeka Bulsun!
          </motion.h1>

          {/* Description */}
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mt-6 text-base leading-8 text-slate-500 max-w-2xl mx-auto"
          >
            Klasik anahtar kelime aramalarını unutun. Kariyer Kapısı, özgeçmişinizi derinlemesine analiz eder, iş ilanlarıyla yeteneklerinizi %99'a varan doğrulukla eşleştirir.
          </motion.p>

          {/* Action Buttons */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <button
              onClick={() => onOpenAuth('candidate')}
              className="group relative flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-3 text-sm font-medium text-white shadow-sm hover:bg-emerald-700 transition-all duration-150 w-full sm:w-auto cursor-pointer"
            >
              <FileText className="h-4.5 w-4.5 text-emerald-200 group-hover:text-white transition-colors" />
              Özgeçmişini AI ile Tara
            </button>
            <button
              onClick={() => onOpenAuth('employer')}
              className="flex items-center justify-center gap-2 rounded-xl bg-white border border-slate-200 px-5 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-all duration-150 w-full sm:w-auto cursor-pointer"
            >
              <Briefcase className="h-4.5 w-4.5 text-slate-400" />
              İş İlanı Yayınla
            </button>
          </motion.div>

          {/* Feature Grid */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="mt-20 grid grid-cols-1 gap-6 sm:grid-cols-3 max-w-4xl mx-auto"
          >
            {/* Feature 1 */}
            <div className="flex flex-col items-center p-6 rounded-3xl border border-slate-100 bg-white shadow-sm hover:shadow-md transition-shadow">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 mb-4">
                <Cpu className="h-5 w-5" />
              </div>
              <h3 className="text-sm font-semibold text-slate-900">Derin AI Analizi</h3>
              <p className="mt-2 text-xs text-slate-500 text-center leading-relaxed">
                Gemini LLM teknolojisi CV'nizdeki projeleri, deneyimleri ogrenileri ve yeteneklerinizi akıllıca yorumlar.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="flex flex-col items-center p-6 rounded-3xl border border-slate-100 bg-white shadow-sm hover:shadow-md transition-shadow">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 mb-4">
                <BadgeCheck className="h-5 w-5" />
              </div>
              <h3 className="text-sm font-semibold text-slate-900">Uyum Raporu</h3>
              <p className="mt-2 text-xs text-slate-500 text-center leading-relaxed">
                Başvurduğunuz her ilan için güçlü yanlarınızı ve gelişim alanlarınızı gösteren anlık raporlar.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="flex flex-col items-center p-6 rounded-3xl border border-slate-100 bg-white shadow-sm hover:shadow-md transition-shadow">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 mb-4">
                <Send className="h-5 w-5" />
              </div>
              <h3 className="text-sm font-semibold text-slate-900">Kolay Başvuru</h3>
              <p className="mt-2 text-xs text-slate-500 text-center leading-relaxed">
                Tek tıkla akıllı başvuru yapın, işe alım yöneticilerine en üst sıralarda eşleşmeyle ulaşın.
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};
