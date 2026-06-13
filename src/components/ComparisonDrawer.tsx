import { memo, useMemo } from "react";
import { X, AlertTriangle, Info, ChevronRight } from "lucide-react";
import { useAllergenStore } from "@/store/useAllergenStore";
import { BRAND_LABELS, STATUS_LABELS, AllergenStatus, RISK_LEVEL, Allergen } from "@/types/allergen";
import { STATUS_COLORS, BRAND_COLORS } from "@/constants/colorPalette";
import { cn } from "@/lib/utils";

interface AllergenUnion {
  allergen: Allergen;
  status1: AllergenStatus;
  status2: AllergenStatus;
  unionStatus: AllergenStatus;
}

const ComparisonDrawer = memo(function ComparisonDrawer() {
  const {
    data,
    drawerOpen,
    setDrawerOpen,
    selectedSkus,
    clearSelection,
    getSelectedSkuData,
  } = useAllergenStore();

  const selectedSkusData = getSelectedSkuData();

  const allergenUnion = useMemo<AllergenUnion[]>(() => {
    if (!data || selectedSkusData.length !== 2) return [];

    return data.allergens.map((allergen) => {
      const s1 = selectedSkusData[0].allergens[allergen.key];
      const s2 = selectedSkusData[1].allergens[allergen.key];
      const unionLevel = Math.max(RISK_LEVEL[s1], RISK_LEVEL[s2]);

      let unionStatus: AllergenStatus;
      if (unionLevel === RISK_LEVEL["Y"]) unionStatus = "Y";
      else if (unionLevel === RISK_LEVEL["M"]) unionStatus = "M";
      else if (unionLevel === RISK_LEVEL["U"]) unionStatus = "U";
      else unionStatus = "N";

      return { allergen, status1: s1, status2: s2, unionStatus };
    });
  }, [data, selectedSkusData]);

  const hasHighRisk = useMemo(() => {
    return allergenUnion.some(
      (u) =>
        (u.allergen.key === "peanut" || u.allergen.key === "gluten") &&
        RISK_LEVEL[u.unionStatus] >= RISK_LEVEL["M"]
    );
  }, [allergenUnion]);

  const highRiskItems = useMemo(() => {
    return allergenUnion.filter(
      (u) =>
        (u.allergen.key === "peanut" || u.allergen.key === "gluten") &&
        RISK_LEVEL[u.unionStatus] >= RISK_LEVEL["M"]
    );
  }, [allergenUnion]);

  if (!drawerOpen || selectedSkusData.length !== 2) return null;

  const [sku1, sku2] = selectedSkusData;
  const brand1 = BRAND_COLORS[sku1.brand];
  const brand2 = BRAND_COLORS[sku2.brand];

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={() => setDrawerOpen(false)}
      />
      <div className="relative w-full max-w-xl bg-white shadow-2xl overflow-hidden flex flex-col drawer-animate">
        {hasHighRisk && (
          <div className="bg-red-600 text-white px-4 py-3 flex items-center gap-2 banner-pulse">
            <AlertTriangle className="w-5 h-5 flex-shrink-0" />
            <div className="flex-1">
              <span className="font-bold">高危警告：</span>
              <span>
                两者并集含
                {highRiskItems.map((item, i) => (
                  <span key={item.allergen.key} className="font-bold">
                    {i > 0 && "、"}
                    {item.allergen.labelZh}
                  </span>
                ))}
                ，花生过敏儿童请勿食用！
              </span>
            </div>
          </div>
        )}

        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200 bg-slate-50">
          <h3 className="font-bold text-slate-800 text-lg">过敏原对比分析</h3>
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500">
              已选择 {selectedSkus.length}/2
            </span>
            <button
              onClick={() => {
                setDrawerOpen(false);
                clearSelection();
              }}
              className="p-1.5 rounded-lg hover:bg-slate-200 transition-colors"
            >
              <X className="w-5 h-5 text-slate-500" />
            </button>
          </div>
        </div>

        <div className="p-4 space-y-4 overflow-auto flex-1">
          <div className="grid grid-cols-2 gap-3">
            {[
              { sku: sku1, brand: brand1 },
              { sku: sku2, brand: brand2 },
            ].map(({ sku, brand }) => (
              <div
                key={sku.id}
                className="p-3 rounded-xl border-2 border-slate-200"
                style={{ backgroundColor: brand.light }}
              >
                <div
                  className="text-xs font-semibold mb-1"
                  style={{ color: brand.primary }}
                >
                  {BRAND_LABELS[sku.brand as keyof typeof BRAND_LABELS]}
                </div>
                <div className="font-bold text-slate-800 text-sm">
                  {sku.nameZh}
                </div>
                <div className="text-xs text-slate-500">{sku.nameEn}</div>
                <div className="text-xs text-slate-400 mt-1 font-mono">
                  {sku.skuCode}
                </div>
              </div>
            ))}
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 flex items-start gap-2">
            <Info className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
            <div className="text-xs text-blue-700">
              <span className="font-semibold">并集分析：</span>
              显示两个 SKU 过敏原状态的并集。任意一方为"含"或"可能含"时，并集显示对应风险等级。
            </div>
          </div>

          <div className="space-y-2">
            <h4 className="font-semibold text-slate-700 text-sm">过敏原并集列表</h4>
            <div className="space-y-1">
              {allergenUnion.map((item) => {
                const colors = STATUS_COLORS[item.unionStatus];
                const isHighRiskAllergen =
                  item.allergen.key === "peanut" || item.allergen.key === "gluten";

                return (
                  <div
                    key={item.allergen.key}
                    className={cn(
                      "flex items-center justify-between p-3 rounded-lg border",
                      isHighRiskAllergen &&
                        RISK_LEVEL[item.unionStatus] >= RISK_LEVEL["M"]
                        ? "border-red-300 bg-red-50"
                        : "border-slate-200 bg-white"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={cn(
                          "w-9 h-9 rounded flex items-center justify-center font-bold text-sm border",
                          colors.bg,
                          colors.text,
                          colors.border,
                          colors.pattern
                        )}
                      >
                        {item.unionStatus}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-slate-800">
                            {item.allergen.labelZh}
                          </span>
                          {isHighRiskAllergen && (
                            <AlertTriangle className="w-3.5 h-3.5 text-red-500" />
                          )}
                        </div>
                        <div className="text-xs text-slate-500">
                          {STATUS_LABELS[item.unionStatus]}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 text-xs">
                      <span
                        className={cn(
                          "px-2 py-1 rounded font-mono",
                          STATUS_COLORS[item.status1].bg,
                          STATUS_COLORS[item.status1].text
                        )}
                      >
                        {item.status1}
                      </span>
                      <ChevronRight className="w-3 h-3 text-slate-400" />
                      <span
                        className={cn(
                          "px-2 py-1 rounded font-mono",
                          STATUS_COLORS[item.status2].bg,
                          STATUS_COLORS[item.status2].text
                        )}
                      >
                        {item.status2}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="pt-2">
            <h4 className="font-semibold text-slate-700 text-sm mb-2">图例说明</h4>
            <div className="grid grid-cols-2 gap-2 text-xs">
              {(Object.keys(STATUS_LABELS) as AllergenStatus[]).map((status) => (
                <div
                  key={status}
                  className="flex items-center gap-2 p-2 rounded-lg bg-slate-50"
                >
                  <div
                    className={cn(
                      "w-6 h-6 rounded flex items-center justify-center font-bold text-xs border",
                      STATUS_COLORS[status].bg,
                      STATUS_COLORS[status].text,
                      STATUS_COLORS[status].border,
                      STATUS_COLORS[status].pattern
                    )}
                  >
                    {status}
                  </div>
                  <div>
                    <div className="font-medium text-slate-700">
                      {STATUS_LABELS[status]}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="p-4 border-t border-slate-200 bg-slate-50 flex gap-3">
          <button
            onClick={clearSelection}
            className="flex-1 px-4 py-2.5 rounded-lg border border-slate-300 text-slate-700 font-medium hover:bg-slate-100 transition-colors"
          >
            清除选择
          </button>
          <button
            onClick={() => setDrawerOpen(false)}
            className="flex-1 px-4 py-2.5 rounded-lg bg-blue-500 text-white font-medium hover:bg-blue-600 transition-colors"
          >
            继续选择
          </button>
        </div>
      </div>
    </div>
  );
});

export default ComparisonDrawer;
