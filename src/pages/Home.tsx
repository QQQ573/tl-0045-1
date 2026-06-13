import { useRef, useState, useCallback, useEffect } from "react";
import { Search, Download, AlertCircle, Loader2, Filter, X, Menu, PanelLeftClose } from "lucide-react";
import AllergenMatrix from "@/components/matrix/AllergenMatrix";
import ComparisonDrawer from "@/components/ComparisonDrawer";
import Empty from "@/components/Empty";
import AllergyProfileSidebar from "@/components/AllergyProfileSidebar";
import SafeMenuBar from "@/components/SafeMenuBar";
import { useAllergenStore } from "@/store/useAllergenStore";
import { useAllergenData } from "@/hooks/useAllergenData";
import { BRAND_LABELS, BrandKey, SKU } from "@/types/allergen";
import { STATUS_COLORS, COLOR_PALETTE_TABLE } from "@/constants/colorPalette";
import { cn } from "@/lib/utils";
import html2canvas from "html2canvas";

export default function Home() {
  const { data, loading, error } = useAllergenData();
  const {
    selectedSkus,
    clearSelection,
    searchQuery,
    setSearchQuery,
    getFilteredSkus,
    collapsedBrands,
    profile,
  } = useAllergenStore();

  const matrixContainerRef = useRef<HTMLDivElement>(null);
  const [searchResults, setSearchResults] = useState<SKU[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  useEffect(() => {
    if (!data || !searchQuery.trim()) {
      setSearchResults([]);
      setShowResults(false);
      return;
    }
    const query = searchQuery.toLowerCase();
    const results = data.skus.filter(
      (s) =>
        s.nameZh.toLowerCase().includes(query) ||
        s.nameEn.toLowerCase().includes(query) ||
        s.skuCode.toLowerCase().includes(query)
    );
    setSearchResults(results.slice(0, 10));
    setShowResults(true);
  }, [searchQuery, data]);

  const handleSelectSearchResult = useCallback((skuId: string) => {
    (window as unknown as { __scrollToSku?: (id: string) => void }).__scrollToSku?.(skuId);
    setSearchQuery("");
    setShowResults(false);
  }, [setSearchQuery]);

  const handleExportPNG = useCallback(async () => {
    if (!matrixContainerRef.current || !data) return;
    setExporting(true);
    try {
      const canvas = await html2canvas(matrixContainerRef.current, {
        backgroundColor: "#ffffff",
        scale: 2,
        useCORS: true,
        logging: false,
      });
      const link = document.createElement("a");
      link.download = `allergen-matrix-${data.version}-${new Date().toISOString().slice(0, 10)}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
    } catch (e) {
      console.error("导出失败:", e);
    } finally {
      setExporting(false);
    }
  }, [data]);

  if (loading) {
    return (
      <div className="h-screen w-screen flex flex-col items-center justify-center bg-slate-50 gap-4">
        <Loader2 className="w-10 h-10 text-blue-500 animate-spin" />
        <p className="text-slate-600 font-medium">正在加载过敏原数据...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="h-screen w-screen flex flex-col items-center justify-center bg-slate-50 gap-4">
        <AlertCircle className="w-12 h-12 text-red-500" />
        <p className="text-slate-700 font-medium">数据加载失败</p>
        <p className="text-slate-500 text-sm">{error ?? "未知错误"}</p>
      </div>
    );
  }

  const filteredSkus = getFilteredSkus();

  return (
    <div className="h-screen w-screen flex bg-slate-50 overflow-hidden">
      {sidebarOpen && <AllergyProfileSidebar />}

      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white border-b border-slate-200 px-6 py-4 flex-shrink-0">
          <div className="flex items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="p-2 rounded-lg hover:bg-slate-100 transition-colors"
              >
                {sidebarOpen ? (
                  <PanelLeftClose className="w-5 h-5 text-slate-600" />
                ) : (
                  <Menu className="w-5 h-5 text-slate-600" />
                )}
              </button>
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
                <Filter className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-800">过敏原信息矩阵</h1>
                <p className="text-xs text-slate-500">
                  数据版本: {data.version} · 更新于: {new Date(data.updatedAt).toLocaleDateString("zh-CN")} · 共 {data.skus.length} 个 SKU
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => searchQuery.trim() && setShowResults(true)}
                  placeholder="搜索 SKU 中文名 / 英文名 / 编码..."
                  className="w-80 pl-10 pr-10 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
                {searchQuery && (
                  <button
                    onClick={() => {
                      setSearchQuery("");
                      setShowResults(false);
                    }}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded hover:bg-slate-100 transition-colors"
                  >
                    <X className="w-3.5 h-3.5 text-slate-400" />
                  </button>
                )}
                {showResults && searchResults.length > 0 && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-slate-200 rounded-lg shadow-lg z-50 overflow-hidden">
                    {searchResults.map((sku) => (
                      <button
                        key={sku.id}
                        onClick={() => handleSelectSearchResult(sku.id)}
                        className="w-full px-3 py-2.5 text-left hover:bg-blue-50 transition-colors border-b border-slate-100 last:border-b-0 flex items-center gap-3"
                      >
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-slate-800 text-sm truncate">
                            {sku.nameZh}
                          </div>
                          <div className="text-xs text-slate-500 flex items-center gap-2">
                            <span className="font-mono">{sku.skuCode}</span>
                            <span>·</span>
                            <span>{BRAND_LABELS[sku.brand as BrandKey]}</span>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <button
                onClick={handleExportPNG}
                disabled={exporting}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-all",
                  exporting
                    ? "bg-slate-100 text-slate-400 cursor-not-allowed"
                    : "bg-blue-500 text-white hover:bg-blue-600 active:scale-95"
                )}
              >
                {exporting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Download className="w-4 h-4" />
                )}
                {exporting ? "导出中..." : "导出 PNG"}
              </button>
            </div>
          </div>

          {selectedSkus.length > 0 && (
            <div className="mt-3 flex items-center gap-3 bg-blue-50 border border-blue-200 rounded-lg px-4 py-2.5">
              <span className="text-sm text-blue-700 font-medium">
                已选择 {selectedSkus.length}/2 个 SKU 进行对比
              </span>
              {selectedSkus.length < 2 && (
                <span className="text-xs text-blue-600">请再点击一行 SKU 查看过敏原并集分析</span>
              )}
              <button
                onClick={clearSelection}
                className="ml-auto text-xs text-blue-600 hover:text-blue-800 underline underline-offset-2"
              >
                清除选择
              </button>
            </div>
          )}
        </header>

        <div className="flex-1 overflow-hidden p-4">
          <div
            ref={matrixContainerRef}
            className="h-full bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col"
          >
            <div className="px-4 py-3 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-3">
                <span className="text-xs font-medium text-slate-600">图例:</span>
                <div className="flex items-center gap-3">
                  {COLOR_PALETTE_TABLE.map((item) => (
                    <div key={item.status} className="flex items-center gap-1.5">
                      <div
                        className={cn(
                          "w-5 h-5 rounded flex items-center justify-center font-bold text-xs border",
                          STATUS_COLORS[item.status as keyof typeof STATUS_COLORS].bg,
                          STATUS_COLORS[item.status as keyof typeof STATUS_COLORS].text,
                          STATUS_COLORS[item.status as keyof typeof STATUS_COLORS].border,
                          STATUS_COLORS[item.status as keyof typeof STATUS_COLORS].pattern
                        )}
                      >
                        {item.status}
                      </div>
                      <span className="text-xs text-slate-600">{item.label}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded border-2 border-emerald-500 bg-emerald-500 flex items-center justify-center">
                    <div className="w-2 h-2 bg-white rounded" />
                  </div>
                  <span className="text-xs text-slate-500">合规 SKU</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded border-2 border-red-500 bg-red-500 flex items-center justify-center">
                    <div className="w-2 h-2 bg-white rounded" />
                  </div>
                  <span className="text-xs text-slate-500">需规避</span>
                </div>
                <div className="text-xs text-slate-500">
                  显示 {filteredSkus.length} / {data.skus.length} 个 SKU
                  {collapsedBrands.size > 0 && ` · ${collapsedBrands.size} 个品牌已折叠`}
                  {profile.showOnlyCompliant && " · 仅显示合规"}
                </div>
              </div>
            </div>

            {filteredSkus.length > 0 ? (
              <div className="flex-1 overflow-hidden">
                <AllergenMatrix />
              </div>
            ) : (
              <Empty />
            )}
          </div>
        </div>

        <SafeMenuBar />
      </div>

      <ComparisonDrawer />
    </div>
  );
}
