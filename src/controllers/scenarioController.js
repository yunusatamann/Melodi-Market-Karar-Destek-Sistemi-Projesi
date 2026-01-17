const ScenarioModel = require('../models/ScenarioModel');
const ProductModel = require('../models/ProductModel');

 async function getSummary(req, res) {
   try {
     const urunler = await ProductModel.getAll();
     const senaryolar = await ScenarioModel.getAll();

     const sonSenaryolar = senaryolar.slice(0, 5);

     res.json({
       urunler: urunler.map((u) => ({
         ...u,
         mevcut_stok: Number(u.mevcut_stok || 0),
         birim_maliyet: u.birim_maliyet != null ? Number(u.birim_maliyet) : null,
         satis_fiyati: u.satis_fiyati != null ? Number(u.satis_fiyati) : null,
         tedarik_suresi_gun: u.tedarik_suresi_gun != null ? Number(u.tedarik_suresi_gun) : null,
         min_stok_seviyesi: u.min_stok_seviyesi != null ? Number(u.min_stok_seviyesi) : null
       })),
       senaryolar: senaryolar.map((s) => ({
         ...s,
         tahmini_kur: s.tahmini_kur != null ? Number(s.tahmini_kur) : null,
         planlanan_alim_adeti: s.planlanan_alim_adeti != null ? Number(s.planlanan_alim_adeti) : null,
         hesaplanan_kar: s.hesaplanan_kar != null ? Number(s.hesaplanan_kar) : null,
         hesaplanan_stok_omru: s.hesaplanan_stok_omru != null ? Number(s.hesaplanan_stok_omru) : null
       })),
       sonSenaryolar: sonSenaryolar.map((s) => ({
         ...s,
         tahmini_kur: s.tahmini_kur != null ? Number(s.tahmini_kur) : null,
         planlanan_alim_adeti: s.planlanan_alim_adeti != null ? Number(s.planlanan_alim_adeti) : null,
         hesaplanan_kar: s.hesaplanan_kar != null ? Number(s.hesaplanan_kar) : null,
         hesaplanan_stok_omru: s.hesaplanan_stok_omru != null ? Number(s.hesaplanan_stok_omru) : null
       }))
     });
   } catch (err) {
     res.status(500).json({ error: 'scenarios_summary_failed' });
   }
 }

 async function simulate(req, res) {
   try {
     const urun_id = Number(req.body.urun_id);
     const kur = Number(req.body.kur);
     const adet = Number(req.body.adet);

     if (!urun_id || Number.isNaN(urun_id)) {
       return res.status(400).json({ error: 'invalid_urun_id' });
     }
     if (!kur || Number.isNaN(kur)) {
       return res.status(400).json({ error: 'invalid_kur' });
     }
     if (!adet || Number.isNaN(adet)) {
       return res.status(400).json({ error: 'invalid_adet' });
     }

     const urun = await ProductModel.getById(urun_id);

     if (!urun) {
       return res.status(404).json({ error: 'urun_not_found' });
     }

     const birimMaliyet = Number(urun.birim_maliyet || 0);
     const satisFiyati = Number(urun.satis_fiyati || 0);
     const mevcutStok = Number(urun.mevcut_stok || 0);

     const maliyetArtisi = kur / 34;
     const tahminiMaliyet = birimMaliyet * maliyetArtisi;
     const hesaplananKar = (satisFiyati - tahminiMaliyet) * adet;
     const stokOmru = (mevcutStok + adet) / 10;
     const aciklama = `Dolar ${kur} TL olursa ${urun.urun_adi} analizi`;

     const insertResult = await ScenarioModel.create(
       urun_id, kur, adet, hesaplananKar, Math.round(stokOmru), aciklama
     );

     res.json({
       senaryo_id: insertResult.insertId,
       urun_id,
       tahmini_kur: kur,
       planlanan_alim_adeti: adet,
       hesaplanan_kar: hesaplananKar,
       hesaplanan_stok_omru: Math.round(stokOmru),
       aciklama
     });
   } catch (err) {
     res.status(500).json({ error: 'scenario_simulate_failed' });
   }
 }

 module.exports = {
   getSummary,
   simulate
 };
