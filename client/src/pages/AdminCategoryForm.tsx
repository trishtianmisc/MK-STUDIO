import { ArrowLeft } from "lucide-react";
import { FormEvent, useState } from "react";
import { toast } from "sonner";
import { createCategory, updateCategory, type Category, type CreateCategoryInput } from "@/services/categories";

interface Props {
  category?: Category;
  onDone: () => void;
  onCancel: () => void;
}

export default function AdminCategoryForm({ category, onDone, onCancel }: Props) {
  const isEdit = !!category;
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [name, setName] = useState(category?.name ?? "");
  const [slug, setSlug] = useState(category?.slug ?? "");
  const [description, setDescription] = useState(category?.description ?? "");
  const [image, setImage] = useState(category?.image ?? "");
  const [sortOrder, setSortOrder] = useState(String(category?.sort_order ?? 0));

  const validate = (): boolean => {
    const e: Record<string, string> = {};
    if (!name.trim()) e.name = "Name is required";
    if (!slug.trim()) e.slug = "Slug is required";
    if (!/^[a-z0-9-]+$/.test(slug)) e.slug = "Slug must be lowercase letters, numbers, and hyphens";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    try {
      const input: CreateCategoryInput = {
        name: name.trim(),
        slug: slug.trim(),
        sort_order: Number(sortOrder) || 0,
      };
      if (description.trim()) input.description = description.trim();
      if (image.trim()) input.image = image.trim();

      if (isEdit && category) {
        await updateCategory(category.id, input);
        toast.success("Category updated");
      } else {
        await createCategory(input);
        toast.success("Category created");
      }
      onDone();
    } catch (err: any) {
      toast.error(err.message || "Failed to save category");
    } finally {
      setSubmitting(false);
    }
  };

  const autoSlug = (value: string) => {
    setSlug(value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""));
  };

  const fieldStyle = { marginBottom: 14 };
  const labelStyle = { display: "block", marginBottom: 4, fontSize: 11, fontWeight: 700 as const, color: "#536158", letterSpacing: ".06em", textTransform: "uppercase" as const };
  const inputStyle = { width: "100%", padding: "9px 11px", border: "1px solid #dfe1dc", borderRadius: 4, fontSize: 12, color: "#28342d", background: "#fff", outline: "none" };
  const errorStyle = { color: "#b44", fontSize: 10, marginTop: 3 };

  return (
    <>
      <div className="admin-table-head">
        <div>
          <button onClick={onCancel} style={{ display: "inline-flex", alignItems: "center", gap: 5, color: "#657269", fontSize: 11, fontWeight: 600, marginBottom: 8, background: "none", border: "none", padding: 0, cursor: "pointer" }}>
            <ArrowLeft size={14} /> Back to categories
          </button>
          <p>{isEdit ? "Edit category" : "New category"}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} style={{ background: "#fff", border: "1px solid #dfe1dc", borderRadius: 6, padding: "24px 28px", maxWidth: 500 }}>
        <div style={fieldStyle}>
          <label style={labelStyle}>Name *</label>
          <input style={inputStyle} value={name} onChange={e => { setName(e.target.value); if (!isEdit) autoSlug(e.target.value); }} placeholder="Wedding guest" />
          {errors.name && <p style={errorStyle}>{errors.name}</p>}
        </div>

        <div style={fieldStyle}>
          <label style={labelStyle}>Slug *</label>
          <input style={inputStyle} value={slug} onChange={e => setSlug(e.target.value)} placeholder="wedding-guest" />
          {errors.slug && <p style={errorStyle}>{errors.slug}</p>}
        </div>

        <div style={fieldStyle}>
          <label style={labelStyle}>Description</label>
          <textarea style={{ ...inputStyle, minHeight: 60 }} value={description} onChange={e => setDescription(e.target.value)} />
        </div>

        <div style={fieldStyle}>
          <label style={labelStyle}>Image path</label>
          <input style={inputStyle} value={image} onChange={e => setImage(e.target.value)} placeholder="/images/my-studio-wedding_fb88aaa2.jpg" />
        </div>

        <div style={fieldStyle}>
          <label style={labelStyle}>Sort order</label>
          <input style={inputStyle} type="number" min="0" value={sortOrder} onChange={e => setSortOrder(e.target.value)} />
        </div>

        <div style={{ display: "flex", gap: 10 }}>
          <button type="submit" disabled={submitting} style={{ padding: "10px 18px", background: "#285d45", color: "white", borderRadius: 5, fontSize: 11, fontWeight: 600, border: "none", cursor: "pointer" }}>
            {submitting ? "Saving..." : isEdit ? "Update category" : "Create category"}
          </button>
          <button type="button" onClick={onCancel} disabled={submitting} style={{ padding: "10px 18px", background: "#e8f0ea", color: "#285d45", borderRadius: 5, fontSize: 11, fontWeight: 600, border: "none", cursor: "pointer" }}>
            Cancel
          </button>
        </div>
      </form>
    </>
  );
}
