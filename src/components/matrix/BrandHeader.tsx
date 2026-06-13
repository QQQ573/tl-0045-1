import { memo } from "react";
import { BrandKey, BRAND_LABELS, AllergenStatus } from "@/types/allergen";
import { BRAND_COLORS, STATUS_COLORS } from "@/constants/colorPalette";
import { useAllergenStore } from "@/store/useAllergenStore";
import { ChevronDown, ChevronRight, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

interface BrandHeaderProps {
  brand: BrandKey;
  skuCount: number;
  maxRisk: AllergenStatus;
  style?: React.CSSProperties;
}

const BrandHeader = memo(function BrandHeader({ brand, skuCount, maxRisk, style }: BrandHeaderProps) {
  const { collapsedBrands, toggleBrandCollapse } = useAllergenStore();
  const isCollapsed = collapsedBrands.has(brand);
  const brandColor = BRAND_COLORS[brand];
  const riskColors = STATUS_COLORS[maxRisk];

  return (
    <div
      className={cn(
        "flex items-center border-b-2 border-slate-300 cursor-pointer transition-colors hover:bg-slate-50",
        isCollapsed && "bg-slate-50"
      )}
      style={style}
      onClick={() => toggleBrandCollapse(brand)}
    >
      <div
        className="sticky-col w-72 flex items-center gap-3 px-3 py-2.5 bg-inherit border-r border-slate-300"
        style={{ backgroundColor: isCollapsed ? brandColor.light : "white" }}
      >
        {isCollapsed ? (
          <ChevronRight className="w-5 h-5 text-slate-500" />
        ) : (
          <ChevronDown className="w-5 h-5 text-slate-500" />
        )}
        <div
          className="w-3 h-8 rounded-sm"
          style={{ backgroundColor: brandColor.primary }}
        />
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-800" style={{ color: brandColor.primary }}>
              {BRAND_LABELS[brand]}
            </span>
            <span className="text-xs text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
              {skuCount} 个 SKU
            </span>
          </div>
          <div className="text-xs text-slate-500">
            {isCollapsed ? "点击展开" : "点击折叠"}
          </div>
        </div>
        {isCollapsed && (
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500">最高风险:</span>
            <div
              className={cn(
                "w-10 h-10 rounded flex items-center justify-center font-bold text-sm border-2",
                riskColors.bg,
                riskColors.text,
                riskColors.border,
                riskColors.pattern
              )}
            >
              {maxRisk}
            </div>
          </div>
        )}
      </div>
      <div className="flex items-center px-4">
        {isCollapsed && (
          <div className="flex items-center gap-1.5 text-sm text-slate-600">
            <AlertTriangle className="w-4 h-4 text-amber-500" />
            <span>已折叠，显示品牌最高风险等级</span>
          </div>
        )}
      </div>
    </div>
  );
});

export default BrandHeader;
