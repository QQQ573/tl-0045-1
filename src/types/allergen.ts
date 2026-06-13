export type AllergenStatus = "Y" | "M" | "N" | "U";

export interface Allergen {
  key: string;
  labelZh: string;
  labelShort: string;
  isHighRisk: boolean;
}

export interface SKUAllergens {
  [key: string]: AllergenStatus;
}

export interface SKU {
  id: string;
  brand: "kfc" | "mcdonalds" | "华莱士";
  skuCode: string;
  nameZh: string;
  nameEn: string;
  category: string;
  allergens: SKUAllergens;
}

export interface AllergenData {
  version: string;
  updatedAt: string;
  allergens: Allergen[];
  skus: SKU[];
}

export type BrandKey = "kfc" | "mcdonalds" | "华莱士";

export const BRAND_LABELS: Record<BrandKey, string> = {
  kfc: "肯德基",
  mcdonalds: "麦当劳",
  华莱士: "华莱士",
};

export const STATUS_LABELS: Record<AllergenStatus, string> = {
  Y: "含",
  M: "可能含",
  N: "不含",
  U: "未标注",
};

export const RISK_LEVEL: Record<AllergenStatus, number> = {
  Y: 3,
  M: 2,
  U: 1,
  N: 0,
};
