import { memo } from "react";
import { Allergen } from "@/types/allergen";
import { useAllergenStore } from "@/store/useAllergenStore";
import { cn } from "@/lib/utils";
import { AlertTriangle } from "lucide-react";

interface MatrixHeaderProps {
  allergens: Allergen[];
}

const MatrixHeader = memo(function MatrixHeader({ allergens }: MatrixHeaderProps) {
  const { hoveredCol, setHoveredCol } = useAllergenStore();

  return (
    <div className="flex items-center sticky-header bg-slate-50 border-b-2 border-slate-300 z-30 h-[48px]">
      <div className="sticky-col-header w-72 px-4 py-2.5 bg-slate-100 border-r border-slate-300 flex items-center">
        <span className="font-semibold text-slate-700 text-sm">SKU 信息</span>
      </div>
      <div className="flex">
        {allergens.map((a) => {
          const isHovered = hoveredCol === a.key;
          return (
            <div
              key={a.key}
              className={cn(
                "w-12 flex-shrink-0 flex flex-col items-center justify-center border-r border-slate-200 cursor-pointer transition-colors h-[48px]",
                isHovered && "col-hover bg-blue-50"
              )}
              onMouseEnter={() => setHoveredCol(a.key)}
              onMouseLeave={() => setHoveredCol(null)}
            >
              {a.isHighRisk && <AlertTriangle className="w-3.5 h-3.5 text-red-500 mb-0.5" />}
              <span className="text-xs font-semibold text-slate-700">{a.labelShort}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
});

export default MatrixHeader;
