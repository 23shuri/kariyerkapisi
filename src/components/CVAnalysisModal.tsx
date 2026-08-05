import { useState, useRef } from 'react';
import { X, Upload, Loader, Check, AlertCircle, Save, FileText, Sparkles } from 'lucide-react';
import {
  CVAnalysisResult,
  EducationExtracted,
  ExperienceExtracted,
  LanguageExtracted,
  CertificationExtracted,
} from '../types';

interface CVAnalysisModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAnalysisComplete: (result: CVAnalysisResult) => void;
  candidateId: string;
}

// ─── PDF Text Extraction via pdf.js ───────────────────────────────────────────
async function extractTextFromPDF(file: File): Promise<string> {
  try {
    const arrayBuffer = await file.arrayBuffer();
    // Dynamically import pdfjs to avoid build issues
    const pdfjsLib = await import('pdfjs-dist');
    // Use local worker to avoid CDN dependency
    pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
      'pdfjs-dist/build/pdf.worker.min.mjs',
      import.meta.url
    ).toString();

    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    let fullText = '';

    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const content = await page.getTextContent();
      const pageText = content.items
        .map((item: any) => item.str)
        .join(' ');
      fullText += pageText + '\n';
    }

    return fullText.trim();
  } catch (err) {
    console.error('PDF extraction failed:', err);
    throw new Error('PDF okunamadı. Lütfen geçerli bir PDF dosyası yükleyin.');
  }
}

// ─── Heuristic Analysis (no backend needed) ───────────────────────────────────
function analyzeTextHeuristic(text: string): CVAnalysisResult['data'] {
  const lower = text.toLowerCase();
  const lines = text.split('\n').map(l => l.trim()).filter(Boolean);

  // Skills
  const SKILL_LIST = [
    'react', 'angular', 'vue', 'next.js', 'svelte',
    'typescript', 'javascript', 'html', 'css', 'tailwind', 'bootstrap', 'sass',
    'node.js', 'express', 'nestjs', 'fastapi', 'django', 'flask', 'spring boot',
    'python', 'java', 'c#', 'c++', 'go', 'rust', 'php', 'swift', 'kotlin', 'ruby',
    'sql', 'postgresql', 'mysql', 'mongodb', 'redis', 'elasticsearch',
    'docker', 'kubernetes', 'aws', 'azure', 'gcp', 'terraform', 'ansible',
    'git', 'github', 'gitlab', 'ci/cd', 'jenkins', 'linux', 'bash',
    'figma', 'photoshop', 'illustrator', 'sketch',
    'machine learning', 'deep learning', 'tensorflow', 'pytorch', 'pandas', 'numpy', 'scikit-learn',
    'graphql', 'rest api', 'microservices', 'agile', 'scrum', 'jira',
  ];
  const skills = SKILL_LIST.filter(s => lower.includes(s)).map(s =>
    s.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
  );

  // Languages
  const LANG_MAP: Record<string, string> = {
    'english': 'English', 'ingilizce': 'English',
    'turkish': 'Turkish', 'türkçe': 'Turkish',
    'german': 'German', 'almanca': 'German', 'deutsch': 'German',
    'french': 'French', 'fransızca': 'French',
    'spanish': 'Spanish', 'ispanyolca': 'Spanish',
    'italian': 'Italian', 'italyanca': 'Italian',
    'russian': 'Russian', 'rusça': 'Russian',
    'arabic': 'Arabic', 'arapça': 'Arabic',
    'chinese': 'Chinese', 'çince': 'Chinese',
    'japanese': 'Japanese', 'japonca': 'Japanese',
  };
  const LEVEL_KEYWORDS: Record<string, string> = {
    native: 'Native', 'ana dil': 'Native', 'mother tongue': 'Native',
    advanced: 'Advanced', 'ileri': 'Advanced', 'c1': 'Advanced', 'c2': 'Advanced',
    intermediate: 'Intermediate', 'orta': 'Intermediate', 'b1': 'Intermediate', 'b2': 'Intermediate',
    beginner: 'Beginner', 'başlangıç': 'Beginner', 'a1': 'Beginner', 'a2': 'Beginner',
  };

  const languages: LanguageExtracted[] = [];
  const seenLangs = new Set<string>();

  for (const line of lines) {
    const lineLow = line.toLowerCase();
    for (const [key, langName] of Object.entries(LANG_MAP)) {
      if (lineLow.includes(key) && !seenLangs.has(langName)) {
        let level = 'Intermediate';
        for (const [lvlKey, lvlVal] of Object.entries(LEVEL_KEYWORDS)) {
          if (lineLow.includes(lvlKey)) { level = lvlVal; break; }
        }
        languages.push({ name: langName, level });
        seenLangs.add(langName);
      }
    }
  }

  // Education — find section
  const education: EducationExtracted[] = [];
  const EDU_MARKERS = ['education', 'eğitim', 'öğrenim', 'academic'];
  let inEdu = false;
  const EDU_LEVELS: Record<string, string> = {
    bachelor: 'Lisans', 'lisans': 'Lisans', 'b.sc': 'Lisans', 'b.s.': 'Lisans',
    master: 'Yüksek Lisans', 'yüksek lisans': 'Yüksek Lisans', 'm.sc': 'Yüksek Lisans',
    phd: 'Doktora', 'doctorate': 'Doktora', 'doktora': 'Doktora',
    high: 'Lise', 'lise': 'Lise', 'high school': 'Lise',
    college: 'Ön Lisans', 'ön lisans': 'Ön Lisans', 'associate': 'Ön Lisans',
    university: 'Lisans', 'üniversite': 'Lisans',
  };
  const SECTION_ENDINGS = ['experience', 'iş deneyimi', 'deneyim', 'skills', 'beceri', 'certification', 'projects', 'references'];

  for (let i = 0; i < lines.length; i++) {
    const lineLow = lines[i].toLowerCase();
    if (EDU_MARKERS.some(m => lineLow.includes(m))) { inEdu = true; continue; }
    if (inEdu && SECTION_ENDINGS.some(m => lineLow.includes(m))) { inEdu = false; continue; }
    if (inEdu && lines[i].length > 5) {
      let level = 'Lisans';
      for (const [k, v] of Object.entries(EDU_LEVELS)) {
        if (lineLow.includes(k)) { level = v; break; }
      }
      const yearMatch = lines[i].match(/\b(19|20)\d{2}\b/);
      education.push({
        level,
        school: lines[i],
        field: lines[i + 1] && lines[i + 1].length < 60 ? lines[i + 1] : '',
        year: yearMatch ? yearMatch[0] : '',
      });
      if (education.length >= 4) break;
    }
  }

  // Experience — find section
  const experience: ExperienceExtracted[] = [];
  const EXP_MARKERS = ['experience', 'iş deneyimi', 'deneyim', 'work history', 'employment'];
  let inExp = false;
  const EXP_ENDINGS = ['education', 'eğitim', 'skills', 'beceri', 'certification', 'projects', 'references'];

  let expBuffer: string[] = [];
  for (let i = 0; i < lines.length; i++) {
    const lineLow = lines[i].toLowerCase();
    if (EXP_MARKERS.some(m => lineLow.includes(m))) { inExp = true; continue; }
    if (inExp && EXP_ENDINGS.some(m => lineLow.includes(m))) {
      if (expBuffer.length >= 2) {
        experience.push({
          company: expBuffer[0],
          position: expBuffer[1] || '',
          duration: expBuffer.find(l => /\d{4}/.test(l)) || '',
          description: expBuffer.slice(2, 5).join(' '),
        });
      }
      inExp = false;
      continue;
    }
    if (inExp) {
      const isDivider = lines[i].length < 3 || lines[i] === '—' || lines[i] === '•';
      if (isDivider && expBuffer.length >= 2) {
        experience.push({
          company: expBuffer[0],
          position: expBuffer[1] || '',
          duration: expBuffer.find(l => /\d{4}/.test(l)) || '',
          description: expBuffer.slice(2, 5).join(' '),
        });
        expBuffer = [];
        if (experience.length >= 6) { inExp = false; break; }
      } else if (!isDivider) {
        expBuffer.push(lines[i]);
      }
    }
  }

  // Certifications
  const certifications: CertificationExtracted[] = [];
  const CERT_MARKERS = ['certification', 'sertifika', 'certificate', 'license', 'credential'];
  let inCert = false;
  for (let i = 0; i < lines.length; i++) {
    const lineLow = lines[i].toLowerCase();
    if (CERT_MARKERS.some(m => lineLow.includes(m))) { inCert = true; continue; }
    if (inCert && SECTION_ENDINGS.some(m => lineLow.includes(m))) { inCert = false; continue; }
    if (inCert && lines[i].length > 5) {
      const yearMatch = lines[i].match(/\b(19|20)\d{2}\b/);
      certifications.push({
        name: lines[i],
        issuer: lines[i + 1]?.length < 50 ? lines[i + 1] || '' : '',
        date: yearMatch ? yearMatch[0] : '',
      });
      if (certifications.length >= 6) break;
    }
  }

  // Summary — first meaningful paragraph
  const summary = lines.slice(0, 8).join(' ').substring(0, 400);

  return { education, experience, skills, languages, certifications, summary };
}

// ─── Component ─────────────────────────────────────────────────────────────────
export const CVAnalysisModal: React.FC<CVAnalysisModalProps> = ({
  isOpen, onClose, onAnalysisComplete, candidateId,
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<CVAnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [editedData, setEditedData] = useState<NonNullable<CVAnalysisResult['data']> | null>(null);

  // ── Helpers ──────────────────────────────────────────────────────────────────
  const reset = () => {
    setFile(null); setIsAnalyzing(false); setResult(null);
    setError(null); setEditedData(null);
    if (inputRef.current) inputRef.current.value = '';
  };

  const handleClose = () => { reset(); onClose(); };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    const f = e.target.files?.[0];
    if (!f) return;
    if (!f.name.toLowerCase().endsWith('.pdf')) {
      setError('Sadece PDF dosyası desteklenmektedir.');
      e.target.value = '';
      return;
    }
    if (f.size > 10 * 1024 * 1024) {
      setError('Dosya boyutu 10 MB\'dan büyük olamaz.');
      e.target.value = '';
      return;
    }
    setFile(f);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setError(null);
    const f = e.dataTransfer.files?.[0];
    if (!f) return;
    if (!f.name.toLowerCase().endsWith('.pdf')) {
      setError('Sadece PDF dosyası desteklenmektedir.');
      return;
    }
    setFile(f);
  };

  const handleAnalyze = async () => {
    if (!file) return;
    setIsAnalyzing(true);
    setError(null);
    try {
      const text = await extractTextFromPDF(file);
      if (!text || text.length < 30) throw new Error('PDF içeriği okunamadı veya çok kısa.');
      const data = analyzeTextHeuristic(text);
      setResult({ success: true, data });
      setEditedData(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Analiz sırasında hata oluştu.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSave = () => {
    if (!editedData) return;
    onAnalysisComplete({ success: true, data: editedData });
    handleClose();
  };

  const updateEdu = (i: number, k: keyof EducationExtracted, v: string) => {
    if (!editedData) return;
    const arr = [...editedData.education];
    arr[i] = { ...arr[i], [k]: v };
    setEditedData({ ...editedData, education: arr });
  };
  const removeEdu = (i: number) => {
    if (!editedData) return;
    setEditedData({ ...editedData, education: editedData.education.filter((_, idx) => idx !== i) });
  };

  const updateExp = (i: number, k: keyof ExperienceExtracted, v: string) => {
    if (!editedData) return;
    const arr = [...editedData.experience];
    arr[i] = { ...arr[i], [k]: v };
    setEditedData({ ...editedData, experience: arr });
  };
  const removeExp = (i: number) => {
    if (!editedData) return;
    setEditedData({ ...editedData, experience: editedData.experience.filter((_, idx) => idx !== i) });
  };

  const updateLang = (i: number, k: keyof LanguageExtracted, v: string) => {
    if (!editedData) return;
    const arr = [...editedData.languages];
    arr[i] = { ...arr[i], [k]: v };
    setEditedData({ ...editedData, languages: arr });
  };
  const removeLang = (i: number) => {
    if (!editedData) return;
    setEditedData({ ...editedData, languages: editedData.languages.filter((_, idx) => idx !== i) });
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4"
      onClick={(e) => { if (e.target === e.currentTarget) handleClose(); }}
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-t-2xl">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-white" />
            <h2 className="text-lg font-bold text-white">CV'yi Otomatik Analiz Et</h2>
          </div>
          <button onClick={handleClose} className="p-1.5 hover:bg-white/20 rounded-lg transition">
            <X className="h-5 w-5 text-white" />
          </button>
        </div>

        {/* Body — scrollable */}
        <div className="overflow-y-auto flex-1 p-6 space-y-5">
          {/* ── STEP 1: Upload ── */}
          {!result && (
            <>
              {/* Drop zone */}
              <div
                onDrop={handleDrop}
                onDragOver={(e) => e.preventDefault()}
                onClick={() => inputRef.current?.click()}
                className="border-2 border-dashed border-slate-300 rounded-xl p-10 text-center cursor-pointer hover:border-purple-400 hover:bg-purple-50 transition-colors"
              >
                <input
                  ref={inputRef}
                  type="file"
                  accept=".pdf"
                  className="hidden"
                  onChange={handleFileChange}
                />
                <Upload className="h-10 w-10 text-slate-400 mx-auto mb-3" />
                {file ? (
                  <div className="flex items-center justify-center gap-2">
                    <FileText className="h-5 w-5 text-purple-600" />
                    <span className="text-sm font-medium text-purple-700">{file.name}</span>
                    <span className="text-xs text-slate-500">({(file.size / 1024).toFixed(0)} KB)</span>
                  </div>
                ) : (
                  <>
                    <p className="text-sm font-medium text-slate-700">PDF CV'nizi buraya sürükleyin veya tıklayın</p>
                    <p className="text-xs text-slate-500 mt-1">Maksimum 10 MB · Sadece PDF</p>
                  </>
                )}
              </div>

              {error && (
                <div className="flex items-start gap-3 bg-red-50 border border-red-200 rounded-lg p-4">
                  <AlertCircle className="h-4 w-4 text-red-500 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              )}

              <div className="flex gap-3">
                <button onClick={handleClose} className="flex-1 py-2.5 border border-slate-300 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 transition">
                  İptal
                </button>
                <button
                  onClick={handleAnalyze}
                  disabled={!file || isAnalyzing}
                  className="flex-1 py-2.5 bg-purple-600 hover:bg-purple-700 disabled:bg-slate-300 text-white rounded-lg text-sm font-medium transition flex items-center justify-center gap-2"
                >
                  {isAnalyzing ? (
                    <><Loader className="h-4 w-4 animate-spin" />Analiz ediliyor...</>
                  ) : (
                    <><Sparkles className="h-4 w-4" />Analiz Et</>
                  )}
                </button>
              </div>
            </>
          )}

          {/* ── STEP 2: Review & Edit ── */}
          {result && editedData && (
            <>
              <div className="flex items-start gap-3 bg-emerald-50 border border-emerald-200 rounded-lg p-4">
                <Check className="h-4 w-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-emerald-700">CV başarıyla analiz edildi. Bilgileri kontrol edip düzenleyebilirsiniz.</p>
              </div>

              {/* Summary */}
              <Section title="Özet">
                <textarea
                  rows={3}
                  value={editedData.summary}
                  onChange={(e) => setEditedData({ ...editedData, summary: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-400 resize-none"
                  placeholder="Kısa özet..."
                />
              </Section>

              {/* Skills */}
              <Section title={`Yetenekler (${editedData.skills.length} tespit edildi)`}>
                <textarea
                  rows={2}
                  value={editedData.skills.join(', ')}
                  onChange={(e) =>
                    setEditedData({ ...editedData, skills: e.target.value.split(',').map(s => s.trim()).filter(Boolean) })
                  }
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-400 resize-none"
                  placeholder="React, TypeScript, Python..."
                />
              </Section>

              {/* Education */}
              <Section
                title={`Eğitim (${editedData.education.length})`}
                onAdd={() => setEditedData({ ...editedData, education: [...editedData.education, { level: '', school: '', field: '', year: '' }] })}
              >
                {editedData.education.length === 0 && (
                  <p className="text-sm text-slate-500 italic">Bulunamadı. Manuel ekleyebilirsiniz.</p>
                )}
                {editedData.education.map((edu, i) => (
                  <div key={i} className="bg-slate-50 rounded-lg p-3 space-y-2">
                    <div className="grid grid-cols-2 gap-2">
                      <input value={edu.level} onChange={(e) => updateEdu(i, 'level', e.target.value)} placeholder="Seviye (Lisans, Master…)" className={inputCls} />
                      <input value={edu.school} onChange={(e) => updateEdu(i, 'school', e.target.value)} placeholder="Okul / Üniversite" className={inputCls} />
                      <input value={edu.field} onChange={(e) => updateEdu(i, 'field', e.target.value)} placeholder="Bölüm" className={inputCls} />
                      <input value={edu.year} onChange={(e) => updateEdu(i, 'year', e.target.value)} placeholder="Yıl" className={inputCls} />
                    </div>
                    <button onClick={() => removeEdu(i)} className="text-xs text-red-500 hover:text-red-700">Kaldır</button>
                  </div>
                ))}
              </Section>

              {/* Experience */}
              <Section
                title={`İş Deneyimi (${editedData.experience.length})`}
                onAdd={() => setEditedData({ ...editedData, experience: [...editedData.experience, { company: '', position: '', duration: '', description: '' }] })}
              >
                {editedData.experience.length === 0 && (
                  <p className="text-sm text-slate-500 italic">Bulunamadı. Manuel ekleyebilirsiniz.</p>
                )}
                {editedData.experience.map((exp, i) => (
                  <div key={i} className="bg-slate-50 rounded-lg p-3 space-y-2">
                    <div className="grid grid-cols-2 gap-2">
                      <input value={exp.company} onChange={(e) => updateExp(i, 'company', e.target.value)} placeholder="Şirket" className={inputCls} />
                      <input value={exp.position} onChange={(e) => updateExp(i, 'position', e.target.value)} placeholder="Pozisyon" className={inputCls} />
                    </div>
                    <input value={exp.duration} onChange={(e) => updateExp(i, 'duration', e.target.value)} placeholder="Süre (2020–2023)" className={`w-full ${inputCls}`} />
                    <textarea value={exp.description || ''} onChange={(e) => updateExp(i, 'description', e.target.value)} placeholder="Açıklama" rows={2} className={`w-full ${inputCls} resize-none`} />
                    <button onClick={() => removeExp(i)} className="text-xs text-red-500 hover:text-red-700">Kaldır</button>
                  </div>
                ))}
              </Section>

              {/* Languages */}
              <Section
                title={`Yabancı Diller (${editedData.languages.length})`}
                onAdd={() => setEditedData({ ...editedData, languages: [...editedData.languages, { name: '', level: '' }] })}
              >
                {editedData.languages.length === 0 && (
                  <p className="text-sm text-slate-500 italic">Bulunamadı. Manuel ekleyebilirsiniz.</p>
                )}
                {editedData.languages.map((lang, i) => (
                  <div key={i} className="flex gap-2 items-center bg-slate-50 rounded-lg p-2">
                    <input value={lang.name} onChange={(e) => updateLang(i, 'name', e.target.value)} placeholder="Dil" className={`flex-1 ${inputCls}`} />
                    <select value={lang.level} onChange={(e) => updateLang(i, 'level', e.target.value)} className={`flex-1 ${inputCls} bg-white`}>
                      <option value="">Seviye seç</option>
                      <option>Native</option>
                      <option>Advanced</option>
                      <option>Intermediate</option>
                      <option>Beginner</option>
                    </select>
                    <button onClick={() => removeLang(i)} className="text-xs text-red-500 hover:text-red-700 px-1">✕</button>
                  </div>
                ))}
              </Section>

              {/* Certifications */}
              {editedData.certifications.length > 0 && (
                <Section title={`Sertifikalar (${editedData.certifications.length})`}>
                  {editedData.certifications.map((cert, i) => (
                    <div key={i} className="bg-slate-50 rounded p-2 text-sm">
                      <p className="font-medium text-slate-700">{cert.name}</p>
                      {cert.issuer && <p className="text-slate-500 text-xs">{cert.issuer}</p>}
                    </div>
                  ))}
                </Section>
              )}

              {/* Actions */}
              <div className="flex gap-3 pt-2">
                <button onClick={() => { setResult(null); setEditedData(null); }} className="flex-1 py-2.5 border border-slate-300 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 transition">
                  Geri Dön
                </button>
                <button onClick={handleSave} className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-semibold transition flex items-center justify-center gap-2">
                  <Save className="h-4 w-4" />Profili Kaydet
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

// ── Small helpers ──────────────────────────────────────────────────────────────
const inputCls = 'px-2.5 py-1.5 border border-slate-200 rounded text-sm focus:outline-none focus:ring-2 focus:ring-purple-400';

function Section({
  title, children, onAdd,
}: { title: string; children: React.ReactNode; onAdd?: () => void }) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-slate-700">{title}</h3>
        {onAdd && (
          <button onClick={onAdd} className="text-xs bg-purple-100 text-purple-700 px-2.5 py-1 rounded-full hover:bg-purple-200 transition">
            + Ekle
          </button>
        )}
      </div>
      <div className="space-y-2">{children}</div>
    </div>
  );
}

export default CVAnalysisModal;
