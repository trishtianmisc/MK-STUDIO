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

export default function HowRentalWorks() {
  const [, setLocation] = useLocation();
  return (
    <StoreShell current="how-rental-works">
      <main className="hrw-page">

        {/* ── Hero ── */}
        

        {/* ── Editorial statement ── */}
        <section className="hrw-statement">
          <RevealBlock>
            <p className="hrw-statement-eyebrow">A simpler way to dress well</p>
          </RevealBlock>
          <RevealBlock delay={80}>
            <h2>Four steps to your<br /><em>next statement piece.</em></h2>
          </RevealBlock>
          <RevealBlock delay={160}>
            <p className="hrw-statement-lead">
              We believe getting dressed for an occasion should feel exciting, not
              overwhelming. Our rental process is designed to be effortless from
              the first browse to the final fitting.
            </p>
          </RevealBlock>
        </section>

        {/* ── Steps ── */}
        <section className="hrw-steps">
          {[
            {
              num: "01",
              title: "Browse the catalogue",
              body: "Explore our curated edit of occasion-ready pieces. Filter by style, length, or moment to find what speaks to you.",
            },
            {
              num: "02",
              title: "Screenshot your pick",
              body: "Found the one? Take a screenshot of the piece you love — we'll need it to identify the exact dress.",
            },
            {
              num: "03",
              title: "Send us a message",
              body: "Head to our Facebook or Instagram, send us the screenshot along with your event dates and any details we should know.",
            },
            {
              num: "04",
              title: "We handle the rest",
              body: "We'll confirm availability, arrange pickup or delivery, and make sure your piece is ready for the big day.",
            },
          ].map((step, i) => (
            <RevealBlock key={step.num} delay={i * 100}>
              <article className="hrw-step">
                <span className="hrw-step-num">{step.num}</span>
                <div className="hrw-step-rule" />
                <h3>{step.title}</h3>
                <p>{step.body}</p>
              </article>
            </RevealBlock>
          ))}
        </section>

        {/* ── Image strip ── */}
        <section className="hrw-strip">
          <RevealBlock>
            <div className="hrw-strip-inner">
              <div className="hrw-strip-img">
                <img src="/images/MKBrown.png" alt="MK Studio collection" loading="lazy" decoding="async" />
              </div>
              <div className="hrw-strip-copy">
                <p className="hrw-strip-eyebrow">Get in touch</p>
                <h2>Message us.</h2>
                <p>
                  Send a screenshot of your chosen piece, your event date, and any
                  styling preferences. We'll get back to you within 24 hours to
                  confirm everything.
                </p>
                <div className="hrw-strip-actions">
                  <a href="https://www.facebook.com/MKStudioCollective/" target="_blank" rel="noopener noreferrer" className="editorial-button editorial-button-dark">
                    Facebook <ArrowUpRight size={15} />
                  </a>
                  <a href="https://www.instagram.com/mkstudiocollective/" target="_blank" rel="noopener noreferrer" className="editorial-button editorial-button-dark">
                    Instagram <ArrowUpRight size={15} />
                  </a>
                </div>
              </div>
            </div>
          </RevealBlock>
        </section>

        {/* ── CTA ── */}
        <section className="hrw-cta">
          <RevealBlock>
            <div className="hrw-cta-inner">
              <p>Ready to find your piece?</p>
              <button className="editorial-button editorial-button-light" onClick={() => setLocation("/catalogue")}>
                Browse the catalogue <ArrowUpRight size={15} />
              </button>
            </div>
          </RevealBlock>
        </section>

      </main>
    </StoreShell>
  );
}
