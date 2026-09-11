-- =============================================================================
-- MK Studio — Rental Availability Calendar
-- =============================================================================
-- Creates the rental_dates table for date-range availability tracking.
-- Drops the old unavailable_days integer array from products.

CREATE TABLE rental_dates (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id  UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  start_date  DATE NOT NULL,
  end_date    DATE NOT NULL,
  type        TEXT NOT NULL DEFAULT 'rented'
                CHECK (type IN ('rented', 'maintenance', 'blocked')),
  note        TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  CHECK (end_date >= start_date)
);

COMMENT ON TABLE rental_dates IS 'Date ranges when a product is rented, under maintenance, or blocked';
COMMENT ON COLUMN rental_dates.type IS 'rented = booked by a customer, maintenance = care/cleaning, blocked = admin hold';
COMMENT ON COLUMN rental_dates.start_date IS 'Range start (inclusive)';
COMMENT ON COLUMN rental_dates.end_date IS 'Range end (inclusive)';

CREATE INDEX idx_rental_dates_product_id ON rental_dates (product_id);
CREATE INDEX idx_rental_dates_dates ON rental_dates (start_date, end_date);

-- Drop the old unavailable_days column
ALTER TABLE products DROP COLUMN IF EXISTS unavailable_days;
