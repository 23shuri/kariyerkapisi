export interface MatchDetail {
  matchPercentage: number;
  technicalSkillsMatch: number;
  experienceMatch: number;
  culturalMatch: number;
  strengths: string[];
  improvements: string[];
  experienceExplanation: string;
  culturalExplanation: string;
}

export interface Candidate {
  id: string;
  name: string;
  role: string;
  experienceYears: number;
  location: string;
  avatarUrl: string;
  skills: string[];
  tags: string[];
  bio: string;
  matchDetails?: Record<string, MatchDetail>; // Key is jobId
}

export interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  type: string; // 'Tam Zamanlı' | 'Yarı Zamanlı' | 'Proje Bazlı'
  workModel: string; // 'Hibrit' | 'Uzaktan' | 'Ofisten'
  salaryText: string; // 'Rekabetçi' | '50,000 - 70,000 TL' vb.
  matchPercentage?: number; // Calculated dynamic or preset
  description: string;
  skills: string[];
  tags: string[];
  postedAt: string;
  applicationsCount: number;
  aiMatchCount: number;
  logoUrl?: string;
  logoLetter?: string;
}

export interface Application {
  id: string;
  jobId: string;
  candidateId: string;
  appliedAt: string;
  matchPercentage: number;
  status: 'Yayında' | 'Değerlendirmede' | 'Görüşme Ayarlandı' | 'Reddedildi' | 'Kabul Edildi';
}
