B. Diğer Bilgisayarda Kurulması Gerekenler
Projeyi açacağınız diğer bilgisayarda şu 3 programın yüklü olması gerekir:

XAMPP (MySQL ve Apache için)
Node.js (Frontend paketlerini çalıştırmak için)
Python 3 (Backend API sunucusu için)
C. Diğer Bilgisayarda Kurulum ve Çalıştırma Adımları


1. Veritabanını Hazırlama
XAMPP uygulamasını açıp Apache ve MySQL servislerini başlatın.
Tarayıcıdan http://localhost/phpmyadmin adresine gidin.
Sol menüden Yeni (New) diyerek kariyerkapisi adında boş bir veritabanı oluşturun.
Eski kayıtları taşımak istiyorsanız: Oluşturduğunuz veritabanına tıklayıp üstten İçe Aktar (Import) deyin. İlk bilgisayardan aldığınız .sql dosyasını seçip yükleyin.
Sıfırdan başlamak istiyorsanız: İçe aktarma yapmanıza gerek yok. Python sunucusu ilk çalıştığında tabloları ve örnek verileri otomatik oluşturacaktır.



# Gerekli kütüphaneleri indirin (Sadece ilk seferde çalıştırılır)
npm install
# Arayüzü başlatın
npm run dev
(Arayüz yine http://localhost:3000 adresinde açılacaktır.)

Backend (Sunucu) Kurulumu ve Başlatılması (Ayrı bir terminal penceresinde):

bash


# Gerekli Python paketlerini yükleyin (Sadece ilk seferde çalıştırılır)
pip install -r requirements.txt
# Sunucuyu başlatın
python3 app.py
(Backend sunucusu http://localhost:5001 adresinde çalışıp arka planda XAMPP MySQL'e bağlanacaktır.)

Artık diğer bilgisayarda da tıpkı bu bilgisayardaki gibi projeyi görüntüleyebilir, yeni kayıtlar açabilir ve phpMyAdmin üzerinden bunları takip edebilirsiniz.
