const pool = require('../config/db');
const SaleModel = require('../models/SaleModel');
const ProductModel = require('../models/ProductModel');

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

     const totals = await SaleModel.getPerformanceByYearMonth(year, safeMonth);
     const kategoriRows = await SaleModel.getCategoryProfit(year, safeMonth);

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
     const seasonalData = await SaleModel.getSeasonalData();

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
     const rawVeriler = await SaleModel.getDetailedPerformance(years);

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

     const satislar = await SaleModel.getRecentSales(50);

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

    const urun = await ProductModel.getByIdForUpdate(connection, urun_id);

    if (!urun) {
      await connection.rollback();
      connection.release();
      return res.status(404).json({ error: 'Urun bulunamadi.' });
    }

    if (urun.stok_miktari < adet) {
      await connection.rollback();
      connection.release();
      return res.status(400).json({ 
        error: 'STOK_YETERSİZ', 
        message: `Stokta sadece ${urun.stok_miktari} adet ${urun.urun_adi} kaldı. İşlem engellendi.` 
      });
    }

    await SaleModel.create(connection, urun_id, musteri_id, adet, urun.satis_fiyati);
    await ProductModel.updateStock(connection, urun_id, adet);

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
