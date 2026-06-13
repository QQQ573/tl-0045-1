import { memo } from "react";
import { Grid3X3, ChevronDown, ChevronUp, AlertTriangle } from "lucide-react";
import { useAllergenStore } from "@/store/useAllergenStore";
import { BRAND_COLORS } from "@/constants/colorPalette";
import { BRAND_LABELS, BrandKey, AllergenStatus } from "@/types/allergen";
import { cn } from "@/lib/utils";

const STATUS_COLORS_HEATMAP: Record<AllergenStatus, string> = {
  Y: "#ef4444",
  M: "#f59e0b",
  N: "#10b981",
  U: "#94a3b8",
};

const MiniHeatmap = memo(function MiniHeatmap() {
  const { data, heatmapOpen, toggleHeatmap, getBrandHeatmap, openAnalysis } = useAllergenStore();

  if (!data) return null;

  const heatmaps = getBrandHeatmap();
  const brands: BrandKey[] = ["kfc", "mcdonalds", "华莱士"];

  return (
    <div className="fixed bottom-4 right-4 z-40">
      <div className={cn(
        "bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden transition-all duration-300",
        heatmapOpen ? "w-[400px]" : "w-auto"
      )}>
        <button
          onClick={toggleHeatmap}
          className="w-full flex items-center justify-between px-4 py-3 bg-gradient-to-r from-slate-50 to-slate-100 border-b border-slate-200 hover:from-slate-100 hover:to-slate-150 transition-colors"
        >
          <div className="flex items-center gap-2">
            <Grid3X3 className="w-4 h-4 text-slate-600" />
            <span className="font-semibold text-slate-700 text-sm">品牌热力图总览</span>
          </div>
          {heatmapOpen ? (
            <ChevronDown className="w-4 h-4 text-slate-500" />
          ) : (
            <ChevronUp className="w-4 h-4 text-slate-500" />
          )}
        </button>

        {heatmapOpen && (
          <div className="p-3">
            <div className="mb-3">
              <div className="flex">
                <div className="w-16 flex-shrink-0" />
                {data.allergens.map((allergen) => (
                  <div
                    key={allergen.key}
                    className="w-8 flex-shrink-0 text-center"
                  >
                    <div className="text-[9px] text-slate-500 truncate" title={allergen.labelZh}>
                      {allergen.labelShort.slice(0, 2)}
                    </div>
                    {allergen.isHighRisk && (
                      <AlertTriangle className="w-2.5 h-2.5 text-red-500 mx-auto" />
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-1.5">
              {brands.map((brand) => {
                const brandHeatmap = heatmaps.find((h) => h.brand === brand);
                if (!brandHeatmap) return null;
                const brandColor = BRAND_COLORS[brand];

                return (
                  <div key={brand} className="flex items-center">
                    <div
                      className="w-16 flex-shrink-0 flex items-center gap-1.5 pr-2"
                    >
                      <div
                        className="w-1.5 h-5 rounded-sm flex-shrink-0"
                        style={{ backgroundColor: brandColor.primary }}
                      />
                      <span className="text-xs text-slate-600 truncate" title={BRAND_LABELS[brand]}>
                        {brand === "kfc" ? "肯德基" : brand === "mcdonalds" ? "麦当劳" : "华莱士"}
                      </span>
                    </div>
                    <div className="flex gap-0.5">
                      {data.allergens.map((allergen) => {
                        const cell = brandHeatmap.allergens[allergen.key];
                        const color = STATUS_COLORS_HEATMAP[cell.status];

                        return (
                          <button
                            key={allergen.key}
                            onClick={() => openAnalysis(allergen.key)}
                            className={cn(
                              "w-8 h-6 rounded-sm flex items-center justify-center text-[10px] font-bold transition-all hover:scale-110 hover:shadow-md relative group cursor-pointer",
                              cell.status === "U" && "diagonal-pattern"
                            )}
                            style={{ backgroundColor: color, color: cell.status === "Y" || cell.status === "N" ? "white" : "#1c1917" }}
                            title={`${allergen.labelZh}: ${cell.percentage}% ${cell.status}`}
                          >
                            {cell.status}
                            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 px-2 py-1 bg-slate-800 text-white text-[10px] rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10">
                              {allergen.labelZh}: {cell.percentage}%
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-3 pt-3 border-t border-slate-200">
              <div className="flex items-center justify-center gap-4 text-[10px]">
                {(["Y", "M", "N", "U"] as AllergenStatus[]).map((status) => (
                  <div key={status} className="flex items-center gap-1">
                    <div
                      className="w-3 h-3 rounded-sm"
                      style={{ backgroundColor: STATUS_COLORS_HEATMAP[status] }}
                    />
                    <span className="text-slate-500">
                      {status === "Y" ? "含" : status === "M" ? "可能" : status === "N" ? "不含" : "未标"}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
});

export default MiniHeatmap;
