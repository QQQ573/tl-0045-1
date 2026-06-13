import { create } from "zustand";
import { AllergenData, SKU, BrandKey, AllergenStatus, RISK_LEVEL } from "@/types/allergen";

const ALLERGY_PROFILE_KEY = "allergen_profile";

interface AllergyProfile {
  avoidedAllergens: string[];
  showOnlyCompliant: boolean;
}

const DEFAULT_PROFILE: AllergyProfile = {
  avoidedAllergens: ["peanut", "gluten"],
  showOnlyCompliant: false,
};

function loadProfile(): AllergyProfile {
  try {
    const stored = localStorage.getItem(ALLERGY_PROFILE_KEY);
    if (stored) {
      return { ...DEFAULT_PROFILE, ...JSON.parse(stored) };
    }
  } catch (e) {
    console.warn("Failed to load allergy profile:", e);
  }
  return { ...DEFAULT_PROFILE };
}

function saveProfile(profile: AllergyProfile): void {
  try {
    localStorage.setItem(ALLERGY_PROFILE_KEY, JSON.stringify(profile));
  } catch (e) {
    console.warn("Failed to save allergy profile:", e);
  }
}

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
  profile: AllergyProfile;

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

  toggleAllergen: (allergenKey: string) => void;
  setShowOnlyCompliant: (enabled: boolean) => void;
  resetProfile: () => void;

  getFilteredSkus: () => SKU[];
  getSkusByBrand: (brand: BrandKey) => SKU[];
  getBrandMaxRisk: (brand: BrandKey) => AllergenStatus;
  getSelectedSkuData: () => SKU[];
  getSharedHighRiskAllergens: () => { key: string; label: string; status: AllergenStatus }[];
  isSkuCompliant: (sku: SKU) => boolean;
  getCompliantSkus: () => SKU[];
  getCompliantSkusByBrand: (brand: BrandKey) => SKU[];
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
  profile: loadProfile(),

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

  toggleAllergen: (allergenKey) => {
    const { profile } = get();
    const newAvoided = profile.avoidedAllergens.includes(allergenKey)
      ? profile.avoidedAllergens.filter((a) => a !== allergenKey)
      : [...profile.avoidedAllergens, allergenKey];
    const newProfile = { ...profile, avoidedAllergens: newAvoided };
    saveProfile(newProfile);
    set({ profile: newProfile });
  },

  setShowOnlyCompliant: (enabled) => {
    const { profile } = get();
    const newProfile = { ...profile, showOnlyCompliant: enabled };
    saveProfile(newProfile);
    set({ profile: newProfile });
  },

  resetProfile: () => {
    saveProfile(DEFAULT_PROFILE);
    set({ profile: DEFAULT_PROFILE });
  },

  isSkuCompliant: (sku) => {
    const { profile, data } = get();
    if (!data || profile.avoidedAllergens.length === 0) return true;
    for (const allergenKey of profile.avoidedAllergens) {
      const status = sku.allergens[allergenKey];
      if (status === "Y" || status === "M") {
        return false;
      }
    }
    return true;
  },

  getFilteredSkus: () => {
    const { data, searchQuery, collapsedBrands, profile, isSkuCompliant } = get();
    if (!data) return [];
    return data.skus.filter((sku) => {
      if (collapsedBrands.has(sku.brand as BrandKey)) return false;
      if (profile.showOnlyCompliant && !isSkuCompliant(sku)) return false;
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
    const { data, searchQuery, profile, isSkuCompliant } = get();
    if (!data) return [];
    const filtered = data.skus.filter((s) => s.brand === brand);
    if (profile.showOnlyCompliant) {
      return filtered.filter(isSkuCompliant);
    }
    if (!searchQuery.trim()) return filtered;
    const query = searchQuery.toLowerCase();
    return filtered.filter(
      (s) =>
        s.nameZh.toLowerCase().includes(query) ||
        s.nameEn.toLowerCase().includes(query) ||
        s.skuCode.toLowerCase().includes(query)
    );
  },

  getCompliantSkus: () => {
    const { data, isSkuCompliant } = get();
    if (!data) return [];
    return data.skus.filter(isSkuCompliant);
  },

  getCompliantSkusByBrand: (brand) => {
    const { data, isSkuCompliant } = get();
    if (!data) return [];
    return data.skus.filter((s) => s.brand === brand && isSkuCompliant(s));
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
