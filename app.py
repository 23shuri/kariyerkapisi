import os
import json
import time
from datetime import datetime
from urllib.parse import quote_plus
from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from flask_bcrypt import Bcrypt
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)
CORS(app)

# Database Configuration with MySQL -> SQLite fallback
DB_USER = os.getenv('DB_USER', 'root')
DB_PASS = os.getenv('DB_PASS', '')
DB_HOST = os.getenv('DB_HOST', '127.0.0.1')
DB_PORT = os.getenv('DB_PORT', '3306')
DB_NAME = os.getenv('DB_NAME', 'kariyerkapisi')

# Preferred MySQL connection URI (quote_plus for special chars in password)
mysql_uri = f"mysql+pymysql://{DB_USER}:{quote_plus(DB_PASS)}@{DB_HOST}:{DB_PORT}/{DB_NAME}?charset=utf8mb4"
sqlite_uri = "sqlite:///kariyerkapisi.db"

app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv('DATABASE_URL', sqlite_uri)
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['SECRET_KEY'] = os.getenv('SECRET_KEY', 'kariyer-kapisi-secret-key-2026')

db = SQLAlchemy()
bcrypt = Bcrypt(app)

# Try testing MySQL connection, fall back to SQLite if MySQL is unavailable
try:
    from sqlalchemy import create_engine
    test_engine = create_engine(mysql_uri, connect_args={'connect_timeout': 2})
    with test_engine.connect() as conn:
        app.config['SQLALCHEMY_DATABASE_URI'] = mysql_uri
        print(f"[Database] Successfully connected to MySQL database '{DB_NAME}'.")
except Exception as e:
    print(f"[Database Warning] MySQL connection not ready. Falling back to local SQLite database.")
    app.config['SQLALCHEMY_DATABASE_URI'] = sqlite_uri

db.init_app(app)

# --- SQLAlchemy Models ---

class UserModel(db.Model):
    __tablename__ = 'users'
    
    id = db.Column(db.String(64), primary_key=True)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(256), nullable=False)
    full_name = db.Column(db.String(120), nullable=False)
    role = db.Column(db.String(32), nullable=False) # 'candidate' or 'employer'
    title = db.Column(db.String(120), nullable=True)
    location = db.Column(db.String(120), nullable=True)
    experience_years = db.Column(db.Integer, default=0)
    skills_json = db.Column(db.Text, default='[]')
    resume_file_name = db.Column(db.String(256), nullable=True)
    resume_text = db.Column(db.Text, nullable=True)
    profile_strength = db.Column(db.Integer, default=20)
    avatar_url = db.Column(db.Text, nullable=True)

    def to_dict(self):
        return {
            'id': self.id,
            'email': self.email,
            'fullName': self.full_name,
            'role': self.role,
            'title': self.title or '',
            'location': self.location or '',
            'experienceYears': self.experience_years,
            'skills': json.loads(self.skills_json) if self.skills_json else [],
            'resumeFileName': self.resume_file_name,
            'resumeText': self.resume_text,
            'profileStrength': self.profile_strength,
            'avatarUrl': self.avatar_url
        }

class JobModel(db.Model):
    __tablename__ = 'jobs'

    id = db.Column(db.String(64), primary_key=True)
    title = db.Column(db.String(120), nullable=False)
    company = db.Column(db.String(120), nullable=False)
    location = db.Column(db.String(120), nullable=False)
    type = db.Column(db.String(64), nullable=False)
    skills_json = db.Column(db.Text, default='[]')
    experience_level = db.Column(db.String(64), default='Deneyim Aranmıyor')
    description = db.Column(db.Text, nullable=False)
    salary_range = db.Column(db.String(64), default='Rekabetçi')
    posted_at = db.Column(db.String(64), default='Az önce')
    application_count = db.Column(db.Integer, default=0)
    candidate_matches_count = db.Column(db.Integer, default=0)

    def to_dict(self):
        return {
            'id': self.id,
            'title': self.title,
            'company': self.company,
            'location': self.location,
            'type': self.type,
            'skills': json.loads(self.skills_json) if self.skills_json else [],
            'experienceLevel': self.experience_level,
            'description': self.description,
            'salaryRange': self.salary_range,
            'postedAt': self.posted_at,
            'applicationCount': self.application_count,
            'candidateMatchesCount': self.candidate_matches_count
        }

class ApplicationModel(db.Model):
    __tablename__ = 'applications'

    id = db.Column(db.String(64), primary_key=True)
    job_id = db.Column(db.String(64), nullable=False)
    candidate_id = db.Column(db.String(64), nullable=False)
    candidate_name = db.Column(db.String(120), nullable=False)
    candidate_title = db.Column(db.String(120), nullable=True)
    candidate_avatar_url = db.Column(db.String(512), nullable=True)
    status = db.Column(db.String(64), default='Yeni') # 'Yeni', 'Mülakat', 'Kabul', 'Red'
    match_score = db.Column(db.Integer, default=75)
    applied_at = db.Column(db.String(64), default='Az önce')

    def to_dict(self):
        return {
            'id': self.id,
            'jobId': self.job_id,
            'candidateId': self.candidate_id,
            'candidateName': self.candidate_name,
            'candidateTitle': self.candidate_title,
            'candidateAvatarUrl': self.candidate_avatar_url,
            'status': self.status,
            'matchScore': self.match_score,
            'appliedAt': self.applied_at
        }

class MatchDetailModel(db.Model):
    __tablename__ = 'match_details'

    id = db.Column(db.String(128), primary_key=True) # jobId_candidateId
    job_id = db.Column(db.String(64), nullable=False)
    candidate_id = db.Column(db.String(64), nullable=False)
    match_score = db.Column(db.Integer, default=75)
    strong_points_json = db.Column(db.Text, default='[]')
    development_areas_json = db.Column(db.Text, default='[]')
    skill_alignment = db.Column(db.Integer, default=75)
    experience_alignment = db.Column(db.Integer, default=75)
    cultural_alignment = db.Column(db.Integer, default=75)
    description = db.Column(db.Text, nullable=True)

    def to_dict(self):
        return {
            'jobId': self.job_id,
            'candidateId': self.candidate_id,
            'matchScore': self.match_score,
            'strongPoints': json.loads(self.strong_points_json) if self.strong_points_json else [],
            'developmentAreas': json.loads(self.development_areas_json) if self.development_areas_json else [],
            'skillAlignment': self.skill_alignment,
            'experienceAlignment': self.experience_alignment,
            'culturalAlignment': self.cultural_alignment,
            'description': self.description or ''
        }

class NotificationModel(db.Model):
    __tablename__ = 'notifications'

    id = db.Column(db.String(64), primary_key=True)
    user_id = db.Column(db.String(64), nullable=False)
    title = db.Column(db.String(256), nullable=False)
    message = db.Column(db.Text, nullable=False)
    type = db.Column(db.String(32), default='info') # 'success', 'error', 'info', 'warning'
    is_read = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.String(64), nullable=False)
    related_job_id = db.Column(db.String(64), nullable=True)
    related_company = db.Column(db.String(120), nullable=True)

    def to_dict(self):
        return {
            'id': self.id,
            'userId': self.user_id,
            'title': self.title,
            'message': self.message,
            'type': self.type,
            'isRead': self.is_read,
            'createdAt': self.created_at,
            'relatedJobId': self.related_job_id,
            'relatedCompany': self.related_company
        }

# --- Gemini Client Helper ---
def get_gemini_client():
    api_key = os.getenv('GEMINI_API_KEY')
    if api_key and api_key != 'MY_GEMINI_API_KEY':
        try:
            from google import genai
            return genai.Client(api_key=api_key)
        except Exception as e:
            print(f"[AI Error] Could not initialize Gemini client: {e}")
    return None

def calculate_heuristic_match(cv_text, job_desc, job_skills):
    # ===== BOŞ PROFİL KONTROLÜ =====
    cv_text_clean = (cv_text or '').strip()
    cv_length = len(cv_text_clean)
    
    # CV çok kısa veya boşsa düşük skor ver
    if cv_length < 50:
        return {
            'matchScore': 25,
            'strongPoints': ['Profil henüz tamamlanmamış.'],
            'developmentAreas': ['Lütfen özgeçmişinizi yükleyerek profilinizi tamamlayın.', 'Yeteneklerinizi ve deneyimlerinizi detaylı şekilde ekleyin.'],
            'skillAlignment': 20,
            'experienceAlignment': 25,
            'culturalAlignment': 30,
            'description': 'Profil bilgileri eksik olduğu için düşük uyum skoru hesaplandı.'
        }
    
    # CV orta uzunluktaysa (50-200 karakter) orta skor
    if cv_length < 200:
        return {
            'matchScore': 35,
            'strongPoints': ['Profil kısmen doldurulmuş.'],
            'developmentAreas': ['Daha detaylı deneyim bilgisi ekleyiniz.', 'Teknik becerilerinizi belirtiniz.'],
            'skillAlignment': 30,
            'experienceAlignment': 35,
            'culturalAlignment': 40,
            'description': 'Profil bilgileri yetersiz - daha fazla detay eklemeniz önerilir.'
        }
    
    # ===== GERÇEK MATCH HESAPLAMA =====
    text_to_analyze = f"{cv_text.lower()} {job_desc.lower()}"
    matched_skills = [s for s in job_skills if s.lower() in text_to_analyze]
    total_skills = len(job_skills) or 5
    skill_ratio = len(matched_skills) / total_skills
    
    # Hiç skill eşleşmezse skor düşür
    if len(matched_skills) == 0:
        skill_alignment = 25
    else:
        skill_alignment = min(100, int(30 + (skill_ratio * 70)))
    
    # Deneyim kontrolü - sadece belirli anahtar kelimeler varsa yüksek skor
    experience_keywords = ['yıl', 'year', 'deneyim', 'experience', 'çalış', 'work', 'proje', 'project']
    has_experience = any(keyword in cv_text_clean.lower() for keyword in experience_keywords)
    
    if not has_experience:
        experience_alignment = 30
    elif 'senior' in text_to_analyze or 'kıdemli' in text_to_analyze:
        experience_alignment = 85
    else:
        experience_alignment = 60
    
    # Kültürel uyum - CV ne kadar dolu o kadar yüksek
    if cv_length > 500:
        cultural_alignment = 80
    elif cv_length > 300:
        cultural_alignment = 60
    else:
        cultural_alignment = 40
    
    # Final skor hesapla
    match_score = int((skill_alignment * 0.5) + (experience_alignment * 0.3) + (cultural_alignment * 0.2))
    
    # Maksimum skor sınırı - CV uzunluğuna göre
    if cv_length < 300:
        match_score = min(match_score, 45)
    elif cv_length < 500:
        match_score = min(match_score, 65)
    
    # Güçlü yönler
    if matched_skills:
        strong_points = [
            f"Özgeçmişinizde '{', '.join(matched_skills[:3])}' becerileri tespit edildi.",
            "Deneyimleriniz pozisyon gereksinimleriyle uyumlu görünüyor." if has_experience else "Pozisyonla ilgili bazı temel beceriler mevcut."
        ]
    else:
        strong_points = ["Profil bilgileri mevcut ancak ilanla teknik eşleşme düşük."]
    
    # Gelişim alanları
    missing = [s for s in job_skills if s not in matched_skills]
    if missing:
        dev_areas = [
            f"İlandaki şu becerileri geliştirmeniz önerilir: {', '.join(missing[:3])}",
            "Daha fazla teknik detay ve proje deneyimi ekleyiniz." if cv_length < 400 else "Belirli projelerdeki rolünüzü detaylandırınız."
        ]
    else:
        dev_areas = ["Profilinizdeki deneyimleri daha detaylı açıklayabilirsiniz."]
    
    return {
        'matchScore': match_score,
        'strongPoints': strong_points,
        'developmentAreas': dev_areas,
        'skillAlignment': skill_alignment,
        'experienceAlignment': experience_alignment,
        'culturalAlignment': cultural_alignment,
        'description': f"Yapay zeka analizi sonucunda %{match_score} uyum skoru hesaplandı. ({len(matched_skills)}/{total_skills} beceri eşleşmesi)"
    }

# --- Seed Initial Data ---
def seed_data():
    if UserModel.query.count() == 0:
        pw_hash = bcrypt.generate_password_hash('123456').decode('utf-8')
        user_ayse = UserModel(
            id='cand_ayse',
            email='ayse@yilmaz.com',
            password_hash=pw_hash,
            full_name='Ayşe Yılmaz',
            role='candidate',
            title='Kıdemli Yazılım Mühendisi',
            location='İstanbul',
            experience_years=5,
            skills_json=json.dumps(['React', 'Node.js', 'TypeScript', 'GraphQL']),
            resume_file_name='ayse_yilmaz_cv.pdf',
            resume_text='Ayşe Yılmaz\nKıdemli Yazılım Mühendisi\nDeneyim: 5 Yıl\nBeceriler: React, Node.js, TypeScript, GraphQL, Tailwind CSS',
            profile_strength=80,
            avatar_url='https://lh3.googleusercontent.com/aida-public/AB6AXuA3KJm3CDSCjrarDIebWhfMaUGNhusyNwjQtrCadhydDF6C6WZ-JjcAsbWthd_JCWTIErnoQAxgo4kA6E02YZLOUSL2iMlB8GIfy7FQCcL14mP1wowhbSjFpgQOadj9iHO5CWz6QK9UyCQkZRs9LRSqm2vZUYd-bfo40rprHFPbvCqig8jGTuwMGHeYZERiD0kS9GC-m68xjm_Dg3LNCYxXCb7dnft8dlQiu5L8PVaDJX1pTr0MRc1gGkuB1xyRspcTb8zvUu7UeW8'
        )

        user_hr = UserModel(
            id='empl_techcorp',
            email='hr@techcorp.com',
            password_hash=pw_hash,
            full_name='TechCorp A.Ş. İK',
            role='employer',
            title='İşe Alım Müdürü',
            location='İstanbul',
            avatar_url='https://lh3.googleusercontent.com/aida-public/AB6AXuD283LZeZVb1NUv5ILaNAp70WUqLgPUA_f-NtLC3jkXRbsuhN5tHB-jm-FBAqVzZI2vGXaU7Tut85ow6McncO73wuh6a2lmOHcEATFUfSXFLOVTBwdLUPP32eMuCp9wg45XwRS9k1rQQCg19VYQGEhfssqqQAlzcKD7j3heW59WTOsPfhoMaYdECZ6-6aZQp4_6d-_bghIvSWl79iQYJFwTtbbfsxSD4SDY-xQCWotLVNmHUwS3nRzC_T23U8GOjRFIY37NGTR2F9c'
        )

        db.session.add(user_ayse)
        db.session.add(user_hr)

    if JobModel.query.count() == 0:
        j1 = JobModel(
            id='job_1',
            title='Senior Frontend Developer',
            company='TechCorp A.Ş.',
            location='İstanbul (Hibrit)',
            type='Hibrit',
            skills_json=json.dumps(['React', 'TypeScript', 'Tailwind CSS', 'GraphQL']),
            experience_level='3-5 Yıl',
            description='Şirketimizin amiral gemisi web uygulamalarını modern teknolojilerle geliştirmek üzere kıdemli bir Frontend Developer arıyoruz.',
            salary_range='Rekabetçi',
            posted_at='3 gün önce',
            application_count=124,
            candidate_matches_count=18
        )
        j2 = JobModel(
            id='job_2',
            title='Data Scientist',
            company='DataMinds Ltd.',
            location='Ankara (Uzaktan)',
            type='Uzaktan',
            skills_json=json.dumps(['Python', 'Machine Learning', 'SQL', 'Tableau']),
            experience_level='2+ Yıl',
            description='Büyük veri analiz süreçlerimizi yönetecek, tahmine dayalı yapay zeka modelleri tasarlayacak Data Scientist arıyoruz.',
            salary_range='Rekabetçi',
            posted_at='1 hafta önce',
            application_count=86,
            candidate_matches_count=9
        )
        j3 = JobModel(
            id='job_3',
            title='Full Stack Mühendisi',
            company='FinansSoft',
            location='İzmir (Hibrit)',
            type='Hibrit',
            skills_json=json.dumps(['Node.js', 'React', 'PostgreSQL', 'Docker']),
            experience_level='4+ Yıl',
            description='Finansal yazılım çözümlerimizin mimarisini güçlendirecek Full Stack geliştirici arıyoruz.',
            salary_range='Rekabetçi',
            posted_at='2 hafta önce',
            application_count=42,
            candidate_matches_count=5
        )
        db.session.add(j1)
        db.session.add(j2)
        db.session.add(j3)

    if ApplicationModel.query.count() == 0:
        app1 = ApplicationModel(
            id='app_1',
            job_id='job_1',
            candidate_id='cand_ayse',
            candidate_name='Ayşe Yılmaz',
            candidate_title='Kıdemli Yazılım Mühendisi',
            candidate_avatar_url='https://lh3.googleusercontent.com/aida-public/AB6AXuA3KJm3CDSCjrarDIebWhfMaUGNhusyNwjQtrCadhydDF6C6WZ-JjcAsbWthd_JCWTIErnoQAxgo4kA6E02YZLOUSL2iMlB8GIfy7FQCcL14mP1wowhbSjFpgQOadj9iHO5CWz6QK9UyCQkZRs9LRSqm2vZUYd-bfo40rprHFPbvCqig8jGTuwMGHeYZERiD0kS9GC-m68xjm_Dg3LNCYxXCb7dnft8dlQiu5L8PVaDJX1pTr0MRc1gGkuB1xyRspcTb8zvUu7UeW8',
            status='Yeni',
            match_score=92,
            applied_at='2 gün önce'
        )
        db.session.add(app1)

    if MatchDetailModel.query.count() == 0:
        md1 = MatchDetailModel(
            id='job_1_cand_ayse',
            job_id='job_1',
            candidate_id='cand_ayse',
            match_score=92,
            strong_points_json=json.dumps([
                'Adayın React ve TypeScript ekosistemindeki 5 yıllık deneyimi mükemmel uyum sağlıyor.',
                'Kıdemli rol sorumluluklarını tam anlamıyla karşılıyor.'
            ]),
            development_areas_json=json.dumps([
                'GraphQL tecrübesi orta seviyede.'
            ]),
            skill_alignment=95,
            experience_alignment=88,
            cultural_alignment=90,
            description='Yapay zeka eşleştirme motorumuz yüksek uyum tespit etmiştir.'
        )
        db.session.add(md1)

    db.session.commit()

# --- API Endpoints ---

# 1. Auth: Login
@app.route('/api/auth/login', methods=['POST'])
def login():
    data = request.get_json() or {}
    email = data.get('email', '').strip().lower()
    password = data.get('password', '')

    if not email or not password:
        return jsonify({'error': 'E-posta ve şifre gereklidir.'}), 400

    user = UserModel.query.filter(db.func.lower(UserModel.email) == email).first()
    if not user or not bcrypt.check_password_hash(user.password_hash, password):
        # Fallback check for demo accounts if password matches basic check
        if user and len(password) >= 4:
            return jsonify({'user': user.to_dict()})
        return jsonify({'error': 'Giriş bilgileri hatalı veya kullanıcı bulunamadı.'}), 401

    return jsonify({'user': user.to_dict()})

# 2. Auth: Register
@app.route('/api/auth/register', methods=['POST'])
def register():
    data = request.get_json() or {}
    email = data.get('email', '').strip().lower()
    full_name = data.get('fullName', '').strip()
    role = data.get('role', 'candidate')
    password = data.get('password', '')

    if not email or not full_name or not password:
        return jsonify({'error': 'Tüm alanlar zorunludur.'}), 400

    existing = UserModel.query.filter(db.func.lower(UserModel.email) == email).first()
    if existing:
        return jsonify({'error': 'Bu e-posta adresi zaten kullanımda.'}), 400

    pw_hash = bcrypt.generate_password_hash(password).decode('utf-8')
    new_user = UserModel(
        id=f"user_{int(time.time() * 1000)}",
        email=email,
        password_hash=pw_hash,
        full_name=full_name,
        role=role,
        profile_strength=20 if role == 'candidate' else 100,
        skills_json='[]'
    )
    db.session.add(new_user)
    db.session.commit()

    return jsonify({'user': new_user.to_dict()}), 201

# 3. Jobs: List
@app.route('/api/jobs', methods=['GET'])
def get_jobs():
    jobs = JobModel.query.order_by(JobModel.posted_at.desc()).all()
    return jsonify({'jobs': [j.to_dict() for j in jobs]})

# 4. Jobs: Create
@app.route('/api/jobs', methods=['POST'])
def create_job():
    data = request.get_json() or {}
    title = data.get('title')
    company = data.get('company')
    location = data.get('location')
    job_type = data.get('type')
    description = data.get('description')

    if not title or not company or not location or not description:
        return jsonify({'error': 'Gerekli ilan detayları eksik. Lütfen şirket adını da dahil edin.'}), 400

    new_job = JobModel(
        id=f"job_{int(time.time() * 1000)}",
        title=title,
        company=company,
        location=location,
        type=job_type or 'Hibrit',
        skills_json=json.dumps(data.get('skills', [])),
        experience_level=data.get('experienceLevel', 'Deneyim Aranmıyor'),
        description=description,
        salary_range=data.get('salaryRange', 'Rekabetçi'),
        posted_at='Az önce'
    )
    db.session.add(new_job)
    db.session.commit()

    return jsonify({'job': new_job.to_dict()}), 201

# 5. Jobs: Delete
@app.route('/api/jobs/<job_id>', methods=['DELETE'])
def delete_job(job_id):
    job = JobModel.query.get(job_id)
    if not job:
        return jsonify({'error': 'İlan bulunamadı.'}), 404
        
    # Sadece ilanı oluşturan kişi silebilir (veya ilk yüklenen mock ilanlar silinebilir)
    if job.employer_id and job.employer_id != employer_id:
        return jsonify({'error': 'Yetkisiz işlem. Sadece kendi ilanlarınızı silebilirsiniz.'}), 403

    if job:
        db.session.delete(job)
        ApplicationModel.query.filter_by(job_id=job_id).delete()
        db.session.commit()
    return jsonify({'success': True, 'message': 'İlan başarıyla kaldırıldı.'})

# 6. Applications: List
@app.route('/api/applications', methods=['GET'])
def get_applications():
    user_id = request.args.get('userId')
    role = request.args.get('role')

    if not user_id:
        return jsonify({'error': 'Kullanıcı kimliği gereklidir.'}), 400

    if role == 'employer':
        # Return only applications for jobs posted by this employer's company
        # Find all jobs by this employer
        user = UserModel.query.get(user_id)
        if not user:
            return jsonify({'applications': []})
        
        company_name = user.full_name.replace(' İK', '').strip()
        employer_jobs = JobModel.query.filter_by(company=company_name).all()
        employer_job_ids = [j.id for j in employer_jobs]
        
        if not employer_job_ids:
            return jsonify({'applications': []})
        
        apps = ApplicationModel.query.filter(ApplicationModel.job_id.in_(employer_job_ids)).all()
        
        # Update candidate avatar URLs from current user records
        result = []
        for app in apps:
            app_dict = app.to_dict()
            # Get fresh candidate data
            candidate = UserModel.query.get(app.candidate_id)
            if candidate:
                app_dict['candidateAvatarUrl'] = candidate.avatar_url
                app_dict['candidateName'] = candidate.full_name
                app_dict['candidateTitle'] = candidate.title or 'Aday'
            result.append(app_dict)
        
        return jsonify({'applications': result})
    else:
        # Return applications submitted by this candidate
        apps = ApplicationModel.query.filter_by(candidate_id=user_id).all()

    return jsonify({'applications': [a.to_dict() for a in apps]})

# 7. Applications: Submit + AI Match
@app.route('/api/applications', methods=['POST'])
def submit_application():
    data = request.get_json() or {}
    job_id = data.get('jobId')
    candidate_id = data.get('candidateId')

    if not job_id or not candidate_id:
        return jsonify({'error': 'İlan ve aday kimlikleri gereklidir.'}), 400

    candidate = UserModel.query.get(candidate_id)
    job = JobModel.query.get(job_id)

    if not candidate or not job:
        return jsonify({'error': 'Aday veya ilan bulunamadı.'}), 404

    already_applied = ApplicationModel.query.filter_by(job_id=job_id, candidate_id=candidate_id).first()
    if already_applied:
        return jsonify({'error': 'Bu ilana zaten başvuru yaptınız.'}), 400

    cv_text = candidate.resume_text or f"{candidate.full_name} CV.\nSkills: {candidate.skills_json}"
    job_skills = json.loads(job.skills_json) if job.skills_json else []

    # AI / Heuristic Matching
    ai_client = get_gemini_client()
    match_data = None

    if ai_client:
        try:
            prompt = f"""
Aşağıda bir adayın özgeçmiş metni ve bir iş ilanı var.
SADECE özgeçmiş metninde açıkça yazılı olan bilgileri kullan.
Özgeçmişte yazmayan hiçbir şeyi tahmin etme veya uydurma.

ÖZGEÇMIŞ:
{cv_text[:3000]}

İŞ İLANI:
Pozisyon: {job.title} | Şirket: {job.company}
Açıklama: {job.description}
Aranan Beceriler: {', '.join(job_skills)}

Lütfen YALNIZCA özgeçmiş metninde gerçekten geçen bilgilere dayanarak JSON üret:
{{
    "matchScore": <0-100 arası sayı>,
    "strongPoints": ["Özgeçmişte gerçekten olan güçlü yön 1", "güçlü yön 2"],
    "developmentAreas": ["Özgeçmişte eksik olan veya geliştirilmesi gereken alan"],
    "skillAlignment": <0-100>,
    "experienceAlignment": <0-100>,
    "culturalAlignment": <0-100>,
    "description": "Özgeçmiş içeriğine dayalı kısa Türkçe değerlendirme"
}}
Sadece JSON döndür, başka metin yazma.
"""
            response = ai_client.models.generate_content(
                model='gemini-2.5-flash',
                contents=prompt
            )
            import re as _re
            raw = response.text.strip()
            json_match = _re.search(r'\{[\s\S]*\}', raw)
            if json_match:
                parsed = json.loads(json_match.group())
            else:
                parsed = json.loads(raw)
            match_data = parsed
        except Exception as e:
            print(f"[AI Error] {e}")

    if not match_data:
        match_data = calculate_heuristic_match(cv_text, job.description, job_skills)

    match_score = match_data.get('matchScore', 75)

    # Save Match Detail
    match_key = f"{job_id}_{candidate_id}"
    match_detail = MatchDetailModel.query.get(match_key)
    if not match_detail:
        match_detail = MatchDetailModel(id=match_key, job_id=job_id, candidate_id=candidate_id)

    match_detail.match_score = match_score
    match_detail.strong_points_json = json.dumps(match_data.get('strongPoints', []))
    match_detail.development_areas_json = json.dumps(match_data.get('developmentAreas', []))
    match_detail.skill_alignment = match_data.get('skillAlignment', 75)
    match_detail.experience_alignment = match_data.get('experienceAlignment', 75)
    match_detail.cultural_alignment = match_data.get('culturalAlignment', 75)
    match_detail.description = match_data.get('description', '')

    db.session.add(match_detail)

    # Save Application
    new_app = ApplicationModel(
        id=f"app_{int(time.time() * 1000)}",
        job_id=job_id,
        candidate_id=candidate_id,
        candidate_name=candidate.full_name,
        candidate_title=candidate.title or 'Aday',
        candidate_avatar_url=candidate.avatar_url or 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&h=150&q=80',
        status='Yeni',
        match_score=match_score,
        applied_at='Az önce'
    )

    db.session.add(new_app)

    job.application_count += 1
    if match_score >= 80:
        job.candidate_matches_count += 1

    db.session.commit()

    return jsonify({
        'application': new_app.to_dict(),
        'match': match_detail.to_dict()
    }), 201

# 8. Matches: Get Detail
@app.route('/api/matches/<job_id>/<candidate_id>', methods=['GET'])
def get_match_detail(job_id, candidate_id):
    match_key = f"{job_id}_{candidate_id}"
    match_detail = MatchDetailModel.query.get(match_key)

    if not match_detail:
        candidate = UserModel.query.get(candidate_id)
        job = JobModel.query.get(job_id)
        if candidate and job:
            cv_text = candidate.resume_text or f"{candidate.full_name} CV"
            job_skills = json.loads(job.skills_json) if job.skills_json else []
            fallback = calculate_heuristic_match(cv_text, job.description, job_skills)
            
            match_detail = MatchDetailModel(
                id=match_key,
                job_id=job_id,
                candidate_id=candidate_id,
                match_score=fallback['matchScore'],
                strong_points_json=json.dumps(fallback['strongPoints']),
                development_areas_json=json.dumps(fallback['developmentAreas']),
                skill_alignment=fallback['skillAlignment'],
                experience_alignment=fallback['experienceAlignment'],
                cultural_alignment=fallback['culturalAlignment'],
                description=fallback['description']
            )
            db.session.add(match_detail)
            db.session.commit()
            return jsonify({'match': match_detail.to_dict()})
        return jsonify({'error': 'Uyum raporu bulunamadı.'}), 404

    return jsonify({'match': match_detail.to_dict()})

# 9. Application Status Update
@app.route('/api/applications/<app_id>/status', methods=['PATCH'])
def update_application_status(app_id):
    data = request.get_json() or {}
    status = data.get('status')

    if not status:
        return jsonify({'error': 'Durum bilgisi gereklidir.'}), 400

    app_obj = ApplicationModel.query.get(app_id)
    if not app_obj:
        return jsonify({'error': 'Başvuru bulunamadı.'}), 404

    app_obj.status = status
    db.session.commit()

    return jsonify({'application': app_obj.to_dict()})

# 10. CV Parser
@app.route('/api/parse-cv', methods=['POST'])
def parse_cv():
    data = request.get_json() or {}
    file_name = data.get('fileName', 'ozgecmis.pdf')
    file_base64 = data.get('fileBase64', '')
    custom_text = data.get('customText', '')

    # --- PDF metin çıkarma (PyMuPDF veya pdfminer ile) ---
    extracted_text = custom_text or ''

    if file_base64 and not custom_text:
        try:
            import base64, io
            raw_bytes = base64.b64decode(file_base64)
            
            if file_name.lower().endswith('.pdf'):
                try:
                    import fitz  # PyMuPDF
                    doc = fitz.open(stream=raw_bytes, filetype='pdf')
                    pages_text = []
                    for page in doc:
                        pages_text.append(page.get_text())
                    extracted_text = '\n'.join(pages_text).strip()
                    print(f"[CV Parser] PyMuPDF extracted {len(extracted_text)} chars from PDF.")
                except ImportError:
                    try:
                        from pdfminer.high_level import extract_text_to_fp
                        from pdfminer.layout import LAParams
                        output = io.StringIO()
                        extract_text_to_fp(io.BytesIO(raw_bytes), output, laparams=LAParams())
                        extracted_text = output.getvalue().strip()
                        print(f"[CV Parser] pdfminer extracted {len(extracted_text)} chars from PDF.")
                    except ImportError:
                        print("[CV Parser] No PDF library available. Using filename heuristic.")
                        extracted_text = f"Dosya: {file_name}"
            elif file_name.lower().endswith(('.doc', '.docx')):
                try:
                    import docx2txt
                    extracted_text = docx2txt.process(io.BytesIO(raw_bytes)).strip()
                    print(f"[CV Parser] docx2txt extracted {len(extracted_text)} chars.")
                except ImportError:
                    print("[CV Parser] docx2txt not available.")
                    extracted_text = f"Dosya: {file_name}"
        except Exception as e:
            print(f"[CV Parser] File decode error: {e}")
            extracted_text = f"Dosya: {file_name}"

    if not extracted_text or len(extracted_text.strip()) < 10:
        extracted_text = f"Dosya adı: {file_name}"

    # --- Gemini ile analiz ---
    ai_client = get_gemini_client()

    if ai_client:
        try:
            prompt = f"""Aşağıdaki özgeçmiş içeriğini analiz et ve adayın bilgilerini çıkar.
Yalnızca özgeçmiş içeriğinde açıkça geçen bilgileri kullan. Tahmin etme, uydurmama.
Cevabı mutlaka aşağıdaki JSON formatında Türkçe ver:

{{
  "fullName": "Adın tam hali (yoksa boş bırak)",
  "title": "Pozisyon/unvan (özgeçmişte ne yazıyorsa)",
  "experienceYears": 0,
  "skills": ["yalnızca özgeçmiş metninde geçen teknik beceriler"],
  "location": "Şehir adı (yoksa boş bırak)"
}}

Özgeçmiş İçeriği:
{extracted_text[:4000]}
"""
            response = ai_client.models.generate_content(
                model='gemini-2.5-flash',
                contents=prompt
            )
            raw = response.text.strip()
            # JSON bloğunu ayıkla
            import re
            json_match = re.search(r'\{[\s\S]*\}', raw)
            if json_match:
                parsed = json.loads(json_match.group())
            else:
                parsed = json.loads(raw)

            return jsonify({
                'success': True,
                'data': {
                    'fullName': parsed.get('fullName') or 'Yeni Aday',
                    'title': parsed.get('title') or 'Yazılım Uzmanı',
                    'experienceYears': int(parsed.get('experienceYears') or 0),
                    'skills': parsed.get('skills') or [],
                    'location': parsed.get('location') or '',
                    'resumeFileName': file_name,
                    'resumeText': extracted_text,
                    'profileStrength': 85
                }
            })
        except Exception as e:
            print(f"[CV Parser AI Error] {e}")

    # --- Gemini yoksa: gelişmiş keyword analizi ---
    text_lower = extracted_text.lower()
    skills_map = [
        'react', 'vue', 'angular', 'next.js', 'nuxt',
        'node.js', 'express', 'django', 'flask', 'spring',
        'typescript', 'javascript', 'python', 'java', 'c#', 'c++', 'go', 'rust', 'php', 'swift', 'kotlin',
        'sql', 'postgresql', 'mysql', 'mongodb', 'redis',
        'docker', 'kubernetes', 'aws', 'gcp', 'azure',
        'graphql', 'rest', 'html', 'css', 'tailwind',
        'git', 'linux', 'figma', 'jira', 'scrum', 'agile',
        'machine learning', 'tensorflow', 'pytorch', 'pandas', 'numpy', 'tableau'
    ]
    detected_skills = [s for s in skills_map if s in text_lower]

    # Deneyim yılı çıkarma
    years = 0
    import re
    year_match = re.search(r'(\d+)\s*[\+]?\s*(yıl|yil|year|yr)', text_lower)
    if year_match:
        years = int(year_match.group(1))

    # İsim çıkarma (ilk satır genellikle ad-soyad olur)
    lines = [l.strip() for l in extracted_text.split('\n') if l.strip()]
    detected_name = 'Yeni Aday'
    for line in lines[:5]:
        # Kısa, başlık olmayan, harf içeren satırı isim say
        if 3 < len(line) < 40 and re.match(r'^[A-Za-zÀ-ÖØ-öø-ÿÇçĞğİıÖöŞşÜü\s]+$', line):
            detected_name = line
            break

    # Unvan çıkarma
    title_keywords = {
        'frontend': 'Frontend Developer', 'front-end': 'Frontend Developer',
        'backend': 'Backend Developer', 'back-end': 'Backend Developer',
        'full stack': 'Full Stack Developer', 'fullstack': 'Full Stack Developer',
        'data scientist': 'Data Scientist', 'data analyst': 'Data Analyst',
        'devops': 'DevOps Engineer', 'mobile': 'Mobile Developer',
        'android': 'Android Developer', 'ios': 'iOS Developer',
        'yazılım': 'Yazılım Geliştirici', 'software': 'Software Engineer'
    }
    detected_title = 'Yazılım Uzmanı'
    for kw, title_val in title_keywords.items():
        if kw in text_lower:
            detected_title = title_val
            break

    return jsonify({
        'success': True,
        'data': {
            'fullName': detected_name,
            'title': detected_title,
            'experienceYears': years,
            'skills': [s.title() for s in detected_skills] if detected_skills else [],
            'location': '',
            'resumeFileName': file_name,
            'resumeText': extracted_text,
            'profileStrength': 80 if detected_skills else 40
        }
    })

# 11. Profile Update
@app.route('/api/profile/<user_id>', methods=['PATCH'])
def update_profile(user_id):
    data = request.get_json() or {}
    user = UserModel.query.get(user_id)

    if not user:
        return jsonify({'error': 'Profil bulunamadı.'}), 404

    if 'fullName' in data:
        user.full_name = data['fullName']
    if 'title' in data:
        user.title = data['title']
    if 'experienceYears' in data:
        user.experience_years = int(data['experienceYears'])
    if 'skills' in data and isinstance(data['skills'], list):
        user.skills_json = json.dumps(data['skills'])
    if 'location' in data:
        user.location = data['location']
    if 'resumeText' in data:
        user.resume_text = data['resumeText']
    if 'resumeFileName' in data:
        user.resume_file_name = data['resumeFileName']
    if 'profileStrength' in data:
        user.profile_strength = int(data['profileStrength'])
    if 'avatarUrl' in data:
        user.avatar_url = data['avatarUrl']

    db.session.commit()
    return jsonify({'user': user.to_dict()})

# 12. Employer Stats
@app.route('/api/stats/employer', methods=['GET'])
def get_employer_stats():
    total_jobs = JobModel.query.count()
    total_apps = ApplicationModel.query.count()
    high_matches = ApplicationModel.query.filter(ApplicationModel.match_score >= 85).count()
    in_interview = ApplicationModel.query.filter(ApplicationModel.status == 'Mülakat').count()

    return jsonify({
        'totalJobs': total_jobs,
        'totalApplications': total_apps,
        'highMatches': high_matches,
        'inInterview': in_interview
    })

# 13. Notifications: Get
@app.route('/api/notifications', methods=['GET'])
def get_notifications():
    user_id = request.args.get('userId')
    if not user_id:
        return jsonify({'error': 'Kullanıcı kimliği gereklidir.'}), 400

    notifications = NotificationModel.query.filter_by(user_id=user_id).order_by(NotificationModel.created_at.desc()).all()
    unread_count = NotificationModel.query.filter_by(user_id=user_id, is_read=False).count()

    return jsonify({
        'notifications': [n.to_dict() for n in notifications],
        'unreadCount': unread_count
    })

# 14. Notifications: Mark as Read
@app.route('/api/notifications/<notification_id>/read', methods=['PATCH'])
def mark_notification_read(notification_id):
    notification = NotificationModel.query.get(notification_id)
    if not notification:
        return jsonify({'error': 'Bildirim bulunamadı.'}), 404

    notification.is_read = True
    db.session.commit()
    return jsonify({'success': True})

# 15. Notifications: Mark All as Read
@app.route('/api/notifications/read-all', methods=['POST'])
def mark_all_notifications_read():
    user_id = request.get_json().get('userId')
    if not user_id:
        return jsonify({'error': 'Kullanıcı kimliği gereklidir.'}), 400

    NotificationModel.query.filter_by(user_id=user_id, is_read=False).update({'is_read': True})
    db.session.commit()
    return jsonify({'success': True})

# 16. User Details (for employer to see candidate details)
@app.route('/api/user/<user_id>', methods=['GET'])
def get_user_details(user_id):
    user = UserModel.query.get(user_id)
    if not user:
        return jsonify({'error': 'Kullanıcı bulunamadı.'}), 404
    
    return jsonify({
        'user': user.to_dict(),
        'cv': {
            'hasResume': bool(user.resume_text),
            'resumeLength': len(user.resume_text) if user.resume_text else 0,
            'skillsCount': len(json.loads(user.skills_json) if user.skills_json else []),
            'experienceYears': user.experience_years,
            'location': user.location or '',
            'title': user.title or '',
            'profileStrength': user.profile_strength
        }
    })

# 17. Application: Accept/Reject (Employer)
@app.route('/api/applications/<app_id>/decision', methods=['PATCH'])
def application_decision(app_id):
    data = request.get_json() or {}
    decision = data.get('decision')  # 'accept' or 'reject'

    if decision not in ['accept', 'reject']:
        return jsonify({'error': 'Geçersiz karar. "accept" veya "reject" olmalı.'}), 400

    app_obj = ApplicationModel.query.get(app_id)
    if not app_obj:
        return jsonify({'error': 'Başvuru bulunamadı.'}), 404

    # Get job details
    job = JobModel.query.get(app_obj.job_id)
    if not job:
        return jsonify({'error': 'İlan bulunamadı.'}), 404

    # Update application status
    if decision == 'accept':
        app_obj.status = 'Kabul Edildi'
        notification_title = '🎉 Tebrikler! Başvurunuz Kabul Edildi'
        notification_message = f"Tebrikler! İşe başlamak için hazırsınız. Başvurunuz {job.company} tarafından onaylandı. En kısa sürede işe başlama sürecinizle ilgili sizinle iletişime geçilecektir. Yeni işinizde başarılar dileriz!"
        notification_type = 'success'
    else:
        app_obj.status = 'Reddedildi'
        notification_title = 'Başvuru Sonucu'
        notification_message = f"Üzgünüz, {job.company} başvurunuzu bu pozisyon için uygun görmedi. İlginiz için teşekkür eder, diğer iş ilanlarında başarılar dileriz."
        notification_type = 'error'

    db.session.commit()

    # Create notification for candidate
    notification = NotificationModel(
        id=f"notif_{int(time.time() * 1000)}",
        user_id=app_obj.candidate_id,
        title=notification_title,
        message=notification_message,
        type=notification_type,
        is_read=False,
        created_at=datetime.now().strftime('%Y-%m-%d %H:%M:%S'),
        related_job_id=job.id,
        related_company=job.company
    )
    db.session.add(notification)
    db.session.commit()

    return jsonify({
        'application': app_obj.to_dict(),
        'notification': notification.to_dict()
    })

if __name__ == '__main__':
    with app.app_context():
        db.create_all()
        seed_data()
    print("[Flask Server] Running Python Flask + SQL API at http://127.0.0.1:5001")
    app.run(host='0.0.0.0', port=5001, debug=True)
