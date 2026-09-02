import { ArrowUpRight, Search, SlidersHorizontal, X } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { useLocation } from "wouter";
import { StoreShell } from "@/components/StoreShell";
import { categoryMeta, formatRentalPrice, ProductCategory, showcaseProducts } from "@/data/catalogue";


type Filter = "all" | ProductCategory;


export default function Catalogue() {
  const [, setLocation] = useLocation();

  const [filter, setFilter] = useState<Filter>("all");
  const [searchOpen, setSearchOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<"newest" | "az" | "price-low">("newest");

  const products = useMemo(() => {
    const text = search.trim().toLowerCase();
    const filtered = showcaseProducts.filter(product =>
      (filter === "all" || product.category === filter) &&
      (!text || `${product.name} ${product.categoryLabel} ${product.color} ${product.fabric}`.toLowerCase().includes(text)),
    );
    if (sort === "az") return [...filtered].sort((a, b) => a.name.localeCompare(b.name));
    if (sort === "price-low") return [...filtered].sort((a, b) => a.rentalPrice - b.rentalPrice);
    return filtered;
  }, [filter, search, sort]);



  return (
    <StoreShell current="catalogue" onSearch={() => setSearchOpen(true)}>
      <main className="catalogue-page">
        <section className="catalogue-hero">
          <p className="eyebrow">The MK Studio catalogue</p>
          <h1>Pieces with a<br /><em>next destination.</em></h1>
          <p>Browse our curated rental collection. Each piece is selected for its quality and timeless appeal. Contact the studio to check availability for your dates.</p>
          <button className="catalogue-order-link" onClick={() => setLocation("/contact")}>Enquire about a piece <ArrowUpRight size={15} /></button>
        </section>

        <section className="catalogue-content" aria-label="Catalogue products">
          <div className="catalogue-toolbar">
            <div className="filter-list" role="group" aria-label="Filter catalogue">
              <button className={filter === "all" ? "is-active" : ""} onClick={() => setFilter("all")}>All looks <span>{showcaseProducts.length}</span></button>
              {(Object.keys(categoryMeta) as ProductCategory[]).map(key => (
                <button className={filter === key ? "is-active" : ""} onClick={() => setFilter(key)} key={key}>{categoryMeta[key].label}</button>
              ))}
            </div>
            <label className="sort-control"><SlidersHorizontal size={15} /><span>Sort</span><select value={sort} onChange={e => setSort(e.target.value as "newest" | "az" | "price-low")}><option value="newest">Featured</option><option value="az">A–Z</option><option value="price-low">Price: low to high</option></select></label>
          </div>

          <div className="catalogue-context"><p>{filter === "all" ? "The full studio edit" : categoryMeta[filter].short}</p><span>{products.length} {products.length === 1 ? "piece" : "pieces"}</span></div>
          <div className="product-grid">
            {products.map((product, index) => (
              <article className="product-card" key={product.slug} style={{ transitionDelay: `${index * 35}ms` }}>
                <button className="product-image" onClick={() => setLocation(`/catalogue/${product.slug}`)} aria-label={`View ${product.name}`}>
                  <img src={product.image} alt={product.name} />
                  <span className="product-category">{product.categoryLabel}</span>
                  <span className={`availability-badge availability-${product.availability.toLowerCase()}`}>{product.availability}</span>
                  <span className="product-view">View piece <ArrowUpRight size={15} /></span>
                </button>
                <div className="product-copy">
                  <div><p>{product.color}</p><h2>{product.name}</h2><strong>{formatRentalPrice(product.rentalPrice)} <span>/ 3 days</span></strong></div>
                  <button onClick={() => setLocation(`/catalogue/${product.slug}`)} aria-label={`View ${product.name}`}><ArrowUpRight size={19} /></button>
                </div>
                <button className="product-order-button" onClick={() => setLocation(`/catalogue/${product.slug}`)}>View details <ArrowUpRight size={15} /></button>
              </article>
            ))}
          </div>
          {products.length === 0 && <div className="catalogue-empty"><Search size={22} /><h2>No pieces found</h2><p>Try a different search phrase or return to the full edit.</p><button onClick={() => { setSearch(""); setFilter("all"); }}>Reset catalogue</button></div>}
        </section>
      </main>
      {searchOpen && <div className="search-overlay" role="dialog" aria-modal="true" aria-label="Search the catalogue"><button className="search-dismiss" onClick={() => setSearchOpen(false)} aria-label="Close search"><X size={22} /></button><div><p className="eyebrow eyebrow-gold">Find a piece</p><label><Search size={21} /><input autoFocus value={search} onChange={e => setSearch(e.target.value)} placeholder="Search style, colour, fabric..." /><button onClick={() => setSearchOpen(false)}>Show results <ArrowUpRight size={16} /></button></label><p className="search-helper">Results update beneath the search panel.</p></div></div>}
    </StoreShell>
  );
}
