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
      style={{ ...style, height: "48px" }}
      onClick={() => toggleBrandCollapse(brand)}
    >
      <div
        className={cn(
          "sticky-col w-72 flex-shrink-0 flex items-center gap-2 px-4 bg-inherit border-r border-slate-300 h-[48px]"
        )}
        style={{ backgroundColor: isCollapsed ? brandColor.light : "white" }}
      >
        {isCollapsed ? (
          <ChevronRight className="w-4 h-4 text-slate-500 flex-shrink-0" />
        ) : (
          <ChevronDown className="w-4 h-4 text-slate-500 flex-shrink-0" />
        )}
        <div
          className="w-1.5 h-8 rounded-sm flex-shrink-0"
          style={{ backgroundColor: brandColor.primary }}
        />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-800 text-sm" style={{ color: brandColor.primary }}>
              {BRAND_LABELS[brand]}
            </span>
            <span className="text-[10px] text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded-full font-medium">
              {skuCount} 个 SKU
            </span>
          </div>
          <div className="text-[10px] text-slate-400">
            {isCollapsed ? "点击展开" : "点击折叠"}
          </div>
        </div>
        {isCollapsed && (
          <div className="flex flex-col items-center gap-0.5 flex-shrink-0">
            <span className="text-[9px] text-slate-400">最高风险</span>
            <div
              className={cn(
                "w-7 h-7 rounded flex items-center justify-center font-bold text-xs border-2 flex-shrink-0",
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
      <div className="flex flex-shrink-0 items-center px-4 h-[48px]">
        {isCollapsed && (
          <div className="flex items-center gap-1.5">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-500 flex-shrink-0" />
            <span className="text-xs text-slate-500">已折叠，显示最高风险</span>
          </div>
        )}
      </div>
    </div>
  );
});

export default BrandHeader;
