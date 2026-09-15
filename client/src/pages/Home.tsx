import { useMemo, useState, useEffect, useCallback, useRef } from "react";
import { motion } from "framer-motion";
import {
  ArrowDownRight,
  ArrowUpRight,
  ChevronRight,
  Heart,
  Menu,
  X,
} from "lucide-react";
import { useLocation } from "wouter";
import { formatRentalPrice, toShowcaseProduct } from "@/data/catalogue";
import { useFeaturedProducts } from "@/hooks/useProducts";

const discoveryDoors = [
  { label: "Closet cleanup that pays", image: "/images/Instruc1.webp" },
  { label: "Choose what deserves another moment", image: "/images/Instruc2.webp" },
  { label: "Send it our way", image: "/images/Instruc3.webp" },
  { label: "Your dress gets worn, you get rewarded", image: "/images/Instuc4.webp" },
  { label: "List with us", image: "/images/Instruc5.webp" },
];

export default function Home() {
  const [, setLocation] = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [doorIndex, setDoorIndex] = useState(2);
  const { products: rawFeatured, loading } = useFeaturedProducts();

  const cycleDoors = useCallback(() => {
    setDoorIndex((prev) => (prev + 1) % discoveryDoors.length);
  }, []);

  useEffect(() => {
    const id = setInterval(cycleDoors, 3000);
    return () => clearInterval(id);
  }, [cycleDoors]);

  const discoverRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    const onScroll = () => {
      const section = discoverRef.current;
      const img = imageRef.current;
      if (!section || !img) return;
      const rect = section.getBoundingClientRect();
      const scrolled = -rect.top;
      img.style.transform = `translateY(${scrolled * 0.35}px)`;
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

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
      {/* <div className="rail-service-bar">
        <span>MK Studio rental collection</span>
        <span>Choose the piece. Keep the memory.</span>
      </div>
        */}

      <header className="rail-header">
        <button className="rail-menu-trigger" onClick={() => setMenuOpen(true)} aria-label="Open main menu">
          <Menu size={20} />
        </button>
        <button className="rail-brand" onClick={() => goTo("home")}> 
          <img src="/images/mklogowhite.webp" alt="" />
        </button>
        <nav className="rail-nav" aria-label="Main navigation">
          <button onClick={() => goTo("discover")}>Shop the edit</button>
          <button onClick={() => goTo("current-edit")}>New in</button>
          <button onClick={() => goTo("rail-campaign-grid")}>How it works</button>
        </nav>
        <div className="rail-actions">
          <button className="rail-order-action" onClick={() => goTo("/contact")} aria-label="Enquire about a piece">
            Enquire
          </button>
        </div>
      </header>

      <div className={`rail-sidebar-overlay ${menuOpen ? "is-open" : ""}`} onClick={() => setMenuOpen(false)} />

      <nav className={`rail-sidebar ${menuOpen ? "is-open" : ""}`} aria-label="Mobile navigation">
        <div className="rail-sidebar-head">
          <button className="rail-brand" onClick={() => goTo("home")}>
            <img src="/images/mklogowhite.webp" alt="" />
          </button>
          <button className="rail-sidebar-close" onClick={() => setMenuOpen(false)} aria-label="Close menu">
            <X size={20} />
          </button>
        </div>
        <div className="rail-sidebar-links">
          <button onClick={() => goTo("discover")}>Shop the edit <ChevronRight size={18} /></button>
          <button onClick={() => goTo("current-edit")}>New in <ChevronRight size={18} /></button>
          <button onClick={() => goTo("rail-campaign-grid")}>How it works <ChevronRight size={18} /></button>
          <button onClick={() => goTo("/contact")}>Contact the studio <ArrowUpRight size={18} /></button>
        </div>
        <div className="rail-sidebar-footer">
          <button className="rail-order-action" onClick={() => goTo("/contact")}>Enquire</button>
        </div>
      </nav>

      <main id="home">
        <section className="rail-hero" aria-labelledby="rail-hero-heading">
          <img
            className="rail-hero-image"
            src="/images/BG1.webp"
            alt="A woman in a coral evening dress walking through a sunset-lit boutique hotel arcade"
          />
          <div className="rail-hero-shade" />
          <div className="rail-hero-copy">
            <motion.p
              className="rail-kicker"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              The Studio Edit · 01
            </motion.p>
            <motion.h1
              id="rail-hero-heading"
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.25 }}
            >
              Collect memories.<br /><em>Not clutter.</em>
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.45 }}
            >
              At MK Studio, discover a curated collection of timeless pieces available to browse entirely online making it effortless to find the one you love, while embracing a more intentional wardrobe.
            </motion.p>
            <motion.div
              className="rail-hero-actions"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.6 }}
            >
              <button className="rail-light-button" onClick={() => goTo("/catalogue")}>Shop the collection <ArrowUpRight size={16} /></button>
              <button className="rail-quiet-link" onClick={() => goTo("discover")}>Explore by moment <ArrowDownRight size={16} /></button>
            </motion.div>
          </div>
          <div className="rail-hero-meta">Curated dressing<br />for real plans</div>
        </section>

         <section id="current-edit" className="rail-current-edit" aria-labelledby="current-edit-heading">
          <motion.div
            className="rail-edit-heading"
            initial={{ opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.5 }}
          >
            <div>
              <p className="rail-kicker rail-kicker-dark">Just added to the rail</p>
              <h2 id="current-edit-heading">The current edit.</h2>
            </div>
            <button className="rail-inline-link" onClick={() => goTo("/catalogue")}>View all pieces <ArrowUpRight size={16} /></button>
          </motion.div>
          <div className="rail-product-grid">
            {!loading && currentEdit.map((piece, i) => (
              <motion.article
                className="rail-product-card"
                key={piece.slug}
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.45, delay: i * 0.1 }}
              >
                <button className="rail-product-image" onClick={() => goTo(`/catalogue/${piece.slug}`)} aria-label={`View ${piece.name}`}>
                  <img src={piece.image} alt={piece.name} loading="lazy" decoding="async" />
                  <span>{piece.categoryLabel}</span>
                  <i><Heart size={16} /></i>
                </button>
                <div className="rail-product-copy">
                  <p>{piece.brand}</p>
                  <h3>{piece.name}</h3>
                  <strong>{formatRentalPrice(piece.rentalPrice)} <small>for 3 days</small></strong>
                  <button onClick={() => goTo(`/catalogue/${piece.slug}`)}>View piece <ArrowUpRight size={15} /></button>
                </div>
              </motion.article>
            ))}
          </div>
        </section>

  

        <section id="discover" className="rail-discover" ref={discoverRef} aria-labelledby="discover-heading">
          <div className="rail-discover-backdrop" />
          <img
            ref={imageRef}
            className="rail-discover-image"
            src="/images/BG3.webp"
            alt="A woman in a coral evening dress walking through a sunset-lit boutique hotel arcade"
          />
          <div className="rail-discover-content">
            <p className="rail-kicker">MK Studio · The Edit</p>
            <h2 id="discover-heading">Dress for the<br /><em>occasion.</em></h2>
            <p className="rail-discover-sub">Collection</p>
            <button className="rail-light-button" onClick={() => goTo("/catalogue")}>Discover our catalogue <ArrowUpRight size={16} /></button>
          </div>
        </section>

        <section id="why-us" className="why-us" aria-labelledby="why-us-heading">
          <p className="why-us-kicker">Why MK Studio</p>
          <div className="why-us-grid">
            <article className="why-us-card">
              <span className="why-us-number">01</span>
              <h3>Curated, not cluttered</h3>
              <p>Every piece is selected for quality, versatility, and presence — so you never scroll through noise to find what fits.</p>
            </article>
            <article className="why-us-card">
              <span className="why-us-number">02</span>
              <h3>Wear once, return clean</h3>
              <p>No dry-cleaning, no storage. Wear it well, bring it back, and keep your wardrobe light.</p>
            </article>
            <article className="why-us-card">
              <span className="why-us-number">03</span>
              <h3>Real styling support</h3>
              <p>Need a look built around one piece? We'll pull options and help you narrow down — no guesswork required.</p>
            </article>
            <article className="why-us-card">
              <span className="why-us-number">04</span>
              <h3>Designed for real moments</h3>
              <p>From rooftop dinners to black-tie affairs — pieces that match the occasion and the energy you want to bring.</p>
            </article>
          </div>
        </section>

        <section id="rail-campaign-grid" className="rail-campaign-grid" aria-label="MK Studio highlights">
          <article className="rail-campaign rail-campaign-amber">
            <div>
              <p className="rail-kicker rail-kicker-dark">The studio calendar</p>
              <h2>Plans change.<br /><em>Your wardrobe can too.</em></h2>
              <p>Keep the good parts of getting ready. Leave the one-wear question behind.</p>
              <button className="rail-inline-link" onClick={() => goTo("/how-rental-works")}>How the rental works <ArrowUpRight size={16} /></button>
            </div>
            <span className="rail-arch rail-arch-large" aria-hidden="true" />
          </article>
          <article className="rail-campaign rail-campaign-image">
            <img src="/images/mkherosec.webp" alt="Jewel-tone occasion dresses from the MK Studio wardrobe" loading="lazy" decoding="async" />
            <div>
              <p className="rail-kicker">From the rail</p>
              <h2>List.<br /><em>With us.</em></h2>
              <button className="rail-light-button" onClick={() => goTo("/list-with-us")}>How it works <ArrowUpRight size={16} /></button>
            </div>
          </article>
        </section>

        <section className="rail-social" aria-label="Follow us">
          <div className="rail-social-inner">
            <p className="rail-kicker rail-kicker-dark">Stay connected</p>
            <h2>Follow us<br /><em>on social.</em></h2>
            <p className="rail-social-sub">Join the MK Studio community. New drops, styling inspiration, and behind-the-scenes moments.</p>
            <div className="rail-social-links">
              <a href="https://www.facebook.com/MKStudioCollective/?ref=NONE_xav_ig_profile_page_web#" target="_blank" rel="noopener noreferrer" className="rail-social-card">
                <svg viewBox="0 0 24 24" fill="currentColor" width="28" height="28"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                <span>Facebook</span>
              </a>
              <a href="https://www.instagram.com/mkstudiocollective/" target="_blank" rel="noopener noreferrer" className="rail-social-card">
                <svg viewBox="0 0 24 24" fill="currentColor" width="28" height="28"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>
                <span>Instagram</span>
              </a>
            </div>
          </div>
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
