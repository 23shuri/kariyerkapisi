import os
import json
import uuid
import sys
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
from app import app, db, UserModel, JobModel, bcrypt

def create_sample_data():
    with app.app_context():
        print(f"Connected database URI: {app.config['SQLALCHEMY_DATABASE_URI']}")

        default_password_hash = bcrypt.generate_password_hash('123456').decode('utf-8')

        # 1. EMPLOYERS (İşveren Profilleri)
        employers_data = [
            {
                'id': 'empl_inovasyon',
                'email': 'ik@inovasyonteknoloji.com',
                'full_name': 'Ali Kaya (İnovasyon Teknoloji A.Ş.)',
                'role': 'employer',
                'title': 'İnsan Kaynakları Direktörü',
                'location': 'Ankara',
                'bio': 'İnovasyon Teknoloji A.Ş. olarak kurumsal yazılım çözümleri ve bulut teknolojileri geliştiriyoruz.',
                'company': 'İnovasyon Teknoloji A.Ş.',
                'profile_strength': 95
            },
            {
                'id': 'empl_globalpay',
                'email': 'hr@globalpay.com',
                'full_name': 'Zeynep Demir (GlobalPay Fintek)',
                'role': 'employer',
                'title': 'İşe Alım Yöneticisi',
                'location': 'İstanbul',
                'bio': 'GlobalPay Fintek, 10 milyondan fazla kullanıcıya ödeme ve finansal altyapı hizmeti sunan yeni nesil finans kuruluşudur.',
                'company': 'GlobalPay Fintek Teknolojileri',
                'profile_strength': 90
            },
            {
                'id': 'empl_verix',
                'email': 'kariyer@verix.ai',
                'full_name': 'Mehmet Arslan (VeriX Yapay Zeka)',
                'role': 'employer',
                'title': 'CTO & Kurucu Ortak',
                'location': 'İzmir',
                'bio': 'VeriX Yapay Zeka; büyük veri işleme, doğal dil işleme (NLP) ve makine öğrenimi modelleri üzerine odaklanmaktadır.',
                'company': 'VeriX Yapay Zeka Çözümleri',
                'profile_strength': 85
            },
            {
                'id': 'empl_siberko',
                'email': 'ik@siberko.com.tr',
                'full_name': 'Elif Çelik (SiberKo Güvenlik)',
                'role': 'employer',
                'title': 'İK & Yetenek Yönetimi Uzmanı',
                'location': 'İstanbul',
                'bio': 'SiberKo Güvenlik Sistemleri, siber güvenlik denetimi, sızma testleri ve bulut güvenlik mimarisi çözümleri sunar.',
                'company': 'SiberKo Güvenlik Sistemleri',
                'profile_strength': 88
            }
        ]

        for emp in employers_data:
            existing = UserModel.query.filter((UserModel.id == emp['id']) | (UserModel.email == emp['email'])).first()
            if not existing:
                user = UserModel(
                    id=emp['id'],
                    email=emp['email'],
                    password_hash=default_password_hash,
                    full_name=emp['full_name'],
                    role=emp['role'],
                    title=emp['title'],
                    location=emp['location'],
                    bio=emp['bio'],
                    profile_strength=emp['profile_strength']
                )
                db.session.add(user)
                print(f"Added employer: {emp['full_name']}")
            else:
                print(f"Employer already exists: {emp['full_name']}")

        # 2. CANDIDATES (İş Arayan Profilleri)
        candidates_data = [
            {
                'id': 'cand_caner',
                'email': 'caner.ozturk@example.com',
                'full_name': 'Caner Öztürk',
                'role': 'candidate',
                'title': 'Full Stack Developer',
                'location': 'İstanbul',
                'experience_years': 4,
                'skills': ['React', 'Node.js', 'Python', 'PostgreSQL', 'Docker', 'TypeScript'],
                'bio': '4 yıllık Full Stack geliştirme tecrübesine sahibim. Scalable web uygulamaları ve RESTful mikroservis mimarileri üzerine çalışıyorum.',
                'work_status': 'actively_looking',
                'work_preference': 'hybrid',
                'salary_expectation': '90.000 - 110.000 TL',
                'github_url': 'https://github.com/canerozturk',
                'linkedin_url': 'https://linkedin.com/in/canerozturk',
                'profile_strength': 95,
                'education': [
                    {
                        'id': 'edu_1',
                        'school': 'İstanbul Teknik Üniversitesi',
                        'degree': 'Lisans',
                        'field': 'Bilgisayar Mühendisliği',
                        'startDate': '2016-09',
                        'endDate': '2020-06'
                    }
                ],
                'experience': [
                    {
                        'id': 'exp_1',
                        'company': 'KodTeknoloji A.Ş.',
                        'position': 'Full Stack Developer',
                        'startDate': '2020-07',
                        'endDate': '2024-05',
                        'description': 'React ve Node.js ile yüksek trafikli web platformlarının geliştirilmesi.'
                    }
                ]
            },
            {
                'id': 'cand_zeynep',
                'email': 'zeynep.aksoy@example.com',
                'full_name': 'Zeynep Aksoy',
                'role': 'candidate',
                'title': 'UI/UX & Ürün Tasarımcısı',
                'location': 'Ankara',
                'experience_years': 3,
                'skills': ['Figma', 'Adobe XD', 'Kullanıcı Araştırması', 'Wireframing', 'Design Systems', 'Prototyping'],
                'bio': 'Kullanıcı odaklı dijital ürünler tasarlıyorum. Kullanılabilirlik testleri, tasarım sistemleri ve mobil/web arayüz tasarımlarında uzmandan fazlasıyım.',
                'work_status': 'open_to_offers',
                'work_preference': 'remote',
                'salary_expectation': '75.000 - 95.000 TL',
                'portfolio_url': 'https://behance.net/zeynepaksoy',
                'linkedin_url': 'https://linkedin.com/in/zeynepaksoy-uiux',
                'profile_strength': 90,
                'education': [
                    {
                        'id': 'edu_2',
                        'school': 'ODTÜ',
                        'degree': 'Lisans',
                        'field': 'Endüstriyel Tasarım',
                        'startDate': '2017-09',
                        'endDate': '2021-06'
                    }
                ]
            },
            {
                'id': 'cand_burak',
                'email': 'burak.yildiz@example.com',
                'full_name': 'Burak Yıldız',
                'role': 'candidate',
                'title': 'Kıdemli Backend Mühendisi',
                'location': 'İzmir',
                'experience_years': 6,
                'skills': ['Java', 'Spring Boot', 'Microservices', 'Docker', 'Kubernetes', 'Redis', 'Kafka', 'PostgreSQL'],
                'bio': '6 yılı aşkın süre boyunca yüksek performanslı finansal sistemler ve dağıtık mimariler tasarlayıp geliştirdim.',
                'work_status': 'actively_looking',
                'work_preference': 'remote',
                'salary_expectation': '120.000 - 150.000 TL',
                'github_url': 'https://github.com/burakyildizdev',
                'linkedin_url': 'https://linkedin.com/in/burak-yildiz-backend',
                'profile_strength': 98,
                'education': [
                    {
                        'id': 'edu_3',
                        'school': 'Ege Üniversitesi',
                        'degree': 'Lisans',
                        'field': 'Yazılım Mühendisliği',
                        'startDate': '2014-09',
                        'endDate': '2018-06'
                    }
                ]
            },
            {
                'id': 'cand_selin',
                'email': 'selin.yilmaz@example.com',
                'full_name': 'Selin Yılmaz',
                'role': 'candidate',
                'title': 'Veri Analisti & Veri Bilimci',
                'location': 'Eskişehir',
                'experience_years': 2,
                'skills': ['Python', 'SQL', 'Pandas', 'Power BI', 'Machine Learning', 'Scikit-Learn', 'Tableau'],
                'bio': 'Veriden anlamlı iş değerleri ve kestirimci modeller çıkarmayı seviyorum. İş zekası raporlamaları ve ML modelleri hazırlıyorum.',
                'work_status': 'actively_looking',
                'work_preference': 'flexible',
                'salary_expectation': '65.000 - 80.000 TL',
                'github_url': 'https://github.com/selinyilmazdata',
                'linkedin_url': 'https://linkedin.com/in/selin-yilmaz-data',
                'profile_strength': 85
            },
            {
                'id': 'cand_emre',
                'email': 'emre.sahin@example.com',
                'full_name': 'Emre Şahin',
                'role': 'candidate',
                'title': 'Mobil Uygulama Geliştirici (Flutter & iOS)',
                'location': 'Bursa',
                'experience_years': 3,
                'skills': ['Flutter', 'Dart', 'Swift', 'iOS', 'Firebase', 'REST API', 'Bloc Pattern'],
                'bio': 'Hem iOS native hem de Flutter cross-platform ile App Store ve Play Store üzerinde 5+ yayınlanmış uygulama geliştirdim.',
                'work_status': 'actively_looking',
                'work_preference': 'remote',
                'salary_expectation': '80.000 - 100.000 TL',
                'github_url': 'https://github.com/emresahinmobile',
                'linkedin_url': 'https://linkedin.com/in/emre-sahin-flutter',
                'profile_strength': 92
            }
        ]

        for cand in candidates_data:
            existing = UserModel.query.filter((UserModel.id == cand['id']) | (UserModel.email == cand['email'])).first()
            if not existing:
                user = UserModel(
                    id=cand['id'],
                    email=cand['email'],
                    password_hash=default_password_hash,
                    full_name=cand['full_name'],
                    role=cand['role'],
                    title=cand['title'],
                    location=cand['location'],
                    experience_years=cand['experience_years'],
                    skills_json=json.dumps(cand['skills']),
                    bio=cand['bio'],
                    work_status=cand.get('work_status'),
                    work_preference=cand.get('work_preference'),
                    salary_expectation=cand.get('salary_expectation'),
                    github_url=cand.get('github_url'),
                    linkedin_url=cand.get('linkedin_url'),
                    portfolio_url=cand.get('portfolio_url'),
                    profile_strength=cand['profile_strength'],
                    education_json=json.dumps(cand.get('education', [])),
                    experience_json=json.dumps(cand.get('experience', []))
                )
                db.session.add(user)
                print(f"Added candidate: {cand['full_name']}")
            else:
                print(f"Candidate already exists: {cand['full_name']}")

        # 3. JOBS (İş İlanları)
        jobs_data = [
            {
                'id': 'job_3',
                'title': 'Full Stack Web Developer (React & Node.js)',
                'company': 'İnovasyon Teknoloji A.Ş.',
                'location': 'Ankara (Hibrit)',
                'type': 'Hibrit',
                'skills': ['React', 'Node.js', 'TypeScript', 'PostgreSQL', 'Docker'],
                'experience_level': '3-5 Yıl',
                'description': 'Büyüyen ekibimize katılmak üzere; modern frontend (React/TypeScript) ve backend (Node.js) teknolojilerine hakim, tempolu çalışma ortamına uyumlu Full Stack Developer arıyoruz.',
                'salary_range': '85.000 - 115.000 TL',
                'posted_at': ' Bugün',
                'application_count': 18,
                'candidate_matches_count': 7
            },
            {
                'id': 'job_4',
                'title': 'Kıdemli Java Backend Mühendisi',
                'company': 'GlobalPay Fintek Teknolojileri',
                'location': 'İstanbul (Tam Zamanlı)',
                'type': 'Tam Zamanlı',
                'skills': ['Java', 'Spring Boot', 'Microservices', 'Kafka', 'Redis', 'Kubernetes'],
                'experience_level': '5+ Yıl',
                'description': 'Ödeme sistemleri ve finansal veri akış altyapımızı geliştirmek üzere mikroservis mimarisinde deneyimli Kıdemli Java Yazılım Mühendisi arıyoruz.',
                'salary_range': '125.000 - 160.000 TL',
                'posted_at': ' 1 gün önce',
                'application_count': 32,
                'candidate_matches_count': 12
            },
            {
                'id': 'job_5',
                'title': 'UI/UX & Ürün Tasarımcısı',
                'company': 'VeriX Yapay Zeka Çözümleri',
                'location': 'İzmir (Uzaktan)',
                'type': 'Uzaktan',
                'skills': ['Figma', 'User Research', 'Design Systems', 'Prototyping', 'Adobe XD'],
                'experience_level': '2-4 Yıl',
                'description': 'Yapay zeka odaklı analiz panellerimizin arayüzlerini ve kullanıcı deneyimini uçtan uca tasarlayacak yetenekli bir UI/UX Tasarımcısı arıyoruz.',
                'salary_range': '70.000 - 95.000 TL',
                'posted_at': ' 2 gün önce',
                'application_count': 45,
                'candidate_matches_count': 9
            },
            {
                'id': 'job_6',
                'title': 'Mobil Uygulama Geliştirici (Flutter)',
                'company': 'SiberKo Güvenlik Sistemleri',
                'location': 'İstanbul (Hibrit)',
                'type': 'Hibrit',
                'skills': ['Flutter', 'Dart', 'iOS', 'Android', 'REST API', 'Firebase'],
                'experience_level': '2-4 Yıl',
                'description': 'Siber güvenlik mobil takip uygulamalarımızın iOS ve Android versiyonlarını Flutter ile geliştirecek Mobil Yazılım Uzmanı arıyoruz.',
                'salary_range': '80.000 - 105.000 TL',
                'posted_at': ' 3 gün önce',
                'application_count': 22,
                'candidate_matches_count': 6
            },
            {
                'id': 'job_7',
                'title': 'Veri Analisti / Data Scientist',
                'company': 'DataMinds Ltd.',
                'location': 'Ankara (Uzaktan)',
                'type': 'Uzaktan',
                'skills': ['Python', 'SQL', 'Pandas', 'Machine Learning', 'Power BI'],
                'experience_level': '2+ Yıl',
                'description': 'Geniş ölçekli veri kümelerinden eyleme dökülebilir iş zekası çıktısı ve tahminsel modeller üretecek Veri Analisti/Bilimci arıyoruz.',
                'salary_range': '75.000 - 95.000 TL',
                'posted_at': ' 4 gün önce',
                'application_count': 56,
                'candidate_matches_count': 14
            },
            {
                'id': 'job_8',
                'title': 'DevOps & Bulut Mimar Mühendisi',
                'company': 'İnovasyon Teknoloji A.Ş.',
                'location': 'İstanbul (Tam Zamanlı)',
                'type': 'Tam Zamanlı',
                'skills': ['AWS', 'Docker', 'Kubernetes', 'Terraform', 'CI/CD', 'Linux'],
                'experience_level': '3+ Yıl',
                'description': 'AWS ve on-premise altyapılarımızın sürekliliğini sağlamak, CI/CD süreçlerini otomatize etmek üzere DevOps Mühendisi arıyoruz.',
                'salary_range': '100.000 - 135.000 TL',
                'posted_at': ' 5 gün önce',
                'application_count': 19,
                'candidate_matches_count': 8
            }
        ]

        for j in jobs_data:
            existing = JobModel.query.filter_by(id=j['id']).first()
            if not existing:
                job = JobModel(
                    id=j['id'],
                    title=j['title'],
                    company=j['company'],
                    location=j['location'],
                    type=j['type'],
                    skills_json=json.dumps(j['skills']),
                    experience_level=j['experience_level'],
                    description=j['description'],
                    salary_range=j['salary_range'],
                    posted_at=j['posted_at'],
                    application_count=j['application_count'],
                    candidate_matches_count=j['candidate_matches_count']
                )
                db.session.add(job)
                print(f"Added job: {j['title']} @ {j['company']}")
            else:
                print(f"Job already exists: {j['title']}")

        db.session.commit()
        print("✅ Sample data successfully added to the database!")

if __name__ == '__main__':
    create_sample_data()
