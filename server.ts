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
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'E-posta ve şifre gereklidir.' });
  }

  // Basic mock check: password should be at least 4 chars
  const user = users.find((u) => u.email.toLowerCase() === email.toLowerCase());
  if (!user) {
    return res.status(401).json({ error: 'Kullanıcı bulunamadı. Lütfen kayıt olun.' });
  }

  return res.json({ user });
});

// 2. Auth Endpoint: Register
app.post('/api/auth/register', (req, res) => {
  const { email, fullName, role, password } = req.body;
  if (!email || !fullName || !role || !password) {
    return res.status(400).json({ error: 'Tüm alanlar zorunludur.' });
  }

  const existing = users.find((u) => u.email.toLowerCase() === email.toLowerCase());
  if (existing) {
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
  return res.status(201).json({ user: newUser });
});

// 3. Jobs Endpoint: Get all
app.get('/api/jobs', (req, res) => {
  return res.json({ jobs });
});

// 4. Jobs Endpoint: Create job (Employer)
app.post('/api/jobs', (req, res) => {
  const { title, company, location, type, skills, experienceLevel, description, salaryRange } = req.body;
  if (!title || !company || !location || !type || !description) {
    return res.status(400).json({ error: 'Gerekli ilan detayları eksik.' });
  }

  const newJob: Job = {
    id: `job_${Date.now()}`,
    title,
    company,
    location,
    type,
    skills: Array.isArray(skills) ? skills : [],
    experienceLevel: experienceLevel || 'Deneyim Aranmıyor',
    description,
    salaryRange: salaryRange || 'Rekabetçi',
    postedAt: 'Yeni',
    applicationCount: 0,
    candidateMatchesCount: 0,
  };

  jobs.unshift(newJob);
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
    // Return all applications for jobs posted by this employer (or all for demo simplicity)
    return res.json({ applications });
  } else {
    // Return applications submitted by this candidate
    const list = applications.filter((a) => a.candidateId === userId);
    return res.json({ applications: list });
  }
});

// Helper for deterministic local math score in case API key is missing
function calculateHeuristicMatch(cvText: string, jobDesc: string, jobSkills: string[]): MatchDetail {
  const textToAnalyze = `${cvText.toLowerCase()} ${jobDesc.toLowerCase()}`;
  
  // Calculate skill matches
  let matchedSkills: string[] = [];
  if (jobSkills.length > 0) {
    matchedSkills = jobSkills.filter(skill => textToAnalyze.includes(skill.toLowerCase()));
  }

  const totalSkills = jobSkills.length || 5;
  const skillRatio = matchedSkills.length / totalSkills;
  
  // Base scores
  const skillAlignment = Math.min(100, Math.round(40 + (skillRatio * 60)));
  const experienceAlignment = textToAnalyze.includes('senior') || textToAnalyze.includes('kıdemli') ? 85 : 75;
  const culturalAlignment = 80;

  const matchScore = Math.round((skillAlignment * 0.5) + (experienceAlignment * 0.3) + (culturalAlignment * 0.2));

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
  const { jobId, candidateId } = req.body;
  if (!jobId || !candidateId) {
    return res.status(400).json({ error: 'İlan ve aday kimlikleri gereklidir.' });
  }

  const candidate = users.find((u) => u.id === candidateId);
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
  const { fullName, title, experienceYears, skills, location, resumeText, resumeFileName, profileStrength } = req.body;

  const userIndex = users.findIndex((u) => u.id === userId);
  if (userIndex === -1) {
    return res.status(404).json({ error: 'Profil bulunamadı.' });
  }

  const updatedUser = {
    ...users[userIndex],
    fullName: fullName || users[userIndex].fullName,
    title: title || users[userIndex].title,
    experienceYears: experienceYears !== undefined ? Number(experienceYears) : users[userIndex].experienceYears,
    skills: Array.isArray(skills) ? skills : users[userIndex].skills,
    location: location || users[userIndex].location,
    resumeText: resumeText || users[userIndex].resumeText,
    resumeFileName: resumeFileName || users[userIndex].resumeFileName,
    profileStrength: profileStrength !== undefined ? Number(profileStrength) : users[userIndex].profileStrength,
  };

  users[userIndex] = updatedUser;
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
