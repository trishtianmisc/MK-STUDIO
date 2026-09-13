import { ArrowUpRight, Sparkles } from "lucide-react";
import { useLocation } from "wouter";
import { StoreShell } from "@/components/StoreShell";

export default function HowRentalWorks() {
  const [, setLocation] = useLocation();
  return (
    <StoreShell current="how-rental-works">
      <main className="how-rental-works-page">
        <section className="about-hero">
          <div>
            <p className="eyebrow eyebrow-gold">How it works</p>
            <h1>How rental<br /><em>works.</em></h1>
          </div>
          <p>Browse, screenshot, and send — all in a few simple steps. No commitment, no clutter, just the right look for every plan.</p>
        </section>

        <section className="how-rental-steps">
          <article>
            <Sparkles size={22} />
            <span>01</span>
            <h2>Browse the catalogue</h2>
            <p>Explore our curated edit of occasion-ready pieces. Filter by style, colour, or moment to find what speaks to you.</p>
          </article>
          <article>
            <Sparkles size={22} />
            <span>02</span>
            <h2>Screenshot your pick</h2>
            <p>Found the one? Take a screenshot of the piece you love — we'll need it to identify the exact dress.</p>
          </article>
          <article>
            <Sparkles size={22} />
            <span>03</span>
            <h2>Send us a message</h2>
            <p>Head to our Facebook or Instagram, send us the screenshot along with your event dates and any details we should know.</p>
          </article>
          <article>
            <Sparkles size={22} />
            <span>04</span>
            <h2>We handle the rest</h2>
            <p>We'll confirm availability, arrange pickup or delivery, and make sure your piece is ready for the big day.</p>
          </article>
        </section>

        <section className="about-story">
          <div className="about-story-image">
            <img src="/images/mkl.png" alt="MK Studio rental collection" loading="lazy" decoding="async" />
          </div>
          <div className="about-story-copy">
            <p className="eyebrow">Get in touch</p>
            <h2>Message us.</h2>
            <p>Send a screenshot of your chosen piece, your event date, and any styling preferences. We'll get back to you within 24 hours to confirm everything.</p>
            <div className="how-rental-social">
              <a href="https://www.facebook.com/MKStudioCollective/" target="_blank" rel="noopener noreferrer" className="editorial-button editorial-button-dark">
                Message on Facebook <ArrowUpRight size={16} />
              </a>
              <a href="https://www.instagram.com/mkstudiocollective/" target="_blank" rel="noopener noreferrer" className="editorial-button editorial-button-dark">
                Message on Instagram <ArrowUpRight size={16} />
              </a>
            </div>
          </div>
        </section>

        <section className="about-cta">
          <p>Ready to find your piece?</p>
          <button className="editorial-button editorial-button-light" onClick={() => setLocation("/catalogue")}>
            Browse the catalogue <ArrowUpRight size={16} />
          </button>
        </section>
      </main>
    </StoreShell>
  );
}
