 const pool = require('../config/db');

 function initPerformansData(years) {
   const result = {};
   for (const yil of years) {
     result[yil] = { '0': { ciro: 0, kar: 0 } };
     for (let i = 1; i <= 12; i++) {
       result[yil][String(i)] = { ciro: 0, kar: 0 };
     }
   }
   return result;
 }

 async function getYearlyStats(req, res) {
   try {
     const year = Number(req.query.year);
     const month = Number(req.query.month || 0);

     if (!Number.isFinite(year) || year < 2000 || year > 2100) {
       return res.status(400).json({ error: 'invalid_year' });
     }

     const safeMonth = Number.isFinite(month) && month >= 0 && month <= 12 ? month : 0;

     const [totalsRows] = await pool.query(
       `
         SELECT
           COALESCE(SUM(s.adet * s.satis_fiyati), 0) AS totalCiro,
           COALESCE(SUM(s.adet * (s.satis_fiyati - u.birim_maliyet)), 0) AS totalKar
         FROM satis_gecmisi s
         LEFT JOIN urunler u ON u.urun_id = s.urun_id
         WHERE YEAR(s.satis_tarihi) = ?
           AND (? = 0 OR MONTH(s.satis_tarihi) = ?)
       `,
       [year, safeMonth, safeMonth]
     );

     const totals = totalsRows && totalsRows[0] ? totalsRows[0] : { totalCiro: 0, totalKar: 0 };

     const [kategoriRows] = await pool.query(
       `
         SELECT
           COALESCE(k.kategori_adi, 'Diğer') AS kategori_adi,
           COALESCE(SUM(s.adet * (s.satis_fiyati - u.birim_maliyet)), 0) AS kategori_kar
         FROM satis_gecmisi s
         LEFT JOIN urunler u ON u.urun_id = s.urun_id
         LEFT JOIN kategoriler k ON k.kategori_id = u.kategori_id
         WHERE YEAR(s.satis_tarihi) = ?
           AND (? = 0 OR MONTH(s.satis_tarihi) = ?)
         GROUP BY COALESCE(k.kategori_adi, 'Diğer')
         ORDER BY kategori_kar DESC
       `,
       [year, safeMonth, safeMonth]
     );

     const labels = [];
     const data = [];
     for (const row of kategoriRows) {
       labels.push(String(row.kategori_adi));
       data.push(Number(row.kategori_kar || 0));
     }

     res.json({
       totalCiro: Number(totals.totalCiro || 0),
       totalKar: Number(totals.totalKar || 0),
       breakdown: { labels, data }
     });
   } catch (err) {
     res.status(500).json({ error: 'sales_yearly_stats_failed' });
   }
 }

 async function getSummary(req, res) {
   try {
     const [seasonalData] = await pool.query(
       `
         SELECT 
             YEAR(satis_tarihi) AS yil,
             MONTH(satis_tarihi) AS ay,
             SUM(adet * satis_fiyati) AS aylik_ciro,
             COUNT(DISTINCT urun_id) AS urun_cesidi
         FROM satis_gecmisi
         GROUP BY YEAR(satis_tarihi), MONTH(satis_tarihi)
         ORDER BY yil, ay
       `
     );

     const juneSales = [];
     const otherMonthsSales = [];
     const yearlyData = {};

     for (const row of seasonalData) {
       const year = Number(row.yil);
       const month = Number(row.ay);
       const ciro = Number(row.aylik_ciro || 0);

       if (!yearlyData[year]) {
         yearlyData[year] = {};
         for (let i = 1; i <= 12; i++) yearlyData[year][i] = 0;
       }
       yearlyData[year][month] = ciro;

       if (month === 6) juneSales.push(ciro);
       else otherMonthsSales.push(ciro);
     }

     const avgJune = juneSales.length ? juneSales.reduce((a, b) => a + b, 0) / juneSales.length : 0;
     const avgOtherMonths = otherMonthsSales.length ? otherMonthsSales.reduce((a, b) => a + b, 0) / otherMonthsSales.length : 0;
     const yazSezonuUyarisi = avgOtherMonths > 0 && (avgJune - avgOtherMonths) / avgOtherMonths > 0.3;

     const years = [2023, 2024, 2025];
     const [rawVeriler] = await pool.query(
       `
         SELECT 
             YEAR(s.satis_tarihi) as yil,
             MONTH(s.satis_tarihi) as ay,
             COALESCE(SUM(s.adet * s.satis_fiyati), 0) as ciro,
             COALESCE(SUM(s.adet * (s.satis_fiyati - u.birim_maliyet)), 0) as kar
         FROM satis_gecmisi s
         LEFT JOIN urunler u ON u.urun_id = s.urun_id
         WHERE YEAR(s.satis_tarihi) IN (2023, 2024, 2025)
         GROUP BY YEAR(s.satis_tarihi), MONTH(s.satis_tarihi)
       `
     );

     const performansData = initPerformansData(years);
     for (const row of rawVeriler) {
       const y = String(row.yil);
       const a = String(row.ay);
       const ciro = Number(row.ciro || 0);
       const kar = Number(row.kar || 0);

       if (!performansData[y]) continue;
       performansData[y][a] = { ciro, kar };
       performansData[y]['0'].ciro += ciro;
       performansData[y]['0'].kar += kar;
     }

     const [satislar] = await pool.query(
       `
         SELECT s.*, u.urun_adi, m.ad_soyad
         FROM satis_gecmisi s
         LEFT JOIN urunler u ON u.urun_id = s.urun_id
         LEFT JOIN musteriler m ON m.musteri_id = s.musteri_id
         ORDER BY s.satis_tarihi DESC
         LIMIT 50
       `
     );

     res.json({
       yazSezonuUyarisi,
       yearlyData,
       performansData,
       satislar: satislar.map((s) => ({
         ...s,
         adet: s.adet != null ? Number(s.adet) : null,
         satis_fiyati: s.satis_fiyati != null ? Number(s.satis_fiyati) : null
       }))
     });
   } catch (err) {
     res.status(500).json({ error: 'sales_summary_failed' });
   }
 }



async function createSale(req, res) {
  const connection = await pool.getConnection(); 
  try {
    const { urun_id, musteri_id, adet } = req.body;

    if (!urun_id || !adet || adet <= 0) {
      return res.status(400).json({ error: 'Gecersiz veri.' });
    }

    await connection.beginTransaction(); 

   
    const [rows] = await connection.query(
      'SELECT stok_miktari, satis_fiyati, urun_adi FROM urunler WHERE urun_id = ? FOR UPDATE', 
      [urun_id]
    );

    if (rows.length === 0) {
      await connection.rollback();
      return res.status(404).json({ error: 'Urun bulunamadi.' });
    }

    const urun = rows[0];

    if (urun.stok_miktari < adet) {
      await connection.rollback();
      return res.status(400).json({ 
        error: 'STOK_YETERSİZ', 
        message: `Stokta sadece ${urun.stok_miktari} adet ${urun.urun_adi} kaldı. İşlem engellendi.` 
      });
    }

    await connection.query(
      'INSERT INTO satis_gecmisi (urun_id, musteri_id, adet, satis_fiyati, satis_tarihi) VALUES (?, ?, ?, ?, NOW())',
      [urun_id, musteri_id, adet, urun.satis_fiyati]
    );

    await connection.query(
      'UPDATE urunler SET stok_miktari = stok_miktari - ? WHERE urun_id = ?',
      [adet, urun_id]
    );

    let uyari = null;
    if (urun.stok_miktari - adet <= 5) {
      uyari = "DİKKAT: Ürün stoğu kritik seviyeye düştü! Tedarik yapılması önerilir.";
    }

    await connection.commit();
    connection.release();

    res.status(201).json({ 
      message: 'Satis basariyla kaydedildi.', 
      kds_uyarisi: uyari 
    });

  } catch (err) {
    if (connection) {
      await connection.rollback(); 
      connection.release();
    }
    console.error(err);
    res.status(500).json({ error: 'Satis islemi sirasinda hata olustu.' });
  }
}

 module.exports = {
   getSummary,
   getYearlyStats,
   createSale
 };
