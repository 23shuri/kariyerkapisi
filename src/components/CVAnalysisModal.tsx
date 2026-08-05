import { useState } from 'react';
import { X, Upload, Loader, Check, AlertCircle, Edit2, Save, ChevronDown } from 'lucide-react';
import { CVAnalysisResult, EducationExtracted, ExperienceExtracted, LanguageExtracted, CertificationExtracted } from '../types';

interface CVAnalysisModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAnalysisComplete: (result: CVAnalysisResult) => void;
  candidateId: string;
}

export const CVAnalysisModal: React.FC<CVAnalysisModalProps> = ({
  isOpen,
  onClose,
  onAnalysisComplete,
  candidateId,
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<CVAnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [editMode, setEditMode] = useState(false);

  // Editable fields state
  const [editedData, setEditedData] = useState<{
    education: EducationExtracted[];
    experience: ExperienceExtracted[];
    skills: string[];
    languages: LanguageExtracted[];
    certifications: CertificationExtracted[];
    summary: string;
  } | null>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    // Validate file type
    if (!selectedFile.type.includes('pdf') && !selectedFile.name.endsWith('.pdf')) {
      setError('Lütfen geçerli bir PDF dosyası seçiniz.');
      return;
    }

    // Validate file size (max 10MB)
    if (selectedFile.size > 10 * 1024 * 1024) {
      setError('Dosya boyutu 10MB\'dan küçük olmalıdır.');
      return;
    }

    setFile(selectedFile);
  };

  const handleAnalyze = async () => {
    if (!file) {
      setError('Lütfen bir PDF dosyası seçiniz.');
      return;
    }

    setIsAnalyzing(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('candidateId', candidateId);

      const response = await fetch('/api/cv/analyze', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'CV analiz işlemi başarısız oldu.');
      }

      const data: CVAnalysisResult = await response.json();

      if (!data.success) {
        throw new Error(data.message || 'CV analiz işlemi başarısız oldu.');
      }

      setAnalysisResult(data);
      if (data.data) {
        setEditedData({
          education: data.data.education || [],
          experience: data.data.experience || [],
          skills: data.data.skills || [],
          languages: data.data.languages || [],
          certifications: data.data.certifications || [],
          summary: data.data.summary || '',
        });
      }
      setEditMode(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Bir hata oluştu.');
      console.error('CV Analysis error:', err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSaveAnalysis = () => {
    if (!editedData || !analysisResult) return;

    const finalResult: CVAnalysisResult = {
      success: true,
      data: editedData,
    };

    onAnalysisComplete(finalResult);
    handleClose();
  };

  const handleClose = () => {
    setFile(null);
    setAnalysisResult(null);
    setEditedData(null);
    setError(null);
    setEditMode(false);
    onClose();
  };

  const addEducation = () => {
    if (!editedData) return;
    setEditedData({
      ...editedData,
      education: [
        ...editedData.education,
        { level: '', school: '', field: '', year: '' },
      ],
    });
  };

  const removeEducation = (index: number) => {
    if (!editedData) return;
    setEditedData({
      ...editedData,
      education: editedData.education.filter((_, i) => i !== index),
    });
  };

  const updateEducation = (
    index: number,
    field: keyof EducationExtracted,
    value: string
  ) => {
    if (!editedData) return;
    const updated = [...editedData.education];
    updated[index] = { ...updated[index], [field]: value };
    setEditedData({ ...editedData, education: updated });
  };

  const addExperience = () => {
    if (!editedData) return;
    setEditedData({
      ...editedData,
      experience: [
        ...editedData.experience,
        { company: '', position: '', duration: '', description: '' },
      ],
    });
  };

  const removeExperience = (index: number) => {
    if (!editedData) return;
    setEditedData({
      ...editedData,
      experience: editedData.experience.filter((_, i) => i !== index),
    });
  };

  const updateExperience = (
    index: number,
    field: keyof ExperienceExtracted,
    value: string
  ) => {
    if (!editedData) return;
    const updated = [...editedData.experience];
    updated[index] = { ...updated[index], [field]: value };
    setEditedData({ ...editedData, experience: updated });
  };

  const addLanguage = () => {
    if (!editedData) return;
    setEditedData({
      ...editedData,
      languages: [
        ...editedData.languages,
        { name: '', level: '' },
      ],
    });
  };

  const removeLanguage = (index: number) => {
    if (!editedData) return;
    setEditedData({
      ...editedData,
      languages: editedData.languages.filter((_, i) => i !== index),
    });
  };

  const updateLanguage = (
    index: number,
    field: keyof LanguageExtracted,
    value: string
  ) => {
    if (!editedData) return;
    const updated = [...editedData.languages];
    updated[index] = { ...updated[index], [field]: value };
    setEditedData({ ...editedData, languages: updated });
  };

  const updateSkills = (skillsText: string) => {
    if (!editedData) return;
    const skills = skillsText
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
    setEditedData({ ...editedData, skills });
  };

  const updateSummary = (summary: string) => {
    if (!editedData) return;
    setEditedData({ ...editedData, summary });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-emerald-600 to-emerald-700 px-6 py-4 flex items-center justify-between border-b border-emerald-700">
          <h2 className="text-xl font-bold text-white">CV'yi Analiz Et</h2>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-emerald-500 rounded-lg transition-colors"
          >
            <X className="h-5 w-5 text-white" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Step 1: Upload */}
          {!analysisResult && (
            <div className="space-y-4">
              <div className="border-2 border-dashed border-slate-300 rounded-lg p-8 text-center hover:border-emerald-400 transition-colors">
                <input
                  type="file"
                  accept=".pdf"
                  onChange={handleFileSelect}
                  className="hidden"
                  id="pdf-input"
                />
                <label htmlFor="pdf-input" className="cursor-pointer block">
                  <Upload className="h-12 w-12 text-slate-400 mx-auto mb-3" />
                  <p className="text-sm font-medium text-slate-700">
                    {file ? file.name : 'PDF dosyanızı sürükleyin veya tıklayın'}
                  </p>
                  {!file && <p className="text-xs text-slate-500 mt-1">PDF dosyası (maksimum 10MB)</p>}
                </label>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              )}

              <div className="flex gap-3">
                <button
                  onClick={handleClose}
                  className="flex-1 px-4 py-2 border border-slate-300 text-slate-700 font-medium rounded-lg hover:bg-slate-50 transition-colors"
                >
                  İptal Et
                </button>
                <button
                  onClick={handleAnalyze}
                  disabled={!file || isAnalyzing}
                  className="flex-1 px-4 py-2 bg-emerald-600 text-white font-medium rounded-lg hover:bg-emerald-700 disabled:bg-slate-300 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
                >
                  {isAnalyzing ? (
                    <>
                      <Loader className="h-4 w-4 animate-spin" />
                      Analiz Ediliyor...
                    </>
                  ) : (
                    'Analiz Et'
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Step 2: Review & Edit */}
          {analysisResult && editedData && (
            <div className="space-y-6">
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              )}

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-start gap-3">
                <Check className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-blue-700">
                  CV başarıyla analiz edildi. Lütfen çıkarılan bilgileri kontrol edip gerekli düzenlemeleri yapınız.
                </p>
              </div>

              {/* Summary */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Özet
                </label>
                <textarea
                  value={editedData.summary}
                  onChange={(e) => updateSummary(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  rows={3}
                  placeholder="CV özeti..."
                />
              </div>

              {/* Skills */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Yetenekler
                </label>
                <textarea
                  value={editedData.skills.join(', ')}
                  onChange={(e) => updateSkills(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  rows={2}
                  placeholder="Yetenekleri virgülle ayırarak yazınız (örn: React, Python, SQL)"
                />
              </div>

              {/* Education */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <label className="block text-sm font-semibold text-slate-700">
                    Eğitim Bilgileri
                  </label>
                  <button
                    onClick={addEducation}
                    className="text-xs bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full hover:bg-emerald-200 transition-colors"
                  >
                    + Ekle
                  </button>
                </div>
                <div className="space-y-3">
                  {editedData.education.map((edu, idx) => (
                    <div key={idx} className="bg-slate-50 p-3 rounded-lg space-y-2">
                      <div className="grid grid-cols-2 gap-2">
                        <input
                          type="text"
                          value={edu.level}
                          onChange={(e) => updateEducation(idx, 'level', e.target.value)}
                          placeholder="Seviye (ilkokul, üniversite, vb)"
                          className="px-3 py-2 border border-slate-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        />
                        <input
                          type="text"
                          value={edu.school}
                          onChange={(e) => updateEducation(idx, 'school', e.target.value)}
                          placeholder="Okul/Üniversite Adı"
                          className="px-3 py-2 border border-slate-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <input
                          type="text"
                          value={edu.field}
                          onChange={(e) => updateEducation(idx, 'field', e.target.value)}
                          placeholder="Alan/Bölüm"
                          className="px-3 py-2 border border-slate-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        />
                        <input
                          type="text"
                          value={edu.year}
                          onChange={(e) => updateEducation(idx, 'year', e.target.value)}
                          placeholder="Yıl (2020 veya 2020-2023)"
                          className="px-3 py-2 border border-slate-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        />
                      </div>
                      <button
                        onClick={() => removeEducation(idx)}
                        className="text-xs text-red-600 hover:text-red-700 font-medium"
                      >
                        Kaldır
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Experience */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <label className="block text-sm font-semibold text-slate-700">
                    İş Deneyimleri
                  </label>
                  <button
                    onClick={addExperience}
                    className="text-xs bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full hover:bg-emerald-200 transition-colors"
                  >
                    + Ekle
                  </button>
                </div>
                <div className="space-y-3">
                  {editedData.experience.map((exp, idx) => (
                    <div key={idx} className="bg-slate-50 p-3 rounded-lg space-y-2">
                      <div className="grid grid-cols-2 gap-2">
                        <input
                          type="text"
                          value={exp.company}
                          onChange={(e) => updateExperience(idx, 'company', e.target.value)}
                          placeholder="Şirket Adı"
                          className="px-3 py-2 border border-slate-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        />
                        <input
                          type="text"
                          value={exp.position}
                          onChange={(e) => updateExperience(idx, 'position', e.target.value)}
                          placeholder="Pozisyon"
                          className="px-3 py-2 border border-slate-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        />
                      </div>
                      <input
                        type="text"
                        value={exp.duration}
                        onChange={(e) => updateExperience(idx, 'duration', e.target.value)}
                        placeholder="Süre (2020-2023)"
                        className="w-full px-3 py-2 border border-slate-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                      <textarea
                        value={exp.description || ''}
                        onChange={(e) => updateExperience(idx, 'description', e.target.value)}
                        placeholder="Açıklama"
                        className="w-full px-3 py-2 border border-slate-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        rows={2}
                      />
                      <button
                        onClick={() => removeExperience(idx)}
                        className="text-xs text-red-600 hover:text-red-700 font-medium"
                      >
                        Kaldır
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Languages */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <label className="block text-sm font-semibold text-slate-700">
                    Yabancı Diller
                  </label>
                  <button
                    onClick={addLanguage}
                    className="text-xs bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full hover:bg-emerald-200 transition-colors"
                  >
                    + Ekle
                  </button>
                </div>
                <div className="space-y-2">
                  {editedData.languages.map((lang, idx) => (
                    <div key={idx} className="flex gap-2 items-end bg-slate-50 p-2 rounded">
                      <input
                        type="text"
                        value={lang.name}
                        onChange={(e) => updateLanguage(idx, 'name', e.target.value)}
                        placeholder="Dil (İngilizce, Almanca, vb)"
                        className="flex-1 px-3 py-2 border border-slate-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                      <input
                        type="text"
                        value={lang.level}
                        onChange={(e) => updateLanguage(idx, 'level', e.target.value)}
                        placeholder="Seviye"
                        className="flex-1 px-3 py-2 border border-slate-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                      <button
                        onClick={() => removeLanguage(idx)}
                        className="text-xs text-red-600 hover:text-red-700 font-medium px-2"
                      >
                        Sil
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Certifications */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Sertifikalar (Bulundu: {editedData.certifications.length})
                </label>
                {editedData.certifications.length > 0 && (
                  <div className="space-y-2">
                    {editedData.certifications.map((cert, idx) => (
                      <div key={idx} className="bg-slate-50 p-2 rounded text-sm">
                        <p className="font-medium text-slate-700">{cert.name}</p>
                        <p className="text-slate-600">{cert.issuer}</p>
                        {cert.date && <p className="text-slate-500">{cert.date}</p>}
                      </div>
                    ))}
                  </div>
                )}
                {editedData.certifications.length === 0 && (
                  <p className="text-sm text-slate-500">Sertifika bulunamadı.</p>
                )}
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-4">
                <button
                  onClick={handleClose}
                  className="flex-1 px-4 py-2 border border-slate-300 text-slate-700 font-medium rounded-lg hover:bg-slate-50 transition-colors"
                >
                  İptal Et
                </button>
                <button
                  onClick={handleSaveAnalysis}
                  className="flex-1 px-4 py-2 bg-emerald-600 text-white font-medium rounded-lg hover:bg-emerald-700 transition-colors flex items-center justify-center gap-2"
                >
                  <Save className="h-4 w-4" />
                  Profili Kaydet
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CVAnalysisModal;
