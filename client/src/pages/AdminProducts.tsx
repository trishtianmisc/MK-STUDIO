import { Edit3, ImagePlus, Plus, Trash2, Eye, EyeOff, Star, Search, SlidersHorizontal, PackageOpen } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { getProducts, deleteProduct, updateProduct, type ProductWithRelations } from "@/services/products";
import { getCategories, type Category } from "@/services/categories";
import { formatRentalPrice } from "@/data/catalogue";
import AdminProductForm from "./AdminProductForm";
import AdminImageManager from "./AdminImageManager";

type AdminProductView = "list" | "add" | "edit" | "images";

export default function AdminProducts() {
  const [products, setProducts] = useState<ProductWithRelations[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<AdminProductView>("list");
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("All products");
  const [editingProduct, setEditingProduct] = useState<ProductWithRelations | null>(null);
  const [imagesProduct, setImagesProduct] = useState<ProductWithRelations | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<ProductWithRelations | null>(null);
  const [deleting, setDeleting] = useState(false);

  const refresh = () => { setLoading(true); Promise.all([getProducts(), getCategories()]).then(([p, c]) => { setProducts(p); setCategories(c); }).catch(() => toast.error("Failed to load products")).finally(() => setLoading(false)); };
  useEffect(() => { refresh(); }, []);
  const visibleProducts = useMemo(() => products.filter(p => {
    const matchesQuery = `${p.name} ${p.color ?? ""} ${p.categories?.name ?? ""}`.toLowerCase().includes(query.toLowerCase());
    const matchesFilter = filter === "All products" || (filter === "Published" && p.is_public) || (filter === "Hidden" && !p.is_public) || (filter === "Featured" && p.is_featured);
    return matchesQuery && matchesFilter;
  }), [products, query, filter]);
  const handleDelete = async () => { if (!deleteTarget) return; setDeleting(true); try { await deleteProduct(deleteTarget.id); toast.success(`“${deleteTarget.name}” deleted`); setDeleteTarget(null); refresh(); } catch (err: any) { toast.error(err.message || "Failed to delete product"); } finally { setDeleting(false); } };
  const toggle = async (product: ProductWithRelations, field: "is_public" | "is_featured") => { try { await updateProduct(product.id, { [field]: !product[field] }); refresh(); } catch { toast.error("Failed to update product"); } };

  if (view === "add") return <AdminProductForm categories={categories} onDone={() => { setView("list"); refresh(); }} onCancel={() => setView("list")} />;
  if (view === "edit" && editingProduct) return <AdminProductForm categories={categories} product={editingProduct} onDone={() => { setView("list"); setEditingProduct(null); refresh(); }} onCancel={() => { setView("list"); setEditingProduct(null); }} />;
  if (view === "images" && imagesProduct) return <AdminImageManager product={imagesProduct} onDone={() => { setView("list"); setImagesProduct(null); refresh(); }} onCancel={() => { setView("list"); setImagesProduct(null); }} />;

  return <>
    <div className="admin-section-toolbar"><div><span className="admin-section-kicker">Catalogue library</span><h2>All products <b>{products.length}</b></h2></div><button className="admin-primary-button" onClick={() => setView("add")}><Plus size={16} /> Add product</button></div>
    <div className="admin-metric-strip"><div><span>Total pieces</span><strong>{products.length}</strong></div><div><span>Published</span><strong>{products.filter(p => p.is_public).length}</strong></div><div><span>Featured</span><strong>{products.filter(p => p.is_featured).length}</strong></div><div><span>Categories</span><strong>{categories.length}</strong></div></div>
    <div className="admin-list-panel">
      <div className="admin-list-controls"><label className="admin-search"><Search size={16} /><input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search products or categories" /></label><label className="admin-filter"><SlidersHorizontal size={15} /><select value={filter} onChange={e => setFilter(e.target.value)}><option>All products</option><option>Published</option><option>Hidden</option><option>Featured</option></select></label></div>
      {loading ? <div className="admin-empty-state">Loading catalogue…</div> : visibleProducts.length === 0 ? <div className="admin-empty-state"><PackageOpen size={28} /><strong>{products.length ? "No matching products" : "Your catalogue is ready for its first piece"}</strong><span>{products.length ? "Try adjusting your search or filter." : "Add a product to start building your collection."}</span>{!products.length && <button className="admin-primary-button" onClick={() => setView("add")}><Plus size={15} /> Add first product</button>}</div> : <div className="admin-product-table"><div className="admin-product-table-head"><span>Product</span><span>Category</span><span>Rental price</span><span>Status</span><span /></div>{visibleProducts.map(product => <div className="admin-product-row" key={product.id}><div className="admin-product-main">{product.image ? <img src={product.image} alt="" /> : <div className="admin-product-placeholder"><PackageOpen size={18} /></div>}<div><strong>{product.name}</strong><span>{product.color ?? "No colour added"} <i>·</i> {product.slug}</span></div></div><span className="admin-product-category">{product.categories?.name ?? "Uncategorised"}</span><span className="admin-price">{formatRentalPrice(product.rental_price)}<small> / rental</small></span><span className={`admin-status-pill ${product.availability.toLowerCase()}`}><i />{product.availability}</span><div className="admin-row-actions"><button onClick={() => { setEditingProduct(product); setView("edit"); }} title="Edit product"><Edit3 size={15} /></button><button onClick={() => { setImagesProduct(product); setView("images"); }} title="Manage images"><ImagePlus size={15} /></button><button onClick={() => toggle(product, "is_public")} title={product.is_public ? "Hide product" : "Publish product"}>{product.is_public ? <Eye size={15} /> : <EyeOff size={15} />}</button><button className={product.is_featured ? "is-selected" : ""} onClick={() => toggle(product, "is_featured")} title="Toggle featured"><Star size={15} fill={product.is_featured ? "currentColor" : "none"} /></button><button className="is-danger" onClick={() => setDeleteTarget(product)} title="Delete product"><Trash2 size={15} /></button></div></div>)}</div>}
    </div>
    <AlertDialog open={!!deleteTarget} onOpenChange={open => !open && setDeleteTarget(null)}><AlertDialogContent><AlertDialogHeader><AlertDialogTitle>Delete product?</AlertDialogTitle><AlertDialogDescription>Are you sure you want to delete <strong>{deleteTarget?.name}</strong>? This will also remove its associated catalogue images. This action cannot be undone.</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel><AlertDialogAction onClick={handleDelete} disabled={deleting} className="admin-delete-confirm">{deleting ? "Deleting…" : "Delete product"}</AlertDialogAction></AlertDialogFooter></AlertDialogContent></AlertDialog>
  </>;
}
