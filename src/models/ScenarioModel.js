const pool = require('../config/db');

class ScenarioModel {
  static async getAll() {
    const [rows] = await pool.query(
      `SELECT s.*, u.urun_adi
       FROM kds_senaryolari s
       LEFT JOIN urunler u ON u.urun_id = s.urun_id
       ORDER BY s.olusturma_tarihi DESC`
    );
    return rows;
  }

  static async create(urunId, tahminiKur, planlananAlimAdeti, hesaplananKar, hesaplananStokOmru, aciklama) {
    const [result] = await pool.query(
      `INSERT INTO kds_senaryolari (urun_id, tahmini_kur, planlanan_alim_adeti, hesaplanan_kar, hesaplanan_stok_omru, aciklama)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [urunId, tahminiKur, planlananAlimAdeti, hesaplananKar, hesaplananStokOmru, aciklama]
    );
    return result;
  }
}

module.exports = ScenarioModel;


