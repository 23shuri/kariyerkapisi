import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { Globe } from 'lucide-react';

export const LanguageSwitcher: React.FC = () => {
  const { language, setLanguage } = useLanguage();

  const languages: Array<{ code: 'tr' | 'en' | 'de'; label: string; flag: string }> = [
    { code: 'tr', label: 'TR', flag: '🇹🇷' },
    { code: 'en', label: 'EN', flag: '🇬🇧' },
    { code: 'de', label: 'DE', flag: '🇩🇪' }
  ];

  return (
    <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg">
      {languages.map((lang) => (
        <button
          key={lang.code}
          onClick={() => setLanguage(lang.code)}
          className={`px-3 py-1.5 rounded-md text-xs font-semibold transition flex items-center gap-1.5 ${
            language === lang.code
              ? 'bg-white text-emerald-600 shadow-sm border border-emerald-200'
              : 'text-slate-600 hover:text-slate-900'
          }`}
          title={lang.label}
        >
          <span>{lang.flag}</span>
          <span>{lang.label}</span>
        </button>
      ))}
    </div>
  );
};
