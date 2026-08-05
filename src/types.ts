export type Role = 'candidate' | 'employer' | 'admin';

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
  coverPhotoUrl?: string;
  bio?: string;
  phone?: string;
  birthDate?: string;
  workStatus?: 'actively_looking' | 'employed' | 'open_to_offers' | 'not_looking';
  salaryExpectation?: string;
  workPreference?: 'remote' | 'hybrid' | 'office' | 'flexible';
  linkedinUrl?: string;
  githubUrl?: string;
  portfolioUrl?: string;
  education?: EducationEntry[];
  experience?: ExperienceEntry[];
  languages?: LanguageEntry[];
  certificates?: CertificateEntry[];
  projects?: ProjectEntry[];
}

export interface EducationEntry {
  id: string;
  school: string;
  degree: string;
  field: string;
  startDate: string;
  endDate?: string;
  current?: boolean;
  description?: string;
}

export interface ExperienceEntry {
  id: string;
  company: string;
  position: string;
  location?: string;
  startDate: string;
  endDate?: string;
  current?: boolean;
  description?: string;
}

export interface LanguageEntry {
  id: string;
  language: string;
  level: 'beginner' | 'intermediate' | 'advanced' | 'native';
}

export interface CertificateEntry {
  id: string;
  name: string;
  issuer: string;
  category: CertificateCategory;
  issueDate: string;
  expiryDate?: string;
  credentialId?: string;
  credentialUrl?: string;
  description?: string;
  fileUrl?: string; // PDF or image
  fileType?: 'pdf' | 'image';
  verified?: boolean;
}

export type CertificateCategory = 
  | 'software_development'
  | 'ai_ml'
  | 'data_science'
  | 'cybersecurity'
  | 'cloud'
  | 'networking'
  | 'mobile_development'
  | 'web_development'
  | 'design'
  | 'project_management'
  | 'office_software'
  | 'digital_marketing'
  | 'language'
  | 'other';

export const CERTIFICATE_CATEGORIES: Record<CertificateCategory, string> = {
  software_development: 'Yazılım Geliştirme',
  ai_ml: 'Yapay Zeka & ML',
  data_science: 'Veri Bilimi',
  cybersecurity: 'Siber Güvenlik',
  cloud: 'Bulut Teknolojileri',
  networking: 'Ağ Sistemleri',
  mobile_development: 'Mobil Geliştirme',
  web_development: 'Web Geliştirme',
  design: 'Tasarım',
  project_management: 'Proje Yönetimi',
  office_software: 'Ofis Programları',
  digital_marketing: 'Dijital Pazarlama',
  language: 'Yabancı Dil',
  other: 'Diğer'
};

export interface ProjectEntry {
  id: string;
  name: string;
  description: string;
  role?: string;
  technologies?: string[];
  startDate?: string;
  endDate?: string;
  url?: string;
  imageUrl?: string;
}

export interface Job {
  id: string;
  title: string;
  company: string;
  employerId?: string;
  location: string;
  type: 'Uzaktan' | 'Hibrit' | 'Ofisten';
  skills: string[];
  experienceLevel: string;
  description: string;
  salaryRange: string;
  postedAt: string;
  applicationCount: number;
  candidateMatchesCount: number;
  // İşveren profil bilgileri
  companySector?: string;
  companySize?: string;
  companyCity?: string;
  companyWebsite?: string;
  companyDescription?: string;
  companyAvatarUrl?: string;
  // Önizleme eşleşme skoru (giriş yapılmış kullanıcı için)
  previewMatchScore?: number;
  previewSkillAlignment?: number;
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

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
  isRead: boolean;
  createdAt: string;
  relatedJobId?: string;
  relatedCompany?: string;
}

export interface Review {
  id: string;
  employerId: string;
  employerName: string;
  candidateId: string;
  candidateName: string;
  rating: number; // 1-5
  comment: string;
  createdAt: string;
  applicationId: string;
}

export interface CandidateCV {
  id: string;
  candidateId: string;
  candidateName: string;
  candidateAvatarUrl?: string;
  title: string;           // Aranan pozisyon
  location: string;        // Konum tercihi
  workPreference: 'Uzaktan' | 'Hibrit' | 'Ofisten' | 'Fark etmez';
  skills: string[];
  experienceYears: number;
  experienceLevel: string; // '0-1 Yıl', '1-2 Yıl' vs.
  salaryExpectation: string;
  summary: string;         // Özet / hakkında
  publishedAt: string;
  isActive: boolean;
}
