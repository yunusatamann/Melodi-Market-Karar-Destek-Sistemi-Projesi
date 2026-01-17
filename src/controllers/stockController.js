const ProductModel = require('../models/ProductModel');

 function buildCategoryColorMap(categories) {
   const colors = {};
   const total = categories.length || 1;
   for (let i = 0; i < categories.length; i++) {
     const cat = categories[i];
     const hue = i * (360 / total);
     colors[cat] = `hsl(${hue}, 70%, 60%)`;
   }
   return colors;
 }

 async function getSummary(req, res) {
   try {
     const kategoriDagilim = await ProductModel.getCategoryDistribution();
     const toplamUrun = await ProductModel.getCount();
     const kritikStok = await ProductModel.getCriticalStockCount();
     const urunler = await ProductModel.getAll();
     const dusukKarUrunlerRaw = await ProductModel.getLowMarginProducts();

     const dusukKarUrunler = dusukKarUrunlerRaw.map((r) => ({
       ...r,
       birim_maliyet: r.birim_maliyet != null ? Number(r.birim_maliyet) : null,
       satis_fiyati: r.satis_fiyati != null ? Number(r.satis_fiyati) : null,
       kar_yuzde: r.kar_yuzde != null ? Number(r.kar_yuzde) : null,
       kar_tutar: r.satis_fiyati != null && r.birim_maliyet != null ? Number(r.satis_fiyati) - Number(r.birim_maliyet) : null
     }));

     const kategoriler = Array.from(
       new Set(
         urunler.map((u) => u.kategori_adi || 'Diğer')
       )
     );
     const katRenk = buildCategoryColorMap(kategoriler);

     const scatterData = urunler.map((u) => {
       const kat = u.kategori_adi || 'Diğer';
       return {
         x: Number(u.mevcut_stok || 0),
         y: Number(u.satis_fiyati || 0),
         urun_adi: u.urun_adi,
         kategori: kat,
         renk: katRenk[kat]
       };
     });

     const normalizedUrunler = urunler.map((u) => {
       const mevcut = Number(u.mevcut_stok || 0);
       const min = u.min_stok_seviyesi != null ? Number(u.min_stok_seviyesi) : null;
       const kritik = min != null && mevcut <= min;
       let durum_txt = 'Yeterli';
       let durum_cls = 'status-adequate';
       if (mevcut <= 0) {
         durum_txt = 'Tükendi';
         durum_cls = 'status-out';
       } else if (kritik) {
         durum_txt = 'Kritik';
         durum_cls = 'status-critical';
       }

       return {
         ...u,
         mevcut_stok: mevcut,
         satis_fiyati: u.satis_fiyati != null ? Number(u.satis_fiyati) : null,
         birim_maliyet: u.birim_maliyet != null ? Number(u.birim_maliyet) : null,
         tedarik_suresi_gun: u.tedarik_suresi_gun != null ? Number(u.tedarik_suresi_gun) : null,
         min_stok_seviyesi: min,
         durum: {
           kritik,
           cls: durum_cls,
           text: durum_txt
         }
       };
     });

     res.json({
       kpis: {
         toplamUrun: Number(toplamUrun || 0),
         kritikStok: Number(kritikStok || 0),
         dusukKarAdet: dusukKarUrunler.length
       },
       kategoriDagilim: kategoriDagilim.map((r) => ({
         ...r,
         urun_sayisi: Number(r.urun_sayisi || 0)
       })),
       urunler: normalizedUrunler,
       dusukKarUrunler,
       charts: {
         scatter: {
           cats: kategoriler,
           colors: katRenk,
           data: scatterData
         }
       }
     });
   } catch (err) {
     res.status(500).json({ error: 'stock_summary_failed' });
   }
 }


async function updateProduct(req, res) {
  try {
    const { id } = req.params; 
    const { stok_miktari, satis_fiyati, urun_adi } = req.body;

    const result = await ProductModel.update(id, stok_miktari, satis_fiyati, urun_adi);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Urun bulunamadi.' });
    }

    res.json({ message: 'Urun basariyla guncellendi.' });

  } catch (err) {
    res.status(500).json({ error: 'Guncelleme sirasinda hata olustu.' });
  }
}

async function deleteProduct(req, res) {
  try {
    const { id } = req.params;

    const result = await ProductModel.delete(id);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Urun bulunamadi.' });
    }

    res.json({ message: 'Urun basariyla silindi.' });

  } catch (err) {
    
    if (err.code === 'ER_ROW_IS_REFERENCED_2') {
        return res.status(400).json({ error: 'Bu urunun satis gecmisi oldugu icin silinemez!' });
    }
    res.status(500).json({ error: 'Silme islemi basarisiz.' });
  }
}





 module.exports = {
   getSummary,
   updateProduct,
   deleteProduct,
 };
