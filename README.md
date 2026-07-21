# Aİ KARİYER KAPISI


Kullanıcıların hesap oluşturup CV girdiği, şirketlerin ise pozisyon/kadro bilgisi ile aradıkları yetkinlikleri girdiği, bir yapay zeka motorunun bu iki tarafı **uygunluk oranına (match score)** göre eşleştirdiği bir platform.

---

## 1. Proje Özeti

**Temel akış:**
1. **Aday (kullanıcı)** → kayıt olur → profil/CV oluşturur (eğitim, deneyim, yetenekler, sertifikalar, konum, maaş beklentisi vb.)
2. **Şirket** → kayıt olur → ilan/pozisyon oluşturur (gerekli yetenekler, deneyim seviyesi, konum, maaş aralığı vb.)
3. **AI Eşleştirme Motoru (Claude API)** → adayları ve ilanları analiz eder → her aday-ilan çifti için bir **uygunluk skoru (%)** üretir
4. Adaylara uygun ilanlar, şirketlere uygun adaylar sıralı şekilde gösterilir

---

## 2. Kullanıcı Rolleri

| Rol | Yetkiler |
|---|---|
| **Aday** | Kayıt/giriş, CV oluşturma-düzenleme, ilanlara başvurma, eşleşme oranını görme |
| **Şirket / İK** | Kayıt/giriş, şirket profili, ilan açma, aday havuzunu görme, eşleşme oranına göre filtreleme |
| **Admin** | Kullanıcı/şirket yönetimi, moderasyon, sistem ayarları, raporlama |

---

## 3. Teknoloji Stack'i

| Katman | Teknoloji | Not |
|---|---|---|
| **Frontend** | **React (Next.js)** + TypeScript veya JavaScript | UI, kullanıcı/şirket panelleri, formlar |
| **Stil** | Tailwind CSS veya Bootstrap | Hızlı ve düzenli arayüz için |
| **Backend** | **Flask (Python)** | API endpoint'leri, iş mantığı, kimlik doğrulama |
| **Veritabanı** | **MySQL** | Kullanıcı, şirket, ilan, başvuru verileri |
| **ORM** | SQLAlchemy | Flask ile MySQL arası kolay bağlantı |
| **AI Eşleştirme** | **Claude API (Anthropic)** | CV ve ilan metnini karşılaştırıp uygunluk skoru üretme |
| **Kimlik doğrulama** | Flask-JWT-Extended | Token bazlı giriş sistemi |
| **CV dosya okuma** | `pdfplumber` (PDF), `python-docx` (Word) | CV içeriğini metne çevirme |
| **Dosya depolama** | Yerel disk (başlangıç) → AWS S3 (canlıya geçince) | CV/logo dosyaları |

---

## 4. Sistem Mimarisi (Basit Görünüm)

```
┌─────────────────┐        REST API (JSON)        ┌──────────────────┐
│   Frontend       │  <────────────────────────>   │   Backend         │
│  React / Next.js │                                │  Flask (Python)   │
└─────────────────┘                                └────────┬─────────┘
                                                              │
                                    ┌─────────────────────────┼─────────────────────────┐
                                    │                          │                          │
                              ┌─────▼─────┐            ┌───────▼───────┐          ┌───────▼───────┐
                              │  MySQL     │            │  Claude API    │          │  Dosya Deposu  │
                              │ (veritabanı)│           │ (AI eşleştirme)│          │  (CV/Logo)     │
                              └───────────┘            └───────────────┘          └───────────────┘
```

---

## 5. Veritabanı Şeması (MySQL için Taslak)

```sql
users (id, email, password_hash, role, created_at)
candidate_profiles (id, user_id, full_name, phone, location, summary)
experiences (id, candidate_id, company, title, start_date, end_date, description)
educations (id, candidate_id, school, degree, field, start_date, end_date)
skills (id, name)
candidate_skills (candidate_id, skill_id, level)
companies (id, user_id, name, sector, description, location)
job_postings (id, company_id, title, description, required_skills, min_experience,
              location, salary_min, salary_max, status, created_at)
applications (id, candidate_id, job_id, status, match_score, applied_at)
match_scores (id, candidate_id, job_id, score, reason_text, computed_at)
```

---

## 6. AI Eşleştirme Mantığı (Claude API ile)

Kendi ML modeli eğitmek yerine, her aday-ilan çifti için Claude API'ye şu şekilde bir istek gönderilir:

```python
import anthropic

client = anthropic.Anthropic(api_key="...")

prompt = f"""
Aşağıdaki CV ile iş ilanının uygunluğunu değerlendir.

CV: {cv_metni}

İlan: {ilan_metni}

Sadece aşağıdaki JSON formatında cevap ver, başka hiçbir şey yazma:
{{"score": 0-100 arası tam sayı, "reason": "kısa açıklama"}}
"""

response = client.messages.create(
    model="claude-sonnet-5",
    max_tokens=300,
    messages=[{"role": "user", "content": prompt}]
)

# response içinden JSON parse edilir ve match_scores tablosuna kaydedilir
```

**Akış:**
1. Aday CV oluşturduğunda veya şirket ilan açtığında, ilgili metinler hazırlanır.
2. Yeni bir ilan geldiğinde mevcut adaylarla, yeni bir aday geldiğinde mevcut ilanlarla karşılaştırma yapılır.
3. Skorlar `match_scores` tablosuna yazılır, arayüzde adaylara/şirketlere gösterilir.

> Maliyet notu: Aday/ilan sayısı arttıkça her çift için API çağrısı maliyetli olabilir. Kural bazlı ön filtreleme (konum, deneyim yılı, zorunlu yetenekler) ile aday havuzu daraltılıp, sadece kalanlar için Claude API çağrısı yapılması önerilir.

---

## 7. Yol Haritası — 1 Aylık Süreç

### Hafta 1 — Altyapı Kurulumu
- [ ] Flask proje iskeleti, MySQL bağlantısı (SQLAlchemy)
- [ ] Next.js proje iskeleti, temel sayfa yapısı
- [ ] Kullanıcı kayıt/giriş (JWT), rol yönetimi (aday/şirket/admin)
- [ ] Veritabanı tablolarının oluşturulması

### Hafta 2 — Profil ve CV Yönetimi
- [ ] Aday profil oluşturma/düzenleme formları (React)
- [ ] CV dosyası yükleme + PDF/Word'den metin çıkarma (Flask)
- [ ] Şirket profili ve ilan oluşturma ekranları
- [ ] Yetenek (skill) etiketleme sistemi

### Hafta 3 — AI Eşleştirme
- [ ] Claude API entegrasyonu (Flask backend içinde)
- [ ] Skor hesaplama akışının kurulması (yeni CV/ilan geldiğinde tetiklenme)
- [ ] Skorların veritabanına kaydedilip arayüzde gösterilmesi
- [ ] İlanlara başvuru akışı, şirket tarafında aday listeleme/sıralama

### Hafta 4 — Test ve Yayın
- [ ] Uçtan uca test, hata düzeltmeleri
- [ ] E-posta bildirimleri (opsiyonel)
- [ ] Sunucuya (VPS/cloud) MySQL + Flask + Next.js deploy
- [ ] Son kullanıcı testi ve yayına alma

---

## 8. Klasör Yapısı

```
kariyer-kapisi/
├── frontend/
│   ├── pages/                # Next.js sayfaları
│   ├── components/           # Ortak UI bileşenleri
│   ├── styles/                # Tailwind/CSS dosyaları
│   └── package.json
│
├── backend/
│   ├── app/
│   │   ├── __init__.py
│   │   ├── models/            # SQLAlchemy modelleri (User, Candidate, Company, Job, Application)
│   │   ├── routes/            # API endpoint'leri (auth, candidates, companies, jobs, matches)
│   │   ├── services/
│   │   │   ├── ai_matching.py     # Claude API entegrasyonu
│   │   │   └── cv_parser.py       # PDF/Word'den metin çıkarma
│   │   └── config.py
│   ├── requirements.txt
│   └── run.py
│
├── .env                       # API anahtarları, veritabanı bağlantı bilgileri
└── README.md
```

---

## 9. Önemli Notlar
- **Önyargı riski:** Claude API'ye gönderilen prompt'ta isim, yaş, cinsiyet gibi bilgilerin skora etki etmemesi için CV metninden bu tür kişisel tanımlayıcıların çıkarılması (anonimleştirme) önerilir.
- **API maliyeti:** Kullanıcı sayısı arttıkça, her eşleştirme için ayrı API çağrısı maliyetli hale gelebilir; kural bazlı ön filtreleme ile bu azaltılabilir.
