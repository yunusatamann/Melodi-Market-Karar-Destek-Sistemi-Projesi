const pool = require('../config/db');

class ProductModel {
  // Tüm ürünleri getir
  static async getAll() {
    const [rows] = await pool.query(
      `SELECT u.*, k.kategori_adi, t.firma_adi
       FROM urunler u
       LEFT JOIN kategoriler k ON k.kategori_id = u.kategori_id
       LEFT JOIN tedarikciler t ON t.tedarikci_id = u.tedarikci_id
       ORDER BY u.urun_adi`
    );
    return rows;
  }

  // Ürün sayısını getir
  static async getCount() {
    const [[{ toplam }]] = await pool.query('SELECT COUNT(*) AS toplam FROM urunler');
    return toplam;
  }

  // Kritik stok sayısını getir
  static async getCriticalStockCount() {
    const [[{ kritik }]] = await pool.query(
      'SELECT COUNT(*) AS kritik FROM urunler WHERE mevcut_stok <= min_stok_seviyesi'
    );
    return kritik;
  }

  // ID'ye göre ürün getir
  static async getById(urunId) {
    const [[row]] = await pool.query('SELECT * FROM urunler WHERE urun_id = ?', [urunId]);
    return row;
  }

  // ID'ye göre ürün getir (FOR UPDATE - transaction için)
  static async getByIdForUpdate(connection, urunId) {
    const [rows] = await connection.query(
      'SELECT stok_miktari, satis_fiyati, urun_adi FROM urunler WHERE urun_id = ? FOR UPDATE',
      [urunId]
    );
    return rows[0];
  }

  // Kategori dağılımını getir
  static async getCategoryDistribution() {
    const [rows] = await pool.query(
      `SELECT k.kategori_adi, COUNT(u.urun_id) as urun_sayisi
       FROM kategoriler k
       LEFT JOIN urunler u ON k.kategori_id = u.kategori_id
       GROUP BY k.kategori_id, k.kategori_adi
       HAVING urun_sayisi > 0
       ORDER BY urun_sayisi DESC`
    );
    return rows;
  }

  // Düşük kar marjlı ürünleri getir
  static async getLowMarginProducts() {
    const [rows] = await pool.query(
      `SELECT urun_adi, birim_maliyet, satis_fiyati,
              CASE 
                  WHEN satis_fiyati > 0 
                  THEN ROUND(((satis_fiyati - birim_maliyet) / satis_fiyati) * 100, 1)
                  ELSE NULL
              END AS kar_yuzde
       FROM urunler
       WHERE satis_fiyati IS NOT NULL
         AND birim_maliyet IS NOT NULL
         AND satis_fiyati < birim_maliyet * 1.15
       ORDER BY kar_yuzde ASC`
    );
    return rows;
  }

  // Stok grafik verilerini getir
  static async getStockChartData() {
    const [rows] = await pool.query(
      `SELECT 
          u.urun_id,
          u.urun_adi,
          u.kategori_id,
          k.kategori_adi,
          u.mevcut_stok,
          u.min_stok_seviyesi,
          CASE 
              WHEN u.min_stok_seviyesi > 0 
              THEN ROUND((u.mevcut_stok / u.min_stok_seviyesi) * 100, 1)
              ELSE 0
          END AS doluluk_orani
      FROM urunler u
      LEFT JOIN kategoriler k ON u.kategori_id = k.kategori_id
      WHERE u.min_stok_seviyesi > 0
      ORDER BY doluluk_orani ASC
      LIMIT 20`
    );
    return rows;
  }

  // Ürün güncelle
  static async update(urunId, stokMiktari, satisFiyati, urunAdi) {
    const [result] = await pool.query(
      'UPDATE urunler SET stok_miktari = ?, satis_fiyati = ?, urun_adi = ? WHERE urun_id = ?',
      [stokMiktari, satisFiyati, urunAdi, urunId]
    );
    return result;
  }

  // Stok miktarını güncelle (transaction için)
  static async updateStock(connection, urunId, adet) {
    await connection.query(
      'UPDATE urunler SET stok_miktari = stok_miktari - ? WHERE urun_id = ?',
      [adet, urunId]
    );
  }

  // Ürün sil
  static async delete(urunId) {
    const [result] = await pool.query('DELETE FROM urunler WHERE urun_id = ?', [urunId]);
    return result;
  }
}

module.exports = ProductModel;

