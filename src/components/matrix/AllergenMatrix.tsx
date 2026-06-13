import { useMemo, useRef, useEffect, useCallback } from "react";
import { useVirtualizer } from "@tanstack/react-virtual";
import { BrandKey, SKU } from "@/types/allergen";
import { useAllergenStore } from "@/store/useAllergenStore";
import MatrixHeader from "./MatrixHeader";
import MatrixRow from "./MatrixRow";
import BrandHeader from "./BrandHeader";

const BRANDS: BrandKey[] = ["kfc", "mcdonalds", "华莱士"];
const BRAND_HEADER_HEIGHT = 48;
const SKU_ROW_HEIGHT = 48;

type VirtualItem =
  | { type: "brand"; brand: BrandKey; index: number }
  | { type: "sku"; sku: SKU; brand: BrandKey; index: number };

export default function AllergenMatrix() {
  const { data, collapsedBrands, searchQuery, getSkusByBrand, getBrandMaxRisk } = useAllergenStore();
  const parentRef = useRef<HTMLDivElement>(null);
  const scrollToIdRef = useRef<string | null>(null);

  const items = useMemo<VirtualItem[]>(() => {
    if (!data) return [];
    const result: VirtualItem[] = [];
    let globalIndex = 0;

    for (const brand of BRANDS) {
      const skus = getSkusByBrand(brand);
      if (skus.length === 0 && searchQuery.trim()) continue;

      result.push({ type: "brand", brand, index: globalIndex });
      globalIndex++;

      if (!collapsedBrands.has(brand)) {
        for (const sku of skus) {
          result.push({ type: "sku", sku, brand, index: globalIndex });
          globalIndex++;
        }
      }
    }

    return result;
  }, [data, collapsedBrands, searchQuery, getSkusByBrand]);

  const virtualizer = useVirtualizer({
    count: items.length,
    getScrollElement: () => parentRef.current,
    estimateSize: useCallback((index: number) => {
      const item = items[index];
      return item?.type === "brand" ? BRAND_HEADER_HEIGHT : SKU_ROW_HEIGHT;
    }, [items]),
    overscan: 10,
  });

  const scrollToSku = useCallback((skuId: string) => {
    const itemIndex = items.findIndex((i) => i.type === "sku" && i.sku.id === skuId);
    if (itemIndex >= 0) {
      virtualizer.scrollToIndex(itemIndex, { align: "start", behavior: "smooth" });
    }
  }, [items, virtualizer]);

  useEffect(() => {
    if (scrollToIdRef.current) {
      scrollToSku(scrollToIdRef.current);
      scrollToIdRef.current = null;
    }
  }, [scrollToSku, items]);

  useEffect(() => {
    (window as unknown as { __scrollToSku: (id: string) => void }).__scrollToSku = (id: string) => {
      scrollToIdRef.current = id;
      scrollToSku(id);
    };
    return () => {
      delete (window as unknown as { __scrollToSku?: (id: string) => void }).__scrollToSku;
    };
  }, [scrollToSku]);

  if (!data) return null;

  const virtualItems = virtualizer.getVirtualItems();

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <MatrixHeader allergens={data.allergens} />
      <div
        ref={parentRef}
        className="virtual-scroll-container flex-1 overflow-auto"
        style={{ contain: "strict" }}
      >
        <div style={{ height: virtualizer.getTotalSize(), position: "relative", width: "100%" }}>
          {virtualItems.map((virtualItem) => {
            const item = items[virtualItem.index];
            if (!item) return null;

            return (
              <div
                key={`${item.type}-${item.type === "brand" ? item.brand : item.sku.id}`}
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  width: "100%",
                  transform: `translateY(${virtualItem.start}px)`,
                }}
              >
                {item.type === "brand" ? (
                  <BrandHeader
                    brand={item.brand}
                    skuCount={getSkusByBrand(item.brand).length}
                    maxRisk={getBrandMaxRisk(item.brand)}
                  />
                ) : (
                  <MatrixRow
                    sku={item.sku}
                    allergens={data.allergens}
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
