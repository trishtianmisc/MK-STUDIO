import { ArrowUpRight, Search, SlidersHorizontal, X, ChevronDown } from "lucide-react";
import { useMemo, useState, useEffect, useRef } from "react";
import { useLocation } from "wouter";
import { StoreShell } from "@/components/StoreShell";
import { formatRentalPrice, toShowcaseProduct } from "@/data/catalogue";
import { useProducts } from "@/hooks/useProducts";
import { useCategories } from "@/hooks/useCategories";
import { getFilterOptions, type FilterOptions, type ProductFilters } from "@/services/products";

type Filter = "all" | string;

export default function Catalogue() {
  const [, setLocation] = useLocation();
  const { categories } = useCategories();
  const filterRef = useRef<HTMLDivElement>(null);

  const sortedCategories = useMemo(
    () => [...categories].sort((a, b) => a.sort_order - b.sort_order),
    [categories],
  );

  // Category tab filter (applies immediately)
  const [filter, setFilter] = useState<Filter>("all");

  // Search
  const [searchOpen, setSearchOpen] = useState(false);
  const [search, setSearch] = useState("");

  // Sort
  const [sort, setSort] = useState<"newest" | "az" | "price-low">("newest");

  // Filter panel open state
  const [filterOpen, setFilterOpen] = useState(false);

  // Staging filters (user selections before confirming)
  const [stagingSizes, setStagingSizes] = useState<string[]>([]);
  const [stagingStyles, setStagingStyles] = useState<string[]>([]);
  const [stagingPrice, setStagingPrice] = useState<{ min: number; max: number }>({ min: 0, max: 10000 });

  // Applied filters (sent to API)
  const [appliedFilters, setAppliedFilters] = useState<ProductFilters>({});

  // Filter options from server
  const [filterOptions, setFilterOptions] = useState<FilterOptions>({ sizes: [], styles: [], priceBounds: { min: 0, max: 10000 } });

  // Show all sizes/styles in panel
  const [showAllSizes, setShowAllSizes] = useState(false);
  const [showAllStyles, setShowAllStyles] = useState(false);

  const FILTER_LIMIT = 6;

  // Fetch filter options on mount
  useEffect(() => {
    getFilterOptions().then(setFilterOptions).catch(() => {});
  }, []);

  // Sync staging price bounds when filter options load
  useEffect(() => {
    setStagingPrice(filterOptions.priceBounds);
  }, [filterOptions]);

  // Category filter ID
  const categoryFilter = filter === "all" ? undefined : sortedCategories.find(c => c.slug === filter)?.id;

  // Fetch products with applied filters
  const { products: rawProducts, loading, loadingMore, error, total: apiTotal, hasMore, loadMore } = useProducts(categoryFilter, appliedFilters);

  const allProducts = useMemo(
    () => rawProducts.map(toShowcaseProduct),
    [rawProducts],
  );

  // Client-side search filter (applied on top of server results)
  const searchFilteredProducts = useMemo(() => {
    const text = search.trim().toLowerCase();
    if (!text) return allProducts;
    return allProducts.filter(p =>
      `${p.name} ${p.categoryLabel} ${p.style} ${p.length} ${p.brand}`.toLowerCase().includes(text)
    );
  }, [allProducts, search]);

  // Client-side sort
  const sortedProducts = useMemo(() => {
    if (sort === "az") return [...searchFilteredProducts].sort((a, b) => a.name.localeCompare(b.name));
    if (sort === "price-low") return [...searchFilteredProducts].sort((a, b) => a.rentalPrice - b.rentalPrice);
    return searchFilteredProducts;
  }, [searchFilteredProducts, sort]);

  const categoryDescription = useMemo(() => {
    const map: Record<string, string> = {};
    for (const cat of categories) {
      if (cat.description) map[cat.slug] = cat.description;
    }
    return map;
  }, [categories]);

  // Count active applied filters
  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (appliedFilters.sizes && appliedFilters.sizes.length > 0) count += appliedFilters.sizes.length;
    if (appliedFilters.style) count++;
    if (appliedFilters.priceMin != null || appliedFilters.priceMax != null) count++;
    return count;
  }, [appliedFilters]);

  // Count staging filters (for badge before confirm)
  const stagingFilterCount = useMemo(() => {
    let count = 0;
    if (stagingSizes.length > 0) count += stagingSizes.length;
    if (stagingStyles.length > 0) count += stagingStyles.length;
    if (stagingPrice.min > filterOptions.priceBounds.min || stagingPrice.max < filterOptions.priceBounds.max) count++;
    return count;
  }, [stagingSizes, stagingStyles, stagingPrice, filterOptions]);

  // Click outside to close filter panel
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (filterRef.current && !filterRef.current.contains(e.target as Node)) {
        setFilterOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleStagingSize = (size: string) => {
    setStagingSizes(prev => prev.includes(size) ? prev.filter(s => s !== size) : [...prev, size]);
  };

  const toggleStagingStyle = (style: string) => {
    setStagingStyles(prev => prev.includes(style) ? prev.filter(s => s !== style) : [...prev, style]);
  };

  const confirmFilters = () => {
    const filters: ProductFilters = {};
    if (stagingSizes.length > 0) filters.sizes = stagingSizes;
    if (stagingStyles.length > 0) filters.style = stagingStyles[0]; // Server takes single style
    if (stagingPrice.min > filterOptions.priceBounds.min) filters.priceMin = stagingPrice.min;
    if (stagingPrice.max < filterOptions.priceBounds.max) filters.priceMax = stagingPrice.max;
    setAppliedFilters(Object.keys(filters).length > 0 ? filters : {});
    setFilterOpen(false);
  };

  const clearStagingFilters = () => {
    setStagingSizes([]);
    setStagingStyles([]);
    setStagingPrice(filterOptions.priceBounds);
  };

  const clearAllFilters = () => {
    setStagingSizes([]);
    setStagingStyles([]);
    setStagingPrice(filterOptions.priceBounds);
    setAppliedFilters({});
  };

  const hasUnconfirmedChanges =
    JSON.stringify(stagingSizes) !== JSON.stringify(appliedFilters.sizes ?? []) ||
    stagingStyles[0] !== (appliedFilters.style ?? (stagingStyles.length > 0 ? undefined : undefined)) ||
    stagingPrice.min !== (appliedFilters.priceMin ?? filterOptions.priceBounds.min) ||
    stagingPrice.max !== (appliedFilters.priceMax ?? filterOptions.priceBounds.max);

  return (
    <StoreShell current="catalogue">
      <main className="catalogue-page">
        <section className="catalogue-hero">
          <p className="eyebrow">The MK Studio catalogue</p>
          <h1>Pieces with a<br /><em>next destination.</em></h1>
          <p>Browse our curated rental collection. Each piece is selected for its quality and timeless appeal. Contact the studio to check availability for your dates.</p>
        </section>

        <section className="catalogue-content" aria-label="Catalogue products">
          <div className="catalogue-toolbar">
            <div className="filter-list" role="group" aria-label="Filter catalogue">
              <button className={filter === "all" ? "is-active" : ""} onClick={() => setFilter("all")}>All looks</button>
              {sortedCategories.map((cat) => (
                <button className={filter === cat.slug ? "is-active" : ""} onClick={() => setFilter(cat.slug)} key={cat.slug}>{cat.name}</button>
              ))}
            </div>
            <div className="catalogue-toolbar-actions">
              <div className="catalogue-filter-dropdown" ref={filterRef}>
                <button className="catalogue-filter-trigger" onClick={() => setFilterOpen(!filterOpen)}>
                  <SlidersHorizontal size={14} />
                  <span>Filter{activeFilterCount > 0 ? ` (${activeFilterCount})` : ""}</span>
                  <ChevronDown size={14} className={filterOpen ? "is-open" : ""} />
                </button>
                {filterOpen && (
                  <div className="catalogue-filter-panel">
                    {filterOptions.sizes.length > 0 && (
                      <div className="catalogue-filter-section">
                        <span className="catalogue-filter-heading">Size</span>
                        <div className={`catalogue-filter-list ${showAllSizes ? "is-expanded" : ""}`}>
                          {(showAllSizes ? filterOptions.sizes : filterOptions.sizes.slice(0, FILTER_LIMIT)).map(size => (
                            <button key={size} className={`catalogue-filter-option ${stagingSizes.includes(size) ? "is-active" : ""}`} onClick={() => toggleStagingSize(size)}>{size}</button>
                          ))}
                        </div>
                        {filterOptions.sizes.length > FILTER_LIMIT && (
                          <button className="catalogue-filter-more" onClick={() => setShowAllSizes(!showAllSizes)}>{showAllSizes ? "Show less" : `See all (${filterOptions.sizes.length})`}</button>
                        )}
                      </div>
                    )}
                    {filterOptions.styles.length > 0 && (
                      <div className="catalogue-filter-section">
                        <span className="catalogue-filter-heading">Style</span>
                        <div className={`catalogue-filter-list ${showAllStyles ? "is-expanded" : ""}`}>
                          {(showAllStyles ? filterOptions.styles : filterOptions.styles.slice(0, FILTER_LIMIT)).map(style => (
                            <button key={style} className={`catalogue-filter-option ${stagingStyles.includes(style) ? "is-active" : ""}`} onClick={() => toggleStagingStyle(style)}>{style}</button>
                          ))}
                        </div>
                        {filterOptions.styles.length > FILTER_LIMIT && (
                          <button className="catalogue-filter-more" onClick={() => setShowAllStyles(!showAllStyles)}>{showAllStyles ? "Show less" : `See all (${filterOptions.styles.length})`}</button>
                        )}
                      </div>
                    )}
                    <div className="catalogue-filter-section">
                      <span className="catalogue-filter-heading">Price</span>
                      <div className="catalogue-filter-price">
                        <input type="number" value={stagingPrice.min} onChange={e => setStagingPrice({ ...stagingPrice, min: Number(e.target.value) })} placeholder="Min" />
                        <span>–</span>
                        <input type="number" value={stagingPrice.max} onChange={e => setStagingPrice({ ...stagingPrice, max: Number(e.target.value) })} placeholder="Max" />
                      </div>
                    </div>
                    <div className="catalogue-filter-actions">
                      {stagingFilterCount > 0 && (
                        <button className="catalogue-filter-clear" onClick={clearStagingFilters}>Clear all</button>
                      )}
                      <button className="catalogue-filter-confirm" onClick={confirmFilters}>
                        Confirm{stagingFilterCount > 0 ? ` (${stagingFilterCount})` : ""}
                      </button>
                    </div>
                  </div>
                )}
              </div>
              <label className="sort-control"><span>Sort</span><select value={sort} onChange={e => setSort(e.target.value as "newest" | "az" | "price-low")}><option value="newest">Featured</option><option value="az">A–Z</option><option value="price-low">Price: low to high</option></select></label>
            </div>
          </div>

          {activeFilterCount > 0 && (
            <div className="catalogue-active-filters">
              <span>Filtered by:</span>
              {appliedFilters.sizes?.map(s => <button key={s} className="catalogue-active-chip" onClick={() => { setStagingSizes(prev => prev.filter(x => x !== s)); setAppliedFilters(prev => ({ ...prev, sizes: prev.sizes?.filter(x => x !== s) })); }}>{s} <X size={12} /></button>)}
              {appliedFilters.style && <button className="catalogue-active-chip" onClick={() => { setStagingStyles([]); setAppliedFilters(prev => { const { style, ...rest } = prev; return rest; }); }}>{appliedFilters.style} <X size={12} /></button>}
              <button className="catalogue-filter-clear" onClick={clearAllFilters}>Clear all</button>
            </div>
          )}

          {loading && <div className="catalogue-empty"><p>Loading catalogue...</p></div>}
          {error && <div className="catalogue-empty"><p>{error}</p></div>}

          {!loading && !error && (
            <>
              <div className="catalogue-context"><p>{filter === "all" ? "The full studio edit" : categoryDescription[filter] ?? ""}</p><span>{sortedProducts.length} {sortedProducts.length === 1 ? "piece" : "pieces"}</span></div>
              <div className="product-grid">
                {sortedProducts.map((product, index) => (
                  <article className="product-card" key={product.slug} style={{ transitionDelay: `${index * 35}ms` }}>
                    <button className="product-image" onClick={() => setLocation(`/catalogue/${product.slug}`)} aria-label={`View ${product.name}`}>
                      <img src={product.image} alt={product.name} loading="lazy" decoding="async" />
                      <span className="product-category">{product.categoryLabel}</span>

                      <span className={`availability-badge availability-${product.availability.toLowerCase()}`}>Size ({product.sizes})</span>
                      <span className="product-view">View piece <ArrowUpRight size={15} /></span>
                    </button>
                    <div className="product-copy">
                      <div>{product.brand && <p className="product-brand">{product.brand}</p>}<h2>{product.name}</h2><strong>{formatRentalPrice(product.rentalPrice)} <span>/ 3 days</span></strong></div>
                      <button onClick={() => setLocation(`/catalogue/${product.slug}`)} aria-label={`View ${product.name}`}><ArrowUpRight size={19} /></button>
                    </div>
                    <button className="product-order-button" onClick={() => setLocation(`/catalogue/${product.slug}`)}>View details <ArrowUpRight size={15} /></button>
                  </article>
                ))}
              </div>
              {hasMore && (
                <div className="catalogue-load-more">
                  <p className="catalogue-load-more-count">You've viewed {rawProducts.length} out of {apiTotal} results</p>
                  <div className="catalogue-load-more-bar">
                    <span style={{ width: `${(rawProducts.length / apiTotal) * 100}%` }} />
                  </div>
                  <button onClick={loadMore} disabled={loadingMore}>
                    {loadingMore ? "Loading..." : "Load more"}
                  </button>
                </div>
              )}
              {sortedProducts.length === 0 && <div className="catalogue-empty"><Search size={22} /><h2>No pieces found</h2><p>Try adjusting your filters or return to the full edit.</p><button onClick={() => { setSearch(""); setFilter("all"); clearAllFilters(); }}>Reset catalogue</button></div>}
            </>
          )}
        </section>
      </main>
      {searchOpen && <div className="search-overlay" role="dialog" aria-modal="true" aria-label="Search the catalogue"><button className="search-dismiss" onClick={() => setSearchOpen(false)} aria-label="Close search"><X size={22} /></button><div><p className="eyebrow eyebrow-gold">Find a piece</p><label><Search size={21} /><input autoFocus value={search} onChange={e => setSearch(e.target.value)} placeholder="Search style, length, brand..." /><button onClick={() => setSearchOpen(false)}>Show results <ArrowUpRight size={16} /></button></label><p className="search-helper">Results update beneath the search panel.</p></div></div>}
    </StoreShell>
  );
}
