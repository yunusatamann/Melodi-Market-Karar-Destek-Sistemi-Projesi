# MELODİ MARKET KARAR DESTEK SİSTEMLERİ PROJESİ
  HAZIRLAYAN: Yunus Ataman
  Öğrenci No: 2023469141


# Melodi Market - Enstrüman Stok ve Satış Yönetim Sistemi

Bu proje, Dokuz Eylül Üniversitesi YBS Bölümü kapsamında geliştirilmiş; müzik aletleri satışı, stok takibi ve karar destek mekanizmaları içeren web tabanlı bir backend projesidir.

Proje, Node.js(express) ve MySQL kullanılarak MVC (Model-View-Controller) mimarisine uygun şekilde tasarlanmıştır.

## 1. Proje Kapsamı ve KDS Senaryoları

Bu proje, standart bir veri giriş çıkışının ötesinde, işletme yönetimine yardımcı olacak "İş Kuralları" (Business Rules) içermektedir.

**Senaryo 1: Stok Kontrolü ve Satış Engelleme (Blocking Rule)**
Satış işlemi sırasında sistem anlık stok kontrolü yapar. Eğer talep edilen miktar stokta yoksa, sistem işlemi veritabanı seviyesinde reddeder ve hata mesajı döner. Bu sayede eksi stok oluşumu ve veri tutarsızlığı engellenir.
* Kodun Yeri: src/controllers/salesController.js (createSale fonksiyonu)

**Senaryo 2: Sezonluk Satış Analizi (Decision Support)**
Yöneticinin stok planlaması yapabilmesi için sistem geçmiş satış verilerini analiz eder. Özellikle Haziran ayı satışları, yılın diğer aylarına göre %30'dan fazla artış gösterirse sistem "Yaz Sezonu Yoğunluğu" uyarısı verir.
* Kodun Yeri: src/controllers/salesController.js (getSummary fonksiyonu)

## 2. Kurulum Adımları

Projeyi yerel ortamda çalıştırmak için aşağıdaki adımları izleyin:

1. Gerekli kütüphaneleri yükleyin:
   npm install

2. Veritabanı ayarlarını yapın:
   Proje ana dizinindeki .env.example dosyasının adını .env olarak değiştirin ve kendi MySQL bağlantı bilgilerinizi (DB_HOST, DB_USER, DB_PASS, DB_NAME) dosya içerisine girin.

3. Veritabanını oluşturun:
   Ekteki SQL dosyasını MySQL veritabanınıza import edin.

4. Projeyi başlatın:
   npm start

Sunucu varsayılan olarak http://localhost:3000 adresinde çalışacaktır.

## 3. API Endpoint Listesi

Proje aşağıdaki RESTful servisleri sunmaktadır:

**Satış İşlemleri**
* POST /api/sales -> Yeni satış kaydı oluşturur (Stok kontrol kuralı burada çalışır).
* GET /api/sales/summary -> Satış özetlerini ve sezonluk analiz uyarısını getirir.
* GET /api/sales/yearly-stats -> Yıllık kar/zarar istatistiklerini getirir.

**Stok Yönetimi**
* GET /api/stock/summary -> Tüm ürünlerin stok ve fiyat bilgilerini listeler.
* PUT /api/stock/:id -> ID'si verilen ürünün stok veya fiyat bilgisini günceller.
* DELETE /api/stock/:id -> ID'si verilen ürünü sistemden siler.

## 4. Veritabanı Şeması

Projenin veritabanı yapısı; ürünler, kategoriler, müşteriler ve satış geçmişi tablolarından oluşmaktadır. Tablo ilişkilerini gösteren ER diyagramı proje dosyaları arasında "melodi_market_diyagram.png" adıyla mevcuttur.
