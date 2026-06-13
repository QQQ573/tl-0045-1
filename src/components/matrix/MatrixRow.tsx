import { memo, useCallback } from "react";
import { SKU, Allergen, BRAND_LABELS, BrandKey } from "@/types/allergen";
import { BRAND_COLORS } from "@/constants/colorPalette";
import MatrixCell from "./MatrixCell";
import { useAllergenStore } from "@/store/useAllergenStore";
import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

interface MatrixRowProps {
  sku: SKU;
  allergens: Allergen[];
  style?: React.CSSProperties;
}

const MatrixRow = memo(function MatrixRow({ sku, allergens, style }: MatrixRowProps) {
  const { hoveredRow, selectedSkus, toggleSkuSelection, setHoveredRow, setHoveredCol } = useAllergenStore();
  const isHovered = hoveredRow === sku.id;
  const isSelected = selectedSkus.includes(sku.id);
  const brandColor = BRAND_COLORS[sku.brand as BrandKey];

  const handleClick = useCallback(() => {
    toggleSkuSelection(sku.id);
  }, [toggleSkuSelection, sku.id]);

  return (
    <div
      className={cn(
        "flex items-stretch border-b border-slate-200 transition-colors cursor-pointer group",
        isHovered && "row-hover",
        isSelected && "selected-row"
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
          "sticky-col w-72 flex items-center gap-2 px-3 py-2 bg-white border-r border-slate-200",
          isSelected && "bg-blue-50"
        )}
      >
        <div
          className="w-2 h-8 rounded-sm flex-shrink-0"
          style={{ backgroundColor: brandColor.primary }}
        />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500 font-mono">{sku.skuCode}</span>
            <span
              className="text-xs px-1.5 py-0.5 rounded"
              style={{ backgroundColor: brandColor.light, color: brandColor.primary }}
            >
              {BRAND_LABELS[sku.brand as BrandKey]}
            </span>
          </div>
          <div className="font-medium text-slate-900 truncate">{sku.nameZh}</div>
          <div className="text-xs text-slate-500 truncate">{sku.nameEn}</div>
        </div>
        {isSelected && (
          <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center flex-shrink-0">
            <Check className="w-4 h-4 text-white" />
          </div>
        )}
      </div>
      <div className="flex">
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
