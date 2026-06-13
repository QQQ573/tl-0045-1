import { create } from "zustand";
import { AllergenData, SKU, BrandKey, AllergenStatus, RISK_LEVEL } from "@/types/allergen";

interface AllergenStore {
  data: AllergenData | null;
  loading: boolean;
  error: string | null;
  hoveredRow: string | null;
  hoveredCol: string | null;
  selectedSkus: string[];
  searchQuery: string;
  collapsedBrands: Set<BrandKey>;
  drawerOpen: boolean;

  setData: (data: AllergenData) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setHoveredRow: (id: string | null) => void;
  setHoveredCol: (key: string | null) => void;
  toggleSkuSelection: (id: string) => void;
  clearSelection: () => void;
  setSearchQuery: (query: string) => void;
  toggleBrandCollapse: (brand: BrandKey) => void;
  setDrawerOpen: (open: boolean) => void;

  getFilteredSkus: () => SKU[];
  getSkusByBrand: (brand: BrandKey) => SKU[];
  getBrandMaxRisk: (brand: BrandKey) => AllergenStatus;
  getSelectedSkuData: () => SKU[];
  getSharedHighRiskAllergens: () => { key: string; label: string; status: AllergenStatus }[];
}

export const useAllergenStore = create<AllergenStore>((set, get) => ({
  data: null,
  loading: true,
  error: null,
  hoveredRow: null,
  hoveredCol: null,
  selectedSkus: [],
  searchQuery: "",
  collapsedBrands: new Set(),
  drawerOpen: false,

  setData: (data) => set({ data }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
  setHoveredRow: (id) => set({ hoveredRow: id }),
  setHoveredCol: (key) => set({ hoveredCol: key }),

  toggleSkuSelection: (id) => {
    const { selectedSkus } = get();
    let newSelection: string[];
    if (selectedSkus.includes(id)) {
      newSelection = selectedSkus.filter((s) => s !== id);
    } else if (selectedSkus.length < 2) {
      newSelection = [...selectedSkus, id];
    } else {
      newSelection = [selectedSkus[1], id];
    }
    set({ selectedSkus: newSelection, drawerOpen: newSelection.length === 2 });
  },

  clearSelection: () => set({ selectedSkus: [], drawerOpen: false }),
  setSearchQuery: (query) => set({ searchQuery: query }),

  toggleBrandCollapse: (brand) => {
    const { collapsedBrands } = get();
    const newCollapsed = new Set(collapsedBrands);
    if (newCollapsed.has(brand)) {
      newCollapsed.delete(brand);
    } else {
      newCollapsed.add(brand);
    }
    set({ collapsedBrands: newCollapsed });
  },

  setDrawerOpen: (open) => set({ drawerOpen: open }),

  getFilteredSkus: () => {
    const { data, searchQuery, collapsedBrands } = get();
    if (!data) return [];
    return data.skus.filter((sku) => {
      if (collapsedBrands.has(sku.brand as BrandKey)) return false;
      if (!searchQuery.trim()) return true;
      const query = searchQuery.toLowerCase();
      return (
        sku.nameZh.toLowerCase().includes(query) ||
        sku.nameEn.toLowerCase().includes(query) ||
        sku.skuCode.toLowerCase().includes(query)
      );
    });
  },

  getSkusByBrand: (brand) => {
    const { data, searchQuery } = get();
    if (!data) return [];
    if (!searchQuery.trim()) return data.skus.filter((s) => s.brand === brand);
    const query = searchQuery.toLowerCase();
    return data.skus.filter(
      (s) =>
        s.brand === brand &&
        (s.nameZh.toLowerCase().includes(query) ||
          s.nameEn.toLowerCase().includes(query) ||
          s.skuCode.toLowerCase().includes(query))
    );
  },

  getBrandMaxRisk: (brand) => {
    const skus = get().getSkusByBrand(brand);
    let maxStatus: AllergenStatus = "N";
    let maxLevel = -1;
    for (const sku of skus) {
      for (const status of Object.values(sku.allergens)) {
        const level = RISK_LEVEL[status];
        if (level > maxLevel) {
          maxLevel = level;
          maxStatus = status;
        }
      }
    }
    return maxStatus;
  },

  getSelectedSkuData: () => {
    const { data, selectedSkus } = get();
    if (!data) return [];
    return data.skus.filter((s) => selectedSkus.includes(s.id));
  },

  getSharedHighRiskAllergens: () => {
    const { data } = get();
    const selected = get().getSelectedSkuData();
    if (!data || selected.length !== 2) return [];

    const results: { key: string; label: string; status: AllergenStatus }[] = [];
    for (const allergen of data.allergens) {
      const s1 = selected[0].allergens[allergen.key];
      const s2 = selected[1].allergens[allergen.key];
      const unionLevel = Math.max(RISK_LEVEL[s1], RISK_LEVEL[s2]);
      if (unionLevel >= RISK_LEVEL["M"]) {
        const status = unionLevel === RISK_LEVEL["Y"] ? "Y" : "M";
        results.push({ key: allergen.key, label: allergen.labelZh, status });
      }
    }
    return results;
  },
}));
