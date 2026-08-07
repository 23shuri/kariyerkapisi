import { useState, useRef } from 'react';
import { X, Upload, Loader, Check, AlertCircle, Save, FileText, Sparkles, Key } from 'lucide-react';
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

// ─── PDF Text Extraction via pdf.js ────────────────────────────────────────────
async function extractTextFromPDF(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();
  const pdfjsLib = await import('pdfjs-dist');
  pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
    'pdfjs-dist/build/pdf.worker.min.mjs',
    import.meta.url
  ).toString();

  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  let fullText = '';
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    // Preserve line structure by grouping items by y-position
    const itemsByY: Record<number, string[]> = {};
    for (const item of content.items as any[]) {
      const y = Math.round(item.transform[5]);
      if (!itemsByY[y]) itemsByY[y] = [];
      itemsByY[y].push(item.str);
    }
    const sortedYs = Object.keys(itemsByY).map(Number).sort((a, b) => b - a);
    for (const y of sortedYs) {
      fullText += itemsByY[y].join(' ') + '\n';
    }
  }
  return fullText.trim();
}

// ─── Gemini API Analysis ────────────────────────────────────────────────────────
async function analyzeWithGemini(text: string, apiKey: string): Promise<CVAnalysisResult['data']> {
  const { GoogleGenerativeAI } = await import('@google/generative-ai');
  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

  const prompt = `Aşağıdaki CV metnini analiz et ve SADECE şu JSON formatında yanıt ver, başka hiçbir şey yazma:

{
  "education": [{"level":"Lisans/Lise/Master/Doktora","school":"Okul adı","field":"Bölüm","year":"Yıl"}],
  "experience": [{"company":"Şirket","position":"Pozisyon","duration":"2020-2023","description":"Açıklama"}],
  "skills": ["Skill1","Skill2"],
  "languages": [{"name":"Dil","level":"Native/Advanced/Intermediate/Beginner"}],
  "certifications": [{"name":"Sertifika","issuer":"Kurum","date":"Yıl"}],
  "summary": "Kısa özet"
}

CV Metni:
${text.substring(0, 8000)}`;

  const result = await model.generateContent(prompt);
  const raw = result.response.text().trim();
  const jsonMatch = raw.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error('Gemini yanıt formatı hatalı');
  return JSON.parse(jsonMatch[0]);
}

// ─── Gelişmiş Heuristic (section-free, çok dilli) ──────────────────────────────
function analyzeHeuristic(text: string): CVAnalysisResult['data'] {
  const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0);
  const lower = text.toLowerCase();

  // ── Skills: tüm metni tara ─────────────────────────────────────────────────
  const SKILLS = [
    'react','angular','vue','next.js','nuxt','svelte','gatsby',
    'typescript','javascript','html','css','sass','tailwind','bootstrap','material ui',
    'node.js','express','nestjs','fastapi','django','flask','laravel','spring','asp.net',
    'python','java','c#','c++','c','go','rust','php','swift','kotlin','ruby','scala','r',
    'sql','postgresql','mysql','sqlite','mongodb','redis','elasticsearch','cassandra','firebase',
    'docker','kubernetes','aws','azure','gcp','terraform','ansible','nginx','linux','bash','shell',
    'git','github','gitlab','bitbucket','ci/cd','jenkins','github actions',
    'figma','photoshop','illustrator','sketch','xd','invision',
    'machine learning','deep learning','nlp','computer vision',
    'tensorflow','pytorch','keras','scikit-learn','pandas','numpy','matplotlib','opencv',
    'graphql','rest','soap','websocket','oauth','jwt',
    'agile','scrum','kanban','jira','confluence','trello',
    'excel','word','powerpoint','outlook','ms office',
    'unity','unreal','blender',
    'sap','salesforce','tableau','power bi',
  ];
  const foundSkills = SKILLS.filter(s => lower.includes(s));
  // Ayrıca skills section'ından parse et
  const skillsSection = extractSection(lines, ['skills','beceri','yetenek','teknoloji','technical','tools','competenc']);
  const extraSkills: string[] = [];
  for (const line of skillsSection) {
    const parts = line.split(/[,|•·\-\/]/);
    for (const p of parts) {
      const trimmed = p.trim();
      if (trimmed.length > 1 && trimmed.length < 40 && !trimmed.match(/^\d+$/)) {
        extraSkills.push(trimmed);
      }
    }
  }
  const allSkills = [...new Set([...foundSkills.map(s => toTitleCase(s)), ...extraSkills])].slice(0, 25);

  // ── Languages ────────────────────────────────────────────────────────────────
  const LANG_KEYS: Record<string, string> = {
    'english':'English','ingilizce':'English','İngilizce':'English',
    'turkish':'Turkish','türkçe':'Turkish','Türkçe':'Turkish',
    'german':'German','almanca':'German','deutsch':'German','Almanca':'German',
    'french':'French','fransızca':'French','Fransızca':'French',
    'spanish':'Spanish','ispanyolca':'Spanish',
    'italian':'Italian','italyanca':'Italian',
    'russian':'Russian','rusça':'Russian',
    'arabic':'Arabic','arapça':'Arabic',
    'chinese':'Chinese','çince':'Chinese',
    'japanese':'Japanese','japonca':'Japanese',
    'korean':'Korean','korece':'Korean',
    'portuguese':'Portuguese','portekizce':'Portuguese',
    'dutch':'Dutch','flemenkçe':'Dutch',
  };
  const LEVELS: [RegExp, string][] = [
    [/\b(native|ana\s*dil|mother\s*tongue|anadil)\b/i,'Native'],
    [/\b(c2|proficient|akıcı|fluent)\b/i,'Advanced'],
    [/\b(c1|advanced|ileri)\b/i,'Advanced'],
    [/\b(b2|upper.?intermediate|iyi)\b/i,'Intermediate'],
    [/\b(b1|intermediate|orta)\b/i,'Intermediate'],
    [/\b(a2|elementary|başlangıç\s*üstü)\b/i,'Beginner'],
    [/\b(a1|beginner|başlangıç|temel)\b/i,'Beginner'],
  ];
  const languages: LanguageExtracted[] = [];
  const seenL = new Set<string>();
  for (const line of lines) {
    const ll = line.toLowerCase();
    for (const [key, name] of Object.entries(LANG_KEYS)) {
      if (ll.includes(key.toLowerCase()) && !seenL.has(name)) {
        let level = 'Intermediate';
        for (const [re, lv] of LEVELS) { if (re.test(line)) { level = lv; break; } }
        languages.push({ name, level });
        seenL.add(name);
      }
    }
  }

  // ── Education ────────────────────────────────────────────────────────────────
  const eduSection = extractSection(lines, ['education','eğitim','öğrenim','akademik','academic background','qualifications']);
  const education: EducationExtracted[] = [];
  const EDU_DEGREE: [RegExp, string][] = [
    [/\b(phd|ph\.d|doctorate|doktora)\b/i,'Doktora'],
    [/\b(master|m\.sc|m\.s\.|yüksek\s*lisans|mba)\b/i,'Yüksek Lisans'],
    [/\b(bachelor|b\.sc|b\.s\.|lisans|undergraduate|üniversite)\b/i,'Lisans'],
    [/\b(associate|ön\s*lisans|college)\b/i,'Ön Lisans'],
    [/\b(high\s*school|lise|ortaöğretim|anadolu|fen\s*lisesi|imam)\b/i,'Lise'],
    [/\b(middle\s*school|ortaokul)\b/i,'Ortaokul'],
    [/\b(primary|ilkokul)\b/i,'İlkokul'],
  ];
  // Tüm metinde de ara
  const eduLines = eduSection.length > 0 ? eduSection : lines;
  for (let i = 0; i < eduLines.length && education.length < 5; i++) {
    const line = eduLines[i];
    let degree = '';
    for (const [re, d] of EDU_DEGREE) { if (re.test(line)) { degree = d; break; } }
    if (!degree) continue;
    const yearM = line.match(/\b(19|20)\d{2}\b/);
    const year = yearM ? yearM[0] : '';
    // school: satırdaki uzun kelimeler ya da bir sonraki satır
    let school = line;
    let field = '';
    if (i + 1 < eduLines.length && eduLines[i+1].length < 80) field = eduLines[i+1];
    education.push({ level: degree, school, field, year });
  }

  // ── Experience ───────────────────────────────────────────────────────────────
  const expSection = extractSection(lines, ['experience','deneyim','iş deneyimi','work history','employment','career','çalışma','professional']);
  const experience: ExperienceExtracted[] = [];
  const DATE_RANGE = /\b(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec|oca|şub|mar|nis|may|haz|tem|ağu|eyl|eki|kas|ara)[\s.,-]*(19|20)\d{2}|\b(19|20)\d{2}\s*[-–—]\s*((19|20)\d{2}|present|günümüz|halen|devam|current)/i;
  const expLines = expSection.length > 2 ? expSection : lines;

  let i = 0;
  while (i < expLines.length && experience.length < 8) {
    const line = expLines[i];
    const hasDate = DATE_RANGE.test(line) || (i + 1 < expLines.length && DATE_RANGE.test(expLines[i+1]));
    // Şirket satırı: date içeriyor veya büyük harf başlıyor ve kısa
    const looksLikeCompanyOrRole = hasDate || (line.length < 80 && /[A-ZÇĞİÖŞÜA-Z]/.test(line[0] || ''));
    if (looksLikeCompanyOrRole && line.length > 3) {
      const company = line;
      const position = (i+1 < expLines.length && !DATE_RANGE.test(expLines[i+1])) ? expLines[i+1] : '';
      const durationLine = expLines.slice(i, i+4).find(l => DATE_RANGE.test(l)) || '';
      const descLines: string[] = [];
      let j = i + (position ? 2 : 1);
      while (j < expLines.length && descLines.length < 3) {
        if (DATE_RANGE.test(expLines[j]) && j > i+1) break;
        if (expLines[j].length > 10) descLines.push(expLines[j]);
        j++;
      }
      experience.push({ company, position, duration: durationLine, description: descLines.join(' ') });
      i = j;
    } else {
      i++;
    }
  }

  // ── Certifications ───────────────────────────────────────────────────────────
  const certSection = extractSection(lines, ['certification','sertifika','certificate','lisans','license','credential','award']);
  const certifications: CertificationExtracted[] = [];
  for (const line of certSection) {
    if (line.length > 5) {
      const yearM = line.match(/\b(19|20)\d{2}\b/);
      certifications.push({ name: line, issuer: '', date: yearM ? yearM[0] : '' });
      if (certifications.length >= 8) break;
    }
  }

  // ── Summary ──────────────────────────────────────────────────────────────────
  const summarySection = extractSection(lines, ['summary','özet','profil','profile','about','hakkımda','objective','objective']);
  const summary = summarySection.length > 0
    ? summarySection.slice(0, 5).join(' ').substring(0, 500)
    : lines.slice(0, 6).join(' ').substring(0, 400);

  return { education, experience, skills: allSkills, languages, certifications, summary };
}

// Belirli section başlıklarından sonraki satırları toplar
function extractSection(lines: string[], markers: string[]): string[] {
  let start = -1;
  for (let i = 0; i < lines.length; i++) {
    const ll = lines[i].toLowerCase().trim();
    if (markers.some(m => ll === m || ll.startsWith(m + ' ') || ll.startsWith(m + ':') || ll.includes(m))) {
      start = i + 1;
      break;
    }
  }
  if (start < 0) return [];
  // Bir sonraki BÜYÜK section başlığına kadar al
  const ALL_SECTIONS = ['education','eğitim','experience','deneyim','skills','beceri',
    'certification','sertifika','language','dil','project','proje','reference','award',
    'summary','özet','profil','profile','contact','iletişim','about','hakkımda','objective'];
  const result: string[] = [];
  for (let i = start; i < lines.length; i++) {
    const ll = lines[i].toLowerCase().trim();
    if (ALL_SECTIONS.some(s => (ll === s || ll === s + 's') && i > start)) break;
    if (lines[i].length > 0) result.push(lines[i]);
    if (result.length > 30) break;
  }
  return result;
}

function toTitleCase(s: string): string {
  return s.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
}

// ─── Component ──────────────────────────────────────────────────────────────────
export const CVAnalysisModal: React.FC<CVAnalysisModalProps> = ({
  isOpen, onClose, onAnalysisComplete, candidateId,
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<CVAnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [editedData, setEditedData] = useState<NonNullable<CVAnalysisResult['data']> | null>(null);
  const [geminiKey, setGeminiKey] = useState(() => localStorage.getItem('kk_gemini_key') || '');
  const [showKeyInput, setShowKeyInput] = useState(false);
  const [rawText, setRawText] = useState('');

  const reset = () => {
    setFile(null); setIsAnalyzing(false); setResult(null);
    setError(null); setEditedData(null); setRawText('');
    if (inputRef.current) inputRef.current.value = '';
  };
  const handleClose = () => { reset(); onClose(); };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    const f = e.target.files?.[0];
    if (!f) return;
    if (!f.name.toLowerCase().endsWith('.pdf')) { setError('Sadece PDF desteklenmektedir.'); e.target.value = ''; return; }
    if (f.size > 10 * 1024 * 1024) { setError('Dosya 10 MB\'dan büyük olamaz.'); e.target.value = ''; return; }
    setFile(f);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault(); setError(null);
    const f = e.dataTransfer.files?.[0];
    if (!f) return;
    if (!f.name.toLowerCase().endsWith('.pdf')) { setError('Sadece PDF desteklenmektedir.'); return; }
    setFile(f);
  };

  const handleAnalyze = async () => {
    if (!file) return;
    setIsAnalyzing(true); setError(null);
    try {
      const text = await extractTextFromPDF(file);
      if (!text || text.length < 20) throw new Error('PDF içeriği okunamadı. Taranmış (görüntü) PDF olabilir.');
      setRawText(text);
      let data: CVAnalysisResult['data'];
      if (geminiKey.trim()) {
        try {
          data = await analyzeWithGemini(text, geminiKey.trim());
          localStorage.setItem('kk_gemini_key', geminiKey.trim());
        } catch (aiErr) {
          console.warn('Gemini failed, falling back to heuristic:', aiErr);
          data = analyzeHeuristic(text);
        }
      } else {
        data = analyzeHeuristic(text);
      }
      setResult({ success: true, data });
      setEditedData(data!);
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

  const upd = <T extends object>(arr: T[], i: number, k: keyof T, v: string): T[] => {
    const a = [...arr]; a[i] = { ...a[i], [k]: v }; return a;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4"
      onClick={(e) => { if (e.target === e.currentTarget) handleClose(); }}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-t-2xl">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-white" />
            <h2 className="text-lg font-bold text-white">CV'yi Otomatik Analiz Et</h2>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => setShowKeyInput(!showKeyInput)}
              title="Gemini API Key ekle (daha iyi analiz)"
              className={`p-1.5 rounded-lg transition ${geminiKey ? 'bg-yellow-400 hover:bg-yellow-300' : 'hover:bg-white/20'}`}>
              <Key className="h-4 w-4 text-white" />
            </button>
            <button onClick={handleClose} className="p-1.5 hover:bg-white/20 rounded-lg transition">
              <X className="h-5 w-5 text-white" />
            </button>
          </div>
        </div>

        {/* Gemini Key Input */}
        {showKeyInput && (
          <div className="px-6 py-3 bg-yellow-50 border-b border-yellow-200 flex gap-2 items-center">
            <Key className="h-4 w-4 text-yellow-600 flex-shrink-0" />
            <input
              type="password"
              value={geminiKey}
              onChange={(e) => setGeminiKey(e.target.value)}
              placeholder="Gemini API Key (isteğe bağlı — daha iyi analiz)"
              className="flex-1 text-xs px-2 py-1.5 border border-yellow-300 rounded focus:outline-none focus:ring-1 focus:ring-yellow-400"
            />
            <button onClick={() => { localStorage.setItem('kk_gemini_key', geminiKey); setShowKeyInput(false); }}
              className="text-xs bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1.5 rounded transition">
              Kaydet
            </button>
          </div>
        )}

        {/* Body */}
        <div className="overflow-y-auto flex-1 p-6 space-y-5">
          {!result && (
            <>
              <div onDrop={handleDrop} onDragOver={(e) => e.preventDefault()}
                onClick={() => inputRef.current?.click()}
                className="border-2 border-dashed border-slate-300 rounded-xl p-10 text-center cursor-pointer hover:border-purple-400 hover:bg-purple-50 transition-colors">
                <input ref={inputRef} type="file" accept=".pdf" className="hidden" onChange={handleFileChange} />
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
                    {!geminiKey && <p className="text-xs text-purple-600 mt-2">💡 Gemini API key eklerseniz çok daha iyi analiz elde edersiniz</p>}
                    {geminiKey && <p className="text-xs text-emerald-600 mt-2">✅ Gemini AI aktif — mükemmel analiz</p>}
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
                <button onClick={handleClose} className="flex-1 py-2.5 border border-slate-300 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 transition">İptal</button>
                <button onClick={handleAnalyze} disabled={!file || isAnalyzing}
                  className="flex-1 py-2.5 bg-purple-600 hover:bg-purple-700 disabled:bg-slate-300 text-white rounded-lg text-sm font-medium transition flex items-center justify-center gap-2">
                  {isAnalyzing ? <><Loader className="h-4 w-4 animate-spin" />Analiz ediliyor...</> : <><Sparkles className="h-4 w-4" />Analiz Et</>}
                </button>
              </div>
            </>
          )}

          {result && editedData && (
            <>
              <div className="flex items-start gap-3 bg-emerald-50 border border-emerald-200 rounded-lg p-4">
                <Check className="h-4 w-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-emerald-700">CV başarıyla analiz edildi. Bilgileri kontrol edip düzenleyebilirsiniz.</p>
              </div>

              <Sec title="Özet">
                <textarea rows={3} value={editedData.summary}
                  onChange={(e) => setEditedData({ ...editedData, summary: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-400 resize-none" placeholder="Kısa özet..." />
              </Sec>

              <Sec title={`Yetenekler (${editedData.skills.length})`}>
                <textarea rows={3} value={editedData.skills.join(', ')}
                  onChange={(e) => setEditedData({ ...editedData, skills: e.target.value.split(',').map(s => s.trim()).filter(Boolean) })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-400 resize-none" placeholder="React, TypeScript, Python..." />
              </Sec>

              <Sec title={`Eğitim (${editedData.education.length})`}
                onAdd={() => setEditedData({ ...editedData, education: [...editedData.education, { level:'',school:'',field:'',year:'' }] })}>
                {editedData.education.length === 0 && <p className="text-sm text-slate-500 italic">Bulunamadı — manuel ekleyebilirsiniz.</p>}
                {editedData.education.map((edu, i) => (
                  <div key={i} className="bg-slate-50 rounded-lg p-3 space-y-2">
                    <div className="grid grid-cols-2 gap-2">
                      <input value={edu.level} onChange={(e) => setEditedData({ ...editedData, education: upd(editedData.education, i, 'level', e.target.value) })} placeholder="Seviye" className={ic} />
                      <input value={edu.school} onChange={(e) => setEditedData({ ...editedData, education: upd(editedData.education, i, 'school', e.target.value) })} placeholder="Okul / Üniversite" className={ic} />
                      <input value={edu.field} onChange={(e) => setEditedData({ ...editedData, education: upd(editedData.education, i, 'field', e.target.value) })} placeholder="Bölüm" className={ic} />
                      <input value={edu.year} onChange={(e) => setEditedData({ ...editedData, education: upd(editedData.education, i, 'year', e.target.value) })} placeholder="Yıl" className={ic} />
                    </div>
                    <button onClick={() => setEditedData({ ...editedData, education: editedData.education.filter((_,idx)=>idx!==i) })} className="text-xs text-red-500 hover:text-red-700">Kaldır</button>
                  </div>
                ))}
              </Sec>

              <Sec title={`İş Deneyimi (${editedData.experience.length})`}
                onAdd={() => setEditedData({ ...editedData, experience: [...editedData.experience, { company:'',position:'',duration:'',description:'' }] })}>
                {editedData.experience.length === 0 && <p className="text-sm text-slate-500 italic">Bulunamadı — manuel ekleyebilirsiniz.</p>}
                {editedData.experience.map((exp, i) => (
                  <div key={i} className="bg-slate-50 rounded-lg p-3 space-y-2">
                    <div className="grid grid-cols-2 gap-2">
                      <input value={exp.company} onChange={(e) => setEditedData({ ...editedData, experience: upd(editedData.experience, i, 'company', e.target.value) })} placeholder="Şirket" className={ic} />
                      <input value={exp.position} onChange={(e) => setEditedData({ ...editedData, experience: upd(editedData.experience, i, 'position', e.target.value) })} placeholder="Pozisyon" className={ic} />
                    </div>
                    <input value={exp.duration} onChange={(e) => setEditedData({ ...editedData, experience: upd(editedData.experience, i, 'duration', e.target.value) })} placeholder="Süre (2020–2023)" className={`w-full ${ic}`} />
                    <textarea value={exp.description||''} onChange={(e) => setEditedData({ ...editedData, experience: upd(editedData.experience, i, 'description', e.target.value) })} placeholder="Açıklama" rows={2} className={`w-full ${ic} resize-none`} />
                    <button onClick={() => setEditedData({ ...editedData, experience: editedData.experience.filter((_,idx)=>idx!==i) })} className="text-xs text-red-500 hover:text-red-700">Kaldır</button>
                  </div>
                ))}
              </Sec>

              <Sec title={`Yabancı Diller (${editedData.languages.length})`}
                onAdd={() => setEditedData({ ...editedData, languages: [...editedData.languages, { name:'',level:'' }] })}>
                {editedData.languages.length === 0 && <p className="text-sm text-slate-500 italic">Bulunamadı — manuel ekleyebilirsiniz.</p>}
                {editedData.languages.map((lang, i) => (
                  <div key={i} className="flex gap-2 items-center bg-slate-50 rounded-lg p-2">
                    <input value={lang.name} onChange={(e) => setEditedData({ ...editedData, languages: upd(editedData.languages, i, 'name', e.target.value) })} placeholder="Dil" className={`flex-1 ${ic}`} />
                    <select value={lang.level} onChange={(e) => setEditedData({ ...editedData, languages: upd(editedData.languages, i, 'level', e.target.value) })} className={`flex-1 ${ic} bg-white`}>
                      <option value="">Seviye</option>
                      <option>Native</option><option>Advanced</option><option>Intermediate</option><option>Beginner</option>
                    </select>
                    <button onClick={() => setEditedData({ ...editedData, languages: editedData.languages.filter((_,idx)=>idx!==i) })} className="text-xs text-red-500 px-1">✕</button>
                  </div>
                ))}
              </Sec>

              {editedData.certifications.length > 0 && (
                <Sec title={`Sertifikalar (${editedData.certifications.length})`}>
                  {editedData.certifications.map((cert, i) => (
                    <div key={i} className="bg-slate-50 rounded p-2 text-sm flex justify-between">
                      <div><p className="font-medium text-slate-700">{cert.name}</p>{cert.date && <p className="text-xs text-slate-500">{cert.date}</p>}</div>
                      <button onClick={() => setEditedData({ ...editedData, certifications: editedData.certifications.filter((_,idx)=>idx!==i) })} className="text-xs text-red-500 px-1">✕</button>
                    </div>
                  ))}
                </Sec>
              )}

              <div className="flex gap-3 pt-2">
                <button onClick={() => { setResult(null); setEditedData(null); }} className="flex-1 py-2.5 border border-slate-300 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 transition">Geri Dön</button>
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

const ic = 'px-2.5 py-1.5 border border-slate-200 rounded text-sm focus:outline-none focus:ring-2 focus:ring-purple-400';

function Sec({ title, children, onAdd }: { title: string; children: React.ReactNode; onAdd?: () => void }) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-slate-700">{title}</h3>
        {onAdd && <button onClick={onAdd} className="text-xs bg-purple-100 text-purple-700 px-2.5 py-1 rounded-full hover:bg-purple-200 transition">+ Ekle</button>}
      </div>
      <div className="space-y-2">{children}</div>
    </div>
  );
}

export default CVAnalysisModal;
