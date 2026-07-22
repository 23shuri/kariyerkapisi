export type Role = 'candidate' | 'employer';

export interface User {
  id: string;
  email: string;
  fullName: string;
  role: Role;
  title?: string;
  location?: string;
  experienceYears?: number;
  skills?: string[];
  resumeText?: string;
  resumeFileName?: string;
  profileStrength?: number;
  avatarUrl?: string;
}

export interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  type: 'Uzaktan' | 'Hibrit' | 'Ofisten';
  skills: string[];
  experienceLevel: string;
  description: string;
  salaryRange: string;
  postedAt: string;
  applicationCount: number;
  candidateMatchesCount: number;
}

export interface MatchDetail {
  jobId: string;
  candidateId: string;
  matchScore: number;
  strongPoints: string[];
  developmentAreas: string[];
  skillAlignment: number; // 0-100
  experienceAlignment: number; // 0-100
  culturalAlignment: number; // 0-100
  description: string;
}

export interface Application {
  id: string;
  jobId: string;
  candidateId: string;
  candidateName: string;
  candidateTitle: string;
  candidateAvatarUrl?: string;
  status: 'Yeni' | 'Mülakat' | 'Reddedildi' | 'Kabul Edildi';
  matchScore: number;
  appliedAt: string;
}
