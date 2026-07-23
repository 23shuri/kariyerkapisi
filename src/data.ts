import { Job, User, MatchDetail, Application } from './types';

export const INITIAL_USERS: User[] = [];

export const INITIAL_JOBS: Job[] = [
  {
    id: 'job_1',
    title: 'Senior Frontend Developer',
    company: 'TechCorp A.Ş.',
    location: 'İstanbul (Hibrit)',
    type: 'Hibrit',
    skills: ['React', 'TypeScript', 'Tailwind CSS', 'GraphQL'],
    experienceLevel: '3-5 Yıl',
    description: 'Şirketimizin amiral gemisi web uygulamalarını modern teknolojilerle geliştirmek ve UI/UX standartlarımızı üst seviyeye çıkarmak üzere deneyimli bir Frontend Developer arıyoruz.',
    salaryRange: 'Rekabetçi',
    postedAt: '3 gün önce',
    applicationCount: 0,
    candidateMatchesCount: 0
  },
  {
    id: 'job_2',
    title: 'Data Scientist',
    company: 'DataMinds Ltd.',
    location: 'Ankara (Uzaktan)',
    type: 'Uzaktan',
    skills: ['Python', 'Machine Learning', 'SQL', 'Tableau'],
    experienceLevel: '2+ Yıl',
    description: 'Büyük veri analiz süreçlerimizi yönetecek, tahmine dayalı yapay zeka modelleri tasarlayacak ve bunları ürünlerimize entegre edecek bir Data Scientist arıyoruz.',
    salaryRange: 'Rekabetçi',
    postedAt: '1 hafta önce',
    applicationCount: 0,
    candidateMatchesCount: 0
  },
  {
    id: 'job_3',
    title: 'Full Stack Mühendisi',
    company: 'FinansSoft',
    location: 'İzmir (Hibrit)',
    type: 'Hibrit',
    skills: ['Node.js', 'React', 'PostgreSQL', 'Docker'],
    experienceLevel: '4+ Yıl',
    description: 'Finansal yazılım çözümlerimizin hem sunucu hem de istemci tarafındaki mimarilerini güçlendirecek, yüksek trafikli sistemlerde tecrübeli bir Full Stack geliştirici arıyoruz.',
    salaryRange: 'Rekabetçi',
    postedAt: '2 hafta önce',
    applicationCount: 0,
    candidateMatchesCount: 0
  },
  {
    id: 'job_4',
    title: 'Kıdemli Yapay Zeka Mühendisi',
    company: 'TechVision Analytics',
    location: 'İstanbul (Hibrit)',
    type: 'Hibrit',
    skills: ['Python', 'TensorFlow', 'NLP', 'PyTorch'],
    experienceLevel: '5+ Yıl',
    description: 'Gelişmiş doğal dil işleme (NLP) ve LLM tabanlı çözümler geliştirecek, yapay zeka eşleştirme algoritmalarımızı optimize edecek vizyoner bir AI mühendisi arıyoruz.',
    salaryRange: 'Rekabetçi',
    postedAt: 'Yeni',
    applicationCount: 0,
    candidateMatchesCount: 0
  }
];

export const INITIAL_MATCH_DETAILS: Record<string, MatchDetail> = {};

export const INITIAL_APPLICATIONS: Application[] = [];

export const USER_TESTIMONIALS: never[] = [];
