import { ArrowLeft } from "lucide-react";
import { FormEvent, useState } from "react";
import { toast } from "sonner";
import { createProduct, updateProduct, type ProductWithRelations, type CreateProductInput } from "@/services/products";
import type { Category } from "@/services/categories";

interface Props {
  categories: Category[];
  product?: ProductWithRelations;
  onDone: () => void;
  onCancel: () => void;
}

export default function AdminProductForm({ categories, product, onDone, onCancel }: Props) {
  const isEdit = !!product;
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [name, setName] = useState(product?.name ?? "");
  const [slug, setSlug] = useState(product?.slug ?? "");
  const [categoryId, setCategoryId] = useState(product?.category_id ?? (categories[0]?.id ?? ""));
  const [rentalPrice, setRentalPrice] = useState(String(product?.rental_price ?? ""));
  const [description, setDescription] = useState(product?.description ?? "");
  const [details, setDetails] = useState(product?.details ?? "");
  const [sizing, setSizing] = useState(product?.sizing ?? "");
  const [fabric, setFabric] = useState(product?.fabric ?? "");
  const [color, setColor] = useState(product?.color ?? "");
  const [sizes, setSizes] = useState(product?.sizes?.join(", ") ?? "");
  const [rentalNote, setRentalNote] = useState(product?.rental_note ?? "");
  const [availability, setAvailability] = useState<"Available" | "Limited" | "Unavailable">(product?.availability ?? "Available");
  const [isFeatured, setIsFeatured] = useState(product?.is_featured ?? false);
  const [isPublic, setIsPublic] = useState(product?.is_public ?? true);
  const [sortOrder, setSortOrder] = useState(String(product?.sort_order ?? 0));

  const validate = (): boolean => {
    const e: Record<string, string> = {};
    if (!name.trim()) e.name = "Name is required";
    if (!slug.trim()) e.slug = "Slug is required";
    if (!/^[a-z0-9-]+$/.test(slug)) e.slug = "Slug must be lowercase letters, numbers, and hyphens";
    if (!categoryId) e.category = "Category is required";
    if (!rentalPrice || Number(rentalPrice) < 0) e.rentalPrice = "Valid price is required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    try {
      const input: CreateProductInput = {
        category_id: categoryId,
        name: name.trim(),
        slug: slug.trim(),
        rental_price: Number(rentalPrice),
        availability,
        is_featured: isFeatured,
        is_public: isPublic,
        sort_order: Number(sortOrder) || 0,
      };
      if (description.trim()) input.description = description.trim();
      if (details.trim()) input.details = details.trim();
      if (sizing.trim()) input.sizing = sizing.trim();
      if (fabric.trim()) input.fabric = fabric.trim();
      if (color.trim()) input.color = color.trim();
      if (sizes.trim()) input.sizes = sizes.split(",").map(s => s.trim()).filter(Boolean);
      if (rentalNote.trim()) input.rental_note = rentalNote.trim();

      if (isEdit && product) {
        await updateProduct(product.id, input);
        toast.success("Product updated");
      } else {
        await createProduct(input);
        toast.success("Product created");
      }
      onDone();
    } catch (err: any) {
      toast.error(err.message || "Failed to save product");
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
            <ArrowLeft size={14} /> Back to products
          </button>
          <p>{isEdit ? "Edit product" : "New product"}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} style={{ background: "#fff", border: "1px solid #dfe1dc", borderRadius: 6, padding: "24px 28px", maxWidth: 600 }}>
        <div style={fieldStyle}>
          <label style={labelStyle}>Name *</label>
          <input style={inputStyle} value={name} onChange={e => { setName(e.target.value); if (!isEdit) autoSlug(e.target.value); }} placeholder="The Velvet Evening Slip" />
          {errors.name && <p style={errorStyle}>{errors.name}</p>}
        </div>

        <div style={fieldStyle}>
          <label style={labelStyle}>Slug *</label>
          <input style={inputStyle} value={slug} onChange={e => setSlug(e.target.value)} placeholder="velvet-evening-slip" />
          {errors.slug && <p style={errorStyle}>{errors.slug}</p>}
        </div>

        <div style={fieldStyle}>
          <label style={labelStyle}>Category *</label>
          <select style={inputStyle} value={categoryId} onChange={e => setCategoryId(e.target.value)}>
            <option value="">Select category</option>
            {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          {errors.category && <p style={errorStyle}>{errors.category}</p>}
        </div>

        <div style={fieldStyle}>
          <label style={labelStyle}>Rental price (PHP) *</label>
          <input style={inputStyle} type="number" min="0" value={rentalPrice} onChange={e => setRentalPrice(e.target.value)} placeholder="1800" />
          {errors.rentalPrice && <p style={errorStyle}>{errors.rentalPrice}</p>}
        </div>

        <div style={fieldStyle}>
          <label style={labelStyle}>Description</label>
          <textarea style={{ ...inputStyle, minHeight: 60 }} value={description} onChange={e => setDescription(e.target.value)} />
        </div>

        <div style={fieldStyle}>
          <label style={labelStyle}>Details</label>
          <textarea style={{ ...inputStyle, minHeight: 60 }} value={details} onChange={e => setDetails(e.target.value)} />
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
          <div style={fieldStyle}>
            <label style={labelStyle}>Fabric</label>
            <input style={inputStyle} value={fabric} onChange={e => setFabric(e.target.value)} placeholder="Silk velvet" />
          </div>
          <div style={fieldStyle}>
            <label style={labelStyle}>Color</label>
            <input style={inputStyle} value={color} onChange={e => setColor(e.target.value)} placeholder="Burgundy" />
          </div>
        </div>

        <div style={fieldStyle}>
          <label style={labelStyle}>Sizing</label>
          <input style={inputStyle} value={sizing} onChange={e => setSizing(e.target.value)} placeholder="Fits UK 6-12; true to size." />
        </div>

        <div style={fieldStyle}>
          <label style={labelStyle}>Sizes (comma separated)</label>
          <input style={inputStyle} value={sizes} onChange={e => setSizes(e.target.value)} placeholder="UK 6, UK 8, UK 10, UK 12" />
        </div>

        <div style={fieldStyle}>
          <label style={labelStyle}>Rental note</label>
          <input style={inputStyle} value={rentalNote} onChange={e => setRentalNote(e.target.value)} placeholder="3-day rental · Professional care included" />
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
          <div style={fieldStyle}>
            <label style={labelStyle}>Availability</label>
            <select style={inputStyle} value={availability} onChange={e => setAvailability(e.target.value as any)}>
              <option value="Available">Available</option>
              <option value="Limited">Limited</option>
              <option value="Unavailable">Unavailable</option>
            </select>
          </div>
          <div style={fieldStyle}>
            <label style={labelStyle}>Sort order</label>
            <input style={inputStyle} type="number" min="0" value={sortOrder} onChange={e => setSortOrder(e.target.value)} />
          </div>
        </div>

        <div style={{ display: "flex", gap: 24, marginBottom: 18 }}>
          <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12, color: "#4f5c53", cursor: "pointer" }}>
            <input type="checkbox" checked={isFeatured} onChange={e => setIsFeatured(e.target.checked)} /> Featured on homepage
          </label>
          <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12, color: "#4f5c53", cursor: "pointer" }}>
            <input type="checkbox" checked={isPublic} onChange={e => setIsPublic(e.target.checked)} /> Public
          </label>
        </div>

        <div style={{ display: "flex", gap: 10 }}>
          <button type="submit" disabled={submitting} style={{ padding: "10px 18px", background: "#285d45", color: "white", borderRadius: 5, fontSize: 11, fontWeight: 600, border: "none", cursor: "pointer" }}>
            {submitting ? "Saving..." : isEdit ? "Update product" : "Create product"}
          </button>
          <button type="button" onClick={onCancel} disabled={submitting} style={{ padding: "10px 18px", background: "#e8f0ea", color: "#285d45", borderRadius: 5, fontSize: 11, fontWeight: 600, border: "none", cursor: "pointer" }}>
            Cancel
          </button>
        </div>
      </form>
    </>
  );
}
