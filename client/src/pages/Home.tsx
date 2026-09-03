import { useMemo, useState } from "react";
import {
  ArrowDownRight,
  ArrowUpRight,
  ChevronRight,
  Heart,
  Menu,
  Search,
  ShoppingBag,
  X,
} from "lucide-react";
import { useLocation } from "wouter";
import { formatRentalPrice, toShowcaseProduct } from "@/data/catalogue";
import { useFeaturedProducts } from "@/hooks/useProducts";

const discoveryDoors = [
  {
    label: "The wedding edit",
    detail: "For the invitation with a little more expectation.",
    image: "/images/my-studio-wedding_fb88aaa2.jpg",
  },
  {
    label: "After dark",
    detail: "The pieces that know how to stay out late.",
    image: "/images/my-studio-date-night_9391da5f.jpg",
  },
  {
    label: "Studio days",
    detail: "Polish for the plan that becomes the evening.",
    image: "/images/my-studio-workwear_671a35a4.jpg",
  },
];

export default function Home() {
  const [, setLocation] = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const { products: rawFeatured, loading } = useFeaturedProducts();

  const currentEdit = useMemo(
    () => rawFeatured.map(toShowcaseProduct).slice(0, 4),
    [rawFeatured],
  );

  const goTo = (destination: string) => {
    if (destination.startsWith("/")) {
      setLocation(destination);
      setMenuOpen(false);
      return;
    }
    document.getElementById(destination)?.scrollIntoView({ behavior: "smooth", block: "start" });
    setMenuOpen(false);
  };

  return (
    <div className="rail-home">
      <div className="rail-service-bar">
        <span>MK Studio rental collection</span>
        <span>Choose the piece. Keep the memory.</span>
      </div>

      <header className="rail-header">
        <button className="rail-menu-trigger" onClick={() => setMenuOpen((open) => !open)} aria-label="Toggle main menu">
          {menuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
        <button className="rail-brand" onClick={() => goTo("home")}> 
          <img src="/images/my-studio-mark_4967063e.png" alt="" />
          <span>MK Studio</span>
        </button>
        <nav className="rail-nav" aria-label="Main navigation">
          <button onClick={() => goTo("discover")}>Shop the edit</button>
          <button onClick={() => goTo("current-edit")}>New in</button>
          <button onClick={() => goTo("rental-ritual")}>How it works</button>
        </nav>
        <div className="rail-actions">
          <button onClick={() => goTo("current-edit")} aria-label="Search the edit"><Search size={18} /></button>
          <button className="rail-order-action" onClick={() => goTo("/order")} aria-label="View rental order">
            <ShoppingBag size={18} /> <span>Order</span><i>0</i>
          </button>
        </div>
      </header>

      {menuOpen && (
        <nav className="rail-mobile-menu" aria-label="Mobile navigation">
          <button onClick={() => goTo("discover")}>Shop the edit <ChevronRight size={18} /></button>
          <button onClick={() => goTo("current-edit")}>New in <ChevronRight size={18} /></button>
          <button onClick={() => goTo("rental-ritual")}>How it works <ChevronRight size={18} /></button>
          <button onClick={() => goTo("/contact")}>Contact the studio <ArrowUpRight size={18} /></button>
        </nav>
      )}

      <main id="home">
        <section className="rail-hero" aria-labelledby="rail-hero-heading">
          <img
            className="rail-hero-image"
            src="/images/mk-studio-collection-hero_e6c20280.jpg"
            alt="A woman in a coral evening dress walking through a sunset-lit boutique hotel arcade"
          />
          <div className="rail-hero-shade" />
          <div className="rail-hero-copy">
            <p className="rail-kicker">The Studio Edit · 01</p>
            <h1 id="rail-hero-heading">Collect memories.<br /><em>Not clutter.</em></h1>
            <p>For every invitation, sudden plan, and no-repeat mood. Explore an evolving wardrobe of pieces with somewhere to be.</p>
            <div className="rail-hero-actions">
              <button className="rail-light-button" onClick={() => goTo("/catalogue")}>Shop the collection <ArrowUpRight size={16} /></button>
              <button className="rail-quiet-link" onClick={() => goTo("discover")}>Explore by moment <ArrowDownRight size={16} /></button>
            </div>
          </div>
          <div className="rail-hero-meta">Curated dressing<br />for real plans</div>
        </section>

        <section id="discover" className="rail-discover" aria-labelledby="discover-heading">
          <div className="rail-section-intro">
            <div>
              <p className="rail-kicker rail-kicker-dark">Browse by mood</p>
              <h2 id="discover-heading">The right<br /><em>kind of plan.</em></h2>
            </div>
            <p>Start with the mood, then find the piece that finishes the story.</p>
          </div>
          <div className="rail-door-grid">
            {discoveryDoors.map((door, index) => (
              <button className="rail-door" key={door.label} onClick={() => goTo("/catalogue")}>
                <img src={door.image} alt="" />
                <span className="rail-door-number">0{index + 1}</span>
                <span className="rail-door-overlay" />
                <span className="rail-door-copy">
                  <small>{door.detail}</small>
                  <strong>{door.label}</strong>
                  <i>Explore <ArrowUpRight size={15} /></i>
                </span>
              </button>
            ))}
          </div>
        </section>

        <section id="current-edit" className="rail-current-edit" aria-labelledby="current-edit-heading">
          <div className="rail-edit-heading">
            <div>
              <p className="rail-kicker rail-kicker-dark">Just added to the rail</p>
              <h2 id="current-edit-heading">The current edit.</h2>
            </div>
            <button className="rail-inline-link" onClick={() => goTo("/catalogue")}>View all pieces <ArrowUpRight size={16} /></button>
          </div>
          <div className="rail-product-grid">
            {!loading && currentEdit.map((piece) => (
              <article className="rail-product-card" key={piece.slug}>
                <button className="rail-product-image" onClick={() => goTo(`/catalogue/${piece.slug}`)} aria-label={`View ${piece.name}`}>
                  <img src={piece.image} alt={piece.name} />
                  <span>{piece.categoryLabel}</span>
                  <i><Heart size={16} /></i>
                </button>
                <div className="rail-product-copy">
                  <p>{piece.color}</p>
                  <h3>{piece.name}</h3>
                  <strong>{formatRentalPrice(piece.rentalPrice)} <small>for 3 days</small></strong>
                  <button onClick={() => goTo(`/catalogue/${piece.slug}`)}>View piece <ArrowUpRight size={15} /></button>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="rail-campaign-grid" aria-label="MK Studio highlights">
          <article className="rail-campaign rail-campaign-amber">
            <div>
              <p className="rail-kicker rail-kicker-dark">The studio calendar</p>
              <h2>Plans change.<br /><em>Your wardrobe can too.</em></h2>
              <p>Keep the good parts of getting ready. Leave the one-wear question behind.</p>
              <button className="rail-inline-link" onClick={() => goTo("rental-ritual")}>How the rental works <ArrowUpRight size={16} /></button>
            </div>
            <span className="rail-arch rail-arch-large" aria-hidden="true" />
          </article>
          <article className="rail-campaign rail-campaign-image">
            <img src="/images/mk-studio-hero-clean_48a115fb.png" alt="Jewel-tone occasion dresses from the MK Studio wardrobe" />
            <div>
              <p className="rail-kicker">From the rail</p>
              <h2>One piece.<br /><em>More stories.</em></h2>
              <button className="rail-light-button" onClick={() => goTo("/contact")}>Talk to the studio <ArrowUpRight size={16} /></button>
            </div>
          </article>
        </section>

        <section id="rental-ritual" className="rail-ritual" aria-labelledby="rail-ritual-heading">
          <div className="rail-ritual-top">
            <p className="rail-kicker">The rental ritual</p>
            <h2 id="rail-ritual-heading">Less owning.<br /><em>More arriving.</em></h2>
          </div>
          <div className="rail-steps">
            <article><span>01</span><h3>Choose a mood</h3><p>Start with the plan in front of you, not a full wardrobe to sort through.</p></article>
            <article><span>02</span><h3>Reserve the piece</h3><p>Build a rental preview and select the details that feel right for you.</p></article>
            <article><span>03</span><h3>Make it yours</h3><p>Wear it well, return it when ready, and leave room for the next version of the plan.</p></article>
          </div>
          <button className="rail-light-button" onClick={() => goTo("/catalogue")}>Start with the edit <ArrowUpRight size={16} /></button>
        </section>
      </main>

      <footer className="rail-footer">
        <div><span>MK Studio</span><p>For every RSVP, reset, and reason to dress differently.</p></div>
        <nav><button onClick={() => goTo("/catalogue")}>Catalogue</button><button onClick={() => goTo("/about")}>Our story</button><button onClick={() => goTo("/contact")}>Contact</button></nav>
        <p>© 2026 MK Studio</p>
      </footer>
    </div>
  );
}
