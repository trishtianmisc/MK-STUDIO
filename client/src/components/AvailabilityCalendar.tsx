import { ChevronLeft, ChevronRight } from "lucide-react";
import { useState, useMemo } from "react";
import { useAvailability } from "@/hooks/useAvailability";
import type { RentalDate } from "@/services/availability";

function isDateInRange(date: Date, start: string, end: string): boolean {
  const d = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const s = new Date(start + "T00:00:00");
  const e = new Date(end + "T00:00:00");
  return d >= s && d <= e;
}

function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfWeek(year: number, month: number): number {
  return new Date(year, month, 1).getDay();
}

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

interface Props {
  slug: string;
}

export default function AvailabilityCalendar({ slug }: Props) {
  const { dates, loading } = useAvailability(slug);
  const today = new Date();
  const [month, setMonth] = useState(today.getMonth());
  const [year, setYear] = useState(today.getFullYear());

  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfWeek(year, month);

  const dateTypeMap = useMemo(() => {
    const map = new Map<number, "rented" | "maintenance" | "blocked">();
    for (const d of dates) {
      for (let day = 1; day <= daysInMonth; day++) {
        const date = new Date(year, month, day);
        if (isDateInRange(date, d.start_date, d.end_date)) {
          if (!map.has(day) || d.type === "rented") {
            map.set(day, d.type);
          }
        }
      }
    }
    return map;
  }, [dates, year, month, daysInMonth]);

  const prevMonth = () => {
    if (month === 0) { setMonth(11); setYear(year - 1); }
    else { setMonth(month - 1); }
  };

  const nextMonth = () => {
    if (month === 11) { setMonth(0); setYear(year + 1); }
    else { setMonth(month + 1); }
  };

  const todayDate = today.getDate();
  const isCurrentMonth = today.getMonth() === month && today.getFullYear() === year;

  return (
    <div className="availability-calendar">
      <div className="availability-calendar-header">
        <button onClick={prevMonth} aria-label="Previous month"><ChevronLeft size={16} /></button>
        <strong>{MONTH_NAMES[month]} {year}</strong>
        <button onClick={nextMonth} aria-label="Next month"><ChevronRight size={16} /></button>
      </div>

      {loading ? (
        <p className="availability-loading">Loading calendar...</p>
      ) : (
        <>
          <div className="availability-calendar-grid">
            {DAY_NAMES.map((d) => (
              <span key={d} className="availability-calendar-weekday">{d}</span>
            ))}
            {Array.from({ length: firstDay }).map((_, i) => (
              <span key={`empty-${i}`} className="availability-calendar-day availability-calendar-empty" />
            ))}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1;
              const type = dateTypeMap.get(day);
              const isToday = isCurrentMonth && day === todayDate;
              const className = [
                "availability-calendar-day",
                type ? `is-${type}` : "",
                isToday ? "is-today" : "",
              ].filter(Boolean).join(" ");

              return (
                <span key={day} className={className} title={type ? `${type} — not available` : undefined}>
                  {day}
                </span>
              );
            })}
          </div>

          <div className="availability-calendar-legend">
            <span><i className="is-available" /> Available</span>
            <span><i className="is-rented" /> Rented</span>
            <span><i className="is-maintenance" /> Maintenance</span>
          </div>
        </>
      )}
    </div>
  );
}
