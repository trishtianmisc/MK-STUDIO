import { ArrowLeft, Trash2, Plus, Calendar } from "lucide-react";
import { useEffect, useState, useMemo } from "react";
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

const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

export default function AdminAvailabilityModal({ product, onDone, onCancel }: Props) {
  const { dates, loading, refresh } = useAvailability(product.slug);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [type, setType] = useState<"rented" | "maintenance" | "blocked">("rented");
  const [note, setNote] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [calMonth, setCalMonth] = useState(() => new Date().getMonth());
  const [calYear, setCalYear] = useState(() => new Date().getFullYear());

  const today = new Date().toISOString().split("T")[0];

  const calDays = useMemo(() => {
    const firstDay = new Date(calYear, calMonth, 1);
    const lastDay = new Date(calYear, calMonth + 1, 0);
    const startOffset = (firstDay.getDay() + 6) % 7;
    const daysInMonth = lastDay.getDate();
    const cells: { day: number; date: string; types: string[] }[] = [];
    for (let i = 0; i < startOffset; i++) cells.push({ day: 0, date: "", types: [] });
    for (let d = 1; d <= daysInMonth; d++) {
      const dateStr = `${calYear}-${String(calMonth + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
      const dayTypes = dates.filter(r => r.start_date <= dateStr && r.end_date >= dateStr).map(r => r.type);
      cells.push({ day: d, date: dateStr, types: dayTypes });
    }
    return cells;
  }, [calMonth, calYear, dates]);

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

      <div className="admin-availability-layout">
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

        <section className="admin-form-card admin-calendar-mini">
          <div className="admin-calendar-header">
            <button onClick={() => { if (calMonth === 0) { setCalMonth(11); setCalYear(y => y - 1); } else setCalMonth(m => m - 1); }}><ArrowLeft size={14} /></button>
            <strong>{MONTHS[calMonth]} {calYear}</strong>
            <button onClick={() => { if (calMonth === 11) { setCalMonth(0); setCalYear(y => y + 1); } else setCalMonth(m => m + 1); }}><ArrowLeft size={14} style={{ transform: "rotate(180deg)" }} /></button>
          </div>
          <div className="admin-calendar-weekdays">
            {WEEKDAYS.map(d => <span key={d}>{d}</span>)}
          </div>
          <div className="admin-calendar-grid">
            {calDays.map((cell, i) => (
              <div key={i} className={`admin-calendar-cell ${cell.date === today ? "is-today" : ""} ${cell.types.length > 0 ? "has-rentals" : ""}`}>
                {cell.day > 0 && <span className="admin-calendar-day">{cell.day}</span>}
                {cell.types.length > 0 && (
                  <div className="admin-calendar-dots">
                    {cell.types.slice(0, 2).map((t, j) => (
                      <span key={j} className={`admin-calendar-dot type-${t}`} />
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
          <div className="admin-calendar-legend">
            <span><i className="type-rented" /> Rented</span>
            <span><i className="type-maintenance" /> Maintenance</span>
            <span><i className="type-blocked" /> Blocked</span>
          </div>
        </section>
      </div>

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
  );
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}
