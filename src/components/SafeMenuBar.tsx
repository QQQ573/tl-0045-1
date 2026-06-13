import { memo, useCallback } from "react";
import { Download, ChevronRight, CheckCircle2 } from "lucide-react";
import { useAllergenStore } from "@/store/useAllergenStore";
import { BRAND_COLORS } from "@/constants/colorPalette";
import { BrandKey, SKU, BRAND_LABELS } from "@/types/allergen";
import { cn } from "@/lib/utils";

function exportToCSV(skus: SKU[], brand: BrandKey) {
  const headers = ["品牌", "SKU编号", "中文名", "英文名", "分类"];
  const rows = skus.map((sku) => [
    BRAND_LABELS[brand],
    sku.skuCode,
    sku.nameZh,
    sku.nameEn,
    sku.category,
  ]);

  const csvContent = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
  const blob = new Blob(["\uFEFF" + csvContent], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = `${BRAND_LABELS[brand]}-安全菜单-${new Date().toISOString().slice(0, 10)}.csv`;
  link.click();
}

const SafeMenuBar = memo(function SafeMenuBar() {
  const { getCompliantSkusByBrand, profile } = useAllergenStore();

  const brands: BrandKey[] = ["kfc", "mcdonalds", "华莱士"];

  const handleExportAll = useCallback(() => {
    const allSkus: SKU[] = [];
    brands.forEach((brand) => {
      allSkus.push(...getCompliantSkusByBrand(brand));
    });

    const headers = ["品牌", "SKU编号", "中文名", "英文名", "分类"];
    const rows = allSkus.map((sku) => [
      BRAND_LABELS[sku.brand],
      sku.skuCode,
      sku.nameZh,
      sku.nameEn,
      sku.category,
    ]);

    const csvContent = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const blob = new Blob(["\uFEFF" + csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `全部安全菜单-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
  }, [getCompliantSkusByBrand, brands]);

  const totalCompliant = brands.reduce((sum, brand) => sum + getCompliantSkusByBrand(brand).length, 0);

  if (profile.avoidedAllergens.length === 0) {
    return null;
  }

  return (
    <div className="bg-white border-t border-slate-200 px-4 py-3 flex-shrink-0">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          <span className="font-semibold text-slate-800 text-sm">安全菜单</span>
          <span className="text-xs text-slate-500">({totalCompliant} 款)</span>
        </div>
        <button
          onClick={handleExportAll}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500 text-white text-sm font-medium hover:bg-emerald-600 transition-colors"
        >
          <Download className="w-4 h-4" />
          导出全部 CSV
        </button>
      </div>

      <div className="flex gap-4">
        {brands.map((brand) => {
          const skus = getCompliantSkusByBrand(brand);
          const brandColor = BRAND_COLORS[brand];

          return (
            <div
              key={brand}
              className="flex-1 bg-slate-50 rounded-lg p-3 border border-slate-200"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div
                    className="w-2 h-5 rounded-sm"
                    style={{ backgroundColor: brandColor.primary }}
                  />
                  <span className="font-semibold text-sm" style={{ color: brandColor.primary }}>
                    {BRAND_LABELS[brand]}
                  </span>
                </div>
                <span className="text-xs text-slate-500">{skus.length} 款</span>
              </div>
              <div className="max-h-24 overflow-auto space-y-1">
                {skus.map((sku) => (
                  <div
                    key={sku.id}
                    className="flex items-center justify-between text-xs text-slate-700 py-1 px-2 rounded hover:bg-white transition-colors cursor-pointer"
                  >
                    <span className="truncate">{sku.nameZh}</span>
                    <ChevronRight className="w-3 h-3 text-slate-400 flex-shrink-0" />
                  </div>
                ))}
                {skus.length === 0 && (
                  <div className="text-xs text-slate-400 text-center py-2">暂无合规商品</div>
                )}
              </div>
              {skus.length > 0 && (
                <button
                  onClick={() => exportToCSV(skus, brand)}
                  className={cn(
                    "w-full mt-2 py-1.5 rounded text-xs font-medium transition-colors",
                    "hover:bg-white"
                  )}
                  style={{ color: brandColor.primary }}
                >
                  导出 {BRAND_LABELS[brand]} CSV
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
});

export default SafeMenuBar;
