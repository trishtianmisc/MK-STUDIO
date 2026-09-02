import { ArrowLeft, ClipboardList, Edit3, ImagePlus, LayoutDashboard, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useLocation } from "wouter";
import { categoryMeta, formatRentalPrice, showcaseProducts } from "@/data/catalogue";

type AdminView = "dashboard" | "products" | "categories" | "content";

export default function AdminPreview({ onSignOut }: { onSignOut: () => void }) {
  const [, setLocation] = useLocation();
  const [view, setView] = useState<AdminView>("dashboard");
  const preview = (action: string) => toast("Admin interface preview", { description: `${action} is visual only. No records are created, edited, deleted, or stored.` });
  const navigate = (next: AdminView) => setView(next);
  
  const navItems: { id: AdminView; label: string; count?: string; icon: typeof LayoutDashboard }[] = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "products", label: "Products", count: String(showcaseProducts.length), icon: ImagePlus },
    { id: "categories", label: "Categories", count: String(Object.keys(categoryMeta).length), icon: ClipboardList },
    { id: "content", label: "Page content", icon: Edit3 },
  ];

  const title = { 
    dashboard: "Studio overview", 
    products: "Product catalogue", 
    categories: "Product categories", 
    content: "Site content" 
  }[view];

  return (
    <main className="admin-preview-page">
      <header className="admin-preview-header">
        <button onClick={() => setLocation("/")}><ArrowLeft size={17} /> Return to site</button>
        <span>MK Studio</span>
        <div className="admin-preview-header-actions">
          <p>Static admin interface preview</p>
          <button onClick={onSignOut}>Sign out</button>
        </div>
      </header>
      
      <section className="admin-preview-intro">
        <div>
          <p>FRONTEND ONLY</p>
          <h1>{view === "dashboard" ? <>Studio rental<br />overview.</> : <>{title}<br /><em>preview.</em></>}</h1>
        </div>
        <button onClick={() => preview(view === "products" ? "Adding a new product" : "Saving this workspace change")}>
          <Plus size={17} /> {view === "products" ? "Add product" : "New action"}
        </button>
      </section>
      
      <section className="admin-preview-content">
        <aside>
          <p>Workspace</p>
          {navItems.slice(0, 3).map(item => {
            const Icon = item.icon;
            return (
              <button key={item.id} className={view === item.id ? "is-active" : ""} onClick={() => navigate(item.id)}>
                <span><Icon size={14} /> {item.label}</span>
                {item.count && <em>{item.count}</em>}
              </button>
            );
          })}
          <p>Site</p>
          {navItems.slice(3).map(item => {
            const Icon = item.icon;
            return (
              <button key={item.id} className={view === item.id ? "is-active" : ""} onClick={() => navigate(item.id)}>
                <span><Icon size={14} /> {item.label}</span>
              </button>
            );
          })}
        </aside>
        
        <div className="admin-table-wrap">
          <div className="admin-table-head">
            <div>
              <p>{title}</p>
              <span>Static frontend preview — no login, changes, uploads, or records are saved.</span>
            </div>
            {view === "products" && <button onClick={() => preview("Adding a product")}><Plus size={16} /> New product</button>}
          </div>
          
          {view === "dashboard" && <Dashboard navigate={navigate} />}
          {view === "products" && <Products preview={preview} />}
          {view === "categories" && <Categories preview={preview} />}
          {view === "content" && <Content preview={preview} />}
        </div>
      </section>
    </main>
  );
}

function Dashboard({ navigate }: { navigate: (view: AdminView) => void }) {
  return (
    <section className="admin-stat-grid">
      <article>
        <span>Showcase products</span>
        <strong>{showcaseProducts.length}</strong>
        <button onClick={() => navigate("products")}>View catalogue</button>
      </article>
      <article>
        <span>Product categories</span>
        <strong>{Object.keys(categoryMeta).length}</strong>
        <button onClick={() => navigate("categories")}>Manage categories</button>
      </article>
      <article>
        <span>Consignment pieces</span>
        <strong>{showcaseProducts.filter(p => p.category === "consignment").length}</strong>
        <button onClick={() => navigate("products")}>Review consignment</button>
      </article>
      <article>
        <span>Site sections</span>
        <strong>4</strong>
        <button onClick={() => navigate("content")}>Edit content</button>
      </article>
    </section>
  );
}

function Products({ preview }: { preview: (action: string) => void }) {
  return (
    <div className="admin-table">
      <div className="admin-row admin-row-head">
        <span>Product</span>
        <span>Category</span>
        <span>Availability</span>
        <span />
      </div>
      {showcaseProducts.slice(0, 10).map(product => (
        <div className="admin-row" key={product.slug}>
          <div className="admin-product-cell">
            <img src={product.image} alt="" />
            <div>
              <strong>{product.name}</strong>
              <span>{formatRentalPrice(product.rentalPrice)} · {product.color}</span>
            </div>
          </div>
          <span>{categoryMeta[product.category].label}</span>
          <span className={`admin-status ${product.availability.toLowerCase()}`}>{product.availability}</span>
          <div className="admin-row-actions">
            <button onClick={() => preview(`Editing ${product.name}`)} aria-label={`Edit ${product.name}`}><Edit3 size={16} /></button>
            <button onClick={() => preview(`Replacing image for ${product.name}`)} aria-label={`Replace image for ${product.name}`}><ImagePlus size={16} /></button>
            <button onClick={() => preview(`Deleting ${product.name}`)} aria-label={`Delete ${product.name}`}><Trash2 size={16} /></button>
          </div>
        </div>
      ))}
    </div>
  );
}

function Categories({ preview }: { preview: (action: string) => void }) {
  return (
    <div className="admin-simple-grid">
      {Object.entries(categoryMeta).map(([slug, category]) => (
        <article key={slug}>
          <span>{category.label}</span>
          <strong>{showcaseProducts.filter(product => product.category === slug).length} products</strong>
          <p>{category.short}</p>
          <button onClick={() => preview(`Editing ${category.label}`)}><Edit3 size={15} /> Edit category</button>
        </article>
      ))}
    </div>
  );
}

function Content({ preview }: { preview: (action: string) => void }) {
  return (
    <section className="admin-content-preview">
      <article>
        <p>Homepage hero</p>
        <h2>Collect Memories.<br />Not clutter.</h2>
        <span>Text and hero media preview</span>
        <button onClick={() => preview("Editing homepage content")}><Edit3 size={15} /> Edit section</button>
      </article>
      <article>
        <p>Contact details</p>
        <h2>Reach the studio.</h2>
        <span>Email, social links, and enquiry text preview</span>
        <button onClick={() => preview("Editing contact details")}><Edit3 size={15} /> Edit section</button>
      </article>
    </section>
  );
}
