import { ArrowLeft, LayoutDashboard, ImagePlus, ClipboardList, LogOut } from "lucide-react";
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

  const handleSignOut = async () => {
    await signOut();
    setLocation("/admin");
  };

  const navItems: { id: AdminView; label: string; icon: typeof LayoutDashboard }[] = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "products", label: "Products", icon: ImagePlus },
    { id: "categories", label: "Categories", icon: ClipboardList },
  ];

  return (
    <main className="admin-preview-page">
      <header className="admin-preview-header">
        <button onClick={() => setLocation("/")}><ArrowLeft size={17} /> Return to site</button>
        <span>MK Studio</span>
        <div className="admin-preview-header-actions">
          <p>{user?.email}</p>
          <button onClick={handleSignOut}><LogOut size={14} /> Sign out</button>
        </div>
      </header>

      <section className="admin-preview-intro">
        <div>
          <p>ADMIN AREA</p>
          <h1>{view === "dashboard" ? <>Studio rental<br />overview.</> : <>{view === "products" ? "Product catalogue" : "Product categories"}<br /><em>management.</em></>}</h1>
        </div>
      </section>

      <section className="admin-preview-content">
        <aside>
          <p>Workspace</p>
          {navItems.map(item => {
            const Icon = item.icon;
            return (
              <button key={item.id} className={view === item.id ? "is-active" : ""} onClick={() => setView(item.id)}>
                <span><Icon size={14} /> {item.label}</span>
              </button>
            );
          })}
        </aside>

        <div className="admin-table-wrap">
          {children}
        </div>
      </section>
    </main>
  );
}
