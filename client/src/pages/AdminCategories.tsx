import { Edit3, Plus, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { getCategories, deleteCategory, type Category } from "@/services/categories";
import AdminCategoryForm from "./AdminCategoryForm";

export default function AdminCategories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<"list" | "add" | "edit">("list");
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Category | null>(null);
  const [deleting, setDeleting] = useState(false);

  const refresh = () => {
    setLoading(true);
    getCategories()
      .then(setCategories)
      .catch(() => toast.error("Failed to load categories"))
      .finally(() => setLoading(false));
  };

  useEffect(() => { refresh(); }, []);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await deleteCategory(deleteTarget.id);
      toast.success(`"${deleteTarget.name}" deleted`);
      setDeleteTarget(null);
      refresh();
    } catch (err: any) {
      const msg = err.message || "";
      if (msg.includes("409") || msg.toLowerCase().includes("conflict") || msg.toLowerCase().includes("foreign")) {
        toast.error("This category cannot be deleted because products are currently using it.");
      } else {
        toast.error(msg || "Failed to delete category");
      }
    } finally {
      setDeleting(false);
    }
  };

  if (view === "add") {
    return <AdminCategoryForm onDone={() => { setView("list"); refresh(); }} onCancel={() => setView("list")} />;
  }

  if (view === "edit" && editingCategory) {
    return <AdminCategoryForm category={editingCategory} onDone={() => { setView("list"); setEditingCategory(null); refresh(); }} onCancel={() => { setView("list"); setEditingCategory(null); }} />;
  }

  return (
    <>
      <div className="admin-table-head">
        <div>
          <p>Categories</p>
          <span>{categories.length} categories in catalogue</span>
        </div>
        <button onClick={() => setView("add")}><Plus size={16} /> New category</button>
      </div>

      {loading ? (
        <div style={{ padding: "20px", color: "#728077", fontSize: 12 }}>Loading...</div>
      ) : categories.length === 0 ? (
        <div style={{ padding: "40px", textAlign: "center", color: "#728077" }}>
          <p>No categories yet. Create your first category to get started.</p>
        </div>
      ) : (
        <div className="admin-simple-grid">
          {categories.map(category => (
            <article key={category.id}>
              <span>{category.name}</span>
              <strong>/{category.slug}</strong>
              <p>{category.description || "No description"}</p>
              <div style={{ display: "flex", gap: 6, marginTop: 8 }}>
                <button onClick={() => { setEditingCategory(category); setView("edit"); }} style={{ display: "inline-flex", alignItems: "center", gap: 4, padding: "5px 9px", background: "#e8f0ea", color: "#285d45", borderRadius: 4, fontSize: 10, fontWeight: 600, border: "none", cursor: "pointer" }}>
                  <Edit3 size={13} /> Edit
                </button>
                <button onClick={() => setDeleteTarget(category)} style={{ display: "inline-flex", alignItems: "center", gap: 4, padding: "5px 9px", background: "#fde8e8", color: "#b44", borderRadius: 4, fontSize: 10, fontWeight: 600, border: "none", cursor: "pointer" }}>
                  <Trash2 size={13} /> Delete
                </button>
              </div>
            </article>
          ))}
        </div>
      )}

      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => { if (!open) setDeleteTarget(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete category?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete <strong>{deleteTarget?.name}</strong>? If products are using this category, deletion will be blocked.
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
