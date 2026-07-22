import { Job, User, MatchDetail, Application } from './types';

export const INITIAL_USERS: User[] = [
  {
    id: 'cand_ayse',
    email: 'ayse@yilmaz.com',
    fullName: 'Ayşe Yılmaz',
    role: 'candidate',
    title: 'Kıdemli Yazılım Mühendisi',
    location: 'İstanbul',
    experienceYears: 5,
    skills: ['React', 'Node.js', 'TypeScript', 'GraphQL'],
    resumeFileName: 'ayse_yilmaz_cv.pdf',
    resumeText: 'Ayşe Yılmaz\nKıdemli Yazılım Mühendisi\nDeneyim: 5 Yıl\nBeceriler: React, Node.js, TypeScript, GraphQL, Tailwind CSS, REST APIs\nEğitim: Bilgisayar Mühendisliği mezunu.\nDeneyim detayları:\n- Tech Solutions A.Ş. - Frontend Geliştirici (3 yıl)\n- SoftTech - Yazılım Mühendisi (2 yıl)',
    profileStrength: 80,
    avatarUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuA3KJm3CDSCjrarDIebWhfMaUGNhusyNwjQtrCadhydDF6C6WZ-JjcAsbWthd_JCWTIErnoQAxgo4kA6E02YZLOUSL2iMlB8GIfy7FQCcL14mP1wowhbSjFpgQOadj9iHO5CWz6QK9UyCQkZRs9LRSqm2vZUYd-bfo40rprHFPbvCqig8jGTuwMGHeYZERiD0kS9GC-m68xjm_Dg3LNCYxXCb7dnft8dlQiu5L8PVaDJX1pTr0MRc1gGkuB1xyRspcTb8zvUu7UeW8'
  },
  {
    id: 'empl_techcorp',
    email: 'hr@techcorp.com',
    fullName: 'TechCorp A.Ş. İK',
    role: 'employer',
    title: 'İşe Alım Müdürü',
    location: 'İstanbul',
    avatarUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuD283LZeZVb1NUv5ILaNAp70WUqLgPUA_f-NtLC3jkXRbsuhN5tHB-jm-FBAqVzZI2vGXaU7Tut85ow6McncO73wuh6a2lmOHcEATFUfSXFLOVTBwdLUPP32eMuCp9wg45XwRS9k1rQQCg19VYQGEhfssqqQAlzcKD7j3heW59WTOsPfhoMaYdECZ6-6aZQp4_6d-_bghIvSWl79iQYJFwTtbbfsxSD4SDY-xQCWotLVNmHUwS3nRzC_T23U8GOjRFIY37NGTR2F9c'
  }
];

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
    applicationCount: 124,
    candidateMatchesCount: 18
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
    applicationCount: 86,
    candidateMatchesCount: 9
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
    applicationCount: 42,
    candidateMatchesCount: 5
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
    applicationCount: 12,
    candidateMatchesCount: 3
  }
];

export const INITIAL_MATCH_DETAILS: Record<string, MatchDetail> = {
  'job_1_cand_ayse': {
    jobId: 'job_1',
    candidateId: 'cand_ayse',
    matchScore: 92,
    strongPoints: [
      'Adayın React, Node.js ve TypeScript ekosistemindeki 5 yıllık teknik deneyimi, projenin mevcut teknoloji yığınıyla mükemmel uyum sağlıyor.',
      'Önceki projelerinde üstlendiği mimari ve liderlik rolleri, bu pozisyondaki "Senior" beklentilerini tam anlamıyla karşılıyor.',
      'Tailwind CSS ve modern CSS pratikleri konusundaki yetkinliği yüksek seviyede.'
    ],
    developmentAreas: [
      'GraphQL tecrübesi iş tanımında "tercihen" olarak geçmekle birlikte, adayda başlangıç-orta seviyesinde gözükmektedir. Kurum içi kısa bir adaptasyon gerekebilir.',
      'Docker ve CI/CD süreçleri konusunda ek pratikler yapması faydalı olacaktır.'
    ],
    skillAlignment: 95,
    experienceAlignment: 88,
    culturalAlignment: 90,
    description: 'Yapay zeka eşleştirme motorumuz, adayın özgeçmişini ve projelerini derinlemesine analiz etmiştir. Adayın teknik bilgi birikimi ile şirketin kültürel değerleri arasında son derece yüksek bir uyum tespit edilmiştir.'
  }
};

export const INITIAL_APPLICATIONS: Application[] = [
  {
    id: 'app_1',
    jobId: 'job_1',
    candidateId: 'cand_ayse',
    candidateName: 'Ayşe Yılmaz',
    candidateTitle: 'Kıdemli Yazılım Mühendisi',
    candidateAvatarUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuA3KJm3CDSCjrarDIebWhfMaUGNhusyNwjQtrCadhydDF6C6WZ-JjcAsbWthd_JCWTIErnoQAxgo4kA6E02YZLOUSL2iMlB8GIfy7FQCcL14mP1wowhbSjFpgQOadj9iHO5CWz6QK9UyCQkZRs9LRSqm2vZUYd-bfo40rprHFPbvCqig8jGTuwMGHeYZERiD0kS9GC-m68xjm_Dg3LNCYxXCb7dnft8dlQiu5L8PVaDJX1pTr0MRc1gGkuB1xyRspcTb8zvUu7UeW8',
    status: 'Yeni',
    matchScore: 92,
    appliedAt: '2 gün önce'
  },
  {
    id: 'app_2',
    jobId: 'job_2',
    candidateId: 'cand_can',
    candidateName: 'Can Demir',
    candidateTitle: 'Data Scientist',
    candidateAvatarUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuD0M9zH7lZT-KUE5_NCVDxgV1EBSMkasQhHzBWYsbzH48GZd1NGHTIu6M2cNoPWRym0T1HPwPhxDLqlmQTDdnC_vinT7UwCQ_MsPrlR9vb9LJC2eh772GfTMwp83qEmUohkpSLgNPi6hZLJDIzotWkYLVmqbziykdDSFa2-5pmcRtbOLYdfmKBZDC_K8EMyDqyMZIIoGG5wtFBG6iYKvRbebwU7KovxKuLleh4nGKXkIGApGaHcrR_6tLQlNQacsctrlivQOOz1xq8',
    status: 'Mülakat',
    matchScore: 88,
    appliedAt: '5 gün önce'
  }
];

export const USER_TESTIMONIALS = [
  {
    name: 'Ahmet Y.',
    role: 'Yazılım Mühendisi',
    text: '"Platformun önerdiği iş ilanları tam olarak yeteneklerime uygundu. Aylar süren arayışım 2 haftada sonuçlandı."',
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCy7Kydwok7QKx6a6G3BFC9rfsCIhvpRHaTzPlo9BXjH4tFM-zZaCaHvjZlEY4qvv8JfZUGSxVlIc0v4Ky1uXE_5vCHPBzt2MR5rdoDvc7SnTdsMgdrk3xJeqWjsTO-RLGiFjauqUYB589jU3cYxsKYrznNWAGCQ1gNLxvTC54VjorbNsyxWb6bJWX5bnvgCI6gmOHGZEhxZDN9h5dceK5LZxrz3_HSVO91mEOtInrpf4uybNZlztDLi9fneDRPFQ-NZSpHDnnfrH3-'
  },
  {
    name: 'Elif K.',
    role: 'İK Uzmanı',
    text: '"Aday havuzunu taramak yerine AI\'ın getirdiği %95 eşleşmeli adaylarla görüşmek işe alım sürecimizi devrimleştirdi."',
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCIAWGm8P0CxNCnNubyCdaw5RIk5mByr58_DwBu-Jtab01zAmltZ9iNpFW1NDlZLh6sNJtmGjQDVUbnvEEx9asCgHZl3WrX1sV8FM5i6pm8VHzE9piKkOMCwQBDYjeN7ICR1Y4_f_5aggifj41xkNO45XaRb6XBON5mQRLgG57zri2ZsdyBVaZyyvy49sbVPTXVNcugizeLn7HHmUNBbIUogwL7ttAg8TdDqiIx4HCCNMzm3wfhzrdUpAPAZftNG9wi7owug5XMZe5A'
  },
  {
    name: 'Caner T.',
    role: 'Veri Analisti',
    text: '"Veri analitiği tabanlı eşleştirme, gerçekten benim yeteneklerimle örtüşen şirketleri bulmamı sağladı. Mükemmel bir deneyim."',
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBye4JF68j-kFEBehr2EFu6dLwWNIxdO3m7b00g68NfMOwUOcTCgvW0r5AY_xL0FUyfq4ZpkPQMtbs5ykI1gqTHaiC2CuHR5YNnqba9W_St_GYGZ5MFY0-q3IDaNvsTbGcsBmscAzJv7CY7uHTlTjEVcyqplzyX3Y53lV5AXPu5zzDPh9Y-fmBDX6oE6WX7EH2B7o71b3L_EzzJ-h7mqdXtnyIullTk1Pgv5izK2HkleIwD3zSetPsLCcJdw2XsA0anlK_lCwwBhY6b'
  },
  {
    name: 'Zeynep A.',
    role: 'UX Tasarımcı',
    text: '"Arayüzün sadeliği ve hız gerçekten etkileyici. Kariyer yolculuğumda bana rehberlik eden harika bir asistan gibi."',
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBop7BD-fp5_uGbiaeD4i0Tveignx_Gj5zH0tee9JmOi1ILRFGeBrgnaMC5jFuYm2ojLT6nhLKt9ur7asgiu_fqdblRtwFHRyY9zqIkVzJjhMYb2L8tN4yOyrYMGqokCmhXy8w2uMOOr2oLBLP_tOnKk7ZawBWnEPzBkbUnI1cB4fRjKex-vrPbfA-gcKdjO4IWP4RVxnz86ej2lesltd7yWWHJWPjo-Kd_6iJoXUHoBbNQ3sSBqFZNwAQNF1aDe_UHNLvBlQL4ELV6'
  },
  {
    name: 'Murat D.',
    role: 'Proje Yöneticisi',
    text: '"Geniş ağı sayesinde hayalimdeki şirketle tanışma fırsatı buldum. Kariyer Kapısı\'na teşekkürler."',
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDRXWsYwat8IZytKDpWWLv1UtFmF0gwegF2cnmuBo4JmgcoiQrP_Rx9gfoTOI5MUuE0D6aW5EAkdgugUaskScZ8Q3bg5csUHASxQ1nol3hTGwyee7fKDhKR5-2MvPUdtqNjMKK6Yy6U29UUdiir3V4fUYpU5zmfBIul_HNNoFS4CiPGe1UuIB1nLcJnRBqsKOJs1ImQQiRtvZrNZaCjXKo2Cl7dk2oCINO2EQCDFNJ0DrUhvyYJ1MppV-oc_u4YNe_3SJjidIeHTG_T'
  }
];
