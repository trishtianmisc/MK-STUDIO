import { ArrowUpRight, Sparkles } from "lucide-react";
import { useLocation } from "wouter";
import { StoreShell } from "@/components/StoreShell";

export default function About() {
  const [, setLocation] = useLocation();
  return (
    <StoreShell current="about">
      <main className="about-page">
        <section className="about-hero">
          <div><p className="eyebrow eyebrow-gold">The MK Studio story</p><h1>A wardrobe should<br /><em>move with you.</em></h1></div>
          <p>MK Studio is a fashion-led showcase for pieces selected for the plans, rooms, and versions of you worth dressing for.</p>
        </section>
        <section className="about-story">
          <div className="about-story-image"><img src="/images/my-studio-original-wardrobe_46a8eeb0.png" alt="MK Studio’s wardrobe in jewel tones" /></div>
          <div className="about-story-copy"><p className="eyebrow">Designed around real plans</p><h2>Borrow the feeling.<br /><em>Make it yours.</em></h2><p>We believe in thoughtful wardrobe rotation: less accumulation, more intention. The MK Studio edit brings beautiful silhouettes, tactile materials, and a little drama within reach for the moments that call for it.</p><p>This website is built to help you discover the studio’s selection and understand the point of view behind every look.</p></div>
        </section>
        <section className="about-principles"><article><Sparkles size={22} /><span>01</span><h2>Considered</h2><p>Every piece is selected for visual impact, quality, and the way it wears in real life.</p></article><article><Sparkles size={22} /><span>02</span><h2>Personal</h2><p>We start with the event, your mood, and the detail you cannot stop thinking about.</p></article><article><Sparkles size={22} /><span>03</span><h2>In motion</h2><p>A great wardrobe does not sit still. It returns, renews, and has another night out.</p></article></section>
        <section className="about-cta"><p>Looking for a place to start?</p><button className="editorial-button editorial-button-light" onClick={() => setLocation("/catalogue")}>Browse the catalogue <ArrowUpRight size={16} /></button></section>
      </main>
    </StoreShell>
  );
}
