# BasarsoftStaj-HaritaUygulamasi

# Harita Tabanlı Veri Yönetim Sistemi

Bu proje, kullanıcıların harita üzerinde çeşitli geometrik şekiller (nokta, çizgi, poligon) ekleyip bu verileri kolayca yönetebilecekleri bir sistemdir. Sistem, kullanıcı dostu bir arayüzle harita tabanlı veri yönetimini sağlar ve coğrafi bilgileri WKT (Well-Known Text) formatında saklar. Proje, özellikle kullanıcıların veritabanına veri kaydetmesi, güncellemesi ve silmesi işlemlerini basitleştirmeyi hedeflerken, admin kullanıcılar için tüm sistem verilerini yönetebilecekleri bir yetkilendirme mekanizması içerir.

## Özellikler

- **Harita Tabanlı Veri Yönetimi:** Kullanıcılar harita üzerinde noktalar, çizgiler ve poligonlar ekleyebilir, bu verileri yönetebilir.
- **Kullanıcı Yetkilendirme ve Kimlik Doğrulama:** JWT (JSON Web Token) ile güvenli kimlik doğrulama ve yetkilendirme işlemleri yapılır. Admin kullanıcılar, diğer kullanıcıların verilerini yönetebilir.
- **Veri Görselleştirme:** OpenLayers kütüphanesi ile harita üzerinde geometrik verilerin görselleştirilmesi.
- **Veritabanı Yönetimi:** Veriler PostgreSQL'de WKT formatında saklanır. Veritabanı işlemleri için Entity Framework Core kullanılır.
- **E-posta Bildirimleri:** Kullanıcıların şifre sıfırlama taleplerini karşılamak için e-posta bildirim sistemi entegre edilmiştir.
- **Kullanıcı Dostu Arayüz:** React.js kullanılarak geliştirilmiş dinamik ve etkileşimli bir ön yüz.

## Kullanılan Teknolojiler

- **Frontend:**
  - React.js
  - OpenLayers
  - HTML, CSS, JavaScript

- **Backend:**
  - .NET Core
  - Entity Framework Core
  - PostgreSQL

- **Kimlik Doğrulama ve Güvenlik:**
  - JWT (JSON Web Token)

- **E-posta Bildirim Sistemi:**
  - SMTP tabanlı e-posta gönderimi

## Gereksinimler

Projenin çalışması için aşağıdaki bileşenlerin kurulu olması gerekmektedir:

- **Node.js:** v14.0 veya daha üstü
- **.NET Core SDK**
- **PostgreSQL**
- **SMTP Sunucusu:** E-posta bildirimlerinin çalışabilmesi için SMTP ayarlarının yapılandırılması gerekmektedir.

## Kurulum

Projeyi yerel ortamınızda çalıştırmak için aşağıdaki adımları takip edin:

### 1. Depoyu Klonlayın

```bash
git clone [https://github.com/kullanici_adi/proje-adi.git](https://github.com/SahinEkmenDev/BasarsoftStaj-HaritaUygulamasi.git)
cd harita-veri-yonetim-sistemi
```

### 2. Backend (API) Kurulumu

- .NET Core projesini açın ve gerekli bağımlılıkları yükleyin:

```bash
cd backend
dotnet restore
```

- PostgreSQL veritabanınızı ayarlayın ve `appsettings.json` dosyasındaki bağlantı dizesini yapılandırın.
- Veritabanını oluşturun ve migration'ları uygulayın:

```bash
dotnet ef database update
```

- API'yi başlatın:

```bash
dotnet run
```

### 3. Frontend Kurulumu

- Proje dizininde frontend klasörüne geçin ve bağımlılıkları yükleyin:

```bash
cd frontend
npm install
```

- React uygulamasını başlatın:

```bash
npm start
```

### 4. E-posta Servisi Kurulumu

- SMTP ayarlarınızı `appsettings.json` dosyasına ekleyin:

```json
"EmailSettings": {
  "SmtpServer": "smtp.mailprovider.com",
  "SmtpPort": 587,
  "SmtpUsername": "your-email@example.com",
  "SmtpPassword": "your-email-password",
  "FromEmail": "your-email@example.com"
}
```

Bu ayarlar sayesinde şifre sıfırlama talepleri için kullanıcıların e-posta adreslerine bildirimler gönderilecektir.

### 5. Uygulamayı Çalıştırma

- Backend ve frontend'i başarıyla başlattıktan sonra, tarayıcınızda şu URL'yi ziyaret edebilirsiniz:

```
http://localhost:3000
```

## API Endpoints

- **GET /api/point** - Tüm geometrik verileri getirir.
- **POST /api/point** - Yeni bir geometrik veri ekler.
- **PUT /api/point/{id}** - Belirli bir geometrik veriyi günceller.
- **DELETE /api/point/{id}** - Belirli bir geometrik veriyi siler.

## Testler

Proje için çeşitli testler uygulanmıştır:
- **Fonksiyonel Testler:** Veri ekleme, güncelleme ve silme işlemleri başarılı bir şekilde test edilmiştir.
- **Kullanıcı Deneyimi Testleri:** Arayüzün kullanıcı dostu olup olmadığı ve kolay kullanım sağladığı doğrulanmıştır.
- **Güvenlik Testleri:** JWT token bazlı kimlik doğrulama sistemi ile yetkisiz erişimler engellenmiş ve sistem güvenliği sağlanmıştır.
- **E-posta Bildirim Testleri:** SMTP üzerinden şifre sıfırlama işlemleri ve e-posta bildirimleri başarılı bir şekilde test edilmiştir.

## Katkıda Bulunanlar

- **Şahin (kullanıcı adı)** - Geliştirme, proje yönetimi ve mimari tasarım
- Yardım için iletişim: [sahinekmen160@gmail.com](mailto:sahinekmen160@gmail.com)

## Lisans

Bu proje MIT lisansı ile lisanslanmıştır. Daha fazla bilgi için `LICENSE` dosyasına göz atabilirsiniz.
