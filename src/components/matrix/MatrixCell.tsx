import { memo } from "react";
import { AllergenStatus } from "@/types/allergen";
import { STATUS_COLORS } from "@/constants/colorPalette";
import { useAllergenStore } from "@/store/useAllergenStore";
import { cn } from "@/lib/utils";

interface MatrixCellProps {
  status: AllergenStatus;
  rowId: string;
  colKey: string;
}

const MatrixCell = memo(function MatrixCell({ status, rowId, colKey }: MatrixCellProps) {
  const { hoveredRow, hoveredCol, setHoveredRow, setHoveredCol } = useAllergenStore();
  const colors = STATUS_COLORS[status];

  const isRowHovered = hoveredRow === rowId;
  const isColHovered = hoveredCol === colKey;

  return (
    <div
      className={cn(
        "matrix-cell w-12 h-12 flex items-center justify-center font-bold text-sm border-r border-b border-slate-200 cursor-default select-none flex-shrink-0",
        colors.bg,
        colors.text,
        colors.pattern,
        isRowHovered && "row-hover",
        isColHovered && "col-hover",
        (isRowHovered || isColHovered) && "brightness-110"
      )}
      onMouseEnter={() => {
        setHoveredRow(rowId);
        setHoveredCol(colKey);
      }}
      onMouseLeave={() => {
        setHoveredRow(null);
        setHoveredCol(null);
      }}
      title={status}
    >
      {status}
    </div>
  );
});

export default MatrixCell;
