import { ArrowLeft, BarChart3, Boxes, ClipboardList, LogOut, Sparkles } from "lucide-react";
import { useLocation } from "wouter";
import { useAuth } from "@/contexts/AuthContext";
import type { ReactNode } from "react";

export type AdminView = "dashboard" | "products" | "categories";

interface Props {
  view: AdminView;
  setView: (v: AdminView) => void;
  children: ReactNode;
}

export default function AdminLayout({ view, setView, children }: Props) {
  const { user, signOut } = useAuth();
  const [, setLocation] = useLocation();
  const navItems: { id: AdminView; label: string; caption: string; icon: typeof BarChart3 }[] = [
    { id: "dashboard", label: "Overview", caption: "Studio pulse", icon: BarChart3 },
    { id: "products", label: "Products", caption: "Manage catalogue", icon: Boxes },
    { id: "categories", label: "Categories", caption: "Organise collections", icon: ClipboardList },
  ];

  const handleSignOut = async () => {
    await signOut();
    setLocation("/admin");
  };

  const pageCopy = {
    dashboard: ["Workspace overview", "A clear view of what is happening across your studio."],
    products: ["Product catalogue", "Create, curate and publish every piece in your collection."],
    categories: ["Product categories", "Keep your catalogue easy to browse and beautifully organised."],
  }[view];

  return (
    <main className="admin-shell">
      <header className="admin-topbar">
        <button className="admin-brand" onClick={() => setLocation("/")} aria-label="Return to MK Studio website">
          <span className="admin-brand-mark"><Sparkles size={15} /></span>
          <span><strong>MK</strong> Studio <small>BACKSTAGE</small></span>
        </button>
        <div className="admin-topbar-right">
          <span className="admin-user"><i /> {user?.email ?? "Studio admin"}</span>
          <button className="admin-signout" onClick={handleSignOut}><LogOut size={14} /> Sign out</button>
        </div>
      </header>

      <div className="admin-body">
        <aside className="admin-sidebar">
          <button className="admin-return" onClick={() => setLocation("/")}><ArrowLeft size={14} /> Return to site</button>
          <div className="admin-sidebar-intro"><span>Workspace</span><p>Good to see you<br /><em>backstage.</em></p></div>
          <nav className="admin-nav" aria-label="Admin navigation">
            {navItems.map(item => {
              const Icon = item.icon;
              return <button key={item.id} className={view === item.id ? "is-active" : ""} onClick={() => setView(item.id)}>
                <span className="admin-nav-icon"><Icon size={16} /></span><span><strong>{item.label}</strong><small>{item.caption}</small></span>
              </button>;
            })}
          </nav>
          <div className="admin-sidebar-foot"><span>MK</span><p>Thoughtful pieces,<br />beautifully presented.</p></div>
        </aside>

        <section className="admin-workspace">
          <div className="admin-page-heading"><div><span className="admin-eyebrow">{pageCopy[0]}</span><h1>{pageCopy[1]}</h1></div><span className="admin-date">MK STUDIO / 2026</span></div>
          {children}
        </section>
      </div>
    </main>
  );
}
