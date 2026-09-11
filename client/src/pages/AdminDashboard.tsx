import { useEffect, useState } from "react";
import { Calendar } from "lucide-react";
import { getAdminProducts, type ProductWithRelations } from "@/services/products";
import { getCategories, type Category } from "@/services/categories";
import { getUpcomingRentals, type RentalWithProduct } from "@/services/availability";

export default function AdminDashboard() {
  const [products, setProducts] = useState<ProductWithRelations[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [upcoming, setUpcoming] = useState<RentalWithProduct[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getAdminProducts(), getCategories(), getUpcomingRentals()])
      .then(([p, c, r]) => { setProducts(p); setCategories(c); setUpcoming(r); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div style={{ padding: "20px", color: "#728077", fontSize: 12 }}>Loading...</div>;

  const publicProducts = products.filter(p => p.is_public);
  const featuredProducts = products.filter(p => p.is_featured);

  const stats = [
    { label: "Total products", value: products.length },
    { label: "Public products", value: publicProducts.length },

    { label: "Featured products", value: featuredProducts.length },
    { label: "Categories", value: categories.length },
  ];

  const today = new Date().toISOString().split("T")[0];

  return (
    <div>

       <section className="admin-stat-grid">
        {stats.map(stat => (
          <article key={stat.label}>
            <span>{stat.label}</span>
            <strong>{stat.value}</strong>
          </article>
        ))}
      </section>
      
      <section className="admin-upcoming-section">
        <div className="admin-upcoming-header">
          <h3><Calendar size={16} /> Upcoming Rentals</h3>
        </div>

        {upcoming.length === 0 ? (
          <p className="admin-upcoming-empty">No upcoming rentals scheduled.</p>
        ) : (
          <div className="admin-upcoming-list">
            {upcoming.slice(0, 10).map(rental => {
              const isToday = rental.start_date <= today && rental.end_date >= today;
              const isPast = rental.end_date < today;
              return (
                <div key={rental.id} className={`admin-upcoming-row ${isToday ? "is-active" : ""} ${isPast ? "is-past" : ""}`}>
                  <div className="admin-upcoming-product">
                    {rental.product_image && <img src={rental.product_image} alt={rental.product_name} />}
                    <div>
                      <strong>{rental.product_name}</strong>
                      <span>{rental.product_slug}</span>
                    </div>
                  </div>
                  <div className={`admin-upcoming-type type-${rental.type}`}>{rental.type}</div>
                  <div className="admin-upcoming-dates">
                    {formatDate(rental.start_date)} — {formatDate(rental.end_date)}
                  </div>
                  {rental.note && <div className="admin-upcoming-note">{rental.note}</div>}
                  {isToday && <div className="admin-upcoming-badge">In progress</div>}
                </div>
              );
            })}
          </div>
        )}
      </section>

     
    </div>
  );
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}
