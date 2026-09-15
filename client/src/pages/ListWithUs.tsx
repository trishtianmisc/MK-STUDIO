import { ArrowUpRight } from "lucide-react";
import { useLocation } from "wouter";
import { StoreShell } from "@/components/StoreShell";
import { useEffect, useRef } from "react";

function useScrollReveal() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.classList.add("is-visible");
          observer.unobserve(el);
        }
      },
      { threshold: 0.15 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);
  return ref;
}

function RevealBlock({ children, className = "", delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  const ref = useScrollReveal();
  return (
    <div ref={ref} className={`reveal-block ${className}`} style={{ transitionDelay: `${delay}ms` }}>
      {children}
    </div>
  );
}

export default function ListWithUs() {
  const [, setLocation] = useLocation();
  return (
    <StoreShell current="list-with-us">
      <main className="lwu-page">

        {/* ── Hero ── */}
        

        {/* ── Benefits ── */}
        <section className="lwu-benefits">
          <RevealBlock>
            <p className="lwu-benefits-eyebrow">Why list with us</p>
          </RevealBlock>
          <RevealBlock delay={80}>
            <h2>We make your<br /><em>wardrobe work harder.</em></h2>
          </RevealBlock>
          <div className="lwu-benefits-grid">
            {[
              {
                num: "01",
                title: "Earn from your wardrobe",
                body: "Turn unused occasion wear into income. You set the rental price and we handle everything else.",
              },
              {
                num: "02",
                title: "Fully managed",
                body: "From cleaning to customer queries, we manage the full rental experience so you don't have to.",
              },
              {
                num: "03",
                title: "Protected at every step",
                body: "Every piece is insured during rental periods. Minor wear and tear is covered — your dress stays safe.",
              },
            ].map((b, i) => (
              <RevealBlock key={b.num} delay={i * 100}>
                <article className="lwu-benefit">
                  <span className="lwu-benefit-num">{b.num}</span>
                  <div className="lwu-benefit-rule" />
                  <h3>{b.title}</h3>
                  <p>{b.body}</p>
                </article>
              </RevealBlock>
            ))}
          </div>
        </section>

        {/* ── How it works ── */}
        <section className="lwu-steps">
          <RevealBlock>
            <div className="lwu-steps-header">
              <p className="lwu-steps-eyebrow">The process</p>
              <h2>How listing<br /><em>works.</em></h2>
              <p className="lwu-steps-lead">
                Three simple steps from wardrobe to earning. We handle the
                heavy lifting — you just approve and collect.
              </p>
            </div>
          </RevealBlock>
          <div className="lwu-steps-grid">
            {[
              {
                num: "01",
                title: "Submit your piece",
                body: "Send us a message with photos and details about your dress. We'll get back to you within 48 hours.",
              },
              {
                num: "02",
                title: "We review & shoot",
                body: "Our team assesses quality and style fit. Approved pieces are professionally shot for the catalogue.",
              },
              {
                num: "03",
                title: "You earn",
                body: "Every time your dress is rented, you receive your share. Track everything from your personal dashboard.",
              },
            ].map((s, i) => (
              <RevealBlock key={s.num} delay={i * 120}>
                <article className="lwu-step">
                  <span className="lwu-step-num">{s.num}</span>
                  <div className="lwu-step-rule" />
                  <h3>{s.title}</h3>
                  <p>{s.body}</p>
                </article>
              </RevealBlock>
            ))}
          </div>
        </section>

        {/* ── Visual strip ── */}
        <section className="lwu-visual">
          <RevealBlock>
            <div className="lwu-visual-inner">
              <div className="lwu-visual-img">
                <img src="/images/dress-studio-02_f044b274.webp" alt="MK Studio curated collection" loading="lazy" decoding="async" />
              </div>
              <div className="lwu-visual-copy">
                <p className="lwu-visual-eyebrow">Your piece, our platform</p>
                <h2>Featured in the<br /><em>MK Studio catalogue.</em></h2>
                <p>
                  Every listed piece gets professional photography, a dedicated
                  product page, and exposure to our growing community of renters
                  looking for something special.
                </p>
              </div>
            </div>
          </RevealBlock>
        </section>

        {/* ── CTA ── */}
        <section className="lwu-cta">
          <RevealBlock>
            <div className="lwu-cta-inner">
              <p>Ready to list your piece?</p>
              <div className="lwu-cta-actions">
                <a href="https://www.facebook.com/MKStudioCollective/" target="_blank" rel="noopener noreferrer" className="editorial-button editorial-button-light">
                  Facebook <ArrowUpRight size={15} />
                </a>
                <a href="https://www.instagram.com/mkstudiocollective/" target="_blank" rel="noopener noreferrer" className="editorial-button editorial-button-light">
                  Instagram <ArrowUpRight size={15} />
                </a>
              </div>
            </div>
          </RevealBlock>
        </section>

        {/* ── Secondary CTA ── */}
        <section className="lwu-secondary-cta">
          <RevealBlock>
            <div className="lwu-secondary-inner">
              <p>Not ready yet?</p>
              <button className="editorial-button editorial-button-dark" onClick={() => setLocation("/catalogue")}>
                Browse the catalogue <ArrowUpRight size={15} />
              </button>
            </div>
          </RevealBlock>
        </section>

      </main>
    </StoreShell>
  );
}
