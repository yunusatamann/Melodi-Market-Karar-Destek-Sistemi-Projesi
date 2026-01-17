const pool = require('../config/db');

class CustomerModel {
  static async getAllWithSales() {
    const [rows] = await pool.query(
      `SELECT 
          m.*,
          COALESCE(SUM(s.adet * s.satis_fiyati), 0) as toplam_harcama,
          COUNT(s.satis_id) as islem_sayisi,
          MAX(s.satis_tarihi) as son_islem_tarihi
      FROM musteriler m
      LEFT JOIN satis_gecmisi s ON m.musteri_id = s.musteri_id
      GROUP BY m.musteri_id
      ORDER BY toplam_harcama DESC`
    );
    return rows;
  }

  static async getNextMonth() {
    const [[{ ay }]] = await pool.query(
      "SELECT (CASE WHEN MONTH(CURDATE()) = 12 THEN 1 ELSE MONTH(CURDATE()) + 1 END) as ay"
    );
    return ay;
  }
}

module.exports = CustomerModel;


