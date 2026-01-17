-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Anamakine: 127.0.0.1:3306
-- Üretim Zamanı: 15 Ara 2025, 16:18:11
-- Sunucu sürümü: 9.1.0
-- PHP Sürümü: 8.3.14

SET FOREIGN_KEY_CHECKS=0;
SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Veritabanı: `melodi_market`
--

-- --------------------------------------------------------

--
-- Tablo için tablo yapısı `kategoriler`
--

DROP TABLE IF EXISTS `kategoriler`;
CREATE TABLE IF NOT EXISTS `kategoriler` (
  `kategori_id` int NOT NULL AUTO_INCREMENT,
  `kategori_adi` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `aciklama` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`kategori_id`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Tablo döküm verisi `kategoriler`
--

INSERT INTO `kategoriler` (`kategori_id`, `kategori_adi`, `aciklama`) VALUES
(1, 'Telli Çalgılar', 'Gitar, Bağlama'),
(2, 'Yaylı Çalgılar', 'Keman'),
(3, 'Vurmalı Çalgılar', 'Bateri'),
(4, 'Tuşlu Çalgılar', 'Piyano'),
(5, 'Stüdyo', 'Ses Kartı'),
(6, 'Aksesuarlar', 'Tel'),
(7, 'Nefesli Çalgılar', 'Yan Flüt');

-- --------------------------------------------------------

--
-- Tablo için tablo yapısı `kds_senaryolari`
--

DROP TABLE IF EXISTS `kds_senaryolari`;
CREATE TABLE IF NOT EXISTS `kds_senaryolari` (
  `senaryo_id` int NOT NULL AUTO_INCREMENT,
  `urun_id` int DEFAULT NULL,
  `olusturma_tarihi` datetime DEFAULT CURRENT_TIMESTAMP,
  `tahmini_kur` decimal(10,2) DEFAULT NULL,
  `planlanan_alim_adeti` int DEFAULT NULL,
  `hesaplanan_kar` decimal(10,2) DEFAULT NULL,
  `hesaplanan_stok_omru` int DEFAULT NULL,
  `aciklama` text COLLATE utf8mb4_unicode_ci,
  PRIMARY KEY (`senaryo_id`),
  KEY `urun_id` (`urun_id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Tablo döküm verisi `kds_senaryolari`
--

INSERT INTO `kds_senaryolari` (`senaryo_id`, `urun_id`, `olusturma_tarihi`, `tahmini_kur`, `planlanan_alim_adeti`, `hesaplanan_kar`, `hesaplanan_stok_omru`, `aciklama`) VALUES
(1, 2, '2025-12-15 18:57:44', 42.50, 20, 150000.00, 8, 'Dolar 42.5 TL olursa Piyano stoğu maliyet analizi'),
(2, 3, '2025-12-15 18:57:44', 38.00, 50, 85000.00, 5, 'Fender Gitarlar için yılbaşı stoğu simülasyonu');

-- --------------------------------------------------------

--
-- Tablo için tablo yapısı `maliyet_gecmisi`
--

DROP TABLE IF EXISTS `maliyet_gecmisi`;
CREATE TABLE IF NOT EXISTS `maliyet_gecmisi` (
  `log_id` int NOT NULL AUTO_INCREMENT,
  `urun_id` int DEFAULT NULL,
  `eski_maliyet` decimal(10,2) DEFAULT NULL,
  `yeni_maliyet` decimal(10,2) DEFAULT NULL,
  `degisim_tarihi` datetime DEFAULT CURRENT_TIMESTAMP,
  `degisim_sebebi` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`log_id`),
  KEY `urun_id` (`urun_id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Tablo döküm verisi `maliyet_gecmisi`
--

INSERT INTO `maliyet_gecmisi` (`log_id`, `urun_id`, `eski_maliyet`, `yeni_maliyet`, `degisim_tarihi`, `degisim_sebebi`) VALUES
(1, 1, 3500.00, 3800.00, '2025-12-15 18:57:44', 'Fiyat Güncellemesi'),
(2, 5, 150.00, 180.00, '2025-12-15 18:57:44', 'Fiyat Güncellemesi');

-- --------------------------------------------------------

--
-- Tablo için tablo yapısı `musteriler`
--

DROP TABLE IF EXISTS `musteriler`;
CREATE TABLE IF NOT EXISTS `musteriler` (
  `musteri_id` int NOT NULL AUTO_INCREMENT,
  `ad_soyad` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `email` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `dogum_tarihi` date DEFAULT NULL,
  `sehir` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `kayit_tarihi` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`musteri_id`)
) ENGINE=InnoDB AUTO_INCREMENT=16 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Tablo döküm verisi `musteriler`
--

INSERT INTO `musteriler` (`musteri_id`, `ad_soyad`, `email`, `dogum_tarihi`, `sehir`, `kayit_tarihi`) VALUES
(1, 'Ahmet Yılmaz', 'ahmet@t.com', '1990-01-14', 'İstanbul', '2025-12-15 18:46:53'),
(2, 'Ayşe Demir', 'ayse@t.com', '1995-01-23', 'İzmir', '2025-12-15 18:46:53'),
(3, 'Mehmet Kaya', 'mehmet@t.com', '1988-01-12', 'Ankara', '2025-12-15 18:46:53'),
(4, 'Selin Çelik', 'selin@t.com', '2000-07-30', 'İstanbul', '2025-12-15 18:46:53'),
(5, 'Burak Can', 'burak@t.com', '1992-09-09', 'Bursa', '2025-12-15 18:46:53'),
(6, 'Zeynep Şahin', 'zeynep@t.com', '1998-12-05', 'Antalya', '2025-12-15 18:46:53'),
(7, 'Caner Erkin', 'caner@t.com', '1985-03-25', 'İstanbul', '2025-12-15 18:46:53'),
(8, 'Elif Polat', 'elif@t.com', '1993-11-11', 'İzmir', '2025-12-15 18:46:53'),
(9, 'Ozan Güven', 'ozan@t.com', '1979-05-19', 'İstanbul', '2025-12-15 18:46:53'),
(10, 'Gamze Öz', 'gamze@t.com', '1996-08-14', 'Ankara', '2025-12-15 18:46:53'),
(11, 'Murat Boz', 'murat@t.com', '1980-03-07', 'İstanbul', '2025-12-15 18:46:53'),
(12, 'Hadise Açıkgöz', 'hadise@t.com', '1985-10-22', 'İstanbul', '2025-12-15 18:46:53'),
(13, 'Teoman Y', 'teoman@t.com', '1967-11-20', 'İzmir', '2025-12-15 18:46:53'),
(14, 'Şebnem F', 'sebnem@t.com', '1972-04-12', 'Bursa', '2025-12-15 18:46:53'),
(15, 'Hayko C', 'hayko@t.com', '1978-01-11', 'İzmir', '2025-12-15 18:46:53');

--
-- Tetikleyiciler `musteriler`
--
DROP TRIGGER IF EXISTS `dogum_gunu_yogunluk_uyarisi`;
DELIMITER $$
CREATE TRIGGER `dogum_gunu_yogunluk_uyarisi` AFTER INSERT ON `musteriler` FOR EACH ROW BEGIN
    DECLARE gelecek_ay INT;
    DECLARE dogum_gunu_sayisi INT;

    -- 1. Gelecek ayı hesapla (Aralık ayındaysak Ocak ayına dönmesini sağla)
    SET gelecek_ay = MONTH(CURDATE()) + 1;
    IF gelecek_ay > 12 THEN SET gelecek_ay = 1; END IF;

    -- 2. Veritabanındaki müşterilerden gelecek ay doğanları say
    SELECT COUNT(*) INTO dogum_gunu_sayisi
    FROM musteriler
    WHERE MONTH(dogum_tarihi) = gelecek_ay;

    -- 3. Eğer sayı 2'den fazlaysa uyarı ver (Veri setimiz küçük olduğu için eşik 2)
    -- Not: Uyarıyı teknik olarak 1 numaralı ürüne bağlıyoruz ki tablo hata vermesin.
    IF dogum_gunu_sayisi >= 2 THEN
        INSERT INTO risk_uyarilari (urun_id, uyari_seviyesi, mesaj)
        VALUES (
            1, -- Genel uyarı olduğu için 1. ürüne bağlıyoruz
            'Orta', 
            CONCAT('Fırsat! Gelecek ay ', dogum_gunu_sayisi, ' müşterinin doğum günü var. Kampanya planlayın.')
        );
    END IF;
END
$$
DELIMITER ;

-- --------------------------------------------------------

--
-- Tablo için tablo yapısı `risk_uyarilari`
--

DROP TABLE IF EXISTS `risk_uyarilari`;
CREATE TABLE IF NOT EXISTS `risk_uyarilari` (
  `uyari_id` int NOT NULL AUTO_INCREMENT,
  `urun_id` int DEFAULT NULL,
  `uyari_tarihi` datetime DEFAULT CURRENT_TIMESTAMP,
  `uyari_seviyesi` enum('Orta','Kritik') COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `mesaj` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`uyari_id`),
  KEY `urun_id` (`urun_id`)
) ENGINE=InnoDB AUTO_INCREMENT=18 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Tablo döküm verisi `risk_uyarilari`
--

INSERT INTO `risk_uyarilari` (`uyari_id`, `urun_id`, `uyari_tarihi`, `uyari_seviyesi`, `mesaj`) VALUES
(14, 1, '2025-12-15 18:46:53', 'Orta', 'Fırsat! Gelecek ay 4 müşterinin doğum günü var. Kampanya planlayın.'),
(15, 3, '2025-12-15 18:46:53', 'Kritik', 'Dikkat! Fender Player Stratocaster stoğu kritik seviyede: 7'),
(16, 2, '2025-12-15 18:46:53', 'Kritik', 'Dikkat! Yamaha Arius YDP-145 Piyano stoğu kritik seviyede: 4'),
(17, 12, '2025-12-15 18:46:53', 'Kritik', 'Dikkat! DAddario EXL110 Tel Seti stoğu kritik seviyede: 40');

-- --------------------------------------------------------

--
-- Tablo için tablo yapısı `satis_gecmisi`
--

DROP TABLE IF EXISTS `satis_gecmisi`;
CREATE TABLE IF NOT EXISTS `satis_gecmisi` (
  `satis_id` int NOT NULL AUTO_INCREMENT,
  `urun_id` int DEFAULT NULL,
  `musteri_id` int DEFAULT NULL,
  `satis_tarihi` datetime DEFAULT CURRENT_TIMESTAMP,
  `adet` int DEFAULT NULL,
  `satis_fiyati` decimal(10,2) DEFAULT NULL,
  PRIMARY KEY (`satis_id`),
  KEY `urun_id` (`urun_id`),
  KEY `musteri_id` (`musteri_id`)
) ENGINE=InnoDB AUTO_INCREMENT=59 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Tablo döküm verisi `satis_gecmisi`
--

INSERT INTO `satis_gecmisi` (`satis_id`, `urun_id`, `musteri_id`, `satis_tarihi`, `adet`, `satis_fiyati`) VALUES
(1, 1, 1, '2023-09-01 00:00:00', 5, 5200.00),
(2, 1, 2, '2023-09-02 00:00:00', 3, 5200.00),
(3, 7, 3, '2023-09-05 00:00:00', 2, 4000.00),
(4, 4, 5, '2023-09-06 00:00:00', 4, 6500.00),
(5, 1, 4, '2023-09-10 00:00:00', 10, 5000.00),
(6, 10, 6, '2023-09-12 00:00:00', 1, 27000.00),
(7, 1, 7, '2023-09-15 00:00:00', 2, 5200.00),
(8, 5, 8, '2023-10-05 00:00:00', 50, 300.00),
(9, 12, 9, '2023-10-12 00:00:00', 20, 450.00),
(10, 6, 10, '2023-10-25 00:00:00', 2, 9500.00),
(11, 3, 11, '2023-11-15 00:00:00', 1, 32000.00),
(12, 3, 12, '2023-11-20 00:00:00', 2, 30000.00),
(13, 8, 13, '2023-11-25 00:00:00', 1, 68000.00),
(14, 2, 1, '2023-11-28 00:00:00', 1, 38000.00),
(15, 3, 14, '2025-12-15 18:46:53', 5, 32000.00),
(16, 2, 15, '2025-12-15 18:46:53', 5, 38000.00),
(17, 12, 2, '2025-12-15 18:46:53', 240, 400.00),
-- Son 12 ay için test verileri (2024-12'den 2025-12'ye)
(18, 1, 1, '2024-12-05 10:00:00', 8, 5200.00),
(19, 3, 2, '2024-12-12 14:30:00', 2, 32000.00),
(20, 6, 3, '2024-12-20 11:15:00', 1, 9500.00),
(21, 4, 4, '2025-01-08 09:00:00', 3, 6500.00),
(22, 1, 5, '2025-01-15 16:20:00', 12, 5200.00),
(23, 7, 6, '2025-01-22 13:45:00', 4, 4000.00),
(24, 2, 7, '2025-02-03 10:30:00', 1, 38000.00),
(25, 5, 8, '2025-02-10 15:00:00', 60, 300.00),
(26, 10, 9, '2025-02-18 11:30:00', 2, 27000.00),
(27, 12, 10, '2025-03-05 09:15:00', 30, 450.00),
(28, 1, 11, '2025-03-12 14:00:00', 6, 5200.00),
(29, 3, 12, '2025-03-20 10:45:00', 1, 32000.00),
(30, 6, 13, '2025-04-02 12:00:00', 2, 9500.00),
(31, 4, 14, '2025-04-10 08:30:00', 5, 6500.00),
(32, 8, 15, '2025-04-18 16:15:00', 1, 68000.00),
(33, 1, 1, '2025-05-05 11:00:00', 10, 5200.00),
(34, 2, 2, '2025-05-12 13:30:00', 2, 38000.00),
(35, 5, 3, '2025-05-20 09:45:00', 80, 300.00),
(36, 7, 4, '2025-06-03 14:20:00', 3, 4000.00),
(37, 12, 5, '2025-06-10 10:00:00', 25, 450.00),
(38, 3, 6, '2025-06-18 15:30:00', 2, 32000.00),
(39, 1, 7, '2025-07-05 11:15:00', 7, 5200.00),
(40, 6, 8, '2025-07-12 09:00:00', 1, 9500.00),
(41, 10, 9, '2025-07-20 13:45:00', 1, 27000.00),
(42, 4, 10, '2025-08-02 10:30:00', 4, 6500.00),
(43, 1, 11, '2025-08-10 14:00:00', 9, 5200.00),
(44, 2, 12, '2025-08-18 11:30:00', 1, 38000.00),
(45, 5, 13, '2025-09-05 08:15:00', 70, 300.00),
(46, 3, 14, '2025-09-12 15:00:00', 3, 32000.00),
(47, 12, 15, '2025-09-20 12:45:00', 35, 450.00),
(48, 1, 1, '2025-10-03 10:00:00', 11, 5200.00),
(49, 7, 2, '2025-10-10 13:30:00', 5, 4000.00),
(50, 6, 3, '2025-10-18 09:15:00', 2, 9500.00),
(51, 8, 4, '2025-11-05 14:20:00', 1, 68000.00),
(52, 1, 5, '2025-11-12 11:00:00', 8, 5200.00),
(53, 2, 6, '2025-11-20 15:45:00', 3, 38000.00),
(54, 10, 7, '2025-11-28 10:30:00', 2, 27000.00),
(55, 3, 8, '2025-12-01 12:00:00', 1, 32000.00),
(56, 4, 9, '2025-12-05 09:15:00', 6, 6500.00),
(57, 12, 10, '2025-12-10 14:00:00', 40, 450.00),
(58, 1, 11, '2025-12-12 11:30:00', 5, 5200.00);

--
-- Tetikleyiciler `satis_gecmisi`
--
DROP TRIGGER IF EXISTS `satis_gecmisi_koruma`;
DELIMITER $$
CREATE TRIGGER `satis_gecmisi_koruma` BEFORE DELETE ON `satis_gecmisi` FOR EACH ROW BEGIN
    SIGNAL SQLSTATE '45000' 
    SET MESSAGE_TEXT = 'HATA: KDS tahmin doğruluğu için geçmiş satış verileri silinemez!';
END
$$
DELIMITER ;
DROP TRIGGER IF EXISTS `satis_sonrasi_stok_ve_risk_kontrol`;
DELIMITER $$
CREATE TRIGGER `satis_sonrasi_stok_ve_risk_kontrol` AFTER INSERT ON `satis_gecmisi` FOR EACH ROW BEGIN
    DECLARE kalan_stok INT;
    DECLARE guvenlik_stogu INT;
    DECLARE urun_isim VARCHAR(255);

    -- Stoğu düş
    UPDATE urunler 
    SET mevcut_stok = mevcut_stok - NEW.adet
    WHERE urun_id = NEW.urun_id;

    -- Kalan stoğu kontrol et
    SELECT mevcut_stok, min_stok_seviyesi, urun_adi 
    INTO kalan_stok, guvenlik_stogu, urun_isim
    FROM urunler 
    WHERE urun_id = NEW.urun_id;

    -- Risk varsa uyarı yaz
    IF kalan_stok <= guvenlik_stogu THEN
        INSERT INTO risk_uyarilari (urun_id, uyari_seviyesi, mesaj)
        VALUES (
            NEW.urun_id, 
            'Kritik', 
            CONCAT('Dikkat! ', urun_isim, ' stoğu kritik seviyede: ', kalan_stok)
        );
    END IF;
END
$$
DELIMITER ;

-- --------------------------------------------------------

--
-- Tablo için tablo yapısı `tedarikciler`
--

DROP TABLE IF EXISTS `tedarikciler`;
CREATE TABLE IF NOT EXISTS `tedarikciler` (
  `tedarikci_id` int NOT NULL AUTO_INCREMENT,
  `firma_adi` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `para_birimi` varchar(10) COLLATE utf8mb4_unicode_ci DEFAULT 'USD',
  `toplu_alim_indirim_orani` decimal(5,2) DEFAULT '0.00',
  `iletisim_email` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`tedarikci_id`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Tablo döküm verisi `tedarikciler`
--

INSERT INTO `tedarikciler` (`tedarikci_id`, `firma_adi`, `para_birimi`, `toplu_alim_indirim_orani`, `iletisim_email`) VALUES
(1, 'Yamaha Music TR', 'USD', 0.15, 'satis@yamaha.com'),
(2, 'Fender Global', 'USD', 0.20, 'b2b@fender.com'),
(3, 'Zuhal Müzik', 'TL', 0.05, 'depo@zuhal.com'),
(4, 'Doremusic', 'EUR', 0.12, 'info@doremusic.com'),
(5, 'Anadolu Luthier', 'TL', 0.00, 'info@anadolu.com'),
(6, 'Senkop Müzik', 'USD', 0.10, 'satis@senkop.com');

-- --------------------------------------------------------

--
-- Tablo için tablo yapısı `urunler`
--

DROP TABLE IF EXISTS `urunler`;
CREATE TABLE IF NOT EXISTS `urunler` (
  `urun_id` int NOT NULL AUTO_INCREMENT,
  `tedarikci_id` int DEFAULT NULL,
  `kategori_id` int DEFAULT NULL,
  `urun_adi` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `mevcut_stok` int DEFAULT '0',
  `birim_maliyet` decimal(10,2) DEFAULT NULL,
  `satis_fiyati` decimal(10,2) DEFAULT NULL,
  `tedarik_suresi_gun` int DEFAULT NULL,
  `min_stok_seviyesi` int DEFAULT NULL,
  PRIMARY KEY (`urun_id`),
  KEY `tedarikci_id` (`tedarikci_id`),
  KEY `kategori_id` (`kategori_id`)
) ENGINE=InnoDB AUTO_INCREMENT=13 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Tablo döküm verisi `urunler`
--

INSERT INTO `urunler` (`urun_id`, `tedarikci_id`, `kategori_id`, `urun_adi`, `mevcut_stok`, `birim_maliyet`, `satis_fiyati`, `tedarik_suresi_gun`, `min_stok_seviyesi`) VALUES
(1, 1, 1, 'Yamaha C40 Klasik Gitar', 130, 3800.00, 5200.00, 30, 20),
(2, 1, 4, 'Yamaha Arius YDP-145 Piyano', 4, 25000.00, 38000.00, 60, 5),
(3, 2, 1, 'Fender Player Stratocaster', 7, 22000.00, 32000.00, 45, 8),
(4, 5, 1, 'Maun Kısa Sap Bağlama', 36, 4000.00, 6500.00, 15, 10),
(5, 2, 6, 'Fender Gitar Penası (12li)', 450, 180.00, 300.00, 5, 100),
(6, 6, 5, 'Focusrite Scarlett 2i2', 33, 6000.00, 9500.00, 20, 10),
(7, 3, 2, 'Carloavy Keman 4/4', 48, 2500.00, 4000.00, 25, 15),
(8, 4, 3, 'Roland TD-17KVX2', 7, 45000.00, 68000.00, 50, 3),
(9, 3, 6, 'Gitar Standı', 100, 300.00, 600.00, 10, 20),
(10, 1, 7, 'Yamaha YFL-212 Yan Flüt', 19, 18000.00, 27000.00, 40, 5),
(11, 2, 1, 'Fender Twin Reverb Amfi', 6, 50000.00, 75000.00, 90, 2),
(12, 6, 6, 'DAddario EXL110 Tel Seti', 40, 200.00, 450.00, 7, 50);

--
-- Tetikleyiciler `urunler`
--
DROP TRIGGER IF EXISTS `kar_marji_kontrol`;
DELIMITER $$
CREATE TRIGGER `kar_marji_kontrol` AFTER UPDATE ON `urunler` FOR EACH ROW BEGIN
    -- Maliyet arttıysa ve yeni maliyet satış fiyatına çok yaklaştıysa
    IF NEW.birim_maliyet > OLD.birim_maliyet AND NEW.satis_fiyati < (NEW.birim_maliyet * 1.10) THEN
        INSERT INTO risk_uyarilari (urun_id, uyari_seviyesi, mesaj)
        VALUES (
            NEW.urun_id, 
            'Orta', 
            CONCAT('Maliyet arttı (', NEW.birim_maliyet, '), kâr marjı riskte! Fiyatı güncelleyin.')
        );
    END IF;
END
$$
DELIMITER ;
DROP TRIGGER IF EXISTS `maliyet_degisim_takibi`;
DELIMITER $$
CREATE TRIGGER `maliyet_degisim_takibi` AFTER UPDATE ON `urunler` FOR EACH ROW BEGIN
    IF OLD.birim_maliyet <> NEW.birim_maliyet THEN
        INSERT INTO maliyet_gecmisi (urun_id, eski_maliyet, yeni_maliyet, degisim_sebebi)
        VALUES (NEW.urun_id, OLD.birim_maliyet, NEW.birim_maliyet, 'Fiyat Güncellemesi');
    END IF;
END
$$
DELIMITER ;
DROP TRIGGER IF EXISTS `tedarik_suresi_kontrol`;
DELIMITER $$
CREATE TRIGGER `tedarik_suresi_kontrol` AFTER UPDATE ON `urunler` FOR EACH ROW BEGIN
    IF NEW.tedarik_suresi_gun > (OLD.tedarik_suresi_gun + 15) THEN
        INSERT INTO risk_uyarilari (urun_id, uyari_seviyesi, mesaj)
        VALUES (
            NEW.urun_id, 
            'Kritik', 
            CONCAT('Tedarik süresi ', NEW.tedarik_suresi_gun, ' güne fırladı. Planları revize edin.')
        );
    END IF;
END
$$
DELIMITER ;

--
-- Dökümü yapılmış tablolar için kısıtlamalar
--

--
-- Tablo kısıtlamaları `kds_senaryolari`
--
ALTER TABLE `kds_senaryolari`
  ADD CONSTRAINT `kds_senaryolari_ibfk_1` FOREIGN KEY (`urun_id`) REFERENCES `urunler` (`urun_id`) ON DELETE CASCADE;

--
-- Tablo kısıtlamaları `maliyet_gecmisi`
--
ALTER TABLE `maliyet_gecmisi`
  ADD CONSTRAINT `maliyet_gecmisi_ibfk_1` FOREIGN KEY (`urun_id`) REFERENCES `urunler` (`urun_id`) ON DELETE CASCADE;

--
-- Tablo kısıtlamaları `risk_uyarilari`
--
ALTER TABLE `risk_uyarilari`
  ADD CONSTRAINT `risk_uyarilari_ibfk_1` FOREIGN KEY (`urun_id`) REFERENCES `urunler` (`urun_id`) ON DELETE CASCADE;

--
-- Tablo kısıtlamaları `satis_gecmisi`
--
ALTER TABLE `satis_gecmisi`
  ADD CONSTRAINT `satis_gecmisi_ibfk_1` FOREIGN KEY (`urun_id`) REFERENCES `urunler` (`urun_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `satis_gecmisi_ibfk_2` FOREIGN KEY (`musteri_id`) REFERENCES `musteriler` (`musteri_id`) ON DELETE SET NULL;

--
-- Tablo kısıtlamaları `urunler`
--
ALTER TABLE `urunler`
  ADD CONSTRAINT `urunler_ibfk_1` FOREIGN KEY (`tedarikci_id`) REFERENCES `tedarikciler` (`tedarikci_id`) ON DELETE SET NULL,
  ADD CONSTRAINT `urunler_ibfk_2` FOREIGN KEY (`kategori_id`) REFERENCES `kategoriler` (`kategori_id`) ON DELETE SET NULL;
SET FOREIGN_KEY_CHECKS=1;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
