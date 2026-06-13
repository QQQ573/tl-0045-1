import { memo } from "react";
import { Settings, RotateCcw, Filter, AlertCircle, CheckCircle2 } from "lucide-react";
import { useAllergenStore } from "@/store/useAllergenStore";
import { BRAND_COLORS } from "@/constants/colorPalette";
import { cn } from "@/lib/utils";

const AllergyProfileSidebar = memo(function AllergyProfileSidebar() {
  const {
    data,
    profile,
    toggleAllergen,
    setShowOnlyCompliant,
    resetProfile,
    getCompliantSkusByBrand,
  } = useAllergenStore();

  if (!data) return null;

  const compliantCounts = {
    kfc: getCompliantSkusByBrand("kfc").length,
    mcdonalds: getCompliantSkusByBrand("mcdonalds").length,
    华莱士: getCompliantSkusByBrand("华莱士").length,
  };

  return (
    <div className="flex flex-col h-full bg-white border-r border-slate-200 w-72 flex-shrink-0">
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200 bg-slate-50">
        <div className="flex items-center gap-2">
          <Settings className="w-5 h-5 text-blue-600" />
          <span className="font-semibold text-slate-800 text-sm">忌口档案</span>
        </div>
        <button
          onClick={resetProfile}
          className="p-1.5 rounded-lg hover:bg-slate-200 transition-colors"
          title="重置为默认"
        >
          <RotateCcw className="w-4 h-4 text-slate-500" />
        </button>
      </div>

      <div className="flex-1 overflow-auto p-4 space-y-6">
        <div>
          <div className="flex items-center gap-2 mb-3">
            <AlertCircle className="w-4 h-4 text-amber-500" />
            <span className="font-medium text-slate-700 text-sm">需规避过敏原</span>
          </div>
          <div className="space-y-2">
            {data.allergens.map((allergen) => {
              const isChecked = profile.avoidedAllergens.includes(allergen.key);
              return (
                <button
                  key={allergen.key}
                  onClick={() => toggleAllergen(allergen.key)}
                  className={cn(
                    "w-full flex items-center gap-3 px-3 py-2 rounded-lg border transition-all text-left",
                    isChecked
                      ? "border-red-300 bg-red-50 hover:bg-red-100"
                      : "border-slate-200 bg-white hover:bg-slate-50"
                  )}
                >
                  <div
                    className={cn(
                      "w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0",
                      isChecked
                        ? "border-red-500 bg-red-500"
                        : "border-slate-300"
                    )}
                  >
                    {isChecked && <CheckCircle2 className="w-3 h-3 text-white" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-slate-800 text-sm">{allergen.labelZh}</div>
                    <div className="text-xs text-slate-500">{allergen.labelShort}</div>
                  </div>
                  {allergen.isHighRisk && (
                    <span className="text-[10px] px-1.5 py-0.5 bg-red-100 text-red-600 rounded-full font-medium">
                      高危
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        <div className="pt-4 border-t border-slate-200">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-blue-500" />
              <span className="font-medium text-slate-700 text-sm">筛选设置</span>
            </div>
          </div>
          <button
            onClick={() => setShowOnlyCompliant(!profile.showOnlyCompliant)}
            className={cn(
              "w-full flex items-center justify-between px-3 py-2.5 rounded-lg border transition-all",
              profile.showOnlyCompliant
                ? "border-green-300 bg-green-50"
                : "border-slate-200 bg-white hover:bg-slate-50"
            )}
          >
            <div className="flex items-center gap-2">
              <div
                className={cn(
                  "w-5 h-5 rounded border-2 flex items-center justify-center",
                  profile.showOnlyCompliant
                    ? "border-green-500 bg-green-500"
                    : "border-slate-300"
                )}
              >
                {profile.showOnlyCompliant && <CheckCircle2 className="w-3 h-3 text-white" />}
              </div>
              <span className="font-medium text-slate-800 text-sm">仅看合规 SKU</span>
            </div>
            <span className="text-xs text-slate-500">
              {profile.showOnlyCompliant ? "已启用" : "已禁用"}
            </span>
          </button>
        </div>

        <div className="pt-4 border-t border-slate-200">
          <div className="text-sm font-medium text-slate-700 mb-3">合规商品统计</div>
          <div className="space-y-2">
            {Object.entries(compliantCounts).map(([brand, count]) => (
              <div
                key={brand}
                className="flex items-center justify-between px-3 py-2 rounded-lg bg-slate-50"
              >
                <div className="flex items-center gap-2">
                  <div
                    className="w-2 h-5 rounded-sm"
                    style={{ backgroundColor: BRAND_COLORS[brand as keyof typeof BRAND_COLORS]?.primary }}
                  />
                  <span className="text-sm text-slate-700">{brand === "kfc" ? "肯德基" : brand === "mcdonalds" ? "麦当劳" : brand}</span>
                </div>
                <span className="font-semibold text-slate-800">{count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="p-3 border-t border-slate-200 bg-slate-50">
        <div className="text-xs text-slate-500 text-center">
          档案已保存至本地存储
        </div>
      </div>
    </div>
  );
});

export default AllergyProfileSidebar;
