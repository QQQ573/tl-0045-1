import { memo, useCallback } from "react";
import { X, BarChart3, AlertTriangle } from "lucide-react";
import { useAllergenStore } from "@/store/useAllergenStore";
import { BRAND_COLORS, STATUS_COLORS } from "@/constants/colorPalette";
import { BRAND_LABELS, BrandKey, AllergenStatus } from "@/types/allergen";
import { cn } from "@/lib/utils";

const STATUS_ORDER: AllergenStatus[] = ["Y", "M", "N", "U"];
const STATUS_LABELS = { Y: "含", M: "可能含", N: "不含", U: "未标注" };

const AllergenColumnAnalysis = memo(function AllergenColumnAnalysis() {
  const {
    data,
    analysisOpen,
    analysisAllergenKey,
    closeAnalysis,
    getColumnAnalysis,
    highlightedStatus,
    highlightByStatus,
    clearHighlight,
  } = useAllergenStore();

  const analysis = getColumnAnalysis();

  const handleScrollToSku = useCallback((skuId: string) => {
    (window as unknown as { __scrollToSku?: (id: string) => void }).__scrollToSku?.(skuId);
  }, []);

  const allergen = data?.allergens.find((a) => a.key === analysisAllergenKey);

  if (!analysisOpen || !allergen) return null;

  const brands: BrandKey[] = ["kfc", "mcdonalds", "华莱士"];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={closeAnalysis} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-[600px] max-h-[80vh] overflow-hidden flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center">
              <BarChart3 className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="font-bold text-slate-800 text-lg">{allergen.labelZh} 过敏原分析</h2>
              <p className="text-xs text-slate-500">各品牌在该过敏原列的分布情况</p>
            </div>
          </div>
          <button
            onClick={closeAnalysis}
            className="p-2 rounded-lg hover:bg-slate-200 transition-colors"
          >
            <X className="w-5 h-5 text-slate-500" />
          </button>
        </div>

        <div className="flex-1 overflow-auto p-6 space-y-6">
          <div>
            <h3 className="font-semibold text-slate-700 text-sm mb-3 flex items-center gap-2">
              <span>品牌分布堆叠条</span>
              {allergen.isHighRisk && <AlertTriangle className="w-4 h-4 text-red-500" />}
            </h3>
            <div className="space-y-4">
              {brands.map((brand) => {
                const stats = analysis.brandStats[brand];
                const total = stats.Y + stats.M + stats.N + stats.U;
                const brandColor = BRAND_COLORS[brand];

                return (
                  <div key={brand} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-2 h-5 rounded-sm"
                          style={{ backgroundColor: brandColor.primary }}
                        />
                        <span className="font-medium text-slate-700 text-sm">
                          {BRAND_LABELS[brand]}
                        </span>
                        <span className="text-xs text-slate-400">({total} 款)</span>
                      </div>
                    </div>
                    <div className="h-8 rounded-lg overflow-hidden flex">
                      {STATUS_ORDER.map((status) => {
                        const count = stats[status];
                        const width = total > 0 ? (count / total) * 100 : 0;
                        const colors = STATUS_COLORS[status];
                        const isHighlighted = highlightedStatus === status;

                        if (width === 0) return null;

                        return (
                          <button
                            key={status}
                            onClick={() => {
                              if (highlightedStatus === status) {
                                clearHighlight();
                              } else {
                                highlightByStatus(status);
                              }
                            }}
                            className={cn(
                              "flex items-center justify-center text-xs font-bold transition-all relative group",
                              colors.bg,
                              colors.text,
                              isHighlighted && "ring-2 ring-blue-500 ring-inset"
                            )}
                            style={{ width: `${width}%` }}
                            title={`${STATUS_LABELS[status]}: ${count} 款 (${width.toFixed(1)}%)`}
                          >
                            <span className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/20">
                              {status} {count}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                    <div className="flex gap-4 text-xs">
                      {STATUS_ORDER.map((status) => {
                        const count = stats[status];
                        const width = total > 0 ? (count / total) * 100 : 0;
                        const colors = STATUS_COLORS[status];
                        const isHighlighted = highlightedStatus === status;

                        return (
                          <button
                            key={status}
                            onClick={() => {
                              if (highlightedStatus === status) {
                                clearHighlight();
                              } else {
                                highlightByStatus(status);
                              }
                            }}
                            className={cn(
                              "flex items-center gap-1 px-2 py-1 rounded transition-colors",
                              isHighlighted ? "bg-blue-100 ring-1 ring-blue-500" : "hover:bg-slate-100"
                            )}
                          >
                            <div
                              className={cn("w-3 h-3 rounded-sm", colors.bg)}
                              style={{ backgroundColor: isHighlighted ? undefined : colors.bg === "bg-slate-300" ? "#cbd5e1" : undefined }}
                            />
                            <span className="text-slate-600">{STATUS_LABELS[status]}</span>
                            <span className="font-medium">{count}</span>
                            <span className="text-slate-400">({width.toFixed(0)}%)</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {highlightedStatus && (
            <div className="pt-4 border-t border-slate-200">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-slate-700 text-sm">
                  <span className={cn(
                    "inline-block w-3 h-3 rounded-sm mr-2",
                    STATUS_COLORS[highlightedStatus].bg
                  )} />
                  {STATUS_LABELS[highlightedStatus]} 商品列表
                </h3>
                <button
                  onClick={clearHighlight}
                  className="text-xs text-blue-600 hover:underline"
                >
                  清除高亮
                </button>
              </div>
              <div className="space-y-2 max-h-48 overflow-auto">
                {analysis.maxRiskSkus
                  .filter((item) => {
                    const brandTotal = analysis.brandStats[item.brand][highlightedStatus];
                    return brandTotal > 0;
                  })
                  .map((item) => {
                    const brandColor = BRAND_COLORS[item.brand];
                    const filteredSkus = item.skus.filter(
                      (sku) => sku.allergens[analysis.allergenKey] === highlightedStatus
                    );

                    return (
                      <div key={item.brand}>
                        <div className="flex items-center gap-2 mb-1">
                          <div
                            className="w-1.5 h-4 rounded-sm"
                            style={{ backgroundColor: brandColor.primary }}
                          />
                          <span className="text-xs font-medium" style={{ color: brandColor.primary }}>
                            {BRAND_LABELS[item.brand]}
                          </span>
                          <span className="text-xs text-slate-400">({filteredSkus.length} 款)</span>
                        </div>
                        <div className="flex flex-wrap gap-1 pl-4">
                          {filteredSkus.map((sku) => (
                            <button
                              key={sku.id}
                              onClick={() => handleScrollToSku(sku.id)}
                              className="px-2 py-1 text-xs bg-slate-100 hover:bg-slate-200 rounded transition-colors text-slate-700"
                            >
                              {sku.nameZh}
                            </button>
                          ))}
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>
          )}

          <div className="pt-4 border-t border-slate-200">
            <h3 className="font-semibold text-slate-700 text-sm mb-3">操作提示</h3>
            <div className="text-xs text-slate-500 space-y-1">
              <p>• 点击上方堆叠条段落在矩阵中高亮对应行</p>
              <p>• 高亮后可在下方查看该状态商品列表</p>
              <p>• 点击商品名称可定位到矩阵对应行</p>
            </div>
          </div>
        </div>

        <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 flex justify-end">
          <button
            onClick={closeAnalysis}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600 transition-colors"
          >
            关闭
          </button>
        </div>
      </div>
    </div>
  );
});

export default AllergenColumnAnalysis;
