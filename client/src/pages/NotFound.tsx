import { ArrowUpRight, MoveLeft } from "lucide-react";
import { useLocation } from "wouter";

export default function NotFound() {
  const [, setLocation] = useLocation();

  return (
    <main className="not-found-page">
      <div className="not-found-frame" aria-hidden="true" />
      <section className="not-found-card">
        <p className="eyebrow">Wardrobe library</p>
        <p className="not-found-code">404 · The rail is empty here</p>
        <h1>That page has<br /><em>moved on.</em></h1>
        <p>
          The piece or page you were looking for is not in the current edit. Return to the wardrobe to discover what is waiting.
        </p>
        <div className="not-found-actions">
          <button className="editorial-button editorial-button-light" onClick={() => setLocation("/catalogue")}>
            Browse the wardrobe <ArrowUpRight size={16} />
          </button>
          <button className="not-found-return" onClick={() => setLocation("/")}>
            <MoveLeft size={15} /> Return to MK Studio
          </button>
        </div>
      </section>
    </main>
  );
}
