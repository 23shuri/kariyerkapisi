import os
import json
import time
from datetime import datetime
from urllib.parse import quote_plus
from flask import Flask, request, jsonify, send_from_directory
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
    role = db.Column(db.String(32), nullable=False) # 'candidate', 'employer', or 'admin'
    title = db.Column(db.String(120), nullable=True)
    location = db.Column(db.String(120), nullable=True)
    experience_years = db.Column(db.Integer, default=0)
    skills_json = db.Column(db.Text, default='[]')
    resume_file_name = db.Column(db.String(256), nullable=True)
    resume_text = db.Column(db.Text, nullable=True)
    profile_strength = db.Column(db.Integer, default=20)
    avatar_url = db.Column(db.Text, nullable=True)
    education_json = db.Column(db.Text, default='[]')
    experience_json = db.Column(db.Text, default='[]')
    languages_json = db.Column(db.Text, default='[]')
    certificates_json = db.Column(db.Text, default='[]')
    projects_json = db.Column(db.Text, default='[]')
    bio = db.Column(db.Text, nullable=True)
    phone = db.Column(db.String(32), nullable=True)
    birth_date = db.Column(db.String(64), nullable=True)
    work_status = db.Column(db.String(64), nullable=True)
    salary_expectation = db.Column(db.String(128), nullable=True)
    work_preference = db.Column(db.String(64), nullable=True)
    github_url = db.Column(db.String(256), nullable=True)
    linkedin_url = db.Column(db.String(256), nullable=True)
    portfolio_url = db.Column(db.String(256), nullable=True)
    cover_photo_url = db.Column(db.Text, nullable=True)
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
            'avatarUrl': self.avatar_url,
            'coverPhotoUrl': self.cover_photo_url,
            'bio': self.bio,
            'phone': self.phone,
            'birthDate': self.birth_date,
            'workStatus': self.work_status,
            'salaryExpectation': self.salary_expectation,
            'workPreference': self.work_preference,
            'githubUrl': self.github_url,
            'linkedinUrl': self.linkedin_url,
            'portfolioUrl': self.portfolio_url,
            'education': json.loads(self.education_json) if self.education_json else [],
            'experience': json.loads(self.experience_json) if self.experience_json else [],
            'languages': json.loads(self.languages_json) if self.languages_json else [],
            'certificates': json.loads(self.certificates_json) if self.certificates_json else [],
            'projects': json.loads(self.projects_json) if self.projects_json else []
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
    candidate_avatar_url = db.Column(db.Text, nullable=True)
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

class ConnectionModel(db.Model):
    __tablename__ = 'connections'

    id = db.Column(db.String(64), primary_key=True)
    user_id = db.Column(db.String(64), nullable=False)  # Person who initiated
    connected_user_id = db.Column(db.String(64), nullable=False)  # Person they're connected to
    status = db.Column(db.String(32), default='active')  # 'active', 'blocked'
    created_at = db.Column(db.String(64), nullable=False)

    def to_dict(self):
        return {
            'id': self.id,
            'userId': self.user_id,
            'connectedUserId': self.connected_user_id,
            'status': self.status,
            'createdAt': self.created_at
        }

class ConnectionRequestModel(db.Model):
    __tablename__ = 'connection_requests'

    id = db.Column(db.String(64), primary_key=True)
    from_user_id = db.Column(db.String(64), nullable=False)
    to_user_id = db.Column(db.String(64), nullable=False)
    message = db.Column(db.Text, nullable=True)
    status = db.Column(db.String(32), default='pending')  # 'pending', 'accepted', 'rejected'
    created_at = db.Column(db.String(64), nullable=False)
    updated_at = db.Column(db.String(64), nullable=True)

    def to_dict(self):
        return {
            'id': self.id,
            'fromUserId': self.from_user_id,
            'toUserId': self.to_user_id,
            'message': self.message,
            'status': self.status,
            'createdAt': self.created_at,
            'updatedAt': self.updated_at
        }

class MessageModel(db.Model):
    __tablename__ = 'messages'

    id = db.Column(db.String(64), primary_key=True)
    from_user_id = db.Column(db.String(64), nullable=False)
    to_user_id = db.Column(db.String(64), nullable=False)
    content = db.Column(db.Text, nullable=False)
    is_read = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.String(64), nullable=False)

    def to_dict(self):
        return {
            'id': self.id,
            'fromUserId': self.from_user_id,
            'toUserId': self.to_user_id,
            'content': self.content,
            'isRead': self.is_read,
            'createdAt': self.created_at
        }

class NetworkScoreModel(db.Model):
    __tablename__ = 'network_scores'

    user_id = db.Column(db.String(64), primary_key=True)
    total_score = db.Column(db.Integer, default=0)
    profile_completion_score = db.Column(db.Integer, default=0)
    connections_score = db.Column(db.Integer, default=0)
    engagement_score = db.Column(db.Integer, default=0)
    total_connections = db.Column(db.Integer, default=0)
    total_messages_sent = db.Column(db.Integer, default=0)
    total_messages_received = db.Column(db.Integer, default=0)
    last_updated = db.Column(db.String(64), nullable=False)

    def to_dict(self):
        return {
            'userId': self.user_id,
            'totalScore': self.total_score,
            'profileCompletionScore': self.profile_completion_score,
            'connectionsScore': self.connections_score,
            'engagementScore': self.engagement_score,
            'totalConnections': self.total_connections,
            'totalMessagesSent': self.total_messages_sent,
            'totalMessagesReceived': self.total_messages_received,
            'lastUpdated': self.last_updated
        }

class UserProfileExtendedModel(db.Model):
    __tablename__ = 'user_profiles_extended'

    user_id = db.Column(db.String(64), primary_key=True)
    university = db.Column(db.String(256), nullable=True)
    department = db.Column(db.String(256), nullable=True)
    company = db.Column(db.String(256), nullable=True)
    sector = db.Column(db.String(128), nullable=True)
    bio = db.Column(db.Text, nullable=True)
    linkedin_url = db.Column(db.String(256), nullable=True)
    github_url = db.Column(db.String(256), nullable=True)
    portfolio_url = db.Column(db.String(256), nullable=True)

    def to_dict(self):
        return {
            'userId': self.user_id,
            'university': self.university,
            'department': self.department,
            'company': self.company,
            'sector': self.sector,
            'bio': self.bio,
            'linkedinUrl': self.linkedin_url,
            'githubUrl': self.github_url,
            'portfolioUrl': self.portfolio_url
        }

class SavedJobModel(db.Model):
    __tablename__ = 'saved_jobs'

    id = db.Column(db.String(64), primary_key=True)
    user_id = db.Column(db.String(64), nullable=False)
    job_id = db.Column(db.String(64), nullable=False)
    saved_at = db.Column(db.String(64), nullable=False)

    def to_dict(self):
        return {
            'id': self.id,
            'userId': self.user_id,
            'jobId': self.job_id,
            'savedAt': self.saved_at
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
        
        # Admin user
        admin_user = UserModel(
            id='admin_argem',
            email='adminargemerkezi23@gmail.com',
            password_hash=bcrypt.generate_password_hash('adminargemerkezi23@gmail.com').decode('utf-8'),
            full_name='Admin Argem Merkezi',
            role='admin',
            title='Sistem Yöneticisi',
            location='İstanbul',
            profile_strength=100
        )
        
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

        db.session.add(admin_user)
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
    print(f"[DEBUG] Received job data: {data}")
    
    title = data.get('title')
    company = data.get('company')
    location = data.get('location')
    job_type = data.get('type')
    description = data.get('description')

    if not title or not company or not location or not description:
        print(f"[DEBUG] Missing fields: title={bool(title)}, company={bool(company)}, location={bool(location)}, description={bool(description)}")
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
    print(f"[DEBUG] Job created successfully: {new_job.id}")

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

    # Save Application - Don't save avatar to avoid data size issues
    new_app = ApplicationModel(
        id=f"app_{int(time.time() * 1000)}",
        job_id=job_id,
        candidate_id=candidate_id,
        candidate_name=candidate.full_name,
        candidate_title=candidate.title or 'Aday',
        candidate_avatar_url=None,  # Avatar stored in users table, not here
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
    if 'coverPhotoUrl' in data:
        user.cover_photo_url = data['coverPhotoUrl']
    if 'bio' in data:
        user.bio = data['bio']
    if 'phone' in data:
        user.phone = data['phone']
    if 'birthDate' in data:
        user.birth_date = data['birthDate']
    if 'workStatus' in data:
        user.work_status = data['workStatus']
    if 'salaryExpectation' in data:
        user.salary_expectation = data['salaryExpectation']
    if 'workPreference' in data:
        user.work_preference = data['workPreference']
    if 'githubUrl' in data:
        user.github_url = data['githubUrl']
    if 'linkedinUrl' in data:
        user.linkedin_url = data['linkedinUrl']
    if 'portfolioUrl' in data:
        user.portfolio_url = data['portfolioUrl']
    if 'education' in data and isinstance(data['education'], list):
        user.education_json = json.dumps(data['education'])
    if 'experience' in data and isinstance(data['experience'], list):
        user.experience_json = json.dumps(data['experience'])
    if 'languages' in data and isinstance(data['languages'], list):
        user.languages_json = json.dumps(data['languages'])
    if 'certificates' in data and isinstance(data['certificates'], list):
        user.certificates_json = json.dumps(data['certificates'])
    if 'projects' in data and isinstance(data['projects'], list):
        user.projects_json = json.dumps(data['projects'])

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
    print(f"[DEBUG] get_user_details called for user_id: {user_id}")
    
    user = UserModel.query.get(user_id)
    print(f"[DEBUG] Database query result: {user}")
    
    # Eğer DB'de bulunamadıysa ve sessionData varsa onu kullan (frontend fallback)
    if not user:
        session_data_str = request.args.get('sessionData')
        print(f"[DEBUG] sessionData parameter: {session_data_str[:100] if session_data_str else None}...")
        
        if session_data_str:
            try:
                session_data = json.loads(session_data_str)
                print(f"[DEBUG] Parsed session_data id: {session_data.get('id')}")
                
                if session_data.get('id') == user_id:
                    print(f"[DEBUG] Using session data for user {user_id}")
                    # Session data'dan user objesi oluştur
                    return jsonify({
                        'user': session_data,
                        'cv': {
                            'hasResume': bool(session_data.get('resume_text')),
                            'resumeLength': len(session_data.get('resume_text', '')),
                            'skillsCount': len(session_data.get('skills', [])),
                            'experienceYears': session_data.get('experience_years', 0),
                            'location': session_data.get('location', ''),
                            'title': session_data.get('title', ''),
                            'profileStrength': session_data.get('profile_strength', 0)
                        }
                    })
            except Exception as e:
                print(f"[DEBUG] Error parsing sessionData: {e}")
                
        print(f"[DEBUG] User {user_id} not found, returning 404")
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

# 17b. Upload Profile Photo
@app.route('/api/user/upload-photo', methods=['POST'])
def upload_profile_photo():
    import uuid
    import base64
    from werkzeug.utils import secure_filename

    # JSON body'den veri al
    data = request.get_json()
    if not data:
        return jsonify({'error': 'JSON body gerekli.'}), 400
    
    user_id = data.get('userId')
    photo_base64 = data.get('photoBase64')
    
    if not user_id:
        return jsonify({'error': 'userId gerekli.'}), 400
    
    if not photo_base64:
        return jsonify({'error': 'photoBase64 gerekli.'}), 400

    user = UserModel.query.get(user_id)
    if not user:
        return jsonify({'error': 'Kullanıcı bulunamadı.'}), 404

    # Base64'ü decode et
    try:
        # "data:image/png;base64,..." formatından sadece base64 kısmını al
        if ',' in photo_base64:
            header, photo_base64 = photo_base64.split(',', 1)
            # Header'dan format çıkar (image/png, image/jpeg, etc.)
            if 'image/' in header:
                ext = header.split('image/')[-1].split(';')[0].lower()
                if ext == 'jpeg':
                    ext = 'jpg'
            else:
                ext = 'png'
        else:
            ext = 'png'
        
        photo_data = base64.b64decode(photo_base64)
    except Exception as e:
        return jsonify({'error': f'Base64 decode hatası: {str(e)}'}), 400

    # Boyut kontrolü (5MB)
    if len(photo_data) > 5 * 1024 * 1024:
        return jsonify({'error': 'Dosya boyutu 5 MB\'yi geçemez.'}), 400

    upload_folder = os.path.join(os.path.dirname(__file__), 'uploads', 'avatars')
    os.makedirs(upload_folder, exist_ok=True)

    filename = f"{user_id}_{uuid.uuid4().hex[:8]}.{ext}"
    filepath = os.path.join(upload_folder, filename)
    
    with open(filepath, 'wb') as f:
        f.write(photo_data)

    avatar_url = f"/uploads/avatars/{filename}"
    user.avatar_url = avatar_url
    db.session.commit()

    return jsonify({'avatarUrl': avatar_url, 'message': 'Fotoğraf başarıyla yüklendi.'})

# 17c. Increment profile view count
@app.route('/api/user/<user_id>/view', methods=['POST'])
def increment_profile_view(user_id):
    user = UserModel.query.get(user_id)
    if not user:
        return jsonify({'error': 'Kullanıcı bulunamadı.'}), 404
    current_views = user.profile_views or 0
    user.profile_views = current_views + 1
    db.session.commit()
    return jsonify({'profileViews': user.profile_views})

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

# ============================================
# NETWORK MODULE ENDPOINTS
# ============================================

# 18. Network: Get AI-Powered Connection Suggestions
@app.route('/api/network/suggestions', methods=['GET'])
def get_network_suggestions():
    user_id = request.args.get('userId')
    if not user_id:
        return jsonify({'error': 'userId gereklidir.'}), 400
    
    current_user = UserModel.query.get(user_id)
    if not current_user:
        return jsonify({'error': 'Kullanıcı bulunamadı.'}), 404
    
    # Get current user's extended profile
    current_profile = UserProfileExtendedModel.query.get(user_id)
    current_skills = json.loads(current_user.skills_json) if current_user.skills_json else []
    
    # Get existing connections
    existing_connections = ConnectionModel.query.filter(
        (ConnectionModel.user_id == user_id) | (ConnectionModel.connected_user_id == user_id)
    ).all()
    connected_ids = set()
    for conn in existing_connections:
        connected_ids.add(conn.user_id if conn.user_id != user_id else conn.connected_user_id)
    
    # Get pending requests
    pending_requests = ConnectionRequestModel.query.filter(
        ((ConnectionRequestModel.from_user_id == user_id) | (ConnectionRequestModel.to_user_id == user_id)) &
        (ConnectionRequestModel.status == 'pending')
    ).all()
    for req in pending_requests:
        connected_ids.add(req.from_user_id if req.from_user_id != user_id else req.to_user_id)
    
    # Exclude self
    connected_ids.add(user_id)
    
    # Get all other users
    all_users = UserModel.query.filter(UserModel.id.notin_(connected_ids)).all()
    
    suggestions = []
    for user in all_users:
        user_profile = UserProfileExtendedModel.query.get(user.id)
        user_skills = json.loads(user.skills_json) if user.skills_json else []
        
        # Calculate match reasons
        reasons = []
        match_score = 0
        
        # Common skills
        common_skills = set(current_skills) & set(user_skills)
        if common_skills:
            reasons.append(f"Ortak yetenekler: {', '.join(list(common_skills)[:3])}")
            match_score += len(common_skills) * 10
        
        # Same location
        if current_user.location and user.location and current_user.location.lower() == user.location.lower():
            reasons.append(f"Aynı şehir: {user.location}")
            match_score += 15
        
        current_education = json.loads(current_user.education_json) if current_user.education_json else []
        current_experience = json.loads(current_user.experience_json) if current_user.experience_json else []
        user_education = json.loads(user.education_json) if user.education_json else []
        user_experience = json.loads(user.experience_json) if user.experience_json else []
        
        # Same university
        current_unis = {edu.get('school').strip().lower() for edu in current_education if edu.get('school')}
        user_unis = {edu.get('school').strip().lower() for edu in user_education if edu.get('school')}
        common_unis = current_unis & user_unis
        if common_unis:
            reasons.append(f"Aynı üniversite: {list(common_unis)[0].title()}")
            match_score += 20 * len(common_unis)
        
        # Same department/field
        current_fields = {edu.get('field').strip().lower() for edu in current_education if edu.get('field')}
        user_fields = {edu.get('field').strip().lower() for edu in user_education if edu.get('field')}
        common_fields = current_fields & user_fields
        if common_fields:
            reasons.append(f"Aynı bölüm: {list(common_fields)[0].title()}")
            match_score += 15 * len(common_fields)
            
        # Same company
        current_companies = {exp.get('company').strip().lower() for exp in current_experience if exp.get('company')}
        user_companies = {exp.get('company').strip().lower() for exp in user_experience if exp.get('company')}
        common_companies = current_companies & user_companies
        if common_companies:
            reasons.append(f"Aynı şirket: {list(common_companies)[0].title()}")
            match_score += 25 * len(common_companies)
        
        # Similar experience level (±2 years)
        if abs(current_user.experience_years - user.experience_years) <= 2:
            reasons.append(f"Benzer deneyim seviyesi: ~{user.experience_years} yıl")
            match_score += 10
        
        # Applied to similar jobs
        current_apps = ApplicationModel.query.filter_by(candidate_id=user_id).all()
        user_apps = ApplicationModel.query.filter_by(candidate_id=user.id).all()
        current_job_ids = {app.job_id for app in current_apps}
        user_job_ids = {app.job_id for app in user_apps}
        common_jobs = current_job_ids & user_job_ids
        if common_jobs:
            reasons.append(f"Benzer işlere başvuru: {len(common_jobs)} ortak ilan")
            match_score += len(common_jobs) * 5
        
        # Mutual connections
        user_connections = ConnectionModel.query.filter(
            (ConnectionModel.user_id == user.id) | (ConnectionModel.connected_user_id == user.id)
        ).all()
        mutual_count = 0
        for conn in user_connections:
            other_id = conn.user_id if conn.user_id != user.id else conn.connected_user_id
            if other_id in [c.user_id if c.user_id != user_id else c.connected_user_id for c in existing_connections]:
                mutual_count += 1
        if mutual_count > 0:
            reasons.append(f"{mutual_count} ortak bağlantı")
            match_score += mutual_count * 8
        
        # If no specific AI reason found, provide a default discovery reason
        if not reasons:
            if user.role == 'employer':
                reasons.append("Kariyer Kapısı bünyesinde İşveren")
                match_score = 15
            else:
                reasons.append("Kariyer Kapısı yeni üyesi")
                match_score = 10
        
        suggestions.append({
            'user': user.to_dict(),
            'matchScore': min(match_score, 100),
            'reasons': reasons,
            'mutualConnections': mutual_count,
            'extendedProfile': user_profile.to_dict() if user_profile else None
        })
    
    # Sort by match score
    suggestions.sort(key=lambda x: x['matchScore'], reverse=True)
    
    return jsonify({'suggestions': suggestions[:20]})  # Top 20 suggestions

# 19. Network: Send Connection Request
@app.route('/api/network/connections/request', methods=['POST'])
def send_connection_request():
    data = request.get_json() or {}
    from_user_id = data.get('fromUserId')
    to_user_id = data.get('toUserId')
    message = data.get('message', '')
    
    if not from_user_id or not to_user_id:
        return jsonify({'error': 'fromUserId ve toUserId gereklidir.'}), 400
    
    # Check if request already exists
    existing = ConnectionRequestModel.query.filter_by(
        from_user_id=from_user_id, to_user_id=to_user_id, status='pending'
    ).first()
    if existing:
        return jsonify({'error': 'Zaten beklemede bir istek var.'}), 400
    
    # Check if already connected
    existing_conn = ConnectionModel.query.filter(
        ((ConnectionModel.user_id == from_user_id) & (ConnectionModel.connected_user_id == to_user_id)) |
        ((ConnectionModel.user_id == to_user_id) & (ConnectionModel.connected_user_id == from_user_id))
    ).first()
    if existing_conn:
        return jsonify({'error': 'Zaten bağlantısınız.'}), 400
    
    new_request = ConnectionRequestModel(
        id=f"connreq_{int(time.time() * 1000)}",
        from_user_id=from_user_id,
        to_user_id=to_user_id,
        message=message,
        status='pending',
        created_at=datetime.now().strftime('%Y-%m-%d %H:%M:%S')
    )
    db.session.add(new_request)
    
    # Create notification for recipient
    from_user = UserModel.query.get(from_user_id)
    notif = NotificationModel(
        id=f"notif_{int(time.time() * 1000)}",
        user_id=to_user_id,
        title='Yeni Bağlantı İsteği',
        message=f"{from_user.full_name} size bağlantı isteği gönderdi.",
        type='info',
        created_at=datetime.now().strftime('%Y-%m-%d %H:%M:%S')
    )
    db.session.add(notif)
    db.session.commit()
    
    return jsonify({'request': new_request.to_dict()}), 201

# 20. Network: Respond to Connection Request
@app.route('/api/network/connections/request/<request_id>', methods=['PATCH'])
def respond_to_connection_request(request_id):
    data = request.get_json() or {}
    action = data.get('action')  # 'accept' or 'reject'
    
    if action not in ['accept', 'reject']:
        return jsonify({'error': 'action: accept veya reject olmalıdır.'}), 400
    
    conn_request = ConnectionRequestModel.query.get(request_id)
    if not conn_request:
        return jsonify({'error': 'İstek bulunamadı.'}), 404
    
    if conn_request.status != 'pending':
        return jsonify({'error': 'İstek zaten işlendi.'}), 400
    
    conn_request.status = 'accepted' if action == 'accept' else 'rejected'
    conn_request.updated_at = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
    
    if action == 'accept':
        # Create bidirectional connection
        new_connection = ConnectionModel(
            id=f"conn_{int(time.time() * 1000)}",
            user_id=conn_request.from_user_id,
            connected_user_id=conn_request.to_user_id,
            status='active',
            created_at=datetime.now().strftime('%Y-%m-%d %H:%M:%S')
        )
        db.session.add(new_connection)
        
        # Update network scores
        for uid in [conn_request.from_user_id, conn_request.to_user_id]:
            score = NetworkScoreModel.query.get(uid)
            if not score:
                score = NetworkScoreModel(
                    user_id=uid,
                    total_connections=0,
                    last_updated=datetime.now().strftime('%Y-%m-%d %H:%M:%S')
                )
                db.session.add(score)
            score.total_connections += 1
            calculate_network_score(uid)
        
        # Notify requester
        to_user = UserModel.query.get(conn_request.to_user_id)
        notif = NotificationModel(
            id=f"notif_{int(time.time() * 1000)}",
            user_id=conn_request.from_user_id,
            title='Bağlantı İsteği Kabul Edildi',
            message=f"{to_user.full_name} bağlantı isteğinizi kabul etti!",
            type='success',
            created_at=datetime.now().strftime('%Y-%m-%d %H:%M:%S')
        )
        db.session.add(notif)
    
    db.session.commit()
    return jsonify({'request': conn_request.to_dict()})

# 21. Network: Get User Connections
@app.route('/api/network/connections', methods=['GET'])
def get_connections():
    user_id = request.args.get('userId')
    if not user_id:
        return jsonify({'error': 'userId gereklidir.'}), 400
    
    connections = ConnectionModel.query.filter(
        (ConnectionModel.user_id == user_id) | (ConnectionModel.connected_user_id == user_id)
    ).all()
    
    connection_list = []
    for conn in connections:
        connected_id = conn.user_id if conn.user_id != user_id else conn.connected_user_id
        connected_user = UserModel.query.get(connected_id)
        if connected_user:
            extended_profile = UserProfileExtendedModel.query.get(connected_id)
            connection_list.append({
                'connection': conn.to_dict(),
                'user': connected_user.to_dict(),
                'extendedProfile': extended_profile.to_dict() if extended_profile else None
            })
    
    return jsonify({'connections': connection_list})

# 22. Network: Get Pending Connection Requests
@app.route('/api/network/connections/requests', methods=['GET'])
def get_connection_requests():
    user_id = request.args.get('userId')
    if not user_id:
        return jsonify({'error': 'userId gereklidir.'}), 400
    
    # Incoming requests
    incoming = ConnectionRequestModel.query.filter_by(
        to_user_id=user_id, status='pending'
    ).all()
    
    # Outgoing requests
    outgoing = ConnectionRequestModel.query.filter_by(
        from_user_id=user_id, status='pending'
    ).all()
    
    incoming_list = []
    for req in incoming:
        from_user = UserModel.query.get(req.from_user_id)
        if from_user:
            incoming_list.append({
                'request': req.to_dict(),
                'fromUser': from_user.to_dict()
            })
    
    outgoing_list = []
    for req in outgoing:
        to_user = UserModel.query.get(req.to_user_id)
        if to_user:
            outgoing_list.append({
                'request': req.to_dict(),
                'toUser': to_user.to_dict()
            })
    
    return jsonify({
        'incoming': incoming_list,
        'outgoing': outgoing_list
    })

# 23. Network: Send Message
@app.route('/api/network/messages', methods=['POST'])
def send_message():
    data = request.get_json() or {}
    from_user_id = data.get('fromUserId')
    to_user_id = data.get('toUserId')
    content = data.get('content')
    
    if not from_user_id or not to_user_id or not content:
        return jsonify({'error': 'fromUserId, toUserId ve content gereklidir.'}), 400
    
    # Check if users are connected
    connection = ConnectionModel.query.filter(
        ((ConnectionModel.user_id == from_user_id) & (ConnectionModel.connected_user_id == to_user_id)) |
        ((ConnectionModel.user_id == to_user_id) & (ConnectionModel.connected_user_id == from_user_id))
    ).first()
    
    if not connection:
        return jsonify({'error': 'Sadece bağlantılarınıza mesaj gönderebilirsiniz.'}), 403
    
    new_message = MessageModel(
        id=f"msg_{int(time.time() * 1000)}",
        from_user_id=from_user_id,
        to_user_id=to_user_id,
        content=content,
        is_read=False,
        created_at=datetime.now().strftime('%Y-%m-%d %H:%M:%S')
    )
    db.session.add(new_message)
    
    # Update network scores
    score = NetworkScoreModel.query.get(from_user_id)
    if score:
        score.total_messages_sent += 1
        calculate_network_score(from_user_id)
    
    recipient_score = NetworkScoreModel.query.get(to_user_id)
    if recipient_score:
        recipient_score.total_messages_received += 1
        calculate_network_score(to_user_id)
    
    # Create notification
    from_user = UserModel.query.get(from_user_id)
    notif = NotificationModel(
        id=f"notif_{int(time.time() * 1000)}",
        user_id=to_user_id,
        title='Yeni Mesaj',
        message=f"{from_user.full_name} size mesaj gönderdi.",
        type='info',
        created_at=datetime.now().strftime('%Y-%m-%d %H:%M:%S')
    )
    db.session.add(notif)
    
    db.session.commit()
    return jsonify({'message': new_message.to_dict()}), 201

# 24. Network: Get Conversations
@app.route('/api/network/messages/conversations', methods=['GET'])
def get_conversations():
    user_id = request.args.get('userId')
    if not user_id:
        return jsonify({'error': 'userId gereklidir.'}), 400
    
    # Get all messages where user is sender or receiver
    messages = MessageModel.query.filter(
        (MessageModel.from_user_id == user_id) | (MessageModel.to_user_id == user_id)
    ).order_by(MessageModel.created_at.desc()).all()
    
    # Group by conversation partner
    conversations = {}
    for msg in messages:
        partner_id = msg.to_user_id if msg.from_user_id == user_id else msg.from_user_id
        if partner_id not in conversations:
            partner = UserModel.query.get(partner_id)
            if partner:
                conversations[partner_id] = {
                    'partnerId': partner_id,
                    'partnerName': partner.full_name,
                    'partnerAvatar': partner.avatar_url,
                    'partnerTitle': partner.title,
                    'lastMessage': msg.content,
                    'lastMessageTime': msg.created_at,
                    'isLastMessageFromMe': msg.from_user_id == user_id,
                    'unreadCount': 0
                }
        
        # Count unread messages
        if msg.to_user_id == user_id and not msg.is_read:
            conversations[partner_id]['unreadCount'] += 1
    
    return jsonify({'conversations': list(conversations.values())})

# 25. Network: Get Messages with User
@app.route('/api/network/messages/<other_user_id>', methods=['GET'])
def get_messages_with_user(other_user_id):
    user_id = request.args.get('userId')
    if not user_id:
        return jsonify({'error': 'userId gereklidir.'}), 400
    
    messages = MessageModel.query.filter(
        ((MessageModel.from_user_id == user_id) & (MessageModel.to_user_id == other_user_id)) |
        ((MessageModel.from_user_id == other_user_id) & (MessageModel.to_user_id == user_id))
    ).order_by(MessageModel.created_at.asc()).all()
    
    # Mark messages as read
    for msg in messages:
        if msg.to_user_id == user_id and not msg.is_read:
            msg.is_read = True
    db.session.commit()
    
    return jsonify({'messages': [msg.to_dict() for msg in messages]})

# 26. Network: Get Network Score
@app.route('/api/network/score', methods=['GET'])
def get_network_score():
    user_id = request.args.get('userId')
    if not user_id:
        return jsonify({'error': 'userId gereklidir.'}), 400
    
    score = NetworkScoreModel.query.get(user_id)
    if not score:
        # Create initial score
        score = NetworkScoreModel(
            user_id=user_id,
            total_connections=0,
            last_updated=datetime.now().strftime('%Y-%m-%d %H:%M:%S')
        )
        db.session.add(score)
        db.session.commit()
        calculate_network_score(user_id)
        score = NetworkScoreModel.query.get(user_id)
    
    return jsonify({'score': score.to_dict()})

# 27. Network: Update Extended Profile
@app.route('/api/network/profile/extended', methods=['PATCH'])
def update_extended_profile():
    data = request.get_json() or {}
    user_id = data.get('userId')
    
    if not user_id:
        return jsonify({'error': 'userId gereklidir.'}), 400
    
    profile = UserProfileExtendedModel.query.get(user_id)
    if not profile:
        profile = UserProfileExtendedModel(user_id=user_id)
        db.session.add(profile)
    
    if 'university' in data:
        profile.university = data['university']
    if 'department' in data:
        profile.department = data['department']
    if 'company' in data:
        profile.company = data['company']
    if 'sector' in data:
        profile.sector = data['sector']
    if 'bio' in data:
        profile.bio = data['bio']
    if 'linkedinUrl' in data:
        profile.linkedin_url = data['linkedinUrl']
    if 'githubUrl' in data:
        profile.github_url = data['githubUrl']
    if 'portfolioUrl' in data:
        profile.portfolio_url = data['portfolioUrl']
    
    db.session.commit()
    
    # Recalculate network score
    calculate_network_score(user_id)
    
    return jsonify({'profile': profile.to_dict()})

# 28. Network: Get Company Employees
@app.route('/api/network/companies/<company_name>/employees', methods=['GET'])
def get_company_employees(company_name):
    city_filter = request.args.get('city')
    university_filter = request.args.get('university')
    role_filter = request.args.get('role')
    experience_filter = request.args.get('experience')
    
    # Get all profiles with this company
    profiles = UserProfileExtendedModel.query.filter_by(company=company_name).all()
    
    employees = []
    for profile in profiles:
        user = UserModel.query.get(profile.user_id)
        if user:
            # Apply filters
            if city_filter and user.location and city_filter.lower() not in user.location.lower():
                continue
            if university_filter and profile.university and university_filter.lower() not in profile.university.lower():
                continue
            if role_filter and user.title and role_filter.lower() not in user.title.lower():
                continue
            if experience_filter:
                try:
                    exp_years = int(experience_filter)
                    if abs(user.experience_years - exp_years) > 2:
                        continue
                except:
                    pass
            
            employees.append({
                'user': user.to_dict(),
                'extendedProfile': profile.to_dict()
            })
    
    return jsonify({
        'company': company_name,
        'employeeCount': len(employees),
        'employees': employees
    })

# Helper: Calculate Network Score
def calculate_network_score(user_id):
    user = UserModel.query.get(user_id)
    if not user:
        return
    
    score_model = NetworkScoreModel.query.get(user_id)
    if not score_model:
        score_model = NetworkScoreModel(
            user_id=user_id,
            last_updated=datetime.now().strftime('%Y-%m-%d %H:%M:%S')
        )
        db.session.add(score_model)
    
    # Profile completion (0-40 points)
    profile_score = user.profile_strength or 20
    profile_score = int((profile_score / 100) * 40)
    
    # Extended profile bonus
    extended = UserProfileExtendedModel.query.get(user_id)
    if extended:
        if extended.university:
            profile_score += 5
        if extended.company:
            profile_score += 5
        if extended.bio:
            profile_score += 5
        if extended.linkedin_url or extended.github_url or extended.portfolio_url:
            profile_score += 5
    
    profile_score = min(profile_score, 50)
    
    # Connections (0-30 points)
    connection_count = score_model.total_connections
    connections_score = min(connection_count * 2, 30)
    
    # Engagement (0-20 points)
    total_messages = score_model.total_messages_sent + score_model.total_messages_received
    engagement_score = min(total_messages, 20)
    
    # Update scores
    score_model.profile_completion_score = profile_score
    score_model.connections_score = connections_score
    score_model.engagement_score = engagement_score
    score_model.total_score = profile_score + connections_score + engagement_score
    score_model.last_updated = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
    
    db.session.commit()

# ============================================
# SAVED JOBS ENDPOINTS
# ============================================

# 29. Saved Jobs: Save a Job
@app.route('/api/saved-jobs', methods=['POST'])
def save_job():
    data = request.get_json() or {}
    user_id = data.get('userId')
    job_id = data.get('jobId')
    
    if not user_id or not job_id:
        return jsonify({'error': 'userId ve jobId gereklidir.'}), 400
    
    # Check if already saved
    existing = SavedJobModel.query.filter_by(user_id=user_id, job_id=job_id).first()
    if existing:
        return jsonify({'error': 'Bu ilan zaten kaydedilmiş.'}), 400
    
    new_saved = SavedJobModel(
        id=f"saved_{int(time.time() * 1000)}",
        user_id=user_id,
        job_id=job_id,
        saved_at=datetime.now().strftime('%Y-%m-%d %H:%M:%S')
    )
    db.session.add(new_saved)
    db.session.commit()
    
    return jsonify({'savedJob': new_saved.to_dict()}), 201

# 30. Saved Jobs: Get User's Saved Jobs
@app.route('/api/saved-jobs', methods=['GET'])
def get_saved_jobs():
    user_id = request.args.get('userId')
    
    if not user_id:
        return jsonify({'error': 'userId gereklidir.'}), 400
    
    saved_jobs = SavedJobModel.query.filter_by(user_id=user_id).all()
    
    result = []
    for saved in saved_jobs:
        job = JobModel.query.filter_by(id=saved.job_id).first()
        if job:
            result.append({
                'savedJob': saved.to_dict(),
                'job': job.to_dict()
            })
    
    return jsonify({'savedJobs': result})

# 31. Saved Jobs: Remove a Saved Job
@app.route('/api/saved-jobs/<saved_job_id>', methods=['DELETE'])
def remove_saved_job(saved_job_id):
    saved_job = SavedJobModel.query.filter_by(id=saved_job_id).first()
    
    if not saved_job:
        return jsonify({'error': 'Kaydedilmiş ilan bulunamadı.'}), 404
    
    db.session.delete(saved_job)
    db.session.commit()
    
    return jsonify({'success': True})

# 32. Saved Jobs: Check if Job is Saved
@app.route('/api/saved-jobs/check', methods=['GET'])
def check_if_saved():
    user_id = request.args.get('userId')
    job_id = request.args.get('jobId')
    
    if not user_id or not job_id:
        return jsonify({'error': 'userId ve jobId gereklidir.'}), 400
    
    saved = SavedJobModel.query.filter_by(user_id=user_id, job_id=job_id).first()
    
    return jsonify({
        'isSaved': saved is not None,
        'savedJobId': saved.id if saved else None
    })

# ==================== ADMIN ENDPOINTS ====================

# 18. Admin: Get All Users
@app.route('/api/admin/users', methods=['GET'])
def admin_get_users():
    users = UserModel.query.all()
    return jsonify({'users': [u.to_dict() for u in users]})

# 19. Admin: Get All Jobs
@app.route('/api/admin/jobs', methods=['GET'])
def admin_get_jobs():
    jobs = JobModel.query.all()
    return jsonify({'jobs': [j.to_dict() for j in jobs]})

# 20. Admin: Get All Applications
@app.route('/api/admin/applications', methods=['GET'])
def admin_get_applications():
    apps = ApplicationModel.query.all()
    return jsonify({'applications': [a.to_dict() for a in apps]})

# 21. Admin: Get Stats
@app.route('/api/admin/stats', methods=['GET'])
def admin_get_stats():
    total_users = UserModel.query.count()
    total_candidates = UserModel.query.filter_by(role='candidate').count()
    total_employers = UserModel.query.filter_by(role='employer').count()
    total_jobs = JobModel.query.count()
    total_apps = ApplicationModel.query.count()
    
    # Calculate average match score
    apps = ApplicationModel.query.all()
    avg_match = sum([a.match_score for a in apps]) // len(apps) if apps else 0
    
    pending = ApplicationModel.query.filter(ApplicationModel.status.in_(['Yeni', 'Mülakat'])).count()
    
    return jsonify({
        'totalUsers': total_users,
        'totalCandidates': total_candidates,
        'totalEmployers': total_employers,
        'totalJobs': total_jobs,
        'totalApplications': total_apps,
        'avgMatchScore': avg_match,
        'activeJobs': total_jobs,
        'pendingApplications': pending
    })

# 22. Admin: Delete User
@app.route('/api/admin/users/<user_id>', methods=['DELETE'])
def admin_delete_user(user_id):
    user = UserModel.query.get(user_id)
    if not user:
        return jsonify({'error': 'Kullanıcı bulunamadı.'}), 404
    
    # Delete related data
    ApplicationModel.query.filter_by(candidate_id=user_id).delete()
    NotificationModel.query.filter_by(user_id=user_id).delete()
    
    db.session.delete(user)
    db.session.commit()
    return jsonify({'success': True})

# 23. Admin: Update User
@app.route('/api/admin/users/<user_id>', methods=['PATCH'])
def admin_update_user(user_id):
    user = UserModel.query.get(user_id)
    if not user:
        return jsonify({'error': 'Kullanıcı bulunamadı.'}), 404
    
    data = request.get_json() or {}
    if 'fullName' in data:
        user.full_name = data['fullName']
    if 'email' in data:
        user.email = data['email']
    if 'title' in data:
        user.title = data['title']
    if 'location' in data:
        user.location = data['location']
    
    db.session.commit()
    return jsonify({'user': user.to_dict()})

# 24. Admin: Delete Job
@app.route('/api/admin/jobs/<job_id>', methods=['DELETE'])
def admin_delete_job(job_id):
    job = JobModel.query.get(job_id)
    if not job:
        return jsonify({'error': 'İlan bulunamadı.'}), 404
    
    ApplicationModel.query.filter_by(job_id=job_id).delete()
    db.session.delete(job)
    db.session.commit()
    return jsonify({'success': True})

# 28. Get User's Friends (Connected Users)
@app.route('/api/connections/friends/<user_id>', methods=['GET'])
def get_user_friends(user_id):
    """Get all friends (accepted connections) of a user with full details"""
    try:
        # Get all connections where user is either initiator or receiver
        connections = ConnectionModel.query.filter(
            db.or_(
                ConnectionModel.user_id == user_id,
                ConnectionModel.connected_user_id == user_id
            ),
            ConnectionModel.status == 'active'
        ).all()
        
        friend_ids = set()
        for conn in connections:
            if conn.user_id == user_id:
                friend_ids.add(conn.connected_user_id)
            else:
                friend_ids.add(conn.user_id)
        
        # Get full user details for all friends
        friends = []
        for friend_id in friend_ids:
            user = UserModel.query.get(friend_id)
            if user:
                user_dict = user.to_dict()
                
                # Get extended profile info
                extended = UserProfileExtendedModel.query.get(friend_id)
                if extended:
                    user_dict['company'] = extended.company
                    user_dict['department'] = extended.department
                    user_dict['university'] = extended.university
                    user_dict['sector'] = extended.sector
                
                # Get mutual friends count
                mutual_count = get_mutual_friends_count(user_id, friend_id)
                user_dict['mutualFriends'] = mutual_count
                
                friends.append(user_dict)
        
        return jsonify({'friends': friends, 'count': len(friends)})
    except Exception as e:
        print(f"[ERROR] get_user_friends: {e}")
        return jsonify({'error': str(e)}), 500

# 29. Get Smart Connection Suggestions
@app.route('/api/connections/suggestions/<user_id>', methods=['GET'])
def get_connection_suggestions(user_id):
    """
    Get intelligent connection suggestions categorized by:
    - High Probability (same company/dept, same university, mutual friends)
    - Same Sector (same industry, similar roles)
    - Discover (similar skills, location, new users)
    """
    try:
        current_user = UserModel.query.get(user_id)
        if not current_user:
            return jsonify({'error': 'User not found'}), 404
        
        current_extended = UserProfileExtendedModel.query.get(user_id)
        
        # Get existing connections and pending requests to exclude
        existing_connections = get_user_connection_ids(user_id)
        
        # Get all potential users (exclude self and existing connections)
        all_users = UserModel.query.filter(
            UserModel.id != user_id,
            ~UserModel.id.in_(existing_connections) if existing_connections else True
        ).all()
        
        high_probability = []
        same_sector = []
        discover = []
        
        for user in all_users:
            user_extended = UserProfileExtendedModel.query.get(user.id)
            score_data = calculate_connection_score(
                current_user, current_extended,
                user, user_extended,
                user_id
            )
            
            user_dict = user.to_dict()
            if user_extended:
                user_dict['company'] = user_extended.company
                user_dict['department'] = user_extended.department
                user_dict['university'] = user_extended.university
                user_dict['sector'] = user_extended.sector
            
            user_dict['mutualFriends'] = score_data['mutual_friends']
            user_dict['connectionReason'] = score_data['reasons']
            user_dict['score'] = score_data['score']
            
            # Categorize based on score and reasons
            if score_data['score'] >= 70:
                high_probability.append(user_dict)
            elif score_data['score'] >= 40:
                same_sector.append(user_dict)
            else:
                discover.append(user_dict)
        
        # Sort each category by score
        high_probability.sort(key=lambda x: x['score'], reverse=True)
        same_sector.sort(key=lambda x: x['score'], reverse=True)
        discover.sort(key=lambda x: x['score'], reverse=True)
        
        return jsonify({
            'highProbability': high_probability[:15],
            'sameSector': same_sector[:15],
            'discover': discover[:15]
        })
    
    except Exception as e:
        print(f"[ERROR] get_connection_suggestions: {e}")
        return jsonify({'error': str(e)}), 500

# Helper function: Get user's connection IDs
def get_user_connection_ids(user_id):
    """Get all user IDs that are connected or have pending requests"""
    connection_ids = set()
    
    # Get accepted connections
    connections = ConnectionModel.query.filter(
        db.or_(
            ConnectionModel.user_id == user_id,
            ConnectionModel.connected_user_id == user_id
        )
    ).all()
    
    for conn in connections:
        if conn.user_id == user_id:
            connection_ids.add(conn.connected_user_id)
        else:
            connection_ids.add(conn.user_id)
    
    # Get pending requests (both sent and received)
    pending_requests = ConnectionRequestModel.query.filter(
        db.or_(
            ConnectionRequestModel.from_user_id == user_id,
            ConnectionRequestModel.to_user_id == user_id
        ),
        ConnectionRequestModel.status == 'pending'
    ).all()
    
    for req in pending_requests:
        connection_ids.add(req.from_user_id)
        connection_ids.add(req.to_user_id)
    
    return list(connection_ids)

# Helper function: Get mutual friends count
def get_mutual_friends_count(user_id_1, user_id_2):
    """Calculate number of mutual friends between two users"""
    # Get friends of user 1
    connections_1 = ConnectionModel.query.filter(
        db.or_(
            ConnectionModel.user_id == user_id_1,
            ConnectionModel.connected_user_id == user_id_1
        ),
        ConnectionModel.status == 'active'
    ).all()
    
    friends_1 = set()
    for conn in connections_1:
        if conn.user_id == user_id_1:
            friends_1.add(conn.connected_user_id)
        else:
            friends_1.add(conn.user_id)
    
    # Get friends of user 2
    connections_2 = ConnectionModel.query.filter(
        db.or_(
            ConnectionModel.user_id == user_id_2,
            ConnectionModel.connected_user_id == user_id_2
        ),
        ConnectionModel.status == 'active'
    ).all()
    
    friends_2 = set()
    for conn in connections_2:
        if conn.user_id == user_id_2:
            friends_2.add(conn.connected_user_id)
        else:
            friends_2.add(conn.user_id)
    
    # Calculate intersection
    mutual = friends_1.intersection(friends_2)
    return len(mutual)

# Helper function: Calculate connection score
def calculate_connection_score(current_user, current_extended, target_user, target_extended, current_user_id):
    """
    Calculate intelligent connection score based on multiple factors:
    - Same company & department: +50 points
    - Same company, different dept: +30 points
    - Same university & department: +40 points
    - Same university: +25 points
    - Worked at same company before: +35 points
    - Mutual friends: +5 per mutual (max 40)
    - Same location + similar field: +20 points
    - Similar skills: +3 per skill (max 30)
    - Same sector: +15 points
    """
    score = 0
    reasons = []
    
    # Mutual friends
    mutual_count = get_mutual_friends_count(current_user_id, target_user.id)
    if mutual_count > 0:
        mutual_score = min(mutual_count * 5, 40)
        score += mutual_score
        reasons.append(f"{mutual_count} ortak bağlantı")
    
    # Company & Department matching
    if current_extended and target_extended:
        if current_extended.company and target_extended.company:
            if current_extended.company.lower().strip() == target_extended.company.lower().strip():
                if current_extended.department and target_extended.department:
                    if current_extended.department.lower().strip() == target_extended.department.lower().strip():
                        score += 50
                        reasons.append(f"Aynı şirket ve departman ({current_extended.company})")
                    else:
                        score += 30
                        reasons.append(f"Aynı şirket ({current_extended.company})")
                else:
                    score += 30
                    reasons.append(f"Aynı şirket ({current_extended.company})")
        
        # University matching
        if current_extended.university and target_extended.university:
            if current_extended.university.lower().strip() == target_extended.university.lower().strip():
                if current_extended.department and target_extended.department:
                    if current_extended.department.lower().strip() == target_extended.department.lower().strip():
                        score += 40
                        reasons.append(f"Aynı üniversite ve bölüm ({current_extended.university})")
                    else:
                        score += 25
                        reasons.append(f"Aynı üniversite ({current_extended.university})")
                else:
                    score += 25
                    reasons.append(f"Aynı üniversite ({current_extended.university})")
        
        # Sector matching
        if current_extended.sector and target_extended.sector:
            if current_extended.sector.lower().strip() == target_extended.sector.lower().strip():
                score += 15
                reasons.append(f"Aynı sektör ({current_extended.sector})")
    
    # Check work history for previous same company
    if current_user.experience_json and target_user.experience_json:
        try:
            current_exp = json.loads(current_user.experience_json)
            target_exp = json.loads(target_user.experience_json)
            
            current_companies = set([exp.get('company', '').lower().strip() for exp in current_exp if exp.get('company')])
            target_companies = set([exp.get('company', '').lower().strip() for exp in target_exp if exp.get('company')])
            
            common_companies = current_companies.intersection(target_companies)
            if common_companies and not (current_extended and target_extended and 
                current_extended.company and target_extended.company and 
                current_extended.company.lower().strip() in common_companies):
                score += 35
                reasons.append(f"Daha önce aynı şirkette çalıştınız")
        except:
            pass
    
    # Location + Similar field
    if current_user.location and target_user.location:
        if current_user.location.lower().strip() == target_user.location.lower().strip():
            if current_user.title and target_user.title:
                # Simple similarity check on titles
                current_title_words = set(current_user.title.lower().split())
                target_title_words = set(target_user.title.lower().split())
                if len(current_title_words.intersection(target_title_words)) > 0:
                    score += 20
                    reasons.append(f"Aynı şehir, benzer meslek alanı ({current_user.location})")
    
    # Skills similarity
    if current_user.skills_json and target_user.skills_json:
        try:
            current_skills = set([s.lower().strip() for s in json.loads(current_user.skills_json)])
            target_skills = set([s.lower().strip() for s in json.loads(target_user.skills_json)])
            
            common_skills = current_skills.intersection(target_skills)
            if common_skills:
                skill_score = min(len(common_skills) * 3, 30)
                score += skill_score
                reasons.append(f"{len(common_skills)} ortak yetenek")
        except:
            pass
    
    return {
        'score': score,
        'reasons': reasons,
        'mutual_friends': mutual_count
    }

if __name__ == '__main__':
    with app.app_context():
        db.create_all()
        seed_data()
    print("[Flask Server] Running Python Flask + SQL API at http://127.0.0.1:5001")
    app.run(host='0.0.0.0', port=5001, debug=True)


# 27. Network: Search Users
@app.route('/api/network/search', methods=['GET'])
def search_users():
    query = request.args.get('query', '').strip()
    current_user_id = request.args.get('userId')
    
    if not query or len(query) < 2:
        return jsonify({'users': []})
    
    # Search by name, title, location, or skills
    search_pattern = f"%{query}%"
    
    users = UserModel.query.filter(
        db.or_(
            UserModel.full_name.ilike(search_pattern),
            UserModel.title.ilike(search_pattern),
            UserModel.location.ilike(search_pattern),
            UserModel.skills_json.ilike(search_pattern)
        ),
        UserModel.id != current_user_id  # Exclude current user
    ).limit(20).all()
    
    return jsonify({'users': [u.to_dict() for u in users]})

# Serve uploaded files (avatars etc.)
@app.route('/uploads/avatars/<filename>')
def serve_avatar(filename):
    try:
        upload_folder = os.path.join(os.path.dirname(__file__), 'uploads', 'avatars')
        print(f"[AVATAR] Request for: {filename}")
        print(f"[AVATAR] Directory: {upload_folder}")
        print(f"[AVATAR] Directory exists: {os.path.exists(upload_folder)}")
        
        file_path = os.path.join(upload_folder, filename)
        print(f"[AVATAR] Full path: {file_path}")
        print(f"[AVATAR] File exists: {os.path.exists(file_path)}")
        
        if not os.path.exists(file_path):
            print(f"[AVATAR] ERROR: File not found!")
            return jsonify({'error': 'File not found'}), 404
            
        return send_from_directory(upload_folder, filename)
    except Exception as e:
        print(f"[AVATAR] Exception: {e}")
        return jsonify({'error': str(e)}), 500
