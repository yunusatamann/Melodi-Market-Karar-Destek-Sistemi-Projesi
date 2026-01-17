 const pool = require('../config/db');

 const trAylar = {
   1: 'Ocak', 2: 'Şubat', 3: 'Mart', 4: 'Nisan', 5: 'Mayıs', 6: 'Haziran',
   7: 'Temmuz', 8: 'Ağustos', 9: 'Eylül', 10: 'Ekim', 11: 'Kasım', 12: 'Aralık'
 };

 function formatMonthLabel(dateObj) {
   const m = dateObj.getMonth() + 1;
   const y = dateObj.getFullYear();
   const name = trAylar[m] || String(m).padStart(2, '0');
   return `${name} ${y}`;
 }
 
 async function getSummary(req, res) {
   try {
     const [stokRiskliUrunlerRows] = await pool.query(
       `
         SELECT u.urun_id, u.urun_adi, u.mevcut_stok,
                COALESCE(SUM(CASE 
                    WHEN satis_tarihi >= DATE_SUB(NOW(), INTERVAL 6 MONTH)
                    THEN adet ELSE 0 END),0) / 6 AS aylik_ortalama
         FROM urunler u
         LEFT JOIN satis_gecmisi s ON s.urun_id = u.urun_id
         GROUP BY u.urun_id, u.urun_adi, u.mevcut_stok
         HAVING aylik_ortalama > 0
            AND (u.mevcut_stok / aylik_ortalama) <= 6
         ORDER BY (u.mevcut_stok / aylik_ortalama) ASC
         LIMIT 10
       `
     );

     const stokRiskliUrunler = stokRiskliUrunlerRows.map((u) => {
       const mevcut = Number(u.mevcut_stok || 0);
       const aylik = Number(u.aylik_ortalama || 0);
       const omur = aylik > 0 ? mevcut / aylik : null;
       return {
         ...u,
         mevcut_stok: mevcut,
         aylik_ortalama: aylik,
         tahmini_stok_omru: omur
       };
     });

     const [regRows] = await pool.query(
       `
         SELECT
           DATE_FORMAT(satis_tarihi, '%Y-%m') AS ay,
           SUM(adet * satis_fiyati) AS toplam_ciro
         FROM satis_gecmisi
         WHERE satis_tarihi >= '2023-01-01' AND satis_tarihi < '2026-01-01'
         GROUP BY ay
         ORDER BY ay ASC
       `
     );

     const ciroByAy = {};
     for (const r of regRows) {
       ciroByAy[r.ay] = Number(r.toplam_ciro || 0);
     }

     function keyToDate(key) {
       const [yy, mm] = key.split('-').map(Number);
       return new Date(yy, (mm || 1) - 1, 1);
     }

     function keyToIndex(key) {
       const [yy, mm] = key.split('-').map(Number);
       return (yy - 2023) * 12 + ((mm || 1) - 1);
     }

     // Linear regression on observed months only
     let nObs = 0;
     let sumX = 0;
     let sumY = 0;
     let sumXY = 0;
     let sumXX = 0;

     for (const r of regRows) {
       const ayKey = String(r.ay || '');
       if (!ayKey) continue;
       const x = keyToIndex(ayKey);
       const y = Number(r.toplam_ciro || 0);
       nObs += 1;
       sumX += x;
       sumY += y;
       sumXY += x * y;
       sumXX += x * x;
     }

     const denom = (nObs * sumXX) - (sumX * sumX);
     const slope = denom !== 0 ? ((nObs * sumXY) - (sumX * sumY)) / denom : 0;
     const intercept = nObs !== 0 ? (sumY - (slope * sumX)) / nObs : 0;

     // Seasonality from historical monthly averages + bounded sinusoid for smoother wave
     const monthTotals = {};
     const monthCounts = {};
     let overallTotal = 0;
     let overallCount = 0;

     for (const row of regRows) {
       const ayKey = String(row.ay || '');
       if (!ayKey) continue;
       const parts = ayKey.split('-');
       const monthNum = Number(parts[1]);
       if (!Number.isFinite(monthNum) || monthNum < 1 || monthNum > 12) continue;
       const ciro = Number(row.toplam_ciro || 0);
       monthTotals[monthNum] = (monthTotals[monthNum] ?? 0) + ciro;
       monthCounts[monthNum] = (monthCounts[monthNum] ?? 0) + 1;
       overallTotal += ciro;
       overallCount += 1;
     }

     const overallAvg = overallCount > 0 ? overallTotal / overallCount : 0;
     const monthlyAverages = [];
     for (let m = 1; m <= 12; m++) {
       if ((monthCounts[m] ?? 0) > 0) monthlyAverages.push(monthTotals[m] / monthCounts[m]);
     }
     const mean = overallAvg > 0 ? overallAvg : (monthlyAverages[0] ?? 0);
     let variance = 0;
     if (monthlyAverages.length > 1 && mean > 0) {
       for (const v of monthlyAverages) variance += Math.pow(v - mean, 2);
       variance = variance / monthlyAverages.length;
     }
     const std = variance > 0 ? Math.sqrt(variance) : 0;
     let amplitude = mean > 0 ? (std / mean) : 0.1;
     amplitude = Math.max(0.05, Math.min(0.20, amplitude));

     const seasonalIndexByMonth = {};
     for (let m = 1; m <= 12; m++) {
       const has = (monthCounts[m] ?? 0) > 0;
       const avg = has ? (monthTotals[m] / monthCounts[m]) : overallAvg;
       const baseIdx = overallAvg > 0 ? (avg / overallAvg) : 1;
       const wave = 1 + (amplitude * Math.sin((2 * Math.PI * (m - 1)) / 12));
       let idx = baseIdx * wave;
       idx = Math.max(0.75, Math.min(1.35, idx));
       seasonalIndexByMonth[m] = idx;
     }

     const forecastKeys = ['2026-01', '2026-02', '2026-03', '2026-04', '2026-05', '2026-06'];
     const labels = forecastKeys.map((k) => formatMonthLabel(keyToDate(k)));
     const salesData = forecastKeys.map((k) => {
       const x = keyToIndex(k);
       const yhatTrend = (slope * x) + intercept;
       const m = Number(k.split('-')[1]);
       const seasonal = seasonalIndexByMonth[m] ?? 1;
       return Math.max(0, yhatTrend * seasonal);
     });

     const histKeys = [
       '2023-01', '2023-02', '2023-03', '2023-04', '2023-05', '2023-06',
       '2024-01', '2024-02', '2024-03', '2024-04', '2024-05', '2024-06',
       '2025-01', '2025-02', '2025-03', '2025-04', '2025-05', '2025-06'
     ];
     let histTotal = 0;
     let histCount = 0;
     for (const k of histKeys) {
       if (Object.prototype.hasOwnProperty.call(ciroByAy, k)) {
         histTotal += Number(ciroByAy[k] ?? 0);
         histCount += 1;
       }
     }
     const histAvg = histCount > 0 ? (histTotal / histCount) : overallAvg;
     const forecastAvg = salesData.length > 0 ? (salesData.reduce((a, v) => a + Number(v || 0), 0) / salesData.length) : 0;
     const tahminDegisimOrani = histAvg > 0 ? (forecastAvg - histAvg) / histAvg : 0;
     const trendYuzde = Math.abs(tahminDegisimOrani * 100);
     const trendYonu = tahminDegisimOrani >= 0 ? 'Artması' : 'Azalması';

     const [abcRows] = await pool.query(
       `
         SELECT 
             u.urun_id,
             u.urun_adi,
             SUM(s.adet * s.satis_fiyati) AS toplam_ciro
         FROM satis_gecmisi s
         JOIN urunler u ON u.urun_id = s.urun_id
         GROUP BY u.urun_id, u.urun_adi
         ORDER BY toplam_ciro DESC
       `
     );

     const toplamCiro = abcRows.reduce((acc, r) => acc + Number(r.toplam_ciro || 0), 0);
     const abcData = [];
     const groupCounts = { A: 0, B: 0, C: 0 };
     const groupShares = { A: 0, B: 0, C: 0 };

     if (toplamCiro > 0) {
       let kumulatif = 0;
       for (const row of abcRows) {
         const urunCiro = Number(row.toplam_ciro || 0);
         const pay = (urunCiro / toplamCiro) * 100;
         kumulatif += pay;

         let sinif = 'C';
         if (kumulatif <= 80) sinif = 'A';
         else if (kumulatif <= 95) sinif = 'B';

         groupCounts[sinif] += 1;
         groupShares[sinif] += pay;

         abcData.push({
           urun_id: row.urun_id,
           urun_adi: row.urun_adi,
           toplam_ciro: urunCiro,
           pay,
           sinif,
           kumulatif
         });
       }
     }

     res.json({
       kpis: {
         stokRiskliAdet: stokRiskliUrunler.length
       },
       stokRiskliUrunler,
       satisTahmin: {
         labels,
         data: salesData,
         trendYuzde,
         trendYonu
       },
       abc: {
         groupCounts,
         groupShares,
         data: abcData
       }
     });
   } catch (err) {
     res.status(500).json({ error: 'reports_summary_failed' });
   }
 }

 module.exports = {
   getSummary
 };
