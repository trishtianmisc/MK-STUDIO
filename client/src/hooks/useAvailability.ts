import { useCallback, useEffect, useState } from "react";
import { getProductAvailability, type RentalDate } from "@/services/availability";

export function useAvailability(slug: string | null) {
  const [dates, setDates] = useState<RentalDate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!slug) {
      setDates([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const data = await getProductAvailability(slug);
      setDates(data);
    } catch (err: any) {
      setError(err.message || "Failed to load availability");
    } finally {
      setLoading(false);
    }
  }, [slug]);

  useEffect(() => {
    let cancelled = false;
    refresh().then(() => {});
    return () => { cancelled = true; };
  }, [refresh]);

  return { dates, loading, error, refresh };
}
