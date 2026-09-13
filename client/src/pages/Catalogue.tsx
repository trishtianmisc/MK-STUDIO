import { ArrowUpRight, Search, SlidersHorizontal, X, ChevronDown } from "lucide-react";
import { useMemo, useState, useEffect, useCallback, useRef } from "react";
import { useLocation } from "wouter";
import { StoreShell } from "@/components/StoreShell";
import { formatRentalPrice, toShowcaseProduct } from "@/data/catalogue";
import { useProducts } from "@/hooks/useProducts";
import { useCategories } from "@/hooks/useCategories";

const PAGE_SIZE = 20;

type Filter = "all" | string;

export default function Catalogue() {
  const [, setLocation] = useLocation();
  const { products: rawProducts, loading, error } = useProducts();
  const { categories } = useCategories();
  const filterRef = useRef<HTMLDivElement>(null);

  const allProducts = useMemo(
    () => rawProducts.map(toShowcaseProduct),
    [rawProducts],
  );

  const sortedCategories = useMemo(
    () => [...categories].sort((a, b) => a.sort_order - b.sort_order),
    [categories],
  );

  const [filter, setFilter] = useState<Filter>("all");
  const [searchOpen, setSearchOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<"newest" | "az" | "price-low">("newest");
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [loadingMore, setLoadingMore] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [selectedStyles, setSelectedStyles] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState<{ min: number; max: number }>({ min: 0, max: 10000 });
  const [showAllSizes, setShowAllSizes] = useState(false);
  const [showAllStyles, setShowAllStyles] = useState(false);

  const FILTER_LIMIT = 6;

  const allSizes = useMemo(() => {
    const sizes = new Set<string>();
    for (const p of allProducts) {
      for (const s of p.sizes) sizes.add(s);
    }
    return Array.from(sizes).sort();
  }, [allProducts]);

  const allStyles = useMemo(() => {
    const styles = new Set<string>();
    for (const p of allProducts) {
      if (p.style) styles.add(p.style);
    }
    return Array.from(styles).sort();
  }, [allProducts]);

  const priceBounds = useMemo(() => {
    if (allProducts.length === 0) return { min: 0, max: 10000 };
    const prices = allProducts.map(p => p.rentalPrice);
    return { min: 0, max: Math.ceil(Math.max(...prices) / 1000) * 1000 };
  }, [allProducts]);

  const filteredProducts = useMemo(() => {
    const text = search.trim().toLowerCase();
    return allProducts.filter((product) =>
      (filter === "all" || product.category === filter) &&
      (!text || `${product.name} ${product.categoryLabel} ${product.style} ${product.length} ${product.brand}`.toLowerCase().includes(text)) &&
      (selectedSizes.length === 0 || product.sizes.some(s => selectedSizes.includes(s))) &&
      (selectedStyles.length === 0 || selectedStyles.includes(product.style)) &&
      product.rentalPrice >= priceRange.min && product.rentalPrice <= priceRange.max
    );
  }, [allProducts, filter, search, selectedSizes, selectedStyles, priceRange]);

  const sortedProducts = useMemo(() => {
    if (sort === "az") return [...filteredProducts].sort((a, b) => a.name.localeCompare(b.name));
    if (sort === "price-low") return [...filteredProducts].sort((a, b) => a.rentalPrice - b.rentalPrice);
    return filteredProducts;
  }, [filteredProducts, sort]);

  const categoryTotals = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const product of allProducts) {
      counts[product.category] = (counts[product.category] || 0) + 1;
    }
    return counts;
  }, [allProducts]);

  const categoryDescription = useMemo(() => {
    const map: Record<string, string> = {};
    for (const cat of categories) {
      if (cat.description) map[cat.slug] = cat.description;
    }
    return map;
  }, [categories]);

  const displayedProducts = useMemo(
    () => sortedProducts.slice(0, visibleCount),
    [sortedProducts, visibleCount],
  );

  const hasMore = visibleCount < sortedProducts.length;
  const filteredTotal = sortedProducts.length;
  const activeFilterCount = selectedSizes.length + selectedStyles.length + (priceRange.min > priceBounds.min || priceRange.max < priceBounds.max ? 1 : 0);

  useEffect(() => {
    setVisibleCount(PAGE_SIZE);
  }, [filter, search, sort, selectedSizes, selectedStyles, priceRange]);

  useEffect(() => {
    setPriceRange(priceBounds);
  }, [priceBounds]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (filterRef.current && !filterRef.current.contains(e.target as Node)) {
        setFilterOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const loadMore = useCallback(() => {
    if (loadingMore) return;
    setLoadingMore(true);
    setTimeout(() => {
      setVisibleCount(prev => prev + PAGE_SIZE);
      setLoadingMore(false);
    }, 300);
  }, [loadingMore]);

  const toggleSize = (size: string) => {
    setSelectedSizes(prev => prev.includes(size) ? prev.filter(s => s !== size) : [...prev, size]);
  };

  const toggleStyle = (style: string) => {
    setSelectedStyles(prev => prev.includes(style) ? prev.filter(s => s !== style) : [...prev, style]);
  };

  const clearFilters = () => {
    setSelectedSizes([]);
    setSelectedStyles([]);
    setPriceRange(priceBounds);
  };

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
              <button className={filter === "all" ? "is-active" : ""} onClick={() => setFilter("all")}>All looks <span>{allProducts.length}</span></button>
              {sortedCategories.map((cat) => (
                <button className={filter === cat.slug ? "is-active" : ""} onClick={() => setFilter(cat.slug)} key={cat.slug}>{cat.name} <span>{categoryTotals[cat.slug] || 0}</span></button>
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
                    {allSizes.length > 0 && (
                      <div className="catalogue-filter-section">
                        <span className="catalogue-filter-heading">Size</span>
                        <div className={`catalogue-filter-list ${showAllSizes ? "is-expanded" : ""}`}>
                          {(showAllSizes ? allSizes : allSizes.slice(0, FILTER_LIMIT)).map(size => (
                            <button key={size} className={`catalogue-filter-option ${selectedSizes.includes(size) ? "is-active" : ""}`} onClick={() => toggleSize(size)}>{size}</button>
                          ))}
                        </div>
                        {allSizes.length > FILTER_LIMIT && (
                          <button className="catalogue-filter-more" onClick={() => setShowAllSizes(!showAllSizes)}>{showAllSizes ? "Show less" : `See all (${allSizes.length})`}</button>
                        )}
                      </div>
                    )}
                    {allStyles.length > 0 && (
                      <div className="catalogue-filter-section">
                        <span className="catalogue-filter-heading">Style</span>
                        <div className={`catalogue-filter-list ${showAllStyles ? "is-expanded" : ""}`}>
                          {(showAllStyles ? allStyles : allStyles.slice(0, FILTER_LIMIT)).map(style => (
                            <button key={style} className={`catalogue-filter-option ${selectedStyles.includes(style) ? "is-active" : ""}`} onClick={() => toggleStyle(style)}>{style}</button>
                          ))}
                        </div>
                        {allStyles.length > FILTER_LIMIT && (
                          <button className="catalogue-filter-more" onClick={() => setShowAllStyles(!showAllStyles)}>{showAllStyles ? "Show less" : `See all (${allStyles.length})`}</button>
                        )}
                      </div>
                    )}
                    <div className="catalogue-filter-section">
                      <span className="catalogue-filter-heading">Price</span>
                      <div className="catalogue-filter-price">
                        <input type="number" value={priceRange.min} onChange={e => setPriceRange({ ...priceRange, min: Number(e.target.value) })} placeholder="Min" />
                        <span>–</span>
                        <input type="number" value={priceRange.max} onChange={e => setPriceRange({ ...priceRange, max: Number(e.target.value) })} placeholder="Max" />
                      </div>
                    </div>
                    {activeFilterCount > 0 && (
                      <button className="catalogue-filter-clear" onClick={clearFilters}>Clear all</button>
                    )}
                  </div>
                )}
              </div>
              <label className="sort-control"><span>Sort</span><select value={sort} onChange={e => setSort(e.target.value as "newest" | "az" | "price-low")}><option value="newest">Featured</option><option value="az">A–Z</option><option value="price-low">Price: low to high</option></select></label>
            </div>
          </div>

          {loading && <div className="catalogue-empty"><p>Loading catalogue...</p></div>}
          {error && <div className="catalogue-empty"><p>{error}</p></div>}

          {!loading && !error && (
            <>
              <div className="catalogue-context"><p>{filter === "all" ? "The full studio edit" : categoryDescription[filter] ?? ""}</p><span>{displayedProducts.length} of {filteredTotal} {filteredTotal === 1 ? "piece" : "pieces"}</span></div>
              <div className="product-grid">
                {displayedProducts.map((product, index) => (
                  <article className="product-card" key={product.slug} style={{ transitionDelay: `${index * 35}ms` }}>
                    <button className="product-image" onClick={() => setLocation(`/catalogue/${product.slug}`)} aria-label={`View ${product.name}`}>
                      <img src={product.image} alt={product.name} loading="lazy" decoding="async" />
                      <span className="product-category">{product.categoryLabel}</span>
                      <span className={`availability-badge availability-${product.availability.toLowerCase()}`}>{product.availability}</span>
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
                  <p className="catalogue-load-more-count">You've viewed {displayedProducts.length} out of {filteredTotal} results</p>
                  <div className="catalogue-load-more-bar">
                    <span style={{ width: `${(displayedProducts.length / filteredTotal) * 100}%` }} />
                  </div>
                  <button onClick={loadMore} disabled={loadingMore}>
                    {loadingMore ? "Loading..." : "Load more"}
                  </button>
                </div>
              )}
              {sortedProducts.length === 0 && <div className="catalogue-empty"><Search size={22} /><h2>No pieces found</h2><p>Try adjusting your filters or return to the full edit.</p><button onClick={() => { setSearch(""); setFilter("all"); clearFilters(); }}>Reset catalogue</button></div>}
            </>
          )}
        </section>
      </main>
      {searchOpen && <div className="search-overlay" role="dialog" aria-modal="true" aria-label="Search the catalogue"><button className="search-dismiss" onClick={() => setSearchOpen(false)} aria-label="Close search"><X size={22} /></button><div><p className="eyebrow eyebrow-gold">Find a piece</p><label><Search size={21} /><input autoFocus value={search} onChange={e => setSearch(e.target.value)} placeholder="Search style, length, brand..." /><button onClick={() => setSearchOpen(false)}>Show results <ArrowUpRight size={16} /></button></label><p className="search-helper">Results update beneath the search panel.</p></div></div>}
    </StoreShell>
  );
}
