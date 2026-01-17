const ProductModel = require('./ProductModel');
const SaleModel = require('./SaleModel');

class DashboardModel {
  // Dashboard özet verilerini getir
  static async getSummary() {
    const toplamUrun = await ProductModel.getCount();
    const kritikStok = await ProductModel.getCriticalStockCount();
    const stokGrafikVerileri = await ProductModel.getStockChartData();
    const satisTrend = await SaleModel.getMonthlyTrend(12);
    const kategoriPay = await SaleModel.getCategoryRevenue();

    return {
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
    };
  }
}

module.exports = DashboardModel;

