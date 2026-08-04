import express from 'express';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type } from '@google/genai';
import { INITIAL_USERS, INITIAL_JOBS, INITIAL_MATCH_DETAILS, INITIAL_APPLICATIONS } from './src/data';
import { User, Job, Application, MatchDetail } from './src/types';
import { getStorageService } from './src/server/storage';

const app = express();
const PORT = 3000;

// Middleware
app.use(express.json({ limit: '10mb' }));

// Lazy Gemini API Client
let aiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI | null {
  if (!aiClient) {
    const key = process.env.GEMINI_API_KEY;
    if (key && key !== 'MY_GEMINI_API_KEY') {
      aiClient = new GoogleGenAI({
        apiKey: key,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          },
        },
      });
      console.log('[AI] Gemini client initialized successfully.');
    } else {
      console.warn('[AI] GEMINI_API_KEY is not configured. Falling back to local heuristics matching.');
    }
  }
  return aiClient;
}

// In-Memory DB State
let users: User[] = [...INITIAL_USERS];
let jobs: Job[] = [...INITIAL_JOBS];
let applications: Application[] = [...INITIAL_APPLICATIONS];
let matchDetails: Record<string, MatchDetail> = { ...INITIAL_MATCH_DETAILS };
let notifications: { id: string; userId: string; title: string; message: string; type: string; isRead: boolean; createdAt: string; relatedJobId?: string }[] = [];

const storageService = getStorageService();

// Serves local uploaded files in development mode
const uploadDir = process.env.UPLOAD_DIR || './uploads';
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}
app.use('/uploads', express.static(path.resolve(uploadDir)));

// --- API Endpoints ---

// 1. Auth Endpoint: Login
app.post('/api/auth/login', (req, res) => {
  console.log('[Login] Request received:', req.body);
  const { email, password, sessionUser } = req.body;
  
  if (!email || !password) {
    console.log('[Login] Missing credentials');
    return res.status(400).json({ error: 'E-posta ve şifre gereklidir.' });
  }

  let user = users.find((u) => u.email.toLowerCase() === email.toLowerCase());

  // Sunucu restart sonrası kullanıcı bellekte yok — session bilgisiyle yeniden oluştur
  if (!user && sessionUser && sessionUser.email?.toLowerCase() === email.toLowerCase()) {
    user = { ...sessionUser };
    users.push(user);
    console.log(`[Login] Auto-restored session user: ${user.id}`);
  }

  if (!user) {
    console.log('[Login] User not found:', email);
    return res.status(401).json({ error: 'Kullanıcı bulunamadı. Lütfen kayıt olun.' });
  }

  console.log('[Login] Success for user:', user.email);
  return res.json({ user });
});

// 2. Auth Endpoint: Register
app.post('/api/auth/register', (req, res) => {
  console.log('[Register] Request received:', req.body);
  const { email, fullName, role, password } = req.body;
  
  if (!email || !fullName || !role || !password) {
    console.log('[Register] Missing fields');
    return res.status(400).json({ error: 'Tüm alanlar zorunludur.' });
  }

  const existing = users.find((u) => u.email.toLowerCase() === email.toLowerCase());
  if (existing) {
    console.log('[Register] Email already in use:', email);
    return res.status(400).json({ error: 'Bu e-posta adresi zaten kullanımda.' });
  }

  const newUser: User = {
    id: `user_${Date.now()}`,
    email,
    fullName,
    role: role as 'candidate' | 'employer',
    profileStrength: role === 'candidate' ? 20 : 100, // Candidates start low until CV upload
    skills: [],
  };

  users.push(newUser);
  console.log('[Register] New user created:', newUser.id);
  return res.status(201).json({ user: newUser });
});

// 3. Jobs Endpoint: Get all (with optional preview match scores)
app.get('/api/jobs', (req, res) => {
  const userId = req.query.userId as string | undefined;

  if (!userId) {
    // Giriş yapılmamış — skor olmadan döndür
    return res.json({ jobs });
  }

  // Kullanıcıyı bul
  let candidate = users.find(u => u.id === userId);

  // Bellekte yoksa (sunucu restart) — session bilgisi query'den alınabilir
  if (!candidate) {
    return res.json({ jobs });
  }

  const cvText = candidate.resumeText || `${candidate.fullName}\nSkills: ${candidate.skills?.join(', ') || ''}`;

  // Her ilan için hızlı heuristic skor hesapla
  const jobsWithScore = jobs.map(job => {
    const match = calculateHeuristicMatch(cvText, job.description, job.skills);
    return {
      ...job,
      previewMatchScore: match.matchScore,
      previewSkillAlignment: match.skillAlignment,
    };
  });

  // Skora göre büyükten küçüğe sırala
  jobsWithScore.sort((a, b) => b.previewMatchScore - a.previewMatchScore);

  return res.json({ jobs: jobsWithScore });
});

// 4. Jobs Endpoint: Create job (Employer)
app.post('/api/jobs', (req, res) => {
  console.log('[Jobs] Received data:', req.body);
  const { 
    title, company, location, type, skills, experienceLevel, description, salaryRange,
    employerId,
    companySector, companySize, companyCity, companyWebsite, companyDescription, companyAvatarUrl
  } = req.body;
  if (!title || !company || !location || !type || !description) {
    console.log('[Jobs] Validation failed:', { title, company, location, type, description });
    return res.status(400).json({ error: 'Gerekli ilan detayları eksik.' });
  }

  // Eğer employerId varsa kullanıcıdan güncel şirket bilgilerini çek
  let resolvedSector = companySector;
  let resolvedSize = companySize;
  let resolvedCity = companyCity;
  let resolvedWebsite = companyWebsite;
  let resolvedDesc = companyDescription;
  let resolvedAvatar = companyAvatarUrl;

  if (employerId) {
    const employer = users.find(u => u.id === employerId);
    if (employer) {
      resolvedSector = resolvedSector || (employer as any).companySector;
      resolvedSize   = resolvedSize   || (employer as any).companySize;
      resolvedCity   = resolvedCity   || (employer as any).companyCity;
      resolvedWebsite = resolvedWebsite || (employer as any).companyWebsite;
      resolvedDesc   = resolvedDesc   || (employer as any).companyDescription;
      resolvedAvatar = resolvedAvatar || employer.avatarUrl;
    }
  }

  const newJob: Job = {
    id: `job_${Date.now()}`,
    title,
    company,
    employerId: employerId || '',
    location,
    type,
    skills: Array.isArray(skills) ? skills : [],
    experienceLevel: experienceLevel || 'Deneyim Aranmıyor',
    description,
    salaryRange: salaryRange || 'Rekabetçi',
    postedAt: 'Yeni',
    applicationCount: 0,
    candidateMatchesCount: 0,
    companySector: resolvedSector || '',
    companySize: resolvedSize || '',
    companyCity: resolvedCity || '',
    companyWebsite: resolvedWebsite || '',
    companyDescription: resolvedDesc || '',
    companyAvatarUrl: resolvedAvatar || '',
  };

  jobs.unshift(newJob);
  console.log('[Jobs] Job created:', newJob.id, '| Sector:', newJob.companySector);
  return res.status(201).json({ job: newJob });
});

// 5. Jobs Endpoint: Delete job (Employer)
app.delete('/api/jobs/:id', (req, res) => {
  const { id } = req.params;
  jobs = jobs.filter((j) => j.id !== id);
  applications = applications.filter((a) => a.jobId !== id);
  return res.json({ success: true, message: 'İlan başarıyla kaldırıldı.' });
});

// 6. Applications Endpoint: Get all (role-based)
app.get('/api/applications', (req, res) => {
  const userId = req.query.userId as string;
  const role = req.query.role as string;

  if (!userId) {
    return res.status(400).json({ error: 'Kullanıcı kimliği (userId) gereklidir.' });
  }

  if (role === 'employer') {
    return res.json({ applications });
  } else {
    const list = applications.filter((a) => a.candidateId === userId);
    return res.json({ applications: list });
  }
});

// 6b. Applications Endpoint: Withdraw (DELETE)
app.delete('/api/applications/:applicationId', (req, res) => {
  const { applicationId } = req.params;
  const { candidateId } = req.query as { candidateId: string };

  const appIndex = applications.findIndex((a) => a.id === applicationId);
  if (appIndex === -1) {
    return res.status(404).json({ error: 'Başvuru bulunamadı.' });
  }

  const app = applications[appIndex];

  // Güvenlik: sadece başvuruyu yapan aday geri çekebilir
  if (candidateId && app.candidateId !== candidateId) {
    return res.status(403).json({ error: 'Bu başvuruyu geri çekme yetkiniz yok.' });
  }

  // Sadece "Yeni" veya "İnceleniyor" durumundaki başvurular geri çekilebilir
  if (app.status === 'Kabul Edildi' || app.status === 'Mülakat') {
    return res.status(400).json({ error: `Başvuru "${app.status}" aşamasında olduğu için geri çekilemez.` });
  }

  // Başvuruyu sil
  applications.splice(appIndex, 1);

  // İlandaki başvuru sayısını güncelle
  const job = jobs.find((j) => j.id === app.jobId);
  if (job && job.applicationCount > 0) {
    job.applicationCount -= 1;
  }

  // Match detayını da temizle
  const matchKey = `${app.jobId}_${app.candidateId}`;
  delete matchDetails[matchKey];

  console.log(`[Applications] Withdrawn: ${applicationId} by ${candidateId}`);
  return res.json({ success: true, message: 'Başvurunuz başarıyla geri çekildi.' });
});

// Helper for deterministic local math score in case API key is missing
function calculateHeuristicMatch(cvText: string, jobDesc: string, jobSkills: string[]): MatchDetail {
  const cvLower = cvText.toLowerCase();
  const jobLower = jobDesc.toLowerCase();
  
  // Calculate skill matches — only from CV text vs job skills
  let matchedSkills: string[] = [];
  if (jobSkills.length > 0) {
    matchedSkills = jobSkills.filter(skill => cvLower.includes(skill.toLowerCase()));
  }

  const totalSkills = jobSkills.length || 1;
  const skillRatio = matchedSkills.length / totalSkills;

  // Skill alignment: purely based on ratio (0 match = 0, full match = 100)
  const skillAlignment = Math.round(skillRatio * 100);

  // Experience alignment: check CV text for experience indicators
  let experienceAlignment = 0;
  if (cvLower.includes('senior') || cvLower.includes('kıdemli') || cvLower.includes('lead') || cvLower.includes('müdür')) {
    experienceAlignment = 80;
  } else if (cvLower.includes('junior') || cvLower.includes('staj') || cvLower.includes('intern')) {
    experienceAlignment = 30;
  } else if (cvLower.length > 200) {
    // Has some content, moderate score
    experienceAlignment = 50;
  } else {
    // Very short/empty CV
    experienceAlignment = 10;
  }

  // Cultural alignment: based on keyword overlap between CV and job description
  const jobWords = jobLower.split(/\s+/).filter(w => w.length > 4);
  const matchedJobWords = jobWords.filter(w => cvLower.includes(w));
  const culturalRatio = jobWords.length > 0 ? matchedJobWords.length / jobWords.length : 0;
  const culturalAlignment = Math.round(culturalRatio * 100);

  // Weighted final score
  const matchScore = Math.round((skillAlignment * 0.6) + (experienceAlignment * 0.3) + (culturalAlignment * 0.1));

  // Turkish templates
  const strongPoints = [
    `Özgeçmiş içeriğinizde yer alan yeteneklerin ve teknik terimlerin, ilanda belirtilen '${matchedSkills.join(', ') || 'temel'}' beklentileri ile uyumlu olduğu görülmüştür.`,
    'Adayın deneyim süresi ve geçmiş rollerdeki sorumlulukları, pozisyonun temel beklentilerini karşılar niteliktedir.'
  ];

  const developmentAreas = [
    `İlan detaylarında belirtilen bazı ileri seviye gereksinimlerin (${jobSkills.filter(s => !matchedSkills.includes(s)).slice(0, 2).join(', ') || 'sistem mimarisi'}) geliştirilmesi faydalı olacaktır.`
  ];

  return {
    jobId: '',
    candidateId: '',
    matchScore,
    strongPoints,
    developmentAreas,
    skillAlignment,
    experienceAlignment,
    culturalAlignment,
    description: `[Yerel Analiz] Yapay zeka eşleştirme motoru (Çevrimdışı Mod), beceri ve metin analizi sonucunda %${matchScore} oranında bir uyumluluk hesaplamıştır. Teknik uyumunuz oldukça güçlü gözükmektedir.`
  };
}

// 7. Applications Endpoint: Submit application and perform AI match
app.post('/api/applications', async (req, res) => {
  const { jobId, candidateId, candidateName, candidateSkills, candidateResumeText } = req.body;
  if (!jobId || !candidateId) {
    return res.status(400).json({ error: 'İlan ve aday kimlikleri gereklidir.' });
  }

  let candidate = users.find((u) => u.id === candidateId);

  // Kullanıcı sunucu restart sonrası bellekte yoksa — session'dan gelen bilgilerle yeniden oluştur
  if (!candidate && candidateId) {
    candidate = {
      id: candidateId,
      email: `${candidateId}@session.local`,
      fullName: candidateName || 'Aday',
      role: 'candidate',
      skills: Array.isArray(candidateSkills) ? candidateSkills : [],
      resumeText: candidateResumeText || '',
      profileStrength: 50,
    };
    users.push(candidate);
    console.log(`[Applications] Auto-restored session user: ${candidateId}`);
  }

  const job = jobs.find((j) => j.id === jobId);

  if (!candidate || !job) {
    return res.status(404).json({ error: 'Aday veya ilan bulunamadı.' });
  }

  // Prevent duplicate application
  const alreadyApplied = applications.some((a) => a.jobId === jobId && a.candidateId === candidateId);
  if (alreadyApplied) {
    return res.status(400).json({ error: 'Bu ilana zaten başvuru yaptınız.' });
  }

  // Get CV text
  const cvText = candidate.resumeText || `${candidate.fullName} CV.\nSkills: ${candidate.skills?.join(', ')}`;
  
  let match: MatchDetail;

  try {
    const ai = getGeminiClient();
    if (ai) {
      console.log(`[AI] Running Gemini matching for ${candidate.fullName} and job ${job.title}...`);
      
      const contents = `Aday Özgeçmiş Metni:
      ${cvText}

      İş İlanı Detayları:
      Başlık: ${job.title}
      Şirket: ${job.company}
      Beceriler: ${job.skills.join(', ')}
      Açıklama: ${job.description}

      Görev: Bu adayın özgeçmişini iş ilanındaki kriterlerle karşılaştır. Türkçe dilinde objektif bir analiz yap.
      Lütfen sonucu aşağıdaki JSON şemasına uygun olarak üret:
      {
        "matchScore": number, // 0 ile 100 arasında bir sayısal uyum puanı
        "strongPoints": string[], // Adayın bu iş için en az 2-3 adet güçlü yönü
        "developmentAreas": string[], // Geliştirmesi önerilen 1-2 yön veya eksik beceri
        "skillAlignment": number, // Yetenek uyum skoru (0-100)
        "experienceAlignment": number, // Deneyim uyum skoru (0-100)
        "culturalAlignment": number, // Kültürel uyum skoru (0-100)
        "description": string // Genel bir özet değerlendirme cümlesi
      }`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.5-flash',
        contents,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              matchScore: { type: Type.NUMBER },
              strongPoints: { type: Type.ARRAY, items: { type: Type.STRING } },
              developmentAreas: { type: Type.ARRAY, items: { type: Type.STRING } },
              skillAlignment: { type: Type.NUMBER },
              experienceAlignment: { type: Type.NUMBER },
              culturalAlignment: { type: Type.NUMBER },
              description: { type: Type.STRING }
            },
            required: ['matchScore', 'strongPoints', 'developmentAreas', 'skillAlignment', 'experienceAlignment', 'culturalAlignment', 'description']
          }
        }
      });

      const resultText = response.text?.trim() || '{}';
      const parsedAiResult = JSON.parse(resultText);

      match = {
        jobId,
        candidateId,
        matchScore: Number(parsedAiResult.matchScore) || 75,
        strongPoints: parsedAiResult.strongPoints || [],
        developmentAreas: parsedAiResult.developmentAreas || [],
        skillAlignment: Number(parsedAiResult.skillAlignment) || 75,
        experienceAlignment: Number(parsedAiResult.experienceAlignment) || 75,
        culturalAlignment: Number(parsedAiResult.culturalAlignment) || 75,
        description: parsedAiResult.description || 'Değerlendirme başarıyla tamamlandı.'
      };
    } else {
      // Offline fallback
      match = calculateHeuristicMatch(cvText, job.description, job.skills);
      match.jobId = jobId;
      match.candidateId = candidateId;
    }
  } catch (error) {
    console.error('[AI Match Error] Failed to generate AI matching:', error);
    match = calculateHeuristicMatch(cvText, job.description, job.skills);
    match.jobId = jobId;
    match.candidateId = candidateId;
  }

  // Save the match details
  const matchKey = `${jobId}_${candidateId}`;
  matchDetails[matchKey] = match;

  // Save the application
  const newApp: Application = {
    id: `app_${Date.now()}`,
    jobId,
    candidateId,
    candidateName: candidate.fullName,
    candidateTitle: candidate.title || 'Aday',
    candidateAvatarUrl: candidate.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&h=150&q=80',
    status: 'Yeni',
    matchScore: match.matchScore,
    appliedAt: 'Az önce'
  };

  applications.unshift(newApp);

  // Increment application count on Job
  job.applicationCount += 1;
  if (match.matchScore >= 80) {
    job.candidateMatchesCount += 1;
  }

  return res.status(201).json({ application: newApp, match });
});

// 8. Matches Endpoint: Get match detail for a job + candidate
app.get('/api/matches/:jobId/:candidateId', (req, res) => {
  const { jobId, candidateId } = req.params;
  const matchKey = `${jobId}_${candidateId}`;
  const match = matchDetails[matchKey];

  if (!match) {
    // Generate a quick dynamic match if it doesn't exist
    const candidate = users.find((u) => u.id === candidateId);
    const job = jobs.find((j) => j.id === jobId);
    if (candidate && job) {
      const cvText = candidate.resumeText || `${candidate.fullName} CV.\nSkills: ${candidate.skills?.join(', ')}`;
      const fallback = calculateHeuristicMatch(cvText, job.description, job.skills);
      fallback.jobId = jobId;
      fallback.candidateId = candidateId;
      matchDetails[matchKey] = fallback;
      return res.json({ match: fallback });
    }
    return res.status(404).json({ error: 'Uyum raporu bulunamadı.' });
  }

  return res.json({ match });
});

// 9. Match Status Update (Employer)
app.patch('/api/applications/:id/status', (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!status) {
    return res.status(400).json({ error: 'Durum bilgisi gereklidir.' });
  }

  const appIndex = applications.findIndex((a) => a.id === id);
  if (appIndex === -1) {
    return res.status(404).json({ error: 'Başvuru bulunamadı.' });
  }

  applications[appIndex].status = status;
  return res.json({ application: applications[appIndex] });
});

// 9b. Application Decision Endpoint (Employer) — Kabul Et / Reddet
app.patch('/api/applications/:id/decision', (req, res) => {
  const { id } = req.params;
  const { decision } = req.body; // 'accept' | 'reject'

  if (!decision || !['accept', 'reject'].includes(decision)) {
    return res.status(400).json({ error: 'Geçerli bir karar belirtiniz: accept veya reject.' });
  }

  const appIndex = applications.findIndex((a) => a.id === id);
  if (appIndex === -1) {
    return res.status(404).json({ error: 'Başvuru bulunamadı.' });
  }

  const newStatus = decision === 'accept' ? 'Kabul Edildi' : 'Reddedildi';
  applications[appIndex].status = newStatus;

  const app = applications[appIndex];
  console.log(`[Decision] Application ${id} → ${newStatus} (candidate: ${app.candidateId})`);

  // Adaya bildirim ekle
  const notif = {
    id: `notif_${Date.now()}`,
    userId: app.candidateId,
    title: decision === 'accept' ? '🎉 Başvurunuz Kabul Edildi!' : 'Başvuru Sonucu',
    message: decision === 'accept'
      ? `Tebrikler! Başvurunuz değerlendirildi ve kabul edildi.`
      : `Başvurunuz değerlendirildi. Bu sefer uygun görülmedi, başarılar dileriz.`,
    type: decision === 'accept' ? 'success' : 'info',
    isRead: false,
    createdAt: new Date().toISOString(),
    relatedJobId: app.jobId,
  };
  (notifications as any[]).push(notif);

  return res.json({ application: applications[appIndex], notification: notif });
});

// 10. CV Parser Endpoint: Upload & Extract info with Gemini
app.post('/api/parse-cv', async (req, res) => {
  const { fileName, fileBase64, customText } = req.body;

  if (!fileName && !customText) {
    return res.status(400).json({ error: 'Dosya veya özgeçmiş metni gereklidir.' });
  }

  let finalCvText = customText || '';
  let downloadUrl = '';

  try {
    // Handle file saving if provided
    if (fileName && fileBase64) {
      downloadUrl = await storageService.uploadFile(fileName, fileBase64);
    }

    const ai = getGeminiClient();
    if (ai && (fileBase64 || customText)) {
      console.log(`[AI] Processing CV parser for ${fileName || 'Pasted Resume'}...`);
      
      const prompt = `Aşağıdaki Özgeçmiş/CV içeriğini veya adayın girdiği teknik bilgileri analiz et.
      Adayın ismi, unvanı, deneyim yılı ve teknik becerilerini (en fazla 6-8 anahtar kelime) çıkar.
      Lütfen cevabı mutlaka aşağıdaki JSON şemasına uygun olarak Türkçe dilinde üret:
      {
        "fullName": string, // Tespit edilen tam isim. Bulamazsan boş bırak.
        "title": string, // Örn: Frontend Geliştirici, Data Scientist vb.
        "experienceYears": number, // Yıl cinsinden deneyim süresi. Bulamazsan 0 veya 1 yaz.
        "skills": string[], // Anahtar kelimeler (React, Python vb.)
        "location": string // Örn: İstanbul, Ankara vb.
      }

      Analiz Edilecek Özgeçmiş İçeriği:
      ${customText || 'Dosya başarıyla yüklendi.'}
      Dosya Adı: ${fileName || ''}`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.5-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              fullName: { type: Type.STRING },
              title: { type: Type.STRING },
              experienceYears: { type: Type.NUMBER },
              skills: { type: Type.ARRAY, items: { type: Type.STRING } },
              location: { type: Type.STRING }
            },
            required: ['fullName', 'title', 'experienceYears', 'skills', 'location']
          }
        }
      });

      const parsedResult = JSON.parse(response.text?.trim() || '{}');
      
      return res.json({
        success: true,
        data: {
          fullName: parsedResult.fullName || 'Yeni Aday',
          title: parsedResult.title || 'Yazılım Mühendisi',
          experienceYears: parsedResult.experienceYears || 2,
          skills: parsedResult.skills || [],
          location: parsedResult.location || 'Türkiye',
          resumeFileName: fileName || 'ozgecmis.txt',
          resumeText: customText || `Yüklenen Dosya: ${fileName}`,
          profileStrength: 85,
          downloadUrl
        }
      });
    } else {
      // Heuristic offline extractor if key is missing or text-only fallback
      const skillsMatch = ['react', 'node', 'typescript', 'python', 'javascript', 'sql', 'css', 'html', 'vue', 'angular', 'aws', 'docker', 'graphql'];
      const textLower = finalCvText.toLowerCase();
      const detectedSkills = skillsMatch.filter(skill => textLower.includes(skill)).map(s => s.toUpperCase());

      // Simple heuristic for years
      let years = 2;
      const yearsRegex = /(\d+)\s*(yil|yıl|year)/i;
      const match = textLower.match(yearsRegex);
      if (match) {
        years = parseInt(match[1], 10);
      }

      // Simple heuristic for names
      let detectedName = 'Yeni Aday';
      if (finalCvText.length > 5) {
        const firstLine = finalCvText.split('\n')[0].trim();
        if (firstLine.length > 2 && firstLine.length < 30) {
          detectedName = firstLine;
        }
      }

      return res.json({
        success: true,
        data: {
          fullName: detectedName,
          title: textLower.includes('front') ? 'Frontend Geliştirici' : textLower.includes('data') ? 'Data Scientist' : 'Full Stack Geliştirici',
          experienceYears: years,
          skills: detectedSkills.length > 0 ? detectedSkills : ['React', 'JavaScript', 'Tailwind CSS'],
          location: 'İstanbul',
          resumeFileName: fileName || 'ozgecmis.txt',
          resumeText: finalCvText || `Özgeçmiş Belgesi: ${fileName}`,
          profileStrength: 75,
          downloadUrl
        }
      });
    }
  } catch (err) {
    console.error('[AI Parse Error] Parsing failed:', err);
    return res.status(500).json({ error: 'Özgeçmiş analiz edilirken bir hata oluştu.' });
  }
});

// 11. Profile Update Endpoint (Candidate)
app.patch('/api/profile/:userId', (req, res) => {
  const { userId } = req.params;
  console.log('[Profile] Update request for user:', userId);
  const data = req.body;

  let userIndex = users.findIndex((u) => u.id === userId);
  
  // If user doesn't exist in memory (e.g., after server restart), create from localStorage data
  if (userIndex === -1) {
    console.log('[Profile] User not found, creating from request data');
    const newUser: User = {
      id: userId,
      email: data.email || `${userId}@placeholder.com`,
      fullName: data.fullName || 'Unknown User',
      role: userId.startsWith('empl_') ? 'employer' : 'candidate',
      ...data
    };
    users.push(newUser);
    userIndex = users.length - 1;
  }

  // Update user with all provided fields
  const updatedUser = {
    ...users[userIndex],
    ...data,
    id: userId, // Preserve ID
    email: users[userIndex].email, // Preserve email
    role: users[userIndex].role // Preserve role
  };

  users[userIndex] = updatedUser;
  console.log('[Profile] User updated successfully:', updatedUser.id);
  return res.json({ user: updatedUser });
});

// 12. Stats Endpoint (Employer)
app.get('/api/stats/employer', (req, res) => {
  const totalJobs = jobs.length;
  const totalApps = applications.length;
  const highMatches = applications.filter((a) => a.matchScore >= 85).length;
  const inInterview = applications.filter((a) => a.status === 'Mülakat').length;

  return res.json({
    totalJobs,
    totalApplications: totalApps,
    highMatches,
    inInterview,
  });
});

// 12b. Company Profile Endpoint — herkese açık şirket profili
app.get('/api/company/:employerId', (req, res) => {
  const { employerId } = req.params;
  const employer = users.find(u => u.id === employerId && u.role === 'employer');

  if (!employer) {
    return res.status(404).json({ error: 'Şirket bulunamadı.' });
  }

  const u = employer as any;

  // Şirkete ait ilanlar
  const companyJobs = jobs.filter(j => j.employerId === employerId || j.company === (u.companyName || employer.fullName));

  // Şirket değerlendirmeleri
  const companyReviews = (reviews as any[]).filter(r => r.employerId === employerId);
  const avgRating = companyReviews.length > 0
    ? Math.round((companyReviews.reduce((s: number, r: any) => s + r.rating, 0) / companyReviews.length) * 10) / 10
    : 0;

  const profile = {
    employerId,
    companyName: u.companyName || employer.fullName,
    companySector: u.companySector || '',
    companySize: u.companySize || '',
    companyCity: u.companyCity || '',
    companyWebsite: u.companyWebsite || '',
    companyDescription: u.companyDescription || '',
    companyAvatarUrl: employer.avatarUrl || '',
    companyFoundedYear: u.companyFoundedYear || '',
    companyEmail: u.companyEmail || '',
    companyPhone: u.companyPhone || '',
    companyBenefits: u.companyBenefits || [],
    companyValues: u.companyValues || [],
    avgRating,
    totalReviews: companyReviews.length,
    jobs: companyJobs,
  };

  return res.json({ profile });
});

// 12c. Company arama — şirket adına göre
app.get('/api/company/search/:companyName', (req, res) => {
  const name = decodeURIComponent(req.params.companyName).toLowerCase().trim();

  // Önce kayıtlı employer'da ara (kısmi eşleşme)
  const employer = users.find(u =>
    u.role === 'employer' &&
    ((u as any).companyName?.toLowerCase().includes(name) ||
      u.fullName.toLowerCase().includes(name))
  );

  if (employer) {
    const u = employer as any;
    const companyJobs = jobs.filter(j =>
      j.employerId === employer.id || j.company === (u.companyName || employer.fullName)
    );
    const companyReviews = (reviews as any[]).filter(r => r.employerId === employer.id);
    const avgRating = companyReviews.length > 0
      ? Math.round((companyReviews.reduce((s: number, r: any) => s + r.rating, 0) / companyReviews.length) * 10) / 10
      : 0;
    return res.json({
      profile: {
        employerId: employer.id,
        companyName: u.companyName || employer.fullName,
        companySector: u.companySector || '',
        companySize: u.companySize || '',
        companyCity: u.companyCity || '',
        companyWebsite: u.companyWebsite || '',
        companyDescription: u.companyDescription || '',
        companyAvatarUrl: employer.avatarUrl || '',
        companyFoundedYear: u.companyFoundedYear || '',
        companyEmail: u.companyEmail || '',
        companyPhone: u.companyPhone || '',
        companyBenefits: u.companyBenefits || [],
        companyValues: u.companyValues || [],
        avgRating,
        totalReviews: companyReviews.length,
        jobs: companyJobs,
      }
    });
  }

  // Employer kaydı yoksa — ilanlardan şirket bilgisi çek (kısmi eşleşme)
  const job = jobs.find(j => j.company.toLowerCase().includes(name) || name.includes(j.company.toLowerCase()));
  if (job) {
    return res.json({
      profile: {
        employerId: job.employerId || '',
        companyName: job.company,
        companySector: job.companySector || '',
        companySize: job.companySize || '',
        companyCity: job.companyCity || job.location,
        companyWebsite: job.companyWebsite || '',
        companyDescription: job.companyDescription || '',
        companyAvatarUrl: job.companyAvatarUrl || '',
        companyFoundedYear: '',
        companyEmail: '',
        companyPhone: '',
        companyBenefits: [],
        companyValues: [],
        avgRating: 0,
        totalReviews: 0,
        jobs: jobs.filter(j2 => j2.company === job.company),
      }
    });
  }

  return res.status(404).json({ error: 'Şirket bulunamadı.' });
});

// 13. Notifications Endpoint
app.get('/api/notifications', (req, res) => {
  const userId = req.query.userId as string;
  if (!userId) {
    return res.status(400).json({ error: 'Kullanıcı kimliği gereklidir.' });
  }
  const userNotifs = notifications.filter(n => n.userId === userId);
  const unreadCount = userNotifs.filter(n => !n.isRead).length;
  return res.json({ notifications: userNotifs.reverse(), unreadCount });
});

// 13b. Mark notification as read
app.patch('/api/notifications/:notifId/read', (req, res) => {
  const { notifId } = req.params;
  const notif = notifications.find(n => n.id === notifId);
  if (notif) notif.isRead = true;
  return res.json({ success: true });
});

// 13c. Mark all notifications as read
app.post('/api/notifications/read-all', (req, res) => {
  const { userId } = req.body;
  notifications.filter(n => n.userId === userId).forEach(n => { n.isRead = true; });
  return res.json({ success: true });
});

// 14. Reviews Endpoints
interface Review {
  id: string;
  employerId: string;
  employerName: string;
  candidateId: string;
  candidateName: string;
  rating: number;
  comment: string;
  createdAt: string;
  applicationId: string;
}

let reviews: Review[] = [];

// GET — işverene ait tüm değerlendirmeleri getir
app.get('/api/reviews/:employerId', (req, res) => {
  const { employerId } = req.params;
  const employerReviews = reviews.filter(r => r.employerId === employerId);
  const avgRating = employerReviews.length > 0
    ? Math.round((employerReviews.reduce((sum, r) => sum + r.rating, 0) / employerReviews.length) * 10) / 10
    : 0;
  return res.json({ reviews: employerReviews, averageRating: avgRating, totalReviews: employerReviews.length });
});

// POST — yeni değerlendirme ekle
app.post('/api/reviews', (req, res) => {
  const { employerId, employerName, candidateId, candidateName, rating, comment, applicationId } = req.body;

  if (!employerId || !candidateId || !rating) {
    return res.status(400).json({ error: 'Eksik bilgi.' });
  }

  // Aynı başvuru için tekrar değerlendirme yapılmasın
  const alreadyReviewed = reviews.some(r => r.applicationId === applicationId && r.candidateId === candidateId);
  if (alreadyReviewed) {
    return res.status(400).json({ error: 'Bu işveren için zaten değerlendirme yaptınız.' });
  }

  const newReview: Review = {
    id: `rev_${Date.now()}`,
    employerId,
    employerName,
    candidateId,
    candidateName,
    rating: Math.min(5, Math.max(1, Number(rating))),
    comment: comment || '',
    createdAt: new Date().toLocaleDateString('tr-TR'),
    applicationId,
  };

  reviews.unshift(newReview);
  return res.status(201).json({ review: newReview });
});

// Vite Middleware & SPA serving
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
    console.log('[Server] Mounted Vite middleware in dev mode.');
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
    console.log('[Server] Mounted static production asset directories.');
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server is running on http://localhost:${PORT}`);
  });
}

startServer();
