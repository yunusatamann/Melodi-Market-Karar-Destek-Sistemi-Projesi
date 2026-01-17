const CustomerModel = require('../models/CustomerModel');

 function formatTry(value, fractionDigits = 2) {
   const n = Number(value || 0);
   return n.toLocaleString('tr-TR', { minimumFractionDigits: fractionDigits, maximumFractionDigits: fractionDigits }) + ' ₺';
 }

 function formatDateTr(dateStr) {
   if (!dateStr) return '-';
   const d = new Date(dateStr);
   if (Number.isNaN(d.getTime())) return String(dateStr);
   const dd = String(d.getDate()).padStart(2, '0');
   const mm = String(d.getMonth() + 1).padStart(2, '0');
   const yyyy = d.getFullYear();
   return `${dd}.${mm}.${yyyy}`;
 }

 function getDogumAy(dogumTarihi) {
   if (!dogumTarihi) return 0;
   const d = new Date(dogumTarihi);
   if (Number.isNaN(d.getTime())) return 0;
   return d.getMonth() + 1;
 }

 function diffDays(from, to) {
   if (!(from instanceof Date) || !(to instanceof Date)) return null;
   if (Number.isNaN(from.getTime()) || Number.isNaN(to.getTime())) return null;
   const ms = to.getTime() - from.getTime();
   return Math.floor(ms / (24 * 60 * 60 * 1000));
 }

 async function getSummary(req, res) {
   try {
     const simNow = new Date('2025-12-24T23:59:59');

     const musterilerRows = await CustomerModel.getAllWithSales();
     const gelecekAy = await CustomerModel.getNextMonth();

     const musteriler = musterilerRows.map((m) => {
       const harcama = Number(m.toplam_harcama || 0);
       let seg = 'Potansiyel';
       let cls = 'badge-potential';
       if (harcama > 50000) {
         seg = 'VIP';
         cls = 'badge-vip';
       } else if (harcama > 10000) {
         seg = 'Sadık';
         cls = 'badge-loyal';
       } else if (harcama > 0) {
         seg = 'Standart';
         cls = 'badge-standard';
       }

       const dogumAy = getDogumAy(m.dogum_tarihi);
       const firsat = dogumAy === Number(gelecekAy);

       const last = m.son_islem_tarihi ? new Date(m.son_islem_tarihi) : null;
       let gunOnce = last ? diffDays(last, simNow) : null;
       if (typeof gunOnce === 'number' && gunOnce < 0) gunOnce = 0;

       return {
         ...m,
         toplam_harcama: harcama,
         islem_sayisi: Number(m.islem_sayisi || 0),
         son_islem_tarihi: m.son_islem_tarihi,
         segment: seg,
         segment_cls: cls,
         firsat,
         son_islem_tarihi_tr: formatDateTr(m.son_islem_tarihi),
         value_matrix_x: gunOnce,
         value_matrix_y: harcama
       };
     });

     const toplamMusteri = musteriler.length;
     const enDegerliMusteri = musteriler[0] || null;
     const toplamCiro = musteriler.reduce((acc, m) => acc + Number(m.toplam_harcama || 0), 0);
     const ortalamaDeger = toplamMusteri > 0 ? toplamCiro / toplamMusteri : 0;

     const sehirDagilimi = {};
     for (const m of musteriler) {
       const sehir = m.sehir ? m.sehir : 'Belirsiz';
       sehirDagilimi[sehir] = (sehirDagilimi[sehir] || 0) + 1;
     }

     const top5Isimler = [];
     const top5Cirolar = [];
     for (let i = 0; i < Math.min(5, musteriler.length); i++) {
       top5Isimler.push(musteriler[i].ad_soyad);
       top5Cirolar.push(musteriler[i].toplam_harcama);
     }

     const valueMatrix = musteriler
       .filter((m) => typeof m.value_matrix_x === 'number' && Number.isFinite(m.value_matrix_y))
       .map((m) => ({
         x: Number(m.value_matrix_x),
         y: Number(m.value_matrix_y),
         segment: m.segment,
         name: m.ad_soyad
       }));

     res.json({
       kpis: {
         toplamMusteri,
         enDegerliMusteriAd: enDegerliMusteri?.ad_soyad ?? null,
         enDegerliMusteriTutar: formatTry(enDegerliMusteri?.toplam_harcama ?? 0, 2),
         ortalamaDeger: formatTry(ortalamaDeger, 0)
       },
       charts: {
         sehirDagilimi,
         top5Isimler,
         top5Cirolar,
         valueMatrix
       },
       musteriler
     });
   } catch (err) {
     res.status(500).json({ error: 'customers_summary_failed' });
   }
 }

 module.exports = {
   getSummary
 };
