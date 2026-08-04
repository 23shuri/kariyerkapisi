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
    salaryRange: '35.000 - 55.000 ₺',
    postedAt: '3 gün önce',
    applicationCount: 0,
    candidateMatchesCount: 0,
    companySector: 'Teknoloji',
    companySize: '50-200 Çalışan',
    companyCity: 'İstanbul',
    companyWebsite: 'www.techcorp.com.tr',
    companyDescription: 'TechCorp A.Ş., 2015 yılından bu yana Türkiye\'nin önde gelen yazılım şirketleri arasında yer almaktadır. Kurumsal ve KOBİ müşterilerine yönelik yenilikçi dijital çözümler geliştiriyoruz.',
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
    salaryRange: '40.000 - 60.000 ₺',
    postedAt: '1 hafta önce',
    applicationCount: 0,
    candidateMatchesCount: 0,
    companySector: 'Veri & Analitik',
    companySize: '10-50 Çalışan',
    companyCity: 'Ankara',
    companyWebsite: 'www.dataminds.io',
    companyDescription: 'DataMinds, yapay zeka ve makine öğrenmesi alanında uzmanlaşmış bir veri şirketidir. Müşterilerimize özel analitik çözümler ve tahminleme modelleri geliştiriyoruz.',
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
    salaryRange: '45.000 - 70.000 ₺',
    postedAt: '2 hafta önce',
    applicationCount: 0,
    candidateMatchesCount: 0,
    companySector: 'Fintech',
    companySize: '200-500 Çalışan',
    companyCity: 'İzmir',
    companyWebsite: 'www.finanssoft.com',
    companyDescription: 'FinansSoft, bankacılık ve finans sektörüne yönelik yazılım çözümleri geliştiren köklü bir teknoloji şirketidir. 10 yılı aşkın deneyimimizle 50\'den fazla finans kuruluşuna hizmet veriyoruz.',
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
    salaryRange: '60.000 - 90.000 ₺',
    postedAt: 'Yeni',
    applicationCount: 0,
    candidateMatchesCount: 0,
    companySector: 'Yapay Zeka',
    companySize: '50-200 Çalışan',
    companyCity: 'İstanbul',
    companyWebsite: 'www.techvision.ai',
    companyDescription: 'TechVision Analytics, yapay zeka ve derin öğrenme alanında Türkiye\'nin öncü ar-ge şirketlerinden biridir. NLP, computer vision ve predictive analytics konularında dünya standartlarında çözümler üretiyoruz.',
  }
];

export const INITIAL_MATCH_DETAILS: Record<string, MatchDetail> = {};

export const INITIAL_APPLICATIONS: Application[] = [];

export const USER_TESTIMONIALS = [
  {
    name: 'Elif Kaya',
    role: 'Senior Frontend Developer',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&h=150&q=80',
    text: 'Kariyer Kapısı akıllı eşleştirme sayesinde becerilerime tam uyan pozisyonları anında buldum ve 2 hafta içinde hayalimdeki şirkette işe başladım.'
  },
  {
    name: 'Mehmet Demir',
    role: 'İşe Alım Müdürü @ TechCorp',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=150&h=150&q=80',
    text: 'İlanlarımıza başvuran adayların AI eşleştirme skorları ve CV analiz raporları işe alım sürecimizi %60 hızlandırdı.'
  },
  {
    name: 'Zeynep Çelik',
    role: 'Data Scientist',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=150&h=150&q=80',
    text: 'Özgeçmişimi yükledikten sonra otomatik olarak oluşturulan yetenek analiz raporu kariyer yolculuğumda bana ışık tuttu.'
  }
];
