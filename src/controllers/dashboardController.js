 const pool = require('../config/db');

 async function getSummary(req, res) {
   try {
     const [[{ toplam: toplamUrun }]] = await pool.query(
       'SELECT COUNT(*) AS toplam FROM urunler'
     );

    const [[{ kritik: kritikStok }]] = await pool.query(
      'SELECT COUNT(*) AS kritik FROM urunler WHERE mevcut_stok <= min_stok_seviyesi'
    );

    const [stokGrafikVerileri] = await pool.query(
      `
        SELECT 
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
        LIMIT 20
      `
    );

    const [satisTrend] = await pool.query(
      `
        SELECT 
            DATE_FORMAT(satis_tarihi, '%Y-%m') AS ay,
            DATE_FORMAT(satis_tarihi, '%b %Y') AS ay_adi,
            SUM(adet * satis_fiyati) AS toplam_ciro
        FROM satis_gecmisi
        WHERE satis_tarihi >= DATE_SUB(CURDATE(), INTERVAL 12 MONTH)
        GROUP BY DATE_FORMAT(satis_tarihi, '%Y-%m'), DATE_FORMAT(satis_tarihi, '%b %Y')
        ORDER BY ay ASC
      `
    );

    const [kategoriPay] = await pool.query(
      `
        SELECT k.kategori_adi, SUM(s.adet * s.satis_fiyati) AS ciro
        FROM satis_gecmisi s
        JOIN urunler u ON u.urun_id = s.urun_id
        JOIN kategoriler k ON k.kategori_id = u.kategori_id
        GROUP BY k.kategori_id, k.kategori_adi
        ORDER BY ciro DESC
      `
    );

    res.json({
      kpis: {
        toplamUrun: Number(toplamUrun || 0),
        kritikStok: Number(kritikStok || 0)
      },
      charts: {
        stokRisk: stokGrafikVerileri.map((r) => ({
          ...r,
          doluluk_orani: Number(r.doluluk_orani || 0),
          mevcut_stok: Number(r.mevcut_stok || 0),
          min_stok_seviyesi: Number(r.min_stok_seviyesi || 0)
        })),
        satisTrend: satisTrend.map((r) => ({
          ...r,
          toplam_ciro: Number(r.toplam_ciro || 0)
        })),
        kategoriPay: kategoriPay.map((r) => ({
          ...r,
          ciro: Number(r.ciro || 0)
        }))
      }
    });
  } catch (err) {
    res.status(500).json({ error: 'dashboard_summary_failed' });
  }
}

module.exports = {
  getSummary
};
