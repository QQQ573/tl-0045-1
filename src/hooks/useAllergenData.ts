import { useEffect } from "react";
import { useAllergenStore } from "@/store/useAllergenStore";
import type { AllergenData } from "@/types/allergen";

export function useAllergenData() {
  const { data, loading, error, setData, setLoading, setError } = useAllergenStore();

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const res = await fetch("/data/allergenData.json");
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = (await res.json()) as AllergenData;
        setData(json);
        setError(null);
      } catch (e) {
        setError(e instanceof Error ? e.message : "加载失败");
      } finally {
        setLoading(false);
      }
    };
    if (!data) loadData();
  }, [data, setData, setLoading, setError]);

  return { data, loading, error };
}
