import { ArrowLeft, Trash2, Plus, Calendar } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useAvailability } from "@/hooks/useAvailability";
import { createRentalDate, deleteRentalDate, type RentalDate } from "@/services/availability";
import type { ProductWithRelations } from "@/services/products";

interface Props {
  product: ProductWithRelations;
  onDone: () => void;
  onCancel: () => void;
}

const TYPE_LABELS: Record<string, string> = {
  rented: "Rented",
  maintenance: "Maintenance",
  blocked: "Blocked",
};

const TYPE_COLORS: Record<string, string> = {
  rented: "#7b1633",
  maintenance: "#a66a17",
  blocked: "#705a4d",
};

export default function AdminAvailabilityModal({ product, onDone, onCancel }: Props) {
  const { dates, loading, refresh } = useAvailability(product.slug);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [type, setType] = useState<"rented" | "maintenance" | "blocked">("rented");
  const [note, setNote] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!startDate || !endDate) {
      toast.error("Please select start and end dates");
      return;
    }
    if (new Date(endDate) < new Date(startDate)) {
      toast.error("End date must be on or after start date");
      return;
    }

    setSubmitting(true);
    try {
      await createRentalDate({
        product_id: product.id,
        start_date: startDate,
        end_date: endDate,
        type,
        note: note.trim() || null,
      });
      toast.success(`${TYPE_LABELS[type]} period added`);
      setStartDate("");
      setEndDate("");
      setNote("");
      refresh();
    } catch (err: any) {
      toast.error(err.message || "Failed to add period");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    setDeleting(id);
    try {
      await deleteRentalDate(id);
      toast.success("Period removed");
      refresh();
    } catch (err: any) {
      toast.error(err.message || "Failed to remove period");
    } finally {
      setDeleting(null);
    }
  };

  return (
    <div className="admin-editor">
      <div className="admin-editor-head">
        <button className="admin-back-link" onClick={onCancel}><ArrowLeft size={15} /> Back to products</button>
        <div>
          <span className="admin-section-kicker">Availability</span>
          <h2>Manage calendar</h2>
          <p>{product.name}</p>
        </div>
      </div>

      <div className="admin-availability-panel">
        <section className="admin-form-card">
          <div className="admin-form-card-head">
            <div><span><Calendar size={14} /></span><h3>Add availability period</h3></div>
            <p>Mark dates when this product is rented, under maintenance, or blocked.</p>
          </div>

          <div className="admin-form-grid">
            <label className="admin-form-field">
              <span>Start date *</span>
              <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} />
            </label>
            <label className="admin-form-field">
              <span>End date *</span>
              <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} min={startDate} />
            </label>
          </div>

          <label className="admin-form-field">
            <span>Type</span>
            <select value={type} onChange={e => setType(e.target.value as typeof type)}>
              <option value="rented">Rented</option>
              <option value="maintenance">Maintenance</option>
              <option value="blocked">Blocked</option>
            </select>
          </label>

          <label className="admin-form-field">
            <span>Note (optional)</span>
            <input value={note} onChange={e => setNote(e.target.value)} placeholder="Booked for wedding" />
          </label>

          <button className="admin-primary-button" onClick={handleSubmit} disabled={submitting || !startDate || !endDate}>
            <Plus size={15} /> {submitting ? "Adding..." : "Add period"}
          </button>
        </section>

        <section className="admin-form-card">
          <div className="admin-form-card-head">
            <div><span><Calendar size={14} /></span><h3>Scheduled periods</h3></div>
            <p>{dates.length} period{dates.length !== 1 ? "s" : ""} configured</p>
          </div>

          {loading ? (
            <p style={{ color: "#8a928c", fontSize: 12 }}>Loading...</p>
          ) : dates.length === 0 ? (
            <p style={{ color: "#8a928c", fontSize: 12 }}>No periods scheduled. All dates are available.</p>
          ) : (
            <div className="admin-rental-dates-list">
              {dates.map((d) => (
                <div key={d.id} className="admin-rental-date-row">
                  <span className="admin-rental-date-type" style={{ color: TYPE_COLORS[d.type] }}>
                    {TYPE_LABELS[d.type]}
                  </span>
                  <span className="admin-rental-date-range">
                    {formatDate(d.start_date)} — {formatDate(d.end_date)}
                  </span>
                  {d.note && <span className="admin-rental-date-note">{d.note}</span>}
                  <button
                    className="admin-rental-date-delete"
                    onClick={() => handleDelete(d.id)}
                    disabled={deleting === d.id}
                    title="Remove period"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}
