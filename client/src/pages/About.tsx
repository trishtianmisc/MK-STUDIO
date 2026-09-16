import { useEffect, useRef } from "react";
import { ArrowUpRight } from "lucide-react";
import { useLocation } from "wouter";
import { StoreShell } from "@/components/StoreShell";

function useReveal(threshold = 0.15) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { el.classList.add("is-revealed"); obs.unobserve(el); } },
      { threshold }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
  return ref;
}

function Reveal({ children, className = "", delay }: {
  children: React.ReactNode; className?: string; delay?: number;
}) {
  const ref = useReveal();
  return <div ref={ref} className={`os-reveal ${className}`} style={delay ? { transitionDelay: `${delay}ms` } : undefined}>{children}</div>;
}

export default function About() {
  const [, setLocation] = useLocation();

  return (
    <StoreShell current="about">
      <main className="os-page">

        <section className="os-opening">
          <div className="os-opening-bg">
            <img src="/images/StoryBG1.webp" alt="MK Studio wardrobe" loading="eager" decoding="async" />
            <div className="os-opening-vignette" />
          </div>
          <Reveal className="os-opening-content">
            <h2>Wear More,<br /><em>Own Less.</em></h2>
          </Reveal>
        </section>

        <section className="os-intro">
          <Reveal className="os-intro-inner">
            <div className="os-intro-logo">
              <img src="/images/mklogo.webp" alt="MK Studio" />
            </div>
            <div className="os-intro-copy">
              <p className="os-intro-eyebrow">Founded by TWO SISTERS</p>
              <p>MK Studio Collective began with a simple thought: why should beautiful pieces be worn once, only to spend the rest of their lives sitting in a closet?</p>
              <p>We created a shared closet where pieces can be worn, loved, and lived in again — making beautiful fashion more accessible without the need to constantly own more.</p>
              <p>Some pieces are ours. Some are shared by people in our collective. Together, they become a wardrobe made for birthdays, weddings, dinners, vacations, and all the moments worth dressing up for.</p>
              <p>It&rsquo;s circular fashion made simple: wear what you love, share what you own, and give every piece more life. &#9825;</p>
            </div>
          </Reveal>
        </section>

        <section className="os-quote">
          <Reveal className="os-quote-inner">
            <blockquote>            <span className="os-quote-mark">&ldquo; </span>
 We don&rsquo;t rent dresses. We return them to the world.<span className="os-quote-mark2">&rdquo;</span>
</blockquote> 
            
          </Reveal>
        </section>

        

        
        <section className="os-studio">
          <Reveal className="os-studio-left">
            <p className="os-studio-eyebrow">Behind the scenes</p>
            <h2>The making of<br /><em>an evening.</em></h2>
            <p>Before a dress appears in the catalogue, it passes through a quiet process. Inspection. Steam pressing. Careful staging. We treat every garment as if it is about to meet someone important — because it is.</p>
          </Reveal>
          <Reveal className="os-studio-right" delay={100}>
            <div className="os-studio-img">
              <img src="/images/MKBrown.webp" alt="MK Studio selection process" loading="lazy" decoding="async" />
            </div>
            <div className="os-studio-label">
              <span className="os-studio-label-num">64</span>
              <span className="os-studio-label-text">Dresses in the current collection</span>
            </div>
          </Reveal>
        </section>

        <section className="os-closing">
          <Reveal className="os-closing-inner">
            <p className="os-closing-eyebrow">The invitation</p>
            <h2>Find the dress<br />that finds you.</h2>
            <p>Browse the full collection. When you see something that stops you — screenshot it, send it to us with your dates, and we will take it from there.</p>
            <div className="os-closing-actions">
              <button className="os-cta-btn" onClick={() => setLocation("/catalogue")}>Browse the catalogue <ArrowUpRight size={16} /></button>
              <button className="os-cta-btn os-cta-btn--ghost" onClick={() => setLocation("/list-with-us")}>List your dress</button>
            </div>
          </Reveal>
        </section>

      </main>
    </StoreShell>
  );
}
