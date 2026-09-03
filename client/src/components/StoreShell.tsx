import { ArrowUpRight, Menu, X } from "lucide-react";
import { ReactNode, useState } from "react";
import { useLocation } from "wouter";

type StoreShellProps = {
  children: ReactNode;
  current?: "catalogue" | "about" | "contact" | "admin";
};

export function StoreShell({ children, current }: StoreShellProps) {
  const [, setLocation] = useLocation();
  const [open, setOpen] = useState(false);
  const go = (path: string) => {
    setOpen(false);
    setLocation(path);
  };

  return (
    <div className="store-shell">
      {/* <div className="announcement-bar"><span>MK Studio rental collection</span><span className="announcement-note">Digital showcase — contact the studio for rental enquiries.</span></div> */}
      <header className="store-header">
        <button className="mobile-menu-trigger" onClick={() => setOpen(v => !v)} aria-label="Toggle navigation">
          {open ? <X size={21} /> : <Menu size={21} />}
        </button>
        <button className="brand-lockup" onClick={() => go("/")} aria-label="Return to MK Studio home">
          <img src="/images/mklogo.png" alt="" className="brand-mark" />
        </button>
        <nav className="store-nav" aria-label="Main navigation">
          <button className={current === "catalogue" ? "is-current" : ""} onClick={() => go("/catalogue")}>Catalogue</button>
          <button className={current === "about" ? "is-current" : ""} onClick={() => go("/about")}>Our story</button>
          <button className={current === "contact" ? "is-current" : ""} onClick={() => go("/contact")}>Contact</button>
        </nav>
        <div className="store-actions">
          <button className="store-cta" onClick={() => go("/contact")}>Enquire</button>
        </div>
      </header>
      {open && (
        <nav className="store-mobile-nav" aria-label="Mobile navigation">
          <button onClick={() => go("/catalogue")}>Catalogue <ArrowUpRight size={16} /></button>
          <button onClick={() => go("/about")}>Our story <ArrowUpRight size={16} /></button>
          <button onClick={() => go("/contact")}>Contact <ArrowUpRight size={16} /></button>
        </nav>
      )}
      {children}
      <footer className="store-footer">
        <div className="store-footer-brand"><span>MK Studio</span><p>For every RSVP, reset, and reason to dress differently.</p></div>
        <div className="store-footer-links">
          <button onClick={() => go("/catalogue")}>Catalogue</button>
          <button onClick={() => go("/about")}>Our story</button>
          <button onClick={() => go("/contact")}>Contact</button>
        </div>
        <div className="store-footer-meta"><span>© 2026 MK Studio</span></div>
      </footer>
    </div>
  );
}
