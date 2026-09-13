import { ArrowUpRight, Sparkles } from "lucide-react";
import { useLocation } from "wouter";
import { StoreShell } from "@/components/StoreShell";

export default function ListWithUs() {
  const [, setLocation] = useLocation();
  return (
    <StoreShell current="list-with-us">
      <main className="list-with-us-page">
        <section className="about-hero">
          <div>
            <p className="eyebrow eyebrow-gold">List with us</p>
            <h1>Give your dress<br /><em>another night out.</em></h1>
          </div>
          <p>Have a stunning piece sitting in your wardrobe? List it with MK Studio and earn while someone else makes memories in it.</p>
        </section>

        <section className="how-rental-steps">
          <article>
            <Sparkles size={22} />
            <span>01</span>
            <h2>Submit your piece</h2>
            <p>Send us a message on Facebook or Instagram with photos and details about your dress.</p>
          </article>
          <article>
            <Sparkles size={22} />
            <span>02</span>
            <h2>We review</h2>
            <p>Our team assesses quality, style fit, and rental potential within 48 hours.</p>
          </article>
          <article>
            <Sparkles size={22} />
            <span>03</span>
            <h2>We photograph</h2>
            <p>Approved pieces are professionally shot for the MK Studio catalogue.</p>
          </article>
          <article>
            <Sparkles size={22} />
            <span>04</span>
            <h2>You earn</h2>
            <p>Every time your dress is rented, you receive your share straight to your account.</p>
          </article>
        </section>

        <section className="about-story">
          <div className="about-story-image">
            <img src="/images/Instruc5.jpg" alt="List your dress with MK Studio" loading="lazy" decoding="async" />
          </div>
          <div className="about-story-copy">
            <p className="eyebrow">Why list with us</p>
            <h2>We handle everything.</h2>
            <p><strong>Earn from your wardrobe</strong> — Turn unused occasion wear into income. You set the rental price and we handle everything else.</p>
            <p><strong>Protected at every step</strong> — Every piece is insured during rental periods. Minor wear and tear is covered.</p>
            <p><strong>Fully managed</strong> — From cleaning to customer queries, we manage the full rental experience so you don't have to.</p>
          </div>
        </section>

        <section className="list-with-us-cta">
          <div className="list-with-us-cta-inner">
            <p>Ready to list your piece?</p>
            <div className="list-with-us-social">
              <a href="https://www.facebook.com/MKStudioCollective/" target="_blank" rel="noopener noreferrer" className="editorial-button editorial-button-light">
                Message on Facebook <ArrowUpRight size={16} />
              </a>
              <a href="https://www.instagram.com/mkstudiocollective/" target="_blank" rel="noopener noreferrer" className="editorial-button editorial-button-light">
                Message on Instagram <ArrowUpRight size={16} />
              </a>
            </div>
          </div>
        </section>

        <section className="about-cta">
          <p>Not ready yet?</p>
          <button className="editorial-button editorial-button-light" onClick={() => setLocation("/catalogue")}>
            Browse the catalogue <ArrowUpRight size={16} />
          </button>
        </section>
      </main>
    </StoreShell>
  );
}
