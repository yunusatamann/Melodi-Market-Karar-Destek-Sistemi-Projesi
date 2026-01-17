const pool = require('../config/db');

class SaleModel {
  static async create(connection, urunId, musteriId, adet, satisFiyati) {
    const [result] = await connection.query(
      'INSERT INTO satis_gecmisi (urun_id, musteri_id, adet, satis_fiyati, satis_tarihi) VALUES (?, ?, ?, ?, NOW())',
      [urunId, musteriId, adet, satisFiyati]
    );
    return result;
  }

  static async getRecentSales(limit = 50) {
    const [rows] = await pool.query(
      `SELECT s.*, u.urun_adi, m.ad_soyad
       FROM satis_gecmisi s
       LEFT JOIN urunler u ON u.urun_id = s.urun_id
       LEFT JOIN musteriler m ON m.musteri_id = s.musteri_id
       ORDER BY s.satis_tarihi DESC
       LIMIT ?`,
      [limit]
    );
    return rows;
  }

  static async getMonthlyTrend(months = 12) {
    const [rows] = await pool.query(
      `SELECT 
          DATE_FORMAT(satis_tarihi, '%Y-%m') AS ay,
          DATE_FORMAT(satis_tarihi, '%b %Y') AS ay_adi,
          SUM(adet * satis_fiyati) AS toplam_ciro
      FROM satis_gecmisi
      WHERE satis_tarihi >= DATE_SUB(CURDATE(), INTERVAL ? MONTH)
      GROUP BY DATE_FORMAT(satis_tarihi, '%Y-%m'), DATE_FORMAT(satis_tarihi, '%b %Y')
      ORDER BY ay ASC`,
      [months]
    );
    return rows;
  }

  static async getCategoryRevenue() {
    const [rows] = await pool.query(
      `SELECT k.kategori_adi, SUM(s.adet * s.satis_fiyati) AS ciro
       FROM satis_gecmisi s
       JOIN urunler u ON u.urun_id = s.urun_id
       JOIN kategoriler k ON k.kategori_id = u.kategori_id
       GROUP BY k.kategori_id, k.kategori_adi
       ORDER BY ciro DESC`
    );
    return rows;
  }

  static async getSeasonalData() {
    const [rows] = await pool.query(
      `SELECT 
          YEAR(satis_tarihi) AS yil,
          MONTH(satis_tarihi) AS ay,
          SUM(adet * satis_fiyati) AS aylik_ciro,
          COUNT(DISTINCT urun_id) AS urun_cesidi
      FROM satis_gecmisi
      GROUP BY YEAR(satis_tarihi), MONTH(satis_tarihi)
      ORDER BY yil, ay`
    );
    return rows;
  }

  static async getPerformanceByYearMonth(year, month = 0) {
    const [rows] = await pool.query(
      `SELECT 
          COALESCE(SUM(s.adet * s.satis_fiyati), 0) AS totalCiro,
          COALESCE(SUM(s.adet * (s.satis_fiyati - u.birim_maliyet)), 0) AS totalKar
      FROM satis_gecmisi s
      LEFT JOIN urunler u ON u.urun_id = s.urun_id
      WHERE YEAR(s.satis_tarihi) = ?
        AND (? = 0 OR MONTH(s.satis_tarihi) = ?)`,
      [year, month, month]
    );
    return rows[0] || { totalCiro: 0, totalKar: 0 };
  }

  static async getCategoryProfit(year, month = 0) {
    const [rows] = await pool.query(
      `SELECT
          COALESCE(k.kategori_adi, 'Diğer') AS kategori_adi,
          COALESCE(SUM(s.adet * (s.satis_fiyati - u.birim_maliyet)), 0) AS kategori_kar
      FROM satis_gecmisi s
      LEFT JOIN urunler u ON u.urun_id = s.urun_id
      LEFT JOIN kategoriler k ON k.kategori_id = u.kategori_id
      WHERE YEAR(s.satis_tarihi) = ?
        AND (? = 0 OR MONTH(s.satis_tarihi) = ?)
      GROUP BY COALESCE(k.kategori_adi, 'Diğer')
      ORDER BY kategori_kar DESC`,
      [year, month, month]
    );
    return rows;
  }

  static async getDetailedPerformance(years) {
    const [rows] = await pool.query(
      `SELECT 
          YEAR(s.satis_tarihi) as yil,
          MONTH(s.satis_tarihi) as ay,
          COALESCE(SUM(s.adet * s.satis_fiyati), 0) as ciro,
          COALESCE(SUM(s.adet * (s.satis_fiyati - u.birim_maliyet)), 0) as kar
      FROM satis_gecmisi s
      LEFT JOIN urunler u ON u.urun_id = s.urun_id
      WHERE YEAR(s.satis_tarihi) IN (?)
      GROUP BY YEAR(s.satis_tarihi), MONTH(s.satis_tarihi)`,
      [years]
    );
    return rows;
  }

  static async getMonthlyRevenueForForecast() {
    const [rows] = await pool.query(
      `SELECT
        DATE_FORMAT(satis_tarihi, '%Y-%m') AS ay,
        SUM(adet * satis_fiyati) AS toplam_ciro
      FROM satis_gecmisi
      WHERE satis_tarihi >= '2023-01-01' AND satis_tarihi < '2026-01-01'
      GROUP BY ay
      ORDER BY ay ASC`
    );
    return rows;
  }

  static async getProductRevenueForABC() {
    const [rows] = await pool.query(
      `SELECT 
          u.urun_id,
          u.urun_adi,
          SUM(s.adet * s.satis_fiyati) AS toplam_ciro
      FROM satis_gecmisi s
      JOIN urunler u ON u.urun_id = s.urun_id
      GROUP BY u.urun_id, u.urun_adi
      ORDER BY toplam_ciro DESC`
    );
    return rows;
  }

  static async getSalesForStockRisk() {
    // Bu metod satış verilerini stok risk analizi için kullanılır
    // İlgili sorgu ReportModel'de olacak
    return [];
  }
}

module.exports = SaleModel;


