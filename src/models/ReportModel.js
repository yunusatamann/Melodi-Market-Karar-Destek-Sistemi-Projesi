const pool = require('../config/db');
const SaleModel = require('./SaleModel');

class ReportModel {
  static async getStockRiskProducts() {
    const [rows] = await pool.query(
      `SELECT u.urun_id, u.urun_adi, u.mevcut_stok,
              COALESCE(SUM(CASE 
                  WHEN satis_tarihi >= DATE_SUB(NOW(), INTERVAL 6 MONTH)
                  THEN adet ELSE 0 END),0) / 6 AS aylik_ortalama
       FROM urunler u
       LEFT JOIN satis_gecmisi s ON s.urun_id = u.urun_id
       GROUP BY u.urun_id, u.urun_adi, u.mevcut_stok
       HAVING aylik_ortalama > 0
          AND (u.mevcut_stok / aylik_ortalama) <= 6
       ORDER BY (u.mevcut_stok / aylik_ortalama) ASC
       LIMIT 10`
    );
    return rows;
  }

  static async getABCData() {
    return await SaleModel.getProductRevenueForABC();
  }

  static async getForecastData() {
    return await SaleModel.getMonthlyRevenueForForecast();
  }
}

module.exports = ReportModel;


