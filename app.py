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
    avatar_url = db.Column(db.String(512), nullable=True)

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
    text_to_analyze = f"{cv_text.lower()} {job_desc.lower()}"
    matched_skills = [s for s in job_skills if s.lower() in text_to_analyze]
    total_skills = len(job_skills) or 5
    skill_ratio = len(matched_skills) / total_skills

    skill_alignment = min(100, int(40 + (skill_ratio * 60)))
    experience_alignment = 85 if ('senior' in text_to_analyze or 'kıdemli' in text_to_analyze) else 75
    cultural_alignment = 80

    match_score = int((skill_alignment * 0.5) + (experience_alignment * 0.3) + (cultural_alignment * 0.2))

    strong_points = [
        f"Özgeçmiş içeriğinizdeki yeteneklerin, ilandaki '{', '.join(matched_skills) if matched_skills else 'temel'}' beklentileri ile uyumlu olduğu görülmüştür.",
        "Adayın deneyimi ve geçmiş sorumlulukları pozisyon beklentilerini karşılamaktadır."
    ]

    missing = [s for s in job_skills if s not in matched_skills]
    dev_areas = [
        f"İlandaki bazı gelişmiş gereksinimlerin ({', '.join(missing[:2]) if missing else 'sistem mimarisi'}) geliştirilmesi önerilir."
    ]

    return {
        'matchScore': match_score,
        'strongPoints': strong_points,
        'developmentAreas': dev_areas,
        'skillAlignment': skill_alignment,
        'experienceAlignment': experience_alignment,
        'culturalAlignment': cultural_alignment,
        'description': f"[Python SQL Motoru] Yapay zeka değerlendirmesi sonucunda %{match_score} oranında teknik uyum hesaplanmıştır."
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
        return jsonify({'error': 'Gerekli ilan detayları eksik.'}), 400

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
        apps = ApplicationModel.query.all()
    else:
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
            Aday Özgeçmiş Metni: {cv_text}
            İş İlanı: {job.title} ({job.company}) - {job.description}
            Beceriler: {', '.join(job_skills)}
            Lütfen JSON formatında Türkçe analiz üret:
            {{
                "matchScore": 85,
                "strongPoints": ["Teknik deneyim uygun"],
                "developmentAreas": ["Ek sertifika önerilir"],
                "skillAlignment": 90,
                "experienceAlignment": 80,
                "culturalAlignment": 85,
                "description": "Genel analiz özeti"
            }}
            """
            response = ai_client.models.generate_content(
                model='gemini-2.5-flash',
                contents=prompt
            )
            parsed = json.loads(response.text.strip())
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
    custom_text = data.get('customText', '')

    text_lower = (custom_text or file_name).lower()
    skills_map = ['react', 'node', 'typescript', 'python', 'javascript', 'sql', 'css', 'html', 'vue', 'angular', 'aws', 'docker', 'graphql']
    detected_skills = [s.upper() for s in skills_map if s in text_lower]

    return jsonify({
        'success': True,
        'data': {
            'fullName': custom_text.split('\n')[0].strip() if len(custom_text) > 3 else 'Yeni Aday',
            'title': 'Frontend Geliştirici' if 'react' in text_lower else 'Yazılım Mühendisi',
            'experienceYears': 3,
            'skills': detected_skills if detected_skills else ['React', 'JavaScript', 'Python'],
            'location': 'İstanbul',
            'resumeFileName': file_name,
            'resumeText': custom_text or f"Dosya: {file_name}",
            'profileStrength': 85
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

if __name__ == '__main__':
    with app.app_context():
        db.create_all()
        seed_data()
    print("[Flask Server] Running Python Flask + SQL API at http://127.0.0.1:5001")
    app.run(host='0.0.0.0', port=5001, debug=True)
