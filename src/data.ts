import { Job, Candidate, MatchDetail } from './types';

export const INITIAL_CANDIDATES: Candidate[] = [
  {
    id: 'cand_ayse',
    name: 'Ayşe Yılmaz',
    role: 'Kıdemli Yazılım Mühendisi',
    experienceYears: 5,
    location: 'İstanbul',
    avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=400',
    skills: ['React', 'Node.js', 'TypeScript', 'UI/UX', 'GraphQL', 'Tailwind CSS', 'Redux', 'Jest'],
    tags: ['Frontend', 'React', 'TypeScript', 'Node.js'],
    bio: 'Modern web teknolojileri ve kullanıcı dostu arayüzler geliştirme konusunda 5 yıllık deneyime sahip Kıdemli Yazılım Mühendisi. React, TypeScript ve Node.js ekosistemine hakim, ölçeklenebilir uygulamalar tasarlamayı sever.',
    matchDetails: {
      'job_tech_solutions': {
        matchPercentage: 92,
        technicalSkillsMatch: 95,
        experienceMatch: 88,
        culturalMatch: 90,
        strengths: [
          'Adayın React ve Node.js ekosistemindeki derin teknik bilgisi, projenin mevcut teknoloji yığınıyla birebir örtüşüyor.',
          'Önceki rolündeki mimari kararları, bu pozisyondaki beklentileri ve teknik liderlik sorumluluklarını fazlasıyla karşılıyor.'
        ],
        improvements: [
          'GraphQL tecrübesi, iş tanımında "tercihen" olarak belirtilmesine rağmen başlangıç seviyesinde.',
          'Kurum içi adaptasyon süreci kısa bir eğitim gerektirebilir.'
        ],
        experienceExplanation: 'İstenen "Takım Yönetimi" tecrübesi 3 yıl, adayın bu alanda 2.5 yıllık aktif deneyimi bulunuyor.',
        culturalExplanation: 'Çevik (Agile) Metodoloji ve Sürekli Öğrenme kültürüne tam uyumluluk göstermektedir.'
      },
      'job_frontend_techcorp': {
        matchPercentage: 95,
        technicalSkillsMatch: 98,
        experienceMatch: 92,
        culturalMatch: 95,
        strengths: [
          'İleri seviye React ve TypeScript bilgisi.',
          'UI/UX geliştirme pratiklerine ve modern CSS standartlarına derin aşinalık.'
        ],
        improvements: [
          'CI/CD boru hatları konusundaki pratik tecrübesi geliştirilebilir.'
        ],
        experienceExplanation: 'Aranan 4+ yıl frontend geliştirme tecrübesi kriterini 5 yıllık yetkin deneyimiyle eksiksiz karşılıyor.',
        culturalExplanation: 'Yüksek işbirliği yeteneği ve tasarım odaklı düşünme yapısı ekibin dinamikleriyle kusursuz eşleşiyor.'
      }
    }
  },
  {
    id: 'cand_can',
    name: 'Can Demir',
    role: 'Data Scientist',
    experienceYears: 3,
    location: 'Ankara',
    avatarUrl: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=400',
    skills: ['Python', 'Machine Learning', 'SQL', 'TensorFlow', 'Pandas', 'Scikit-Learn', 'Tableau'],
    tags: ['Python', 'Machine Learning', 'SQL'],
    bio: 'Büyük veri analizi, makine öğrenmesi modelleri geliştirme ve tahminsel analizler konusunda 3 yıl deneyimli Veri Bilimci. Python ve SQL araçlarını etkin kullanır, karmaşık veri setlerinden anlamlı içgörüler üretir.',
    matchDetails: {
      'job_dataminds': {
        matchPercentage: 88,
        technicalSkillsMatch: 90,
        experienceMatch: 85,
        culturalMatch: 90,
        strengths: [
          'Gelişmiş Python, SQL ve Scikit-Learn kütüphaneleri kullanımı.',
          'İş zekası araçlarında (Tableau, PowerBI) raporlama yetkinliği.'
        ],
        improvements: [
          'Büyük veri teknolojileri (Spark, Hadoop) pratik tecrübesi sınırlı seviyede.'
        ],
        experienceExplanation: 'Talep edilen 3 yıl veri bilimi tecrübesini tam olarak karşılamaktadır.',
        culturalExplanation: 'Araştırmacı ruhu ve veri odaklı karar verme mekanizması şirket vizyonuyla son derece uyumludur.'
      }
    }
  },
  {
    id: 'cand_zeynep',
    name: 'Zeynep Kaya',
    role: 'Product Manager',
    experienceYears: 4,
    location: 'İzmir',
    avatarUrl: 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?auto=format&fit=crop&q=80&w=400',
    skills: ['Agile', 'Scrum', 'Jira', 'Product Roadmap', 'User Research', 'A/B Testing'],
    tags: ['Agile', 'Scrum', 'Product Manager'],
    bio: 'Çevik (Agile) ürün yönetimi süreçlerinde 4 yıl deneyimli Ürün Yöneticisi. Kullanıcı araştırmaları, yol haritası (roadmap) planlaması ve çapraz fonksiyonlu ekiplerle koordinasyon konusunda güçlü beceriler.',
    matchDetails: {}
  }
];

export const INITIAL_JOBS: Job[] = [
  {
    id: 'job_tech_solutions',
    title: 'Yazılım Geliştirme Takım Lideri',
    company: 'Tech Solutions A.Ş.',
    location: 'İstanbul',
    type: 'Tam Zamanlı',
    workModel: 'Hibrit',
    salaryText: 'Rekabetçi',
    description: 'Büyüyen yazılım ekibimize liderlik edecek, teknik mimariyi belirleyecek ve modern web standartlarında yüksek kaliteli kod standartları oluşturacak Yazılım Takım Lideri arıyoruz.',
    skills: ['React', 'Node.js', 'TypeScript', 'GraphQL', 'Sürekli Öğrenme', 'Çevik (Agile) Metodoloji'],
    tags: ['React', 'Node.js', 'TypeScript', 'Liderlik'],
    postedAt: '2 gün önce',
    applicationsCount: 42,
    aiMatchCount: 5,
    logoLetter: 'S'
  },
  {
    id: 'job_frontend_techcorp',
    title: 'Senior Frontend Developer',
    company: 'TechCorp A.Ş.',
    location: 'İstanbul',
    type: 'Tam Zamanlı',
    workModel: 'Hibrit',
    salaryText: 'Rekabetçi',
    description: 'Kullanıcı dostu, yüksek performanslı ve modern web arayüzleri geliştirecek, React ve TypeScript konularında uzman, tasarım ekibiyle koordineli çalışacak kıdemli arayüz geliştirici arıyoruz.',
    skills: ['React', 'TypeScript', 'Tailwind CSS', 'Redux', 'UI/UX'],
    tags: ['React', 'TypeScript', 'UI/UX'],
    postedAt: '3 gün önce',
    applicationsCount: 124,
    aiMatchCount: 18,
    logoLetter: 'T'
  },
  {
    id: 'job_dataminds',
    title: 'Data Scientist',
    company: 'DataMinds Ltd.',
    location: 'Ankara',
    type: 'Tam Zamanlı',
    workModel: 'Uzaktan',
    salaryText: 'Rekabetçi',
    description: 'Veri analitiği ve yapay zeka modelleri üzerine çalışacak, makine öğrenmesi algoritmaları geliştirecek ve iş kararlarını yönlendirecek içgörüler sağlayacak veri bilimci arıyoruz.',
    skills: ['Python', 'Machine Learning', 'SQL', 'TensorFlow', 'Tableau'],
    tags: ['Python', 'Machine Learning', 'SQL'],
    postedAt: '4 gün önce',
    applicationsCount: 75,
    aiMatchCount: 8,
    logoLetter: 'D'
  },
  {
    id: 'job_fullstack_finanssoft',
    title: 'Full Stack Mühendisi',
    company: 'FinansSoft',
    location: 'İzmir',
    type: 'Tam Zamanlı',
    workModel: 'Hibrit',
    salaryText: 'Rekabetçi',
    description: 'Finansal yazılım çözümlerimizi geliştirecek, hem frontend hem backend katmanlarında görev alarak güvenli ve ölçeklenebilir mimariler tasarlayacak tam yığın yazılım mühendisi arıyoruz.',
    skills: ['Node.js', 'React', 'PostgreSQL', 'Docker', 'Redis'],
    tags: ['Node.js', 'React', 'PostgreSQL'],
    postedAt: '1 hafta önce',
    applicationsCount: 86,
    aiMatchCount: 9,
    logoLetter: 'F'
  },
  {
    id: 'job_ai_techvision',
    title: 'Kıdemli Yapay Zeka Mühendisi',
    company: 'TechVision Analytics',
    location: 'İstanbul',
    type: 'Tam Zamanlı',
    workModel: 'Hibrit',
    salaryText: 'Rekabetçi',
    description: 'Gelişmiş doğal dil işleme (NLP) modelleri oluşturacak, büyük veri kümeleri üzerinde çalışacak ve ürün ekibimizle entegre olarak yapay zeka destekli yenilikçi çözümler üretecek deneyimli bir mühendis arıyoruz.',
    skills: ['Python', 'TensorFlow', 'NLP', 'PyTorch', 'BERT'],
    tags: ['Python', 'TensorFlow', 'NLP'],
    postedAt: '3 gün önce',
    applicationsCount: 54,
    aiMatchCount: 12,
    logoLetter: 'V'
  },
  {
    id: 'job_fullstack_ecodata',
    title: 'Full-Stack Geliştirici',
    company: 'EcoData Solutions',
    location: 'İstanbul',
    type: 'Tam Zamanlı',
    workModel: 'Uzaktan',
    salaryText: 'Rekabetçi',
    description: 'Sürdürülebilirlik odaklı veri platformumuzu ölçeklendirmek için React ve Node.js konularında uzman, kullanıcı deneyimine önem veren tam yığın geliştirici arıyoruz.',
    skills: ['React', 'Node.js', 'PostgreSQL', 'AWS', 'GraphQL'],
    tags: ['React', 'Node.js', 'PostgreSQL'],
    postedAt: '5 gün önce',
    applicationsCount: 68,
    aiMatchCount: 11,
    logoLetter: 'E'
  },
  {
    id: 'job_veri_analisti',
    title: 'Veri Analisti',
    company: 'Global Veri Teknolojileri',
    location: 'Ankara',
    type: 'Tam Zamanlı',
    workModel: 'Uzaktan',
    salaryText: 'Rekabetçi',
    description: 'Şirket içi veri analiz raporlamalarını hazırlayacak, SQL veri sorgularını yazacak ve Tableau panelleri hazırlayarak üst yönetime sunumlar gerçekleştirecek analist arıyoruz.',
    skills: ['Python', 'SQL', 'Tableau', 'Excel', 'Raporlama'],
    tags: ['Python', 'SQL', 'Tableau'],
    postedAt: '1 hafta önce',
    applicationsCount: 86,
    aiMatchCount: 9,
    logoLetter: 'G'
  }
];
