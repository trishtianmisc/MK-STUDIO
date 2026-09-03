import { Edit3, ImagePlus, Plus, Trash2, Eye, EyeOff, Star } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
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
  const [editingProduct, setEditingProduct] = useState<ProductWithRelations | null>(null);
  const [imagesProduct, setImagesProduct] = useState<ProductWithRelations | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<ProductWithRelations | null>(null);
  const [deleting, setDeleting] = useState(false);

  const refresh = () => {
    setLoading(true);
    Promise.all([getProducts(), getCategories()])
      .then(([p, c]) => { setProducts(p); setCategories(c); })
      .catch(() => toast.error("Failed to load products"))
      .finally(() => setLoading(false));
  };

  useEffect(() => { refresh(); }, []);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await deleteProduct(deleteTarget.id);
      toast.success(`"${deleteTarget.name}" deleted`);
      setDeleteTarget(null);
      refresh();
    } catch (err: any) {
      toast.error(err.message || "Failed to delete product");
    } finally {
      setDeleting(false);
    }
  };

  const handleTogglePublic = async (product: ProductWithRelations) => {
    try {
      await updateProduct(product.id, { is_public: !product.is_public });
      refresh();
    } catch {
      toast.error("Failed to update visibility");
    }
  };

  const handleToggleFeatured = async (product: ProductWithRelations) => {
    try {
      await updateProduct(product.id, { is_featured: !product.is_featured });
      refresh();
    } catch {
      toast.error("Failed to update featured status");
    }
  };

  if (view === "add") {
    return <AdminProductForm categories={categories} onDone={() => { setView("list"); refresh(); }} onCancel={() => setView("list")} />;
  }

  if (view === "edit" && editingProduct) {
    return <AdminProductForm categories={categories} product={editingProduct} onDone={() => { setView("list"); setEditingProduct(null); refresh(); }} onCancel={() => { setView("list"); setEditingProduct(null); }} />;
  }

  if (view === "images" && imagesProduct) {
    return <AdminImageManager product={imagesProduct} onDone={() => { setView("list"); setImagesProduct(null); refresh(); }} onCancel={() => { setView("list"); setImagesProduct(null); }} />;
  }

  const getCategoryName = (p: ProductWithRelations) => p.categories?.name ?? "—";

  return (
    <>
      <div className="admin-table-head">
        <div>
          <p>Products</p>
          <span>{products.length} products in catalogue</span>
        </div>
        <button onClick={() => setView("add")}><Plus size={16} /> New product</button>
      </div>

      {loading ? (
        <div style={{ padding: "20px", color: "#728077", fontSize: 12 }}>Loading...</div>
      ) : products.length === 0 ? (
        <div style={{ padding: "40px", textAlign: "center", color: "#728077" }}>
          <p>No products yet. Create your first product to get started.</p>
        </div>
      ) : (
        <div className="admin-table">
          <div className="admin-row admin-row-head">
            <span>Product</span>
            <span>Category</span>
            <span>Availability</span>
            <span />
          </div>
          {products.map(product => (
            <div className="admin-row" key={product.id}>
              <div className="admin-product-cell">
                {product.image ? <img src={product.image} alt="" /> : <div style={{ width: 37, height: 44, background: "#e8f0ea", borderRadius: 3 }} />}
                <div>
                  <strong>{product.name}</strong>
                  <span>{formatRentalPrice(product.rental_price)} · {product.color ?? "—"}</span>
                </div>
              </div>
              <span>{getCategoryName(product)}</span>
              <span className={`admin-status ${product.availability.toLowerCase()}`}>{product.availability}</span>
              <div className="admin-row-actions">
                <button onClick={() => { setEditingProduct(product); setView("edit"); }} aria-label={`Edit ${product.name}`} title="Edit"><Edit3 size={16} /></button>
                <button onClick={() => { setImagesProduct(product); setView("images"); }} aria-label={`Images for ${product.name}`} title="Manage images"><ImagePlus size={16} /></button>
                <button onClick={() => handleTogglePublic(product)} aria-label={product.is_public ? "Hide" : "Show"} title={product.is_public ? "Hide from public" : "Show publicly"}>
                  {product.is_public ? <Eye size={16} /> : <EyeOff size={16} />}
                </button>
                <button onClick={() => handleToggleFeatured(product)} aria-label={product.is_featured ? "Unfeature" : "Feature"} title={product.is_featured ? "Remove from featured" : "Add to featured"} style={{ color: product.is_featured ? "#c5952a" : undefined }}>
                  <Star size={16} fill={product.is_featured ? "#c5952a" : "none"} />
                </button>
                <button onClick={() => setDeleteTarget(product)} aria-label={`Delete ${product.name}`} title="Delete" style={{ color: "#b44" }}><Trash2 size={16} /></button>
              </div>
            </div>
          ))}
        </div>
      )}

      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => { if (!open) setDeleteTarget(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete product?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete <strong>{deleteTarget?.name}</strong>? This will also remove its associated catalogue images. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} disabled={deleting} style={{ background: "#b44", color: "white" }}>
              {deleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
