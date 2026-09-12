import { useEffect, useState } from "react";
import { Calendar } from "lucide-react";
import { getAdminStats, type AdminStats } from "@/services/products";
import { getUpcomingRentals, type RentalWithProduct } from "@/services/availability";

export default function AdminDashboard() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [upcoming, setUpcoming] = useState<RentalWithProduct[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAdminStats().then(setStats).catch((err) => console.error("[Dashboard] stats:", err));
    getUpcomingRentals().then(setUpcoming).catch((err) => console.error("[Dashboard] upcoming:", err)).finally(() => setLoading(false));
  }, []);

  if (loading) return <div style={{ padding: "20px", color: "#728077", fontSize: 12 }}>Loading...</div>;

  const statItems = stats ? [
    { label: "Total products", value: stats.totalProducts },
    { label: "Public products", value: stats.publicProducts },
    { label: "Featured products", value: stats.featuredProducts },
    { label: "Categories", value: stats.totalCategories },
  ] : [];

  const today = new Date().toISOString().split("T")[0];

  return (
    <div>

       <section className="admin-stat-grid">
        {statItems.map(stat => (
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
