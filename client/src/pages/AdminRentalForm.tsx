import { useState } from "react";
import { ArrowLeft } from "lucide-react";
import { createRentalDate, updateRentalDate, type RentalWithProduct } from "@/services/availability";
import type { ProductWithRelations } from "@/services/products";
import { toast } from "sonner";

interface Props {
  products: ProductWithRelations[];
  rental: RentalWithProduct | null;
  onClose: () => void;
}

export default function AdminRentalForm({ products, rental, onClose }: Props) {
  const [productId, setProductId] = useState(rental?.product_id ?? "");
  const [startDate, setStartDate] = useState(rental?.start_date ?? "");
  const [endDate, setEndDate] = useState(rental?.end_date ?? "");
  const [type, setType] = useState<string>(rental?.type ?? "rented");
  const [note, setNote] = useState(rental?.note ?? "");
  const [saving, setSaving] = useState(false);

  const isEdit = !!rental;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!productId || !startDate || !endDate) {
      toast.error("Please fill in all required fields");
      return;
    }
    if (endDate < startDate) {
      toast.error("End date must be on or after start date");
      return;
    }

    setSaving(true);
    try {
      if (isEdit) {
        await updateRentalDate(rental.id, { start_date: startDate, end_date: endDate, type, note: note || null });
        toast.success("Rental updated");
      } else {
        await createRentalDate({ product_id: productId, start_date: startDate, end_date: endDate, type, note: note || null });
        toast.success("Rental created");
      }
      onClose();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to save rental");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="admin-rental-form-page">
      <button className="back-link" onClick={onClose}><ArrowLeft size={16} /> Back to rentals</button>
      <h2>{isEdit ? "Edit rental period" : "Add rental period"}</h2>

      <form className="admin-rental-form" onSubmit={handleSubmit}>
        {!isEdit && (
          <div className="form-group">
            <label>Product</label>
            <select value={productId} onChange={e => setProductId(e.target.value)} required>
              <option value="">Select a product...</option>
              {products.map(p => (
                <option key={p.id} value={p.id}>{p.name} ({p.slug})</option>
              ))}
            </select>
          </div>
        )}

        <div className="form-row">
          <div className="form-group">
            <label>Start date</label>
            <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} required />
          </div>
          <div className="form-group">
            <label>End date</label>
            <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} min={startDate} required />
          </div>
        </div>

        <div className="form-group">
          <label>Type</label>
          <select value={type} onChange={e => setType(e.target.value)}>
            <option value="rented">Rented</option>
            <option value="maintenance">Maintenance</option>
            <option value="blocked">Blocked</option>
          </select>
        </div>

        <div className="form-group">
          <label>Note (optional)</label>
          <input type="text" value={note} onChange={e => setNote(e.target.value)} placeholder="e.g. Reserved for client name" maxLength={500} />
        </div>

        <div className="form-actions">
          <button type="button" className="editorial-button" onClick={onClose}>Cancel</button>
          <button type="submit" className="editorial-button editorial-button-dark" disabled={saving}>
            {saving ? "Saving..." : isEdit ? "Update rental" : "Add rental"}
          </button>
        </div>
      </form>
    </div>
  );
}
