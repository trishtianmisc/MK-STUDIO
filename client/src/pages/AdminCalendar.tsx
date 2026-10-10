import { useEffect, useMemo, useState } from "react";
import { addDays, format, parseISO } from "date-fns";
import { ChevronLeft, ChevronRight, CalendarDays } from "lucide-react";
import { getAllRentals, type RentalWithProduct } from "@/services/availability";
import { getAdminProducts, type ProductWithRelations } from "@/services/products";
import AdminRentalForm from "./AdminRentalForm";

const TYPE_LABELS: Record<string, string> = {
  rented: "Rented",
  maintenance: "Maintenance",
  blocked: "Blocked",
};

const TYPE_ORDER = ["rented", "maintenance", "blocked"] as const;

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

interface DayCell {
  day: number;
  date: string;
  col: number;
  weekend: boolean;
}

export default function AdminCalendar() {
  const [rentals, setRentals] = useState<RentalWithProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState<ProductWithRelations[]>([]);
  const [editingRental, setEditingRental] = useState<RentalWithProduct | null>(null);
  const [viewDate, setViewDate] = useState(() => new Date());
  const [hoveredDate, setHoveredDate] = useState<string | null>(null);
  const [filterType, setFilterType] = useState<string>("rented");

  const refresh = () => {
    setLoading(true);
    getAllRentals()
      .then(r => setRentals(r))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { refresh(); }, []);

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const todayStr = format(new Date(), "yyyy-MM-dd");

  const cells = useMemo<DayCell[]>(() => {
    const offset = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const list: DayCell[] = [];
    for (let d = 1; d <= daysInMonth; d++) {
      const date = `${year}-${String(month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
      const weekday = new Date(year, month, d).getDay();
      list.push({ day: d, date, col: (offset + d - 1) % 7, weekend: weekday === 0 || weekday === 6 });
    }
    return list;
  }, [year, month]);

  const filteredRentals = useMemo(
    () => rentals.filter(r => r.type === filterType),
    [rentals, filterType]
  );

  const dayRentals = useMemo(() => {
    const map = new Map<string, RentalWithProduct[]>();
    if (cells.length === 0) return map;
    const monthStart = cells[0].date;
    const monthEnd = cells[cells.length - 1].date;
    for (const r of filteredRentals) {
      if (r.start_date > monthEnd || r.end_date < monthStart) continue;
      let cur = parseISO(r.start_date > monthStart ? r.start_date : monthStart);
      const last = parseISO(r.end_date < monthEnd ? r.end_date : monthEnd);
      while (cur <= last) {
        const key = format(cur, "yyyy-MM-dd");
        const list = map.get(key) ?? [];
        list.push(r);
        map.set(key, list);
        cur = addDays(cur, 1);
      }
    }
    return map;
  }, [filteredRentals, cells]);

  const monthRentals = useMemo(() => {
    if (cells.length === 0) return [];
    const monthStart = cells[0].date;
    const monthEnd = cells[cells.length - 1].date;
    return filteredRentals.filter(r => r.start_date <= monthEnd && r.end_date >= monthStart);
  }, [filteredRentals, cells]);

  const productCount = new Set(monthRentals.map(r => r.product_id)).size;

  const shiftMonth = (delta: number) => {
    setViewDate(d => new Date(d.getFullYear(), d.getMonth() + delta, 1));
    setHoveredDate(null);
  };

  const goToday = () => {
    setViewDate(new Date());
    setHoveredDate(null);
  };

  const handleEdit = async (rental: RentalWithProduct) => {
    if (products.length === 0) {
      try {
        const p = await getAdminProducts();
        setProducts(p);
      } catch {
        return;
      }
    }
    setEditingRental(rental);
  };

  const handleFormClose = () => {
    setEditingRental(null);
    refresh();
  };

  if (editingRental) {
    return <AdminRentalForm products={products} rental={editingRental} onClose={handleFormClose} />;
  }

  return (
    <div className="admin-calendar-page">
      <div className="admin-calendar-toolbar">
        <div className="admin-calendar-nav">
          <button onClick={() => shiftMonth(-1)} title="Previous month"><ChevronLeft size={14} /></button>
          <strong>{format(viewDate, "MMMM yyyy")}</strong>
          <button onClick={() => shiftMonth(1)} title="Next month"><ChevronRight size={14} /></button>
          <button className="admin-calendar-today-btn" onClick={goToday}>Today</button>
        </div>
        <div className="admin-rentals-filters">
          <select value={filterType} onChange={e => { setFilterType(e.target.value); setHoveredDate(null); }}>
            <option value="rented">Rented</option>
            <option value="maintenance">Maintenance</option>
            <option value="blocked">Blocked</option>
          </select>
        </div>
        <p className="admin-calendar-summary">
          <CalendarDays size={13} />
          {monthRentals.length} rental{monthRentals.length !== 1 ? "s" : ""} across {productCount} product{productCount !== 1 ? "s" : ""}
        </p>
        <div className="admin-calendar-legend">
          <span><i className="type-rented" /> Rented</span>
          <span><i className="type-maintenance" /> Maintenance</span>
          <span><i className="type-blocked" /> Blocked</span>
        </div>
      </div>

      <section className="admin-form-card admin-calendar-card">
        {loading ? (
          <p className="admin-calendar-empty">Loading...</p>
        ) : (
          <div className="admin-mg">
            <div className="admin-mg-weekdays">
              {WEEKDAYS.map(d => <span key={d}>{d}</span>)}
            </div>
            <div className="admin-mg-grid">
              {Array.from({ length: new Date(year, month, 1).getDay() }, (_, i) => (
                <div key={`pad-${i}`} className="admin-mg-cell is-blank" />
              ))}
              {cells.map(cell => {
                const dayList = dayRentals.get(cell.date) ?? [];
                const counts = { rented: 0, maintenance: 0, blocked: 0 };
                for (const r of dayList) counts[r.type as keyof typeof counts]++;
                const bgType = TYPE_ORDER.find(t => counts[t] > 0);
                const isOpen = hoveredDate === cell.date && dayList.length > 0;
                return (
                  <div
                    key={cell.date}
                    className={[
                      "admin-mg-cell",
                      cell.date === todayStr ? "is-today" : "",
                      bgType ? `bg-${bgType}` : "",
                      isOpen ? "is-open" : "",
                    ].filter(Boolean).join(" ")}
                    onMouseEnter={() => setHoveredDate(cell.date)}
                    onMouseLeave={() => setHoveredDate(prev => (prev === cell.date ? null : prev))}
                  >
                    <span className="admin-mg-day">{cell.day}</span>
                    {dayList.length > 0 && (
                      <div className="admin-mg-counts">
                        {TYPE_ORDER.filter(t => counts[t] > 0).map(t => (
                          <span key={t} className="admin-mg-count" title={`${counts[t]} ${TYPE_LABELS[t]}`}>
                            {counts[t]} Item{counts[t] !== 1 ? "s" : ""}
                          </span>
                        ))}
                      </div>
                    )}
                    {isOpen && (
                      <div className={`admin-mg-pop ${cell.col >= 4 ? "align-right" : ""}`}>
                        <p className="admin-mg-pop-head">
                          {format(parseISO(cell.date), "d MMM yyyy")} · {dayList.length} item{dayList.length !== 1 ? "s" : ""}
                        </p>
                        {dayList.map(r => (
                          <button
                            key={r.id}
                            className="admin-mg-pop-row"
                            onClick={() => handleEdit(r)}
                            title="Edit rental"
                          >
                            {r.product_image && <img src={r.product_image} alt={r.product_name} />}
                            <div>
                              <strong>{r.product_name}</strong>
                              <span className={`admin-mg-pop-type type-${r.type}`}>
                                {TYPE_LABELS[r.type]} · {format(parseISO(r.start_date), "d MMM")} – {format(parseISO(r.end_date), "d MMM")}
                              </span>
                              {r.note && <em>{r.note}</em>}
                            </div>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
            {monthRentals.length === 0 && (
              <p className="admin-calendar-empty">No rentals scheduled for {format(viewDate, "MMMM yyyy")}.</p>
            )}
          </div>
        )}
      </section>
    </div>
  );
}
