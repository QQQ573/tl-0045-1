import { memo, useCallback } from "react";
import { SKU, Allergen, BRAND_LABELS, BrandKey } from "@/types/allergen";
import { BRAND_COLORS } from "@/constants/colorPalette";
import MatrixCell from "./MatrixCell";
import { useAllergenStore } from "@/store/useAllergenStore";
import { cn } from "@/lib/utils";
import { Check, AlertTriangle, CheckCircle2 } from "lucide-react";

interface MatrixRowProps {
  sku: SKU;
  allergens: Allergen[];
  style?: React.CSSProperties;
}

const MatrixRow = memo(function MatrixRow({ sku, allergens, style }: MatrixRowProps) {
  const {
    hoveredRow,
    selectedSkus,
    toggleSkuSelection,
    setHoveredRow,
    setHoveredCol,
    isSkuCompliant,
    highlightedSkus,
    highlightedStatus,
  } = useAllergenStore();

  const isHovered = hoveredRow === sku.id;
  const isSelected = selectedSkus.includes(sku.id);
  const isHighlighted = highlightedSkus.includes(sku.id);
  const brandColor = BRAND_COLORS[sku.brand as BrandKey];
  const compliant = isSkuCompliant(sku);

  const handleClick = useCallback(() => {
    toggleSkuSelection(sku.id);
  }, [toggleSkuSelection, sku.id]);

  return (
    <div
      className={cn(
        "flex items-center border-b border-slate-200 transition-all cursor-pointer group relative",
        isHovered && "row-hover",
        isSelected && "selected-row",
        compliant ? "border-l-4 border-l-emerald-500" : "border-l-4 border-l-red-500",
        isHighlighted && highlightedStatus && "ring-2 ring-blue-500 ring-inset"
      )}
      style={style}
      onClick={handleClick}
      onMouseEnter={() => setHoveredRow(sku.id)}
      onMouseLeave={() => {
        setHoveredRow(null);
        setHoveredCol(null);
      }}
    >
      <div
        className={cn(
          "sticky-col w-72 flex-shrink-0 flex items-center gap-3 px-4 py-2.5 border-r border-slate-200 h-[48px]",
          isSelected && "bg-blue-50",
          compliant ? "bg-white" : "bg-red-50",
          isHighlighted && highlightedStatus && "bg-blue-50"
        )}
      >
        <div className="flex items-center gap-1.5">
          <div
            className="w-1.5 h-8 rounded-sm flex-shrink-0"
            style={{ backgroundColor: brandColor.primary }}
          />
          {compliant ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
          ) : (
            <AlertTriangle className="w-4 h-4 text-red-500 flex-shrink-0" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-[10px] font-mono text-slate-400 mb-0.5">
            {sku.skuCode}
          </div>
          <div className={cn("font-semibold text-sm truncate", compliant ? "text-slate-900" : "text-red-700")}>
            {sku.nameZh}
          </div>
          <div className="flex items-center gap-1.5 mt-0.5">
            <span
              className="text-[9px] px-1.5 py-0.5 rounded"
              style={{ backgroundColor: brandColor.light, color: brandColor.primary }}
            >
              {BRAND_LABELS[sku.brand as BrandKey]}
            </span>
            <span className="text-[10px] text-slate-400 truncate">
              {sku.nameEn}
            </span>
          </div>
        </div>
        {isSelected && (
          <div className="w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center flex-shrink-0">
            <Check className="w-3 h-3 text-white" />
          </div>
        )}
      </div>
      <div className={cn("flex", compliant ? "" : "bg-red-50", isHighlighted && highlightedStatus && "bg-blue-50")}>
        {allergens.map((a) => (
          <MatrixCell
            key={a.key}
            status={sku.allergens[a.key]}
            rowId={sku.id}
            colKey={a.key}
          />
        ))}
      </div>
    </div>
  );
});

export default MatrixRow;
