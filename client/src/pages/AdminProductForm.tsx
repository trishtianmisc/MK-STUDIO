import { ArrowLeft, Check, Info, Sparkles, Upload, X } from "lucide-react";
import { FormEvent, useRef, useState, type ReactNode } from "react";
import { toast } from "sonner";
import { createProduct, updateProduct, type ProductWithRelations, type CreateProductInput } from "@/services/products";
import type { Category } from "@/services/categories";
import { supabase } from "@/lib/supabase";

interface Props { categories: Category[]; product?: ProductWithRelations; onDone: () => void; onCancel: () => void; }

export default function AdminProductForm({ categories, product, onDone, onCancel }: Props) {
  const isEdit = !!product;
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [name, setName] = useState(product?.name ?? "");
  const [slug, setSlug] = useState(product?.slug ?? "");
  const [categoryId, setCategoryId] = useState(product?.category_id ?? (categories[0]?.id ?? ""));
  const [rentalPrice, setRentalPrice] = useState(String(product?.rental_price ?? ""));
  const [additionalDayPrice, setAdditionalDayPrice] = useState(String(product?.additional_day_price ?? ""));
  const [style, setStyle] = useState(product?.style ?? "");
  const [length, setLength] = useState(product?.length ?? "");
  const [brand, setBrand] = useState(product?.brand ?? "");
  const [sizes, setSizes] = useState(product?.sizes?.join(", ") ?? "");
  const [rentalNote, setRentalNote] = useState(product?.rental_note ?? "");
  const [availability, setAvailability] = useState<"Available" | "Limited" | "Unavailable">(product?.availability ?? "Available");
  const [isFeatured, setIsFeatured] = useState(product?.is_featured ?? false);
  const [isPublic, setIsPublic] = useState(product?.is_public ?? true);
  const [sortOrder, setSortOrder] = useState(String(product?.sort_order ?? 0));

  const [imageUrl, setImageUrl] = useState(product?.image ?? "");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState(product?.image ?? "");
  const [uploadingImage, setUploadingImage] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const autoSlug = (v: string) => setSlug(v.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""));

  const validate = () => {
    const e: Record<string, string> = {};
    if (!name.trim()) e.name = "Product name is required";
    if (!slug.trim() || !/^[a-z0-9-]+$/.test(slug)) e.slug = "Use lowercase letters, numbers and hyphens";
    if (!categoryId) e.category = "Choose a category";
    if (!rentalPrice || Number(rentalPrice) < 0) e.rentalPrice = "Enter a valid price";
    setErrors(e);
    return !Object.keys(e).length;
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { toast.error("Image must be under 5 MB"); return; }
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) { toast.error("Image must be JPEG, PNG, or WebP"); return; }
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview("");
    setImageUrl("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const uploadImage = async (): Promise<string | null> => {
    if (!imageFile) return imageUrl || null;
    setUploadingImage(true);
    try {
      const fileName = `${Date.now()}-${imageFile.name.replace(/[^a-zA-Z0-9.-]/g, "_")}`;
      const storagePath = `products/${fileName}`;
      const arrayBuffer = await imageFile.arrayBuffer();
      const { error: uploadError } = await supabase.storage
        .from("product-images")
        .upload(storagePath, arrayBuffer, { contentType: imageFile.type, cacheControl: "31536000", upsert: false });
      if (uploadError) throw uploadError;
      const { data } = supabase.storage.from("product-images").getPublicUrl(storagePath);
      return data.publicUrl;
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    try {
      const finalImageUrl = await uploadImage();
      const input: CreateProductInput = {
        category_id: categoryId,
        name: name.trim(),
        slug: slug.trim(),
        rental_price: Number(rentalPrice),
        additional_day_price: additionalDayPrice !== "" ? Number(additionalDayPrice) : null,
        availability,
        is_featured: isFeatured,
        is_public: isPublic,
        sort_order: Number(sortOrder) || 0,
      };
      if (finalImageUrl) input.image = finalImageUrl;
      if (style.trim()) input.style = style.trim();
      if (length.trim()) input.length = length.trim();
      if (brand.trim()) input.brand = brand.trim();
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

  const field = (label: string, content: ReactNode, error?: string, hint?: string) => (
    <label className="admin-form-field">
      <span>{label}</span>
      {content}
      {hint && <small>{hint}</small>}
      {error && <em>{error}</em>}
    </label>
  );

  return (
    <div className="admin-editor">
      <div className="admin-editor-head">
        <button className="admin-back-link" onClick={onCancel}><ArrowLeft size={15} /> Back to products</button>
        <div>
          <span className="admin-section-kicker">Catalogue editor</span>
          <h2>{isEdit ? "Edit product" : "Add a new product"}</h2>
          <p>{isEdit ? "Refine the details and presentation of this piece." : "Bring a new piece into the MK Studio collection."}</p>
        </div>
        <span className="admin-editor-badge"><Sparkles size={14} /> {isEdit ? "Editing" : "Draft"}</span>
      </div>
      <form onSubmit={handleSubmit} className="admin-form-layout">
        <div className="admin-form-main">
          <section className="admin-form-card">
            <div className="admin-form-card-head"><div><span>01</span><h3>Product image</h3></div><p>Upload a cover photo for this piece.</p></div>
            <div style={{ padding: "16px 20px" }}>
              <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/webp" style={{ display: "none" }} onChange={handleImageSelect} />
              {imagePreview ? (
                <div style={{ position: "relative", display: "inline-block" }}>
                  <img src={imagePreview} alt="Preview" style={{ width: 180, height: 220, objectFit: "cover", border: "1px solid #dfe1dc", display: "block" }} />
                  <button type="button" onClick={removeImage} style={{ position: "absolute", top: 6, right: 6, width: 24, height: 24, display: "grid", placeItems: "center", background: "rgba(0,0,0,.55)", color: "#fff", border: "none", cursor: "pointer", borderRadius: 3 }}><X size={14} /></button>
                  {uploadingImage && <div style={{ position: "absolute", inset: 0, display: "grid", placeItems: "center", background: "rgba(255,255,255,.7)", fontSize: 11, color: "#555" }}>Uploading...</div>}
                </div>
              ) : (
                <button type="button" onClick={() => fileInputRef.current?.click()} style={{ width: 180, height: 220, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 8, border: "2px dashed #dfe1dc", background: "#faf8f5", color: "#8c7669", cursor: "pointer", fontSize: 11, fontWeight: 600 }}>
                  <Upload size={20} />
                  Upload image
                </button>
              )}
              <p style={{ margin: "8px 0 0", fontSize: 10, color: "#8c7669" }}>JPEG, PNG, or WebP. Max 5 MB.</p>
            </div>
          </section>
          <section className="admin-form-card">
            <div className="admin-form-card-head"><div><span>02</span><h3>Product identity</h3></div><p>Give this piece a clear, memorable home in the catalogue.</p></div>
            {field("Product name *", <input value={name} onChange={e => { setName(e.target.value); if (!isEdit) autoSlug(e.target.value); }} placeholder="The Velvet Evening Slip" />, errors.name)}
            {field("URL slug *", <input value={slug} onChange={e => setSlug(e.target.value)} placeholder="velvet-evening-slip" />, errors.slug, "Used for the product page URL")}
            {field("Category *", <select value={categoryId} onChange={e => setCategoryId(e.target.value)}><option value="">Select a category</option>{categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}</select>, errors.category)}
            <div className="admin-form-grid">
              {field("Rental price (PHP) *", <div className="admin-input-prefix"><span>₱</span><input type="number" min="0" value={rentalPrice} onChange={e => setRentalPrice(e.target.value)} placeholder="1,800" /></div>, errors.rentalPrice)}
              {field("Additional day (PHP)", <div className="admin-input-prefix"><span>₱</span><input type="number" min="0" value={additionalDayPrice} onChange={e => setAdditionalDayPrice(e.target.value)} placeholder="500" /></div>, undefined, "Extra cost per day beyond 3 days")}
              {field("Sort order", <input type="number" min="0" value={sortOrder} onChange={e => setSortOrder(e.target.value)} placeholder="0" />, undefined, "Lower numbers appear first")}
            </div>
          </section>
          <section className="admin-form-card">
            <div className="admin-form-card-head"><div><span>03</span><h3>Details</h3></div><p>Add style, length and other details for this piece.</p></div>
            <div className="admin-form-grid">
              {field("Style", <input value={style} onChange={e => setStyle(e.target.value)} placeholder="Structured, Textured, Lace..." />)}
              {field("Length", <input value={length} onChange={e => setLength(e.target.value)} placeholder="Mini, Midi, Maxi, Gown" />)}
            </div>
            {field("Brand", <input value={brand} onChange={e => setBrand(e.target.value)} placeholder="Zara, H&M, Curated by MK Studio..." />)}
            {field("Available sizes", <input value={sizes} onChange={e => setSizes(e.target.value)} placeholder="S/M, UK 8, UK 10" />, undefined, "Separate sizes with commas")}
          </section>
        </div>
        <aside className="admin-form-aside">
          <div className="admin-form-card admin-publish-card">
            <div className="admin-form-card-head"><div><span>04</span><h3>Publish settings</h3></div></div>
            <label className="admin-toggle-row"><span><strong>Public listing</strong><small>Visible on the storefront</small></span><input type="checkbox" checked={isPublic} onChange={e => setIsPublic(e.target.checked)} /><i /></label>
            <label className="admin-toggle-row"><span><strong>Featured piece</strong><small>Highlight on the homepage</small></span><input type="checkbox" checked={isFeatured} onChange={e => setIsFeatured(e.target.checked)} /><i /></label>
            {field("Availability", <select value={availability} onChange={e => setAvailability(e.target.value as typeof availability)}><option>Available</option><option>Limited</option><option>Unavailable</option></select>)}
            {field("Rental note", <input value={rentalNote} onChange={e => setRentalNote(e.target.value)} placeholder="3-day rental · Care included" />)}
          </div>
          <div className="admin-form-actions">
            <button type="submit" className="admin-primary-button" disabled={submitting || uploadingImage}>
              <Check size={16} /> {submitting ? "Saving…" : isEdit ? "Save changes" : "Create product"}
            </button>
            <button type="button" className="admin-secondary-button" onClick={onCancel} disabled={submitting}>Cancel</button>
          </div>
        </aside>
      </form>
    </div>
  );
}
