import { useEffect, useState, useMemo } from "react";
import { Trash2, Edit, Search, Calendar, Filter } from "lucide-react";
import { getAllRentals, deleteRentalDate, type RentalWithProduct } from "@/services/availability";
import { getAdminProducts, type ProductWithRelations } from "@/services/products";
import AdminRentalForm from "./AdminRentalForm";

export default function AdminRentals() {
  const [rentals, setRentals] = useState<RentalWithProduct[]>([]);
  const [products, setProducts] = useState<ProductWithRelations[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingRental, setEditingRental] = useState<RentalWithProduct | null>(null);
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState<string>("all");

  const refresh = () => {
    setLoading(true);
    Promise.all([getAllRentals(), getAdminProducts()])
      .then(([r, p]) => { setRentals(r); setProducts(p); })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { refresh(); }, []);

  const filtered = useMemo(() => {
    let result = rentals;
    if (filterType !== "all") result = result.filter(r => r.type === filterType);
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(r => r.product_name.toLowerCase().includes(q) || r.product_slug.toLowerCase().includes(q) || (r.note && r.note.toLowerCase().includes(q)));
    }
    return result;
  }, [rentals, filterType, search]);

  const today = new Date().toISOString().split("T")[0];

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this rental period?")) return;
    await deleteRentalDate(id);
    refresh();
  };

  const handleFormClose = () => {
    setEditingRental(null);
    refresh();
  };

  if (editingRental) {
    return <AdminRentalForm products={products} rental={editingRental} onClose={handleFormClose} />;
  }

  return (
    <div className="admin-rentals-page">
      {loading ? (
        <div style={{ padding: "20px", color: "#728077", fontSize: 12 }}>Loading...</div>
      ) : (
        <>
          <div className="admin-rentals-toolbar">
            <div className="admin-rentals-search">
              <Search size={14} />
              <input placeholder="Search products..." value={search} onChange={e => setSearch(e.target.value)} />
            </div>
            <div className="admin-rentals-filters">
              <Filter size={14} />
              <select value={filterType} onChange={e => setFilterType(e.target.value)}>
                <option value="all">All types</option>
                <option value="rented">Rented</option>
                <option value="maintenance">Maintenance</option>
                <option value="blocked">Blocked</option>
              </select>
            </div>
          </div>

          <section className="admin-rentals-list">
            <h3><Calendar size={14} /> {filtered.length} rental{filtered.length !== 1 ? "s" : ""}</h3>
            {filtered.length === 0 ? (
              <p className="admin-rentals-empty">No rentals found.</p>
            ) : (
              <div className="admin-rentals-table">
                {filtered.map(rental => (
                  <div key={rental.id} className={`admin-rental-row ${rental.start_date <= today && rental.end_date >= today ? "is-active" : ""}`}>
                    <div className="admin-rental-product">
                      {rental.product_image && <img src={rental.product_image} alt={rental.product_name} />}
                      <div>
                        <strong>{rental.product_name}</strong>
                        <span>{rental.type}</span>
                      </div>
                    </div>
                    <div className="admin-rental-dates">
                      {formatDate(rental.start_date)} — {formatDate(rental.end_date)}
                    </div>
                    <div className="admin-rental-note">{rental.note || "No Notes"}</div>
                    <div className="admin-rental-actions">
                      <button onClick={() => setEditingRental(rental)} title="Edit"><Edit size={13} /></button>
                      <button onClick={() => handleDelete(rental.id)} title="Delete"><Trash2 size={13} /></button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </>
      )}
    </div>
  );
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}
