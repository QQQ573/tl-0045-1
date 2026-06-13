import { memo } from "react";
import { Allergen } from "@/types/allergen";
import { useAllergenStore } from "@/store/useAllergenStore";
import { cn } from "@/lib/utils";
import { AlertTriangle, BarChart3 } from "lucide-react";

interface MatrixHeaderProps {
  allergens: Allergen[];
}

const MatrixHeader = memo(function MatrixHeader({ allergens }: MatrixHeaderProps) {
  const { hoveredCol, setHoveredCol, openAnalysis } = useAllergenStore();

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
                "w-12 flex-shrink-0 flex flex-col items-center justify-center border-r border-slate-200 transition-colors h-[48px] group relative",
                isHovered ? "bg-blue-50" : "hover:bg-slate-100"
              )}
              onMouseEnter={() => setHoveredCol(a.key)}
              onMouseLeave={() => setHoveredCol(null)}
              onClick={() => openAnalysis(a.key)}
            >
              {a.isHighRisk && <AlertTriangle className="w-3.5 h-3.5 text-red-500 mb-0.5" />}
              <span className="text-xs font-semibold text-slate-700">{a.labelShort}</span>
              <BarChart3 className="absolute bottom-1 right-1 w-3 h-3 text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer" />
            </div>
          );
        })}
      </div>
    </div>
  );
});

export default MatrixHeader;
