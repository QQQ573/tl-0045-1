import type { SKU } from "@/types/allergen";

/** 判断 SKU 是否命中顶部搜索框关键字 */
export function matchesSearchQuery(sku: SKU, query: string): boolean {
  if (!query.trim()) return true;
  const q = query.toLowerCase();
  return (
    sku.nameZh.toLowerCase().includes(q) ||
    sku.nameEn.toLowerCase().includes(q) ||
    sku.skuCode.toLowerCase().includes(q)
  );
}
