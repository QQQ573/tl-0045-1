import { AllergenStatus } from "@/types/allergen";

export const STATUS_COLORS: Record<AllergenStatus, { bg: string; text: string; border: string; pattern: string }> = {
  Y: {
    bg: "bg-red-500",
    text: "text-white",
    border: "border-red-600",
    pattern: "",
  },
  M: {
    bg: "bg-amber-400",
    text: "text-amber-950",
    border: "border-amber-500",
    pattern: "",
  },
  N: {
    bg: "bg-emerald-500",
    text: "text-white",
    border: "border-emerald-600",
    pattern: "",
  },
  U: {
    bg: "bg-slate-300",
    text: "text-slate-700",
    border: "border-slate-400",
    pattern: "diagonal-pattern",
  },
};

export const COLOR_PALETTE_TABLE = [
  { status: "Y", label: "含", color: "#ef4444", risk: "高危", description: "明确含有过敏原" },
  { status: "M", label: "可能含", color: "#fbbf24", risk: "中危", description: "可能含有或交叉污染风险" },
  { status: "N", label: "不含", color: "#10b981", risk: "安全", description: "不含该过敏原" },
  { status: "U", label: "未标注", color: "#cbd5e1", risk: "未知", description: "供应商未提供信息，斜线纹理区分" },
];

export const BRAND_COLORS: Record<string, { primary: string; light: string }> = {
  kfc: { primary: "#D9000C", light: "#FEE2E2" },
  mcdonalds: { primary: "#FFC72C", light: "#FEF3C7" },
  华莱士: { primary: "#16A34A", light: "#DCFCE7" },
};
