import { useEffect, useState } from "react";
import { getProducts, type ProductWithRelations } from "@/services/products";
import { getCategories, type Category } from "@/services/categories";

export default function AdminDashboard() {
  const [products, setProducts] = useState<ProductWithRelations[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getProducts(), getCategories()])
      .then(([p, c]) => { setProducts(p); setCategories(c); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div style={{ padding: "20px", color: "#728077", fontSize: 12 }}>Loading...</div>;

  const publicProducts = products.filter(p => p.is_public);
  const hiddenProducts = products.filter(p => !p.is_public);
  const featuredProducts = products.filter(p => p.is_featured);

  const stats = [
    { label: "Total products", value: products.length },
    { label: "Public products", value: publicProducts.length },
    { label: "Hidden products", value: hiddenProducts.length },
    { label: "Featured products", value: featuredProducts.length },
    { label: "Total categories", value: categories.length },
  ];

  return (
    <section className="admin-stat-grid">
      {stats.map(stat => (
        <article key={stat.label}>
          <span>{stat.label}</span>
          <strong>{stat.value}</strong>
        </article>
      ))}
    </section>
  );
}
